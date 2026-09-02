import app from './touch-safety.js';

const EXACT_COVER = `
<style>
/* Exact master-art cover: the supplied approved image is the visual source of truth. */
body.rpp-gate-active .wrap{width:100%!important;max-width:none!important;margin:0!important;padding:0!important}
#gate:not(.hidden){display:grid!important;place-items:center!important;width:100%!important;min-height:100svh!important;padding:0!important;background:radial-gradient(circle at 50% 42%,#0a1b3d 0%,#030a18 56%,#01050d 100%)!important;overflow:hidden!important}
#gate.hidden{display:none!important}
#gate .gate-card{position:relative!important;width:min(100vw,56.28svh,941px)!important;max-width:none!important;height:auto!important;aspect-ratio:941/1672!important;margin:0 auto!important;padding:0!important;border:0!important;border-radius:0!important;box-shadow:0 24px 80px rgba(0,0,0,.48)!important;background:#030a18!important;background-position:center!important;background-size:100% 100%!important;background-repeat:no-repeat!important;overflow:hidden!important;isolation:isolate!important;opacity:.985!important;transition:opacity .22s ease!important}
#gate .gate-card.rpp-master-ready{opacity:1!important}
#gate .gate-card.orn:before,#gate .gate-card.orn:after,#gate .gate-card>.eyebrow,#gate .gate-card>h1,#gate .gate-card>.sub,#gate .gate-card>.gate-bridge,#gate .gate-card>.rule,#rppPasswordLabel,#rppDesktopCopy,#gate .rpp-sparkles{display:none!important}

/* True input sits directly over the input drawn into the approved master image. */
#gate #pw{position:absolute!important;z-index:12!important;left:14.15%!important;top:66.85%!important;width:71.35%!important;height:5.75%!important;margin:0!important;padding:0 5.5%!important;border:0!important;border-radius:12px!important;background:transparent!important;color:transparent!important;caret-color:#f8d77d!important;font:500 clamp(13px,3.3vw,20px)/1 ui-serif,"Yu Mincho","Hiragino Mincho ProN",serif!important;letter-spacing:.02em!important;box-shadow:none!important;outline:none!important;backdrop-filter:none!important}
#gate #pw::placeholder{color:transparent!important}
#gate #pw:focus,#gate #pw.rpp-has-value{background:rgba(2,13,31,.78)!important;color:#f7edcf!important;border:1px solid rgba(238,192,82,.88)!important;box-shadow:0 0 0 3px rgba(236,188,76,.13),inset 0 0 24px rgba(0,0,0,.12)!important}
#gate #pw:focus::placeholder{color:rgba(220,222,231,.58)!important}

/* Live hit areas map exactly onto the two baked buttons. */
#gate #unlock,#gate #gateAuthorLink{position:absolute!important;z-index:13!important;margin:0!important;padding:0!important;border:0!important;background:transparent!important;color:transparent!important;text-shadow:none!important;box-shadow:none!important;overflow:hidden!important;transform:none!important;filter:none!important;text-indent:-9999px!important}
#gate #unlock{left:17.75%!important;top:74.55%!important;width:64.2%!important;height:7.55%!important;border-radius:12px!important}
#gate #gateAuthorLink{display:block!important;left:17.55%!important;top:85.20%!important;width:64.8%!important;height:8.15%!important;border-radius:999px!important}
#gate #gateAuthorLink *{visibility:hidden!important}
#gate #unlock::before,#gate #gateAuthorLink::before{content:""!important;position:absolute!important;inset:0!important;z-index:1!important;background:linear-gradient(110deg,transparent 25%,rgba(255,244,204,.18) 48%,transparent 70%)!important;transform:translateX(-120%)!important;opacity:0!important;pointer-events:none!important}
#gate #unlock:hover::before,#gate #gateAuthorLink:hover::before,#gate #unlock:focus-visible::before,#gate #gateAuthorLink:focus-visible::before{animation:rppExactSweep .72s ease-out!important;opacity:1!important}
#gate #unlock.rpp-pressed,#gate #gateAuthorLink.rpp-pressed,#gate #unlock:active,#gate #gateAuthorLink:active{background:rgba(255,237,174,.075)!important;box-shadow:inset 0 0 30px rgba(255,225,130,.16)!important}
#gate #unlock:focus-visible,#gate #gateAuthorLink:focus-visible{outline:2px solid rgba(255,233,159,.92)!important;outline-offset:-3px!important}
#gate #unlock::after,#gate #gateAuthorLink::after{display:none!important}

#gate #msg{position:absolute!important;z-index:15!important;left:15%!important;top:72.65%!important;width:70%!important;min-height:0!important;margin:0!important;padding:3px 7px!important;border:0!important;border-radius:5px!important;background:rgba(65,8,15,.82)!important;color:#ffe1e1!important;font:700 10px/1.25 ui-sans-serif,system-ui!important;text-align:center!important}
#gate #msg:empty{display:none!important}#gate #demoHint{display:none!important}

/* Animated glints are intentionally sparse so the approved artwork stays unchanged at rest. */
.rpp-exact-sparkles{position:absolute;inset:0;z-index:11;pointer-events:none;overflow:hidden}.rpp-exact-sparkles i{position:absolute;width:3px;height:3px;border-radius:50%;background:#fff4be;box-shadow:0 0 7px 2px rgba(255,217,109,.52);opacity:.1;animation:rppExactTwinkle var(--d,3.4s) ease-in-out infinite;animation-delay:var(--l,0s)}.rpp-exact-sparkles i:before,.rpp-exact-sparkles i:after{content:"";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:linear-gradient(90deg,transparent,#ffe8a2,transparent)}.rpp-exact-sparkles i:before{width:18px;height:1px}.rpp-exact-sparkles i:after{width:1px;height:18px;background:linear-gradient(180deg,transparent,#ffe8a2,transparent)}
@keyframes rppExactTwinkle{0%,100%{opacity:.08;transform:scale(.55) rotate(0)}45%{opacity:.9;transform:scale(1.05) rotate(10deg)}68%{opacity:.28;transform:scale(.72) rotate(18deg)}}
@keyframes rppExactSweep{0%{transform:translateX(-120%);opacity:0}30%{opacity:.75}100%{transform:translateX(120%);opacity:0}}
@media(min-width:900px){#gate:not(.hidden){padding:12px!important}#gate .gate-card{width:min(52.9svh,560px)!important;box-shadow:0 34px 110px rgba(0,0,0,.58)!important}}
@media(max-width:600px){#gate .gate-card{width:100vw!important;box-shadow:none!important}}
@media(prefers-reduced-motion:reduce){.rpp-exact-sparkles i{animation:none!important;opacity:.32!important}#gate #unlock::before,#gate #gateAuthorLink::before{animation:none!important}}
</style>
<script>
(()=>{
 const card=document.querySelector('#gate .gate-card');
 if(!card)return;
 card.setAttribute('aria-label','MEMORIAL COLLECTION 2026 ROAD TO PEACE PRIDE 9.12までの挑戦と誓いの記録。そして、11.15、11.18へ');
 const pw=document.querySelector('#pw'),unlock=document.querySelector('#unlock'),author=document.querySelector('#gateAuthorLink');
 if(pw){pw.setAttribute('aria-label','閲覧パスワード');pw.setAttribute('placeholder','パスワードを入力してください');const sync=()=>pw.classList.toggle('rpp-has-value',pw.value.length>0);pw.addEventListener('input',sync);sync()}
 if(unlock){unlock.setAttribute('aria-label','記録をひらく');unlock.setAttribute('title','記録をひらく')}
 if(author){author.setAttribute('aria-label','私の記録を綴る / WRITE YOUR STORY');author.setAttribute('title','私の記録を綴る / WRITE YOUR STORY')}
 if(!card.querySelector('.rpp-exact-sparkles')){const s=document.createElement('div');s.className='rpp-exact-sparkles';for(const [x,y,d,l] of [[12,15,3.1,-.4],[74,14,4.1,-1.8],[24,28,3.6,-.9],[87,31,3.2,-2.1],[15,46,4.4,-2.8],[78,48,3.5,-.5],[28,54,3,-1.6],[83,57,4,-2.3],[12,80,3.4,-1.2],[88,80,3.7,-2.7]]){const i=document.createElement('i');i.style.left=x+'%';i.style.top=y+'%';i.style.setProperty('--d',d+'s');i.style.setProperty('--l',l+'s');s.appendChild(i)}card.appendChild(s)}
 const load=async()=>{
   try{
     const names=['01.txt','02.txt','03.txt'];
     const parts=await Promise.all(names.map(async n=>{const r=await fetch('/assets/top-master/'+n,{cache:'force-cache'});if(!r.ok)throw new Error('cover asset '+n+' '+r.status);return (await r.text()).trim()}));
     const raw=atob(parts.join(''));const bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
     const url=URL.createObjectURL(new Blob([bytes],{type:'image/webp'}));
     const img=new Image();img.onload=()=>{card.style.setProperty('background-image','url("'+url+'")','important');card.classList.add('rpp-master-ready');card.dataset.master='approved-941x1672'};img.onerror=()=>URL.revokeObjectURL(url);img.src=url;
   }catch(e){console.error('approved cover load failed',e);card.style.setProperty('background-image',"url('/assets/mobile-dawn.svg')",'important');card.classList.add('rpp-master-ready')}
 };
 load();
})();
</script>`;

function apply(response){return new HTMLRewriter().on('body',{element(el){el.append(EXACT_COVER,{html:true})}}).transform(response)}
export default {async fetch(request,env,ctx){const response=await app.fetch(request,env,ctx);const type=response.headers.get('content-type')||'';const path=new URL(request.url).pathname.replace(/\/$/,'')||'/';if(type.includes('text/html')&&(path==='/'||path==='/index.html'))return apply(response);return response}};
