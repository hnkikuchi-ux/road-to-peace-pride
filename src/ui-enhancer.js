import secureWorker from './secure-worker.js';

const AUTHOR_ENHANCEMENT = `
<style>
#rppRecovery{margin:12px 0;padding:14px;border:1px solid rgba(239,217,141,.45);background:rgba(239,217,141,.08);border-radius:10px}
#rppRecovery strong{display:block;color:#efd98d;margin-bottom:5px}
#rppRecovery .rpp-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
#rppRecovery button{border:1px solid rgba(216,184,102,.45);border-radius:999px;background:rgba(255,255,255,.06);color:#fff;padding:9px 13px;cursor:pointer}
#photoOptionalNote{margin-top:8px;padding:9px 11px;border-left:3px solid #d8b866;background:rgba(216,184,102,.07)}
</style>
<script>
(()=>{
  const $=s=>document.querySelector(s);
  const fields=['record_date','soku','bunku','honbu','shibu','category','name','title','body'];
  const norm=v=>String(v??'');
  const storySignature=s=>fields.map(k=>norm(s?.[k])).join('\\u241f');
  const setFields=s=>{if(!s)return;for(const id of fields){const el=$('#'+id);if(el&&s[id]!=null)el.value=s[id]}if(typeof window.counts==='function')window.counts()};
  const setMessage=(text,cls='ok')=>{const e=$('#savemsg');if(e){e.textContent=text;e.className='note '+cls}};

  function markPhotoOptional(hasPhoto=false){
    const input=$('#photo');if(!input)return;
    const field=input.closest('.field');if(!field)return;
    const label=field.querySelector('label');if(label)label.textContent='写真（任意・1枚まで）';
    let note=$('#photoOptionalNote');
    if(!note){note=document.createElement('div');note.id='photoOptionalNote';note.className='note';input.insertAdjacentElement('afterend',note)}
    note.textContent=hasPhoto?'現在、写真が1枚登録されています。写真は任意です。変更したい場合だけ新しい写真を選んでください。':'写真は任意です。写真なしでもそのまま提出できます。';
  }

  function protectSubmittedSave(){
    const btn=$('#save'),badge=$('#statusBadge');if(!btn||!badge)return;
    const refresh=()=>{btn.textContent=badge.textContent.trim()==='提出済'?'変更内容を保存（提出済みのまま）':'下書き保存'};
    btn.onclick=()=>{
      const status=badge.textContent.trim()==='提出済'?'submitted':'draft';
      if(typeof window.saveServer==='function')return window.saveServer(status);
    };
    refresh();new MutationObserver(refresh).observe(badge,{childList:true,subtree:true,characterData:true});
  }

  function showRecovery(local,server,email){
    if($('#rppRecovery'))return;
    const anchor=$('#deadlineEditor')||$('#formArea');if(!anchor)return;
    const box=document.createElement('div');box.id='rppRecovery';
    box.innerHTML='<strong>この端末に、クラウドより新しい下書きがあります。</strong><div class="note">端末側とクラウド側を自動で上書きせず、どちらを使うか選べます。</div><div class="rpp-actions"><button type="button" id="restoreLocal">端末の下書きを復元</button><button type="button" id="keepCloud">クラウド版を使う</button></div>';
    anchor.insertAdjacentElement('afterend',box);
    $('#restoreLocal').onclick=()=>{
      const merged={...local,status:server?.status==='submitted'?'submitted':(local.status||'draft')};
      setFields(merged);if($('#statusBadge'))$('#statusBadge').textContent=merged.status==='submitted'?'提出済':'下書き';
      try{localStorage.setItem('rpp_draft_'+email,JSON.stringify({...merged,saved_at:new Date().toISOString()}))}catch{}
      setMessage(server?.status==='submitted'?'端末の新しい内容を復元しました。提出済み状態は維持しています。':'端末の新しい下書きを復元しました。','ok');
      box.remove();
    };
    $('#keepCloud').onclick=()=>{
      setFields(server);if($('#statusBadge'))$('#statusBadge').textContent=server?.status==='submitted'?'提出済':'下書き';
      try{localStorage.setItem('rpp_draft_'+email,JSON.stringify({...server,saved_at:server?.updated_at||new Date().toISOString()}))}catch{}
      setMessage('クラウド版を使用します。端末下書きはクラウド版に合わせました。','ok');box.remove();
    };
  }

  async function inspectAuthorState(){
    for(let i=0;i<30;i++){
      if(!$('#editor')?.classList.contains('hidden'))break;
      await new Promise(r=>setTimeout(r,250));
    }
    if($('#editor')?.classList.contains('hidden'))return;
    protectSubmittedSave();
    try{
      const r=await fetch('/api/me/story',{credentials:'same-origin',cache:'no-store'});if(!r.ok){markPhotoOptional(false);return}
      const d=await r.json(),server=d.story||null,email=String(d.email||'').toLowerCase();
      markPhotoOptional(Boolean(server?.photo_key));
      if(!email||!server)return;
      let local=null;try{local=JSON.parse(localStorage.getItem('rpp_draft_'+email)||'null')}catch{}
      if(!local?.saved_at||!server.updated_at)return;
      const localTs=Date.parse(local.saved_at),serverTs=Date.parse(server.updated_at);
      if(Number.isFinite(localTs)&&Number.isFinite(serverTs)&&localTs>serverTs+1500&&storySignature(local)!==storySignature(server))showRecovery(local,server,email);
    }catch{markPhotoOptional(false)}
  }

  markPhotoOptional(false);
  inspectAuthorState();
  const editor=$('#editor');if(editor)new MutationObserver(()=>{if(!editor.classList.contains('hidden'))inspectAuthorState()}).observe(editor,{attributes:true,attributeFilter:['class']});
})();
</script>`;

