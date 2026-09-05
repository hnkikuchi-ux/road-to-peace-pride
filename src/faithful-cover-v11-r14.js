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
<div id="rppViewerConsent" class="hidden" role="dialog" aria-modal="true" aria-labelledby="rppConsentTitle"><div class="rpp-consent-card"><div class="rpp-consent-kicker">PRIVACY NOTICE</div><h2 id="rppConsentTitle">閲覧にあたっての確認事項</h2><p class="rpp-consent-copy">本文集には、氏名・所属組織・写真・体験等の個人情報が含まれます。<br>掲載内容は原則として本企画参加者のみの閲覧を目的としており、本人の承諾なく転載・転送・SNS投稿・スクリーンショット等による外部共有はお控えください。</p><label class="rpp-consent-check"><input id="rppConsentCheck" type="checkbox"><span>上記の内容を確認し、同意します</span></label><button id="rppConsentAccept" type="button" disabled>同意して文集を閲覧する</button></div></div>
<script>
(()=>{
 const KEY='rpp_viewer_consent_v1';
 const GROUPS=['中区','南総区','港南総区','磯子総区','金沢総区','栄区'];
 const box=()=>document.getElementById('rppViewerConsent');
 let resolveConsent=null,busy=false;
 function accepted(){try{return localStorage.getItem(KEY)==='1'}catch(e){return false}}
 function save(){try{localStorage.setItem(KEY,'1')}catch(e){}}
 function showNow(){if(accepted())return;const el=box();if(!el)return;el.classList.remove('hidden');document.body.classList.add('rpp-consent-open')}
 function hide(){const el=box();if(el)el.classList.add('hidden');document.body.classList.remove('rpp-consent-open')}
 function waitForConsent(){if(accepted())return Promise.resolve();showNow();return new Promise(resolve=>{resolveConsent=resolve})}
 function groupOf(s,i){
   const raw=String((s&&((s.soku||s.org)))||'');
   for(const g of GROUPS)if(raw===g||raw.includes(g))return g;
   if(String(s&&s.id||'').startsWith('sample-'))return GROUPS[i%GROUPS.length];
   return '未分類';
 }
 function makeTocItem(s,i){
   const d=document.createElement('div');d.className='toc-item';
   const b=document.createElement('button'),left=document.createElement('div'),t=document.createElement('div'),n=document.createElement('div'),arrow=document.createElement('div');
   t.className='toc-title';n.className='toc-name';t.textContent=s.title||'無題';n.textContent=s.name||'';arrow.textContent='›';left.append(t,n);b.append(left,arrow);
   b.addEventListener('click',()=>{try{openStory(i)}catch(e){try{current=i;renderStory();show('reader')}catch(_){}}});d.append(b);return d;
 }
 function ensureDistrictSections(){
   const list=document.getElementById('tocList');if(!list)return false;
   if(document.querySelectorAll('.rpp-district-section:not(.rpp-legacy-section)').length>=6)return true;
   let ss=[];try{ss=stories||[]}catch(e){return false}
   let flat=[...list.children].filter(x=>x.classList&&x.classList.contains('toc-item'));
   if(!flat.length&&ss.length){list.textContent='';flat=ss.map((s,i)=>{const item=makeTocItem(s,i);list.appendChild(item);return item})}
   document.body.classList.add('rpp-district-book');
   const buckets=new Map(GROUPS.map(g=>[g,[]]));buckets.set('未分類',[]);
   flat.forEach((item,i)=>{const s=ss[i]||{},g=groupOf(s,i);item.dataset.rppGroup=g;item.dataset.rppSearch=((s.title||'')+' '+(s.name||'')).toLowerCase();buckets.get(g).push(item)});
   list.textContent='';
   [...GROUPS,'未分類'].forEach((g,gi)=>{
     const items=buckets.get(g)||[];if(g==='未分類'&&!items.length)return;
     const sec=document.createElement('section');sec.className='rpp-district-section'+(g==='未分類'?' rpp-legacy-section':'');if(g!=='未分類')sec.id='rppDistrict-'+gi;
     const no=g==='未分類'?'ARCHIVE':'CHAPTER '+String(gi+1).padStart(2,'0');
     sec.innerHTML='<div class="rpp-district-head"><div class="rpp-chapter-no">'+no+'</div><div class="rpp-district-name">'+g+'</div><div class="rpp-district-count">'+items.length+' RECORD'+(items.length===1?'':'S')+'</div></div>';
     if(items.length)items.forEach(x=>sec.appendChild(x));else{const e=document.createElement('div');e.className='rpp-district-empty';e.textContent='この章の記録は、これから掲載されます。';sec.appendChild(e)}
     list.appendChild(sec);
   });
   return document.querySelectorAll('.rpp-district-section:not(.rpp-legacy-section)').length===6;
 }
 function settleContents(){[0,40,120,260,520,950,1600].forEach(ms=>setTimeout(ensureDistrictSections,ms))}
 async function openViewer(){
   if(busy)return;busy=true;
   const unlock=document.getElementById('unlock'),msg=document.getElementById('msg'),pw=document.getElementById('pw');
   if(unlock)unlock.disabled=true;if(msg)msg.textContent='';
   try{
     const r=await fetch('/api/viewer/login',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({password:pw?.value||''})});
     const d=await r.json();
     if(!r.ok){if(msg)msg.textContent=d.error||'パスワードを確認してください。';return}
     await waitForConsent();
     show('cover');
     const s=await fetch('/api/stories',{credentials:'same-origin',cache:'no-store'}),data=await s.json();
     if(!s.ok)throw new Error(data.error||'読み込みに失敗しました。');
     stories=data.stories||[];updateResume();
     try{renderToc()}catch(e){}
     settleContents();
   }catch(e){if(msg)msg.textContent=e?.message||'読み込みに失敗しました。'}finally{busy=false;if(unlock)unlock.disabled=false}
 }
 function install(){
   const check=document.getElementById('rppConsentCheck'),accept=document.getElementById('rppConsentAccept');
   if(check&&accept){
     check.addEventListener('change',()=>{accept.disabled=!check.checked});
     accept.addEventListener('click',()=>{if(!check.checked)return;save();hide();const done=resolveConsent;resolveConsent=null;if(done)done()})
   }
   const unlock=document.getElementById('unlock');if(unlock){unlock.onclick=openViewer}
   const pw=document.getElementById('pw');if(pw&&!pw.dataset.r14Enter){pw.dataset.r14Enter='1';pw.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();openViewer()}})}
   const cover=document.getElementById('cover');if(cover&&!cover.dataset.r14ResumeConsent){cover.dataset.r14ResumeConsent='1';new MutationObserver(()=>{if(!cover.classList.contains('hidden')&&!accepted())showNow()}).observe(cover,{attributes:true,attributeFilter:['class']})}
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
