import app from './faithful-cover-v11-r28.js';

const enc=new TextEncoder();
let draftSchemaReady;

function json(data,status=200,headers={}){
  return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
}
function clean(v){return String(v||'').trim()}
async function sha256(v){const b=await crypto.subtle.digest('SHA-256',enc.encode(String(v)));return Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('')}
async function ensureDraftSchema(env){
  if(!draftSchemaReady)draftSchemaReady=env.DB.prepare('CREATE TABLE IF NOT EXISTS rpp_story_working_drafts(author_email TEXT PRIMARY KEY,record_date TEXT,soku TEXT,bunku TEXT,honbu TEXT,shibu TEXT,category TEXT,name TEXT,title TEXT,body TEXT,photo_key TEXT,updated_at TEXT NOT NULL)').run().catch(e=>{draftSchemaReady=null;throw e});
  return draftSchemaReady;
}
async function getWorkingDraft(env,email){await ensureDraftSchema(env);return env.DB.prepare('SELECT * FROM rpp_story_working_drafts WHERE author_email=?').bind(email).first()}
async function deleteWorkingDraft(env,email){await ensureDraftSchema(env);return env.DB.prepare('DELETE FROM rpp_story_working_drafts WHERE author_email=?').bind(email).run()}
async function upsertWorkingDraft(env,email,story,body,photoKeyOverride){
  await ensureDraftSchema(env);
  const old=await getWorkingDraft(env,email).catch(()=>null);
  const row={
    record_date:clean(body?.record_date??old?.record_date??story?.record_date),
    soku:clean(body?.soku??old?.soku??story?.soku),
    bunka:clean(body?.bunku??old?.bunku??story?.bunku),
    bunka2:clean(body?.honbu??old?.honbu??story?.honbu),
    shibu:clean(body?.shibu??old?.shibu??story?.shibu),
    category:clean(body?.category??old?.category??story?.category),
    name:clean(body?.name??old?.name??story?.name),
    title:String(body?.title??old?.title??story?.title??''),
    body:String(body?.body??old?.body??story?.body??''),
    photo_key:photoKeyOverride!==undefined?photoKeyOverride:(old?.photo_key??story?.photo_key??null),
    updated_at:new Date().toISOString()
  };
  await env.DB.prepare('INSERT INTO rpp_story_working_drafts(author_email,record_date,soku,bunku,honbu,shibu,category,name,title,body,photo_key,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(author_email) DO UPDATE SET record_date=excluded.record_date,soku=excluded.soku,bunku=excluded.bunku,honbu=excluded.honbu,shibu=excluded.shibu,category=excluded.category,name=excluded.name,title=excluded.title,body=excluded.body,photo_key=excluded.photo_key,updated_at=excluded.updated_at')
    .bind(email,row.record_date,row.soku,row.bunka,row.bunka2,row.shibu,row.category,row.name,row.title,row.body,row.photo_key,row.updated_at).run();
  return {...row,bunku:row.bunka,honbu:row.bunka2};
}
function overlayStory(story,draft){
  if(!story||!draft)return story;
  return {...story,record_date:draft.record_date,soku:draft.soku,bunku:draft.bunku,honbu:draft.honbu,shibu:draft.shibu,category:draft.category,name:draft.name,title:draft.title,body:draft.body,photo_key:draft.photo_key,status:'submitted'};
}
async function baseMeStory(request,env,ctx){
  const u=new URL(request.url);u.pathname='/api/me/story';u.search='';
  const headers=new Headers(request.headers);headers.delete('content-length');headers.delete('content-type');
  return app.fetch(new Request(u.toString(),{method:'GET',headers}),env,ctx);
}
async function readAuthorState(request,env,ctx){
  const r=await baseMeStory(request,env,ctx);if(!r.ok)return {response:r,data:null};
  try{return {response:r,data:await r.clone().json()}}catch{return {response:r,data:null}}
}
async function cleanupWorkingPhoto(env,draft){
  const key=String(draft?.photo_key||'');if(!key.startsWith('rpp-working/')||!env.MEDIA)return;
  try{await env.MEDIA.delete(key)}catch(e){console.error('r29 working photo cleanup failed',e)}
}

