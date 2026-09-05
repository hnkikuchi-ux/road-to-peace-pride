import app from './faithful-cover-v11-r3.js';

const V11_R4 = `
<style>
/* faithful v11-r4 — compact Art Deco lock + balanced double frame */

/* Keep the gate card visually even on every side. */
#rppFaithfulV7 .v7-panel{
  box-sizing:border-box!important;
  border:1.45px solid rgba(231,187,79,.96)!important;
  border-radius:2px!important;
  background:linear-gradient(180deg,rgba(2,20,46,.925),rgba(1,10,27,.978))!important;
  box-shadow:inset 0 0 0 1px rgba(255,231,151,.055),0 17px 42px rgba(0,0,0,.30)!important;
}
#rppFaithfulV7 .v7-panel:before{
  content:''!important;
  position:absolute!important;
  inset:clamp(7px,2vw,9px)!important;
  box-sizing:border-box!important;
  border:1px solid rgba(235,195,99,.52)!important;
  border-radius:1px!important;
  clip-path:none!important;
  pointer-events:none!important;
}
#rppFaithfulV7 .v7-panel:after{display:none!important}

/* Four identical Art Deco corner marks, anchored to the panel itself. */
#rppFaithfulV7 .v11-corners{
  inset:auto!important;
  left:6.5%!important;right:6.5%!important;
  top:63.6%!important;bottom:13.2%!important;
  pointer-events:none!important;z-index:7!important;
}
#rppFaithfulV7 .v11-corners i{
  width:clamp(15px,4.4vw,20px)!important;
  height:clamp(15px,4.4vw,20px)!important;
  aspect-ratio:auto!important;
  opacity:.88!important;
}
#rppFaithfulV7 .v11-corners i:before,
#rppFaithfulV7 .v11-corners i:after{
  content:''!important;
  position:absolute!important;
  border-style:solid!important;
  border-color:#e7b34b!important;
}
#rppFaithfulV7 .v11-corners i:before{
  inset:0!important;
  border-width:1px 0 0 1px!important;
}
#rppFaithfulV7 .v11-corners i:after{
  inset:5px!important;
  border-width:1px 0 0 1px!important;
  border-color:#f1cf78!important;
}
#rppFaithfulV7 .v11-corners .tl{left:0!important;top:0!important;right:auto!important;bottom:auto!important;transform:none!important}
#rppFaithfulV7 .v11-corners .tr{right:0!important;top:0!important;left:auto!important;bottom:auto!important;transform:rotate(90deg)!important}
#rppFaithfulV7 .v11-corners .br{right:0!important;bottom:0!important;left:auto!important;top:auto!important;transform:rotate(180deg)!important}
#rppFaithfulV7 .v11-corners .bl{left:0!important;bottom:0!important;right:auto!important;top:auto!important;transform:rotate(270deg)!important}

/* Smaller generated lock with clear breathing room inside the password field. */
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #pw{
  padding-left:11.5%!important;
}
#rppFaithfulV7 .v7-lock{
  left:18.15%!important;
  top:67.15%!important;
  width:5.10%!important;
  height:4.05%!important;
  aspect-ratio:auto!important;
  background:url('/assets/lock-artdeco-v11-r3.svg?v=11r4') center/contain no-repeat!important;
  filter:drop-shadow(0 1px 2px rgba(0,0,0,.42)) drop-shadow(0 0 5px rgba(239,184,54,.28))!important;
}
#rppFaithfulV7 .v7-lock svg{display:none!important}

@media(max-width:380px){
  #rppFaithfulV7 .v11-corners{left:6.1%!important;right:6.1%!important}
  html body.rpp-faithful-v7 #gate #rppFaithfulV7 #pw{padding-left:11.8%!important}
  #rppFaithfulV7 .v7-lock{
    left:17.75%!important;
    top:67.16%!important;
    width:5.25%!important;
    height:4.08%!important;
  }
}
</style>
<script>
(()=>{
  const mark=()=>{
    const card=document.querySelector('#gate .gate-card');
    const lock=document.querySelector('#rppFaithfulV7 .v7-lock');
    const panel=document.querySelector('#rppFaithfulV7 .v7-panel');
    if(!card||!lock||!panel)return false;
    card.dataset.v11Lock='artdeco-compact-r4';
    card.dataset.v11Frame='uniform-double-frame';
    card.dataset.v11Revision='r4';
    return true;
  };
  const retry=()=>{if(mark())return;setTimeout(retry,90)};
  retry();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',retry,{once:true});
  setTimeout(mark,240);setTimeout(mark,620);
})();
</script>`;

