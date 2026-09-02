import uiWorker from './ui-enhancer.js';

const TOP_STYLE = `
<style>
/* Top cover: no outer gold frame; background image becomes the visual focus. */
#gate{position:relative;overflow:hidden;isolation:isolate;background:#031027!important}
#gate:before{content:""!important;position:absolute!important;inset:0!important;border:0!important;box-shadow:none!important;pointer-events:none!important;z-index:-3!important;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 1600'%3E%3Cdefs%3E%3ClinearGradient id='sky' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop stop-color='%23020a1d'/%3E%3Cstop offset='.48' stop-color='%23081736'/%3E%3Cstop offset='.72' stop-color='%23101b40'/%3E%3Cstop offset='1' stop-color='%23040b19'/%3E%3C/linearGradient%3E%3CradialGradient id='sun'%3E%3Cstop stop-color='%23fff7cf'/%3E%3Cstop offset='.18' stop-color='%23f6d77a' stop-opacity='.95'/%3E%3Cstop offset='.5' stop-color='%23e0a638' stop-opacity='.38'/%3E%3Cstop offset='1' stop-color='%23e0a638' stop-opacity='0'/%3E%3C/radialGradient%3E%3ClinearGradient id='road' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop stop-color='%23fff4be' stop-opacity='.95'/%3E%3Cstop offset='.55' stop-color='%23e5b84d' stop-opacity='.78'/%3E%3Cstop offset='1' stop-color='%23b77c22' stop-opacity='.08'/%3E%3C/linearGradient%3E%3Cfilter id='glow'%3E%3CfeGaussianBlur stdDeviation='14'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='900' height='1600' fill='url(%23sky)'/%3E%3Cg fill='%23fff1ba' opacity='.55'%3E%3Ccircle cx='132' cy='205' r='2'/%3E%3Ccircle cx='220' cy='312' r='1.6'/%3E%3Ccircle cx='716' cy='190' r='1.8'/%3E%3Ccircle cx='784' cy='338' r='1.4'/%3E%3Ccircle cx='620' cy='278' r='1.2'/%3E%3Ccircle cx='328' cy='168' r='1.2'/%3E%3Ccircle cx='514' cy='236' r='1.4'/%3E%3C/g%3E%3Cpath d='M0 935 L92 842 178 890 255 804 333 870 413 790 487 850 566 776 645 846 735 812 900 924 900 1600 0 1600Z' fill='%2308142f'/%3E%3Cpath d='M0 1028 L105 918 190 970 276 886 367 948 448 860 540 935 620 874 710 956 800 910 900 1005 900 1600 0 1600Z' fill='%23050d22'/%3E%3Ccircle cx='450' cy='905' r='155' fill='url(%23sun)' filter='url(%23glow)'/%3E%3Ccircle cx='450' cy='905' r='7' fill='%23fff8d8'/%3E%3Cpath d='M451 910 C410 962 502 998 430 1054 C376 1097 540 1138 438 1209 C379 1250 535 1318 454 1450' fill='none' stroke='url(%23road)' stroke-width='16' stroke-linecap='round' opacity='.9'/%3E%3Cpath d='M451 910 C410 962 502 998 430 1054 C376 1097 540 1138 438 1209 C379 1250 535 1318 454 1450' fill='none' stroke='%23fff1b1' stroke-width='3.5' stroke-linecap='round' opacity='.92'/%3E%3Cg fill='%23472e62' opacity='.72'%3E%3Cellipse cx='68' cy='1165' rx='170' ry='305'/%3E%3Cellipse cx='842' cy='1165' rx='170' ry='305'/%3E%3C/g%3E%3C/svg%3E")!important;background-size:cover!important;background-position:center center!important;background-repeat:no-repeat!important}
#gate:after{content:"";position:absolute;inset:0;z-index:-2;pointer-events:none;background:linear-gradient(180deg,rgba(2,8,24,.18) 0%,rgba(2,8,24,.02) 38%,rgba(2,8,24,.14) 70%,rgba(2,8,24,.52) 100%),radial-gradient(circle at 50% 58%,rgba(243,204,105,.09),transparent 30%)}
#gate .gate-card{max-width:720px!important;border:0!important;box-shadow:none!important;background:linear-gradient(180deg,rgba(2,11,30,.22),rgba(3,13,31,.34) 64%,rgba(3,13,31,.62))!important;backdrop-filter:blur(2px)!important;padding:72px 34px 44px!important}
#gate .gate-card.orn:before,#gate .gate-card.orn:after{display:none!important}
#gate .gate-card h1{filter:drop-shadow(0 4px 16px rgba(0,0,0,.42))}
#gate .gate-card .sub,#gate .gate-bridge,#gate .gate-card .eyebrow{text-shadow:0 2px 11px rgba(0,0,0,.65)}
#gate .input{background:rgba(4,13,31,.7)!important;backdrop-filter:blur(8px)!important}
#gate .primary{box-shadow:0 9px 28px rgba(0,0,0,.24),inset 0 0 0 2px rgba(255,238,184,.23)!important}
@media(max-width:520px){#gate:before{background-position:center 48%!important}#gate .gate-card{padding:52px 16px 34px!important}#gate .gate-card h1{font-size:47px!important}}
</style>`;

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
