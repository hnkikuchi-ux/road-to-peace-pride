import app from './faithful-cover-v11-r9.js';

const GROUPS=['中区','南総区','港南総区','磯子総区','金沢総区','栄区'];
const enc=new TextEncoder();
let safetyReady;

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}
function cookieMap(request){const out={};for(const p of (request.headers.get('cookie')||'').split(';')){const i=p.indexOf('=');if(i>0)out[p.slice(0,i).trim()]=decodeURIComponent(p.slice(i+1).trim())}return out}
async function sha256(v){const b=await crypto.subtle.digest('SHA-256',enc.encode(String(v)));return Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('')}
async function ensureSafety(env){
  if(!safetyReady)safetyReady=env.DB.exec(`
    CREATE TABLE IF NOT EXISTS rpp_story_revisions(
      id TEXT PRIMARY KEY,
      story_id TEXT NOT NULL,
      author_email TEXT NOT NULL,
      record_date TEXT,
      soku TEXT,
      bunku TEXT,
      honbu TEXT,
      shibu TEXT,
      category TEXT,
      name TEXT,
      title TEXT,
      body TEXT,
      photo_key TEXT,
      status TEXT,
      snapshot_at TEXT NOT NULL,
      reason TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_rpp_story_revisions_story ON rpp_story_revisions(story_id,snapshot_at DESC);
    CREATE INDEX IF NOT EXISTS idx_rpp_story_revisions_email ON rpp_story_revisions(author_email,snapshot_at DESC);
  `);
  return safetyReady;
}
async function session(env,request,kind,cookieName){
  const token=cookieMap(request)[cookieName];if(!token)return null;
  return env.DB.prepare('SELECT * FROM rpp_sessions WHERE token_hash=? AND kind=? AND expires_at>?').bind(await sha256(token),kind,new Date().toISOString()).first();
}
function validDate(v){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(String(v||'')))return false;
  const [y,m,d]=String(v).split('-').map(Number),dt=new Date(Date.UTC(y,m-1,d));
  return dt.getUTCFullYear()===y&&dt.getUTCMonth()===m-1&&dt.getUTCDate()===d;
}
function changed(old,b){
  if(!old)return false;
  const keys=['record_date','soku','bunku','honbu','shibu','category','name','title','body','status'];
  return keys.some(k=>String(old[k]??'')!==String(b[k]??(k==='status'?'draft':'')));
}
async function snapshot(env,row,reason,photoKeyOverride){
  if(!row)return;
  await env.DB.prepare(`INSERT INTO rpp_story_revisions(id,story_id,author_email,record_date,soku,bunku,honbu,shibu,category,name,title,body,photo_key,status,snapshot_at,reason) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .bind(crypto.randomUUID(),row.id,row.author_email,row.record_date,row.soku,row.bunku,row.honbu,row.shibu,row.category,row.name,row.title,row.body,photoKeyOverride??row.photo_key,row.status,new Date().toISOString(),reason).run();
}
async function shouldSnapshot(env,row,b){
  if(!row||!changed(row,b))return false;
  if(String(row.status||'')!==String(b.status||'draft'))return true;
  const last=await env.DB.prepare('SELECT snapshot_at FROM rpp_story_revisions WHERE story_id=? ORDER BY snapshot_at DESC LIMIT 1').bind(row.id).first();
  return !last?.snapshot_at||Date.now()-Date.parse(last.snapshot_at)>=5*60*1000;
}
async function archiveCurrentPhoto(env,row){
  if(!row?.photo_key||!env.MEDIA)return null;
  const obj=await env.MEDIA.getWithMetadata(row.photo_key,'arrayBuffer');if(!obj?.value)return null;
  const key=`rpp-history/${row.id}/${Date.now()}-${crypto.randomUUID()}.jpg`;
  await env.MEDIA.put(key,obj.value,{metadata:{contentType:obj.metadata?.contentType||'image/jpeg',storyId:row.id,archivedAt:new Date().toISOString()}});
  await env.DB.prepare('UPDATE rpp_story_revisions SET photo_key=? WHERE story_id=? AND photo_key=?').bind(key,row.id,row.photo_key).run();
  return key;
}

async function hardenedFetch(request,env,ctx){
  const url=new URL(request.url),path=url.pathname.replace(/\/$/,'')||'/';
  if(path.startsWith('/api/'))await ensureSafety(env);

  if(path==='/api/me/story'&&request.method==='PUT'){
    let b;try{b=await request.clone().json()}catch{return json({error:'入力内容を確認してください。'},400)}
    const soku=String(b.soku||'').trim(),date=String(b.record_date||'').trim(),status=b.status==='submitted'?'submitted':'draft';
    if(soku&&!GROUPS.includes(soku))return json({error:'組織は一覧から選択してください。'},400);
    if(date&&!validDate(date))return json({error:'日付を確認してください。'},400);
    if(status==='submitted'&&!GROUPS.includes(soku))return json({error:'掲載する組織を選択してください。'},400);
    if(status==='submitted'&&!validDate(date))return json({error:'記載日を入力してください。'},400);
    const ses=await session(env,request,'author','rpp_author');
    const old=ses?await env.DB.prepare('SELECT * FROM rpp_stories WHERE author_email=?').bind(ses.subject).first():null;
    const take=await shouldSnapshot(env,old,{...b,status});
    const response=await app.fetch(request,env,ctx);
    if(response.ok&&take)await snapshot(env,old,status==='submitted'?'before-submit-or-edit':'autosave-checkpoint').catch(console.error);
    return response;
  }

  if(path==='/api/me/photo'&&request.method==='POST'){
    const type=(request.headers.get('content-type')||'').toLowerCase();
    if(!type.startsWith('image/jpeg'))return json({error:'写真はJPEG形式で保存してください。'},400);
    const bytes=await request.arrayBuffer();
    if(bytes.byteLength>3*1024*1024)return json({error:'写真は3MB以下にしてください。'},413);
    const u=new Uint8Array(bytes);if(u.length<3||u[0]!==0xff||u[1]!==0xd8||u[2]!==0xff)return json({error:'画像データを確認してください。'},400);
    const ses=await session(env,request,'author','rpp_author');
    const old=ses?await env.DB.prepare('SELECT * FROM rpp_stories WHERE author_email=?').bind(ses.subject).first():null;
    let archive=null;if(old?.photo_key)archive=await archiveCurrentPhoto(env,old).catch(()=>null);
    const next=new Request(request.url,{method:'POST',headers:request.headers,body:bytes});
    const response=await app.fetch(next,env,ctx);
    if(response.ok&&old)await snapshot(env,old,'before-photo-change',archive||old.photo_key).catch(console.error);
    return response;
  }

  if(path==='/api/admin/export.json'&&request.method==='GET'){
    const response=await app.fetch(request,env,ctx);if(!response.ok)return response;
    try{
      const data=await response.json();
      const revisions=(await env.DB.prepare('SELECT * FROM rpp_story_revisions ORDER BY snapshot_at DESC').all()).results||[];
      data.revisions=revisions;data.revision_count=revisions.length;data.backup_schema='rpp-backup-v2';
      return new Response(JSON.stringify(data,null,2),{status:200,headers:{'Content-Type':'application/json; charset=utf-8','Content-Disposition':'attachment; filename="road-to-peace-pride-backup-v2.json"','Cache-Control':'no-store'}});
    }catch{return response}
  }

  return app.fetch(request,env,ctx);
}

export default {fetch:hardenedFetch};
