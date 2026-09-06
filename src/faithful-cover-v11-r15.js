import app from './faithful-cover-v11-r14.js';

const R15=`
<style>
/* r15 — independent author organization-detail + preview reliability patch */
.r15-legacy-org{display:none!important}
.rpp-org-detail-field{margin-top:10px!important}
.rpp-org-detail-field input{min-height:48px}
</style>
<script>
(()=>{
  function legacy(){
    return ['rppBunku','rppHonbu','rppShibu'].map(id=>document.getElementById(id));
  }
  function sync(){
    const detail=document.getElementById('rppOrgDetail');if(!detail)return;
    const [b,h,s]=legacy();
    if(b&&b.value!==detail.value){b.value=detail.value;b.dispatchEvent(new Event('input',{bubbles:true}))}
    if(h&&h.value)h.value='';
    if(s&&s.value)s.value='';
  }
  function patch(){
    const select=document.getElementById('rppOrgSelect');
    if(!select)return false;
    const host=select.closest('.field');
    if(!host)return false;
    let detail=document.getElementById('rppOrgDetail');
    if(!detail){
      const box=document.createElement('div');
      box.className='field rpp-org-detail-field';
      box.innerHTML='<label>分区／本部／部</label><input id="rppOrgDetail" maxlength="240" placeholder="分区／本部／部を入力">';
      const grid=host.querySelector('.r12-org-grid');
      if(grid)grid.insertAdjacentElement('afterend',box);else host.appendChild(box);
      detail=box.querySelector('#rppOrgDetail');
      detail.addEventListener('input',sync);
    }
    const [b,h,s]=legacy();
    [b,h,s].filter(Boolean).forEach(el=>{
      const f=el.closest('.field');
      if(f&&!f.classList.contains('r15-legacy-org'))f.classList.add('r15-legacy-org');
    });
    if(!detail.value){
      const vals=[b&&b.value,h&&h.value,s&&s.value].filter(v=>String(v||'').trim());
      if(vals.length)detail.value=vals.join('／');
    }
    if(detail.value)sync();
    return true;
  }
  function syncPreviewPhoto(){
    const modal=document.getElementById('storyPreview');
    const src=document.getElementById('photoPreview');
    const body=document.getElementById('pBody');
    if(!modal||!body)return false;
    let img=modal.querySelector('.r12-preview-photo');
    const ready=!!(src&&src.src&&!src.classList.contains('hidden'));
    if(!ready){if(img)img.remove();return false}
    if(!img){
      img=document.createElement('img');
      img.className='r12-preview-photo';
      img.alt='掲載写真';
      body.insertAdjacentElement('beforebegin',img);
    }
    if(img.src!==src.src)img.src=src.src;
    return true;
  }
  function schedulePreviewPhoto(){
    [0,40,120,300,700,1400].forEach(ms=>setTimeout(syncPreviewPhoto,ms));
  }
  function installPhotoSync(){
    const src=document.getElementById('photoPreview');
    if(src&&!src.dataset.r15PhotoObserved){
      src.dataset.r15PhotoObserved='1';
      src.addEventListener('load',schedulePreviewPhoto);
      new MutationObserver(schedulePreviewPhoto).observe(src,{attributes:true,attributeFilter:['src','class']});
    }
    const input=document.getElementById('photo');
    if(input&&!input.dataset.r15PhotoObserved){
      input.dataset.r15PhotoObserved='1';
      input.addEventListener('change',schedulePreviewPhoto);
    }
    syncPreviewPhoto();
  }
  function boot(){
    patch();installPhotoSync();
    let ticks=0;
    const timer=setInterval(()=>{patch();installPhotoSync();ticks++;if(ticks>=48)clearInterval(timer)},125);
    const editor=document.getElementById('editor');
    if(editor)new MutationObserver(()=>{patch();installPhotoSync()}).observe(editor,{childList:true,subtree:true});
    document.addEventListener('click',e=>{
      const btn=e.target&&e.target.closest?e.target.closest('button'):null;
      if(!btn)return;
      if(['save','previewBtn','submit','submitPreview'].includes(btn.id))sync();
      if(btn.id==='previewBtn')schedulePreviewPhoto();
    },true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
</script>`;

