import app from './faithful-cover-v11.js';

const V11_R3 = `
<style>
/* faithful v11-r3 — approved generated Art Deco lock replacement */
#rppFaithfulV7 .v7-lock{
  left:17.55%!important;
  top:66.50%!important;
  width:6.35%!important;
  height:4.90%!important;
  aspect-ratio:auto!important;
  background:url('/assets/lock-artdeco-v11-r3.svg?v=11r3') center/contain no-repeat!important;
  filter:drop-shadow(0 1px 2px rgba(0,0,0,.48)) drop-shadow(0 0 6px rgba(239,184,54,.34))!important;
}
#rppFaithfulV7 .v7-lock svg{display:none!important}
@media(max-width:380px){
  #rppFaithfulV7 .v7-lock{left:17.0%!important;width:6.65%!important;height:5.0%!important}
}
</style>
<script>
(()=>{
  const mark=()=>{
    const card=document.querySelector('#gate .gate-card');
    const lock=document.querySelector('#rppFaithfulV7 .v7-lock');
    if(!card||!lock)return false;
    card.dataset.v11Lock='artdeco-r3';
    card.dataset.v11Revision='r3';
    lock.setAttribute('aria-hidden','true');
    return true;
  };
  const retry=()=>{if(mark())return;setTimeout(retry,90)};
  retry();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',retry,{once:true});
  setTimeout(mark,240);setTimeout(mark,620);
})();
</script>`;

function apply(response){return new HTMLRewriter().on('body',{element(el){el.append(V11_R3,{html:true})}}).transform(response)}

export default {
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx);
    const url=new URL(request.url),type=response.headers.get('content-type')||'';
    if(type.includes('text/html')&&['/','/index.html','/refresh','/latest'].includes(url.pathname))return apply(response);
    return response;
  }
};
