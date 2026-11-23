import app from './faithful-cover-v11-r33.js';

const JSON_HEADERS = {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const json = (data,status=200) => new Response(JSON.stringify(data),{status,headers:JSON_HEADERS});
const normalizeName = value => value.normalize('NFKC').replace(/\s/g,'');
const SOKU = ['中区','南総区','港南総区','磯子総区','栄区','金沢総区'];
const LIMIT = 8 * 1024 * 1024;
const closedMessage = '投稿受付は終了しました。最終閲覧版で皆さまの記録をご覧いただけます。';
async function digest(value){const data=typeof value==='string'?new TextEncoder().encode(value):value;return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data)),x=>x.toString(16).padStart(2,'0')).join('')}
function invalid(message,status=400){throw Object.assign(new Error(message),{status})}
function field(value,label,max,required=false){if(typeof value!=='string'||value.length>max||(required&&!value.trim()))invalid(`${label}を確認してください。`);return value}
async function readJson(request){
  if(!request.headers.get('content-type')?.startsWith('application/json'))invalid('JSON形式で送信してください。',415);
  if(Number(request.headers.get('content-length')||0)>LIMIT)invalid('ファイルは8MB以下にしてください。',413);
  const reader=request.body?.getReader();if(!reader)invalid('ファイルが空です。');
  const chunks=[];let size=0;
  for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>LIMIT){await reader.cancel();invalid('ファイルは8MB以下にしてください。',413)}chunks.push(value)}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}
  try{return JSON.parse(new TextDecoder().decode(bytes))}catch{invalid('JSONファイルを確認してください。')}
}
async function auditSchema(env){await env.DB.prepare('CREATE TABLE IF NOT EXISTS rpp_admin_changes(id TEXT PRIMARY KEY,action TEXT NOT NULL,story_id TEXT,before_json TEXT,after_json TEXT,created_at TEXT NOT NULL)').run()}
async function editionState(env){
  const rows=(await env.DB.prepare("SELECT key,value FROM rpp_settings WHERE key IN ('final_edition','final_edition_at','submission_deadline')").all()).results||[];
  const map=Object.fromEntries(rows.map(r=>[r.key,r.value]));
  return {finalEdition:map.final_edition==='true',finalEditionAt:map.final_edition_at||'',submissionDeadline:map.submission_deadline||'',deadlinePassed:map.final_edition==='true'||(Number.isFinite(Date.parse(map.submission_deadline))&&Date.now()>Date.parse(map.submission_deadline))};
}
async function importPlan(env,payload){
  if(payload?.format!=='rpp-admin-import-v1'||!Array.isArray(payload.stories)||payload.stories.length<1||payload.stories.length>20)invalid('取込形式または件数を確認してください（1〜20件）。');
  const existing=(await env.DB.prepare('SELECT id,name,soku,bunku,honbu,shibu,title,body,record_date,category,status,photo_key FROM rpp_stories').all()).results||[];
  const seen=new Set(),names=new Set(),plan=[];
  for(const input of payload.stories){
    const source=field(input.source_key,'取込識別子',200,true),hash=await digest(source),id=`admin-${hash.slice(0,32)}`;
    const story={id,author_email:`admin-import+${hash}@records.invalid`,name:field(input.name,'氏名',200,true),title:field(input.title,'題名',100,true),body:field(input.body,'本文',10000,true),soku:field(input.soku,'総区',100,true),bunku:field(input.bunku??'','分区',100),honbu:field(input.honbu??'','本部',100),shibu:field(input.shibu??'','支部',100),category:field(input.category??'','区分',30),record_date:field(input.record_date??'','記載日',20),status:'submitted',photo_key:null};
    if([...story.title].length>40||!SOKU.includes(story.soku))invalid('題名または総区を確認してください。');
    const nameKey=normalizeName(story.name);if(seen.has(id)||names.has(nameKey))invalid('取込ファイル内に同じ方の原稿が重複しています。');seen.add(id);names.add(nameKey);
    let photo=null;
    if(input.photo_base64!=null){
      const encoded=field(input.photo_base64,'写真',4*1024*1024,true);
      try{photo=Uint8Array.from(atob(encoded),x=>x.charCodeAt(0))}catch{invalid('写真データを確認してください。')}
      if(photo.length>3*1024*1024||photo.length<4||photo[0]!==255||photo[1]!==216||photo[2]!==255||photo.at(-2)!==255||photo.at(-1)!==217)invalid('写真は3MB以下のJPEGを指定してください。');
      story.photo_key=`rpp/${id}/${await digest(photo)}.jpg`;
    }
    const old=existing.find(s=>s.id===id);
    if(old){
      if(!['name','title','body','soku','bunku','honbu','shibu','record_date','category','status','photo_key'].every(k=>(old[k]??'')===(story[k]??'')))invalid(`${story.name}さんは取込済みですが、内容が異なります。上書きは行いません。`,409);
    }else if(existing.some(s=>normalizeName(s.name||'')===nameKey))invalid(`${story.name}さんの既存原稿があります。重複を確認してください。`,409);
    plan.push({story,photo,exists:Boolean(old)});
  }
  return plan;
}
function summarize(plan){return {added:plan.filter(p=>!p.exists).length,skipped:plan.filter(p=>p.exists).length,photos:plan.filter(p=>!p.exists&&p.photo).length,stories:plan.map(p=>({id:p.story.id,name:p.story.name,title:p.story.title,soku:p.story.soku,hasPhoto:Boolean(p.photo),exists:p.exists}))}}
async function importStories(env,plan){
  const fresh=plan.filter(p=>!p.exists);if(!fresh.length)return {...summarize(plan),ok:true};
  await auditSchema(env);const now=new Date().toISOString(),statements=[];
  // Immutable, content-addressed keys keep retries from overwriting any existing photograph.
  for(const {story:s,photo} of fresh){
    if(photo)await env.MEDIA.put(s.photo_key,photo,{metadata:{contentType:'image/jpeg',storyId:s.id}});
    statements.push(env.DB.prepare("INSERT INTO rpp_stories(id,author_email,record_date,soku,bunku,honbu,shibu,category,name,title,body,photo_key,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(s.id,s.author_email,s.record_date,s.soku,s.bunku,s.honbu,s.shibu,s.category,s.name,s.title,s.body,s.photo_key,s.status,now,now));
    statements.push(env.DB.prepare('INSERT INTO rpp_admin_changes(id,action,story_id,before_json,after_json,created_at) VALUES(?,?,?,?,?,?)').bind(crypto.randomUUID(),'import',s.id,null,JSON.stringify({name:s.name,soku:s.soku,photo_key:s.photo_key}),now));
  }
  await env.DB.batch(statements);
  return {...summarize(plan),ok:true};
}
async function moveStory(env,id,payload){
  const soku=field(payload.soku,'総区',100,true);if(!SOKU.includes(soku))invalid('総区を選んでください。');
  const old=await env.DB.prepare('SELECT * FROM rpp_stories WHERE id=?').bind(id).first();if(!old)invalid('原稿が見つかりません。',404);
  if(old.soku!==payload.expected_soku||old.updated_at!==payload.expected_updated_at)invalid('原稿が更新されています。再読込して確認してください。',409);
  if(old.soku===soku)return {ok:true,changed:false};
  await auditSchema(env);const now=new Date().toISOString();
  const result=await env.DB.batch([
    env.DB.prepare('INSERT INTO rpp_admin_changes(id,action,story_id,before_json,after_json,created_at) SELECT ?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM rpp_stories WHERE id=? AND soku=? AND updated_at=?)').bind(crypto.randomUUID(),'move-soku',id,JSON.stringify({soku:old.soku,updated_at:old.updated_at}),JSON.stringify({soku}),now,id,old.soku,old.updated_at),
    env.DB.prepare('UPDATE rpp_stories SET soku=?,updated_at=? WHERE id=? AND soku=? AND updated_at=?').bind(soku,now,id,old.soku,old.updated_at)
  ]);
  if(result[1]?.meta?.changes!==1)invalid('原稿が更新されています。再読込して確認してください。',409);
  return {ok:true,changed:true,id,name:old.name,soku};
}
const CLOSED_PAGE=`<!doctype html><html lang="ja" data-rpp-final-edition-support="r34"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>投稿受付終了｜ROAD TO PEACE PRIDE</title><style>body{margin:0;background:#061226;color:#f5e8bd;font-family:system-ui,'Yu Gothic',sans-serif;display:grid;place-items:center;min-height:100vh}main{max-width:560px;margin:24px;padding:36px 28px;border:1px solid #b88e3c;text-align:center}p{font-size:16px;line-height:1.9}h1{font-size:28px;font-family:serif}a{display:inline-block;margin-top:16px;padding:13px 24px;color:#061226;background:#efd98d;border-radius:30px;text-decoration:none;font-weight:700}.ey{color:#d8b866;font-size:14px;letter-spacing:.12em}</style></head><body><main><p class="ey">ROAD TO PEACE PRIDE</p><h1>投稿受付は終了しました</h1><p>ご寄稿いただき、ありがとうございました。<br>一人ひとりの挑戦と誓いを、<br>最終閲覧版でご覧いただけます。</p><a href="/">記録を読む</a></main></body></html>`;
const READER_UI=`<style>#gate a[href*="author"],#cover a[href*="author"]{display:none!important}.rpp-final-notice{font:500 14px/1.8 system-ui,'Yu Gothic',sans-serif;color:#ead8a5;text-align:center;letter-spacing:.04em;margin:14px auto;max-width:90%}#gate #rppFaithfulV7 .rpp-final-notice{position:absolute;left:7%;right:7%;top:89%;height:7.15%;margin:0;max-width:none;display:flex;align-items:center;justify-content:center;font-size:clamp(11px,2.8vw,14px);line-height:1.6;z-index:30}#rppFaithfulV7 .v9-shine-layer.author{display:none!important}#photo{object-fit:contain!important;max-height:none!important}</style><script>(()=>{function mark(){for(const section of document.querySelectorAll('#gate,#cover')){const links=section.querySelectorAll('a[href*="author"]');for(const link of links){link.hidden=true;link.setAttribute('aria-hidden','true');link.tabIndex=-1;link.style.setProperty('display','none','important')}if(section.querySelector('.rpp-final-notice'))continue;const link=links[0];if(link){const note=document.createElement('p');note.className='rpp-final-notice';note.textContent='最終閲覧版｜投稿受付は終了しました';link.before(note)}}}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mark,{once:true});else mark();document.addEventListener('rpp:stories-loaded',mark);addEventListener('pageshow',mark);})();</script>`;
function rewrite(response,extra=''){
  const h=new Headers(response.headers);h.set('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');h.delete('Content-Length');
  let rewriter=new HTMLRewriter().on('html',{element(e){e.setAttribute('data-rpp-final-edition-support','r34')}});
  if(extra)rewriter=rewriter.on('body',{element(e){e.append(extra,{html:true})}});
  return rewriter.transform(new Response(response.body,{status:response.status,statusText:response.statusText,headers:h}));
}
export function createFinalEditionWorker(upstream){return {async fetch(request,env,ctx){
  const url=new URL(request.url),path=url.pathname.replace(/\/$/,'')||'/',method=request.method;
  try{
    if(path.startsWith('/api/admin/final-edition')){
      const authUrl=new URL('/api/admin/settings',url),authHeaders=new Headers(request.headers);authHeaders.delete('content-length');authHeaders.delete('content-type');
      const auth=await upstream.fetch(new Request(authUrl,{headers:authHeaders}),env,ctx);if(!auth.ok)return auth;
      if(method!=='GET'&&(request.headers.get('origin')!==url.origin||request.headers.get('sec-fetch-site')==='cross-site'))return json({error:'同じサイトの管理画面から操作してください。'},403);
      if(path==='/api/admin/final-edition'&&method==='GET')return json(await editionState(env));
      if(['/api/admin/final-edition/prepare','/api/admin/final-edition/import'].includes(path)&&method==='POST'){
        const plan=await importPlan(env,await readJson(request));return json(path.endsWith('/prepare')?summarize(plan):await importStories(env,plan));
      }
      const move=path.match(/^\/api\/admin\/final-edition\/story\/([^/]+)\/org$/);
      if(move&&method==='PATCH')return json(await moveStory(env,decodeURIComponent(move[1]),await readJson(request)));
      if(path==='/api/admin/final-edition/close'&&method==='POST'){
        const state=await editionState(env);if(state.finalEdition)return json({ok:true,...state});
        const now=new Date().toISOString(),deadline=state.deadlinePassed?state.submissionDeadline:now;await auditSchema(env);
        await env.DB.batch([
          ...Object.entries({final_edition:'true',final_edition_at:now,submission_deadline:deadline}).map(([k,v])=>env.DB.prepare('INSERT INTO rpp_settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind(k,v)),
          env.DB.prepare('INSERT INTO rpp_admin_changes(id,action,story_id,before_json,after_json,created_at) VALUES(?,?,?,?,?,?)').bind(crypto.randomUUID(),'close',null,JSON.stringify(state),JSON.stringify({finalEdition:true,submissionDeadline:deadline}),now)
        ]);return json({ok:true,...await editionState(env)});
      }
      return json({error:'Not found'},404);
    }
    const isAuthor=['/author','/author.html'].includes(path),isReader=['/','/index.html'].includes(path);
    const isWrite=!['GET','HEAD','OPTIONS'].includes(method)&&(path.startsWith('/api/me/')||path==='/api/rpp/resubmit'||path==='/api/auth/request'||path==='/api/auth/verify'||path.startsWith('/api/edit-code/'));
    const needsState=isAuthor||isReader||isWrite||path==='/api/config';
    let state=null;if(needsState){
      // Let the existing worker initialize its schema and keep its existing public configuration contract.
      const configHeaders=new Headers(request.headers);configHeaders.delete('content-length');configHeaders.delete('content-type');
      const cfg=await upstream.fetch(new Request(new URL('/api/config',url),{headers:configHeaders}),env,ctx);if(!cfg.ok)return cfg;
      state=await editionState(env);
      if(path==='/api/config'&&method==='GET')return json({...await cfg.json(),...state});
    }
    if(isWrite&&state.deadlinePassed)return json({error:closedMessage,deadlinePassed:true,finalEdition:state.finalEdition},403);
    if(isAuthor&&state.finalEdition&&['GET','HEAD'].includes(method))return new Response(method==='HEAD'?null:CLOSED_PAGE,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
    const response=await upstream.fetch(request,env,ctx);
    if(response.headers.get('content-type')?.includes('text/html'))return rewrite(response,isReader&&state.finalEdition?READER_UI:'');
    return response;
  }catch(error){return json({error:error.status?error.message:'処理を完了できませんでした。再読込して結果を確認してください。'},error.status||500)}
}}}
export default createFinalEditionWorker(app);
