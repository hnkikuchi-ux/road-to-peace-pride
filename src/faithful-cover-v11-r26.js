import uiApp from './faithful-cover-v11-r25.js';
import baseApp from './faithful-cover-v11-r19.js';

const enc=new TextEncoder();
let editSchemaReady,resetSchemaReady;

function json(data,status=200,headers={}){
  return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
}
function cleanEmail(v){return String(v||'').trim().toLowerCase()}
function digits(v){return String(v||'').replace(/\D/g,'')}
function randomHex(bytes=16){const b=new Uint8Array(bytes);crypto.getRandomValues(b);return Array.from(b,x=>x.toString(16).padStart(2,'0')).join('')}
function cookieMap(request){const out={};for(const p of (request.headers.get('cookie')||'').split(';')){const i=p.indexOf('=');if(i>0)out[p.slice(0,i).trim()]=decodeURIComponent(p.slice(i+1).trim())}return out}
async function sha256(v){const b=await crypto.subtle.digest('SHA-256',enc.encode(String(v)));return Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('')}
function editPepper(env){return String(env.EDIT_CODE_PEPPER||env.OTP_PEPPER||env.SETUP_KEY||'')}

async function ensureEditSchema(env){
  if(!editSchemaReady)editSchemaReady=env.DB.prepare('CREATE TABLE IF NOT EXISTS rpp_edit_codes(email TEXT PRIMARY KEY,code_hash TEXT NOT NULL,salt TEXT NOT NULL,attempts INTEGER NOT NULL DEFAULT 0,locked_until TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL)').run();
  return editSchemaReady;
}
async function ensureResetSchema(env){
  if(!resetSchemaReady)resetSchemaReady=env.DB.prepare('CREATE TABLE IF NOT EXISTS rpp_author_resets(email TEXT PRIMARY KEY,reset_at TEXT NOT NULL)').run();
  return resetSchemaReady;
}
async function storeOtpAsEditCode(env,email,code){
  await ensureEditSchema(env);
  const p=editPepper(env);if(!p)throw new Error('EDIT_CODE_SECRET_MISSING');
  const normalized=digits(code);if(normalized.length!==6)throw new Error('EDIT_CODE_INVALID');
  const salt=randomHex(16),hash=await sha256(`${email}:${salt}:${normalized}:${p}`),now=new Date().toISOString();
  await env.DB.prepare('INSERT INTO rpp_edit_codes(email,code_hash,salt,attempts,locked_until,created_at,updated_at) VALUES(?,?,?,0,NULL,?,?) ON CONFLICT(email) DO UPDATE SET code_hash=excluded.code_hash,salt=excluded.salt,attempts=0,locked_until=NULL,updated_at=excluded.updated_at').bind(email,hash,salt,now,now).run();
  return normalized;
}
async function getEditCodeRow(env,email){
  await ensureEditSchema(env);
  return env.DB.prepare('SELECT email,code_hash,salt,attempts,locked_until,created_at,updated_at FROM rpp_edit_codes WHERE email=?').bind(email).first().catch(()=>null);
}
async function restoreEditCodeRow(env,row){
  if(!row?.email||!row?.code_hash||!row?.salt)return;
  await ensureEditSchema(env);
  const now=new Date().toISOString(),created=String(row.created_at||now);
  await env.DB.prepare('INSERT INTO rpp_edit_codes(email,code_hash,salt,attempts,locked_until,created_at,updated_at) VALUES(?,?,?,0,NULL,?,?) ON CONFLICT(email) DO UPDATE SET code_hash=excluded.code_hash,salt=excluded.salt,attempts=0,locked_until=NULL,created_at=excluded.created_at,updated_at=excluded.updated_at').bind(row.email,row.code_hash,row.salt,created,now).run();
}
async function tableExists(env,name){
  const row=await env.DB.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").bind(name).first().catch(()=>null);
  return Boolean(row?.name);
}
async function adminSession(env,request){
  const token=cookieMap(request).rpp_admin;if(!token)return null;
  return env.DB.prepare("SELECT * FROM rpp_sessions WHERE token_hash=? AND kind='admin' AND expires_at>?").bind(await sha256(token),new Date().toISOString()).first();
}
async function deleteIfPresent(env,table,sql,email){
  if(!await tableExists(env,table))return 0;
  const result=await env.DB.prepare(sql).bind(email).run();
  return Number(result?.meta?.changes||0);
}
async function resetAuthor(env,email){
  await ensureResetSchema(env);
  const hasStories=await tableExists(env,'rpp_stories'),hasRevisions=await tableExists(env,'rpp_story_revisions');
  const story=hasStories?await env.DB.prepare('SELECT id,photo_key FROM rpp_stories WHERE author_email=?').bind(email).first().catch(()=>null):null;
  const revisions=hasRevisions?((await env.DB.prepare('SELECT photo_key FROM rpp_story_revisions WHERE author_email=?').bind(email).all().catch(()=>({results:[]}))).results||[]):[];
  const photoKeys=new Set();if(story?.photo_key)photoKeys.add(String(story.photo_key));for(const r of revisions)if(r?.photo_key)photoKeys.add(String(r.photo_key));
  let deletedPhotos=0;if(env.MEDIA){for(const key of photoKeys){try{await env.MEDIA.delete(key);deletedPhotos++}catch(e){console.error('r26 photo cleanup failed',key,e)}}}
  const deleted={sessions:0,otps:0,editCodes:0,revisions:0,stories:0,photos:deletedPhotos};
  deleted.sessions=await deleteIfPresent(env,'rpp_sessions',"DELETE FROM rpp_sessions WHERE kind='author' AND subject=?",email);
  deleted.otps=await deleteIfPresent(env,'rpp_otps','DELETE FROM rpp_otps WHERE email=?',email);
  deleted.editCodes=await deleteIfPresent(env,'rpp_edit_codes','DELETE FROM rpp_edit_codes WHERE email=?',email);
  deleted.revisions=await deleteIfPresent(env,'rpp_story_revisions','DELETE FROM rpp_story_revisions WHERE author_email=?',email);
  deleted.stories=await deleteIfPresent(env,'rpp_stories','DELETE FROM rpp_stories WHERE author_email=?',email);
  const now=new Date().toISOString();
  await env.DB.prepare('INSERT INTO rpp_author_resets(email,reset_at) VALUES(?,?) ON CONFLICT(email) DO UPDATE SET reset_at=excluded.reset_at').bind(email,now).run();
  return {ok:true,email,resetAt:now,deleted};
}

