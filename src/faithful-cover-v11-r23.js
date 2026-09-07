import app from './faithful-cover-v11-r22.js';

const AUTHOR_SUBMITTED_UI=`
<style>
#rppSubmittedNotice{display:none;margin:0 0 16px;padding:15px 16px;border:1px solid rgba(216,184,102,.46);border-left:4px solid #d8b866;background:linear-gradient(90deg,rgba(216,184,102,.12),rgba(216,184,102,.045));color:#eee4c9;font-size:12px;line-height:1.8}
#rppSubmittedNotice.rpp-show{display:block}
#rppSubmittedNotice b{display:block;margin-bottom:3px;color:#efd98d;font-size:14px;letter-spacing:.03em}
#rppSubmittedNotice .rpp-submitted-help{color:#cbd0da}
body.rpp-author-r5 #statusBadge.rpp-submitted-badge{color:#f4dc97;border-color:rgba(239,217,141,.62);background:rgba(216,184,102,.10)}
@media(max-width:560px){#rppSubmittedNotice{margin:0 0 14px;padding:13px 14px;font-size:11px}#rppSubmittedNotice b{font-size:13px}}
</style>
<script>
(()=>{
  const SUBMITTED='提出済';
  function mount(){
    const editor=document.getElementById('editor');
    const panel=editor?.querySelector('.panel');
    const row=panel?.querySelector('.save-row');
    if(!panel||!row)return;
    let notice=document.getElementById('rppSubmittedNotice');
    if(!notice){
      notice=document.createElement('div');
      notice.id='rppSubmittedNotice';
      notice.dataset.r23='submitted-editing-notice';
      notice.innerHTML='<b>提出済みの原稿です。内容を変更して再提出できます。</b><span class="rpp-submitted-help">修正後、「変更内容を再提出する」を押すと、原稿が更新されます。</span>';
      row.insertAdjacentElement('afterend',notice);
    }
    sync();
  }
  function sync(){
    const badge=document.getElementById('statusBadge');
    const notice=document.getElementById('rppSubmittedNotice');
    if(!badge||!notice)return;
    const submitted=String(badge.textContent||'').trim().includes(SUBMITTED);
    notice.classList.toggle('rpp-show',submitted);
    badge.classList.toggle('rpp-submitted-badge',submitted);
    if(submitted&&badge.textContent.trim()!==SUBMITTED)badge.textContent=SUBMITTED;
    const submit=document.getElementById('submit');
    if(submit)submit.textContent=submitted?'変更内容を再提出する':'この内容で提出する';
    document.documentElement.dataset.rppStoryMode=submitted?'submitted-edit':'draft';
  }
  const run=()=>{mount();sync();setTimeout(mount,120);setTimeout(sync,400);setTimeout(sync,1000)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  new MutationObserver(()=>{mount();sync()}).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
})();
</script>`;

async function inject(response,html){
  const headers=new Headers(response.headers);
  headers.set('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');
  headers.delete('Content-Length');
  const body=await response.text();
  const next=body.includes('</body>')?body.replace('</body>',html+'</body>'):body+html;
  return new Response(next,{status:response.status,statusText:response.statusText,headers});
}

export default{
  async fetch(request,env,ctx){
    const url=new URL(request.url),path=url.pathname.replace(/\/$/,'')||'/';
    const response=await app.fetch(request,env,ctx),type=response.headers.get('content-type')||'';
    if(type.includes('text/html')&&['/author','/author.html'].includes(path))return inject(response,AUTHOR_SUBMITTED_UI);
    return response;
  }
};
