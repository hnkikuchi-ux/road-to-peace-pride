import app from './faithful-cover-v11-r29.js';

const AUTHOR_POLISH=`<style id="rppAuthorPolishR30">
body.rpp-author-r5 #editor .field>label,
body.rpp-author-r5 #editor label{color:#d9c98f!important;opacity:1!important}
body.rpp-author-r5 #editor .field>label{font-weight:600!important}
body.rpp-author-r5 #editor #submit{touch-action:manipulation}
</style>
<script>
(()=>{
  const submitted=()=>String(document.getElementById('statusBadge')?.textContent||'').includes('提出済');
  const successVisible=()=>document.getElementById('rppSubmitSuccessR28')?.classList.contains('rpp-show');
  function syncButtons(){
    const isSubmitted=submitted();
    const submit=document.getElementById('submit');
    const save=document.getElementById('save');
    if(submit){const t=isSubmitted?'変更内容を再提出する':'この内容で提出する';if(submit.textContent!==t)submit.textContent=t}
    if(save){const t=isSubmitted?'変更内容を保存':'下書き保存';if(save.textContent!==t)save.textContent=t}
    document.documentElement.dataset.rppAuthorPolish='r30';
  }
  function clearRedundantStatus(){
    const m=document.getElementById('savemsg');if(!m)return;
    const t=String(m.textContent||'').trim();
    if(/^(提出しました|変更内容を再提出しました)[。！]?/.test(t)&&!successVisible())m.textContent='';
    if(successVisible()&&/^(提出しました|変更内容を再提出しました)[。！]?/.test(t))m.textContent='';
  }
  function sync(){syncButtons();clearRedundantStatus()}
  function watch(){
    const badge=document.getElementById('statusBadge');
    if(badge&&!badge.dataset.r30Watch){badge.dataset.r30Watch='1';new MutationObserver(sync).observe(badge,{childList:true,characterData:true,subtree:true})}
    const submit=document.getElementById('submit');
    if(submit&&!submit.dataset.r30Watch){submit.dataset.r30Watch='1';new MutationObserver(syncButtons).observe(submit,{childList:true,characterData:true,subtree:true})}
  }
  const nativeFetch=window.fetch.bind(window);
  window.fetch=async(input,init)=>{
    const response=await nativeFetch(input,init);const url=typeof input==='string'?input:(input?.url||'');
    if(url.includes('/api/me/story')){setTimeout(sync,0);setTimeout(sync,80);setTimeout(sync,220)}
    return response;
  };
  document.addEventListener('click',e=>{
    if(e.target?.closest?.('#save,#submit,#submitPreview')){setTimeout(sync,0);setTimeout(sync,180);setTimeout(sync,700)}
  },true);
  document.addEventListener('input',e=>{if(e.target?.closest?.('#formArea'))clearRedundantStatus()},true);
  document.addEventListener('rpp:reedit-opened',()=>{setTimeout(sync,0);setTimeout(sync,120)});
  const run=()=>{watch();sync();setTimeout(()=>{watch();sync()},120);setTimeout(()=>{watch();sync()},500);setTimeout(()=>{watch();sync()},1400)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  addEventListener('pageshow',run);document.addEventListener('visibilitychange',()=>{if(!document.hidden)run()});
})();
</script>`;

function inject(response){
  const headers=new Headers(response.headers);headers.set('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');headers.delete('Content-Length');
  return new HTMLRewriter()
    .on('html',{element(el){el.setAttribute('data-rpp-author-polish','r30')}})
    .on('body',{element(el){el.append(AUTHOR_POLISH,{html:true})}})
    .transform(new Response(response.body,{status:response.status,statusText:response.statusText,headers}));
}

export default{
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx),url=new URL(request.url),type=response.headers.get('content-type')||'';
    const path=url.pathname.replace(/\/$/,'')||'/';
    if(type.includes('text/html')&&['/author','/author.html'].includes(path))return inject(response);
    return response;
  }
};