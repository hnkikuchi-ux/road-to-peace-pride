import app from './faithful-cover-v11-r32.js';

const AUTHOR_DEADLINE_UI=`<script>
(()=>{
  const OLD=/記録の編集・提出期限\s*[:：]\s*2026年10月31日\s*23:59/g;
  const NEW='提出期限：2026年10月31日';
  function fix(){
    const root=document.getElementById('auth')||document.getElementById('editor')||document.body;
    if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];let n;
    while((n=walker.nextNode())){if(OLD.test(n.nodeValue||''))nodes.push(n);OLD.lastIndex=0}
    nodes.forEach(t=>{t.nodeValue=(t.nodeValue||'').replace(OLD,NEW);OLD.lastIndex=0});
    document.documentElement.dataset.rppDeadline='date-only-r33';
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{fix();setTimeout(fix,120);setTimeout(fix,500)},{once:true});
  else {fix();setTimeout(fix,120);setTimeout(fix,500)}
  addEventListener('pageshow',fix);
  document.addEventListener('rpp:reedit-opened',()=>setTimeout(fix,0));
})();
</script>`;

function injectAuthor(response){
  const headers=new Headers(response.headers);
  headers.set('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');
  headers.delete('Content-Length');
  return new HTMLRewriter()
    .on('html',{element(el){el.setAttribute('data-rpp-deadline','date-only-r33')}})
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
