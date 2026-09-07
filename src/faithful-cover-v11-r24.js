import app from './faithful-cover-v11-r22.js';

const MOBILE_SAFARI_UI=`
<style>
html.rpp-ios body{min-height:100dvh}
html.rpp-ios .wrap{padding-bottom:calc(84px + env(safe-area-inset-bottom,0px))}
html.rpp-ios button,html.rpp-ios .btn,html.rpp-ios .pill,html.rpp-line button,html.rpp-line .btn,html.rpp-line .pill{-webkit-appearance:none;appearance:none;touch-action:manipulation;-webkit-tap-highlight-color:rgba(216,184,102,.18)}
html.rpp-ios input,html.rpp-ios textarea,html.rpp-ios select,html.rpp-line input,html.rpp-line textarea,html.rpp-line select{font-size:16px!important;-webkit-appearance:none;appearance:none}
html.rpp-ios textarea,html.rpp-line textarea{-webkit-overflow-scrolling:touch}
#rppSubmittedNotice{display:none;margin:0 0 16px;padding:15px 16px;border:1px solid rgba(216,184,102,.46);border-left:4px solid #d8b866;background:linear-gradient(90deg,rgba(216,184,102,.12),rgba(216,184,102,.045));color:#eee4c9;font-size:12px;line-height:1.8}
#rppSubmittedNotice.rpp-show{display:block}
#rppSubmittedNotice b{display:block;margin-bottom:3px;color:#efd98d;font-size:14px;letter-spacing:.03em}
#rppSubmittedNotice .rpp-submitted-help{color:#cbd0da}
body.rpp-author-r5 #statusBadge.rpp-submitted-badge{color:#f4dc97;border-color:rgba(239,217,141,.62);background:rgba(216,184,102,.10)}
@media(max-width:560px){#rppSubmittedNotice{margin:0 0 14px;padding:13px 14px;font-size:11px}#rppSubmittedNotice b{font-size:13px}.btn,.pill,button{min-height:46px}}
</style>
<script>
(()=>{
  const ua=navigator.userAgent||'';
  const ios=/iP(hone|ad|od)/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const line=/Line\//i.test(ua)||/LIFF/i.test(ua);
  if(ios)document.documentElement.classList.add('rpp-ios');
  if(line)document.documentElement.classList.add('rpp-line');
  document.documentElement.dataset.rppMobileCompat='r24';
  document.documentElement.dataset.rppClient=line?'line':(ios?'ios':'web');

  let statusObserver=null;
  function submitted(){
    const badge=document.getElementById('statusBadge');
    return !!badge&&String(badge.textContent||'').trim().includes('提出済');
  }
  function sync(){
    const badge=document.getElementById('statusBadge');
    const notice=document.getElementById('rppSubmittedNotice');
    if(!badge||!notice)return;
    const isSubmitted=submitted();
    notice.classList.toggle('rpp-show',isSubmitted);
    badge.classList.toggle('rpp-submitted-badge',isSubmitted);
    if(isSubmitted&&badge.textContent.trim()!=='提出済')badge.textContent='提出済';
    const submit=document.getElementById('submit');
    const label=isSubmitted?'変更内容を再提出する':'この内容で提出する';
    if(submit&&submit.textContent!==label)submit.textContent=label;
    document.documentElement.dataset.rppStoryMode=isSubmitted?'submitted-edit':'draft';
  }
  function mount(){
    document.querySelectorAll('button').forEach(b=>{if(!b.getAttribute('type'))b.setAttribute('type','button')});
    const editor=document.getElementById('editor');
    const panel=editor?.querySelector('.panel');
    const row=panel?.querySelector('.save-row');
    if(!panel||!row)return;
    let notice=document.getElementById('rppSubmittedNotice');
    if(!notice){
      notice=document.createElement('div');
      notice.id='rppSubmittedNotice';
      notice.dataset.r24='submitted-editing-notice';
      notice.innerHTML='<b>提出済みの原稿です。内容を変更して再提出できます。</b><span class="rpp-submitted-help">修正後、「変更内容を再提出する」を押すと、原稿が更新されます。</span>';
      row.insertAdjacentElement('afterend',notice);
    }
    const badge=document.getElementById('statusBadge');
    if(badge&&!statusObserver){
      statusObserver=new MutationObserver(()=>sync());
      statusObserver.observe(badge,{childList:true,characterData:true,subtree:true});
    }
    sync();
  }
  function refresh(){mount();requestAnimationFrame(sync);setTimeout(sync,250);setTimeout(sync,900)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh,{once:true});else refresh();
  addEventListener('pageshow',refresh);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
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
    if(type.includes('text/html')&&['/author','/author.html'].includes(path))return inject(response,MOBILE_SAFARI_UI);
    return response;
  }
};
