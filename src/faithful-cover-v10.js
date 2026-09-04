import app from './faithful-cover-v9.js';

const V10 = `
<style>
/* ROAD TO PEACE PRIDE — faithful v10 approved clean layout */

/* Remove the extra lower headings/diamonds so the interaction reads instantly. */
#rppFaithfulV7 .v7-label,
#rppFaithfulV7 .v7-panel-top,
#rppFaithfulV7 .v7-btn-deco{display:none!important}

/* Main interaction card: password + open button only. */
#rppFaithfulV7 .v7-panel{
  left:6.8%!important;right:6.8%!important;
  top:64.25%!important;bottom:13.55%!important;
  border:1.15px solid rgba(226,174,68,.91)!important;
  background:linear-gradient(180deg,rgba(2,19,44,.90),rgba(1,10,27,.965))!important;
  box-shadow:inset 0 0 0 1px rgba(255,229,146,.055),0 18px 42px rgba(0,0,0,.28)!important;
  clip-path:polygon(3.2% 0,96.8% 0,100% 4.2%,100% 95.8%,96.8% 100%,3.2% 100%,0 95.8%,0 4.2%)!important;
  overflow:hidden!important
}
#rppFaithfulV7 .v7-panel:before{
  inset:1.85%!important;border-color:rgba(229,181,75,.34)!important
}

/* Password field becomes the first clear action. */
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #pw{
  left:15.4%!important;top:67.15%!important;width:69.2%!important;height:5.55%!important;
  padding:0 5.2% 0 13.0%!important;
  border:1.35px solid rgba(224,165,54,.95)!important;border-radius:14px!important;
  background:linear-gradient(180deg,rgba(7,27,59,.97),rgba(2,12,30,.995))!important;
  box-shadow:inset 0 0 0 1px rgba(255,228,145,.075),0 8px 20px rgba(0,0,0,.22)!important;
  font-size:clamp(12px,3.2vw,17px)!important
}
#rppFaithfulV7 .v7-lock{
  left:18.35%!important;top:67.85%!important;width:4.9%!important
}

/* Helper copy: visible by default, replaced by the live validation message when needed. */
#rppFaithfulV7 .v10-helper{
  position:absolute!important;z-index:32!important;left:13%!important;right:13%!important;top:73.45%!important;
  text-align:center!important;color:#dfb85b!important;
  font:500 clamp(9px,2.45vw,12.5px)/1.2 ui-serif,"Yu Mincho","Hiragino Mincho ProN",serif!important;
  letter-spacing:.045em!important;text-shadow:0 2px 7px rgba(0,0,0,.88)!important;pointer-events:none!important
}
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #msg{
  top:73.28%!important;left:13%!important;right:13%!important;z-index:33!important;
  min-height:1.15em!important;font-size:clamp(9px,2.45vw,12.5px)!important;line-height:1.2!important
}

/* Main CTA: larger, cleaner, and more premium. Keep existing luxury SVG artwork. */
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #unlock.rpp-action,
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #unlock{
  left:14.2%!important;top:76.0%!important;width:71.6%!important;height:7.45%!important;
  min-height:0!important;max-height:none!important;padding:0 7%!important;
  border:0!important;border-radius:6px!important;clip-path:none!important;overflow:hidden!important;
  background:url('/assets/unlock-luxury-v10.svg') center/100% 100% no-repeat!important;
  color:#1a0f03!important;
  font:800 clamp(20px,5.0vw,27px)/1 ui-serif,"Yu Mincho","Hiragino Mincho ProN",serif!important;
  letter-spacing:.085em!important;
  text-shadow:0 1px 0 rgba(255,249,218,.55),0 2px 8px rgba(72,38,0,.14)!important;
  box-shadow:0 12px 31px rgba(0,0,0,.34),0 0 30px rgba(232,181,64,.15)!important;
  transition:transform .14s ease,filter .18s ease,box-shadow .18s ease!important
}
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #unlock::before,
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #unlock::after{display:none!important}
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #unlock:hover,
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #unlock:focus-visible{
  filter:brightness(1.05) saturate(1.04)!important;
  box-shadow:0 14px 35px rgba(0,0,0,.38),0 0 36px rgba(238,190,76,.21)!important
}

/* Author CTA sits on its own — no surrounding outer panel or diamond/icon. */
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #gateAuthorLink.rpp-action,
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #gateAuthorLink{
  left:16.1%!important;top:88.15%!important;width:67.8%!important;height:6.45%!important;
  min-height:0!important;max-height:none!important;padding:0!important;
  border:1.55px solid rgba(230,184,78,.97)!important;border-radius:999px!important;
  background:radial-gradient(circle at 50% 5%,rgba(255,255,255,.115),transparent 29%),linear-gradient(180deg,#0a2a59 0%,#061b3e 40%,#020c22 100%)!important;
  box-shadow:inset 0 0 0 1px rgba(111,65,9,.88),inset 0 0 0 3px rgba(238,195,89,.10),0 11px 25px rgba(0,0,0,.30),0 0 23px rgba(220,168,55,.09)!important;
  overflow:hidden!important;transition:transform .14s ease,filter .18s ease,box-shadow .18s ease!important
}
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #gateAuthorLink::before{
  top:19%!important;font-size:clamp(14px,3.7vw,20px)!important;letter-spacing:.055em!important
}
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #gateAuthorLink::after{
  top:61%!important;font-size:clamp(7px,2.0vw,10.5px)!important;letter-spacing:.22em!important
}

/* Keep the existing shine animation, only move the overlays to match the v10 controls. */
#rppFaithfulV7 .v9-shine-layer.unlock{
  left:14.2%!important;top:76.0%!important;width:71.6%!important;height:7.45%!important;border-radius:6px!important
}
#rppFaithfulV7 .v9-shine-layer.author{
  left:16.1%!important;top:88.15%!important;width:67.8%!important;height:6.45%!important;border-radius:999px!important
}

/* Narrow phones: slightly widen controls while keeping both frames clear. */
@media(max-width:380px){
  #rppFaithfulV7 .v7-panel{left:6.4%!important;right:6.4%!important;top:64.45%!important;bottom:13.45%!important}
  html body.rpp-faithful-v7 #gate #rppFaithfulV7 #pw{left:14.5%!important;width:71%!important}
  #rppFaithfulV7 .v7-lock{left:17.6%!important}
  html body.rpp-faithful-v7 #gate #rppFaithfulV7 #unlock.rpp-action,
  html body.rpp-faithful-v7 #gate #rppFaithfulV7 #unlock{left:13.3%!important;width:73.4%!important}
  html body.rpp-faithful-v7 #gate #rppFaithfulV7 #gateAuthorLink.rpp-action,
  html body.rpp-faithful-v7 #gate #rppFaithfulV7 #gateAuthorLink{left:15.1%!important;width:69.8%!important}
  #rppFaithfulV7 .v9-shine-layer.unlock{left:13.3%!important;width:73.4%!important}
  #rppFaithfulV7 .v9-shine-layer.author{left:15.1%!important;width:69.8%!important}
}

@media(prefers-reduced-motion:reduce){
  #rppFaithfulV7 #unlock,#rppFaithfulV7 #gateAuthorLink{transition:none!important}
}
</style>
<script>
(()=>{
  const init=()=>{
    const card=document.querySelector('#gate .gate-card');
    const base=document.getElementById('rppFaithfulV7');
    const msg=document.getElementById('msg');
    if(!card||!base)return false;
    card.dataset.v10Layout='approved-clean-cards';
    card.dataset.v10Author='standalone';
    card.dataset.v10Icons='none';
    let helper=base.querySelector('.v10-helper');
    if(!helper){
      helper=document.createElement('div');
      helper.className='v10-helper';
      helper.textContent='パスワードを入力すると、記録を閲覧できます。';
      base.appendChild(helper);
    }
    const sync=()=>{
      const hasMsg=!!(msg&&msg.textContent&&msg.textContent.trim());
      helper.style.opacity=hasMsg?'0':'1';
    };
    sync();
    if(msg&&!msg.dataset.v10Observed){
      msg.dataset.v10Observed='1';
      new MutationObserver(sync).observe(msg,{subtree:true,childList:true,characterData:true});
    }
    return true;
  };
  const retry=()=>{if(init())return;setTimeout(retry,80)};
  retry();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',retry,{once:true});setTimeout(retry,180);setTimeout(retry,520);
})();
</script>`;

function apply(response){return new HTMLRewriter().on('body',{element(el){el.append(V10,{html:true})}}).transform(response)}

export default {
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx);
    const url=new URL(request.url),type=response.headers.get('content-type')||'';
    if(type.includes('text/html')&&['/','/index.html','/refresh','/latest'].includes(url.pathname))return apply(response);
    return response;
  }
};
