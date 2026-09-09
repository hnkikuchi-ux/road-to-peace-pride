import app from './faithful-cover-v11-r30.js';

const GUIDE_STYLE=`<style id="rppAuthorFirstTimeGuideR31">
#rppFirstTimeGuide{margin:8px 0 14px;padding:12px 14px;border:1px solid rgba(181,137,49,.48);border-left:4px solid #c99b39;background:rgba(216,184,102,.10);color:#24324b;line-height:1.65;transition:none!important;animation:none!important}
#rppFirstTimeGuide .rpp-first-title{margin:0 0 3px;font-weight:800;font-size:16px!important;line-height:1.45!important;letter-spacing:0;color:#1f2d49}
#rppFirstTimeGuide p{margin:0;font-size:13px!important;line-height:1.7!important;color:#424b5e}
#auth #rppRecognitionHelp{display:none!important}
@media(max-width:560px){#rppFirstTimeGuide{margin:7px 0 12px;padding:11px 12px}#rppFirstTimeGuide .rpp-first-title{font-size:16px!important}#rppFirstTimeGuide p{font-size:13px!important}}
</style>`;

const GUIDE_HTML=`<div id="rppFirstTimeGuide" role="note"><div class="rpp-first-title">初めての方</div><p>メールアドレスを入力し、「認識コードを送信」を押してください。</p></div>`;

const GUIDE_PIN=`<script id="rppAuthorFirstTimeGuidePinR31">
(()=>{
  const auth=document.getElementById('auth');
  const guide=document.getElementById('rppFirstTimeGuide');
  if(!auth||!guide)return;
  let queued=false;
  function pin(){
    queued=false;
    const email=document.getElementById('email');
    const field=email?.closest?.('.field');
    if(!field||field.parentElement!==auth)return;
    if(guide.nextElementSibling!==field)auth.insertBefore(guide,field);
    if(email)email.setAttribute('aria-describedby','rppFirstTimeGuide');
    document.documentElement.dataset.rppFirstTimeGuide='r31-stable';
  }
  function schedule(){
    if(queued)return;
    queued=true;
    queueMicrotask(pin);
  }
  pin();
  const observer=new MutationObserver(schedule);
  observer.observe(auth,{childList:true});
  addEventListener('pageshow',pin);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)pin()});
})();
</script>`;

function injectAuthor(response){
  const headers=new Headers(response.headers);
  headers.set('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');
  headers.delete('Content-Length');
  return new HTMLRewriter()
    .on('html',{element(el){el.setAttribute('data-rpp-first-time-guide','r31-stable')}})
    .on('head',{element(el){el.append(GUIDE_STYLE,{html:true})}})
    .on('#auth > .field',{element(el){el.before(GUIDE_HTML,{html:true})}})
    .on('body',{element(el){el.append(GUIDE_PIN,{html:true})}})
    .transform(new Response(response.body,{status:response.status,statusText:response.statusText,headers}));
}

export default{
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx);
    const url=new URL(request.url);
    const path=url.pathname.replace(/\/$/,'')||'/';
    const type=response.headers.get('content-type')||'';
    if(type.includes('text/html')&&['/author','/author.html'].includes(path))return injectAuthor(response);
    return response;
  }
};
