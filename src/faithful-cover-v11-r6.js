import app from './faithful-cover-v11-r5.js';

const AUTHOR_R6 = `
<style>
/* author-polish-r6 — final contrast and mobile typography pass */
body.rpp-author-r5 #editor{
  opacity:1!important;
  filter:none!important;
  color:#fff!important;
}
body.rpp-author-r5 #editor>.panel{
  opacity:1!important;
  filter:none!important;
  color:#fff!important;
  background:linear-gradient(180deg,rgba(7,23,52,.985),rgba(3,14,34,.99))!important;
  border-color:rgba(231,187,79,.72)!important;
}
body.rpp-author-r5 #editor>.panel h1,
body.rpp-author-r5 #editor>.panel h2,
body.rpp-author-r5 #editor>.panel .rpp-section-title{
  color:#fff!important;
  opacity:1!important;
}
body.rpp-author-r5 #editor>.panel .ey,
body.rpp-author-r5 #editor>.panel .rpp-section-no{
  color:#efd98d!important;
  opacity:1!important;
}
body.rpp-author-r5 #editor #formArea:not(.muted),
body.rpp-author-r5 #editor #formArea:not(.muted) .rpp-form-section{
  opacity:1!important;
  filter:none!important;
}
body.rpp-author-r5 #editor .rpp-form-section{
  background:linear-gradient(180deg,rgba(10,31,65,.72),rgba(5,19,43,.72))!important;
  border-color:rgba(216,184,102,.34)!important;
}
body.rpp-author-r5 #editor input:not([type="checkbox"]):not([type="file"]),
body.rpp-author-r5 #editor textarea{
  background:rgba(2,16,37,.92)!important;
  color:#fff!important;
  border-color:rgba(216,184,102,.42)!important;
  opacity:1!important;
  -webkit-text-fill-color:#fff!important;
}
body.rpp-author-r5 #editor input::placeholder,
body.rpp-author-r5 #editor textarea::placeholder{
  color:#8995aa!important;
  opacity:1!important;
}
body.rpp-author-r5 #editor label,
body.rpp-author-r5 #editor .status,
body.rpp-author-r5 #editor .deadline{
  opacity:1!important;
}
body.rpp-author-r5 #editor .status{
  color:#e8e1d1!important;
  background:rgba(216,184,102,.075)!important;
}
body.rpp-author-r5 #editor .deadline:not(.closed){
  color:#d8dce5!important;
  background:rgba(216,184,102,.055)!important;
}
#rppCodeCheckpoint h2{
  font-size:clamp(20px,5.3vw,25px)!important;
  line-height:1.55!important;
  letter-spacing:.035em!important;
  text-wrap:balance;
}
#rppCodeCheckpoint h2 .rpp-title-line{white-space:nowrap}
@media(max-width:360px){
  #rppCodeCheckpoint h2{font-size:19px!important;letter-spacing:.02em!important}
  #rppCodeCheckpoint .rpp-checkpoint-code{font-size:34px!important;letter-spacing:.10em!important}
}
</style>
<script>
(()=>{
  const tune=()=>{
    const cp=document.getElementById('rppCodeCheckpoint');
    if(!cp)return;
    const h=cp.querySelector('#rppCheckpointTitle');
    if(h&&!h.dataset.r6Title){
      h.dataset.r6Title='1';
      const reset=(h.textContent||'').trim().startsWith('新しい');
      h.innerHTML=reset
        ? '<span class="rpp-title-line">新しい編集用承認コードを</span><br><span class="rpp-title-line">保存してください</span>'
        : '<span class="rpp-title-line">編集用承認コードを</span><br><span class="rpp-title-line">保存してください</span>';
    }
  };
  const start=()=>{
    tune();
    const obs=new MutationObserver(tune);
    obs.observe(document.body,{childList:true,subtree:true});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
</script>`;

function applyAuthor(response){
  return new HTMLRewriter().on('body',{element(el){el.append(AUTHOR_R6,{html:true})}}).transform(response);
}

export default {
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx);
    const url=new URL(request.url),type=response.headers.get('content-type')||'';
    if(type.includes('text/html')&&['/author','/author.html'].includes(url.pathname))return applyAuthor(response);
    return response;
  }
};
