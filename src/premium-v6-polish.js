import app from './viewer-logout.js';

const PREMIUM_V6 = `
<style>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&display=swap');
/* ROAD TO PEACE PRIDE — premium v6 refined top polish */
#rppCrispCopy .rpp-road{
  top:auto!important;
  margin-bottom:1.7%!important;
  font-family:"Cormorant Garamond",Baskerville,"Iowan Old Style","Palatino Linotype",Georgia,serif!important;
  font-weight:500!important;
  font-size:clamp(20px,5.65vw,29px)!important;
  letter-spacing:.19em!important;
  line-height:1!important;
  color:#f3d687!important;
  font-kerning:normal!important;
  font-feature-settings:"kern" 1,"liga" 1!important;
  text-rendering:geometricPrecision!important;
  -webkit-font-smoothing:antialiased!important;
  text-shadow:0 2px 15px rgba(0,0,0,.88),0 0 13px rgba(240,190,73,.12)!important;
}
#rppCrispCopy .rpp-pride{
  font-family:"Cormorant Garamond",Baskerville,"Iowan Old Style","Palatino Linotype",Georgia,serif!important;
  font-weight:400!important;
  font-size:clamp(44px,12.25vw,56px)!important;
  letter-spacing:.018em!important;
  line-height:.88!important;
  transform:scaleX(.94)!important;
  transform-origin:50% 50%!important;
  font-kerning:normal!important;
  font-feature-settings:"kern" 1,"liga" 1!important;
  text-rendering:geometricPrecision!important;
  -webkit-font-smoothing:antialiased!important;
  background:linear-gradient(180deg,#fff5c4 0%,#f5d67f 20%,#d39431 47%,#f1ca68 73%,#9a5d15 100%)!important;
  -webkit-background-clip:text!important;background-clip:text!important;
  color:transparent!important;-webkit-text-fill-color:transparent!important;
  filter:drop-shadow(0 1px 0 rgba(255,241,184,.18)) drop-shadow(0 4px 9px rgba(0,0,0,.30))!important;
}
#rppCrispCopy .title{top:11.25%!important;left:2.2%!important;right:2.2%!important}
.rpp-title-divider{top:24.2%!important;left:30%!important;width:40%!important;height:3.1%!important;opacity:.92!important}
#rppCrispCopy .jp{top:28.15%!important}
#rppCrispCopy .rpp-jp-date{font-size:clamp(17px,5vw,24px)!important;letter-spacing:.10em!important}
#rppCrispCopy .rpp-jp-main{margin-top:2.0%!important;font-size:clamp(23px,6.75vw,32px)!important;letter-spacing:.075em!important}
#rppCrispCopy .bridge{
  top:40.75%!important;
  left:10%!important;right:10%!important;
  color:#ebcc78!important;
  font-size:clamp(12px,3.25vw,16px)!important;
  font-weight:500!important;
  line-height:1.25!important;
  letter-spacing:.065em!important;
  white-space:nowrap!important;
  text-shadow:0 2px 11px rgba(0,0,0,.94),0 0 9px rgba(235,183,62,.18)!important;
}
#rppCrispCopy .bridge:before,#rppCrispCopy .bridge:after{
  content:''!important;display:inline-block!important;vertical-align:middle!important;
  width:clamp(24px,7.5vw,42px)!important;height:1px!important;margin:0 .72em!important;
  background:linear-gradient(90deg,transparent,#d7a947 38%,#f4d788 50%,#d7a947 62%,transparent)!important;
  box-shadow:0 0 6px rgba(241,202,107,.27)!important;
}
.rpp-v5-panel{
  top:52.8%!important;bottom:2.8%!important;left:6.7%!important;right:6.7%!important;
  background:linear-gradient(180deg,rgba(2,16,38,.82),rgba(1,10,25,.96))!important;
  border:1.2px solid rgba(218,163,62,.94)!important;
  box-shadow:inset 0 0 0 1px rgba(255,231,155,.08),inset 0 0 0 7px rgba(177,118,28,.035),0 18px 44px rgba(0,0,0,.30)!important;
}
.rpp-v5-panel:before{inset:2.0%!important;border-color:rgba(231,184,84,.45)!important}
#rppAuthLabel{
  top:55.65%!important;
  font-size:clamp(11px,3.05vw,15px)!important;
  letter-spacing:.12em!important;
  color:#e8cc7d!important;
}
#gate #pw{
  top:58.85%!important;left:11.2%!important;width:77.6%!important;height:7.65%!important;
  padding:0 6% 0 16.2%!important;
  border:1.7px solid #d8a345!important;
  border-radius:21px!important;
  background:linear-gradient(180deg,rgba(7,27,57,.98),rgba(2,12,31,.99))!important;
  color:#f8edce!important;
  box-shadow:inset 0 0 0 1px rgba(255,232,150,.11),inset 0 -14px 26px rgba(0,0,0,.10),0 9px 24px rgba(0,0,0,.26),0 0 15px rgba(219,163,49,.08)!important;
  font-size:clamp(13px,3.5vw,18px)!important;
}
#gate #pw::placeholder{color:rgba(213,217,225,.54)!important;letter-spacing:.035em!important}
#gate #pw:focus{border-color:#f2d47c!important;box-shadow:0 0 0 2px rgba(246,205,104,.18),0 10px 26px rgba(0,0,0,.30),0 0 24px rgba(224,175,62,.13)!important}
.rpp-v5-lock{
  left:14.45%!important;top:60.15%!important;width:29px!important;height:34px!important;aspect-ratio:auto!important;
  background:none!important;border:0!important;border-radius:0!important;box-shadow:none!important;filter:drop-shadow(0 0 5px rgba(233,181,67,.20))!important;
  display:block!important;overflow:visible!important;
}
.rpp-v5-lock:before,.rpp-v5-lock:after{content:none!important;display:none!important}
.rpp-v5-lock svg{display:block!important;width:100%!important;height:100%!important;overflow:visible!important}
html body #gate #unlock.rpp-action,#gate #unlock{
  top:68.55%!important;left:14.4%!important;width:71.2%!important;height:9.0%!important;
  padding:0 8%!important;
  border:2px solid #f1d17a!important;
  border-radius:0!important;
  clip-path:polygon(3.2% 0,96.8% 0,100% 18%,100% 82%,96.8% 100%,3.2% 100%,0 82%,0 18%)!important;
  background:linear-gradient(180deg,#ffe391 0%,#e6b63f 22%,#c68b1f 51%,#f1ca62 76%,#b57313 100%)!important;
  color:#211506!important;
  font-size:clamp(18px,4.8vw,25px)!important;
  letter-spacing:.105em!important;
  text-shadow:0 1px 0 rgba(255,255,255,.35)!important;
  box-shadow:inset 0 0 0 2px rgba(142,82,8,.82),inset 0 0 0 4px rgba(255,232,158,.18),0 13px 30px rgba(0,0,0,.31),0 0 26px rgba(230,172,52,.11)!important;
  filter:none!important;
}
#gate #unlock:hover,#gate #unlock:focus-visible{filter:brightness(1.04)!important;box-shadow:inset 0 0 0 2px rgba(142,82,8,.82),inset 0 0 0 4px rgba(255,232,158,.20),0 14px 33px rgba(0,0,0,.34),0 0 32px rgba(235,181,64,.15)!important}
html body #gate #gateAuthorLink.rpp-action,#gate #gateAuthorLink{
  top:81.0%!important;left:14.8%!important;width:70.4%!important;height:9.9%!important;
  border:2px solid #e7bd58!important;
  border-radius:999px!important;
  background:radial-gradient(circle at 50% 12%,rgba(255,255,255,.12),transparent 28%),linear-gradient(180deg,#0b2857 0%,#051b3f 34%,#020d24 100%)!important;
  box-shadow:inset 0 0 0 2px rgba(101,61,9,.92),inset 0 0 0 4px rgba(244,202,104,.17),0 12px 30px rgba(0,0,0,.30),0 0 28px rgba(217,163,57,.11)!important;
  animation:rppV6AuthorGlow 6.4s ease-in-out infinite!important;
}
#gate #gateAuthorLink::before{top:23%!important;font-size:clamp(15px,4.05vw,21px)!important;letter-spacing:.08em!important;color:#f0d589!important}
#gate #gateAuthorLink::after{top:61%!important;font-family:"Cormorant Garamond",Baskerville,Georgia,serif!important;font-size:clamp(9px,2.35vw,12px)!important;letter-spacing:.22em!important;color:#e9c667!important}
#gate #msg{top:66.7%!important;left:12%!important;right:12%!important;min-height:0!important;font-size:11px!important}
@keyframes rppV6AuthorGlow{0%,100%{filter:brightness(1);box-shadow:inset 0 0 0 2px rgba(101,61,9,.92),inset 0 0 0 4px rgba(244,202,104,.17),0 12px 30px rgba(0,0,0,.30),0 0 22px rgba(217,163,57,.07)}50%{filter:brightness(1.025);box-shadow:inset 0 0 0 2px rgba(101,61,9,.92),inset 0 0 0 4px rgba(244,202,104,.19),0 13px 32px rgba(0,0,0,.31),0 0 31px rgba(229,178,66,.13)}}
@media(max-width:380px){
  #rppCrispCopy .rpp-pride{font-size:42px!important;letter-spacing:.008em!important;transform:scaleX(.92)!important}
  #rppCrispCopy .bridge{left:7%!important;right:7%!important;font-size:11px!important}
  #rppCrispCopy .bridge:before,#rppCrispCopy .bridge:after{width:22px!important;margin:0 .55em!important}
  .rpp-v5-lock{left:14.1%!important;width:27px!important;height:32px!important}
  html body #gate #unlock.rpp-action,#gate #unlock{left:13.9%!important;width:72.2%!important}
  html body #gate #gateAuthorLink.rpp-action,#gate #gateAuthorLink{left:14.3%!important;width:71.4%!important}
}
@media(min-width:900px){
  #rppCrispCopy .rpp-road{font-size:25px!important}
  #rppCrispCopy .rpp-pride{font-size:51px!important}
  #rppCrispCopy .bridge{font-size:13px!important}
  #gate #pw{font-size:15px!important}
  html body #gate #unlock.rpp-action,#gate #unlock{font-size:21px!important}
  #gate #gateAuthorLink::before{font-size:18px!important}
  #gate #gateAuthorLink::after{font-size:10px!important}
}
@media(prefers-reduced-motion:reduce){#gate #gateAuthorLink{animation:none!important}}
</style>
<script>
(()=>{
  const lockSvg='<svg viewBox="0 0 64 72" aria-hidden="true" focusable="false"><defs><linearGradient id="rppLockGold" x1="9" y1="6" x2="55" y2="66" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff0a6"/><stop offset=".35" stop-color="#e7b84d"/><stop offset=".7" stop-color="#b87518"/><stop offset="1" stop-color="#f0cf70"/></linearGradient></defs><path d="M18 30V21C18 11.8 24.2 5 32 5s14 6.8 14 16v9" fill="none" stroke="url(#rppLockGold)" stroke-width="4.2" stroke-linecap="round"/><path d="M22 29V21.5C22 15 26.3 10.5 32 10.5S42 15 42 21.5V29" fill="none" stroke="#75500f" stroke-opacity=".55" stroke-width="1.2"/><rect x="10" y="28" width="44" height="36" rx="8" fill="#071b3d" stroke="url(#rppLockGold)" stroke-width="3.4"/><rect x="14" y="32" width="36" height="28" rx="5.5" fill="none" stroke="#f2ce72" stroke-opacity=".28"/><path d="M32 39.5c-3.2 0-5.7 2.5-5.7 5.6 0 2.1 1.1 3.9 2.9 4.9l-1.1 7h7.8l-1.1-7c1.8-1 2.9-2.8 2.9-4.9 0-3.1-2.5-5.6-5.7-5.6Z" fill="url(#rppLockGold)"/><path d="M16 37h5M43 37h5M16 55h5M43 55h5" stroke="#e2b14b" stroke-opacity=".55" stroke-width="1.4" stroke-linecap="round"/></svg>';
  const mark=()=>{
    const card=document.querySelector('#gate .gate-card');if(card)card.dataset.topPolish='premium-v6-refined';
    const lock=document.querySelector('.rpp-v5-lock');if(lock&&!lock.querySelector('svg'))lock.innerHTML=lockSvg;
  };
  mark();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mark,{once:true});setTimeout(mark,80);
})();
</script>`;

function apply(response){return new HTMLRewriter().on('body',{element(el){el.append(PREMIUM_V6,{html:true})}}).transform(response)}

export default {
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx);
    const url=new URL(request.url),type=response.headers.get('content-type')||'';
    if(type.includes('text/html')&&['/','/index.html','/refresh','/latest'].includes(url.pathname))return apply(response);
    return response;
  }
};
