import app from './faithful-cover-v11-r8.js';

const R9 = `
<style>
/* faithful v11-r9 — solemn accordion contents + luxury title typography */
:root{--r9-gold:#d8b866;--r9-gold2:#f3dc99;--r9-deep:#041126}

/* Remove explanatory district wording: names themselves become the book structure. */
body.rpp-district-book #rppIndexIntro>p,
body.rpp-district-book #rppDistrictNav,
body.rpp-district-book .rpp-index-kicker{display:none!important}
body.rpp-district-book #rppIndexIntro{margin:0 auto 24px!important}
body.rpp-district-book #rppIndexIntro h2{
  margin:0!important;
  font-family:"Bodoni 72","Bodoni MT",Didot,"Times New Roman",ui-serif,serif!important;
  font-weight:500!important;
  font-size:clamp(30px,8vw,44px)!important;
  line-height:1.08!important;
  letter-spacing:.11em!important;
  text-transform:uppercase;
  color:#f4e7bd!important;
  text-shadow:0 1px 0 #7b5b1d,0 0 15px rgba(239,217,141,.18),0 3px 18px rgba(0,0,0,.42)!important;
}

body.rpp-district-book .rpp-district-section{
  margin:0!important;
  border-bottom:1px solid rgba(216,184,102,.16);
}
body.rpp-district-book .rpp-district-head{
  position:relative;display:grid!important;grid-template-columns:1fr auto!important;align-items:center!important;
  min-height:72px;margin:0!important;padding:18px 10px 17px!important;
  border-top:1px solid rgba(239,217,141,.34)!important;border-bottom:0!important;
  cursor:pointer;user-select:none;
  background:linear-gradient(180deg,rgba(12,30,60,.34),rgba(3,14,32,.10));
  transition:background .28s ease,border-color .28s ease;
}
body.rpp-district-book .rpp-district-head:hover,
body.rpp-district-book .rpp-district-head:focus-visible{
  background:linear-gradient(180deg,rgba(22,45,82,.52),rgba(6,20,44,.22));outline:none
}
body.rpp-district-book .rpp-chapter-no,
body.rpp-district-book .rpp-district-count{display:none!important}
body.rpp-district-book .rpp-district-name{
  font-family:"Bodoni 72","Bodoni MT",Didot,"Times New Roman",ui-serif,serif!important;
  font-weight:500!important;
  font-size:clamp(23px,6.2vw,31px)!important;
  line-height:1.1!important;
  letter-spacing:.13em!important;
  color:#f5e8c4!important;
  text-shadow:0 1px 0 rgba(105,74,16,.95),0 0 12px rgba(239,217,141,.14),0 2px 12px rgba(0,0,0,.42)!important;
}
body.rpp-district-book .rpp-district-head:after{
  content:'＋';width:34px;height:34px;display:grid;place-items:center;
  border:1px solid rgba(239,217,141,.48);border-radius:50%;
  color:#efd98d;font:300 21px/1 ui-sans-serif,system-ui;
  box-shadow:inset 0 0 0 1px rgba(255,240,190,.025),0 0 15px rgba(216,184,102,.06);
  transition:transform .28s ease,background .28s ease,color .28s ease;
}
body.rpp-district-book .rpp-district-section.rpp-open .rpp-district-head:after{
  content:'−';transform:rotate(180deg);background:rgba(216,184,102,.09);color:#fff1bc
}
body.rpp-district-book .rpp-district-section>.toc-item,
body.rpp-district-book .rpp-district-section>.rpp-district-empty{
  display:none!important;
  opacity:0;transform:translateY(-6px);
}
body.rpp-district-book .rpp-district-section.rpp-open>.toc-item,
body.rpp-district-book .rpp-district-section.rpp-open>.rpp-district-empty{
  display:block!important;
  animation:r9Reveal .34s ease both;
}
@keyframes r9Reveal{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
body.rpp-district-book .rpp-district-section.rpp-open .rpp-district-head{
  border-top-color:rgba(239,217,141,.72)!important;
  background:linear-gradient(180deg,rgba(25,47,86,.64),rgba(7,22,48,.40));
}
body.rpp-district-book .rpp-district-section.rpp-open .toc-item{
  border-bottom:1px solid rgba(216,184,102,.13)!important;
  background:linear-gradient(90deg,rgba(216,184,102,.025),transparent 68%);
}
body.rpp-district-book .rpp-district-section.rpp-open .toc-item button{padding:17px 12px!important}
body.rpp-district-book .rpp-district-section.rpp-open .toc-title{
  font-family:ui-serif,"Yu Mincho",serif;font-size:17px;letter-spacing:.035em;color:#fff!important
}
body.rpp-district-book .rpp-district-section.rpp-open .toc-name{margin-top:5px;color:#b7c0d1!important}

/* Keep the same luxury accent on the author page's major headings. */
body.rpp-author-r5 #editor .rpp-section-title,
body.rpp-author-r5 #auth h1,
body.rpp-author-r5 #editor h1{
  font-family:"Bodoni 72","Bodoni MT",Didot,"Times New Roman",ui-serif,serif!important;
  letter-spacing:.085em!important;
  text-shadow:0 1px 0 rgba(87,62,17,.78),0 0 13px rgba(239,217,141,.11)!important;
}

@media(max-width:520px){
  body.rpp-district-book .rpp-district-head{min-height:66px;padding:16px 8px 15px!important}
  body.rpp-district-book .rpp-district-name{font-size:23px!important;letter-spacing:.10em!important}
  body.rpp-district-book .rpp-district-head:after{width:30px;height:30px;font-size:19px}
  body.rpp-district-book #rppIndexIntro h2{font-size:32px!important;letter-spacing:.09em!important}
}
</style>
<script>
(()=>{
  function arm(){
    const sections=[...document.querySelectorAll('.rpp-district-section:not(.rpp-legacy-section)')];
    if(!sections.length)return;
    sections.forEach((sec,i)=>{
      const head=sec.querySelector('.rpp-district-head');if(!head||head.dataset.r9Accordion==='1')return;
      head.dataset.r9Accordion='1';head.tabIndex=0;head.setAttribute('role','button');head.setAttribute('aria-expanded','false');
      const toggle=()=>{
        const opening=!sec.classList.contains('rpp-open');
        sections.forEach(s=>{s.classList.remove('rpp-open');const h=s.querySelector('.rpp-district-head');if(h)h.setAttribute('aria-expanded','false')});
        if(opening){sec.classList.add('rpp-open');head.setAttribute('aria-expanded','true')}
      };
      head.addEventListener('click',toggle);
      head.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle()}});
    });
  }
  const start=()=>{
    const intro=document.querySelector('#rppIndexIntro h2');if(intro)intro.textContent='CONTENTS';
    arm();
    const list=document.getElementById('tocList');if(list)new MutationObserver(()=>setTimeout(arm,0)).observe(list,{childList:true,subtree:true});
    setTimeout(arm,120);setTimeout(arm,500);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
</script>`;

function inject(response){return new HTMLRewriter().on('body',{element(el){el.append(R9,{html:true})}}).transform(response)}

export default {
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx),type=response.headers.get('content-type')||'';
    if(type.includes('text/html'))return inject(response);
    return response;
  }
};
