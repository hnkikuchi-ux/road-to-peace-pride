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

function inject(response){return new HTMLRewriter().on('body',{element(el){el.append(R15,{html:true})}}).transform(response)}
async function emailReady(env){
  if(env.BREVO_API_KEY&&env.OTP_SENDER_EMAIL)return true;
  try{
    const rows=(await env.DB.prepare("SELECT key,value FROM rpp_settings WHERE key IN ('brevo_api_key_enc','otp_sender_email')").all()).results||[];
    const m=Object.fromEntries(rows.map(r=>[r.key,String(r.value||'').trim()]));
    return Boolean(m.brevo_api_key_enc&&m.otp_sender_email);
  }catch{return false}
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
    const response=await app.fetch(request,env,ctx),type=response.headers.get('content-type')||'';
    if(path==='/api/health'&&request.method==='GET'&&response.ok){
      try{
        const data=await response.clone().json();data.emailConfigured=await emailReady(env);
        const headers=new Headers(response.headers);headers.set('Content-Type','application/json; charset=utf-8');headers.set('Cache-Control','no-store');
        return new Response(JSON.stringify(data),{status:response.status,headers});
      }catch{}
    }
    if(type.includes('text/html')&&['/author','/author.html'].includes(path))return inject(response);
    return response;
  }
};
