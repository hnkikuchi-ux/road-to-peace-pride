import app from './faithful-cover-v7b.js';

const FINAL_PRIORITY = `
<style>
/* final specificity lock: prevent legacy premium-v6 !important controls from overriding v7 */
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #unlock.rpp-action,
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #unlock{
  position:absolute!important;left:16.7%!important;top:77.25%!important;width:66.6%!important;height:7.3%!important;margin:0!important;padding:0 7%!important;
  border:1.8px solid #f1cf70!important;border-radius:0!important;
  clip-path:polygon(3.1% 0,96.9% 0,100% 18%,100% 82%,96.9% 100%,3.1% 100%,0 82%,0 18%)!important;
  background:linear-gradient(180deg,#ffe18a 0%,#efc04d 19%,#d69a2b 47%,#efc45a 72%,#aa6810 100%)!important;
  color:#201306!important;font:700 clamp(19px,4.75vw,25px)/1 ui-serif,"Yu Mincho","Hiragino Mincho ProN",serif!important;letter-spacing:.095em!important;
  box-shadow:inset 0 0 0 2px rgba(137,78,7,.80),inset 0 0 0 4px rgba(255,236,172,.17),0 12px 27px rgba(0,0,0,.30),0 0 24px rgba(231,177,58,.11)!important;
  filter:none!important;animation:none!important;transform:none!important;z-index:30!important;pointer-events:auto!important
}
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #gateAuthorLink.rpp-action,
html body.rpp-faithful-v7 #gate #rppFaithfulV7 #gateAuthorLink{
  position:absolute!important;left:16.8%!important;top:89.0%!important;width:66.4%!important;height:7.15%!important;margin:0!important;padding:0!important;
  border:1.7px solid #e6b84e!important;border-radius:999px!important;
  background:radial-gradient(circle at 50% 10%,rgba(255,255,255,.10),transparent 28%),linear-gradient(180deg,#092653 0%,#051a3d 37%,#020c22 100%)!important;
  box-shadow:inset 0 0 0 2px rgba(101,59,9,.90),inset 0 0 0 4px rgba(239,196,91,.13),0 10px 24px rgba(0,0,0,.29),0 0 23px rgba(219,166,54,.09)!important;
  color:transparent!important;font-size:0!important;line-height:1!important;text-decoration:none!important;animation:none!important;filter:none!important;transform:none!important;z-index:30!important;pointer-events:auto!important
}
</style>`;

function apply(response){return new HTMLRewriter().on('body',{element(el){el.append(FINAL_PRIORITY,{html:true})}}).transform(response)}
export default {async fetch(request,env,ctx){const response=await app.fetch(request,env,ctx);const url=new URL(request.url),type=response.headers.get('content-type')||'';if(type.includes('text/html')&&['/','/index.html','/refresh','/latest'].includes(url.pathname))return apply(response);return response;}};
