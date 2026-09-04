import app from './faithful-cover-v11-r3.js';

const V11_R4 = `
<style>
/* faithful v11-r4 — compact Art Deco lock + balanced double frame */

/* Keep the gate card visually even on every side. */
#rppFaithfulV7 .v7-panel{
  box-sizing:border-box!important;
  border:1.45px solid rgba(231,187,79,.96)!important;
  border-radius:2px!important;
  background:linear-gradient(180deg,rgba(2,20,46,.925),rgba(1,10,27,.978))!important;
  box-shadow:inset 0 0 0 1px rgba(255,231,151,.055),0 17px 42px rgba(0,0,0,.30)!important;
}
#rppFaithfulV7 .v7-panel:before{
  content:''!important;
  position:absolute!important;
  inset:clamp(7px,2vw,9px)!important;
  box-sizing:border-box!important;
  border:1px solid rgba(235,195,99,.52)!important;
  border-radius:1px!important;
  clip-path:none!important;
  pointer-events:none!important;
}
#rppFaithfulV7 .v7-panel:after{display:none!important}

/* Four identical Art Deco corner marks, anchored to the panel itself. */
#rppFaithfulV7 .v11-corners{
  inset:auto!important;
  left:6.5%!important;right:6.5%!important;
  top:63.6%!important;bottom:13.2%!important;
  pointer-events:none!important;z-index:7!important;
}
#rppFaithfulV7 .v11-corners i{
  width:clamp(15px,4.4vw,20px)!important;
  height:clamp(15px,4.4vw,20px)!important;
  aspect-ratio:auto!important;
  opacity:.88!important;
}
#rppFaithfulV7 .v11-corners i:before,
#rppFaithfulV7 .v11-corners i:after{
  content:''!important;
  position:absolute!important;
  border-style:solid!important;
  border-color:#e7b34b!important;
}
#rppFaithfulV7 .v11-corners i:before{
  inset:0!important;
  border-width:1px 0 0 1px!important;
}
#rppFaithfulV7 .v11-corners i:after{
  inset:5px!important;
  border-width:1px 0 0 1px!important;
  border-color:#f1cf78!important;
}
#rppFaithfulV7 .v11-corners .tl{left:0!important;top:0!important;right:auto!important;bottom:auto!important;transform:none!important}
#rppFaithfulV7 .v11-corners .tr{right:0!important;top:0!important;left:auto!important;bottom:auto!important;transform:rotate(90deg)!important}
#rppFaithfulV7 .v11-corners .br{right:0!important;bottom:0!important;left:auto!important;top:auto!important;transform:rotate(180deg)!important}
#rppFaithfulV7 .v11-corners .bl{left:0!important;bottom:0!important;right:auto!important;top:auto!important;transform:rotate(270deg)!important}

/* Smaller generated lock with clear breathing room inside the password field. */
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #pw{
  padding-left:11.5%!important;
}
#rppFaithfulV7 .v7-lock{
  left:18.15%!important;
  top:67.15%!important;
  width:5.10%!important;
  height:4.05%!important;
  aspect-ratio:auto!important;
  background:url('/assets/lock-artdeco-v11-r3.svg?v=11r4') center/contain no-repeat!important;
  filter:drop-shadow(0 1px 2px rgba(0,0,0,.42)) drop-shadow(0 0 5px rgba(239,184,54,.28))!important;
}
#rppFaithfulV7 .v7-lock svg{display:none!important}

@media(max-width:380px){
  #rppFaithfulV7 .v11-corners{left:6.1%!important;right:6.1%!important}
  html body.rpp-faithful-v7 #gate #rppFaithfulV7 #pw{padding-left:11.8%!important}
  #rppFaithfulV7 .v7-lock{
    left:17.75%!important;
    top:67.16%!important;
    width:5.25%!important;
    height:4.08%!important;
  }
}
</style>
<script>
(()=>{
  const mark=()=>{
    const card=document.querySelector('#gate .gate-card');
    const lock=document.querySelector('#rppFaithfulV7 .v7-lock');
    const panel=document.querySelector('#rppFaithfulV7 .v7-panel');
    if(!card||!lock||!panel)return false;
    card.dataset.v11Lock='artdeco-compact-r4';
    card.dataset.v11Frame='uniform-double-frame';
    card.dataset.v11Revision='r4';
    return true;
  };
  const retry=()=>{if(mark())return;setTimeout(retry,90)};
  retry();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',retry,{once:true});
  setTimeout(mark,240);setTimeout(mark,620);
})();
</script>`;

function apply(response){return new HTMLRewriter().on('body',{element(el){el.append(V11_R4,{html:true})}}).transform(response)}

export default {
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx);
    const url=new URL(request.url),type=response.headers.get('content-type')||'';
    if(type.includes('text/html')&&['/','/index.html','/refresh','/latest'].includes(url.pathname))return apply(response);
    return response;
  }
};
