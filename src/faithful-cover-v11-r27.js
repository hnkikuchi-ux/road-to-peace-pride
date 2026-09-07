import app from './faithful-cover-v11-r26.js';

const REEDIT_NO_RELOAD=`<script>
(()=>{
  async function openReedit(btn){
    const emailInput=document.getElementById('email');
    const codeInput=document.getElementById('rppEditCode');
    const out=document.getElementById('rppEditMsg');
    const mail=(emailInput?.value||'').trim().toLowerCase();
    const code=(codeInput?.value||'').replace(/\D/g,'');
    if(!/^\S+@\S+\.\S+$/.test(mail)||code.length!==6){if(out)out.textContent='メールアドレスと6桁コードを入力してください。';return}
    if(btn)btn.disabled=true;
    try{
      const r=await fetch('/api/edit-code/login',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({email:mail,code})});
      const d=await r.json();
      if(!r.ok){if(out)out.textContent=d.error||'6桁コードを確認してください。';return}
      if(out)out.textContent='認証しました。原稿を開きます。';
      if(typeof openEditor!=='function')throw new Error('原稿画面を開く準備ができていません。ページを更新してもう一度お試しください。');
      const ok=await openEditor();
      if(!ok)throw new Error('原稿を開けませんでした。');
      const editor=document.getElementById('editor');
      if(!editor||editor.classList.contains('hidden'))throw new Error('原稿画面を表示できませんでした。');
      editor.scrollIntoView({block:'start'});
      setTimeout(()=>document.dispatchEvent(new Event('rpp:reedit-opened')),0);
    }catch(e){if(out)out.textContent=e?.message||'通信できませんでした。'}finally{if(btn)btn.disabled=false}
  }
  function mark(){
    const btn=document.getElementById('rppEditLoginBtn');
    if(btn){btn.dataset.r27Bound='delegated';if(!btn.getAttribute('type'))btn.setAttribute('type','button')}
  }
  document.addEventListener('click',e=>{
    const btn=e.target?.closest?.('#rppEditLoginBtn');
    if(!btn)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    openReedit(btn);
  },true);
  const run=()=>{mark();setTimeout(mark,120);setTimeout(mark,500);setTimeout(mark,1200)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  addEventListener('pageshow',run);
  document.addEventListener('click',e=>{if(e.target?.closest?.('#rppEditTab'))setTimeout(mark,0)},true);
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