async function verifyOneCode(request,env,ctx){
  await ensureResetSchema(env);
  let payload={};try{payload=await request.clone().json()}catch{}
  const payloadEmail=cleanEmail(payload.email),reset=Boolean(payload.resetEditCode===true);
  let previousEdit=null;
  if(/^\S+@\S+\.\S+$/.test(payloadEmail)&&!reset){
    try{previousEdit=await getEditCodeRow(env,payloadEmail)}catch(e){console.error('r26 edit-code precheck failed',e)}
  }

  const response=await baseApp.fetch(request,env,ctx);if(!response.ok)return response;
  let data={};try{data=await response.clone().json()}catch{return response}
  const email=cleanEmail(data.email||payloadEmail),code=digits(payload.code);
  if(/^\S+@\S+\.\S+$/.test(email)&&code.length===6){
    try{
      if(previousEdit&&cleanEmail(previousEdit.email)===email&&!reset){
        // Lower layers may rotate the edit code during email authentication.
        // Restore the code that the author originally saved, while clearing a lockout
        // because this email challenge has just been completed successfully.
        await restoreEditCodeRow(env,previousEdit);
        delete data.editCode;
        data.editCodeDigits=6;data.editCodePersistent=true;data.editCodeSameAsOtp=false;data.editCodeCreated=false;data.editCodeReset=false;
      }else{
        await storeOtpAsEditCode(env,email,code);
        data.editCode=code;data.editCodeDigits=6;data.editCodePersistent=true;data.editCodeSameAsOtp=true;data.editCodeCreated=true;data.editCodeReset=reset;
      }
    }catch(e){console.error('r26 one-code persistence failed',e);return json({error:'6桁コードを再編集用として保存できませんでした。もう一度認証してください。'},500)}
  }
  if(email){
    const marker=await env.DB.prepare('SELECT reset_at FROM rpp_author_resets WHERE email=?').bind(email).first().catch(()=>null);
    if(marker?.reset_at){data.accountResetAt=marker.reset_at;await env.DB.prepare('DELETE FROM rpp_author_resets WHERE email=?').bind(email).run().catch(()=>{})}
  }
  const headers=new Headers(response.headers);headers.set('Content-Type','application/json; charset=utf-8');headers.set('Cache-Control','no-store');
  return new Response(JSON.stringify(data),{status:response.status,statusText:response.statusText,headers});
}

export default{
  async fetch(request,env,ctx){
    const url=new URL(request.url),path=url.pathname.replace(/\/$/,'')||'/';
    if(path==='/api/auth/verify'&&request.method==='POST')return verifyOneCode(request,env,ctx);
    if(path==='/api/admin/author-reset'&&request.method==='POST'){
      if(!await adminSession(env,request))return json({error:'管理者認証が必要です。'},401);
      const body=await request.json().catch(()=>({})),email=cleanEmail(body.email);
      if(!/^\S+@\S+\.\S+$/.test(email))return json({error:'メールアドレスを確認してください。'},400);
      try{return json(await resetAuthor(env,email))}catch(e){console.error('r26 author reset failed',e);return json({error:'投稿者登録を削除できませんでした。'},500)}
    }
    return uiApp.fetch(request,env,ctx);
  }
};
