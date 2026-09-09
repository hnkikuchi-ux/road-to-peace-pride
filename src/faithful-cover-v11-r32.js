import app from './faithful-cover-v11-r31.js';

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}})}
function jstDate(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
async function authorState(request,env,ctx){
  const u=new URL(request.url);u.pathname='/api/me/story';u.search='';
  const h=new Headers(request.headers);h.delete('content-length');h.delete('content-type');
  const r=await app.fetch(new Request(u.toString(),{method:'GET',headers:h}),env,ctx);
  if(!r.ok)return {response:r,data:null};
  try{return {response:r,data:await r.clone().json()}}catch{return {response:r,data:null}}
}
async function canonicalRecordDate(env,email,fallback=''){
  if(!email)return fallback;
  try{
    const row=await env.DB.prepare('SELECT record_date,status FROM rpp_stories WHERE author_email=?').bind(email).first();
    if(row?.status==='submitted'&&String(row?.record_date||'').trim())return String(row.record_date).trim();
  }catch(e){console.error('r32 record date lookup failed',e)}
  return fallback;
}
async function normalizeStoryWrite(request,env,ctx,targetPath){
  let body;try{body=await request.clone().json()}catch{return app.fetch(request,env,ctx)}
  const state=await authorState(request,env,ctx);if(!state.response.ok||!state.data?.email)return state.response;
  const email=state.data.email,currentStatus=String(state.data?.story?.status||'');
  if(body?.status==='submitted'){
    body.record_date=currentStatus==='submitted'
      ? await canonicalRecordDate(env,email,String(state.data?.story?.record_date||'').trim()||jstDate())
      : jstDate();
  }else if(!String(body?.record_date||'').trim()){
    // Drafts need a value for the legacy validator, but the first real submission
    // overwrites this with the actual submission date above.
    body.record_date=jstDate();
  }
  const u=new URL(request.url);u.pathname=targetPath;u.search='';
  const h=new Headers(request.headers);h.delete('content-length');h.set('Content-Type','application/json');h.set('Accept','application/json');
  return app.fetch(new Request(u.toString(),{method:targetPath==='/api/rpp/resubmit'?'POST':'PUT',headers:h,body:JSON.stringify(body)}),env,ctx);
}

const AUTHOR_DATE_UI=`<style id="rppRecordDateR32">
#formArea .field:has(#record_date){display:none!important}
</style><script>
(()=>{
  function hide(){const input=document.getElementById('record_date');const f=input?.closest?.('.field');if(f)f.style.display='none';document.documentElement.dataset.rppRecordDate='auto-first-submit-r32'}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hide,{once:true});else hide();
  addEventListener('pageshow',hide);document.addEventListener('rpp:reedit-opened',()=>setTimeout(hide,0));
})();
</script>`;
function injectAuthor(response){
  const headers=new Headers(response.headers);headers.set('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');headers.delete('Content-Length');
  return new HTMLRewriter().on('html',{element(el){el.setAttribute('data-rpp-record-date','auto-first-submit-r32')}}).on('body',{element(el){el.append(AUTHOR_DATE_UI,{html:true})}}).transform(new Response(response.body,{status:response.status,statusText:response.statusText,headers}));
}

export default{
  async fetch(request,env,ctx){
    const url=new URL(request.url),path=url.pathname.replace(/\/$/,'')||'/';
    if(path==='/api/rpp/resubmit'&&request.method==='POST')return normalizeStoryWrite(request,env,ctx,'/api/rpp/resubmit');
    if(path==='/api/me/story'&&request.method==='PUT')return normalizeStoryWrite(request,env,ctx,'/api/me/story');
    const response=await app.fetch(request,env,ctx),type=response.headers.get('content-type')||'';
    if(type.includes('text/html')&&['/author','/author.html'].includes(path))return injectAuthor(response);
    return response;
  }
};
