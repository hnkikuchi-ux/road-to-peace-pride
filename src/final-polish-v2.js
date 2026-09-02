import app from './responsive-enhancer.js';

const FINAL_POLISH = `
<style>
/* Final live controls: labels stay real HTML text while artwork remains decorative. */
html body #gate #unlock.rpp-action{color:#171006!important;background:linear-gradient(105deg,#a56a18 0%,#d7a74a 20%,#f3d982 50%,#c58928 80%,#9a6116 100%)!important;text-indent:0!important;opacity:1!important;visibility:visible!important}
html body #gate #gateAuthorLink.rpp-action{color:#efd38a!important;text-indent:0!important;opacity:1!important;visibility:visible!important}

/* Clear visual response after authentication/save/submit operations. */
#savemsg,#authmsg,#msg,#loginMsg{transform-origin:50% 50%}
.rpp-feedback{animation:rppFeedback .38s cubic-bezier(.16,1,.3,1)}
@keyframes rppFeedback{0%{opacity:.28;transform:translateY(4px)}100%{opacity:1;transform:none}}

/* File picker speaks the same visual language as the rest of the interface. */
input[type=file]::file-selector-button{border:1px solid rgba(177,132,50,.48);border-radius:8px;background:linear-gradient(180deg,#fffaf0,#efe2c8);color:#1b2d4e;padding:9px 13px;margin-right:10px;cursor:pointer;transition:transform .18s ease,box-shadow .2s ease,background .2s ease}
input[type=file]::file-selector-button:hover{background:#fff9eb;box-shadow:0 6px 16px rgba(93,63,15,.12)}
input[type=file]::file-selector-button:active{transform:translateY(1px) scale(.98)}

#rppDesktopCopy{display:none}
@media (min-width:900px){
  #gate .gate-card{width:min(1080px,90vw)!important;height:min(710px,86svh)!important}
  #gate .gate-card.orn:before{left:1%!important;width:42%!important;height:98%!important;top:1%!important}
  #gate .gate-card.orn:after{right:0!important;width:50%!important;height:min(570px,78svh)!important;border-radius:28px!important;background:linear-gradient(150deg,rgba(6,20,48,.95),rgba(3,12,31,.92))!important;box-shadow:0 36px 95px rgba(0,0,0,.48),inset 0 0 0 1px rgba(248,218,138,.045),inset 0 0 75px rgba(91,65,145,.09)!important}
  #gate .gate-card>.eyebrow,#gate .gate-card>h1,#gate .gate-card>.sub,#gate .gate-card>.rule{display:none!important}
  #rppDesktopCopy{display:block;position:absolute;right:4.25%;top:14.5%;width:41.5%;z-index:3;text-align:center;pointer-events:none}
  #rppDesktopCopy .kicker{color:#e8ca7c;font:700 12px/1.3 ui-serif,"Yu Mincho",serif;letter-spacing:.28em;margin-bottom:24px}
  #rppDesktopCopy .title{color:#f5ecda;font:500 clamp(48px,4.5vw,72px)/1.02 ui-serif,"Times New Roman","Yu Mincho",serif;letter-spacing:.045em;text-shadow:0 8px 32px rgba(0,0,0,.42);margin:0}
  #rppDesktopCopy .jp{color:#e6e0d3;font:500 18px/1.8 ui-serif,"Yu Mincho",serif;letter-spacing:.035em;margin-top:22px}
  #rppDesktopCopy .bridge{color:#d7b75f;font:600 13px/1.5 ui-serif,"Yu Mincho",serif;letter-spacing:.08em;margin-top:8px}
  #rppDesktopCopy .authLabel{color:#d7bd79;font:600 13px/1.4 ui-serif,"Yu Mincho",serif;letter-spacing:.11em;margin-top:38px}
  #gate #pw{right:7.5%!important;top:59.5%!important;width:35%!important;height:58px!important}
  #gate #unlock{right:7.5%!important;top:70%!important;width:35%!important;height:67px!important}
  #gate #gateAuthorLink{right:11.5%!important;top:83.5%!important;width:27%!important;height:48px!important}
  #gate #msg{right:7.5%!important;top:67.2%!important;width:35%!important}
}
.rpp-action:disabled,.rpp-action[aria-disabled="true"]{opacity:.58!important;cursor:not-allowed!important;transform:none!important;filter:saturate(.7)!important}
@media (max-width:520px){html body #gate #unlock.rpp-action{font-size:18px!important;letter-spacing:.08em!important}html body #gate #gateAuthorLink.rpp-action{font-size:11px!important;letter-spacing:.025em!important}}
@media (prefers-reduced-motion:reduce){.rpp-feedback{animation:none!important}}
</style>
<script>
(()=>{
  const unlock=document.querySelector('#unlock');
  if(unlock&&unlock.textContent.trim()!=='記録をひらく')unlock.textContent='記録をひらく';
  const author=document.querySelector('#gateAuthorLink');
  if(author&&author.textContent.trim()!=='私の記録を綴る ／ WRITE YOUR STORY')author.textContent='私の記録を綴る ／ WRITE YOUR STORY';
  const card=document.querySelector('#gate .gate-card');
  if(card&&!document.querySelector('#rppDesktopCopy')){
    const el=document.createElement('div');el.id='rppDesktopCopy';
    el.innerHTML='<div class="kicker">MEMORIAL COLLECTION 2026</div><div class="title">ROAD TO<br>PEACE PRIDE</div><div class="jp">9.12までの挑戦と誓いの記録</div><div class="bridge">そして、11.15、11.18へ</div><div class="authLabel">閲覧パスワード</div>';
    card.appendChild(el);
  }
  for(const id of ['#savemsg','#authmsg','#msg','#loginMsg']){
    const target=document.querySelector(id);if(!target)continue;target.setAttribute('aria-live','polite');
    new MutationObserver(()=>{target.classList.remove('rpp-feedback');void target.offsetWidth;target.classList.add('rpp-feedback')}).observe(target,{childList:true,subtree:true,characterData:true});
  }
})();
</script>`;

function apply(response){return new HTMLRewriter().on('body',{element(el){el.append(FINAL_POLISH,{html:true})}}).transform(response)}
export default {async fetch(request,env,ctx){const response=await app.fetch(request,env,ctx);const type=response.headers.get('content-type')||'';if(!type.includes('text/html'))return response;return apply(response)}};
