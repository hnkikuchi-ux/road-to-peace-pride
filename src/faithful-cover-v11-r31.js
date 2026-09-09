import app from './faithful-cover-v11-r30.js';

const VIEWER_TOOLS=`<style id="rppViewerToolsR31">
#reader #fav{display:none!important}
#reader .reader-nav{justify-content:space-between!important}
#reader #fontDown,#reader #fontUp{touch-action:manipulation;-webkit-tap-highlight-color:transparent}
</style>
<script>
(()=>{
  const KEY='rpp_font_size';
  const MIN=14,MAX=26,STEP=2;
  const el=id=>document.getElementById(id);
  let lastGesture=0;
  function currentSize(){
    const saved=Number(localStorage.getItem(KEY)||'');
    if(Number.isFinite(saved)&&saved>=MIN&&saved<=MAX)return saved;
    const body=el('body');
    const n=body?parseFloat(getComputedStyle(body).fontSize):16;
    return Number.isFinite(n)?Math.max(MIN,Math.min(MAX,Math.round(n))):16;
  }
  function applySize(n){
    n=Math.max(MIN,Math.min(MAX,Number(n)||16));
    const body=el('body');
    if(body)body.style.setProperty('font-size',n+'px','important');
    document.documentElement.style.setProperty('--body-size',n+'px');
    try{localStorage.setItem(KEY,String(n))}catch{}
    document.documentElement.dataset.rppReaderFont=String(n);
  }
  function adjust(delta){applySize(currentSize()+delta)}
  function bind(id,delta){
    const old=el(id);if(!old)return;
    if(old.dataset.r31Bound==='1')return;
    const btn=old.cloneNode(true);btn.type='button';btn.disabled=false;btn.dataset.r31Bound='1';old.replaceWith(btn);
    const fire=e=>{const now=Date.now();e?.preventDefault?.();e?.stopPropagation?.();if(now-lastGesture<350)return;lastGesture=now;adjust(delta)};
    btn.addEventListener('pointerup',fire,{passive:false});
    btn.addEventListener('click',fire,false);
  }
  function removeFavorite(){el('fav')?.remove()}
  function run(){removeFavorite();bind('fontDown',-STEP);bind('fontUp',STEP);applySize(currentSize());document.documentElement.dataset.rppViewerTools='r31'}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  addEventListener('pageshow',run);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)run()});
})();
</script>`;

function injectViewer(response){
  const headers=new Headers(response.headers);headers.set('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');headers.delete('Content-Length');
  return new HTMLRewriter()
    .on('html',{element(el){el.setAttribute('data-rpp-viewer-tools','r31')}})
    .on('body',{element(el){el.append(VIEWER_TOOLS,{html:true})}})
    .transform(new Response(response.body,{status:response.status,statusText:response.statusText,headers}));
}

export default{
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx),url=new URL(request.url),path=url.pathname.replace(/\/$/,'')||'/',type=response.headers.get('content-type')||'';
    if(type.includes('text/html')&&['/','/index.html','/refresh','/latest'].includes(path))return injectViewer(response);
    return response;
  }
};