const enc=new TextEncoder();
function json(data,status=200,headers={}){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}})}
function cleanEmail(v){return String(v||'').trim().toLowerCase()}
function random6(){const b=new Uint32Array(1);crypto.getRandomValues(b);return String(b[0]%1000000).padStart(6,'0')}
async function sha256(v){const b=await crypto.subtle.digest('SHA-256',enc.encode(String(v)));return Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('')}
function inject(response){return new HTMLRewriter().on('body',{element(el){el.append(R15,{html:true})}}).transform(response)}
async function nativeSender(env){
  let email=cleanEmail(env.EMAIL_FROM||env.OTP_SENDER_EMAIL||''),name=String(env.OTP_SENDER_NAME||'ROAD TO PEACE PRIDE').trim();
  try{
    const rows=(await env.DB.prepare("SELECT key,value FROM rpp_settings WHERE key IN ('otp_sender_email','otp_sender_name')").all()).results||[];
    const m=Object.fromEntries(rows.map(r=>[r.key,String(r.value||'').trim()]));
    if(!email)email=cleanEmail(m.otp_sender_email||'');
    if(!env.OTP_SENDER_NAME&&m.otp_sender_name)name=m.otp_sender_name;
  }catch{}
  return {email,name:name||'ROAD TO PEACE PRIDE'};
}
async function emailReady(env){
  const sender=await nativeSender(env);
  if(env.EMAIL&&sender.email)return true;
  if(env.BREVO_API_KEY&&env.OTP_SENDER_EMAIL)return true;
  try{
    const rows=(await env.DB.prepare("SELECT key,value FROM rpp_settings WHERE key IN ('brevo_api_key_enc','otp_sender_email')").all()).results||[];
    const m=Object.fromEntries(rows.map(r=>[r.key,String(r.value||'').trim()]));
    return Boolean(m.brevo_api_key_enc&&m.otp_sender_email);
  }catch{return false}
}
async function deadlinePassed(env){
  try{const row=await env.DB.prepare("SELECT value FROM rpp_settings WHERE key='submission_deadline'").first();const v=String(row?.value||'').trim();if(!v)return false;const t=Date.parse(v);return Number.isFinite(t)&&Date.now()>t}catch{return false}
}
async function sendNativeEmail(env,to,code){
  if(!env.EMAIL)return false;
  const sender=await nativeSender(env);if(!sender.email)return false;
  const subject='【ROAD TO PEACE PRIDE】認証コード';
  const text=`ROAD TO PEACE PRIDE 原稿投稿画面の認証コードは ${code} です。\nこのコードは10分間有効です。`;
  const html=`<div style="font-family:sans-serif;line-height:1.8"><p>原稿投稿画面の認証コードです。</p><p style="font-size:30px;letter-spacing:.18em;font-weight:700">${code}</p><p>このコードは10分間有効です。</p><p style="color:#777;font-size:12px">ROAD TO PEACE PRIDE / MEMORIAL COLLECTION 2026</p></div>`;
  await env.EMAIL.send({to,from:{email:sender.email,name:sender.name},subject,text,html});
  return true;
}
async function nativeOtpRequest(request,env){
  if(!env.EMAIL)return null;
  const sender=await nativeSender(env);if(!sender.email)return null;
  if(await deadlinePassed(env))return json({error:'現在は原稿受付期間を終了しています。'},403);
  const b=await request.json().catch(()=>({})),email=cleanEmail(b.email);
  if(!/^\S+@\S+\.\S+$/.test(email))return json({error:'メールアドレスを確認してください。'},400);
  await env.DB.exec('CREATE TABLE IF NOT EXISTS rpp_otps(email TEXT PRIMARY KEY,code_hash TEXT NOT NULL,expires_at TEXT NOT NULL,sent_at TEXT NOT NULL,attempts INTEGER NOT NULL DEFAULT 0)');
  const old=await env.DB.prepare('SELECT sent_at FROM rpp_otps WHERE email=?').bind(email).first();
  if(old?.sent_at&&Date.now()-Date.parse(old.sent_at)<120000)return json({error:'再送は2分ほど待ってから行ってください。'},429);
  const code=random6(),pepper=String(env.OTP_PEPPER||env.SETUP_KEY||'');
  if(!pepper)return json({error:'OTP保護キーが未設定です。'},503);
  const hash=await sha256(`${email}:${code}:${pepper}`),expires=new Date(Date.now()+10*60*1000).toISOString(),sent=new Date().toISOString();
  await env.DB.prepare('INSERT INTO rpp_otps(email,code_hash,expires_at,sent_at,attempts) VALUES(?,?,?,?,0) ON CONFLICT(email) DO UPDATE SET code_hash=excluded.code_hash,expires_at=excluded.expires_at,sent_at=excluded.sent_at,attempts=0').bind(email,hash,expires,sent).run();
  try{await sendNativeEmail(env,email,code)}catch(e){console.error('Cloudflare Email Service send failed',e);return json({error:'認証メールを送信できませんでした。送信設定を確認してください。'},502)}
  return json({ok:true,preview:false,emailService:'cloudflare'});
}
async function nativeEmailSettings(request,env,path){
  if(!env.EMAIL)return null;
  if(path==='/api/admin/email-settings'&&request.method==='GET'){
    const sender=await nativeSender(env);if(!sender.email)return null;
    return json({configured:true,source:'cloudflare-email-service',senderEmail:sender.email,senderName:sender.name});
  }
  return null;
}
async function ensureLaunchSettings(env){
  try{
    const marker=await env.DB.prepare("SELECT value FROM rpp_settings WHERE key='launch_bootstrap_20260906'").first();
    if(marker?.value==='1')return;
    if(!await emailReady(env))return;
    const salt='255ae1d8bd660fd514cc8c8d9836ac67';
    const hash='3ab04cd3fe1ab47a263b7a05d0ce66b6f800973900a3466288f09f72271174c6';
    await env.DB.batch([
      env.DB.prepare("INSERT INTO rpp_settings(key,value) VALUES('viewer_password_salt',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(salt),
      env.DB.prepare("INSERT INTO rpp_settings(key,value) VALUES('viewer_password_hash',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(hash),
      env.DB.prepare("INSERT INTO rpp_settings(key,value) VALUES('site_mode','production') ON CONFLICT(key) DO UPDATE SET value='production'"),
      env.DB.prepare("INSERT INTO rpp_settings(key,value) VALUES('book_open','true') ON CONFLICT(key) DO UPDATE SET value='true'"),
      env.DB.prepare("INSERT INTO rpp_settings(key,value) VALUES('launch_bootstrap_20260906','1') ON CONFLICT(key) DO UPDATE SET value='1'")
    ]);
  }catch(e){console.error('launch bootstrap failed',e)}
}

export default{
  async fetch(request,env,ctx){
    await ensureLaunchSettings(env);
    const url=new URL(request.url),path=url.pathname.replace(/\/$/,'');
    if(path==='/api/auth/request'&&request.method==='POST'){
      const native=await nativeOtpRequest(request,env);if(native)return native;
    }
    const nativeSettings=await nativeEmailSettings(request,env,path);if(nativeSettings)return nativeSettings;
    const response=await app.fetch(request,env,ctx),type=response.headers.get('content-type')||'';
    if(path==='/api/health'&&request.method==='GET'&&response.ok){
      try{
        const data=await response.clone().json();data.emailConfigured=await emailReady(env);data.nativeEmailService=Boolean(env.EMAIL);data.nativeEmailSender=(await nativeSender(env)).email||'';
        const headers=new Headers(response.headers);headers.set('Content-Type','application/json; charset=utf-8');headers.set('Cache-Control','no-store');
        return new Response(JSON.stringify(data),{status:response.status,headers});
      }catch{}
    }
    if(type.includes('text/html')&&['/author','/author.html'].includes(path))return inject(response);
    return response;
  }
};
