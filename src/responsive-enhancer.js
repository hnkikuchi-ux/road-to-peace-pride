import app from './motion-enhancer.js';

const RESPONSIVE_LAYER = `
<style>
/* Desktop gets its own editorial composition instead of stretching the portrait cover. */
@media (min-width:900px){
  #gate:not(.hidden){display:grid!important;place-items:center!important;min-height:100svh!important;padding:clamp(24px,4vh,54px)!important;background:radial-gradient(circle at 24% 46%,rgba(100,79,168,.17),transparent 28%),radial-gradient(circle at 77% 47%,rgba(222,171,67,.075),transparent 24%),linear-gradient(135deg,#020a1b 0%,#071632 54%,#030b1d 100%)!important;overflow:hidden!important}
  #gate:not(.hidden):after{content:""!important;display:block!important;position:absolute!important;inset:0!important;pointer-events:none!important;background-image:radial-gradient(circle at 12% 17%,rgba(255,237,177,.36) 0 1px,transparent 1.5px),radial-gradient(circle at 72% 13%,rgba(255,255,255,.25) 0 1px,transparent 1.4px),radial-gradient(circle at 84% 72%,rgba(237,194,95,.25) 0 1px,transparent 1.5px),radial-gradient(circle at 39% 79%,rgba(255,255,255,.2) 0 1px,transparent 1.4px)!important;opacity:.65!important;z-index:0!important}
  #gate .gate-card{width:min(1180px,94vw)!important;height:min(760px,88svh)!important;aspect-ratio:auto!important;margin:0!important;padding:0!important;background:none!important;overflow:visible!important;position:relative!important;z-index:1!important}
  #gate .gate-card.orn:before{content:""!important;display:block!important;position:absolute!important;left:1.5%!important;top:2%!important;width:43%!important;height:96%!important;background:url('/assets/top-cover.webp') center/contain no-repeat!important;border:0!important;box-shadow:none!important;filter:drop-shadow(0 28px 48px rgba(0,0,0,.44))!important;opacity:1!important}
  #gate .gate-card.orn:after{content:""!important;display:block!important;position:absolute!important;right:1.5%!important;top:50%!important;transform:translateY(-50%)!important;width:48.5%!important;height:min(560px,76svh)!important;border:1px solid rgba(214,170,75,.42)!important;border-radius:26px!important;background:linear-gradient(145deg,rgba(5,18,43,.93),rgba(3,12,31,.88))!important;box-shadow:0 34px 90px rgba(0,0,0,.42),inset 0 0 0 1px rgba(255,230,154,.035),inset 0 0 70px rgba(91,65,145,.08)!important;backdrop-filter:blur(18px)!important;z-index:0!important}
  #gate .gate-card>.eyebrow{display:block!important;position:absolute!important;right:7%!important;top:17%!important;width:37.5%!important;margin:0!important;text-align:center!important;color:#e6c979!important;font:700 12px/1.3 ui-serif,"Yu Mincho",serif!important;letter-spacing:.28em!important;z-index:2!important}
  #gate .gate-card>h1{display:block!important;position:absolute!important;right:5.5%!important;top:24%!important;width:40.5%!important;margin:0!important;text-align:center!important;color:#f3e9cf!important;font:500 clamp(50px,4.8vw,78px)/1.03 ui-serif,"Times New Roman","Yu Mincho",serif!important;letter-spacing:.045em!important;text-shadow:0 7px 30px rgba(0,0,0,.38)!important;z-index:2!important}
  #gate .gate-card>.sub{display:block!important;position:absolute!important;right:7.2%!important;top:48%!important;width:37%!important;margin:0!important;text-align:center!important;color:#d8dce7!important;font:500 17px/1.8 ui-serif,"Yu Mincho",serif!important;letter-spacing:.035em!important;z-index:2!important}
  #gate .gate-card>.rule{display:block!important;position:absolute!important;right:12%!important;top:59%!important;width:27%!important;height:1px!important;margin:0!important;background:linear-gradient(90deg,transparent,#cfa852,transparent)!important;z-index:2!important}
  #gate #pw{left:auto!important;right:8.2%!important;top:64%!important;width:35%!important;height:58px!important;padding:0 20px!important;border:1px solid rgba(220,180,86,.45)!important;border-radius:12px!important;background:rgba(2,12,31,.82)!important;font-size:16px!important;z-index:3!important}
  #gate #unlock{left:auto!important;right:8.2%!important;top:74%!important;width:35%!important;height:66px!important;border-radius:14px!important;z-index:3!important}
  #gate #gateAuthorLink{left:auto!important;right:12.2%!important;top:86%!important;width:27%!important;height:46px!important;z-index:3!important}
  #gate #msg{left:auto!important;right:8.2%!important;top:71.3%!important;width:35%!important;z-index:4!important}
}

/* Tablet intentionally stays portrait-centric, but never grows beyond a comfortable reading scale. */
@media (min-width:600px) and (max-width:899px){
  #gate .gate-card{width:min(72vw,620px)!important}
}
</style>`;

function apply(response){return new HTMLRewriter().on('body',{element(el){el.append(RESPONSIVE_LAYER,{html:true})}}).transform(response)}

export default {
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx);
    const type=response.headers.get('content-type')||'';
    if(!type.includes('text/html'))return response;
    return apply(response);
  }
};
