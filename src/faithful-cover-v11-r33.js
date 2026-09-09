import app from './faithful-cover-v11-r32.js';

const AUTHOR_DEADLINE_UI=`<script>
(()=>{
  const NEW='提出期限：2026年10月31日';
  const ids=['deadlineAuth','deadlineEditor'];
  const watched=new WeakSet();
  function fixOne(el){
    if(!el)return;
    if(el.textContent!==NEW)el.textContent=NEW;
    el.classList.remove('hidden');
    if(!watched.has(el)){
      watched.add(el);
      new MutationObserver(()=>{if(el.textContent!==NEW)el.textContent=NEW}).observe(el,{childList:true,characterData:true,subtree:true});
    }
  }
  function fix(){
    ids.forEach(id=>fixOne(document.getElementById(id)));
    document.documentElement.dataset.rppDeadline='date-only-r33-fixed';
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fix,{once:true});else fix();
  addEventListener('pageshow',fix);
  document.addEventListener('rpp:reedit-opened',()=>setTimeout(fix,0));
})();
</script>`;

function injectAuthor(response){
  const headers=new Headers(response.headers);
  headers.set('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');
  headers.delete('Content-Length');
  return new HTMLRewriter()
    .on('html',{element(el){el.setAttribute('data-rpp-deadline','date-only-r33-fixed')}})
    .on('body',{element(el){el.append(AUTHOR_DEADLINE_UI,{html:true})}})
    .transform(new Response(response.body,{status:response.status,statusText:response.statusText,headers}));
}

export default{
  async fetch(request,env,ctx){
    const url=new URL(request.url),path=url.pathname.replace(/\/$/,'')||'/';
    const response=await app.fetch(request,env,ctx);
    const type=response.headers.get('content-type')||'';
    if(type.includes('text/html')&&['/author','/author.html'].includes(path))return injectAuthor(response);
    return response;
  }
};
