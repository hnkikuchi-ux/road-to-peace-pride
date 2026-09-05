import app from './faithful-cover-v11-r13.js';

const CONSENT=`
<style>
body.rpp-consent-open{overflow:hidden!important}
#rppViewerConsent{position:fixed;inset:0;z-index:10000;display:grid;place-items:center;padding:16px;background:rgba(1,7,20,.92);backdrop-filter:blur(12px)}
#rppViewerConsent.hidden{display:none!important}
#rppViewerConsent .rpp-consent-card{width:min(100%,560px);max-height:92vh;overflow:auto;padding:28px 22px 24px;border:1px solid rgba(239,217,141,.82);background:linear-gradient(180deg,#10254a,#06152f 72%,#041027);box-shadow:0 30px 90px rgba(0,0,0,.58),inset 0 0 0 7px #071935,inset 0 0 0 8px rgba(231,187,79,.26)}
#rppViewerConsent .rpp-consent-kicker{font:800 10px/1.4 ui-sans-serif,system-ui;letter-spacing:.22em;color:#efd98d;text-align:center}
#rppViewerConsent h2{font-family:ui-serif,"Yu Mincho",serif;font-size:clamp(22px,6vw,30px);font-weight:500;letter-spacing:.04em;line-height:1.5;text-align:center;margin:10px 0 16px}
#rppViewerConsent .rpp-consent-copy{font-size:13px;line-height:1.95;color:#eef0f5;margin:0}
#rppViewerConsent .rpp-consent-check{display:flex;gap:10px;align-items:flex-start;margin:18px 0 14px;padding:13px;border:1px solid rgba(216,184,102,.35);background:rgba(216,184,102,.07);cursor:pointer}
#rppViewerConsent .rpp-consent-check input{width:20px;height:20px;flex:0 0 auto;margin:1px 0 0;accent-color:#d8b866}
#rppViewerConsent .rpp-consent-check span{font:12px/1.7 ui-sans-serif,system-ui;color:#f1ead6}
#rppViewerConsent #rppConsentAccept{width:100%;min-height:52px;border:1px solid rgba(239,217,141,.7);border-radius:999px;background:linear-gradient(135deg,#b68b36,#efd987);color:#1b1305;font-weight:800;font-size:14px;cursor:pointer}
#rppViewerConsent #rppConsentAccept:disabled{opacity:.38;cursor:not-allowed;filter:saturate(.55)}
@media(max-width:520px){#rppViewerConsent{padding:10px}#rppViewerConsent .rpp-consent-card{padding:24px 16px 20px}}
</style>
<script>
(()=>{
 const KEY='rpp_viewer_consent_v1';
 function accepted(){try{return localStorage.getItem(KEY)==='1'}catch(e){return false}}
 function save(){try{localStorage.setItem(KEY,'1')}catch(e){}}
 function ensure(){
   if(document.getElementById('rppViewerConsent'))return document.getElementById('rppViewerConsent');
   const box=document.createElement('div');box.id='rppViewerConsent';box.className='hidden';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-labelledby','rppConsentTitle');
   box.innerHTML='<div class="rpp-consent-card"><div class="rpp-consent-kicker">PRIVACY NOTICE</div><h2 id="rppConsentTitle">閲覧にあたっての確認事項</h2><p class="rpp-consent-copy">本文集には、氏名・所属組織・写真・体験等の個人情報が含まれます。<br>掲載内容は原則として本企画参加者のみの閲覧を目的としており、本人の承諾なく転載・転送・SNS投稿・スクリーンショット等による外部共有はお控えください。</p><label class="rpp-consent-check"><input id="rppConsentCheck" type="checkbox"><span>上記の内容を確認し、同意します</span></label><button id="rppConsentAccept" type="button" disabled>同意して文集を閲覧する</button></div>';
   document.body.appendChild(box);
   const check=box.querySelector('#rppConsentCheck'),accept=box.querySelector('#rppConsentAccept');
   check.addEventListener('change',()=>{accept.disabled=!check.checked});
   accept.addEventListener('click',()=>{if(!check.checked)return;save();box.classList.add('hidden');document.body.classList.remove('rpp-consent-open')});
   return box;
 }
 function maybeShow(){
   if(accepted())return;
   const cover=document.getElementById('cover');
   if(!cover||cover.classList.contains('hidden'))return;
   const box=ensure();box.classList.remove('hidden');document.body.classList.add('rpp-consent-open');
 }
 function install(){
   ensure();maybeShow();
   const cover=document.getElementById('cover');
   if(cover&&!cover.dataset.r14ConsentObserved){cover.dataset.r14ConsentObserved='1';new MutationObserver(maybeShow).observe(cover,{attributes:true,attributeFilter:['class']})}
   const unlock=document.getElementById('unlock');if(unlock&&!unlock.dataset.r14ConsentBound){unlock.dataset.r14ConsentBound='1';unlock.addEventListener('click',()=>{setTimeout(maybeShow,120);setTimeout(maybeShow,420)})}
   setTimeout(maybeShow,250);setTimeout(maybeShow,900)
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
</script>`;

function inject(response){return new HTMLRewriter().on('body',{element(el){el.append(CONSENT,{html:true})}}).transform(response)}

export default{
 async fetch(request,env,ctx){
   const response=await app.fetch(request,env,ctx),url=new URL(request.url),type=response.headers.get('content-type')||'';
   const path=url.pathname.replace(/\/$/,'')||'/';
   if(type.includes('text/html')&&['/','/index.html','/refresh','/latest'].includes(path))return inject(response);
   return response;
 }
};
