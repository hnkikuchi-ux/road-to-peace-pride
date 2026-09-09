import app from './faithful-cover-v11-r30.js';

const AUTHOR_FIRST_TIME_GUIDE=`<style id="rppAuthorFirstTimeGuideR31">
#rppFirstTimeGuide{margin:10px 0 16px;padding:13px 15px;border:1px solid rgba(181,137,49,.48);border-left:4px solid #c99b39;background:rgba(216,184,102,.10);color:#24324b;line-height:1.7}
#rppFirstTimeGuide .rpp-first-title{margin:0 0 4px;font-weight:800;font-size:17px;letter-spacing:.01em;color:#1f2d49}
#rppFirstTimeGuide p{margin:0;font-size:14px;line-height:1.75;color:#424b5e}
@media(max-width:560px){#rppFirstTimeGuide{margin:8px 0 14px;padding:12px 13px}#rppFirstTimeGuide .rpp-first-title{font-size:16px}#rppFirstTimeGuide p{font-size:13px}}
</style>
<script>
(()=>{
  function mount(){
    const auth=document.getElementById('auth');if(!auth)return false;
    let guide=document.getElementById('rppFirstTimeGuide');
    if(!guide){
      guide=document.createElement('div');
      guide.id='rppFirstTimeGuide';
      guide.setAttribute('role','note');
      guide.innerHTML='<div class="rpp-first-title">初めての方</div><p>メールアドレスを入力し、「認識コードを送信」を押してください。</p>';
    }
    const email=document.getElementById('email');
    const field=email?.closest?.('.field');
    if(field){
      if(guide.nextElementSibling!==field)field.insertAdjacentElement('beforebegin',guide);
    }else{
      const h1=auth.querySelector('h1');
      if(h1&&guide.previousElementSibling!==h1)h1.insertAdjacentElement('afterend',guide);
      else if(!guide.parentElement)auth.prepend(guide);
    }
    document.documentElement.dataset.rppFirstTimeGuide='r31-top';
    return true;
  }
  const run=()=>{mount();setTimeout(mount,120);setTimeout(mount,500);setTimeout(mount,1200)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  addEventListener('pageshow',run);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)run()});
})();
</script>`;

function injectAuthor(response){
  const headers=new Headers(response.headers);headers.set('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');headers.delete('Content-Length');
  return new HTMLRewriter()
    .on('html',{element(el){el.setAttribute('data-rpp-first-time-guide','r31-top')}})
    .on('body',{element(el){el.append(AUTHOR_FIRST_TIME_GUIDE,{html:true})}})
    .transform(new Response(response.body,{status:response.status,statusText:response.statusText,headers}));
}

export default{
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx),url=new URL(request.url),path=url.pathname.replace(/\/$/,'')||'/',type=response.headers.get('content-type')||'';
    if(type.includes('text/html')&&['/author','/author.html'].includes(path))return injectAuthor(response);
    return response;
  }
};
