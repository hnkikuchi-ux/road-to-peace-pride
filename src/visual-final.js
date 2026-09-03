import app from './exact-cover-avif.js';

const VISUAL_FINAL = `
<style>
/* =========================================================
   ROAD TO PEACE PRIDE — final visual language
   Cover / contents / reader / author share one memorial-book system.
   ========================================================= */
:root{--rpp-final-navy:#06152f;--rpp-final-deep:#020817;--rpp-final-gold:#d4a94f;--rpp-final-gold2:#f1d883;--rpp-final-paper:#f7f0df;--rpp-final-ink:#152744}

/* ---------- approved cover lock ---------- */
#gate:before{display:none!important}
#gate .gate-card{background:#020817!important}
#gate .gate-card.orn:before{left:0!important;right:0!important;top:0!important;bottom:0!important;inset:0!important;width:100%!important;height:100%!important;border:0!important;border-radius:0!important;background:url('/assets/mobile-dawn.svg') center/100% 100% no-repeat!important;box-shadow:none!important;filter:none!important;opacity:1!important}
#gate .gate-card.orn:after{left:0!important;right:0!important;top:0!important;bottom:0!important;inset:0!important;width:100%!important;height:100%!important;border:0!important;border-radius:0!important;background:linear-gradient(180deg,rgba(1,7,19,.10),rgba(1,7,19,.015) 38%,rgba(1,7,19,.02) 58%,rgba(1,7,19,.18) 100%)!important;box-shadow:none!important;filter:none!important;opacity:1!important}
#rppCrispCopy{background:none!important;overflow:visible!important}
#rppCrispCopy .title{white-space:nowrap!important}
#rppCrispCopy .jp,#rppCrispCopy .goldRule,#rppCrispCopy .bridge,#rppCrispCopy .vow{display:block!important;visibility:visible!important;opacity:1!important}
#rppCrispCopy .jp{color:#fff2d3!important;text-shadow:0 3px 18px rgba(0,0,0,.88),0 0 12px rgba(238,198,96,.16)!important}
#rppCrispCopy .bridge{color:#e6c665!important;text-shadow:0 2px 15px rgba(0,0,0,.9)!important}
#rppCrispCopy .vow{color:rgba(248,232,190,.96)!important;text-shadow:0 2px 14px rgba(0,0,0,.88)!important}
#rppCrispCopy .goldRule{box-shadow:0 0 16px rgba(240,200,96,.52)!important}

/* ---------- shared non-cover atmosphere ---------- */
#toc,#reader{background:radial-gradient(circle at 50% 10%,rgba(45,67,116,.28),transparent 34%),linear-gradient(180deg,rgba(4,16,38,.22),rgba(2,9,24,.08))!important}
#toc .top-actions,#reader .top-actions{top:0!important;margin:0 -3px 22px!important;padding:10px 3px 14px!important;background:linear-gradient(180deg,rgba(3,13,31,.985) 0%,rgba(3,13,31,.94) 72%,rgba(3,13,31,0) 100%)!important;backdrop-filter:blur(10px)!important}
#toc .btn,#reader .mini-btn,#reader .reader-nav button{border:1px solid rgba(218,177,79,.58)!important;background:linear-gradient(180deg,rgba(9,30,65,.86),rgba(3,15,35,.93))!important;color:#f1ddaa!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.035),0 7px 18px rgba(0,0,0,.18)!important;transition:transform .18s ease,border-color .22s ease,box-shadow .22s ease,background .22s ease!important}
#toc .btn:hover,#reader .mini-btn:hover,#reader .reader-nav button:hover{border-color:#f0cf78!important;background:linear-gradient(180deg,rgba(13,39,79,.92),rgba(4,18,41,.96))!important;box-shadow:0 10px 24px rgba(0,0,0,.25),0 0 24px rgba(213,170,70,.08)!important}
#toc .btn:active,#reader .mini-btn:active,#reader .reader-nav button:active{transform:translateY(1px) scale(.99)!important}

/* ---------- contents ---------- */
#toc{position:relative!important;max-width:760px!important;margin:auto!important;padding-top:18px!important}
#toc:before{content:"MEMORIAL COLLECTION 2026";display:block;margin:8px 0 7px;text-align:center;color:#dfbe67;font:700 9px/1.4 ui-serif,"Times New Roman",serif;letter-spacing:.30em;opacity:.96}
#toc>h2{margin:0!important;text-align:center!important;color:#fff1cf!important;font:500 clamp(34px,8vw,48px)/1.25 ui-serif,"Yu Mincho","Hiragino Mincho ProN",serif!important;letter-spacing:.10em!important;text-shadow:0 8px 30px rgba(0,0,0,.34)!important}
#toc>h2:after{content:"";display:block;width:min(220px,58%);height:1px;margin:17px auto 13px;background:linear-gradient(90deg,transparent,#d6a94c,transparent);box-shadow:0 0 14px rgba(222,177,75,.28)}
#toc>p.note{text-align:center!important;color:rgba(226,220,204,.72)!important;font:12px/1.7 ui-serif,"Yu Mincho",serif!important;margin:0 auto 24px!important}
.toc-search{position:relative!important;width:min(100%,640px)!important;margin:0 auto 16px!important;padding-bottom:22px!important}
.toc-search:before{content:"";position:absolute!important;z-index:2!important;left:17px!important;top:16px!important;width:10px!important;height:10px!important;border:1.5px solid #d7b75e!important;border-radius:50%!important;pointer-events:none!important;opacity:.9!important}
.toc-search:after{content:"";position:absolute!important;z-index:2!important;left:27px!important;top:27px!important;width:7px!important;height:1.5px!important;background:#d7b75e!important;transform:rotate(45deg)!important;transform-origin:left center!important;pointer-events:none!important;opacity:.9!important}
#tocSearch{width:100%!important;min-height:45px!important;border:1px solid rgba(214,172,72,.44)!important;border-radius:999px!important;background:linear-gradient(180deg,rgba(7,27,58,.86),rgba(2,13,31,.88))!important;color:#f6ead0!important;box-shadow:inset 0 1px 10px rgba(0,0,0,.20),0 7px 20px rgba(0,0,0,.10)!important;padding:11px 17px 11px 43px!important;font:13px/1.4 ui-serif,"Yu Mincho","Hiragino Mincho ProN",serif!important;letter-spacing:.025em!important;outline:none!important;transition:border-color .22s ease,box-shadow .22s ease,background .22s ease!important}
#tocSearch::placeholder{color:rgba(228,218,193,.54)!important}
#tocSearch:focus{border-color:#e3c56e!important;background:linear-gradient(180deg,rgba(10,35,72,.94),rgba(3,16,37,.96))!important;box-shadow:0 0 0 3px rgba(218,177,79,.09),inset 0 1px 10px rgba(0,0,0,.18),0 10px 26px rgba(0,0,0,.16)!important}
#tocSearchMeta{position:absolute!important;right:8px!important;bottom:0!important;min-height:17px!important;color:#bfae7b!important;font:10px/1.4 ui-sans-serif,system-ui!important;letter-spacing:.06em!important;text-align:right!important;opacity:.88!important}
#tocList{display:grid!important;gap:10px!important;padding-bottom:40px!important}
#tocList .toc-item{border:1px solid rgba(214,172,72,.27)!important;border-radius:13px!important;background:linear-gradient(145deg,rgba(11,34,72,.73),rgba(3,16,37,.82))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.025),0 12px 30px rgba(0,0,0,.18)!important;overflow:hidden!important;opacity:0;transform:translateY(9px);animation:rppContentsEnter .62s cubic-bezier(.16,1,.3,1) forwards!important}
#tocList .toc-item:nth-child(2){animation-delay:.045s!important}#tocList .toc-item:nth-child(3){animation-delay:.09s!important}#tocList .toc-item:nth-child(4){animation-delay:.135s!important}#tocList .toc-item:nth-child(5){animation-delay:.18s!important}#tocList .toc-item:nth-child(n+6){animation-delay:.21s!important}
#tocList .toc-item button{padding:16px 17px!important;align-items:center!important;gap:14px!important;transition:background .22s ease,transform .18s ease!important}
#tocList .toc-item button:hover{background:rgba(235,197,101,.055)!important}
#tocList .toc-item button:active{transform:scale(.992)!important}
#tocList .toc-title{color:#f5ead0!important;font:600 clamp(15px,4.3vw,19px)/1.5 ui-serif,"Yu Mincho","Hiragino Mincho ProN",serif!important;letter-spacing:.025em!important;margin-bottom:6px!important}
#tocList .toc-name{color:#c9b986!important;font:11px/1.4 ui-sans-serif,system-ui!important;letter-spacing:.04em!important}
#tocList .toc-item button>div:last-child{color:#ddb85b!important;font:300 29px/1 ui-serif,"Times New Roman",serif!important;opacity:.82!important;transform:translateX(0)!important;transition:transform .2s ease,opacity .2s ease!important}
#tocList .toc-item button:hover>div:last-child{transform:translateX(3px)!important;opacity:1!important}

/* ---------- reader ---------- */
#reader{max-width:760px!important;margin:auto!important;padding-top:18px!important}
#reader .paper{position:relative!important;border:1px solid rgba(207,174,99,.82)!important;border-radius:15px!important;background:linear-gradient(180deg,#faf4e6 0%,#f6edda 100%)!important;color:#2c3545!important;box-shadow:0 24px 70px rgba(0,0,0,.34),inset 0 0 0 7px rgba(193,147,54,.045)!important;padding:34px 23px 42px!important;overflow:hidden!important;animation:rppPaperEnter .72s cubic-bezier(.16,1,.3,1) both!important}
#reader .paper:before{content:"";position:absolute;inset:9px;border:1px solid rgba(190,143,52,.26);border-radius:9px;pointer-events:none}
#reader .paper>*{position:relative;z-index:1}
#reader .story-label{color:#9d6d19!important;letter-spacing:.25em!important;font-size:9px!important}
#reader .paper h2{color:#0f2b50!important;font-size:clamp(27px,7.5vw,38px)!important;line-height:1.55!important;letter-spacing:.045em!important;margin:20px 0 9px!important;text-wrap:balance!important}
#reader .meta{color:#6f7180!important;font-size:12px!important;line-height:1.85!important}
#reader .paper .rule{margin:26px 0!important;background:linear-gradient(90deg,transparent,rgba(190,139,37,.45),transparent)!important}
#reader .body{color:#38404c!important;font-family:ui-serif,"Yu Mincho","Hiragino Mincho ProN",serif!important;line-height:2.12!important;letter-spacing:.015em!important}
#reader .photo{border:0!important;border-radius:5px!important;box-shadow:0 14px 35px rgba(59,42,15,.20),0 0 0 1px rgba(179,135,47,.40)!important}
#reader .reader-nav{margin-top:17px!important;padding-bottom:22px!important}
#reader #fav{min-width:108px!important}

/* ---------- author/editor ---------- */
body:has(#rppAuthorHero){background:#031027!important}
body:has(#rppAuthorHero):before{background:radial-gradient(circle at 50% 9%,rgba(222,181,84,.16),transparent 23%),radial-gradient(circle at 12% 32%,rgba(255,255,255,.035) 0 1px,transparent 1.5px),radial-gradient(circle at 82% 24%,rgba(255,255,255,.03) 0 1px,transparent 1.5px),linear-gradient(180deg,#071936 0%,#041126 55%,#020a18 100%)!important}
body:has(#rppAuthorHero) .wrap{width:min(100%,740px)!important;padding:16px 14px 112px!important}
#rppAuthorHero{padding:31px 8px 23px!important}
#rppAuthorHero .rpp-kicker{font-size:10px!important;letter-spacing:.31em!important;color:#e2c169!important}
#rppAuthorHero .rpp-author-rule{width:min(220px,58%)!important;margin:13px auto 19px!important;opacity:.68!important}
#rppAuthorHero .rpp-author-title{font-size:clamp(38px,9vw,57px)!important;line-height:1.05!important;letter-spacing:.055em!important;margin:0 0 10px!important;color:#e9c76d!important;text-shadow:0 8px 32px rgba(0,0,0,.28)!important}
#rppAuthorHero .rpp-author-sub{font-size:15px!important;letter-spacing:.14em!important;color:#d7b85f!important}
body:has(#rppAuthorHero) .top{margin:-7px 0 10px!important}
body:has(#rppAuthorHero) .top .pill{min-height:43px!important;display:inline-flex!important;align-items:center!important;padding:9px 15px!important;border-color:rgba(216,174,79,.55)!important;background:linear-gradient(180deg,rgba(10,31,65,.83),rgba(3,15,35,.92))!important;color:#f2dda5!important;box-shadow:0 7px 20px rgba(0,0,0,.18)!important}
#auth.panel,#editor .panel{border:1px solid rgba(211,169,77,.78)!important;border-radius:16px!important;background:linear-gradient(180deg,#fbf6ea 0%,#f4ead5 100%)!important;color:#19304f!important;box-shadow:0 24px 68px rgba(0,0,0,.38),inset 0 0 0 7px rgba(188,138,43,.045)!important;padding:29px 20px 27px!important;margin-bottom:18px!important;animation:rppEditorEnter .68s cubic-bezier(.16,1,.3,1) both!important}
#auth.panel:before,#editor .panel:before{inset:8px!important;border-color:rgba(187,139,48,.24)!important}
#auth .ey,#editor .ey{color:#a47523!important;font-size:10px!important;letter-spacing:.25em!important}
#auth.panel h1,#editor .panel h1{color:#102b50!important;font-size:clamp(29px,7.5vw,40px)!important;line-height:1.32!important;letter-spacing:.035em!important;margin:12px 0 10px!important}
#editor .save-row{align-items:flex-start!important;padding-bottom:4px!important}
#editor #statusBadge{margin-top:7px!important;border-color:rgba(174,127,38,.42)!important;background:rgba(214,171,80,.08)!important;color:#8f641c!important;font-weight:700!important}
#editor .status{margin:4px 0 13px!important;padding:12px 14px!important;border:1px solid rgba(175,132,52,.20)!important;border-radius:9px!important;background:linear-gradient(180deg,rgba(19,44,80,.035),rgba(19,44,80,.065))!important;color:#536070!important}
#editor .status b{color:#243a58!important;letter-spacing:.04em!important}
#editor .deadline{margin:10px 0 18px!important;border-left:2px solid #c99a3d!important;border-radius:0 7px 7px 0!important;background:rgba(206,160,68,.075)!important;color:#536071!important;padding:11px 13px!important}
#editor .field{margin:18px 0!important}
#editor .field label,#auth .field label{color:#243b5d!important;font:600 15px/1.45 ui-serif,"Yu Mincho","Hiragino Mincho ProN",serif!important;letter-spacing:.035em!important;margin-bottom:8px!important}
#editor input,#editor textarea,#auth input{border:1px solid rgba(183,138,50,.44)!important;border-radius:9px!important;background:rgba(255,255,255,.58)!important;color:#172b49!important;box-shadow:inset 0 1px 2px rgba(66,45,12,.025)!important;transition:border-color .22s ease,box-shadow .22s ease,background .22s ease!important}
#editor input,#auth input{min-height:55px!important;padding:13px 14px!important}
#editor textarea{min-height:245px!important;padding:14px!important;line-height:1.95!important}
#editor input:focus,#editor textarea:focus,#auth input:focus{border-color:#b98832!important;background:#fffdf7!important;box-shadow:0 0 0 3px rgba(190,144,54,.10),0 8px 22px rgba(75,51,13,.055)!important}
#editor input::placeholder,#editor textarea::placeholder,#auth input::placeholder{color:#8d8b87!important;opacity:.82!important}
#editor .count{color:#7d786d!important;margin-top:6px!important}
#rppFilePicker{border-color:rgba(182,137,50,.42)!important;border-radius:9px!important;background:rgba(255,255,255,.54)!important;box-shadow:inset 0 1px 2px rgba(66,45,12,.025)!important}
#rppFilePicker .rpp-file-button{border-color:rgba(180,133,44,.48)!important;background:linear-gradient(180deg,#fffdf8,#f0e2c5)!important;color:#183050!important}
#photoOptionalNote{margin-top:11px!important;border-left:2px solid #c28e31!important;border-radius:0 6px 6px 0!important;background:rgba(196,145,49,.07)!important;color:#6b665c!important;padding:9px 11px!important}
#editor #confirm{accent-color:#b98529!important}
#editor label:has(#confirm){padding:10px 4px!important;border-top:1px solid rgba(184,137,45,.16)!important;border-bottom:1px solid rgba(184,137,45,.16)!important}
#editor .stack{gap:10px!important;margin-top:17px!important}
#editor .stack .btn{min-height:54px!important;border-radius:8px!important;font:700 15px/1.2 ui-serif,"Yu Mincho",serif!important;letter-spacing:.06em!important;transition:transform .18s ease,box-shadow .23s ease,filter .23s ease!important}
#editor .stack .secondary{background:linear-gradient(180deg,#0d2b58,#061a3a)!important;color:#f0d584!important;border:1px solid #bd8e37!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.035),0 8px 20px rgba(3,15,35,.14)!important}
#editor #submit{background:linear-gradient(105deg,#ad741f 0%,#e8bd5f 40%,#f3d57d 52%,#d6a244 76%,#a66b19 100%)!important;color:#1e1303!important;border:1px solid #a8701f!important;box-shadow:0 10px 24px rgba(112,74,15,.16),inset 0 1px 0 rgba(255,255,255,.38)!important}
#editor #logout{margin-top:6px!important;background:transparent!important;color:#6d665b!important;border:1px solid rgba(126,112,88,.28)!important;box-shadow:none!important;font-size:13px!important;min-height:47px!important}
#editor .stack .btn:hover{filter:brightness(1.035)!important;box-shadow:0 11px 26px rgba(19,35,61,.16)!important}
#editor .stack .btn:active{transform:translateY(1px) scale(.997)!important}
#savemsg{min-height:18px!important;margin-top:12px!important;text-align:center!important}
#storyPreview .paper{border-radius:14px!important;background:linear-gradient(180deg,#faf4e6,#f5ecd9)!important;box-shadow:0 30px 90px rgba(0,0,0,.50)!important}

@keyframes rppContentsEnter{to{opacity:1;transform:none}}
@keyframes rppPaperEnter{0%{opacity:0;transform:translateY(10px) scale(.997)}100%{opacity:1;transform:none}}
@keyframes rppEditorEnter{0%{opacity:0;transform:translateY(9px)}100%{opacity:1;transform:none}}

@media(max-width:899px){
  #rppCrispCopy{top:6.0%!important;left:7.5%!important;right:7.5%!important}
  #rppCrispCopy .title{font-size:clamp(35px,9.25vw,44px)!important;line-height:1.02!important;letter-spacing:.025em!important}
  #rppCrispCopy .jp{margin-top:4.2%!important;font-size:clamp(13px,3.2vw,17px)!important}
  #rppCrispCopy .goldRule{margin-top:3.4%!important}
  #rppCrispCopy .bridge{margin-top:2.6%!important;font-size:clamp(9px,2.45vw,13px)!important}
  #rppCrispCopy .vow{margin-top:1.9%!important;font-size:clamp(7px,1.95vw,10px)!important}
  #toc,#reader{padding-left:12px!important;padding-right:12px!important}
  #reader .paper{padding-left:21px!important;padding-right:21px!important}
  body:has(#rppAuthorHero) .wrap{padding-left:10px!important;padding-right:10px!important}
  #auth.panel,#editor .panel{padding-left:18px!important;padding-right:18px!important;border-radius:14px!important}
}

@media(min-width:900px){
  #gate:not(.hidden){padding:18px!important;background:radial-gradient(circle at 50% 48%,#102653 0%,#06162f 33%,#020919 72%,#01040b 100%)!important}
  #gate .gate-card{width:min(430px,49.3svh)!important;max-width:430px!important;height:auto!important;aspect-ratio:941/1672!important;box-shadow:0 34px 120px rgba(0,0,0,.66),0 0 80px rgba(214,173,78,.10)!important}
  #rppCrispCopy{top:5.7%!important;left:7%!important;right:7%!important}
  #rppCrispCopy .private{font-size:9px!important}
  #rppCrispCopy .collection{font-size:10px!important}
  #rppCrispCopy .title{font-size:50px!important;line-height:1.00!important;letter-spacing:.018em!important;margin-top:7.0%!important}
  #rppCrispCopy .jp{font-size:15px!important;margin-top:4.0%!important;line-height:1.5!important}
  #rppCrispCopy .goldRule{margin-top:3.3%!important;width:66%!important}
  #rppCrispCopy .bridge{font-size:11px!important;margin-top:2.7%!important;line-height:1.45!important}
  #rppCrispCopy .vow{font-size:8px!important;margin-top:1.8%!important}
  #rppAuthLabel{top:58.7%!important}
  #gate #pw{left:13.5%!important;right:auto!important;top:61.5%!important;width:73%!important;height:5.7%!important}
  #gate #unlock{left:17.2%!important;right:auto!important;top:70.0%!important;width:65.6%!important;height:6.9%!important}
  #gate #gateAuthorLink{left:18.2%!important;right:auto!important;top:80.5%!important;width:63.6%!important;height:8.0%!important}
  #gate #msg{left:15%!important;right:auto!important;top:67.6%!important;width:70%!important}
  #toc,#reader{padding-left:20px!important;padding-right:20px!important}
  #reader .paper{padding:42px 43px 48px!important}
  body:has(#rppAuthorHero) .wrap{padding-top:24px!important}
}

@media(prefers-reduced-motion:reduce){#tocList .toc-item,#reader .paper,#auth.panel,#editor .panel{animation:none!important;opacity:1!important;transform:none!important}}
</style>
<script>
(()=>{
  document.body.dataset.visualTheme='memorial-book-v2';
  const card=document.querySelector('#gate .gate-card');
  if(card)card.dataset.visualFinal='2026-09-03';
})();
</script>`;

function apply(response){
  return new HTMLRewriter().on('body',{element(el){el.append(VISUAL_FINAL,{html:true})}}).transform(response);
}

export default {
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx);
    const type=response.headers.get('content-type')||'';
    const path=new URL(request.url).pathname.replace(/\/$/,'')||'/';
    if(type.includes('text/html')&&['/','/index.html','/author','/author.html'].includes(path))return apply(response);
    return response;
  }
};
