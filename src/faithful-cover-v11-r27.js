import app from './faithful-cover-v11-r26.js';

const REEDIT_NO_RELOAD=`<script>
(()=>{
  async function bind(){
    const btn=document.getElementById('rppEditLoginBtn');
    if(!btn||btn.dataset.r27Bound==='1')return;
    btn.dataset.r27Bound='1';
    btn.onclick=async()=>{
      const emailInput=document.getElementById('email');
      const codeInput=document.getElementById('rppEditCode');
      const out=document.getElementById('rppEditMsg');
      const mail=(emailInput?.value||'').trim().toLowerCase();
      const code=(codeInput?.value||'').replace(/\D/g,'');
      if(!/^\S+@\S+\.\S+$/.test(mail)||code.length!==6){if(out)out.textContent='メールアドレスと6桁コードを入力してください。';return}
      btn.disabled=true;
      try{
        const r=await fetch('/api/edit-code/login',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({email:mail,code})});
        const d=await r.json();
        if(!r.ok){if(out)out.textContent=d.error||'6桁コードを確認してください。';return}
        if(out)out.textContent='認証しました。原稿を開きます。';
        if(typeof openEditor==='function'){
          const ok=await openEditor();
          if(!ok)throw new Error('原稿を開けませんでした。');
          document.getElementById('editor')?.scrollIntoView({block:'start'});
          setTimeout(()=>document.dispatchEvent(new Event('rpp:reedit-opened')),0);
        }else location.replace('/author');
      }catch(e){if(out)out.textContent=e?.message||'通信できませんでした。'}finally{btn.disabled=false}
    };
  }
  const run=()=>{bind();setTimeout(bind,120);setTimeout(bind,500);setTimeout(bind,1200)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  addEventListener('pageshow',run);
})();
</script>`;

function inject(response){
  const headers=new Headers(response.headers);headers.set('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');headers.delete('Content-Length');
  return new HTMLRewriter().on('html',{element(el){el.setAttribute('data-rpp-reedit','r27')}}).on('body',{element(el){el.append(REEDIT_NO_RELOAD,{html:true})}}).transform(new Response(response.body,{status:response.status,statusText:response.statusText,headers}));
}

export default{
  async fetch(request,env,ctx){
    const url=new URL(request.url),path=url.pathname.replace(/\/$/,'')||'/';
    const response=await app.fetch(request,env,ctx),type=response.headers.get('content-type')||'';
    if(type.includes('text/html')&&['/author','/author.html'].includes(path))return inject(response);
    return response;
  }
};
