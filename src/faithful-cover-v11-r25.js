import app from './faithful-cover-v11-r19.js';

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
  if(!editSchemaReady)editSchemaReady=env.DB.exec(`
    CREATE TABLE IF NOT EXISTS rpp_edit_codes(
      email TEXT PRIMARY KEY,
      code_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      locked_until TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  return editSchemaReady;
}
async function storeOtpAsEditCode(env,email,code){
  await ensureEditSchema(env);
  const p=editPepper(env);if(!p)throw new Error('EDIT_CODE_SECRET_MISSING');
  const normalized=digits(code);if(normalized.length!==6)throw new Error('EDIT_CODE_INVALID');
  const salt=randomHex(16),hash=await sha256(`${email}:${salt}:${normalized}:${p}`),now=new Date().toISOString();
  await env.DB.prepare('INSERT INTO rpp_edit_codes(email,code_hash,salt,attempts,locked_until,created_at,updated_at) VALUES(?,?,?,0,NULL,?,?) ON CONFLICT(email) DO UPDATE SET code_hash=excluded.code_hash,salt=excluded.salt,attempts=0,locked_until=NULL,updated_at=excluded.updated_at')
    .bind(email,hash,salt,now,now).run();
  return normalized;
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
async function tableExists(env,name){
  const row=await env.DB.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").bind(name).first().catch(()=>null);
  return Boolean(row?.name);
}
async function adminSession(env,request){
  const token=cookieMap(request).rpp_admin;if(!token)return null;
  return env.DB.prepare("SELECT * FROM rpp_sessions WHERE token_hash=? AND kind='admin' AND expires_at>?")
    .bind(await sha256(token),new Date().toISOString()).first();
}
async function deleteIfPresent(env,table,sql,email){
  if(!await tableExists(env,table))return 0;
  const result=await env.DB.prepare(sql).bind(email).run();
  return Number(result?.meta?.changes||0);
}
async function resetAuthor(env,email){
  await ensureResetSchema(env);
  const hasStories=await tableExists(env,'rpp_stories');
  const hasRevisions=await tableExists(env,'rpp_story_revisions');
  const story=hasStories?await env.DB.prepare('SELECT id,photo_key FROM rpp_stories WHERE author_email=?').bind(email).first().catch(()=>null):null;
  const revisions=hasRevisions?((await env.DB.prepare('SELECT photo_key FROM rpp_story_revisions WHERE author_email=?').bind(email).all().catch(()=>({results:[]}))).results||[]):[];
  const photoKeys=new Set();if(story?.photo_key)photoKeys.add(String(story.photo_key));for(const r of revisions)if(r?.photo_key)photoKeys.add(String(r.photo_key));
  let deletedPhotos=0;if(env.MEDIA){for(const key of photoKeys){try{await env.MEDIA.delete(key);deletedPhotos++}catch(e){console.error('r25 photo cleanup failed',key,e)}}}
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

const AUTHOR_STYLE=`<style>
/* r25 — iPhone Safari / LINE WebView hardened author UI */
html.rpp-ios body{min-height:100dvh}
html.rpp-ios .wrap{padding-bottom:calc(96px + env(safe-area-inset-bottom,0px))!important}
html.rpp-ios button,html.rpp-ios .btn,html.rpp-ios .pill,html.rpp-line button,html.rpp-line .btn,html.rpp-line .pill{-webkit-appearance:none;appearance:none;touch-action:manipulation;-webkit-tap-highlight-color:rgba(216,184,102,.20)}
html.rpp-ios input,html.rpp-ios textarea,html.rpp-ios select,html.rpp-line input,html.rpp-line textarea,html.rpp-line select{font-size:16px!important}
html.rpp-ios textarea,html.rpp-line textarea{-webkit-overflow-scrolling:touch}
#rppSubmittedNotice{display:none;margin:0 0 16px;padding:15px 16px;border:1px solid rgba(216,184,102,.46);border-left:4px solid #d8b866;background:linear-gradient(90deg,rgba(216,184,102,.12),rgba(216,184,102,.045));color:#eee4c9;font-size:12px;line-height:1.8}
#rppSubmittedNotice.rpp-show{display:block}
#rppSubmittedNotice b{display:block;margin-bottom:3px;color:#efd98d;font-size:14px;letter-spacing:.03em}
#rppSubmittedNotice .rpp-submitted-help{color:#cbd0da}
body.rpp-author-r5 #statusBadge.rpp-submitted-badge{color:#f4dc97;border-color:rgba(239,217,141,.62);background:rgba(216,184,102,.10)}
@media(max-width:560px){#rppSubmittedNotice{margin:0 0 14px;padding:13px 14px;font-size:11px}#rppSubmittedNotice b{font-size:13px}.btn,.pill,button{min-height:46px}}
</style>`;

const AUTHOR_SCRIPT=`<script>
(()=>{
  const setText=(el,text)=>{if(el&&el.textContent!==text)el.textContent=text};
  const setHtml=(el,html)=>{if(el&&el.innerHTML!==html)el.innerHTML=html};
  function oneCodePatch(){
    document.documentElement.dataset.rppOneCode='r25';
    if(document.title!=='私の記録を綴る | ROAD TO PEACE PRIDE')document.title='私の記録を綴る | ROAD TO PEACE PRIDE';
    const guide=document.querySelector('.rpp-author-guide');
    setHtml(guide,'<b>🔑 6桁コードについて</b><br>初回のメール認証で届く6桁コードを、そのまま提出後の再編集にも使用します。スクリーンショットまたはメモで保存してください。');
    setText(document.querySelector('#auth > .note'),'初回はメールに届く6桁コードで本人確認します。この同じ6桁コードを、提出後の再編集にも使用します。');
    const edit=document.getElementById('rppEditCode');if(edit){edit.maxLength=6;edit.placeholder='6桁コード';edit.setAttribute('inputmode','numeric');setText(edit.closest('.field')?.querySelector('label'),'6桁コード')}
    setText(document.getElementById('rppEditLoginBtn'),'6桁コードで編集する');
    setText(document.querySelector('#rppEditLogin .rpp-code-note'),'初回のメール認証で使用した6桁コードを入力してください。紛失した場合は、メール認証で新しい6桁コードを再発行できます。');
    const card=document.getElementById('rppEditCodeCard');if(card){setText(card.querySelector('h2'),'あなたの6桁コード');setText(card.querySelector('.rpp-code-saved-badge'),'再編集にも使う6桁コードです');setText(card.querySelector('#rppCopyEditCode'),'6桁コードをコピー')}
    const cp=document.getElementById('rppCodeCheckpoint');if(cp){setText(cp.querySelector('.rpp-checkpoint-kicker'),'YOUR 6-DIGIT KEY');setText(cp.querySelector('#rppCheckpointTitle'),'メールで届いた6桁コードを保存してください');setText(cp.querySelector('.rpp-checkpoint-lead'),'本人確認で使用した同じ6桁コードです。このコードが、あとから原稿を編集するための「鍵」になります。');setText(cp.querySelector('#rppCheckpointCopy'),'6桁コードをコピー');setHtml(cp.querySelector('.rpp-saved-check span'),'<b>スクリーンショットまたはメモで保存しました</b><br>次回編集するときも、この同じ6桁コードを使用します。');setText(cp.querySelector('.rpp-checkpoint-foot'),'紛失した場合は、登録メールアドレスへの本人確認で新しい6桁コードを再発行できます。');}
  }
  function mountSubmitted(){
    const panel=document.getElementById('editor')?.querySelector('.panel'),row=panel?.querySelector('.save-row');if(!panel||!row)return;
    if(!document.getElementById('rppSubmittedNotice')){const n=document.createElement('div');n.id='rppSubmittedNotice';n.dataset.r25='submitted-editing-notice';n.innerHTML='<b>提出済みの原稿です。内容を変更して再提出できます。</b><span class="rpp-submitted-help">修正後、「変更内容を再提出する」を押すと、原稿が更新されます。</span>';row.insertAdjacentElement('afterend',n)}
  }
  function syncSubmitted(){
    mountSubmitted();const badge=document.getElementById('statusBadge'),notice=document.getElementById('rppSubmittedNotice');if(!badge||!notice)return;
    const submitted=String(badge.textContent||'').trim().includes('提出済');notice.classList.toggle('rpp-show',submitted);badge.classList.toggle('rpp-submitted-badge',submitted);
    if(submitted&&badge.textContent.trim()!=='提出済')badge.textContent='提出済';const submit=document.getElementById('submit'),label=submitted?'変更内容を再提出する':'この内容で提出する';if(submit&&submit.textContent!==label)submit.textContent=label;
    document.documentElement.dataset.rppStoryMode=submitted?'submitted-edit':'draft';
  }
  function refresh(){document.querySelectorAll('button').forEach(b=>{if(!b.getAttribute('type'))b.setAttribute('type','button')});oneCodePatch();mountSubmitted();syncSubmitted();}
  const nativeFetch=window.fetch.bind(window);
  window.fetch=async(input,init)=>{
    const response=await nativeFetch(input,init);const url=typeof input==='string'?input:(input?.url||'');
    if(url.includes('/api/auth/verify')){try{const d=await response.clone().json();if(d?.accountResetAt&&d?.email){const e=String(d.email).trim().toLowerCase();try{localStorage.removeItem('rpp_draft_'+e)}catch{};try{sessionStorage.removeItem('rpp_latest_edit_code')}catch{};document.documentElement.dataset.rppCleanReregister='1'}}catch{};setTimeout(refresh,0);setTimeout(refresh,100);setTimeout(refresh,350)}
    if(url.includes('/api/me/story')){setTimeout(syncSubmitted,0);setTimeout(syncSubmitted,180)}
    return response;
  };
  document.addEventListener('click',e=>{if(e.target?.closest?.('#save,#submit,#submitPreview,#rppCheckpointContinue,#rppEditLoginBtn')){setTimeout(refresh,0);setTimeout(refresh,220);setTimeout(refresh,700)}},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh,{once:true});else refresh();
  addEventListener('pageshow',refresh);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});setTimeout(refresh,180);setTimeout(refresh,700);
})();
</script>`;

const ADMIN_RESET_UI=`<style>
#rppAuthorResetPanel .rpp-reset-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:end}
#rppAuthorResetPanel .rpp-danger{border-color:rgba(230,130,105,.62);color:#ffd7cc;background:rgba(180,62,35,.13)}
@media(max-width:640px){#rppAuthorResetPanel .rpp-reset-row{grid-template-columns:1fr}#rppAuthorResetPanel .rpp-danger{width:100%;min-height:46px}}
</style><script>
(()=>{function mount(){if(document.getElementById('rppAuthorResetPanel'))return;const heading=[...document.querySelectorAll('h2')].find(x=>x.textContent.includes('AUTHORS｜投稿者一覧'));const authors=heading?.closest('.panel');if(!authors)return;const panel=document.createElement('div');panel.className='panel';panel.id='rppAuthorResetPanel';panel.innerHTML='<div class="ey">AUTHOR RESET</div><h2>投稿者登録をリセット</h2><p class="note">テスト登録をやり直す場合に使用します。原稿・6桁コード・メール認証・ログイン状態・編集履歴・関連写真を削除し、同じメールアドレスで初回登録からやり直せます。</p><div class="rpp-reset-row"><div class="field" style="margin:0"><label>削除するメールアドレス</label><input id="rppResetEmail" class="input" type="email" autocomplete="off" placeholder="example@email.com"></div><button id="rppResetBtn" class="pill rpp-danger">登録を完全削除</button></div><div id="rppResetMsg" class="msg"></div>';authors.parentNode.insertBefore(panel,authors);const btn=panel.querySelector('#rppResetBtn'),input=panel.querySelector('#rppResetEmail'),msg=panel.querySelector('#rppResetMsg');btn.onclick=async()=>{const email=(input.value||'').trim().toLowerCase();if(!/^\\S+@\\S+\\.\\S+$/.test(email)){msg.textContent='メールアドレスを確認してください。';msg.className='msg warn';return}if(!confirm(email+' の登録データを完全に削除します。\\n同じメールアドレスで初回登録からやり直せます。よろしいですか？'))return;btn.disabled=true;msg.textContent='削除中…';msg.className='msg';try{const r=await fetch('/api/admin/author-reset',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({email})});const d=await r.json();if(!r.ok)throw new Error(d.error||('HTTP '+r.status));input.value='';msg.textContent=email+' の登録を削除しました。初回登録からやり直せます。';msg.className='msg ok';document.getElementById('refresh')?.click()}catch(e){msg.textContent='削除できませんでした：'+e.message;msg.className='msg warn'}finally{btn.disabled=false}}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();setTimeout(mount,180);setTimeout(mount,700)})();
</script>`;

const PUBLIC_HEAD=`<meta property="og:title" content="ROAD TO PEACE PRIDE | MEMORIAL COLLECTION 2026"><meta property="og:description" content="9.12までの挑戦と誓いの記録"><meta property="og:type" content="website"><meta property="og:url" content="https://road-to-peace-pride.hn-kikuchi.workers.dev/"><meta name="format-detection" content="telephone=no"><meta name="apple-mobile-web-app-capable" content="yes"><style>
/* r25 — periodic shooting stars, CSS-only and non-interactive */
#rppFaithfulV7 .v11-stars{display:none!important}
#gate{position:relative!important;overflow:hidden!important}
#rppR25MeteorSky{position:absolute;inset:0;z-index:1;overflow:hidden;pointer-events:none;contain:layout paint}
#gate>*:not(#rppR25MeteorSky){position:relative;z-index:2}
#rppR25MeteorSky i{position:absolute;width:clamp(100px,34vw,230px);height:1px;opacity:0;will-change:transform,opacity;background:linear-gradient(90deg,transparent 0%,rgba(255,220,118,.08) 30%,rgba(255,235,169,.80) 82%,#fff9dc 100%);filter:drop-shadow(0 0 5px rgba(255,211,94,.68));transform-origin:right center}
#rppR25MeteorSky i:after{content:'';position:absolute;right:-2px;top:50%;width:4px;height:4px;border-radius:50%;transform:translateY(-50%);background:#fff8d2;box-shadow:0 0 6px #fff3b5,0 0 12px rgba(255,202,73,.9)}
#rppR25MeteorSky .m1{top:11%;left:-38vw;animation:r25ShootA 8.8s linear infinite .4s}
#rppR25MeteorSky .m2{top:24%;left:-42vw;animation:r25ShootA 11.4s linear infinite 3.2s}
#rppR25MeteorSky .m3{top:16%;right:-40vw;animation:r25ShootB 9.9s linear infinite 1.9s}
#rppR25MeteorSky .m4{top:32%;right:-45vw;animation:r25ShootB 13.1s linear infinite 6.4s}
@keyframes r25ShootA{0%,68%{opacity:0;transform:translate3d(0,0,0) rotate(-24deg)}72%{opacity:.96}84%{opacity:.90}91%,100%{opacity:0;transform:translate3d(155vw,66vh,0) rotate(-24deg)}}
@keyframes r25ShootB{0%,70%{opacity:0;transform:translate3d(0,0,0) rotate(204deg)}74%{opacity:.96}85%{opacity:.90}92%,100%{opacity:0;transform:translate3d(-155vw,67vh,0) rotate(204deg)}}
@media(prefers-reduced-motion:reduce){#rppR25MeteorSky{display:none!important}}
</style>`;
const METEORS=`<div id="rppR25MeteorSky" aria-hidden="true"><i class="m1"></i><i class="m2"></i><i class="m3"></i><i class="m4"></i></div>`;

function addClass(el,name){const set=new Set(String(el.getAttribute('class')||'').split(/\s+/).filter(Boolean));set.add(name);el.setAttribute('class',[...set].join(' '))}
function withNoCache(response){const headers=new Headers(response.headers);headers.set('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');headers.delete('Content-Length');return new Response(response.body,{status:response.status,statusText:response.statusText,headers})}
function injectAuthor(response,ua){const ios=/iPhone|iPad|iPod/i.test(ua),line=/Line\/|LIFF/i.test(ua);return new HTMLRewriter().on('html',{element(el){el.setAttribute('data-rpp-mobile-compat','r25');el.setAttribute('data-rpp-client',line?'line':(ios?'ios':'web'));if(ios)addClass(el,'rpp-ios');if(line)addClass(el,'rpp-line')}}).on('head',{element(el){el.append(AUTHOR_STYLE,{html:true})}}).on('body',{element(el){el.append(AUTHOR_SCRIPT,{html:true})}}).transform(withNoCache(response))}
function injectAdmin(response){return new HTMLRewriter().on('body',{element(el){el.append(ADMIN_RESET_UI,{html:true})}}).transform(withNoCache(response))}
function injectPublic(response){return new HTMLRewriter().on('html',{element(el){el.setAttribute('data-rpp-release','r25')}}).on('head',{element(el){el.append(PUBLIC_HEAD,{html:true})}}).on('#gate',{element(el){el.setAttribute('data-r25-stars','periodic');el.prepend(METEORS,{html:true})}}).transform(withNoCache(response))}

export default{
  async fetch(request,env,ctx){
    const url=new URL(request.url),path=url.pathname.replace(/\/$/,'')||'/';
    if(path==='/api/admin/author-reset'&&request.method==='POST'){
      if(!await adminSession(env,request))return json({error:'管理者認証が必要です。'},401);
      const body=await request.json().catch(()=>({})),email=cleanEmail(body.email);if(!/^\S+@\S+\.\S+$/.test(email))return json({error:'メールアドレスを確認してください。'},400);
      try{return json(await resetAuthor(env,email))}catch(e){console.error('r25 author reset failed',e);return json({error:'投稿者登録を削除できませんでした。'},500)}
    }
    if(path==='/api/auth/verify'&&request.method==='POST'){
      await ensureResetSchema(env);let payload={};try{payload=await request.clone().json()}catch{}
      const response=await app.fetch(request,env,ctx);if(!response.ok)return response;
      let data={};try{data=await response.clone().json()}catch{return response}
      const email=cleanEmail(data.email||payload.email),code=digits(payload.code);
      if(/^\S+@\S+\.\S+$/.test(email)&&code.length===6){
        try{await storeOtpAsEditCode(env,email,code);data.editCode=code;data.editCodeDigits=6;data.editCodePersistent=true;data.editCodeSameAsOtp=true;data.editCodeCreated=true;data.editCodeReset=Boolean(payload.resetEditCode===true)}catch(e){console.error('r25 one-code persistence failed',e);return json({error:'6桁コードを再編集用として保存できませんでした。もう一度認証してください。'},500)}
      }
      if(email){const marker=await env.DB.prepare('SELECT reset_at FROM rpp_author_resets WHERE email=?').bind(email).first().catch(()=>null);if(marker?.reset_at){data.accountResetAt=marker.reset_at;await env.DB.prepare('DELETE FROM rpp_author_resets WHERE email=?').bind(email).run().catch(()=>{})}}
      const headers=new Headers(response.headers);headers.set('Content-Type','application/json; charset=utf-8');headers.set('Cache-Control','no-store');return new Response(JSON.stringify(data),{status:response.status,statusText:response.statusText,headers});
    }
    const response=await app.fetch(request,env,ctx),type=response.headers.get('content-type')||'',ua=request.headers.get('user-agent')||'';
    if(!type.includes('text/html'))return response;
    if(['/author','/author.html'].includes(path))return injectAuthor(response,ua);
    if(['/admin','/admin.html'].includes(path))return injectAdmin(response);
    if(['/','/index.html','/refresh','/latest'].includes(path))return injectPublic(response);
    return response;
  }
};
