import app from './faithful-cover-v11-r12.js';

const R13=`
<style>
/* r13 — cover flows directly into contents + simplified author form */
html{max-width:100%;overflow-x:clip!important}
body.rpp-cover-direct{max-width:100%;overflow-x:clip!important}
body.rpp-cover-direct .wrap,
body.rpp-cover-direct #cover,
body.rpp-cover-direct #toc,
body.rpp-cover-direct #reader{max-width:100%;overflow-x:clip}
body.rpp-cover-direct #cover{min-height:auto!important;padding-bottom:clamp(22px,5vw,38px)!important}
body.rpp-cover-direct #cover .rule{margin-bottom:0!important}
body.rpp-cover-direct #toc:not(.hidden){margin-top:0!important;padding-top:clamp(24px,6vw,44px)!important}
body.rpp-cover-direct #toc .top-actions #homeBtn{display:none!important}
body.rpp-cover-direct #toc .top-actions .eyebrow{display:none!important}

/* author cleanup */
body.rpp-author-clean .rpp-form-section{display:contents!important}
body.rpp-author-clean .rpp-section-head{display:none!important}
body.rpp-author-clean .rpp-author-steps{display:none!important}
body.rpp-author-clean .rpp-hidden-org-detail{display:none!important}
body.rpp-author-clean .rpp-org-detail-field{margin-top:10px!important}
body.rpp-author-clean .rpp-org-detail-field input{min-height:48px}
</style>
<script>
(()=>{
  let renderedForOpen=false;
  const pruneCover=()=>{
    const cover=document.getElementById('cover');if(!cover)return;
    const forbidden=['そして、11.15、11.18へ','OUR VOW, OUR JOURNEY','STORIES ↓','続きから読む','WRITE YOUR STORY｜私の記録を綴る','WRITE YOUR STORY｜原稿を書く','ログアウト'];
    const walker=document.createTreeWalker(cover,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(n=>{let v=n.nodeValue||'';for(const x of forbidden)v=v.split(x).join('');if(v!==n.nodeValue)n.nodeValue=v});
    cover.querySelectorAll('*').forEach(el=>{const t=(el.textContent||'').replace(/\s+/g,' ').trim();if(forbidden.some(x=>t===x))el.remove()});
    cover.querySelectorAll('.eyebrow').forEach(el=>{const t=(el.textContent||'').replace(/\s+/g,' ').trim();if(t&&!t.includes('MEMORIAL COLLECTION 2026'))el.remove()});
    const resume=document.getElementById('resumeNote');if(resume)resume.remove();
  };
  const applyPublic=()=>{
    const cover=document.getElementById('cover'),toc=document.getElementById('toc');
    if(!cover||!toc)return false;
    pruneCover();
    document.body.classList.add('rpp-cover-direct');
    const open=!cover.classList.contains('hidden');
    if(open){toc.classList.remove('hidden');if(!renderedForOpen){renderedForOpen=true;try{if(typeof window.renderToc==='function')window.renderToc()}catch(e){}}}else renderedForOpen=false;
    return true;
  };
  const installPublic=()=>{
    const cover=document.getElementById('cover');if(!cover)return false;
    if(!cover.dataset.r13Observed){
      cover.dataset.r13Observed='1';
      new MutationObserver(()=>applyPublic()).observe(cover,{attributes:true,attributeFilter:['class'],childList:true,subtree:true,characterData:true});
      const unlock=document.getElementById('unlock');if(unlock)unlock.addEventListener('click',()=>{setTimeout(applyPublic,80);setTimeout(applyPublic,320);setTimeout(applyPublic,900)})
    }
    applyPublic();setTimeout(applyPublic,120);setTimeout(applyPublic,500);setTimeout(applyPublic,1200);return true;
  };

  const hideHelperText=()=>{
    const targets=['皆さまの記録を、総区ごとの章に分けて掲載するために使用します。掲載したい総区を1つ選択してください。','アップロード前に最大1600pxへ圧縮し、JPEG再生成で通常の位置情報等のメタデータを除去します。'];
    document.querySelectorAll('p,div,small,span').forEach(el=>{const t=(el.textContent||'').trim();if(targets.includes(t))el.style.display='none'});
  };
  const installOrgDetail=()=>{
    const b=document.getElementById('rppBunku'),h=document.getElementById('rppHonbu'),s=document.getElementById('rppShibu');
    if(!b||!h||!s)return false;
    document.body.classList.add('rpp-author-clean');
    [b,h,s].forEach(e=>e.closest('.field')?.classList.add('rpp-hidden-org-detail'));
    let input=document.getElementById('rppOrgDetail');
    if(!input){
      const host=(document.getElementById('rppOrgSelect')?.closest('.field'))||b.closest('.field')?.parentElement;
      if(!host)return false;
      const f=document.createElement('div');f.className='field rpp-org-detail-field';
      f.innerHTML='<label>分区／本部／部</label><input id="rppOrgDetail" maxlength="240" placeholder="分区／本部／部を入力">';
      host.appendChild(f);input=f.querySelector('input');
      input.addEventListener('input',()=>{b.value=input.value;h.value='';s.value='';b.dispatchEvent(new Event('input',{bubbles:true}))});
    }
    if(!input.dataset.loaded){const vals=[b.value,h.value,s.value].filter(v=>String(v||'').trim());if(vals.length)input.value=vals.join('／');input.dataset.loaded='1'}
    return true;
  };
  const applyAuthor=()=>{document.body.classList.add('rpp-author-clean');hideHelperText();installOrgDetail();};
  const installAuthor=()=>{applyAuthor();setTimeout(applyAuthor,150);setTimeout(applyAuthor,600);setTimeout(applyAuthor,1400)};

  const start=()=>{/\/author(?:\.html)?\/?$/.test(location.pathname)?installAuthor():installPublic()};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
</script>`;

function inject(response){
  return new HTMLRewriter()
    .on('#cover .bridge',{element(el){el.remove()}})
    .on('#cover .actions',{element(el){el.remove()}})
    .on('#cover #resumeNote',{element(el){el.remove()}})
    .on('#toc .top-actions #homeBtn',{element(el){el.remove()}})
    .on('#toc .top-actions .eyebrow',{element(el){el.remove()}})
    .on('body',{element(el){el.append(R13,{html:true})}})
    .transform(response)
}

export default{
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx),url=new URL(request.url),type=response.headers.get('content-type')||'';
    if(type.includes('text/html')&&['/','/index.html','/refresh','/latest','/author','/author.html'].includes(url.pathname.replace(/\/$/,'' )||'/'))return inject(response);
    return response;
  }
};
