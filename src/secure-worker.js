import baseWorker from './rpp-worker.js';

const enc = new TextEncoder();
let guardReady;

function json(data,status=200,headers={}){
  return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
}
function cookieMap(request){
  const out={};
  for(const p of (request.headers.get('cookie')||'').split(';')){
    const i=p.indexOf('=');
    if(i>0)out[p.slice(0,i).trim()]=decodeURIComponent(p.slice(i+1).trim());
  }
  return out;
}
async function sha256(v){
  const b=await crypto.subtle.digest('SHA-256',enc.encode(String(v)));
  return Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');
}
function randomHex(bytes=32){
  const b=new Uint8Array(bytes);crypto.getRandomValues(b);
  return Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');
}
function sessionCookie(name,token,maxAge){return `${name}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`}
function clearCookie(name){return `${name}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`}

async function ensureGuardSchema(env){
  if(!guardReady){
    guardReady=env.DB.exec(`
      CREATE TABLE IF NOT EXISTS rpp_sessions(
        token_hash TEXT PRIMARY KEY,
        kind TEXT NOT NULL,
        subject TEXT,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS rpp_settings(key TEXT PRIMARY KEY,value TEXT);
      INSERT OR IGNORE INTO rpp_settings(key,value) VALUES('site_mode','preview');
      INSERT OR IGNORE INTO rpp_settings(key,value) VALUES('admin_password_hash','');
      INSERT OR IGNORE INTO rpp_settings(key,value) VALUES('admin_password_salt','');
      INSERT OR IGNORE INTO rpp_settings(key,value) VALUES('preview_submissions','false');
      INSERT OR IGNORE INTO rpp_settings(key,value) VALUES('admin_guard_v1','0');
    `).then(async()=>{
      const marker=await env.DB.prepare("SELECT value FROM rpp_settings WHERE key='admin_guard_v1'").first();
      if(String(marker?.value||'0')!=='1'){
        await env.DB.prepare("DELETE FROM rpp_sessions WHERE kind='admin' OR kind='admin_full'").run();
        await env.DB.prepare("INSERT INTO rpp_settings(key,value) VALUES('admin_guard_v1','1') ON CONFLICT(key) DO UPDATE SET value='1'").run();
      }
    });
  }
  return guardReady;
}
async function settingMap(env){
  await ensureGuardSchema(env);
  const rows=(await env.DB.prepare('SELECT key,value FROM rpp_settings').all()).results||[];
  const out={};for(const r of rows)out[r.key]=r.value??'';return out;
}
function isPreview(s){return (s.site_mode||'preview')!=='production'}
function previewWritesAllowed(env,s){return String(env.ALLOW_PREVIEW_SUBMISSIONS||s.preview_submissions||'false').toLowerCase()==='true'}
async function validSession(env,request,kind,cookieName){
  await ensureGuardSchema(env);
  const token=cookieMap(request)[cookieName];if(!token)return null;
  return env.DB.prepare('SELECT * FROM rpp_sessions WHERE token_hash=? AND kind=? AND expires_at>?').bind(await sha256(token),kind,new Date().toISOString()).first();
}
async function createFullAdminSession(env){
  const token=randomHex(32),hash=await sha256(token),now=Date.now(),expires=new Date(now+12*60*60*1000).toISOString();
  await env.DB.prepare('INSERT INTO rpp_sessions(token_hash,kind,subject,expires_at,created_at) VALUES(?,?,?,?,?)').bind(hash,'admin_full','full',expires,new Date(now).toISOString()).run();
  return token;
}
async function validFullAdminPassword(env,s,supplied){
  const v=String(supplied||'');
  if(env.ADMIN_PASSWORD&&v===String(env.ADMIN_PASSWORD))return true;
  if(env.SETUP_KEY&&v===String(env.SETUP_KEY))return true;
  if(s.admin_password_hash&&s.admin_password_salt){
    return (await sha256(`${s.admin_password_salt}:${v}`))===s.admin_password_hash;
  }
  return false;
}
async function requireFullAdmin(env,request){return validSession(env,request,'admin_full','rpp_admin_full')}
async function appendJson(response,extra){
  let data={};try{data=await response.clone().json()}catch{return response}
  const h=new Headers(response.headers);h.set('Content-Type','application/json; charset=utf-8');
  return new Response(JSON.stringify({...data,...extra}),{status:response.status,headers:h});
}

export default {
  async fetch(request,env){
    const url=new URL(request.url),path=url.pathname.replace(/\/$/,'')||'/';
    try{
      const s=await settingMap(env),preview=isPreview(s),allowPreviewWrites=previewWritesAllowed(env,s);

      if(path==='/api/admin/login'&&request.method==='POST'){
        const b=await request.clone().json().catch(()=>({}));
        if(!await validFullAdminPassword(env,s,b.password)){
          return json({error:'管理者パスワードを確認してください。初回はCloudflareのSETUP_KEYを使用してください。'},401);
        }
        const base=await baseWorker.fetch(request,env);
        if(!base.ok)return base;
        const token=await createFullAdminSession(env),h=new Headers(base.headers);
        h.append('Set-Cookie',sessionCookie('rpp_admin_full',token,12*60*60));
        return new Response(base.body,{status:base.status,headers:h});
      }
      if(path==='/api/admin/logout'&&request.method==='POST'){
        const base=await baseWorker.fetch(request,env),h=new Headers(base.headers);
        h.append('Set-Cookie',clearCookie('rpp_admin_full'));
        return new Response(base.body,{status:base.status,headers:h});
      }
      if(path.startsWith('/api/admin/')&&path!=='/api/admin/login'&&path!=='/api/admin/logout'){
        if(!await requireFullAdmin(env,request))return json({error:'安全のため管理者として再ログインしてください。'},401);
      }

      if(path==='/api/auth/request'&&request.method==='POST'&&!preview){
        if(!await validSession(env,request,'viewer','rpp_viewer')){
          return json({error:'先に文集の閲覧パスワードでログインしてから、原稿投稿画面を開いてください。'},401);
        }
      }

      if(preview&&!allowPreviewWrites&&((path==='/api/me/story'&&request.method==='PUT')||(path==='/api/me/photo'&&request.method==='POST'))){
        return json({error:'PREVIEW MODEでは安全のためクラウドへの原稿・写真保存を停止しています。入力内容はこの端末に保存されます。'},403);
      }

      if((path==='/api/config'||path==='/api/health')&&request.method==='GET'){
        const base=await baseWorker.fetch(request,env);
        return appendJson(base,{previewSubmissionsAllowed:allowPreviewWrites,adminDemoDisabled:true,securityGuard:'v1'});
      }

      return baseWorker.fetch(request,env);
    }catch(e){
      console.error(e);
      if(path==='/api/health')return json({error:'処理に失敗しました。',detail:String(e?.message||e)},500);
      return json({error:'処理に失敗しました。'},500);
    }
  }
};