const AUTHOR_GUARD=`<style id="rppSubmissionGuardR29">
body.rpp-author-r5 #rppSubmitSuccessR28{transition:opacity .18s ease}
</style>
<script>
(()=>{
  let submitIntent=null,manualSaveIntent=false;
  const now=()=>Date.now();
  function submittedMode(){return String(document.getElementById('statusBadge')?.textContent||'').includes('提出済')}
  function successBox(){return document.getElementById('rppSubmitSuccessR28')}
  function hideSuccess(){const b=successBox();if(b)b.classList.remove('rpp-show')}
  function forceSaveLabel(){
    const save=document.getElementById('save');if(!save)return;
    if(submittedMode()&&save.textContent!=='変更内容を保存')save.textContent='変更内容を保存';
    if(!submittedMode()&&save.textContent.includes('提出済みのまま'))save.textContent='下書き保存';
    if(!save.dataset.r29Watch){
      save.dataset.r29Watch='1';
      new MutationObserver(()=>{if(submittedMode()&&save.textContent!=='変更内容を保存')save.textContent='変更内容を保存'}).observe(save,{childList:true,characterData:true,subtree:true});
    }
  }
  function showSuccess(isEdit){
    const b=successBox();if(!b)return;
    b.innerHTML='<b>✓ '+(isEdit?'変更内容を再提出しました！':'提出が完了しました！')+'</b><span>原稿は正常に保存されています。締切までは再編集できます。</span>';
    b.classList.add('rpp-show');
    b.focus?.({preventScroll:true});b.scrollIntoView?.({block:'center',behavior:'smooth'});
    const m=document.getElementById('savemsg');if(m){m.textContent=isEdit?'変更内容を再提出しました。':'提出しました。';m.className='note ok'}
  }
  function showDraftSaved(){
    hideSuccess();forceSaveLabel();
    const m=document.getElementById('savemsg');if(m){m.textContent='変更内容を保存しました。再提出するまでは掲載内容は変わりません。';m.className='note ok'}
  }
  document.addEventListener('click',e=>{
    if(e.target?.closest?.('#submit,#submitPreview')){
      submitIntent={until:now()+1500,isEdit:submittedMode()};
      setTimeout(()=>{if(submitIntent&&submitIntent.until<=now())submitIntent=null},1700);
    }
    if(e.target?.closest?.('#save')){manualSaveIntent=true;submitIntent=null;hideSuccess();setTimeout(()=>{manualSaveIntent=false},1800)}
  },true);
  document.addEventListener('input',e=>{if(e.target?.closest?.('#formArea'))hideSuccess()},true);
  document.addEventListener('change',e=>{if(e.target?.closest?.('#formArea'))hideSuccess()},true);

  const previousFetch=window.fetch.bind(window);
  window.fetch=async(input,init)=>{
    const url=typeof input==='string'?input:(input?.url||'');
    const method=String(init?.method||'GET').toUpperCase();
    let nextInit=init,storyIntent='',isEdit=false,wasManualSave=false;
    if(url.includes('/api/me/story')&&method==='PUT'){
      let status='';try{status=JSON.parse(typeof init?.body==='string'?init.body:'{}')?.status||''}catch{}
      if(status==='submitted'){
        const active=submitIntent&&submitIntent.until>now();
        if(active){storyIntent='submit';isEdit=!!submitIntent.isEdit;submitIntent=null}
        else if(submittedMode()){storyIntent='edit-draft';wasManualSave=manualSaveIntent}
        if(storyIntent){const h=new Headers(init?.headers||{});h.set('X-RPP-Story-Intent',storyIntent);nextInit={...(init||{}),headers:h}}
      }
    }
    if(url.includes('/api/me/photo')&&method==='POST'&&submittedMode()){
      const h=new Headers(init?.headers||{});h.set('X-RPP-Story-Intent','edit-draft-photo');nextInit={...(init||{}),headers:h};hideSuccess();
    }
    const response=await previousFetch(input,nextInit);
    if(url.includes('/api/me/story')&&method==='PUT'){
      if(storyIntent==='submit'&&response.ok)setTimeout(()=>showSuccess(isEdit),120);
      if(storyIntent==='edit-draft'){
        setTimeout(hideSuccess,90);setTimeout(hideSuccess,180);setTimeout(forceSaveLabel,0);setTimeout(forceSaveLabel,180);
        if(response.ok&&wasManualSave){setTimeout(showDraftSaved,0);setTimeout(showDraftSaved,180)}
      }
    }
    return response;
  };
  function run(){document.documentElement.dataset.rppSubmissionGuard='r29';hideSuccess();forceSaveLabel();setTimeout(forceSaveLabel,120);setTimeout(forceSaveLabel,600);setTimeout(forceSaveLabel,1500)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  addEventListener('pageshow',run);document.addEventListener('visibilitychange',()=>{if(!document.hidden){forceSaveLabel();hideSuccess()}});
  document.addEventListener('rpp:reedit-opened',()=>setTimeout(forceSaveLabel,0));
})();
</script>`;

const VIEWER_CLEANUP=`<script>
(()=>{
  const phrase='原文のまま掲載';
  function scrub(){
    const body=document.body;if(!body)return;
    const walker=document.createTreeWalker(body,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(n=>{if(String(n.nodeValue||'').trim()===phrase)n.nodeValue=''});
    body.querySelectorAll('*').forEach(el=>{if(el.children.length===0&&String(el.textContent||'').trim()===phrase)el.remove()});
    document.documentElement.dataset.rppViewerCleanup='r29';
  }
  const start=()=>{scrub();let n=0;const t=setInterval(()=>{scrub();if(++n>=16)clearInterval(t)},250)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  document.addEventListener('click',()=>{setTimeout(scrub,0);setTimeout(scrub,220);setTimeout(scrub,700)},true);
})();
</script>`;

