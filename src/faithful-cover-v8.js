import app from './faithful-cover-v7c.js';

const V8 = `
<style>
/* ROAD TO PEACE PRIDE — approved v8 balance / light / controls */
body.rpp-faithful-v7 #gate .gate-card.orn:after{
  background:
    radial-gradient(circle at 50% 50.7%,rgba(255,236,167,.28) 0%,rgba(255,201,82,.16) 4.5%,rgba(255,174,38,.07) 10%,transparent 22%),
    linear-gradient(180deg,rgba(0,5,18,.16) 0%,rgba(0,5,18,.015) 31%,rgba(0,5,18,.01) 50%,rgba(0,7,22,.16) 64%,rgba(0,7,23,.70) 100%),
    radial-gradient(ellipse at 50% 50%,transparent 34%,rgba(0,0,0,.08) 70%,rgba(0,0,0,.24) 100%)!important;
}
#rppFaithfulV7 .v7-path{display:none!important}
#rppFaithfulV8{position:absolute;inset:0;z-index:4;pointer-events:none;overflow:hidden}
#rppFaithfulV8 .v8-horizon-glow{position:absolute;left:34%;top:44.8%;width:32%;height:12%;background:radial-gradient(ellipse at 50% 50%,rgba(255,244,187,.60) 0%,rgba(255,213,102,.25) 16%,rgba(255,179,44,.09) 38%,transparent 70%);filter:blur(.35px);opacity:.95}
#rppFaithfulV8 .v8-horizon-glow:before,#rppFaithfulV8 .v8-horizon-glow:after{content:"";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:linear-gradient(90deg,transparent,rgba(255,230,145,.78),transparent)}
#rppFaithfulV8 .v8-horizon-glow:before{width:88%;height:1px}#rppFaithfulV8 .v8-horizon-glow:after{width:1px;height:72%;background:linear-gradient(180deg,transparent,rgba(255,230,145,.56),transparent)}
#rppFaithfulV8 .v8-road{position:absolute;left:19%;top:48.15%;width:62%;height:16.9%;overflow:visible;filter:drop-shadow(0 0 4px rgba(255,203,76,.38));opacity:.96}
#rppFaithfulV8 .v8-road .halo{fill:none;stroke:#f6bd3e;stroke-linecap:round;stroke-linejoin:round;opacity:.20;filter:blur(2.1px)}
#rppFaithfulV8 .v8-road .core{fill:none;stroke:url(#v8RoadGold);stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 0 1.4px rgba(255,227,135,.58))}
#rppFaithfulV8 .v8-road .s1{stroke-width:4.8}.v8-road .s2{stroke-width:3.6}.v8-road .s3{stroke-width:2.6}.v8-road .s4{stroke-width:1.8}.v8-road .s5{stroke-width:1.1}
#rppFaithfulV8 .v8-road .halo.s1{stroke-width:9}.v8-road .halo.s2{stroke-width:7}.v8-road .halo.s3{stroke-width:5}.v8-road .halo.s4{stroke-width:3.6}.v8-road .halo.s5{stroke-width:2.4}

/* bridge and lower panel — keep every border completely inside the card */
#rppFaithfulV7 .v7-bridge{top:65.15%!important;left:8.5%!important;right:8.5%!important;font-size:clamp(15px,3.7vw,19px)!important;letter-spacing:.065em!important;text-shadow:0 2px 10px rgba(0,0,0,.98),0 0 10px rgba(241,190,63,.22)!important}
#rppFaithfulV7 .v7-panel{
  left:7.35%!important;right:7.35%!important;top:68.15%!important;bottom:.95%!important;
  clip-path:none!important;border:1.45px solid rgba(226,174,68,.96)!important;border-radius:0!important;
  background:linear-gradient(180deg,rgba(3,22,50,.90),rgba(1,10,27,.985))!important;
  box-shadow:inset 0 0 0 1px rgba(255,234,164,.07),inset 0 0 34px rgba(0,0,0,.18),0 16px 38px rgba(0,0,0,.28)!important;
}
#rppFaithfulV7 .v7-panel:before{inset:2.2%!important;clip-path:none!important;border:1px solid rgba(232,188,92,.42)!important;border-radius:0!important}
#rppFaithfulV7 .v7-panel:after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,transparent 0 3.2%,rgba(241,199,102,.28) 3.2% 3.45%,transparent 3.45% 96.55%,rgba(241,199,102,.28) 96.55% 96.8%,transparent 96.8%),linear-gradient(180deg,transparent 0 3.4%,rgba(241,199,102,.20) 3.4% 3.65%,transparent 3.65% 96.35%,rgba(241,199,102,.20) 96.35% 96.6%,transparent 96.6%)}
#rppFaithfulV7 .v7-panel-top{top:67.55%!important;left:11%!important;right:11%!important}
#rppFaithfulV7 .v7-label{top:70.8%!important;font-size:clamp(12px,3.2vw,16px)!important}

/* password field */
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #pw{
  left:13.0%!important;top:73.65%!important;width:74%!important;height:6.55%!important;
  padding:0 5.5% 0 14%!important;border:1.7px solid #dcaa47!important;border-radius:14px!important;
  background:linear-gradient(180deg,rgba(7,29,61,.985),rgba(2,13,32,.995))!important;
  box-shadow:inset 0 0 0 1px rgba(255,231,151,.10),inset 0 -12px 24px rgba(0,0,0,.10),0 8px 20px rgba(0,0,0,.25),0 0 11px rgba(228,174,57,.06)!important;
}
#rppFaithfulV7 .v7-lock{left:16.15%!important;top:74.55%!important;width:5.55%!important;aspect-ratio:64/72!important;filter:drop-shadow(0 0 5px rgba(239,188,72,.22))!important}
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #msg{position:absolute!important;left:14%!important;right:14%!important;top:80.45%!important;min-height:0!important;height:auto!important;margin:0!important;padding:0!important;font-size:clamp(9px,2.35vw,11px)!important;line-height:1.05!important;text-align:center!important;z-index:35!important;background:none!important;border:0!important;box-shadow:none!important}

/* primary button: no clipping, full double frame */
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #unlock.rpp-action,
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #unlock{
  left:15.35%!important;top:82.25%!important;width:69.3%!important;height:7.05%!important;
  clip-path:none!important;border:2px solid #f0cd69!important;border-radius:4px!important;overflow:visible!important;
  background:linear-gradient(180deg,#ffe79c 0%,#f5cc62 16%,#dba33a 46%,#f2c960 72%,#b57518 100%)!important;
  box-shadow:inset 0 0 0 2px rgba(130,76,10,.82),inset 0 0 0 5px rgba(255,238,177,.16),0 11px 25px rgba(0,0,0,.30),0 0 25px rgba(238,182,62,.13)!important;
}
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #unlock:before{content:""!important;position:absolute!important;inset:4px!important;left:4px!important;right:4px!important;top:4px!important;bottom:4px!important;width:auto!important;height:auto!important;border:1px solid rgba(255,235,163,.50)!important;border-radius:2px!important;background:none!important;box-shadow:none!important;transform:none!important;pointer-events:none!important}
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #unlock:after{content:""!important;position:absolute!important;inset:0!important;left:0!important;right:0!important;top:0!important;bottom:0!important;width:auto!important;height:auto!important;background:linear-gradient(100deg,transparent 32%,rgba(255,255,255,.13) 48%,transparent 64%)!important;box-shadow:none!important;transform:none!important;pointer-events:none!important;opacity:.8!important}

/* author button: full rounded double frame and enough height for two lines */
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #gateAuthorLink.rpp-action,
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #gateAuthorLink{
  left:15.65%!important;top:91.80%!important;width:68.7%!important;height:6.35%!important;
  border:2px solid #e8bd57!important;border-radius:999px!important;overflow:visible!important;
  background:radial-gradient(circle at 50% 10%,rgba(255,255,255,.12),transparent 31%),linear-gradient(180deg,#0b2c5c 0%,#061e46 38%,#020d25 100%)!important;
  box-shadow:inset 0 0 0 2px rgba(94,55,9,.90),inset 0 0 0 5px rgba(244,204,105,.14),0 10px 25px rgba(0,0,0,.30),0 0 24px rgba(225,171,55,.11)!important;
}
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #gateAuthorLink::before{top:18%!important;font-size:clamp(14px,3.75vw,20px)!important;letter-spacing:.075em!important;color:#f0d282!important;text-shadow:0 1px 7px rgba(0,0,0,.8)!important}
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #gateAuthorLink::after{top:60%!important;font-size:clamp(8px,2.15vw,11px)!important;letter-spacing:.20em!important;color:#eac568!important}
@media(max-width:380px){
  #rppFaithfulV7 .v7-bridge{font-size:14px!important}
  html body.rpp-faithful-v7 #gate #rppFaithfulV7 #unlock{left:14.8%!important;width:70.4%!important}
  html body.rpp-faithful-v7 #gate #rppFaithfulV7 #gateAuthorLink{left:15.1%!important;width:69.8%!important}
}
</style>
<script>
(()=>{
 const ROAD='<div id="rppFaithfulV8" data-layout="faithful-v8-approved"><div class="v8-horizon-glow"></div><svg class="v8-road" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="v8RoadGold" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#d89521"/><stop offset=".28" stop-color="#f5bf47"/><stop offset=".62" stop-color="#ffe58c"/><stop offset="1" stop-color="#ffd15a"/></linearGradient></defs><path class="halo s1" d="M50 98 C26 94 75 88 53 80"/><path class="halo s2" d="M53 80 C39 74 66 68 49 62"/><path class="halo s3" d="M49 62 C40 57 60 52 50 47"/><path class="halo s4" d="M50 47 C44 42 56 37 50 32"/><path class="halo s5" d="M50 32 C47 27 53 21 50 12"/><path class="core s1" d="M50 98 C26 94 75 88 53 80"/><path class="core s2" d="M53 80 C39 74 66 68 49 62"/><path class="core s3" d="M49 62 C40 57 60 52 50 47"/><path class="core s4" d="M50 47 C44 42 56 37 50 32"/><path class="core s5" d="M50 32 C47 27 53 21 50 12"/></svg></div>';
 const LOCK='<svg viewBox="0 0 64 72" aria-hidden="true" focusable="false"><defs><linearGradient id="v8LockGold" x1="13" y1="5" x2="51" y2="66" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff1ad"/><stop offset=".33" stop-color="#e8bd57"/><stop offset=".70" stop-color="#aa6b18"/><stop offset="1" stop-color="#f0ce72"/></linearGradient></defs><path d="M20 31V22c0-10 5.1-16 12-16s12 6 12 16v9" fill="none" stroke="url(#v8LockGold)" stroke-width="3.6" stroke-linecap="round"/><path d="M24 30v-8.2c0-6.4 3.3-10.7 8-10.7s8 4.3 8 10.7V30" fill="none" stroke="#70470c" stroke-opacity=".48" stroke-width="1"/><rect x="12" y="29" width="40" height="34" rx="8" fill="#061a3a" fill-opacity=".82" stroke="url(#v8LockGold)" stroke-width="2.7"/><rect x="15.5" y="32.5" width="33" height="27" rx="5.3" fill="none" stroke="#f7da88" stroke-opacity=".22"/><path d="M32 40.5c-2.8 0-5 2.2-5 5 0 1.9 1 3.5 2.5 4.4l-.9 6.2h6.8l-.9-6.2c1.5-.9 2.5-2.5 2.5-4.4 0-2.8-2.2-5-5-5Z" fill="url(#v8LockGold)"/></svg>';
 const build=()=>{
   const card=document.querySelector('#gate .gate-card'),base=document.getElementById('rppFaithfulV7');if(!card||!base)return;
   if(!document.getElementById('rppFaithfulV8'))base.insertAdjacentHTML('beforeend',ROAD);
   const lock=base.querySelector('.v7-lock');if(lock)lock.innerHTML=LOCK;
   card.dataset.topPolish='faithful-v8';card.dataset.lightPath='approved-center-horizon';
 };
 build();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build,{once:true});setTimeout(build,80);setTimeout(build,260);
})();
</script>`;

function apply(response){return new HTMLRewriter().on('body',{element(el){el.append(V8,{html:true})}}).transform(response)}
export default {async fetch(request,env,ctx){const response=await app.fetch(request,env,ctx);const url=new URL(request.url),type=response.headers.get('content-type')||'';if(type.includes('text/html')&&['/','/index.html','/refresh','/latest'].includes(url.pathname))return apply(response);return response;}};
