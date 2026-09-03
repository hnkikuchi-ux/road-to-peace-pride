import app from './visual-final.js';

const ARTWORK_FINAL = `
<style>
/* =========================================================
   ROAD TO PEACE PRIDE — premium artwork layer v4
   Generated high-resolution artwork is used only for visual parts.
   Text, password input and actions remain live HTML controls.
   ========================================================= */

#gate .gate-card{
  background:#020817!important;
}

/* high-resolution star valley + golden road */
#gate .gate-card.orn:before{
  background:url('/assets/premium-v4-bg.webp') center/100% 100% no-repeat!important;
  filter:saturate(1.03) contrast(1.025)!important;
  animation:rppArtworkBreath 15s ease-in-out infinite!important;
}

/* transparent art-deco frame + soft legibility veil */
#gate .gate-card.orn:after{
  z-index:2!important;
  background:
    url('/assets/premium-v4-frame.webp') center/100% 100% no-repeat,
    linear-gradient(180deg,rgba(0,7,22,.12) 0%,rgba(0,7,22,.02) 33%,rgba(0,7,22,.01) 54%,rgba(0,6,18,.10) 61%,rgba(0,5,16,.48) 100%)!important;
  opacity:1!important;
}

/* title block — closer to supplied reference artwork */
#rppCrispCopy{
  z-index:7!important;
  top:5.35%!important;
  left:7.2%!important;
  right:7.2%!important;
  text-shadow:none!important;
}
#rppCrispCopy .private{display:none!important}
#rppCrispCopy .collection{
  margin:0!important;
  color:#e5bd65!important;
  font:600 clamp(9px,2.45vw,14px)/1.35 ui-serif,"Times New Roman",serif!important;
  letter-spacing:.29em!important;
  text-shadow:0 2px 14px rgba(0,0,0,.82),0 0 14px rgba(231,190,89,.10)!important;
}
#rppCrispCopy .title{
  margin-top:8.8%!important;
  font:500 clamp(47px,12.55vw,78px)/.92 ui-serif,"Times New Roman","Yu Mincho",serif!important;
  letter-spacing:0!important;
  color:#e8be61!important;
  text-shadow:0 4px 19px rgba(0,0,0,.74),0 0 18px rgba(235,186,74,.09)!important;
  animation:rppArtTitleIn 1.05s .12s cubic-bezier(.16,1,.3,1) both!important;
}
#rppCrispCopy .title .rpp-road{
  display:block!important;
  margin-bottom:.42em!important;
  color:#e7c46e!important;
  font-size:.47em!important;
  line-height:1!important;
  letter-spacing:.15em!important;
}
#rppCrispCopy .title .rpp-pride{
  display:block!important;
  white-space:nowrap!important;
  font-size:1em!important;
  line-height:.82!important;
  letter-spacing:.005em!important;
  background:linear-gradient(180deg,#fff1a8 0%,#d49a35 20%,#f4cf73 44%,#a9681d 70%,#f0c96b 100%)!important;
  -webkit-background-clip:text!important;
  background-clip:text!important;
  color:transparent!important;
  -webkit-text-fill-color:transparent!important;
  filter:drop-shadow(0 3px 2px rgba(0,0,0,.40))!important;
}
#rppCrispCopy .rpp-title-divider{
  display:block!important;
  width:64%!important;
  height:21px!important;
  margin:5.1% auto 0!important;
  background:url('/assets/premium-v4-divider.webp') center/100% 100% no-repeat!important;
  opacity:.92!important;
  filter:drop-shadow(0 0 7px rgba(229,182,62,.12))!important;
}
#rppCrispCopy .jp{
  margin-top:2.8%!important;
  color:#e6bc64!important;
  font:500 clamp(18px,4.65vw,28px)/1.16 ui-serif,"Yu Mincho","Hiragino Mincho ProN",serif!important;
  letter-spacing:.045em!important;
  text-shadow:0 3px 15px rgba(0,0,0,.82),0 0 12px rgba(224,174,61,.08)!important;
}
#rppCrispCopy .jp .rpp-date{
  display:block!important;
  font-size:1.02em!important;
  line-height:1.1!important;
  letter-spacing:.08em!important;
}
#rppCrispCopy .jp .rpp-date small{
  font-size:.55em!important;
  letter-spacing:.05em!important;
  margin-left:.22em!important;
}
#rppCrispCopy .jp .rpp-record{
  display:block!important;
  margin-top:.22em!important;
  font-size:.88em!important;
  line-height:1.25!important;
  letter-spacing:.07em!important;
}
#rppCrispCopy .goldRule,#rppCrispCopy .bridge,#rppCrispCopy .vow{display:none!important}

/* bridge line placed over the illuminated valley, like the reference */
#rppImageBridge{
  position:absolute!important;
  z-index:8!important;
  left:11%!important;
  right:11%!important;
  top:57.55%!important;
  text-align:center!important;
  color:#e7bd65!important;
  font:600 clamp(10px,2.8vw,16px)/1.4 ui-serif,"Yu Mincho","Hiragino Mincho ProN",serif!important;
  letter-spacing:.105em!important;
  text-shadow:0 2px 12px rgba(0,0,0,.86),0 0 12px rgba(234,185,65,.12)!important;
  pointer-events:none!important;
}
#rppImageBridge:before,#rppImageBridge:after{
  content:"✦"!important;
  color:#f2c85f!important;
  margin:0 .9em!important;
  font-size:.86em!important;
  text-shadow:0 0 12px rgba(255,202,76,.70)!important;
}

/* lower login frame, kept separate from controls */
#rppLoginFrame{
  position:absolute!important;
  z-index:4!important;
  left:7.5%!important;
  top:62.0%!important;
  width:85%!important;
  height:36.0%!important;
  border:1px solid rgba(202,151,54,.72)!important;
  background:linear-gradient(180deg,rgba(1,12,31,.42),rgba(1,9,24,.70))!important;
  box-shadow:inset 0 0 0 1px rgba(239,201,107,.08),inset 0 0 32px rgba(0,0,0,.18),0 12px 30px rgba(0,0,0,.14)!important;
  clip-path:polygon(3.5% 0,96.5% 0,100% 4.5%,100% 95.5%,96.5% 100%,3.5% 100%,0 95.5%,0 4.5%)!important;
  pointer-events:none!important;
}
#rppLoginFrame:before{
  content:""!important;
  position:absolute!important;
  inset:7px!important;
  border:1px solid rgba(207,161,67,.34)!important;
  clip-path:inherit!important;
}

/* live password label + input */
#rppAuthLabel{
  z-index:9!important;
  top:65.05%!important;
  left:14%!important;
  right:14%!important;
  text-align:center!important;
  color:#e5c36f!important;
  font-size:clamp(10px,2.55vw,14px)!important;
  letter-spacing:.10em!important;
}
#gate #pw{
  z-index:12!important;
  left:13.5%!important;
  top:68.45%!important;
  width:73%!important;
  height:5.8%!important;
  padding-left:8.2%!important;
  border:1px solid rgba(213,160,60,.82)!important;
  border-radius:9px!important;
  background:linear-gradient(180deg,rgba(1,12,31,.86),rgba(0,8,23,.90))!important;
  color:#fff1cc!important;
  box-shadow:inset 0 0 0 1px rgba(255,225,146,.035),inset 0 0 18px rgba(0,0,0,.15),0 7px 20px rgba(0,0,0,.28)!important;
}
#gate #pw:focus{
  border-color:#efca6b!important;
  box-shadow:0 0 0 2px rgba(232,184,71,.10),0 8px 24px rgba(0,0,0,.31),inset 0 0 16px rgba(238,200,103,.035)!important;
}
#gate #pw::placeholder{color:rgba(220,218,213,.36)!important}
#gate #pw{background-image:radial-gradient(circle at 8.7% 50%,rgba(228,182,73,.9) 0 2px,transparent 2.5px),linear-gradient(180deg,rgba(1,12,31,.86),rgba(0,8,23,.90))!important;background-size:auto,auto!important;background-repeat:no-repeat!important}

/* primary gold action — metallic, brighter center, quieter edges */
html body #gate #unlock.rpp-action,#gate #unlock{
  left:17.1%!important;
  top:76.75%!important;
  width:65.8%!important;
  height:7.25%!important;
  border:1px solid #e4bd62!important;
  border-radius:7px!important;
  background:
    linear-gradient(105deg,rgba(255,246,190,.08) 0%,transparent 16%,rgba(255,249,218,.18) 46%,rgba(255,255,236,.40) 51%,rgba(255,246,198,.13) 59%,transparent 84%),
    linear-gradient(180deg,#ca8a22 0%,#efc15d 23%,#f8d978 48%,#d89a2f 74%,#aa6815 100%)!important;
  color:#171005!important;
  font-size:clamp(15px,3.8vw,22px)!important;
  letter-spacing:.12em!important;
  box-shadow:inset 0 0 0 2px rgba(255,235,159,.20),inset 0 1px 0 rgba(255,255,255,.55),0 10px 25px rgba(0,0,0,.34),0 0 19px rgba(236,185,62,.15)!important;
}
#gate #unlock:before{
  animation:rppArtworkSweep 6.5s 1.3s ease-in-out infinite!important;
}

/* secondary two-line action */
html body #gate #gateAuthorLink.rpp-action,#gate #gateAuthorLink{
  left:18.0%!important;
  top:87.45%!important;
  width:64%!important;
  height:7.7%!important;
  border:2px solid rgba(221,175,72,.92)!important;
  background:
    linear-gradient(105deg,transparent 18%,rgba(255,242,185,.06) 40%,rgba(255,250,222,.15) 50%,rgba(255,242,185,.06) 60%,transparent 82%) -150% 0/230% 100% no-repeat,
    radial-gradient(circle at 50% 0,rgba(62,91,145,.22),transparent 42%),
    linear-gradient(180deg,#0a2249 0%,#03132f 58%,#010a1c 100%)!important;
  box-shadow:inset 0 0 0 3px rgba(237,198,102,.08),0 9px 25px rgba(0,0,0,.30),0 0 17px rgba(226,176,63,.11)!important;
}
#gate #gateAuthorLink:before{
  top:24%!important;
  color:#f0c76b!important;
  font-size:clamp(14px,3.45vw,20px)!important;
  letter-spacing:.08em!important;
}
#gate #gateAuthorLink:after{
  top:61%!important;
  color:#e8c56f!important;
  font-size:clamp(7px,2vw,11px)!important;
  letter-spacing:.23em!important;
}

#gate #msg{top:74.4%!important}

@keyframes rppArtworkBreath{
  0%,100%{transform:scale(1.002);filter:saturate(1.03) contrast(1.025) brightness(1)}
  50%{transform:scale(1.008);filter:saturate(1.05) contrast(1.03) brightness(1.025)}
}
@keyframes rppArtTitleIn{
  0%{opacity:0;transform:translateY(12px) scale(.995)}
  100%{opacity:1;transform:none}
}
@keyframes rppArtworkSweep{
  0%,70%{transform:translateX(-125%)!important;opacity:0!important}
  74%{opacity:.42!important}
  83%{transform:translateX(125%)!important;opacity:0!important}
  100%{transform:translateX(125%)!important;opacity:0!important}
}

@media(min-width:900px){
  #gate .gate-card{width:min(430px,49.3svh)!important;max-width:430px!important}
  #rppCrispCopy .title{font-size:58px!important}
  #rppCrispCopy .collection{font-size:10px!important}
  #rppCrispCopy .jp{font-size:21px!important}
  #rppImageBridge{font-size:12px!important}
}
@media(max-width:600px){
  #gate .gate-card{width:100vw!important}
}
@media(prefers-reduced-motion:reduce){
  #gate .gate-card.orn:before,#rppCrispCopy .title,#gate #unlock:before{animation:none!important}
}
</style>
<script>
(()=>{
  const card=document.querySelector('#gate .gate-card');
  if(!card)return;
  card.dataset.artworkVersion='premium-v4-layered';

  const title=document.querySelector('#rppCrispCopy .title');
  if(title&&!title.querySelector('.rpp-road')){
    title.innerHTML='<span class="rpp-road">ROAD TO</span><span class="rpp-pride">PEACE PRIDE</span>';
  }

  const jp=document.querySelector('#rppCrispCopy .jp');
  if(jp&&!jp.querySelector('.rpp-date')){
    jp.innerHTML='<span class="rpp-date">9.12<small>までの</small></span><span class="rpp-record">挑戦と誓いの記録</span>';
  }

  if(title&&!document.querySelector('.rpp-title-divider')){
    const divider=document.createElement('div');
    divider.className='rpp-title-divider';
    title.insertAdjacentElement('afterend',divider);
  }

  if(!document.querySelector('#rppImageBridge')){
    const bridge=document.createElement('div');
    bridge.id='rppImageBridge';
    bridge.textContent='そして、11.15、11.18へ';
    card.appendChild(bridge);
  }

  if(!document.querySelector('#rppLoginFrame')){
    const frame=document.createElement('div');
    frame.id='rppLoginFrame';
    frame.setAttribute('aria-hidden','true');
    card.appendChild(frame);
  }
})();
</script>`;

function noStore(response){
  const headers=new Headers(response.headers);
  headers.set('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');
  headers.set('Pragma','no-cache');
  headers.set('Expires','0');
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}

function apply(response){
  const transformed=new HTMLRewriter().on('body',{element(el){el.append(ARTWORK_FINAL,{html:true})}}).transform(response);
  return noStore(transformed);
}

export default {
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx);
    const type=response.headers.get('content-type')||'';
    const path=new URL(request.url).pathname.replace(/\/$/,'')||'/';
    if(type.includes('text/html')&&(path==='/'||path==='/index.html'))return apply(response);
    if(type.includes('text/html'))return noStore(response);
    return response;
  }
};
