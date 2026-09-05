import app from './faithful-cover-v11-r14.js';

const R15=`
<style>
/* r15 — independent author organization-detail patch */
.r15-legacy-org{display:none!important}
.rpp-org-detail-field{margin-top:10px!important}
.rpp-org-detail-field input{min-height:48px}
</style>
<script>
(()=>{
  function legacy(){
    return ['rppBunku','rppHonbu','rppShibu'].map(id=>document.getElementById(id));
  }
  function sync(){
    const detail=document.getElementById('rppOrgDetail');if(!detail)return;
    const [b,h,s]=legacy();
    if(b){b.value=detail.value;b.dispatchEvent(new Event('input',{bubbles:true}))}
    if(h)h.value='';
    if(s)s.value='';
  }
  function patch(){
    const select=document.getElementById('rppOrgSelect');
    if(!select)return false;
    const host=select.closest('.field');
    if(!host)return false;
    let detail=document.getElementById('rppOrgDetail');
    if(!detail){
      const box=document.createElement('div');
      box.className='field rpp-org-detail-field';
      box.innerHTML='<label>分区／本部／部</label><input id="rppOrgDetail" maxlength="240" placeholder="分区／本部／部を入力">';
      const grid=host.querySelector('.r12-org-grid');
      if(grid)grid.insertAdjacentElement('afterend',box);else host.appendChild(box);
      detail=box.querySelector('#rppOrgDetail');
      detail.addEventListener('input',sync);
    }
    const [b,h,s]=legacy();
    [b,h,s].filter(Boolean).forEach(el=>{const f=el.closest('.field');if(f)f.classList.add('r15-legacy-org')});
    if(!detail.value){
      const vals=[b&&b.value,h&&h.value,s&&s.value].filter(v=>String(v||'').trim());
      if(vals.length)detail.value=vals.join('／');
    }
    if(detail.value)sync();
    return true;
  }
  function boot(){
    patch();
    let ticks=0;
    const timer=setInterval(()=>{patch();ticks++;if(ticks>=80)clearInterval(timer)},125);
    const editor=document.getElementById('editor');
    if(editor)new MutationObserver(()=>patch()).observe(editor,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
    document.addEventListener('click',e=>{
      const btn=e.target&&e.target.closest?e.target.closest('button'):null;
      if(btn&&['save','previewBtn','submit','submitPreview'].includes(btn.id))sync();
    },true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
</script>`;

function inject(response){return new HTMLRewriter().on('body',{element(el){el.append(R15,{html:true})}}).transform(response)}

export default{
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx),url=new URL(request.url),type=response.headers.get('content-type')||'';
    const path=url.pathname.replace(/\/$/,'');
    if(type.includes('text/html')&&['/author','/author.html'].includes(path))return inject(response);
    return response;
  }
};
