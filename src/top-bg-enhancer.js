import uiWorker from './ui-enhancer.js';

const TOP_STYLE = `
<style>
/* Approved cover artwork is the top page. Functional controls are aligned over the artwork. */
#gate{display:block!important;min-height:0!important;padding:0!important;background:#030b1b!important;overflow:hidden!important;position:relative!important}
#gate:before,#gate:after{display:none!important;content:none!important;border:0!important;box-shadow:none!important}
#gate .gate-card{position:relative!important;width:min(100vw,720px)!important;max-width:none!important;aspect-ratio:480/853!important;margin:0 auto!important;padding:0!important;border:0!important;border-radius:0!important;box-shadow:none!important;background:#030b1b url('/assets/top-cover.webp') center/100% 100% no-repeat!important;backdrop-filter:none!important;overflow:hidden!important}
#gate .gate-card.orn:before,#gate .gate-card.orn:after{display:none!important}
#gate .gate-card>.eyebrow,#gate .gate-card>h1,#gate .gate-card>.sub,#gate .gate-card>.rule,#gate .gate-card>.gate-bridge{display:none!important}
#gate #pw{position:absolute!important;z-index:5!important;left:18.1%!important;top:69.55%!important;width:63.8%!important;height:4.72%!important;margin:0!important;padding:0 4%!important;border:0!important;border-radius:4px!important;background:rgba(3,12,30,.82)!important;color:#f5e7bd!important;font:500 clamp(12px,3.6vw,17px)/1 ui-serif,"Yu Mincho","Hiragino Mincho ProN",serif!important;letter-spacing:.02em!important;box-shadow:none!important;outline:none!important;backdrop-filter:blur(2px)!important}
#gate #pw::placeholder{color:rgba(225,215,190,.52)!important}
#gate #pw:focus{box-shadow:inset 0 0 0 1px rgba(255,229,149,.52),0 0 0 3px rgba(229,186,83,.12)!important}
#gate #unlock{position:absolute!important;z-index:6!important;left:19.8%!important;top:76.7%!important;width:60.4%!important;height:6.55%!important;margin:0!important;padding:0!important;border:0!important;border-radius:5px!important;background:transparent!important;color:transparent!important;box-shadow:none!important;min-height:0!important}
#gate #unlock:focus-visible,#gate #gateAuthorLink:focus-visible{outline:2px solid #fff0ad!important;outline-offset:3px!important}
#gate #gateAuthorLink{position:absolute!important;z-index:6!important;display:block!important;left:25.5%!important;top:88.65%!important;width:49%!important;height:4.1%!important;margin:0!important;padding:0!important;border:0!important;background:transparent!important;color:transparent!important;overflow:hidden!important}
#gate #msg{position:absolute!important;z-index:7!important;left:18%!important;top:74.65%!important;width:64%!important;min-height:0!important;margin:0!important;padding:2px 5px!important;border-radius:5px!important;background:rgba(35,6,11,.64)!important;color:#ffd7d7!important;font:600 10px/1.25 ui-sans-serif,system-ui!important;text-align:center!important}
#gate #msg:empty{display:none!important}
#gate #demoHint{display:none!important}
.preview{pointer-events:none!important;background:rgba(4,14,32,.92)!important;color:#dfc477!important;border-top:1px solid rgba(215,177,83,.34)!important;font-weight:600!important}
@media(min-width:721px){#gate{padding:18px 0!important}#gate .gate-card{box-shadow:0 24px 90px rgba(0,0,0,.42)!important}}
</style>
<script>
(()=>{
 const pw=document.querySelector('#pw'),open=document.querySelector('#unlock'),author=document.querySelector('#gateAuthorLink');
 if(pw)pw.setAttribute('aria-label','閲覧パスワード');
 if(open)open.setAttribute('aria-label','文集をひらく');
 if(author)author.setAttribute('aria-label','原稿を書く / EDIT MY STORY');
})();
</script>`;

function appendStyle(response){
  return new HTMLRewriter().on('body',{element(el){el.append(TOP_STYLE,{html:true})}}).transform(response);
}

export default {
  async fetch(request,env,ctx){
    const response=await uiWorker.fetch(request,env,ctx);
    const path=new URL(request.url).pathname.replace(/\/$/,'')||'/';
    const type=response.headers.get('content-type')||'';
    if(type.includes('text/html')&&(path==='/'||path==='/index.html'))return appendStyle(response);
    return response;
  }
};