const PRODUCT_FLOW = `
<style>
/* 2026-09-05: merged home/contents + persistent edit-code flow */
body.rpp-merged-home #cover:not(.hidden){margin-bottom:0!important}
body.rpp-merged-home #toc:not(.hidden){
  display:block!important;
  min-height:auto!important;
  margin-top:0!important;
  padding-top:clamp(28px,7vw,54px)!important;
  padding-bottom:clamp(60px,12vw,100px)!important;
  border-top:1px solid rgba(231,187,79,.45)!important;
  background:linear-gradient(180deg,rgba(4,17,42,.25),rgba(2,10,27,.72))!important;
  box-shadow:inset 0 18px 42px rgba(0,0,0,.16)!important;
}
body.rpp-merged-home #homeBtn{display:none!important}
body.rpp-merged-home #tocBtn{letter-spacing:.12em!important}
.rpp-author-guide{margin:14px 0 18px;padding:14px;border:1px solid rgba(216,184,102,.42);background:rgba(216,184,102,.075);font-size:12px;line-height:1.8;color:#efe5c8}
.rpp-auth-tabs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:14px 0}
.rpp-auth-tab{min-height:42px;border:1px solid rgba(216,184,102,.38);border-radius:8px;background:rgba(255,255,255,.035);color:#e9dfc1;font-size:12px;font-weight:700;cursor:pointer}
.rpp-auth-tab.active{background:linear-gradient(135deg,#b88e3c,#efd98d);color:#1b1305;border-color:transparent}
#rppEditLogin{margin-top:10px}
#rppEditLogin .rpp-code-note{font-size:11px;line-height:1.7;color:#aeb5c5;margin-top:9px}
.rpp-edit-code-card{margin:0 0 14px;padding:18px;border:1px solid rgba(239,217,141,.74);background:linear-gradient(145deg,rgba(30,38,74,.96),rgba(7,19,43,.97));box-shadow:0 16px 44px rgba(0,0,0,.25),inset 0 0 0 1px rgba(255,255,255,.035);text-align:center}
.rpp-edit-code-card .rpp-kicker{font-size:10px;letter-spacing:.22em;color:#efd98d;font-weight:800}
.rpp-edit-code-card h2{font-family:ui-serif,"Yu Mincho",serif;font-weight:500;margin:8px 0 5px;font-size:20px}
.rpp-edit-code-value{font-variant-numeric:tabular-nums;letter-spacing:.22em;font-size:clamp(28px,8vw,40px);font-weight:800;color:#f3dda1;margin:12px 0 10px}
.rpp-edit-code-card p{font-size:12px;line-height:1.8;color:#d7d3c8;margin:7px auto;max-width:520px}
.rpp-edit-code-card button{margin-top:8px;min-width:180px}
@media(max-width:420px){.rpp-auth-tabs{grid-template-columns:1fr}.rpp-edit-code-value{letter-spacing:.14em}}
</style>
<script>
(()=>{
  const ready=(fn)=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
  ready(()=>{
    const cover=document.getElementById('cover'),toc=document.getElementById('toc');
    if(cover&&toc){
      document.body.classList.add('rpp-merged-home');
      const homeBtn=document.getElementById('homeBtn');if(homeBtn)homeBtn.setAttribute('aria-hidden','true');
      const tocBtn=document.getElementById('tocBtn');if(tocBtn)tocBtn.textContent='STORIES ↓';
      const sync=()=>{
        if(!cover.classList.contains('hidden')){
          toc.classList.remove('hidden');
          try{if(typeof window.renderToc==='function')window.renderToc()}catch(e){}
        }
      };
      sync();
      const gate=document.getElementById('gate');
      const obs=new MutationObserver(()=>setTimeout(sync,0));
      obs.observe(cover,{attributes:true,attributeFilter:['class']});
      if(gate)obs.observe(gate,{attributes:true,attributeFilter:['class']});
      const unlock=document.getElementById('unlock');if(unlock)unlock.addEventListener('click',()=>{setTimeout(sync,120);setTimeout(sync,700)});
      if(tocBtn)tocBtn.addEventListener('click',()=>setTimeout(()=>{cover.classList.remove('hidden');toc.classList.remove('hidden');toc.scrollIntoView({behavior:'smooth',block:'start'})},0));
    }

    const auth=document.getElementById('auth'),editor=document.getElementById('editor');
    if(!auth||!editor)return;
    const note=auth.querySelector('.note');
    if(note)note.textContent='初回はメールに届く6桁コードで本人確認します。認証後に「編集用承認コード」を発行します。提出後の再編集に必要なため、必ず保存してください。';
    const h1=auth.querySelector('h1');
    const guide=document.createElement('div');
    guide.className='rpp-author-guide';
    guide.innerHTML='<b>🔑 編集用承認コードについて</b><br>メール認証が完了すると、あなた専用の編集用承認コードが表示されます。提出後に原稿を編集するときに必要です。スクリーンショットやメモで必ず保存してください。';
    if(h1)h1.insertAdjacentElement('afterend',guide);

    const tabs=document.createElement('div');
    tabs.className='rpp-auth-tabs';
    tabs.innerHTML='<button type="button" id="rppFirstTab" class="rpp-auth-tab active">初めて原稿を書く</button><button type="button" id="rppEditTab" class="rpp-auth-tab">以前の原稿を編集する</button>';
    guide.insertAdjacentElement('afterend',tabs);
    const editBox=document.createElement('div');
    editBox.id='rppEditLogin';editBox.className='hidden';
    editBox.innerHTML='<div class="field"><label>編集用承認コード（8桁）</label><input id="rppEditCode" inputmode="numeric" autocomplete="one-time-code" maxlength="8" placeholder="8桁の編集用承認コード"></div><button type="button" id="rppEditLoginBtn" class="btn primary">承認コードで編集する</button><div id="rppEditMsg" class="note"></div><button type="button" id="rppForgotCode" class="btn secondary" style="margin-top:9px;width:100%">承認コードを忘れた方</button><div class="rpp-code-note">紛失した場合は、登録したメールアドレスに届く本人確認コードで再発行できます。</div>';
    const authmsg=document.getElementById('authmsg');
    if(authmsg)authmsg.insertAdjacentElement('beforebegin',editBox); else auth.appendChild(editBox);
    const send=document.getElementById('send'),otpbox=document.getElementById('otpbox');
    const firstTab=document.getElementById('rppFirstTab'),editTab=document.getElementById('rppEditTab');
    const setMode=(mode)=>{
      const edit=mode==='edit';
      firstTab.classList.toggle('active',!edit);editTab.classList.toggle('active',edit);
      editBox.classList.toggle('hidden',!edit);
      if(send)send.classList.toggle('hidden',edit);
      if(otpbox)otpbox.classList.add('hidden');
      if(authmsg)authmsg.textContent=edit?'メールアドレスと、保存している編集用承認コードを入力してください。':'';
    };
    firstTab.onclick=()=>setMode('first');editTab.onclick=()=>setMode('edit');

    const showEditCode=(code,reset)=>{
      if(!code)return;
      sessionStorage.setItem('rpp_latest_edit_code',code);
      let card=document.getElementById('rppEditCodeCard');
      if(!card){card=document.createElement('div');card.id='rppEditCodeCard';card.className='rpp-edit-code-card';editor.insertAdjacentElement('afterbegin',card)}
      const shown=String(code).replace(/(\d{4})(\d{4})/,'$1 $2');
      card.innerHTML='<div class="rpp-kicker">YOUR EDIT CODE</div><h2>'+(reset?'新しい編集用承認コード':'あなたの編集用承認コード')+'</h2><div class="rpp-edit-code-value">'+shown+'</div><p><b>このコードは、提出後に原稿を編集するときに必要です。</b><br>必ずスクリーンショットまたはメモで保存してください。</p><p>紛失した場合は、登録メールアドレスで本人確認して再発行できます。</p><button type="button" id="rppCopyEditCode" class="btn secondary">承認コードをコピー</button><div id="rppCopyState" class="note"></div>';
      const copy=card.querySelector('#rppCopyEditCode');
      if(copy)copy.onclick=async()=>{try{await navigator.clipboard.writeText(String(code));card.querySelector('#rppCopyState').textContent='コピーしました。安全な場所に保存してください。'}catch(e){card.querySelector('#rppCopyState').textContent='コピーできない場合は、スクリーンショットまたはメモで保存してください。'}};
    };
    const cached=sessionStorage.getItem('rpp_latest_edit_code');if(cached)showEditCode(cached,false);

    const nativeFetch=window.fetch.bind(window);
    window.fetch=async(input,init)=>{
      const u=typeof input==='string'?input:(input&&input.url)||'';
      let nextInit=init;
      if(u.includes('/api/auth/verify')&&init&&init.body){
        try{const body=JSON.parse(init.body);if(sessionStorage.getItem('rpp_reset_edit_code')==='1')body.resetEditCode=true;nextInit={...init,body:JSON.stringify(body)}}catch(e){}
      }
      const response=await nativeFetch(input,nextInit);
      if(u.includes('/api/auth/verify')){
        try{const d=await response.clone().json();if(response.ok&&d.editCode){showEditCode(d.editCode,!!d.editCodeReset);sessionStorage.removeItem('rpp_reset_edit_code')}}catch(e){}
      }
      return response;
    };

    const loginBtn=document.getElementById('rppEditLoginBtn');
    if(loginBtn)loginBtn.onclick=async()=>{
      const email=(document.getElementById('email')?.value||'').trim().toLowerCase();
      const code=(document.getElementById('rppEditCode')?.value||'').replace(/\D/g,'');
      const msg=document.getElementById('rppEditMsg');
      if(!email||code.length!==8){if(msg)msg.textContent='メールアドレスと8桁の編集用承認コードを入力してください。';return}
      loginBtn.disabled=true;
      try{
        const r=await nativeFetch('/api/edit-code/login',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({email,code})});
        const d=await r.json();
        if(!r.ok){if(msg)msg.textContent=d.error||'承認コードを確認してください。';return}
        if(msg)msg.textContent='認証しました。原稿を開きます。';location.reload();
      }catch(e){if(msg)msg.textContent='通信できませんでした。'}finally{loginBtn.disabled=false}
    };
    const forgot=document.getElementById('rppForgotCode');
    if(forgot)forgot.onclick=()=>{sessionStorage.setItem('rpp_reset_edit_code','1');setMode('first');if(authmsg)authmsg.textContent='登録メールアドレスに6桁の本人確認コードを送信してください。認証後、新しい編集用承認コードを発行します。'};
    const logout=document.getElementById('logout');if(logout)logout.addEventListener('click',()=>sessionStorage.removeItem('rpp_latest_edit_code'),{capture:true});
  });
})();
</script>`;

