import app from './viewer-logout.js';

const PREMIUM_V6 = `
<style>
/* ROAD TO PEACE PRIDE — premium v6 final top polish */
#rppCrispCopy .rpp-road{
  top:auto!important;
  margin-bottom:2.2%!important;
  font-family:Didot,"Bodoni 72","Bodoni MT","Times New Roman",Georgia,serif!important;
  font-weight:400!important;
  font-size:clamp(19px,5.45vw,27px)!important;
  letter-spacing:.23em!important;
  color:#f1d58a!important;
  text-shadow:0 2px 16px rgba(0,0,0,.92),0 0 14px rgba(240,190,73,.13)!important;
}
#rppCrispCopy .rpp-pride{
  font-family:Didot,"Bodoni 72","Bodoni MT","Times New Roman",Georgia,serif!important;
  font-weight:400!important;
  font-size:clamp(41px,11.55vw,52px)!important;
  letter-spacing:.035em!important;
  line-height:.94!important;
  transform:scaleX(.965)!important;
  transform-origin:50% 50%!important;
  background:linear-gradient(180deg,#fff3bd 0%,#f4d47b 22%,#c88725 53%,#f1ca68 76%,#9a5d15 100%)!important;
  -webkit-background-clip:text!important;background-clip:text!important;
  color:transparent!important;-webkit-text-fill-color:transparent!important;
  filter:drop-shadow(0 1px 0 rgba(255,241,184,.18)) drop-shadow(0 4px 9px rgba(0,0,0,.34))!important;
}
#rppCrispCopy .title{top:11.55%!important;left:3.8%!important;right:3.8%!important}
.rpp-title-divider{top:24.45%!important;left:30%!important;width:40%!important;height:3.1%!important;opacity:.92!important}
#rppCrispCopy .jp{top:28.35%!important}
#rppCrispCopy .rpp-jp-date{font-size:clamp(17px,5vw,24px)!important;letter-spacing:.10em!important}
#rppCrispCopy .rpp-jp-main{margin-top:2.0%!important;font-size:clamp(23px,6.75vw,32px)!important;letter-spacing:.075em!important}
#rppCrispCopy .bridge{
  top:40.9%!important;
  left:15%!important;right:15%!important;
  color:#e7c66e!important;
  font-size:clamp(9px,2.65vw,13px)!important;
  line-height:1.25!important;
  letter-spacing:.085em!important;
  white-space:nowrap!important;
  text-shadow:0 2px 10px rgba(0,0,0,.92),0 0 8px rgba(235,183,62,.14)!important;
}
#rppCrispCopy .bridge:before,#rppCrispCopy .bridge:after{
  content:''!important;display:inline-block!important;vertical-align:middle!important;
  width:clamp(20px,7vw,38px)!important;height:1px!important;margin:0 .75em!important;
  background:linear-gradient(90deg,transparent,#d7a947 45%,#f0d17d 50%,#d7a947 55%,transparent)!important;
  box-shadow:0 0 5px rgba(241,202,107,.22)!important;
}
.rpp-v5-panel{
  top:53.2%!important;bottom:3.1%!important;left:7.1%!important;right:7.1%!important;
  background:linear-gradient(180deg,rgba(2,16,38,.79),rgba(1,10,25,.94))!important;
  border-color:rgba(213,157,54,.88)!important;
  box-shadow:inset 0 0 0 1px rgba(255,229,148,.07),inset 0 0 0 7px rgba(177,118,28,.035),0 18px 44px rgba(0,0,0,.29)!important;
}
#rppAuthLabel{
  top:56.2%!important;
  font-size:clamp(11px,3.05vw,15px)!important;
  letter-spacing:.12em!important;
  color:#e4c879!important;
}
#gate #pw{
  top:59.55%!important;left:11.7%!important;width:76.6%!important;height:7.05%!important;
  padding:0 6% 0 14%!important;
  border:1.35px solid #d49a35!important;
  border-radius:18px!important;
  background:linear-gradient(180deg,rgba(8,28,57,.95),rgba(2,13,31,.98))!important;
  color:#f7ebc7!important;
  box-shadow:inset 0 0 0 1px rgba(255,229,144,.11),inset 0 -12px 24px rgba(0,0,0,.11),0 8px 22px rgba(0,0,0,.24),0 0 14px rgba(219,163,49,.07)!important;
  font-size:clamp(13px,3.5vw,18px)!important;
}
#gate #pw::placeholder{color:rgba(213,217,225,.50)!important;letter-spacing:.035em!important}
#gate #pw:focus{border-color:#f0cd70!important;box-shadow:0 0 0 2px rgba(246,205,104,.18),0 10px 26px rgba(0,0,0,.30),0 0 24px rgba(224,175,62,.12)!important}
.rpp-v5-lock{
  left:15.0%!important;top:61.55%!important;width:18px!important;height:19px!important;aspect-ratio:auto!important;
  background:none!important;filter:none!important;border:1.8px solid #d7a23c!important;border-radius:3px!important;
  box-shadow:0 0 7px rgba(231,177,58,.12)!important;
}
.rpp-v5-lock:before{content:''!important;position:absolute!important;left:3px!important;top:-9px!important;width:8px!important;height:8px!important;border:1.8px solid #d7a23c!important;border-bottom:0!important;border-radius:8px 8px 0 0!important}
.rpp-v5-lock:after{content:''!important;position:absolute!important;left:6px!important;top:6px!important;width:3px!important;height:5px!important;border-radius:3px!important;background:#e4b34a!important;box-shadow:0 0 4px rgba(237,195,91,.28)!important}
html body #gate #unlock.rpp-action,#gate #unlock{
  top:69.45%!important;left:15.1%!important;width:69.8%!important;height:8.65%!important;
  padding:0 8%!important;
  font-size:clamp(17px,4.6vw,24px)!important;
  letter-spacing:.115em!important;
  background-size:100% 100%!important;
  box-shadow:0 12px 30px rgba(0,0,0,.31),0 0 25px rgba(230,172,52,.10)!important;
}
html body #gate #gateAuthorLink.rpp-action,#gate #gateAuthorLink{
  top:81.55%!important;left:15.4%!important;width:69.2%!important;height:9.25%!important;
  background-size:100% 100%!important;
  box-shadow:0 12px 30px rgba(0,0,0,.29),0 0 27px rgba(217,163,57,.10)!important;
}
#gate #gateAuthorLink::before{top:23%!important;font-size:clamp(15px,4.05vw,21px)!important;letter-spacing:.09em!important}
#gate #gateAuthorLink::after{top:61%!important;font-size:clamp(8px,2.2vw,12px)!important;letter-spacing:.23em!important}
#gate #msg{top:67.25%!important;left:12%!important;right:12%!important;min-height:0!important;font-size:11px!important}
@media(max-width:380px){
  #rppCrispCopy .rpp-pride{font-size:40px!important;letter-spacing:.018em!important}
  #rppCrispCopy .bridge{left:11%!important;right:11%!important;font-size:9px!important}
  html body #gate #unlock.rpp-action,#gate #unlock{left:14.4%!important;width:71.2%!important}
  html body #gate #gateAuthorLink.rpp-action,#gate #gateAuthorLink{left:14.7%!important;width:70.6%!important}
}
@media(min-width:900px){
  #rppCrispCopy .rpp-road{font-size:23px!important}
  #rppCrispCopy .rpp-pride{font-size:47px!important}
  #rppCrispCopy .bridge{font-size:11px!important}
  #gate #pw{font-size:15px!important}
  html body #gate #unlock.rpp-action,#gate #unlock{font-size:20px!important}
  #gate #gateAuthorLink::before{font-size:17px!important}
  #gate #gateAuthorLink::after{font-size:9px!important}
}
</style>
<script>
(()=>{
  const mark=()=>{const card=document.querySelector('#gate .gate-card');if(card)card.dataset.topPolish='premium-v6';};
  mark();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mark,{once:true});setTimeout(mark,80);
})();
</script>`;

function apply(response){return new HTMLRewriter().on('body',{element(el){el.append(PREMIUM_V6,{html:true})}}).transform(response)}

export default {
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx);
    const url=new URL(request.url),type=response.headers.get('content-type')||'';
    if(type.includes('text/html')&&['/','/index.html','/refresh','/latest'].includes(url.pathname))return apply(response);
    return response;
  }
};
