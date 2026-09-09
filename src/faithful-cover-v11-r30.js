import app from './faithful-cover-v11-r29.js';

const AUTHOR_POLISH=`<style id="rppAuthorPolishR30">
body.rpp-author-r5 #editor .field>label,
body.rpp-author-r5 #editor label{color:#d9c98f!important;opacity:1!important}
body.rpp-author-r5 #editor .field>label{font-weight:600!important}
body.rpp-author-r5 #editor #submit{touch-action:manipulation}
body.rpp-author-r5 #editor #submit.rpp-submit-busy{opacity:.72!important;cursor:wait!important}
</style>
<script>
(()=>{
  const submitted=()=>String(document.getElementById('statusBadge')?.textContent||'').includes('提出済');
  const successVisible=()=>document.getElementById('rppSubmitSuccessR28')?.classList.contains('rpp-show');
  const el=id=>document.getElementById(id);
  let lastSubmitGesture=0;
  function syncButtons(){
    const isSubmitted=submitted();
    const submit=el('submit');
    const save=el('save');
    if(submit&&!submit.dataset.r30Busy){const t=isSubmitted?'変更内容を再提出する':'この内容で提出する';if(submit.textContent!==t)submit.textContent=t}
    if(save){const t=isSubmitted?'変更内容を保存':'下書き保存';if(save.textContent!==t)save.textContent=t}
    document.documentElement.dataset.rppAuthorPolish='r30';
    document.documentElement.dataset.rppSubmitReliable='r30b';
  }
  function clearRedundantStatus(){
    const m=el('savemsg');if(!m)return;
    const t=String(m.textContent||'').trim();
    if(/^(提出しました|変更内容を再提出しました)[。！]?/.test(t)&&!successVisible())m.textContent='';
    if(successVisible()&&/^(提出しました|変更内容を再提出しました)[。！]?/.test(t))m.textContent='';
  }
  function sync(){syncButtons();clearRedundantStatus()}
  function watch(){
    const badge=el('statusBadge');
    if(badge&&!badge.dataset.r30Watch){badge.dataset.r30Watch='1';new MutationObserver(sync).observe(badge,{childList:true,characterData:true,subtree:true})}
    const submit=el('submit');
    if(submit&&!submit.dataset.r30Watch){submit.dataset.r30Watch='1';new MutationObserver(syncButtons).observe(submit,{childList:true,characterData:true,subtree:true})}
  }
  function payload(){
    let d={};
    try{if(typeof data==='function')d=data('submitted')||{}}catch{}
    const val=id=>String(el(id)?.value||'').trim();
    if(!d.name)d.name=val('name');if(!d.title)d.title=el('title')?.value||'';if(!d.body)d.body=el('body')?.value||'';if(!d.record_date)d.record_date=val('record_date');
    const soku=val('rppOrgSelect')||val('org')||String(d.soku||d.org||'').trim();
    d.soku=soku;d.org=soku;
    d.bunku=val('rppOrgDetail')||val('rppBunku')||String(d.bunku||'').trim();
    d.honbu=val('rppHonbu')||String(d.honbu||'').trim();d.shibu=val('rppShibu')||String(d.shibu||'').trim();
    d.category=String(d.category||'');d.status='submitted';return d;
  }
  function message(text,kind=''){
    const m=el('savemsg');if(!m)return;m.textContent=text;m.className='note '+kind;
  }
  function showSubmitSuccess(isEdit){
    let b=el('rppSubmitSuccessR28');
    if(!b){b=document.createElement('div');b.id='rppSubmitSuccessR28';b.style.cssText='margin:18px 0;padding:18px 16px;border:2px solid #d8b866;background:rgba(216,184,102,.10);color:#f2dc98;text-align:center;line-height:1.8';el('submit')?.insertAdjacentElement('afterend',b)}
    b.innerHTML='<b style="display:block;font-size:20px;margin-bottom:6px">✓ '+(isEdit?'変更内容を再提出しました！':'提出が完了しました！')+'</b><span>原稿は正常に保存されています。締切までは再編集できます。</span>';
    b.classList.add('rpp-show');
    b.setAttribute('role','status');b.setAttribute('aria-live','polite');
    b.scrollIntoView?.({block:'center',behavior:'smooth'});
    message('','ok');
  }
  async function directSubmit(btn){
    if(!btn||btn.dataset.r30Busy==='1')return;
    const d=payload(),isEdit=submitted();
    if(!String(d.name||'').trim()||!String(d.title||'').trim()||!String(d.body||'').trim()){message('氏名・題名・本文を入力してください。','warn');return}
    if([...String(d.title||'')].length>40){message('題名は40字以内にしてください。','warn');return}
    btn.dataset.r30Busy='1';btn.disabled=true;btn.classList.add('rpp-submit-busy');btn.textContent=isEdit?'再提出中…':'提出中…';
    message(isEdit?'変更内容を再提出しています…':'原稿を提出しています…');
    const state=el('saveState');if(state)state.textContent='Cloudflareへ保存中…';
    try{
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      const r=await fetch('/api/rpp/resubmit',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},credentials:'same-origin',cache:'no-store',body:JSON.stringify(d)});
      const type=String(r.headers.get('content-type')||'');let out={};
      if(type.includes('application/json')){try{out=await r.json()}catch{}}
      else{try{await r.text()}catch{}}
      if(!r.ok)throw new Error(out.error||'提出できませんでした。もう一度お試しください。');
      try{if(out.story&&typeof fill==='function')fill(out.story)}catch{}
      try{if(typeof applyConfig==='function')applyConfig(out)}catch{}
      try{if(typeof saveLocal==='function')saveLocal('submitted')}catch{}
      const badge=el('statusBadge');if(badge)badge.textContent='提出済';if(state)state.textContent='端末＋Cloudflareに保存済';
      el('storyPreview')?.classList.add('hidden');showSubmitSuccess(isEdit);document.dispatchEvent(new Event('rpp:resubmit-success'));
    }catch(e){
      if(state)state.textContent='クラウド保存エラー';message(e?.message||'提出できませんでした。通信状況を確認して、もう一度お試しください。','warn');
    }finally{
      btn.dataset.r30Busy='';btn.disabled=false;btn.classList.remove('rpp-submit-busy');syncButtons();
    }
  }
  function submitGesture(e,btn){
    const now=Date.now();
    if(now-lastSubmitGesture<450){e?.preventDefault?.();return}
    lastSubmitGesture=now;e?.preventDefault?.();e?.stopPropagation?.();directSubmit(btn);
  }
  function replaceAndBind(id){
    const old=el(id);if(!old)return null;
    if(old.dataset.r30Direct==='1')return old;
    const btn=old.cloneNode(true);btn.type='button';btn.disabled=false;btn.removeAttribute('aria-disabled');btn.classList.remove('muted');btn.dataset.r30Direct='1';
    old.replaceWith(btn);
    btn.addEventListener('pointerup',e=>submitGesture(e,btn),{passive:false});
    btn.addEventListener('click',e=>submitGesture(e,btn),false);
    return btn;
  }
  function bindSubmitButtons(){replaceAndBind('submit');replaceAndBind('submitPreview');watch();syncButtons()}
  async function restoreInteractivity(){
    try{
      const r=await fetch('/api/config',{credentials:'same-origin',cache:'no-store'});if(!r.ok)return;
      const d=await r.clone().json();
      if(!d.deadlinePassed){
        el('formArea')?.classList.remove('muted');
        for(const id of ['submit','save','previewBtn']){const b=el(id);if(b){b.disabled=false;b.removeAttribute('aria-disabled')}}
      }
    }catch{}
  }
  const nativeFetch=window.fetch.bind(window);
  window.fetch=async(input,init)=>{
    const response=await nativeFetch(input,init);const url=typeof input==='string'?input:(input?.url||'');
    if(url.includes('/api/me/story')){setTimeout(sync,0);setTimeout(sync,80);setTimeout(sync,220)}
    return response;
  };
  document.addEventListener('click',e=>{
    if(e.target?.closest?.('#save,#previewBtn')){setTimeout(sync,0);setTimeout(sync,180);setTimeout(sync,700)}
  },true);
  document.addEventListener('input',e=>{if(e.target?.closest?.('#formArea'))clearRedundantStatus()},true);
  document.addEventListener('rpp:reedit-opened',()=>{setTimeout(()=>{bindSubmitButtons();restoreInteractivity();sync()},0);setTimeout(sync,120)});
  const run=()=>{bindSubmitButtons();restoreInteractivity();watch();sync();setTimeout(()=>{bindSubmitButtons();watch();sync()},120);setTimeout(()=>{bindSubmitButtons();restoreInteractivity();watch();sync()},500);setTimeout(()=>{bindSubmitButtons();restoreInteractivity();watch();sync()},1400)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  addEventListener('pageshow',run);document.addEventListener('visibilitychange',()=>{if(!document.hidden)run()});
})();
</script>`;