const INDEX_ENHANCEMENT = `
<style>
.toc-search{margin:14px 0 18px;position:sticky;top:58px;z-index:15;padding:8px 0;background:linear-gradient(180deg,rgba(6,18,38,.98),rgba(6,18,38,.88),rgba(6,18,38,0))}
.toc-search input{width:100%;border:1px solid rgba(216,184,102,.4);background:rgba(255,255,255,.06);color:#fff;border-radius:999px;padding:12px 16px;font:14px ui-sans-serif,system-ui;outline:none}
.toc-search input:focus{border-color:#f0d98c;box-shadow:0 0 0 3px rgba(216,184,102,.1)}
.toc-search-meta{margin:7px 5px 0;font:11px ui-sans-serif,system-ui;color:#aeb5c5}
</style>
<script>
(()=>{
  const list=document.querySelector('#tocList');if(!list)return;
  const wrap=document.createElement('div');wrap.className='toc-search';wrap.innerHTML='<input id="tocSearch" type="search" inputmode="search" autocomplete="off" placeholder="題名・氏名で検索"><div id="tocSearchMeta" class="toc-search-meta"></div>';
  list.insertAdjacentElement('beforebegin',wrap);
  const input=wrap.querySelector('#tocSearch'),meta=wrap.querySelector('#tocSearchMeta');
  const normalize=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/\\s+/g,'');
  function apply(){const q=normalize(input.value);const items=[...list.querySelectorAll('.toc-item')];let shown=0;for(const item of items){const ok=!q||normalize(item.textContent).includes(q);item.hidden=!ok;if(ok)shown++}meta.textContent=q?shown+'件見つかりました':'全 '+items.length+' 件'}
  input.addEventListener('input',apply);new MutationObserver(apply).observe(list,{childList:true,subtree:true});apply();
})();
</script>`;

function appendHtml(response,html){
  return new HTMLRewriter().on('body',{element(el){el.append(html,{html:true})}}).transform(response);
}

export default {
  async fetch(request,env,ctx){
    const response=await secureWorker.fetch(request,env,ctx);
    const path=new URL(request.url).pathname.replace(/\/$/,'')||'/';
    const type=response.headers.get('content-type')||'';
    if(!type.includes('text/html'))return response;
    if(path==='/'||path==='/index.html')return appendHtml(response,INDEX_ENHANCEMENT);
    if(path==='/author'||path==='/author.html')return appendHtml(response,AUTHOR_ENHANCEMENT);
    return response;
  }
};