const editEnc=new TextEncoder();
let editSchemaReady;
function editJson(data,status=200,headers={}){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}})}
function editEmail(v){return String(v||'').trim().toLowerCase()}
function editRandomHex(bytes=32){const b=new Uint8Array(bytes);crypto.getRandomValues(b);return Array.from(b,x=>x.toString(16).padStart(2,'0')).join('')}
function editRandomCode(){const b=new Uint8Array(8);crypto.getRandomValues(b);return Array.from(b,x=>String(x%10)).join('')}
async function editSha(v){const b=await crypto.subtle.digest('SHA-256',editEnc.encode(String(v)));return Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('')}
function editSessionCookie(token,maxAge=43200){return `rpp_author=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`}
function editPepper(env){return String(env.EDIT_CODE_PEPPER||env.OTP_PEPPER||env.SETUP_KEY||'')}
async function ensureEditSchema(env){
  if(!editSchemaReady)editSchemaReady=env.DB.exec(`
    CREATE TABLE IF NOT EXISTS rpp_sessions(token_hash TEXT PRIMARY KEY,kind TEXT NOT NULL,subject TEXT,expires_at TEXT NOT NULL,created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS rpp_edit_codes(email TEXT PRIMARY KEY,code_hash TEXT NOT NULL,salt TEXT NOT NULL,attempts INTEGER NOT NULL DEFAULT 0,locked_until TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
  `);
  return editSchemaReady;
}
async function createAuthorSession(env,email,maxAge=43200){
  const token=editRandomHex(32),hash=await editSha(token),now=new Date(),expires=new Date(now.getTime()+maxAge*1000).toISOString();
  await env.DB.prepare('INSERT INTO rpp_sessions(token_hash,kind,subject,expires_at,created_at) VALUES(?,?,?,?,?)').bind(hash,'author',email,expires,now.toISOString()).run();
  return token;
}
async function issueEditCode(env,email,reset=false){
  await ensureEditSchema(env);const pepper=editPepper(env);if(!pepper)throw new Error('EDIT_CODE_SECRET_MISSING');
  const code=editRandomCode(),salt=editRandomHex(16),hash=await editSha(`${email}:${salt}:${code}:${pepper}`),now=new Date().toISOString();
  await env.DB.prepare('INSERT INTO rpp_edit_codes(email,code_hash,salt,attempts,locked_until,created_at,updated_at) VALUES(?,?,?,0,NULL,?,?) ON CONFLICT(email) DO UPDATE SET code_hash=excluded.code_hash,salt=excluded.salt,attempts=0,locked_until=NULL,updated_at=excluded.updated_at').bind(email,hash,salt,now,now).run();
  return {code,reset};
}
async function handleVerify(request,env,ctx){
  let payload={};try{payload=await request.clone().json()}catch(e){}
  const response=await app.fetch(request,env,ctx);if(!response.ok)return response;
  let data={};try{data=await response.clone().json()}catch(e){return response}
  const email=editEmail(data.email||payload.email);if(!email)return response;
  try{
    await ensureEditSchema(env);
    const existing=await env.DB.prepare('SELECT email FROM rpp_edit_codes WHERE email=?').bind(email).first();
    let issued=null;
    if(!existing||payload.resetEditCode===true)issued=await issueEditCode(env,email,Boolean(existing&&payload.resetEditCode===true));
    const headers=new Headers(response.headers);
    const setCookie=headers.get('Set-Cookie');if(setCookie&&/rpp_author=/i.test(setCookie))headers.set('Set-Cookie',setCookie.replace(/Max-Age=\d+/i,'Max-Age=43200'));
    headers.set('Content-Type','application/json; charset=utf-8');headers.set('Cache-Control','no-store');
    return new Response(JSON.stringify({...data,...(issued?{editCode:issued.code,editCodeCreated:!issued.reset,editCodeReset:issued.reset}:{})}),{status:response.status,headers});
  }catch(e){
    if(String(e&&e.message)==='EDIT_CODE_SECRET_MISSING')return editJson({error:'編集用承認コードの保護キーが未設定です。管理者にご連絡ください。'},503);
    return editJson({error:'編集用承認コードを発行できませんでした。'},500);
  }
}
async function handleEditLogin(request,env){
  await ensureEditSchema(env);const pepper=editPepper(env);if(!pepper)return editJson({error:'編集用承認コードの保護キーが未設定です。'},503);
  const b=await request.json().catch(()=>({})),email=editEmail(b.email),code=String(b.code||'').replace(/\D/g,'');
  if(!/^\S+@\S+\.\S+$/.test(email)||code.length!==8)return editJson({error:'メールアドレスと8桁の編集用承認コードを確認してください。'},400);
  const row=await env.DB.prepare('SELECT * FROM rpp_edit_codes WHERE email=?').bind(email).first();
  if(!row)return editJson({error:'編集用承認コードがまだ発行されていません。まずメール認証を行ってください。'},404);
  if(row.locked_until&&Date.parse(row.locked_until)>Date.now())return editJson({error:'認証試行が続いたため一時的にロックしています。15分ほど待ってからお試しください。'},429);
  const got=await editSha(`${email}:${row.salt}:${code}:${pepper}`);
  if(got!==row.code_hash){
    let attempts=Number(row.attempts||0)+1,locked=null;
    if(attempts>=8){attempts=0;locked=new Date(Date.now()+15*60*1000).toISOString()}
    await env.DB.prepare('UPDATE rpp_edit_codes SET attempts=?,locked_until=?,updated_at=? WHERE email=?').bind(attempts,locked,new Date().toISOString(),email).run();
    return editJson({error:locked?'認証試行が続いたため15分間ロックしました。':'編集用承認コードを確認してください。'},locked?429:401);
  }
  await env.DB.prepare('UPDATE rpp_edit_codes SET attempts=0,locked_until=NULL,updated_at=? WHERE email=?').bind(new Date().toISOString(),email).run();
  const token=await createAuthorSession(env,email,43200);
  return editJson({ok:true,email},200,{'Set-Cookie':editSessionCookie(token,43200)});
}

function apply(response,markup){return new HTMLRewriter().on('body',{element(el){el.append(markup,{html:true})}}).transform(response)}

export default {
  async fetch(request,env,ctx){
    const url=new URL(request.url);
    if(url.pathname==='/api/auth/verify'&&request.method==='POST')return handleVerify(request,env,ctx);
    if(url.pathname==='/api/edit-code/login'&&request.method==='POST')return handleEditLogin(request,env);
    const response=await app.fetch(request,env,ctx);
    const type=response.headers.get('content-type')||'';
    if(type.includes('text/html')&&['/','/index.html','/refresh','/latest'].includes(url.pathname))return apply(response,V11_R4+PRODUCT_FLOW);
    if(type.includes('text/html')&&['/author','/author.html'].includes(url.pathname))return apply(response,PRODUCT_FLOW);
    return response;
  }
};