function inject(response){
  const headers=new Headers(response.headers);headers.set('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');headers.delete('Content-Length');
  return new HTMLRewriter()
    .on('html',{element(el){el.setAttribute('data-rpp-author-polish','r30');el.setAttribute('data-rpp-submit-reliable','r30b')}})
    .on('body',{element(el){el.append(AUTHOR_POLISH,{html:true})}})
    .transform(new Response(response.body,{status:response.status,statusText:response.statusText,headers}));
}

async function directResubmit(request,env,ctx){
  let body;try{body=await request.clone().json()}catch{return new Response(JSON.stringify({error:'入力内容を確認してください。'}),{status:400,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}})}
  body={...(body||{}),status:'submitted'};
  const u=new URL(request.url);u.pathname='/api/me/story';u.search='';
  const headers=new Headers(request.headers);headers.delete('content-length');headers.set('Content-Type','application/json');headers.set('Accept','application/json');headers.set('X-RPP-Story-Intent','submit');
  return app.fetch(new Request(u.toString(),{method:'PUT',headers,body:JSON.stringify(body)}),env,ctx);
}

export default{
  async fetch(request,env,ctx){
    const url=new URL(request.url),path=url.pathname.replace(/\/$/,'')||'/';
    if(path==='/api/rpp/resubmit'&&request.method==='POST')return directResubmit(request,env,ctx);
    const response=await app.fetch(request,env,ctx),type=response.headers.get('content-type')||'';
    if(type.includes('text/html')&&['/author','/author.html'].includes(path))return inject(response);
    return response;
  }
};