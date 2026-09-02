import app from './top-bg-enhancer.js';

const MOTION_LAYER = `
<style>
:root{
  --rpp-ease:cubic-bezier(.22,.78,.2,1);
  --rpp-ease-out:cubic-bezier(.16,1,.3,1);
  --rpp-gold:#d8ae55;
  --rpp-gold-bright:#f4dc91;
  --rpp-deep:#06142d;
}
html{-webkit-tap-highlight-color:transparent}
button,a,.btn,.pill,.mini-btn,.toc-item button{touch-action:manipulation}
.rpp-action{position:relative!important;overflow:hidden!important;isolation:isolate;transform:translateZ(0);transition:transform .22s var(--rpp-ease),box-shadow .26s var(--rpp-ease),border-color .22s ease,background-color .22s ease,color .22s ease,filter .22s ease!important;will-change:transform}
.rpp-action::before{content:"";position:absolute;inset:-35%;z-index:-1;pointer-events:none;background:linear-gradient(110deg,transparent 32%,rgba(255,244,195,0) 41%,rgba(255,244,195,.3) 49%,rgba(255,244,195,0) 57%,transparent 68%);transform:translateX(-82%) rotate(7deg);transition:transform .68s var(--rpp-ease-out);opacity:.78}
.rpp-action::after{content:"";position:absolute;z-index:3;width:16px;height:16px;left:var(--rpp-x,50%);top:var(--rpp-y,50%);border-radius:999px;pointer-events:none;background:radial-gradient(circle,rgba(255,246,207,.55) 0%,rgba(233,190,92,.24) 34%,transparent 70%);transform:translate(-50%,-50%) scale(0);opacity:0}
.rpp-action.rpp-rippling::after{animation:rppRipple .62s var(--rpp-ease-out)}
.rpp-action:hover{transform:translateY(-2px);filter:brightness(1.055)}
.rpp-action:hover::before,.rpp-action:focus-visible::before{transform:translateX(82%) rotate(7deg)}
.rpp-action:active,.rpp-action.rpp-pressed{transform:translateY(1px) scale(.982);transition-duration:.08s!important}
.rpp-action:focus-visible{outline:2px solid var(--rpp-gold-bright)!important;outline-offset:4px!important;box-shadow:0 0 0 5px rgba(221,177,78,.14)!important}
.primary.rpp-action,#submit.rpp-action,#unlock.rpp-action{box-shadow:0 10px 28px rgba(151,99,22,.24),inset 0 1px 0 rgba(255,250,218,.62),inset 0 -2px 0 rgba(91,51,6,.18)!important}
.primary.rpp-action:hover,#submit.rpp-action:hover,#unlock.rpp-action:hover{box-shadow:0 15px 38px rgba(182,125,33,.33),0 0 28px rgba(229,184,84,.12),inset 0 1px 0 rgba(255,251,223,.78)!important}
.secondary.rpp-action,.ghost.rpp-action,.mini-btn.rpp-action,.pill.rpp-action{box-shadow:inset 0 0 0 1px rgba(237,207,131,.03),0 7px 18px rgba(0,0,0,.12)!important}
.secondary.rpp-action:hover,.ghost.rpp-action:hover,.mini-btn.rpp-action:hover,.pill.rpp-action:hover{border-color:rgba(240,208,126,.76)!important;box-shadow:0 10px 26px rgba(0,0,0,.22),0 0 20px rgba(218,174,82,.08),inset 0 0 0 1px rgba(239,207,129,.08)!important}

/* Top login: live controls cover the baked artwork labels, so interaction is unmistakable. */
#gate #unlock{display:flex!important;align-items:center!important;justify-content:center!important;color:#181106!important;background:linear-gradient(105deg,#a96e1d 0%,#d7a84b 20%,#f0d47e 49%,#c58a2a 78%,#9c6419 100%)!important;border:1px solid rgba(255,226,143,.72)!important;font:700 clamp(15px,3.8vw,25px)/1 ui-serif,"Yu Mincho","Hiragino Mincho ProN",serif!important;letter-spacing:.12em!important;text-shadow:0 1px 0 rgba(255,244,204,.28)!important}
#gate #unlock:hover{filter:brightness(1.08) saturate(1.04)!important}
#gate #gateAuthorLink{display:flex!important;align-items:center!important;justify-content:center!important;color:#efd38a!important;background:rgba(2,12,31,.74)!important;border:1px solid rgba(216,174,82,.28)!important;border-radius:999px!important;font:600 clamp(10px,2.7vw,15px)/1 ui-serif,"Yu Mincho",serif!important;letter-spacing:.045em!important;text-decoration:none!important;backdrop-filter:blur(7px)!important}
#gate #pw{transition:border-color .2s ease,box-shadow .24s var(--rpp-ease),background .22s ease!important}
#gate #pw:focus{background:rgba(2,13,34,.94)!important;box-shadow:0 0 0 3px rgba(222,179,78,.12),0 10px 28px rgba(0,0,0,.18)!important}

/* Immersive post-login cover. */
#cover{width:100vw!important;margin-left:calc(50% - 50vw)!important;min-height:100svh!important;border:0!important;box-shadow:none!important;overflow:hidden!important;isolation:isolate!important;background:linear-gradient(180deg,rgba(2,9,26,.32),rgba(2,10,28,.74)),url('/assets/top-cover.webp') center 42%/cover no-repeat!important}
#cover:before{content:""!important;position:absolute!important;inset:0!important;z-index:-2!important;border:0!important;background:radial-gradient(circle at 50% 58%,rgba(244,199,87,.22),transparent 18%),linear-gradient(180deg,rgba(3,10,27,.34),rgba(3,12,31,.72) 72%,#06142d 100%)!important;box-shadow:none!important}
#cover:after{content:"";position:absolute;inset:-6%;z-index:-3;background:inherit;filter:blur(2px) saturate(1.08);transform:scale(1.035);animation:rppAmbient 16s ease-in-out infinite alternate;pointer-events:none}
#cover.orn:before,#cover.orn:after{border:0!important}
#cover>*{position:relative;z-index:1}
#cover h1{text-shadow:0 8px 34px rgba(0,0,0,.5),0 0 34px rgba(218,171,72,.08)}
#cover .actions{gap:12px!important}
#cover .actions .btn{min-height:54px!important;padding:12px 24px!important;background:rgba(5,18,43,.64)!important;border-color:rgba(222,183,91,.55)!important;backdrop-filter:blur(10px)!important}
#cover .actions .btn:hover{background:rgba(9,28,59,.82)!important}
#resumeNote{padding:8px 14px;border-radius:999px;background:rgba(5,17,39,.42);backdrop-filter:blur(6px)}

/* TOC: editorial hover language instead of generic buttons. */
.toc-item{transition:border-color .2s ease,background .22s ease,transform .2s var(--rpp-ease)!important}
.toc-item:hover{background:linear-gradient(90deg,rgba(216,174,82,.075),transparent)!important;border-color:rgba(224,187,98,.38)!important}
.toc-item button{transition:padding .24s var(--rpp-ease),color .2s ease!important}
.toc-item button:hover{padding-left:10px!important}
.toc-item button>div:last-child{transition:transform .24s var(--rpp-ease),color .2s ease!important;color:#d3ad61}
.toc-item button:hover>div:last-child{transform:translateX(5px);color:#f2d68a}

/* Reader controls communicate direction. */
#prev:hover{transform:translateX(-3px) translateY(-1px)}
#next:hover{transform:translateX(3px) translateY(-1px)}
#fav.rpp-action[aria-pressed="true"],#fav.rpp-selected{color:#f2cf76!important;box-shadow:0 0 22px rgba(221,174,67,.14)!important}
.paper{transform-origin:50% 10%;backface-visibility:hidden}

/* Page/state entrances: subtle, short, editorial. */
#gate:not(.hidden) .gate-card{animation:rppHeroIn .82s var(--rpp-ease-out) both}
#cover:not(.hidden),#toc:not(.hidden),#reader:not(.hidden),#auth:not(.hidden),#editor:not(.hidden),#dash:not(.hidden){animation:rppPageIn .48s var(--rpp-ease-out) both}
#reader:not(.hidden) .paper{animation:rppPaperIn .58s var(--rpp-ease-out) both}
#toc:not(.hidden) .toc-item{animation:rppListIn .38s var(--rpp-ease-out) both}
#toc:not(.hidden) .toc-item:nth-child(2){animation-delay:.025s}#toc:not(.hidden) .toc-item:nth-child(3){animation-delay:.05s}#toc:not(.hidden) .toc-item:nth-child(4){animation-delay:.075s}#toc:not(.hidden) .toc-item:nth-child(5){animation-delay:.1s}

/* Form feedback feels tactile without becoming flashy. */
input,textarea,select{transition:border-color .2s ease,box-shadow .24s var(--rpp-ease),background .2s ease!important}
input:hover,textarea:hover,select:hover{border-color:rgba(190,145,57,.7)!important}
input:focus,textarea:focus,select:focus{transform:translateY(-1px)}
#save.rpp-action:active,#submit.rpp-action:active{filter:saturate(1.06) brightness(.98)}

@keyframes rppRipple{0%{transform:translate(-50%,-50%) scale(0);opacity:.7}55%{opacity:.28}100%{transform:translate(-50%,-50%) scale(14);opacity:0}}
@keyframes rppHeroIn{from{opacity:0;transform:scale(1.015)}to{opacity:1;transform:scale(1)}}
@keyframes rppPageIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes rppPaperIn{from{opacity:0;transform:translateY(14px) scale(.992)}to{opacity:1;transform:none}}
@keyframes rppListIn{from{opacity:0;transform:translateX(-7px)}to{opacity:1;transform:none}}
@keyframes rppAmbient{from{transform:scale(1.025) translate3d(-.3%,0,0)}to{transform:scale(1.055) translate3d(.35%,-.25%,0)}}

@media (min-width:900px){
  #cover{padding-top:clamp(80px,9vh,140px)!important;padding-bottom:90px!important}
  #cover h1{font-size:clamp(68px,7.2vw,118px)!important;line-height:.98!important;letter-spacing:.045em!important}
  #cover .jp{font-size:clamp(20px,1.7vw,30px)!important}
  #cover .actions{margin-top:42px!important}
  #cover .actions .btn{min-width:210px!important}
}
@media (max-width:520px){
  #cover{padding-top:82px!important;padding-bottom:100px!important;background-position:center 40%!important}
  #cover h1{font-size:49px!important;line-height:1.02!important}
  #cover .actions{display:grid!important;grid-template-columns:1fr 1fr!important;width:min(100%,360px)!important;margin-left:auto!important;margin-right:auto!important}
  #cover .actions>a{grid-column:1/-1!important}
  #cover .actions .btn{width:100%!important;padding:10px 12px!important;font-size:15px!important}
}
@media (hover:none){.rpp-action:hover{transform:none;filter:none}.toc-item button:hover{padding-left:4px!important}#prev:hover,#next:hover{transform:none}}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.001ms!important}.rpp-action:hover,.rpp-action:active{transform:none!important}}
</style>
<script>
(()=>{
 const interactiveSelector='button,.btn,a.pill,.mini-btn,.toc-item button,#gateAuthorLink';
 const decorate=root=>{
   (root||document).querySelectorAll?.(interactiveSelector).forEach(el=>{
     if(el.classList.contains('rpp-action'))return;
     el.classList.add('rpp-action');
     el.addEventListener('pointerdown',ev=>{
       const r=el.getBoundingClientRect();
       el.style.setProperty('--rpp-x',(ev.clientX-r.left)+'px');
       el.style.setProperty('--rpp-y',(ev.clientY-r.top)+'px');
       el.classList.remove('rpp-rippling');void el.offsetWidth;el.classList.add('rpp-rippling','rpp-pressed');
     },{passive:true});
     const release=()=>el.classList.remove('rpp-pressed');
     el.addEventListener('pointerup',release,{passive:true});el.addEventListener('pointercancel',release,{passive:true});el.addEventListener('pointerleave',release,{passive:true});
     el.addEventListener('animationend',e=>{if(e.animationName==='rppRipple')el.classList.remove('rpp-rippling')});
   });
 };
 const polishWords=()=>{
   const unlock=document.querySelector('#unlock');if(unlock)unlock.textContent='記録をひらく';
   const gateAuthor=document.querySelector('#gateAuthorLink');if(gateAuthor)gateAuthor.textContent='私の記録を綴る ／ WRITE YOUR STORY';
   document.querySelectorAll('#cover .actions a').forEach(a=>{if(a.textContent.includes('WRITE YOUR STORY'))a.textContent='WRITE YOUR STORY｜私の記録を綴る'});
   const sub=document.querySelector('.rpp-author-sub');if(sub)sub.textContent='記録を綴る・編集';
 };
 const fav=document.querySelector('#fav');
 if(fav)new MutationObserver(()=>{const active=fav.textContent.includes('★');fav.classList.toggle('rpp-selected',active);fav.setAttribute('aria-pressed',active?'true':'false')}).observe(fav,{childList:true,subtree:true,characterData:true});
 decorate(document);polishWords();
 new MutationObserver(muts=>{for(const m of muts)for(const n of m.addedNodes)if(n.nodeType===1){decorate(n);polishWords()}}).observe(document.documentElement,{childList:true,subtree:true});
})();
</script>`;

function apply(response){
  return new HTMLRewriter().on('body',{element(el){el.append(MOTION_LAYER,{html:true})}}).transform(response);
}

export default {
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx);
    const type=response.headers.get('content-type')||'';
    if(!type.includes('text/html'))return response;
    return apply(response);
  }
};
