import app from './faithful-cover-v11-r26.js';

const REEDIT_NO_RELOAD=`<script>
(()=>{
  async function openReedit(btn){
    const emailInput=document.getElementById('email');
    const codeInput=document.getElementById('rppEditCode');
    const out=document.getElementById('rppEditMsg');
    const mail=(emailInput?.value||'').trim().toLowerCase();
    const code=(codeInput?.value||'').replace(/\\D/g,'');
    if(!/^\\S+@\\S+\\.\\S+$/.test(mail)||code.length!==6){if(out)out.textContent='メールアドレスと6桁コードを入力してください。';return}
    if(btn)btn.disabled=true;
    try{
      const r=await fetch('/api/edit-code/login',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({email:mail,code})});
      const d=await r.json();
      if(!r.ok){if(out)out.textContent=d.error||'6桁コードを確認してください。';return}
      if(out)out.textContent='認証しました。原稿を開きます。';
      let ok=false;
      if(typeof openEditor==='function')ok=await openEditor();
      else throw new Error('原稿画面を開く準備ができていません。ページを更新してもう一度お試しください。');
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

const AUTHOR_CLARITY=`<style id="rppAuthorClarityR27">
/* AUTHOR CLARITY r27.1 — start with the Japanese author card and keep every control legible */
#rppAuthorHero{display:none!important}
body.rpp-author-r5 .top{display:none!important}
body.rpp-author-r5 .wrap{padding-top:10px!important}
body.rpp-author-r5 #auth{color:#17243a!important}
body.rpp-author-r5 #auth h1{color:#17243a!important;text-shadow:none!important;opacity:1!important}
body.rpp-author-r5 #auth .ey{color:#8a671b!important;opacity:1!important}
body.rpp-author-r5 #auth .note,
body.rpp-author-r5 #auth p,
body.rpp-author-r5 #auth small,
body.rpp-author-r5 #auth .rpp-code-note{color:#4b5360!important;opacity:1!important}
body.rpp-author-r5 #auth label{color:#263650!important;opacity:1!important;font-weight:650!important}
body.rpp-author-r5 #auth .rpp-author-guide{
  color:#4b3c20!important;opacity:1!important;
  background:linear-gradient(90deg,#fff4d2,#fffaf0)!important;
  border-color:#c69b3c!important
}
body.rpp-author-r5 #auth .rpp-author-guide b{color:#76520f!important;opacity:1!important}
body.rpp-author-r5 #auth input:not([type="checkbox"]){
  color:#17243a!important;-webkit-text-fill-color:#17243a!important;
  background:#fffdf8!important;border-color:#c9ad67!important;opacity:1!important
}
body.rpp-author-r5 #auth input::placeholder{
  color:#747a82!important;-webkit-text-fill-color:#747a82!important;opacity:1!important
}
body.rpp-author-r5 #auth .rpp-auth-tab,
body.rpp-author-r5 #auth #rppEditTab{
  color:#4a4338!important;-webkit-text-fill-color:#4a4338!important;opacity:1!important
}
body.rpp-author-r5 #auth .rpp-auth-tab.active,
body.rpp-author-r5 #auth #rppFirstTab.active{
  color:#1b160c!important;-webkit-text-fill-color:#1b160c!important;opacity:1!important
}
body.rpp-author-r5 #auth button:disabled{
  opacity:.62!important;color:#665e50!important;-webkit-text-fill-color:#665e50!important
}
body.rpp-author-r5 #auth #send,
body.rpp-author-r5 #auth #verify,
body.rpp-author-r5 #auth #rppEditLoginBtn{
  color:#1c160c!important;-webkit-text-fill-color:#1c160c!important
}
@media(max-width:560px){
  body.rpp-author-r5 .wrap{padding-top:8px!important}
  body.rpp-author-r5 #auth{margin-top:0!important}
}
</style>
<script>
(()=>{
  const apply=()=>{
    document.documentElement.dataset.rppAuthorClarity='r27-1';
    document.title='私の記録を綴る | ROAD TO PEACE PRIDE';
    const auth=document.getElementById('auth');
    const h1=auth?.querySelector('h1');
    if(h1&&h1.textContent!=='私の記録を綴る')h1.textContent='私の記録を綴る';
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
  addEventListener('pageshow',apply);
})();
</script>`;

function inject(response){
  const headers=new Headers(response.headers);headers.set('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');headers.delete('Content-Length');
  return new HTMLRewriter()
    .on('html',{element(el){el.setAttribute('data-rpp-reedit','r27');el.setAttribute('data-rpp-author-clarity','r27-1')}})
    .on('body',{element(el){el.append(REEDIT_NO_RELOAD,{html:true});el.append(AUTHOR_CLARITY,{html:true})}})
    .transform(new Response(response.body,{status:response.status,statusText:response.statusText,headers}));
}

export default{
  async fetch(request,env,ctx){
    const url=new URL(request.url),path=url.pathname.replace(/\/$/,'')||'/';
    const response=await app.fetch(request,env,ctx),type=response.headers.get('content-type')||'';
    if(type.includes('text/html')&&['/author','/author.html'].includes(path))return inject(response);
    return response;
  }
};
