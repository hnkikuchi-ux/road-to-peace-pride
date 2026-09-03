import app from './cache-refresh.js';

const VIEWER_LOGOUT = `
<style>
.rpp-viewer-logout{display:none;align-items:center;justify-content:center;min-height:38px;padding:8px 14px;border:1px solid rgba(216,184,102,.48);border-radius:999px;background:linear-gradient(180deg,rgba(8,28,58,.92),rgba(3,14,34,.96));color:#ead49a;font:600 12px/1 ui-sans-serif,system-ui,-apple-system,"Noto Sans JP",sans-serif;letter-spacing:.05em;box-shadow:inset 0 1px 0 rgba(255,255,255,.04),0 6px 18px rgba(0,0,0,.22);cursor:pointer;transition:border-color .2s ease,background .2s ease,transform .16s ease,box-shadow .2s ease}
.rpp-viewer-logout:hover,.rpp-viewer-logout:focus-visible{border-color:#efd27a;background:linear-gradient(180deg,rgba(12,38,75,.98),rgba(4,18,42,.98));box-shadow:0 8px 22px rgba(0,0,0,.28),0 0 18px rgba(225,179,66,.10);outline:none}
.rpp-viewer-logout:active{transform:translateY(1px) scale(.99)}
.rpp-viewer-logout[disabled]{opacity:.58;cursor:wait}
#cover:not(.hidden) .rpp-viewer-logout,#toc:not(.hidden) .rpp-viewer-logout,#reader:not(.hidden) .rpp-viewer-logout{display:inline-flex}
#cover .rpp-viewer-logout{margin-top:2px}
#toc .top-actions .rpp-viewer-logout{margin-left:auto}
#reader .reader-tools .rpp-viewer-logout{min-height:34px;padding:7px 11px;font-size:11px}
@media(max-width:520px){#reader .reader-tools .rpp-viewer-logout{padding:7px 9px;font-size:10px;letter-spacing:.02em}}
</style>
<script>
(()=>{
  const logout=async(button)=>{
    if(button?.disabled)return;
    document.querySelectorAll('.rpp-viewer-logout').forEach(b=>{b.disabled=true;b.textContent='ログアウト中…'});
    try{await fetch('/api/viewer/logout',{method:'POST',credentials:'same-origin',cache:'no-store'})}catch{}
    location.replace('/refresh?logout='+Date.now());
  };
  const make=()=>{const b=document.createElement('button');b.type='button';b.className='rpp-viewer-logout';b.textContent='ログアウト';b.setAttribute('aria-label','閲覧をログアウトしてトップへ戻る');b.addEventListener('click',()=>logout(b));return b};
  const enhance=()=>{
    const coverActions=document.querySelector('#cover .actions');
    if(coverActions&&!coverActions.querySelector('.rpp-viewer-logout'))coverActions.appendChild(make());
    const tocTop=document.querySelector('#toc .top-actions');
    if(tocTop&&!tocTop.querySelector('.rpp-viewer-logout'))tocTop.appendChild(make());
    const readerTools=document.querySelector('#reader .reader-tools');
    if(readerTools&&!readerTools.querySelector('.rpp-viewer-logout'))readerTools.appendChild(make());
  };
  enhance();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance,{once:true});
  setTimeout(enhance,80);
})();
</script>`;

function apply(response){
  return new HTMLRewriter().on('body',{element(el){el.append(VIEWER_LOGOUT,{html:true})}}).transform(response);
}

export default {
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx);
    const url=new URL(request.url);
    const type=response.headers.get('content-type')||'';
    const viewerPage=['/','/index.html','/refresh','/latest'].includes(url.pathname);
    if(viewerPage&&type.includes('text/html'))return apply(response);
    return response;
  }
};
