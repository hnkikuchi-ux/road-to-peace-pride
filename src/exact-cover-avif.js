import app from './exact-cover.js';

const AVIF_OVERRIDE = `
<script>
(()=>{
  const card=document.querySelector('#gate .gate-card');
  if(!card)return;
  const activate=async()=>{
    try{
      const names=Array.from({length:9},(_,i)=>String(i+1).padStart(3,'0')+'.txt');
      const parts=await Promise.all(names.map(async n=>{
        const r=await fetch('/assets/top-master-avif/'+n,{cache:'force-cache'});
        if(!r.ok)throw new Error('AVIF cover asset '+n+' '+r.status);
        return (await r.text()).trim();
      }));
      // One transfer in chunk 008 lost a single known base64 character. Repair it deterministically.
      if(parts[7].length===19999){parts[7]=parts[7].slice(0,10036)+'G'+parts[7].slice(10036)}
      const b64=parts.join('');
      if(b64.length!==173940)throw new Error('AVIF cover length '+b64.length);
      const raw=atob(b64),bytes=new Uint8Array(raw.length);
      for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
      const url=URL.createObjectURL(new Blob([bytes],{type:'image/avif'}));
      const img=new Image();
      img.onload=()=>{
        card.style.setProperty('background-image','url("'+url+'")','important');
        card.dataset.master='approved-avif-941x1672';
        card.dataset.masterFormat='avif';
        card.dataset.masterPixels='941x1672';
        card.classList.add('rpp-master-ready','rpp-avif-master-ready');
      };
      img.onerror=()=>{URL.revokeObjectURL(url);console.error('approved AVIF cover decode failed')};
      img.src=url;
    }catch(e){console.error('approved AVIF cover load failed',e)}
  };
  // Let the existing resilient cover/fallback finish first, then replace only the visual master.
  if(card.classList.contains('rpp-master-ready'))activate();
  else{
    const obs=new MutationObserver(()=>{
      if(card.classList.contains('rpp-master-ready')){obs.disconnect();activate()}
    });
    obs.observe(card,{attributes:true,attributeFilter:['class']});
    setTimeout(()=>{obs.disconnect();activate()},3000);
  }
})();
</script>`;

function apply(response){
  return new HTMLRewriter().on('body',{element(el){el.append(AVIF_OVERRIDE,{html:true})}}).transform(response);
}

export default {
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx);
    const type=response.headers.get('content-type')||'';
    const path=new URL(request.url).pathname.replace(/\/$/,'')||'/';
    if(type.includes('text/html')&&(path==='/'||path==='/index.html'))return apply(response);
    return response;
  }
};
