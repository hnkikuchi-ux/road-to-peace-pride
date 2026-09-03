import app from './premium-v6-polish.js';

const FAITHFUL_V7 = `
<style>
/* =========================================================
   ROAD TO PEACE PRIDE — faithful cover v7
   Full top reconstruction based on the approved 9:16 artwork.
   Existing authentication elements are re-used, not replaced.
   ========================================================= */
body.rpp-faithful-v7 .wrap{width:100%!important;max-width:none!important;margin:0!important;padding:0!important}
body.rpp-faithful-v7 #gate:not(.hidden){display:grid!important;place-items:start center!important;min-height:100svh!important;padding:0!important;background:#020817!important;overflow:visible!important}
body.rpp-faithful-v7 #gate .gate-card{
  position:relative!important;isolation:isolate!important;overflow:hidden!important;
  width:min(100vw,540px)!important;max-width:none!important;height:auto!important;min-height:0!important;
  aspect-ratio:9/16!important;padding:0!important;margin:0 auto!important;border:0!important;border-radius:0!important;
  background:#020817!important;box-shadow:0 28px 100px rgba(0,0,0,.58)!important;
}
body.rpp-faithful-v7 #gate .gate-card.orn:before{
  content:""!important;display:block!important;position:absolute!important;inset:0!important;z-index:0!important;
  background:url('/assets/premium-v5-bg.webp?v=7') center/100% 100% no-repeat!important;
  opacity:1!important;filter:saturate(1.03) contrast(1.025) brightness(.96)!important;transform:none!important;animation:none!important;pointer-events:none!important;
}
body.rpp-faithful-v7 #gate .gate-card.orn:after{
  content:""!important;display:block!important;position:absolute!important;inset:0!important;z-index:1!important;
  background:linear-gradient(180deg,rgba(0,5,18,.17) 0%,rgba(0,5,18,.02) 28%,rgba(0,5,18,.015) 49%,rgba(0,6,20,.09) 59%,rgba(0,7,23,.44) 65%,rgba(0,7,23,.80) 100%),radial-gradient(ellipse at 50% 48%,transparent 34%,rgba(0,0,0,.10) 69%,rgba(0,0,0,.30) 100%)!important;
  border:0!important;box-shadow:none!important;pointer-events:none!important;
}
/* hide legacy cover layers; non-cover pages remain untouched */
body.rpp-faithful-v7 #gate #rppCrispCopy,
body.rpp-faithful-v7 #gate .rpp-title-divider,
body.rpp-faithful-v7 #gate .rpp-v5-frame,
body.rpp-faithful-v7 #gate .rpp-v5-corner,
body.rpp-faithful-v7 #gate .rpp-v5-panel,
body.rpp-faithful-v7 #gate .rpp-v5-lock,
body.rpp-faithful-v7 #gate .rpp-crisp-sparkles,
body.rpp-faithful-v7 #gate #rppAuthLabel,
body.rpp-faithful-v7 #gate>.gate-card>.eyebrow,
body.rpp-faithful-v7 #gate>.gate-card>h1,
body.rpp-faithful-v7 #gate>.gate-card>.sub,
body.rpp-faithful-v7 #gate>.gate-card>.rule{display:none!important}

#rppFaithfulV7{position:absolute;inset:0;z-index:20;overflow:hidden;color:#f2d37b;pointer-events:none;font-family:ui-serif,"Yu Mincho","Hiragino Mincho ProN",serif}
#rppFaithfulV7 *{box-sizing:border-box}
#rppFaithfulV7 .v7-frame-outer{position:absolute;inset:1.15%;border:1.4px solid rgba(234,188,82,.94);box-shadow:inset 0 0 0 1px rgba(111,64,11,.92),0 0 9px rgba(229,180,62,.09);pointer-events:none}
#rppFaithfulV7 .v7-frame-inner{position:absolute;inset:2.12%;border:1px solid rgba(237,196,101,.78);pointer-events:none}
#rppFaithfulV7 .v7-frame-inner:before,#rppFaithfulV7 .v7-frame-inner:after{content:"";position:absolute;left:7%;right:7%;height:1px;background:linear-gradient(90deg,transparent,#b87418 8%,#f3d27a 50%,#b87418 92%,transparent);opacity:.72}
#rppFaithfulV7 .v7-frame-inner:before{top:1.15%}#rppFaithfulV7 .v7-frame-inner:after{bottom:1.15%}
#rppFaithfulV7 .v7-corner{position:absolute;width:8.1%;aspect-ratio:1;opacity:.95}
#rppFaithfulV7 .v7-corner:before,#rppFaithfulV7 .v7-corner:after{content:"";position:absolute;border-style:solid;border-color:#d89b35}
#rppFaithfulV7 .v7-corner:before{inset:0;border-width:1px 0 0 1px}#rppFaithfulV7 .v7-corner:after{inset:19%;border-width:1px 0 0 1px;border-color:#f2ce72}
#rppFaithfulV7 .v7-corner.tl{left:2.9%;top:2.85%}#rppFaithfulV7 .v7-corner.tr{right:2.9%;top:2.85%;transform:rotate(90deg)}#rppFaithfulV7 .v7-corner.br{right:2.9%;bottom:2.85%;transform:rotate(180deg)}#rppFaithfulV7 .v7-corner.bl{left:2.9%;bottom:2.85%;transform:rotate(270deg)}

#rppFaithfulV7 .v7-collection{position:absolute;z-index:5;top:5.65%;left:8%;right:8%;text-align:center;color:#e6bf61;font:600 clamp(9px,2.15vw,12px)/1.15 Georgia,"Times New Roman",serif;letter-spacing:.26em;text-shadow:0 2px 9px rgba(0,0,0,.92)}
#rppFaithfulV7 .v7-deco{position:absolute;z-index:5;left:35%;width:30%;height:1px;background:linear-gradient(90deg,transparent,#c98521 16%,#f2cf75 45%,#f2cf75 55%,#c98521 84%,transparent);box-shadow:0 0 7px rgba(239,197,91,.22)}
#rppFaithfulV7 .v7-deco:after{content:"";position:absolute;left:50%;top:50%;width:7px;height:7px;border:1px solid #efcc73;transform:translate(-50%,-50%) rotate(45deg);background:#071329;box-shadow:0 0 6px rgba(238,194,83,.25)}
#rppFaithfulV7 .v7-deco.top{top:8.65%}#rppFaithfulV7 .v7-deco.mid{top:24.75%;left:36%;width:28%}

#rppFaithfulV7 .v7-title{position:absolute;z-index:5;top:12.5%;left:3.4%;right:3.4%;text-align:center;white-space:nowrap}
#rppFaithfulV7 .v7-road{display:block;margin:0 0 1.15%;color:#efce78;font-family:"Cormorant Garamond",Baskerville,"Iowan Old Style",Palatino,Georgia,serif;font-weight:400;font-size:clamp(21px,5.8vw,31px);line-height:1;letter-spacing:.18em;font-kerning:normal;font-feature-settings:"kern" 1,"liga" 1;text-rendering:geometricPrecision;-webkit-font-smoothing:antialiased;text-shadow:0 3px 15px rgba(0,0,0,.76)}
#rppFaithfulV7 .v7-pride{display:block;color:transparent;-webkit-text-fill-color:transparent;background:linear-gradient(180deg,#fff2b4 0%,#f4d17b 24%,#ce9130 48%,#f0c86a 73%,#9d5d14 100%);-webkit-background-clip:text;background-clip:text;font-family:"Cormorant Garamond",Baskerville,"Iowan Old Style",Palatino,Georgia,serif;font-weight:400;font-size:clamp(50px,13.1vw,66px);line-height:.86;letter-spacing:.012em;transform:scaleX(.96);transform-origin:50% 50%;font-kerning:normal;font-feature-settings:"kern" 1,"liga" 1;text-rendering:geometricPrecision;-webkit-font-smoothing:antialiased;filter:drop-shadow(0 1px 0 rgba(255,245,199,.20)) drop-shadow(0 4px 10px rgba(0,0,0,.32))}

#rppFaithfulV7 .v7-jp{position:absolute;z-index:5;top:27.3%;left:7%;right:7%;text-align:center;color:#e8bd5e;text-shadow:0 3px 13px rgba(0,0,0,.92),0 0 12px rgba(226,163,41,.11)}
#rppFaithfulV7 .v7-date{display:block;font-size:clamp(22px,5.7vw,30px);line-height:1.08;letter-spacing:.075em}
#rppFaithfulV7 .v7-main{display:block;margin-top:2.15%;font-size:clamp(29px,7.35vw,39px);line-height:1.12;letter-spacing:.065em;white-space:nowrap}

#rppFaithfulV7 .v7-path{position:absolute;z-index:3;left:35%;top:43.2%;width:30%;height:14%;overflow:visible;opacity:.83;filter:drop-shadow(0 0 8px rgba(255,211,105,.48));pointer-events:none}
#rppFaithfulV7 .v7-path .wide{fill:none;stroke:#f6c858;stroke-opacity:.18;stroke-width:5;filter:blur(2px)}
#rppFaithfulV7 .v7-path .core{fill:none;stroke:url(#v7PathGold);stroke-width:1.65;stroke-linecap:round;stroke-linejoin:round}

#rppFaithfulV7 .v7-bridge{position:absolute;z-index:6;top:58.15%;left:11%;right:11%;display:flex;align-items:center;justify-content:center;gap:10px;color:#e9c46b;font-size:clamp(13px,3.25vw,17px);line-height:1.15;letter-spacing:.075em;white-space:nowrap;text-align:center;text-shadow:0 2px 8px rgba(0,0,0,.98),0 0 8px rgba(235,178,48,.18)}
#rppFaithfulV7 .v7-bridge:before,#rppFaithfulV7 .v7-bridge:after{content:"✦";color:#f0c85f;font-size:.72em;text-shadow:0 0 8px rgba(255,206,90,.60)}

#rppFaithfulV7 .v7-panel{position:absolute;z-index:4;left:7.7%;right:7.7%;top:62.35%;bottom:3.45%;background:linear-gradient(180deg,rgba(2,18,42,.86),rgba(1,9,24,.97));border:1.2px solid rgba(221,169,61,.90);box-shadow:inset 0 0 0 1px rgba(255,229,146,.06),inset 0 0 0 6px rgba(167,106,21,.035),0 18px 45px rgba(0,0,0,.30);clip-path:polygon(3.2% 0,96.8% 0,100% 4.2%,100% 95.8%,96.8% 100%,3.2% 100%,0 95.8%,0 4.2%);pointer-events:none}
#rppFaithfulV7 .v7-panel:before{content:"";position:absolute;inset:2.1%;border:1px solid rgba(230,183,78,.38);clip-path:inherit;pointer-events:none}
#rppFaithfulV7 .v7-panel-top{position:absolute;z-index:5;left:11%;right:11%;top:61.65%;height:1px;background:linear-gradient(90deg,transparent,#ba791a 8%,#ecc766 50%,#ba791a 92%,transparent);box-shadow:0 0 7px rgba(238,194,82,.18)}
#rppFaithfulV7 .v7-label{position:absolute;z-index:7;top:65.6%;left:14%;right:14%;text-align:center;color:#e4c16a;font-size:clamp(12px,3.15vw,16px);line-height:1.2;letter-spacing:.115em;text-shadow:0 2px 9px rgba(0,0,0,.92)}

#rppFaithfulV7 .v7-lock{position:absolute;z-index:31;left:16.5%;top:70.1%;width:6.2%;aspect-ratio:1;display:grid;place-items:center;pointer-events:none;filter:drop-shadow(0 0 5px rgba(236,184,62,.22))}
#rppFaithfulV7 .v7-lock svg{display:block;width:100%;height:100%;overflow:visible}
#rppFaithfulV7 #pw{
  position:absolute!important;z-index:30!important;left:12.9%!important;top:68.85%!important;width:74.2%!important;height:6.7%!important;margin:0!important;
  padding:0 5.2% 0 13.8%!important;border:1.45px solid rgba(218,157,49,.96)!important;border-radius:12px!important;
  background:linear-gradient(180deg,rgba(6,24,52,.96),rgba(2,12,30,.99))!important;color:#f5e8c2!important;caret-color:#f1c85c!important;
  font:500 clamp(12px,3.25vw,17px)/1 ui-serif,"Yu Mincho","Hiragino Mincho ProN",serif!important;letter-spacing:.018em!important;
  box-shadow:inset 0 0 0 1px rgba(255,226,137,.08),0 8px 21px rgba(0,0,0,.24)!important;outline:none!important;appearance:none!important;pointer-events:auto!important;transform:none!important;
}
#rppFaithfulV7 #pw::placeholder{color:rgba(206,211,221,.48)!important;letter-spacing:.025em!important}
#rppFaithfulV7 #pw:focus{border-color:#f0cf72!important;box-shadow:0 0 0 2px rgba(239,198,93,.12),inset 0 0 0 1px rgba(255,226,137,.08),0 9px 23px rgba(0,0,0,.28)!important}

#rppFaithfulV7 #unlock{
  position:absolute!important;z-index:30!important;left:16.7%!important;top:77.25%!important;width:66.6%!important;height:7.3%!important;margin:0!important;padding:0 7%!important;
  border:1.8px solid #f1cf70!important;border-radius:0!important;clip-path:polygon(3.1% 0,96.9% 0,100% 18%,100% 82%,96.9% 100%,3.1% 100%,0 82%,0 18%)!important;
  background:linear-gradient(180deg,#ffe18a 0%,#efc04d 19%,#d69a2b 47%,#efc45a 72%,#aa6810 100%)!important;color:#201306!important;
  font:700 clamp(19px,4.75vw,25px)/1 ui-serif,"Yu Mincho","Hiragino Mincho ProN",serif!important;letter-spacing:.095em!important;text-shadow:0 1px 0 rgba(255,255,255,.33)!important;
  box-shadow:inset 0 0 0 2px rgba(137,78,7,.80),inset 0 0 0 4px rgba(255,236,172,.17),0 12px 27px rgba(0,0,0,.30),0 0 24px rgba(231,177,58,.11)!important;
  filter:none!important;animation:none!important;transform:none!important;pointer-events:auto!important;cursor:pointer!important;overflow:hidden!important;
}
#rppFaithfulV7 #unlock:before,#rppFaithfulV7 #unlock:after{content:"";position:absolute;top:50%;width:8px;height:8px;background:radial-gradient(circle,#fff0a8 0 8%,#f4bd3d 22%,rgba(240,174,39,.26) 48%,transparent 70%);transform:translateY(-50%);filter:drop-shadow(0 0 5px rgba(255,210,84,.5));pointer-events:none}
#rppFaithfulV7 #unlock:before{left:-2px}#rppFaithfulV7 #unlock:after{right:-2px}
#rppFaithfulV7 #unlock:hover,#rppFaithfulV7 #unlock:focus-visible{filter:brightness(1.04)!important;outline:none!important}

#rppFaithfulV7 .v7-btn-deco{position:absolute;z-index:7;top:86.5%;left:32%;width:36%;height:1px;background:linear-gradient(90deg,transparent,#bc791c 12%,#f0cd73 45%,#f0cd73 55%,#bc791c 88%,transparent);box-shadow:0 0 6px rgba(236,194,82,.18)}
#rppFaithfulV7 .v7-btn-deco:after{content:"";position:absolute;left:50%;top:50%;width:7px;height:7px;border:1px solid #ecca6f;background:#07162d;transform:translate(-50%,-50%) rotate(45deg)}

#rppFaithfulV7 #gateAuthorLink{
  position:absolute!important;z-index:30!important;left:16.8%!important;top:89.0%!important;width:66.4%!important;height:7.15%!important;margin:0!important;padding:0!important;
  border:1.7px solid #e6b84e!important;border-radius:999px!important;background:radial-gradient(circle at 50% 10%,rgba(255,255,255,.10),transparent 28%),linear-gradient(180deg,#092653 0%,#051a3d 37%,#020c22 100%)!important;
  box-shadow:inset 0 0 0 2px rgba(101,59,9,.90),inset 0 0 0 4px rgba(239,196,91,.13),0 10px 24px rgba(0,0,0,.29),0 0 23px rgba(219,166,54,.09)!important;
  color:transparent!important;font-size:0!important;line-height:1!important;text-decoration:none!important;animation:none!important;filter:none!important;transform:none!important;pointer-events:auto!important;cursor:pointer!important;overflow:hidden!important;
}
#rppFaithfulV7 #gateAuthorLink::before{content:'私の記録を綴る'!important;position:absolute!important;left:0!important;right:0!important;top:23%!important;display:block!important;color:#efcf79!important;background:none!important;font:500 clamp(15px,3.9vw,20px)/1.05 ui-serif,"Yu Mincho","Hiragino Mincho ProN",serif!important;letter-spacing:.075em!important;text-align:center!important;text-shadow:0 2px 9px rgba(0,0,0,.82)!important;pointer-events:none!important}
#rppFaithfulV7 #gateAuthorLink::after{content:'WRITE YOUR STORY'!important;position:absolute!important;left:0!important;right:0!important;top:62%!important;display:block!important;color:#e2b94f!important;background:none!important;font:600 clamp(8px,2.15vw,11px)/1 "Cormorant Garamond",Baskerville,Georgia,serif!important;letter-spacing:.22em!important;text-align:center!important;text-shadow:0 2px 8px rgba(0,0,0,.78)!important;pointer-events:none!important}
#rppFaithfulV7 #gateAuthorLink:hover,#rppFaithfulV7 #gateAuthorLink:focus-visible{filter:brightness(1.045)!important;outline:none!important}
#rppFaithfulV7 #gateAuthorLink:before{background:none!important}

#rppFaithfulV7 #msg{position:absolute!important;z-index:34!important;left:13%!important;right:13%!important;top:75.65%!important;margin:0!important;min-height:0!important;color:#f0b9a9!important;background:rgba(1,8,21,.76)!important;border-radius:999px!important;font:600 10px/1.35 ui-sans-serif,system-ui,sans-serif!important;text-align:center!important;letter-spacing:.02em!important;pointer-events:none!important}
#rppFaithfulV7 #msg:empty{display:none!important}
#rppFaithfulV7 #demoHint{display:none!important}

@media(max-width:380px){
  #rppFaithfulV7 .v7-pride{font-size:47px;transform:scaleX(.94)}
  #rppFaithfulV7 .v7-main{font-size:27px;letter-spacing:.045em}
  #rppFaithfulV7 .v7-bridge{left:8%;right:8%;font-size:12px;letter-spacing:.045em}
}
@media(min-width:700px){body.rpp-faithful-v7 #gate:not(.hidden){padding:18px 0!important}body.rpp-faithful-v7 #gate .gate-card{width:min(540px,56.25svh)!important}}
@media(prefers-reduced-motion:reduce){#rppFaithfulV7 *{scroll-behavior:auto!important}}
</style>
<script>
(()=>{
  const LOCK='<svg viewBox="0 0 64 72" aria-hidden="true" focusable="false"><defs><linearGradient id="v7LockGold" x1="10" y1="5" x2="54" y2="67" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff0a6"/><stop offset=".34" stop-color="#e6b748"/><stop offset=".68" stop-color="#a96512"/><stop offset="1" stop-color="#f0cf70"/></linearGradient></defs><path d="M19 30V21.5C19 12 24.7 6 32 6s13 6 13 15.5V30" fill="none" stroke="url(#v7LockGold)" stroke-width="4" stroke-linecap="round"/><path d="M23 29V21.5c0-6.2 3.8-10.3 9-10.3s9 4.1 9 10.3V29" fill="none" stroke="#75500f" stroke-opacity=".45" stroke-width="1.1"/><rect x="11" y="28" width="42" height="35" rx="7" fill="#071a3a" stroke="url(#v7LockGold)" stroke-width="3"/><rect x="14.5" y="31.5" width="35" height="28" rx="4.5" fill="none" stroke="#f4d177" stroke-opacity=".24"/><path d="M32 39.5c-3 0-5.3 2.4-5.3 5.3 0 2 1.1 3.7 2.7 4.6l-1 6.8h7.2l-1-6.8c1.6-.9 2.7-2.6 2.7-4.6 0-2.9-2.3-5.3-5.3-5.3Z" fill="url(#v7LockGold)"/></svg>';
  const markup=()=>`<div class="v7-frame-outer"></div><div class="v7-frame-inner"></div><i class="v7-corner tl"></i><i class="v7-corner tr"></i><i class="v7-corner br"></i><i class="v7-corner bl"></i><div class="v7-collection">MEMORIAL COLLECTION 2026</div><div class="v7-deco top"></div><div class="v7-title"><span class="v7-road">ROAD TO</span><span class="v7-pride">PEACE PRIDE</span></div><div class="v7-deco mid"></div><div class="v7-jp"><span class="v7-date">9.12までの</span><span class="v7-main">挑戦と誓いの記録</span></div><svg class="v7-path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="v7PathGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2ae" stop-opacity=".15"/><stop offset=".35" stop-color="#ffd96f" stop-opacity=".76"/><stop offset="1" stop-color="#efb934" stop-opacity=".94"/></linearGradient></defs><path class="wide" d="M50 0 C46 9 57 12 50 20 S37 31 50 41 S66 51 46 63 S35 76 52 84 S61 93 50 100"/><path class="core" d="M50 0 C46 9 57 12 50 20 S37 31 50 41 S66 51 46 63 S35 76 52 84 S61 93 50 100"/></svg><div class="v7-bridge">そして、11.15、11.18へ</div><div class="v7-panel"></div><div class="v7-panel-top"></div><div class="v7-label">閲覧パスワード</div><div class="v7-lock">${LOCK}</div><div class="v7-btn-deco"></div>`;
  const build=()=>{
    const card=document.querySelector('#gate .gate-card'); if(!card)return;
    document.body.classList.add('rpp-faithful-v7');
    let root=document.getElementById('rppFaithfulV7');
    if(!root){root=document.createElement('div');root.id='rppFaithfulV7';root.setAttribute('data-layout','faithful-v7-9x16');root.innerHTML=markup();card.appendChild(root)}
    const pw=document.getElementById('pw'),unlock=document.getElementById('unlock'),msg=document.getElementById('msg');
    let author=document.getElementById('gateAuthorLink');
    if(!author){author=document.createElement('a');author.id='gateAuthorLink';author.href='./author.html';author.setAttribute('aria-label','私の記録を綴る / WRITE YOUR STORY')}
    if(pw&&pw.parentElement!==root){pw.placeholder='パスワードを入力してください';root.appendChild(pw)}
    if(unlock&&unlock.parentElement!==root){unlock.textContent='記録をひらく';unlock.setAttribute('aria-label','記録をひらく');root.appendChild(unlock)}
    if(author&&author.parentElement!==root)root.appendChild(author);
    if(msg&&msg.parentElement!==root)root.appendChild(msg);
    card.dataset.topPolish='faithful-v7';card.dataset.referenceRatio='9x16';
  };
  build();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build,{once:true});
  setTimeout(build,60);setTimeout(build,240);
})();
</script>`;

function apply(response){return new HTMLRewriter().on('body',{element(el){el.append(FAITHFUL_V7,{html:true})}}).transform(response)}

export default {
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx);
    const url=new URL(request.url),type=response.headers.get('content-type')||'';
    if(type.includes('text/html')&&['/','/index.html','/refresh','/latest'].includes(url.pathname))return apply(response);
    return response;
  }
};
