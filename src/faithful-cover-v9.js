import app from './faithful-cover-v8.js';

const V9 = `
<style>
/* ROAD TO PEACE PRIDE — faithful v9 responsive finish */

/* Keep the approved base artwork; remove the artificial road drawn over it. */
#rppFaithfulV8 .v8-road{display:none!important}
#rppFaithfulV8 .v8-horizon-glow{
  top:46.2%!important;height:8.8%!important;opacity:.58!important;filter:blur(.8px)!important
}

/* Scale the complete top proportionally with each device width. */
body.rpp-faithful-v7 #gate .gate-card{
  width:min(100vw,560px)!important;
  aspect-ratio:9/16!important;
  container-type:inline-size!important;
}
@media (orientation:landscape){
  body.rpp-faithful-v7 #gate .gate-card{width:min(72vw,calc(100svh * .5625),560px)!important}
}

/* Move the bridge copy directly below the Japanese title. */
#rppFaithfulV7 .v7-bridge{
  top:37.85%!important;left:11%!important;right:11%!important;
  font-size:clamp(11px,3.05vw,16px)!important;
  letter-spacing:.07em!important;gap:9px!important;
  color:#e8c66f!important;
  text-shadow:0 2px 9px rgba(0,0,0,.96),0 0 9px rgba(241,191,67,.16)!important;
}
#rppFaithfulV7 .v7-bridge:before,#rppFaithfulV7 .v7-bridge:after{
  font-size:.62em!important;opacity:.9!important
}

/* Lower control panel: always remain inside both outer gold frames. */
#rppFaithfulV7 .v7-panel{
  left:7.8%!important;right:7.8%!important;top:68.45%!important;bottom:2.85%!important;
  clip-path:none!important;border:1.35px solid rgba(226,174,68,.94)!important;border-radius:0!important;
  overflow:hidden!important;
}
#rppFaithfulV7 .v7-panel:before{inset:2.45%!important;clip-path:none!important}
#rppFaithfulV7 .v7-panel:after{inset:0!important}
#rppFaithfulV7 .v7-panel-top{top:67.95%!important;left:11.5%!important;right:11.5%!important}
#rppFaithfulV7 .v7-label{top:70.7%!important}

html body.rpp-faithful-v7 #gate #rppFaithfulV7 #pw{
  left:13.2%!important;top:73.55%!important;width:73.6%!important;height:6.25%!important;
  padding-left:13.5%!important;border-radius:15px!important;
}
#rppFaithfulV7 .v7-lock{left:16.2%!important;top:74.25%!important;width:5.35%!important}
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #msg{
  top:80.15%!important;left:14%!important;right:14%!important
}

html body.rpp-faithful-v7 #gate #rppFaithfulV7 #unlock.rpp-action,
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #unlock{
  left:15.8%!important;top:82.0%!important;width:68.4%!important;height:6.75%!important;
  min-height:0!important;max-height:none!important;box-sizing:border-box!important;
  border-radius:5px!important;clip-path:none!important;overflow:hidden!important;
  transition:transform .14s ease,filter .18s ease,box-shadow .18s ease!important;
}
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #gateAuthorLink.rpp-action,
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #gateAuthorLink{
  left:15.9%!important;top:90.15%!important;width:68.2%!important;height:5.95%!important;
  min-height:0!important;max-height:none!important;box-sizing:border-box!important;
  overflow:hidden!important;
  transition:transform .14s ease,filter .18s ease,box-shadow .18s ease!important;
}
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #gateAuthorLink::before{
  top:17%!important;font-size:clamp(13px,3.55vw,19px)!important
}
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #gateAuthorLink::after{
  top:59%!important;font-size:clamp(7px,2.05vw,10.5px)!important
}

/* Elegant click / focus animation. The shine is a real child so existing pseudo text stays intact. */
#rppFaithfulV7 #unlock .v9-shine,#rppFaithfulV7 #gateAuthorLink .v9-shine{
  position:absolute!important;z-index:40!important;top:-38%!important;left:-45%!important;
  width:24%!important;height:176%!important;pointer-events:none!important;opacity:0!important;
  background:linear-gradient(105deg,transparent 0%,rgba(255,255,255,.06) 30%,rgba(255,249,220,.68) 50%,rgba(255,255,255,.08) 70%,transparent 100%)!important;
  transform:translateX(-220%) skewX(-17deg)!important;
  filter:blur(.25px)!important;
}
#rppFaithfulV7 #gateAuthorLink .v9-shine{background:linear-gradient(105deg,transparent 0%,rgba(255,231,153,.04) 30%,rgba(255,226,137,.48) 50%,rgba(255,231,153,.05) 70%,transparent 100%)!important}
#rppFaithfulV7 #unlock.v9-flash .v9-shine,#rppFaithfulV7 #gateAuthorLink.v9-flash .v9-shine{
  animation:v9ShineSweep .72s cubic-bezier(.22,.74,.28,1) both!important
}
@keyframes v9ShineSweep{
  0%{transform:translateX(-220%) skewX(-17deg);opacity:0}
  14%{opacity:.92}
  100%{transform:translateX(650%) skewX(-17deg);opacity:0}
}
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #unlock:active,
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #gateAuthorLink:active{
  transform:translateY(1px) scale(.987)!important;filter:brightness(1.045)!important
}
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #unlock:focus-visible,
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #gateAuthorLink:focus-visible{
  outline:2px solid rgba(255,226,139,.76)!important;outline-offset:3px!important;
  box-shadow:0 0 0 1px rgba(255,246,205,.24),0 10px 28px rgba(0,0,0,.30),0 0 24px rgba(238,186,72,.22)!important
}

/* Narrow phones: keep all controls inside the frame without crowding. */
@media(max-width:380px){
  #rppFaithfulV7 .v7-bridge{top:38.15%!important;font-size:10.5px!important;gap:7px!important}
  #rppFaithfulV7 .v7-panel{left:7.4%!important;right:7.4%!important;bottom:2.75%!important}
  html body.rpp-faithful-v7 #gate #rppFaithfulV7 #pw{left:12.7%!important;width:74.6%!important}
  html body.rpp-faithful-v7 #gate #rppFaithfulV7 #unlock{left:15.1%!important;width:69.8%!important}
  html body.rpp-faithful-v7 #gate #rppFaithfulV7 #gateAuthorLink{left:15.2%!important;width:69.6%!important}
}
@media(prefers-reduced-motion:reduce){
  #rppFaithfulV7 #unlock,#rppFaithfulV7 #gateAuthorLink{transition:none!important}
  #rppFaithfulV7 #unlock .v9-shine,#rppFaithfulV7 #gateAuthorLink .v9-shine{display:none!important}
  #rppFaithfulV7 #unlock:active,#rppFaithfulV7 #gateAuthorLink:active{transform:none!important}
}
</style>
<script>
(()=>{
  const arm=()=>{
    const card=document.querySelector('#gate .gate-card');
    const base=document.getElementById('rppFaithfulV7');
    if(!card||!base)return false;
    card.dataset.topPolish='faithful-v9';
    card.dataset.v9Layout='responsive-premium';
    card.dataset.v9Road='base-art-only';
    const controls=[document.getElementById('unlock'),document.getElementById('gateAuthorLink')];
    let ready=true;
    for(const el of controls){
      if(!el){ready=false;continue}
      if(!el.querySelector('.v9-shine')){
        const shine=document.createElement('span');shine.className='v9-shine';shine.setAttribute('aria-hidden','true');el.appendChild(shine);
      }
      if(el.dataset.v9Armed==='1')continue;
      el.dataset.v9Armed='1';
      const flash=()=>{el.classList.remove('v9-flash');void el.offsetWidth;el.classList.add('v9-flash');setTimeout(()=>el.classList.remove('v9-flash'),760)};
      el.addEventListener('pointerdown',flash,{passive:true});
      el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){flash()}});
    }
    return ready;
  };
  const retry=()=>{if(arm())return;setTimeout(retry,80)};
  retry();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',retry,{once:true});setTimeout(retry,180);setTimeout(retry,520);
})();
</script>`;

function apply(response){return new HTMLRewriter().on('body',{element(el){el.append(V9,{html:true})}}).transform(response)}

export default {
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx);
    const url=new URL(request.url),type=response.headers.get('content-type')||'';
    if(type.includes('text/html')&&['/','/index.html','/refresh','/latest'].includes(url.pathname))return apply(response);
    return response;
  }
};
