import app from './faithful-cover-v11-r20.js';

const AUTHOR_ENTRY_FIX=`
<script>
(()=>{
  const ALLOW_ONCE='rpp_allow_auto_editor_once';
  let blockInitialStory=true;
  try{
    if(sessionStorage.getItem(ALLOW_ONCE)==='1'){
      blockInitialStory=false;
      sessionStorage.removeItem(ALLOW_ONCE);
    }
  }catch{}

  const nativeFetch=window.fetch.bind(window);
  window.fetch=async(input,init)=>{
    const u=typeof input==='string'?input:(input&&input.url)||'';
    const method=String(init?.method||'GET').toUpperCase();

    if(u.includes('/api/auth/verify')&&method==='POST'){
      const r=await nativeFetch(input,init);
      if(r.ok)blockInitialStory=false;
      return r;
    }

    if(blockInitialStory&&u.includes('/api/me/story')&&method==='GET'){
      blockInitialStory=false;
      return new Response(JSON.stringify({error:'ENTRY_SCREEN_FIRST'}),{
        status:401,
        headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}
      });
    }

    return nativeFetch(input,init);
  };

  const markEditLogin=()=>{
    const btn=document.getElementById('rppEditLoginBtn');
    if(!btn||btn.dataset.r21Entry==='1')return;
    btn.dataset.r21Entry='1';
    btn.addEventListener('click',()=>{try{sessionStorage.setItem(ALLOW_ONCE,'1')}catch{}},{capture:true});
  };

  const keepEntryVisible=()=>{
    const auth=document.getElementById('auth'),editor=document.getElementById('editor');
    if(!auth||!editor)return;
    if(editor.classList.contains('hidden'))auth.classList.remove('hidden');
  };

  const install=()=>{
    document.documentElement.dataset.rppAuthorEntry='r21';
    markEditLogin();
    keepEntryVisible();
    setTimeout(markEditLogin,150);
    setTimeout(markEditLogin,600);
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
</script>`;

function injectAuthor(response){
  const headers=new Headers(response.headers);
  headers.set('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');
  return new HTMLRewriter().on('body',{element(el){el.append(AUTHOR_ENTRY_FIX,{html:true})}})
    .transform(new Response(response.body,{status:response.status,statusText:response.statusText,headers}));
}

export default{
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx);
    const url=new URL(request.url),path=url.pathname.replace(/\/$/,'')||'/',type=response.headers.get('content-type')||'';
    if(type.includes('text/html')&&['/author','/author.html'].includes(path))return injectAuthor(response);
    return response;
  }
};
