import app from './faithful-cover-v10.js';

const V11 = `
<style>
/* ROAD TO PEACE PRIDE — faithful v11 reference match */

/* Full rectangular gate card: never clip or lose corners. */
#rppFaithfulV7 .v7-panel{
  left:6.5%!important;right:6.5%!important;
  top:63.6%!important;bottom:13.2%!important;
  clip-path:none!important;border-radius:0!important;overflow:visible!important;
  border:1.45px solid rgba(230,184,76,.96)!important;
  background:linear-gradient(180deg,rgba(2,20,46,.92),rgba(1,10,27,.975))!important;
  box-shadow:inset 0 0 0 1px rgba(255,231,151,.075),0 17px 42px rgba(0,0,0,.30)!important;
}
#rppFaithfulV7 .v7-panel:before{
  content:''!important;position:absolute!important;inset:1.7%!important;
  border:1px solid rgba(232,190,92,.46)!important;border-radius:0!important;clip-path:none!important;
  pointer-events:none!important
}
#rppFaithfulV7 .v7-panel:after{
  content:''!important;position:absolute!important;inset:0!important;pointer-events:none!important;
  background:
    linear-gradient(90deg,#e9bd5c 0 4.5%,transparent 4.5% 95.5%,#e9bd5c 95.5% 100%) top/100% 1px no-repeat,
    linear-gradient(90deg,#e9bd5c 0 4.5%,transparent 4.5% 95.5%,#e9bd5c 95.5% 100%) bottom/100% 1px no-repeat,
    linear-gradient(180deg,#e9bd5c 0 7%,transparent 7% 93%,#e9bd5c 93% 100%) left/1px 100% no-repeat,
    linear-gradient(180deg,#e9bd5c 0 7%,transparent 7% 93%,#e9bd5c 93% 100%) right/1px 100% no-repeat!important;
  opacity:.72!important
}
#rppFaithfulV7 .v11-corners{position:absolute!important;inset:0!important;pointer-events:none!important;z-index:7!important}
#rppFaithfulV7 .v11-corners i{position:absolute!important;width:5.8%!important;aspect-ratio:1!important;opacity:.92!important}
#rppFaithfulV7 .v11-corners i:before,#rppFaithfulV7 .v11-corners i:after{content:''!important;position:absolute!important;border-style:solid!important;border-color:#e4ad3e!important}
#rppFaithfulV7 .v11-corners i:before{inset:0!important;border-width:1px 0 0 1px!important}
#rppFaithfulV7 .v11-corners i:after{inset:22%!important;border-width:1px 0 0 1px!important;border-color:#f0ce76!important}
#rppFaithfulV7 .v11-corners .tl{left:6.9%!important;top:64.2%!important}
#rppFaithfulV7 .v11-corners .tr{right:6.9%!important;top:64.2%!important;transform:rotate(90deg)!important}
#rppFaithfulV7 .v11-corners .br{right:6.9%!important;top:82.1%!important;transform:rotate(180deg)!important}
#rppFaithfulV7 .v11-corners .bl{left:6.9%!important;top:82.1%!important;transform:rotate(270deg)!important}

/* Password / lock. */
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #pw{
  left:15.15%!important;top:66.4%!important;width:69.7%!important;height:5.7%!important;
  padding-left:13.8%!important;border:1.55px solid #e0ad47!important;border-radius:16px!important;
  background:linear-gradient(180deg,rgba(7,29,62,.985),rgba(2,12,31,.997))!important;
  box-shadow:inset 0 0 0 1px rgba(255,230,147,.10),0 8px 20px rgba(0,0,0,.24),0 0 10px rgba(228,175,56,.06)!important
}
#rppFaithfulV7 .v7-lock{
  left:17.6%!important;top:66.75%!important;width:6.25%!important;aspect-ratio:1!important;
  filter:drop-shadow(0 0 6px rgba(240,190,72,.30))!important
}
#rppFaithfulV7 .v7-lock svg{width:100%!important;height:100%!important;display:block!important}
#rppFaithfulV7 .v10-helper{top:72.85%!important;color:#e2bd61!important}
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #msg{top:72.65%!important}

/* Reference-match primary button. */
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #unlock.rpp-action,
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #unlock{
  left:13.75%!important;top:75.45%!important;width:72.5%!important;height:7.95%!important;
  min-height:0!important;max-height:none!important;border:0!important;border-radius:0!important;
  clip-path:none!important;overflow:hidden!important;padding:0 8%!important;
  background:url('/assets/unlock-luxury-v11.svg') center/100% 100% no-repeat!important;
  color:#1a0d02!important;
  font:800 clamp(21px,5.15vw,29px)/1 ui-serif,"Yu Mincho","Hiragino Mincho ProN",serif!important;
  letter-spacing:.075em!important;
  text-shadow:0 1px 0 rgba(255,250,220,.55),0 2px 8px rgba(71,34,0,.16)!important;
  box-shadow:0 13px 32px rgba(0,0,0,.35),0 0 32px rgba(234,182,61,.15)!important;
}
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #unlock::before,
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #unlock::after{display:none!important}
#rppFaithfulV7 .v9-shine-layer.unlock{
  left:13.75%!important;top:75.45%!important;width:72.5%!important;height:7.95%!important;border-radius:4px!important
}

/* Keep standalone author button balanced beneath the card. */
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #gateAuthorLink.rpp-action,
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #gateAuthorLink{
  left:16.3%!important;top:88.35%!important;width:67.4%!important;height:6.35%!important
}
#rppFaithfulV7 .v9-shine-layer.author{
  left:16.3%!important;top:88.35%!important;width:67.4%!important;height:6.35%!important
}

/* Shooting stars — restrained and only across the sky. */
#rppFaithfulV7 .v11-stars{position:absolute!important;inset:0!important;z-index:2!important;overflow:hidden!important;pointer-events:none!important}
#rppFaithfulV7 .v11-star{position:absolute!important;width:20%!important;height:1px!important;opacity:0!important;transform-origin:right center!important;
  background:linear-gradient(90deg,transparent 0%,rgba(255,221,121,.10) 36%,rgba(255,234,164,.76) 82%,rgba(255,252,224,.98) 100%)!important;
  filter:drop-shadow(0 0 4px rgba(255,212,92,.60))!important
}
#rppFaithfulV7 .v11-star:after{content:''!important;position:absolute!important;right:-2px!important;top:50%!important;width:4px!important;height:4px!important;border-radius:50%!important;transform:translateY(-50%)!important;background:#fff5c6!important;box-shadow:0 0 5px #fff1b1,0 0 11px rgba(255,202,73,.95)!important}
#rppFaithfulV7 .v11-star.s1{top:13.5%!important;left:-24%!important;transform:rotate(-26deg)!important;animation:v11ShootA 10.5s linear infinite 1.1s!important}
#rppFaithfulV7 .v11-star.s2{top:23.2%!important;left:-28%!important;transform:rotate(-24deg)!important;animation:v11ShootA 13.2s linear infinite 5.8s!important}
#rppFaithfulV7 .v11-star.s3{top:12.5%!important;right:-25%!important;transform:rotate(206deg)!important;animation:v11ShootB 11.8s linear infinite 3.4s!important}
#rppFaithfulV7 .v11-star.s4{top:31%!important;right:-27%!important;transform:rotate(204deg)!important;animation:v11ShootB 14.8s linear infinite 8.6s!important}
@keyframes v11ShootA{
  0%,72%{opacity:0;translate:0 0}75%{opacity:.98}82%{opacity:.95}90%{opacity:0;translate:145cqw 65cqw}100%{opacity:0;translate:145cqw 65cqw}
}
@keyframes v11ShootB{
  0%,70%{opacity:0;translate:0 0}73%{opacity:.98}81%{opacity:.95}89%{opacity:0;translate:-145cqw 66cqw}100%{opacity:0;translate:-145cqw 66cqw}
}

@media(max-width:380px){
  #rppFaithfulV7 .v7-panel{left:6.1%!important;right:6.1%!important}
  html body.rpp-faithful-v7 #gate #rppFaithfulV7 #pw{left:14.5%!important;width:71%!important}
  #rppFaithfulV7 .v7-lock{left:17.1%!important;width:6.5%!important}
  html body.rpp-faithful-v7 #gate #rppFaithfulV7 #unlock.rpp-action,
  html body.rpp-faithful-v7 #gate #rppFaithfulV7 #unlock{left:13%!important;width:74%!important}
  #rppFaithfulV7 .v9-shine-layer.unlock{left:13%!important;width:74%!important}
}
@media(prefers-reduced-motion:reduce){
  #rppFaithfulV7 .v11-star{animation:none!important;display:none!important}
}
</style>
<script>
(()=>{
 const LOCK='<svg viewBox="0 0 72 72" aria-hidden="true" focusable="false"><defs><linearGradient id="v11LockGold" x1="10" y1="4" x2="60" y2="68" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff2ad"/><stop offset=".24" stop-color="#f0c85c"/><stop offset=".54" stop-color="#b87517"/><stop offset=".78" stop-color="#ffe18a"/><stop offset="1" stop-color="#8c5008"/></linearGradient><radialGradient id="v11LockFace" cx="50%" cy="30%" r="80%"><stop offset="0" stop-color="#ffe89b"/><stop offset=".42" stop-color="#d79a2a"/><stop offset="1" stop-color="#a4600d"/></radialGradient></defs><path d="M20 33V23c0-11 6.4-18 16-18s16 7 16 18v10" fill="none" stroke="url(#v11LockGold)" stroke-width="6" stroke-linecap="round"/><path d="M24 32v-9c0-7.7 4.5-12 12-12s12 4.3 12 12v9" fill="none" stroke="#73420a" stroke-opacity=".55" stroke-width="1.5"/><rect x="11" y="30" width="50" height="36" rx="8" fill="url(#v11LockFace)" stroke="url(#v11LockGold)" stroke-width="3"/><rect x="15" y="34" width="42" height="28" rx="5" fill="none" stroke="#fff1ab" stroke-opacity=".42"/><path d="M36 40c-4 0-7 3.1-7 7 0 2.5 1.3 4.7 3.3 5.9l-1.3 7.3h10l-1.3-7.3c2-1.2 3.3-3.4 3.3-5.9 0-3.9-3-7-7-7z" fill="#2b1705" stroke="#f8d871" stroke-width="1"/><g fill="#fff3b0"><path d="M8 46h7M11.5 42.5v7"/><path d="M57 46h7M60.5 42.5v7"/></g></svg>';
 const init=()=>{
   const card=document.querySelector('#gate .gate-card'),base=document.getElementById('rppFaithfulV7');if(!card||!base)return false;
   card.dataset.v11Layout='reference-frame-stars';
   card.dataset.v11Frame='full-rectangle';
   card.dataset.v11Button='ornate-gold';
   card.dataset.v11Stars='animated';
   const lock=base.querySelector('.v7-lock');if(lock)lock.innerHTML=LOCK;
   if(!base.querySelector('.v11-corners')){const c=document.createElement('div');c.className='v11-corners';c.innerHTML='<i class="tl"></i><i class="tr"></i><i class="br"></i><i class="bl"></i>';base.appendChild(c)}
   if(!base.querySelector('.v11-stars')){const s=document.createElement('div');s.className='v11-stars';s.setAttribute('aria-hidden','true');s.innerHTML='<i class="v11-star s1"></i><i class="v11-star s2"></i><i class="v11-star s3"></i><i class="v11-star s4"></i>';base.appendChild(s)}
   return true;
 };
 const retry=()=>{if(init())return;setTimeout(retry,80)};
 retry();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',retry,{once:true});setTimeout(retry,180);setTimeout(retry,520);
})();
</script>`;

function apply(response){return new HTMLRewriter().on('body',{element(el){el.append(V11,{html:true})}}).transform(response)}
export default {async fetch(request,env,ctx){const response=await app.fetch(request,env,ctx);const url=new URL(request.url),type=response.headers.get('content-type')||'';if(type.includes('text/html')&&['/','/index.html','/refresh','/latest'].includes(url.pathname))return apply(response);return response;}};