function injectHtml(response,{author=false}={}){
  const headers=new Headers(response.headers);headers.set('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');headers.delete('Content-Length');
  return new HTMLRewriter()
    .on('html',{element(el){el.setAttribute('data-rpp-viewer-cleanup','r29');if(author)el.setAttribute('data-rpp-submission-guard','r29')}})
    .on('body',{element(el){el.append(VIEWER_CLEANUP,{html:true});if(author)el.append(AUTHOR_GUARD,{html:true})}})
    .transform(new Response(response.body,{status:response.status,statusText:response.statusText,headers}));
}

export default{
  async fetch(request,env,ctx){
    const url=new URL(request.url),path=url.pathname.replace(/\/$/,'')||'/',intent=request.headers.get('X-RPP-Story-Intent')||'';

    if(path==='/api/me/story'&&request.method==='GET'){
      const response=await app.fetch(request,env,ctx);if(!response.ok)return response;
      let data;try{data=await response.clone().json()}catch{return response}
      if(data?.email&&data?.story?.status==='submitted'){
        const draft=await getWorkingDraft(env,data.email).catch(()=>null);
        if(draft){data.story=overlayStory(data.story,draft);data.hasWorkingDraft=true;data.workingDraftUpdatedAt=draft.updated_at;return json(data,response.status)}
      }
      return response;
    }

    if(path==='/api/me/story'&&request.method==='PUT'){
      let body;try{body=await request.clone().json()}catch{return app.fetch(request,env,ctx)}
      const state=await readAuthorState(request,env,ctx);if(!state.response.ok||!state.data?.email)return state.response;
      const email=state.data.email,current=state.data.story;
      const shouldDraft=current?.status==='submitted'&&body?.status==='submitted'&&intent!=='submit';
      if(shouldDraft){
        const row=await upsertWorkingDraft(env,email,current,body,undefined);
        const data={...state.data,story:overlayStory(current,row),hasWorkingDraft:true,workingDraftSaved:true,workingDraftUpdatedAt:row.updated_at};
        return json(data,200);
      }
      const working=current?.status==='submitted'?await getWorkingDraft(env,email).catch(()=>null):null;
      const response=await app.fetch(request,env,ctx);
      if(response.ok&&body?.status==='submitted'){
        if(working?.photo_key&&working.photo_key!==current?.photo_key){
          await env.DB.prepare('UPDATE rpp_stories SET photo_key=? WHERE author_email=?').bind(working.photo_key,email).run().catch(e=>console.error('r29 publish working photo failed',e));
        }
        await deleteWorkingDraft(env,email).catch(e=>console.error('r29 working draft cleanup failed',e));
      }
      return response;
    }

    if(path==='/api/me/photo'&&request.method==='POST'&&intent==='edit-draft-photo'){
      const state=await readAuthorState(request,env,ctx);if(!state.response.ok||!state.data?.email)return state.response;
      const email=state.data.email,current=state.data.story;
      if(current?.status!=='submitted')return app.fetch(request,env,ctx);
      const type=(request.headers.get('content-type')||'').toLowerCase();if(!type.startsWith('image/jpeg'))return json({error:'写真はJPEG形式で保存してください。'},400);
      const bytes=await request.arrayBuffer();if(bytes.byteLength>3*1024*1024)return json({error:'写真は3MB以下にしてください。'},413);
      const u=new Uint8Array(bytes);if(u.length<3||u[0]!==0xff||u[1]!==0xd8||u[2]!==0xff)return json({error:'画像データを確認してください。'},400);
      const old=await getWorkingDraft(env,email).catch(()=>null);if(old?.photo_key?.startsWith('rpp-working/'))await cleanupWorkingPhoto(env,old);
      const key=`rpp-working/${await sha256(email)}/${Date.now()}-${crypto.randomUUID()}.jpg`;
      await env.MEDIA.put(key,bytes,{metadata:{contentType:'image/jpeg',authorHash:await sha256(email),workingDraft:'1',savedAt:new Date().toISOString()}});
      const row=await upsertWorkingDraft(env,email,current,old||{},key);
      return json({ok:true,draft:true,photoKey:key,workingDraftUpdatedAt:row.updated_at});
    }

    if(path==='/api/admin/author-reset'&&request.method==='POST'){
      let email='';try{email=clean((await request.clone().json())?.email).toLowerCase()}catch{}
      const draft=email?await getWorkingDraft(env,email).catch(()=>null):null;
      const response=await app.fetch(request,env,ctx);
      if(response.ok&&email){await cleanupWorkingPhoto(env,draft);await deleteWorkingDraft(env,email).catch(()=>null)}
      return response;
    }

    const response=await app.fetch(request,env,ctx),type=response.headers.get('content-type')||'';
    if(type.includes('text/html'))return injectHtml(response,{author:['/author','/author.html'].includes(path)});
    return response;
  }
};
