import app from './faithful-cover-v11-r20.js';

const enc=new TextEncoder();
let resetSchemaReady;

function json(data,status=200,headers={}){
  return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
}
function cleanEmail(v){return String(v||'').trim().toLowerCase()}
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
async function ensureResetSchema(env){
  if(!resetSchemaReady)resetSchemaReady=env.DB.exec(`
    CREATE TABLE IF NOT EXISTS rpp_author_resets(
      email TEXT PRIMARY KEY,
      reset_at TEXT NOT NULL
    );
  `);
  return resetSchemaReady;
}
async function adminSession(env,request){
  const token=cookieMap(request).rpp_admin;
  if(!token)return null;
  return env.DB.prepare("SELECT * FROM rpp_sessions WHERE token_hash=? AND kind='admin' AND expires_at>?")
    .bind(await sha256(token),new Date().toISOString()).first();
}
async function resetAuthor(env,email){
  await ensureResetSchema(env);
  const story=await env.DB.prepare('SELECT id,photo_key FROM rpp_stories WHERE author_email=?').bind(email).first().catch(()=>null);
  const revisions=(await env.DB.prepare('SELECT photo_key FROM rpp_story_revisions WHERE author_email=?').bind(email).all().catch(()=>({results:[]}))).results||[];
  const photoKeys=new Set();
  if(story?.photo_key)photoKeys.add(String(story.photo_key));
  for(const r of revisions)if(r?.photo_key)photoKeys.add(String(r.photo_key));

  let deletedPhotos=0;
  if(env.MEDIA){
    for(const key of photoKeys){
      try{await env.MEDIA.delete(key);deletedPhotos++}catch(e){console.error('r22 photo cleanup failed',key,e)}
    }
  }

  const now=new Date().toISOString();
  const statements=[
    env.DB.prepare("DELETE FROM rpp_sessions WHERE kind='author' AND subject=?").bind(email),
    env.DB.prepare('DELETE FROM rpp_otps WHERE email=?').bind(email),
    env.DB.prepare('DELETE FROM rpp_edit_codes WHERE email=?').bind(email),
    env.DB.prepare('DELETE FROM rpp_story_revisions WHERE author_email=?').bind(email),
    env.DB.prepare('DELETE FROM rpp_stories WHERE author_email=?').bind(email),
    env.DB.prepare('INSERT INTO rpp_author_resets(email,reset_at) VALUES(?,?) ON CONFLICT(email) DO UPDATE SET reset_at=excluded.reset_at').bind(email,now)
  ];
  const results=await env.DB.batch(statements);
  const changes=results.map(r=>Number(r?.meta?.changes||0));
  return {ok:true,email,resetAt:now,deleted:{sessions:changes[0],otps:changes[1],editCodes:changes[2],revisions:changes[3],stories:changes[4],photos:deletedPhotos}};
}

const ADMIN_RESET_UI=`
<style>
#rppAuthorResetPanel .rpp-reset-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:end}
#rppAuthorResetPanel .rpp-danger{border-color:rgba(230,130,105,.62);color:#ffd7cc;background:rgba(180,62,35,.13)}
#rppAuthorResetPanel .rpp-danger:hover{background:rgba(180,62,35,.22)}
@media(max-width:640px){#rppAuthorResetPanel .rpp-reset-row{grid-template-columns:1fr}#rppAuthorResetPanel .rpp-danger{width:100%;min-height:46px}}
</style>
<script>
(()=>{
  function mount(){
    if(document.getElementById('rppAuthorResetPanel'))return;
    const heading=[...document.querySelectorAll('h2')].find(x=>x.textContent.includes('AUTHORS｜投稿者一覧'));
    const authors=heading?.closest('.panel');if(!authors)return;
    const panel=document.createElement('div');panel.className='panel';panel.id='rppAuthorResetPanel';
    panel.innerHTML='<div class="ey">AUTHOR RESET</div><h2>投稿者登録をリセット</h2><p class="note">テスト登録をやり直す場合に使用します。原稿・6桁コード・メール認証・ログイン状態・編集履歴・関連写真を削除し、同じメールアドレスで初回登録からやり直せます。</p><div class="rpp-reset-row"><div class="field" style="margin:0"><label>削除するメールアドレス</label><input id="rppResetEmail" class="input" type="email" autocomplete="off" placeholder="example@email.com"></div><button id="rppResetBtn" class="pill rpp-danger">登録を完全削除</button></div><div id="rppResetMsg" class="msg"></div>';
    authors.parentNode.insertBefore(panel,authors);
    const btn=panel.querySelector('#rppResetBtn'),input=panel.querySelector('#rppResetEmail'),msg=panel.querySelector('#rppResetMsg');
    btn.onclick=async()=>{
      const email=(input.value||'').trim().toLowerCase();
      if(!/^\\S+@\\S+\\.\\S+$/.test(email)){msg.textContent='メールアドレスを確認してください。';msg.className='msg warn';return}
      if(!confirm(email+' の登録データを完全に削除します。\\n同じメールアドレスで初回登録からやり直せます。よろしいですか？'))return;
      btn.disabled=true;msg.textContent='削除中…';msg.className='msg';
      try{
        const r=await fetch('/api/admin/author-reset',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({email})});
        const d=await r.json();
        if(!r.ok)throw new Error(d.error||('HTTP '+r.status));
        input.value='';msg.textContent=email+' の登録を削除しました。初回登録からやり直せます。';msg.className='msg ok';
        document.getElementById('refresh')?.click();
      }catch(e){msg.textContent='削除できませんでした：'+e.message;msg.className='msg warn'}finally{btn.disabled=false}
    };
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
  setTimeout(mount,150);setTimeout(mount,700);
})();
</script>`;

