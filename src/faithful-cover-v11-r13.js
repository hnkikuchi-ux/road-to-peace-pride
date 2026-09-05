import app from './faithful-cover-v11-r12.js';

const R13=`
<style>
/* r13 — cover flows directly into contents */
body.rpp-cover-direct #cover{
  min-height:auto!important;
  padding-bottom:clamp(22px,5vw,38px)!important;
}
body.rpp-cover-direct #cover .bridge,
body.rpp-cover-direct #cover .actions,
body.rpp-cover-direct #cover #resumeNote,
body.rpp-cover-direct #cover #resumeBtn,
body.rpp-cover-direct #cover #tocBtn{
  display:none!important;
}
body.rpp-cover-direct #cover .rule{
  margin-bottom:0!important;
}
body.rpp-cover-direct #toc:not(.hidden){
  margin-top:0!important;
  padding-top:clamp(24px,6vw,44px)!important;
}
body.rpp-cover-direct #toc .top-actions #homeBtn{display:none!important}
</style>
<script>
(()=>{
  const HIDE_TEXT=[
    'そして、11.15、11.18へ',
    'OUR VOW, OUR JOURNEY',
    'STORIES ↓',
    '続きから読む',
    'WRITE YOUR STORY｜私の記録を綴る',
    'WRITE YOUR STORY｜原稿を書く',
    'ログアウト'
  ];
  let renderedForOpen=false;
  const apply=()=>{
    const cover=document.getElementById('cover'),toc=document.getElementById('toc');
    if(!cover||!toc)return false;
    document.body.classList.add('rpp-cover-direct');
    cover.querySelectorAll('*').forEach(el=>{
      const text=(el.textContent||'').trim();
      if(HIDE_TEXT.includes(text)||text.startsWith('前回：'))el.style.display='none';
    });
    const eyes=[...cover.querySelectorAll('.eyebrow')];
    eyes.forEach((el,i)=>{if(i>0&&(el.textContent||'').includes('OUR VOW'))el.style.display='none'});
    const open=!cover.classList.contains('hidden');
    if(open){
      toc.classList.remove('hidden');
      if(!renderedForOpen){
        renderedForOpen=true;
        try{if(typeof window.renderToc==='function')window.renderToc()}catch(e){}
      }
    }else renderedForOpen=false;
    return true;
  };
  const install=()=>{
    const cover=document.getElementById('cover');if(!cover)return false;
    if(!cover.dataset.r13Observed){
      cover.dataset.r13Observed='1';
      new MutationObserver(()=>apply()).observe(cover,{attributes:true,attributeFilter:['class']});
      const unlock=document.getElementById('unlock');if(unlock)unlock.addEventListener('click',()=>{setTimeout(apply,80);setTimeout(apply,320)});
    }
    apply();setTimeout(apply,120);setTimeout(apply,500);return true;
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
</script>`;

function inject(response){return new HTMLRewriter().on('body',{element(el){el.append(R13,{html:true})}}).transform(response)}

export default{
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx),url=new URL(request.url),type=response.headers.get('content-type')||'';
    if(type.includes('text/html')&&['/','/index.html','/refresh','/latest'].includes(url.pathname))return inject(response);
    return response;
  }
};
