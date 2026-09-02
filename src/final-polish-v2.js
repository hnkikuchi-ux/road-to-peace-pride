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

/* Japanese custom photo chooser. Native file input stays available to the app and automation. */
.rpp-file-native{position:absolute!important;left:-9999px!important;width:1px!important;height:1px!important;opacity:0!important}
#rppFilePicker{display:flex;align-items:center;gap:12px;width:100%;min-height:58px;padding:10px 12px;border:1px solid rgba(177,132,50,.48);border-radius:9px;background:rgba(255,255,255,.5);cursor:pointer;transition:transform .18s ease,box-shadow .22s ease,border-color .22s ease}
#rppFilePicker:hover{border-color:#b88935;box-shadow:0 7px 20px rgba(93,63,15,.10)}
#rppFilePicker:active{transform:translateY(1px) scale(.995)}
.rpp-file-button{flex:0 0 auto;border:1px solid rgba(177,132,50,.52);border-radius:7px;background:linear-gradient(180deg,#fffaf0,#efe2c8);color:#1b2d4e;padding:9px 13px;font-weight:700}
.rpp-file-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#5f6570;font-size:13px}

#rppDesktopCopy{display:none}
@media (min-width:900px){
  /* The base site uses a 900px wrapper. Widen it only while the login gate is visible. */
  body.rpp-gate-active .wrap{width:100%!important;max-width:none!important;margin:0!important;padding:0!important}
  body.rpp-gate-active #gate{width:100%!important;max-width:none!important}
  #gate .gate-card{width:min(1160px,92vw)!important;height:min(700px,84svh)!important}

  /* Show only the artwork portion of the supplied cover on desktop; old baked controls are cropped away. */
  #gate .gate-card.orn:before{left:2%!important;top:10%!important;width:39.5%!important;height:72%!important;background:url('/assets/top-cover.webp') top center/100% auto no-repeat!important;border:1px solid rgba(214,170,75,.28)!important;border-radius:4px!important;box-shadow:0 30px 78px rgba(0,0,0,.44)!important;filter:saturate(1.04) contrast(1.02)!important;overflow:hidden!important}
  #gate .gate-card.orn:after{right:1.5%!important;width:49.5%!important;height:min(570px,76svh)!important;border-radius:28px!important;background:linear-gradient(150deg,rgba(6,20,48,.965),rgba(3,12,31,.94))!important;box-shadow:0 36px 95px rgba(0,0,0,.48),inset 0 0 0 1px rgba(248,218,138,.045),inset 0 0 75px rgba(91,65,145,.09)!important}
  #gate .gate-card>.eyebrow,#gate .gate-card>h1,#gate .gate-card>.sub,#gate .gate-card>.rule{display:none!important}
  #rppDesktopCopy{display:block;position:absolute;right:5.25%;top:13.5%;width:42%;z-index:3;text-align:center;pointer-events:none}
  #rppDesktopCopy .kicker{color:#e8ca7c;font:700 12px/1.3 ui-serif,"Yu Mincho",serif;letter-spacing:.28em;margin-bottom:22px;white-space:nowrap}
  #rppDesktopCopy .title{color:#f5ecda;font:500 clamp(46px,4.25vw,66px)/1.02 ui-serif,"Times New Roman","Yu Mincho",serif;letter-spacing:.035em;text-shadow:0 8px 32px rgba(0,0,0,.42);margin:0}
  #rppDesktopCopy .jp{color:#e6e0d3;font:500 18px/1.8 ui-serif,"Yu Mincho",serif;letter-spacing:.03em;margin-top:20px}
  #rppDesktopCopy .bridge{color:#d7b75f;font:600 13px/1.5 ui-serif,"Yu Mincho",serif;letter-spacing:.08em;margin-top:7px}
  #rppDesktopCopy .authLabel{color:#d7bd79;font:600 13px/1.4 ui-serif,"Yu Mincho",serif;letter-spacing:.11em;margin-top:34px}
  #gate #pw{left:auto!important;right:8.25%!important;top:59.5%!important;width:36%!important;height:58px!important}
  #gate #unlock{left:auto!important;right:8.25%!important;top:70%!important;width:36%!important;height:67px!important}
  #gate #gateAuthorLink{left:auto!important;right:11.75%!important;top:84%!important;width:29%!important;height:48px!important}
  #gate #msg{left:auto!important;right:8.25%!important;top:67.2%!important;width:36%!important}
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

  const gate=document.querySelector('#gate');
  const syncGate=()=>document.body.classList.toggle('rpp-gate-active',Boolean(gate&&!gate.classList.contains('hidden')));
  if(gate){syncGate();new MutationObserver(syncGate).observe(gate,{attributes:true,attributeFilter:['class']})}

  const card=document.querySelector('#gate .gate-card');
  if(card&&!document.querySelector('#rppDesktopCopy')){
    const el=document.createElement('div');el.id='rppDesktopCopy';
    el.innerHTML='<div class="kicker">MEMORIAL COLLECTION 2026</div><div class="title">ROAD TO<br>PEACE PRIDE</div><div class="jp">9.12までの挑戦と誓いの記録</div><div class="bridge">そして、11.15、11.18へ</div><div class="authLabel">閲覧パスワード</div>';
    card.appendChild(el);
  }

  /* Author-facing language: explain the action instead of exposing internal product terms. */
  const path=location.pathname.replace(/\/$/,'')||'/';
  if(path==='/author'||path==='/author.html'){
    const topLink=document.querySelector('.top a.pill');if(topLink)topLink.textContent='閲覧トップ';
    const authTitle=document.querySelector('#auth h1');if(authTitle)authTitle.textContent='あなたの記録を綴る';
    const editorTitle=document.querySelector('#editor h1');if(editorTitle)editorTitle.textContent='記録の入力・編集';
    const heroSub=document.querySelector('#rppAuthorHero .rpp-author-sub');if(heroSub)heroSub.textContent='記録を綴る・編集';
    const previewBar=document.querySelector('#previewBar');if(previewBar)previewBar.textContent=previewBar.textContent.replace('原稿・写真','記録・写真');

    const rewriteDeadline=e=>{if(!e)return;const next=e.textContent.replaceAll('原稿受付','記録の受付').replaceAll('原稿の編集・提出期限','記録の編集・提出期限').replaceAll('原稿の締切','記録の締切');if(e.textContent!==next)e.textContent=next};
    for(const id of ['deadlineAuth','deadlineEditor']){const e=document.getElementById(id);if(!e)continue;rewriteDeadline(e);new MutationObserver(()=>rewriteDeadline(e)).observe(e,{childList:true,subtree:true,characterData:true})}

    const photo=document.querySelector('#photo');
    if(photo&&!document.querySelector('#rppFilePicker')){
      photo.classList.add('rpp-file-native');
      const picker=document.createElement('label');picker.id='rppFilePicker';picker.setAttribute('for','photo');picker.innerHTML='<span class="rpp-file-button">写真を選ぶ</span><span class="rpp-file-name">選択されていません</span>';
      photo.insertAdjacentElement('afterend',picker);
      const name=picker.querySelector('.rpp-file-name');
      photo.addEventListener('change',()=>{name.textContent=photo.files?.[0]?.name||'選択されていません'});
    }
  }

  for(const id of ['#savemsg','#authmsg','#msg','#loginMsg']){
    const target=document.querySelector(id);if(!target)continue;target.setAttribute('aria-live','polite');
    new MutationObserver(()=>{target.classList.remove('rpp-feedback');void target.offsetWidth;target.classList.add('rpp-feedback')}).observe(target,{childList:true,subtree:true,characterData:true});
  }
})();
</script>`;

function apply(response){return new HTMLRewriter().on('body',{element(el){el.append(FINAL_POLISH,{html:true})}}).transform(response)}
export default {async fetch(request,env,ctx){const response=await app.fetch(request,env,ctx);const type=response.headers.get('content-type')||'';if(!type.includes('text/html'))return response;return apply(response)}};
