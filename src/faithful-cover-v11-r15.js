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
  function legacy(){return ['rppBunku','rppHonbu','rppShibu'].map(id=>document.getElementById(id))}
  function sync(){
    const detail=document.getElementById('rppOrgDetail');if(!detail)return;
    const [b,h,s]=legacy();
    if(b&&b.value!==detail.value){b.value=detail.value;b.dispatchEvent(new Event('input',{bubbles:true}))}
    if(h&&h.value)h.value='';if(s&&s.value)s.value='';
  }
  function patch(){
    const select=document.getElementById('rppOrgSelect');if(!select)return false;
    const host=select.closest('.field');if(!host)return false;
    let detail=document.getElementById('rppOrgDetail');
    if(!detail){
      const box=document.createElement('div');box.className='field rpp-org-detail-field';
      box.innerHTML='<label>分区／本部／部</label><input id="rppOrgDetail" maxlength="240" placeholder="分区／本部／部を入力">';
      const grid=host.querySelector('.r12-org-grid');if(grid)grid.insertAdjacentElement('afterend',box);else host.appendChild(box);
      detail=box.querySelector('#rppOrgDetail');detail.addEventListener('input',sync);
    }
    const [b,h,s]=legacy();[b,h,s].filter(Boolean).forEach(el=>{const f=el.closest('.field');if(f&&!f.classList.contains('r15-legacy-org'))f.classList.add('r15-legacy-org')});
    if(!detail.value){const vals=[b&&b.value,h&&h.value,s&&s.value].filter(v=>String(v||'').trim());if(vals.length)detail.value=vals.join('／')}
    if(detail.value)sync();return true;
  }
  function syncPreviewPhoto(){
    const modal=document.getElementById('storyPreview'),src=document.getElementById('photoPreview'),body=document.getElementById('pBody');if(!modal||!body)return false;
    let img=modal.querySelector('.r12-preview-photo');const ready=!!(src&&src.src&&!src.classList.contains('hidden'));
    if(!ready){if(img)img.remove();return false}
    if(!img){img=document.createElement('img');img.className='r12-preview-photo';img.alt='掲載写真';body.insertAdjacentElement('beforebegin',img)}
    if(img.src!==src.src)img.src=src.src;return true;
  }
  function schedulePreviewPhoto(){[0,40,120,300,700,1400].forEach(ms=>setTimeout(syncPreviewPhoto,ms))}
  function installPhotoSync(){
    const src=document.getElementById('photoPreview');
    if(src&&!src.dataset.r15PhotoObserved){src.dataset.r15PhotoObserved='1';src.addEventListener('load',schedulePreviewPhoto);new MutationObserver(schedulePreviewPhoto).observe(src,{attributes:true,attributeFilter:['src','class']})}
    const input=document.getElementById('photo');if(input&&!input.dataset.r15PhotoObserved){input.dataset.r15PhotoObserved='1';input.addEventListener('change',schedulePreviewPhoto)}
    syncPreviewPhoto();
  }
  function boot(){
    patch();installPhotoSync();let ticks=0;
    const timer=setInterval(()=>{patch();installPhotoSync();ticks++;if(ticks>=48)clearInterval(timer)},125);
    const editor=document.getElementById('editor');if(editor)new MutationObserver(()=>{patch();installPhotoSync()}).observe(editor,{childList:true,subtree:true});
    document.addEventListener('click',e=>{const btn=e.target&&e.target.closest?e.target.closest('button'):null;if(!btn)return;if(['save','previewBtn','submit','submitPreview'].includes(btn.id))sync();if(btn.id==='previewBtn')schedulePreviewPhoto()},true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
</script>`;

const ADMIN_MAIL_PATCH=`
<script>
(()=>{
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const el=id=>document.getElementById(id);
  function show(text,ok=false){const m=el('mailMsg');if(!m)return;m.textContent=text;m.className='msg '+(ok?'ok':'warn')}
  async function api(url,opt={}){const r=await fetch(url,{credentials:'same-origin',cache:'no-store',...opt});let d={};try{d=await r.json()}catch{}if(!r.ok&&r.status!==202)throw new Error(d.error||('HTTP '+r.status));return {...d,httpStatus:r.status}}
  function eventText(d){
    const e=d.deliveryEvent||{};const name=String(e.event||'').toLowerCase();const reason=e.reason?(' / '+e.reason):'';
    if(d.deliveryVerified||name.includes('delivered'))return 'Brevo配信確認：DELIVERED（受信側へ配信済み）';
    if(/blocked|hard.?bounce|invalid|error|spam/.test(name))return 'Brevo配信エラー：'+(e.event||'unknown')+reason;
    if(/deferred|soft.?bounce/.test(name))return 'Brevoで配信遅延：'+(e.event||'pending')+reason;
    if(e.event)return 'Brevo受付済み・配信確認中：'+e.event+reason;
    return 'Brevo受付済みですが、配信イベントはまだ確認できません。';
  }
  async function checkDelivery(){
    const to=(el('testTo')?.value||'').trim();if(!to){show('テスト送信先を入力してください。');return}
    try{show('Brevoの配信ログを確認中…');const d=await api('/api/admin/email-delivery?email='+encodeURIComponent(to));show(eventText(d),!!d.deliveryVerified)}catch(e){show(e.message)}
  }
  async function testMail(){
    const to=(el('testTo')?.value||'').trim();if(!to){show('テスト送信先を入力してください。');return}
    try{
      show('テストメールを送信し、Brevoの配信結果まで確認中…');
      const d=await api('/api/admin/email-test',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({to})});
      show(eventText(d),!!d.deliveryVerified);
      if(!d.deliveryVerified&&d.accepted){await sleep(2500);const r=await api('/api/admin/email-delivery?email='+encodeURIComponent(to));show(eventText(r),!!r.deliveryVerified)}
    }catch(e){show(e.message)}
  }
  function install(){
    const test=el('testMail');if(!test)return;test.onclick=testMail;
    if(!el('checkMailDelivery')){const b=document.createElement('button');b.id='checkMailDelivery';b.className='pill';b.textContent='Brevo配信結果を再確認';b.onclick=checkDelivery;test.insertAdjacentElement('afterend',b)}
    const sender=el('senderEmail');if(sender&&!el('freeSenderWarn')){const n=document.createElement('div');n.id='freeSenderWarn';n.className='note';n.style.marginTop='8px';sender.closest('.field')?.append(n);const refresh=()=>{const v=(sender.value||'').toLowerCase();n.textContent=/@(gmail|yahoo|outlook|hotmail)\./.test(v)?'注意：無料メールドメインはDKIM認証できず、Brevo・Gmail双方で配信が不安定になる場合があります。':''};sender.addEventListener('input',refresh);refresh()}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
</script>`;

function inject(response){return new HTMLRewriter().on('body',{element(el){el.append(R15,{html:true})}}).transform(response)}
function injectAdmin(response){return new HTMLRewriter().on('body',{element(el){el.append(ADMIN_MAIL_PATCH,{html:true})}}).transform(response)}
function json(data,status=200,baseHeaders){const h=new Headers(baseHeaders||{});h.set('Content-Type','application/json; charset=utf-8');h.set('Cache-Control','no-store');return new Response(JSON.stringify(data),{status,headers:h})}
function cleanEmail(v){return String(v||'').trim().toLowerCase()}
function b64ToBytes(s){const raw=atob(String(s||'')),out=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);return out}
async function cryptoKey(env){if(!env.SETUP_KEY)throw new Error('SETUP_KEY is required for encrypted settings');const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(env.SETUP_KEY)));return crypto.subtle.importKey('raw',d,{name:'AES-GCM'},false,['decrypt'])}
async function decryptSecret(env,payload){const [a,b]=String(payload||'').split('.');if(!a||!b)return '';const key=await cryptoKey(env),iv=b64ToBytes(a),cipher=b64ToBytes(b);const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv},key,cipher);return new TextDecoder().decode(plain)}
async function settingsMap(env,keys){
  try{const q=keys.map(()=>'?').join(','),rows=(await env.DB.prepare(`SELECT key,value FROM rpp_settings WHERE key IN (${q})`).bind(...keys).all()).results||[];return Object.fromEntries(rows.map(r=>[r.key,String(r.value||'')]))}catch{return {}}
}
async function emailReady(env){
  if(env.BREVO_API_KEY&&env.OTP_SENDER_EMAIL)return true;
  const m=await settingsMap(env,['brevo_api_key_enc','otp_sender_email']);return Boolean(String(m.brevo_api_key_enc||'').trim()&&String(m.otp_sender_email||'').trim())
}
async function deliveryVerified(env){const m=await settingsMap(env,['email_delivery_verified_at']);return Boolean(String(m.email_delivery_verified_at||'').trim())}
async function mailConfig(env){
  if(env.BREVO_API_KEY)return {apiKey:String(env.BREVO_API_KEY),senderEmail:String(env.OTP_SENDER_EMAIL||'')};
  const m=await settingsMap(env,['brevo_api_key_enc','otp_sender_email']);if(!m.brevo_api_key_enc)return null;return {apiKey:await decryptSecret(env,m.brevo_api_key_enc),senderEmail:String(m.otp_sender_email||'')}
}
async function brevoGet(url,apiKey){const r=await fetch(url,{headers:{accept:'application/json','api-key':apiKey}}),txt=await r.text();let d={};try{d=JSON.parse(txt)}catch{}if(!r.ok)throw new Error(`Brevo診断APIエラー (${r.status})${d.message?': '+d.message:''}`);return d}
function normalizeEventName(v){return String(v||'').toLowerCase().replace(/[\s_-]/g,'')}
function isDeliveredEvent(e){return normalizeEventName(e?.event).includes('delivered')}
function isFailureEvent(e){return /blocked|hardbounce|invalid|error|spam/.test(normalizeEventName(e?.event))}
async function brevoDiagnostics(env,email,sinceMs=0){
  const cfg=await mailConfig(env);if(!cfg?.apiKey)throw new Error('Brevo APIキーを確認できません。');
  const u=new URL('https://api.brevo.com/v3/smtp/statistics/events');u.searchParams.set('days','1');u.searchParams.set('email',email);u.searchParams.set('limit','50');u.searchParams.set('sort','desc');
  const [ev,senders]=await Promise.all([brevoGet(u.toString(),cfg.apiKey),brevoGet('https://api.brevo.com/v3/senders',cfg.apiKey).catch(()=>({senders:[]}))]);
  const all=(ev.events||[]).filter(x=>cleanEmail(x.email)===email);const recent=sinceMs?all.filter(x=>{const t=Date.parse(x.date||'');return Number.isFinite(t)&&t>=sinceMs-15000}):all;
  const seed=recent[0]||all[0]||null;let chain=[];if(seed?.messageId)chain=all.filter(x=>x.messageId===seed.messageId);else if(seed)chain=[seed];chain.sort((a,b)=>Date.parse(b.date||0)-Date.parse(a.date||0));
  const event=chain.find(isDeliveredEvent)||chain.find(isFailureEvent)||chain[0]||seed||null;
  const sender=(senders.senders||[]).find(x=>cleanEmail(x.email)===cleanEmail(cfg.senderEmail))||null;
  return {deliveryEvent:event?{date:event.date||'',email:event.email||'',event:event.event||'',messageId:event.messageId||'',from:event.from||'',reason:event.reason||''}:null,sender:{email:cfg.senderEmail,found:Boolean(sender),active:sender?.active??null},deliveryVerified:isDeliveredEvent(event)}
}
async function waitForDelivery(env,email,sinceMs){
  let d={deliveryEvent:null,deliveryVerified:false};for(let i=0;i<5;i++){await new Promise(r=>setTimeout(r,i?1100:700));d=await brevoDiagnostics(env,email,sinceMs);if(d.deliveryVerified||isFailureEvent(d.deliveryEvent))break}return d
}
async function markDeliveryVerified(env,diag){
  if(!diag?.deliveryVerified)return;await env.DB.prepare("INSERT INTO rpp_settings(key,value) VALUES('email_delivery_verified_at',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(new Date().toISOString()).run()
}
async function holdPreviewUntilVerified(env){
  try{const m=await settingsMap(env,['launch_bootstrap_20260906','email_delivery_verified_at']);if(m.launch_bootstrap_20260906==='1'&&!m.email_delivery_verified_at){await env.DB.batch([env.DB.prepare("INSERT INTO rpp_settings(key,value) VALUES('site_mode','preview') ON CONFLICT(key) DO UPDATE SET value='preview'"),env.DB.prepare("INSERT INTO rpp_settings(key,value) VALUES('launch_bootstrap_20260906','0') ON CONFLICT(key) DO UPDATE SET value='0'")])}}catch(e){console.error('preview hold failed',e)}
}
async function ensureLaunchSettings(env){
  try{
    if(!await deliveryVerified(env)){await holdPreviewUntilVerified(env);return}
    if(!await emailReady(env))return;
    const marker=await env.DB.prepare("SELECT value FROM rpp_settings WHERE key='launch_bootstrap_20260906'").first();if(marker?.value==='1')return;
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
    const emailTestBody=path==='/api/admin/email-test'&&request.method==='POST'?await request.clone().json().catch(()=>({})):null;
    const settingsBody=path==='/api/admin/settings'&&request.method==='PUT'?await request.clone().json().catch(()=>({})):null;
    const startedAt=Date.now();
    const response=await app.fetch(request,env,ctx),type=response.headers.get('content-type')||'';

    if(path==='/api/admin/email-test'&&request.method==='POST'&&response.ok){
      const to=cleanEmail(emailTestBody?.to);if(to){
        try{
          const diag=await waitForDelivery(env,to,startedAt);await markDeliveryVerified(env,diag);await ensureLaunchSettings(env);
          if(diag.deliveryVerified)return json({ok:true,accepted:true,...diag,productionActivated:true},200,response.headers);
          const failure=isFailureEvent(diag.deliveryEvent);return json({ok:!failure,accepted:true,...diag,error:failure?`Brevoで配信できませんでした${diag.deliveryEvent?.reason?': '+diag.deliveryEvent.reason:''}`:undefined},failure?502:202,response.headers);
        }catch(e){return json({error:`Brevo配信確認に失敗しました: ${String(e?.message||e)}`},502,response.headers)}
      }
    }

    if(path==='/api/admin/email-delivery'&&request.method==='GET'){
      if(response.status===401||response.status===403)return response;
      const email=cleanEmail(url.searchParams.get('email'));if(!/^\S+@\S+\.\S+$/.test(email))return json({error:'確認するメールアドレスを指定してください。'},400,response.headers);
      try{const diag=await brevoDiagnostics(env,email);await markDeliveryVerified(env,diag);await ensureLaunchSettings(env);return json({ok:true,...diag},200,response.headers)}catch(e){return json({error:`Brevo配信確認に失敗しました: ${String(e?.message||e)}`},502,response.headers)}
    }

    if(path==='/api/admin/settings'&&request.method==='PUT'&&response.ok&&settingsBody?.site_mode==='production'&&!await deliveryVerified(env)){
      await env.DB.prepare("INSERT INTO rpp_settings(key,value) VALUES('site_mode','preview') ON CONFLICT(key) DO UPDATE SET value='preview'").run();
      return json({error:'メールOTPの実配信（DELIVERED）を確認してからPRODUCTIONへ切り替えてください。'},400,response.headers);
    }

    if(path==='/api/health'&&request.method==='GET'&&response.ok){
      try{
        const data=await response.clone().json(),ready=await emailReady(env),verified=await deliveryVerified(env);
        data.emailConfigured=ready;data.emailDeliveryVerified=verified;data.emailProvider=ready?'brevo':'none';data.productionReady=ready&&verified&&Boolean(data.viewerPasswordConfigured);data.freePlanCompatible=true;
        const headers=new Headers(response.headers);headers.set('Content-Type','application/json; charset=utf-8');headers.set('Cache-Control','no-store');
        return new Response(JSON.stringify(data),{status:response.status,headers});
      }catch{}
    }
    if(type.includes('text/html')&&['/author','/author.html'].includes(path))return inject(response);
    if(type.includes('text/html')&&['/admin','/admin.html'].includes(path))return injectAdmin(response);
    return response;
  }
};