const AUTHOR_RESET_CLIENT=`
<script>
(()=>{
  if(globalThis.fetch.__rppResetWrapped)return;
  const original=globalThis.fetch.bind(globalThis);
  const wrapped=async(input,init)=>{
    const response=await original(input,init);
    try{
      const url=typeof input==='string'?input:(input?.url||'');
      if(response.ok&&url.includes('/api/auth/verify')){
        const d=await response.clone().json();
        if(d?.accountResetAt&&d?.email){
          const email=String(d.email).trim().toLowerCase();
          try{localStorage.removeItem('rpp_draft_'+email)}catch{}
          try{sessionStorage.removeItem('rpp_latest_edit_code')}catch{}
          document.documentElement.dataset.rppCleanReregister='1';
        }
      }
    }catch{}
    return response;
  };
  wrapped.__rppResetWrapped=true;
  globalThis.fetch=wrapped;
})();
</script>`;

function inject(response,html){
  const headers=new Headers(response.headers);headers.set('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');
  return new HTMLRewriter().on('body',{element(el){el.append(html,{html:true})}})
    .transform(new Response(response.body,{status:response.status,statusText:response.statusText,headers}));
}

export default{
  async fetch(request,env,ctx){
    const url=new URL(request.url),path=url.pathname.replace(/\/$/,'')||'/';
    await ensureResetSchema(env);

    if(path==='/api/admin/author-reset'&&request.method==='POST'){
      if(!await adminSession(env,request))return json({error:'管理者認証が必要です。'},401);
      const body=await request.json().catch(()=>({}));const email=cleanEmail(body.email);
      if(!/^\S+@\S+\.\S+$/.test(email))return json({error:'メールアドレスを確認してください。'},400);
      try{return json(await resetAuthor(env,email))}catch(e){console.error('r22 author reset failed',e);return json({error:'投稿者登録を削除できませんでした。'},500)}
    }

    if(path==='/api/auth/verify'&&request.method==='POST'){
      let payload={};try{payload=await request.clone().json()}catch{}
      const response=await app.fetch(request,env,ctx);if(!response.ok)return response;
      let data={};try{data=await response.clone().json()}catch{return response}
      const email=cleanEmail(data.email||payload.email);
      if(email){
        const marker=await env.DB.prepare('SELECT reset_at FROM rpp_author_resets WHERE email=?').bind(email).first().catch(()=>null);
        if(marker?.reset_at){
          data.accountResetAt=marker.reset_at;
          await env.DB.prepare('DELETE FROM rpp_author_resets WHERE email=?').bind(email).run().catch(()=>{});
          const headers=new Headers(response.headers);headers.set('Content-Type','application/json; charset=utf-8');headers.set('Cache-Control','no-store');
          return new Response(JSON.stringify(data),{status:response.status,statusText:response.statusText,headers});
        }
      }
      return response;
    }

    const response=await app.fetch(request,env,ctx),type=response.headers.get('content-type')||'';
    if(type.includes('text/html')&&['/admin','/admin.html'].includes(path))return inject(response,ADMIN_RESET_UI);
    if(type.includes('text/html')&&['/author','/author.html'].includes(path))return inject(response,AUTHOR_RESET_CLIENT);
    return response;
  }
};
