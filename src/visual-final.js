import app from './exact-cover-avif.js';

const VISUAL_FINAL = `
<style>
/* Last-mile visual lock: keep the approved portrait composition identical across devices. */
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

@media(max-width:899px){
  #rppCrispCopy{top:6.0%!important;left:7.5%!important;right:7.5%!important}
  #rppCrispCopy .title{font-size:clamp(35px,9.25vw,44px)!important;line-height:1.02!important;letter-spacing:.025em!important}
  #rppCrispCopy .jp{margin-top:4.2%!important;font-size:clamp(13px,3.2vw,17px)!important}
  #rppCrispCopy .goldRule{margin-top:3.4%!important}
  #rppCrispCopy .bridge{margin-top:2.6%!important;font-size:clamp(9px,2.45vw,13px)!important}
  #rppCrispCopy .vow{margin-top:1.9%!important;font-size:clamp(7px,1.95vw,10px)!important}
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
}
</style>
<script>
(()=>{
  const card=document.querySelector('#gate .gate-card');
  if(!card)return;
  card.dataset.visualFinal='2026-09-03';
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
    if(type.includes('text/html')&&(path==='/'||path==='/index.html'))return apply(response);
    return response;
  }
};
