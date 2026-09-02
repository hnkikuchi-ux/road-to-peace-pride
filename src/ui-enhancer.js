import secureWorker from './secure-worker.js';

const AUTHOR_ENHANCEMENT = `
<style>
:root{--rpp-navy:#07162f;--rpp-navy2:#0d2145;--rpp-gold:#c89b43;--rpp-gold2:#efd38a;--rpp-paper:#f7f0df;--rpp-ink:#172544}
body{background:#051226!important;color:#fff}
body:before{background:radial-gradient(circle at 50% 12%,rgba(242,205,112,.26),transparent 11%),radial-gradient(circle at 14% 22%,rgba(255,255,255,.13) 0 1px,transparent 1.5px),radial-gradient(circle at 76% 18%,rgba(255,255,255,.1) 0 1px,transparent 1.5px),radial-gradient(circle at 35% 42%,rgba(255,221,144,.12) 0 1px,transparent 1.5px),linear-gradient(180deg,#07132f 0%,#081a38 54%,#050e20 100%)!important}
body:after{width:46vw!important;min-width:240px!important;height:90vh!important;background:linear-gradient(180deg,rgba(255,230,151,0),rgba(244,205,104,.07) 28%,rgba(242,194,70,.3) 100%)!important;filter:blur(9px)!important}
.wrap{width:min(100%,760px)!important;padding:18px 18px 92px!important;position:relative}
.wrap:before{content:"";position:fixed;inset:14px;pointer-events:none;border:1px solid rgba(216,174,90,.6);box-shadow:inset 0 0 0 8px rgba(216,174,90,.035);z-index:0}
.top{position:relative;z-index:2;justify-content:flex-end!important;margin-bottom:8px!important}.top .brand{display:none}.top .pill{background:rgba(6,18,38,.72)!important;color:#f2d895!important;border-color:rgba(220,181,91,.55)!important}
#rppAuthorHero{position:relative;z-index:2;text-align:center;padding:28px 8px 24px}.rpp-kicker{font:700 11px/1.4 ui-serif,"Yu Mincho",serif;letter-spacing:.28em;color:#e8c878}.rpp-author-title{font:500 clamp(34px,9vw,60px)/1.15 ui-serif,"Yu Mincho",serif;letter-spacing:.055em;color:#e5c270;margin:18px 0 8px;text-shadow:0 2px 24px rgba(218,168,71,.12)}.rpp-author-sub{font:500 18px/1.6 ui-serif,"Yu Mincho",serif;color:#e8c878;letter-spacing:.12em}.rpp-author-rule{width:min(270px,65%);height:1px;margin:13px auto;background:linear-gradient(90deg,transparent,#c99c45,transparent)}
#auth.panel,#editor .panel{position:relative;z-index:2;background:linear-gradient(180deg,rgba(255,252,244,.985),rgba(246,237,218,.985))!important;color:var(--rpp-ink)!important;border:1px solid #caa357!important;border-radius:18px!important;padding:30px 24px!important;box-shadow:0 24px 70px rgba(0,0,0,.42),inset 0 0 0 6px rgba(190,145,56,.06)!important;overflow:hidden}
#auth.panel:before,#editor .panel:before{content:"";position:absolute;inset:8px;pointer-events:none;border:1px solid rgba(186,139,50,.28);border-radius:12px}
#auth.panel>* ,#editor .panel>*{position:relative;z-index:1}
#auth .ey,#editor .ey{color:#956e24!important}.panel h1{color:#142748!important;font-size:clamp(30px,7vw,48px)!important;margin-top:10px!important}.panel .note{color:#766f63!important}.panel label{font:600 16px/1.4 ui-serif,"Yu Mincho",serif!important;color:#263655!important;letter-spacing:.03em}.panel .field{margin:18px 0!important}.panel input,.panel select,.panel textarea{background:rgba(255,255,255,.55)!important;color:#172544!important;border:1px solid rgba(176,132,52,.48)!important;border-radius:7px!important;padding:14px 14px!important;font-size:16px!important;box-shadow:inset 0 1px 2px rgba(65,46,16,.035)}.panel textarea{min-height:300px!important;line-height:1.9!important}.panel input:focus,.panel textarea:focus,.panel select:focus{border-color:#b88935!important;box-shadow:0 0 0 3px rgba(196,150,65,.11)!important}.count{color:#6f6b62!important;font-size:12px!important}.status{background:rgba(20,39,72,.045)!important;border-color:rgba(175,132,52,.24)!important;color:#38445a!important;border-radius:6px}.deadline{color:#3c485d!important;background:rgba(200,155,67,.08)!important}.badge{color:#85601f!important;border-color:rgba(175,132,52,.42)!important;background:rgba(200,155,67,.07)!important}.primary{background:linear-gradient(135deg,#a87325,#e8c46f 50%,#c38d2e)!important;color:#15120d!important;border:1px solid #a77929!important;box-shadow:inset 0 0 0 2px rgba(255,239,184,.3),0 7px 20px rgba(113,77,20,.16)!important}.secondary{background:linear-gradient(180deg,#0c244a,#071731)!important;color:#f3d788!important;border:1px solid #b78a38!important;box-shadow:inset 0 0 0 2px rgba(237,203,122,.08)!important}.stack{gap:12px!important}.stack .btn{border-radius:6px!important;font:600 16px ui-serif,"Yu Mincho",serif!important;min-height:54px!important;letter-spacing:.04em}
#photo{padding:12px!important;background:rgba(255,255,255,.44)!important}#photoOptionalNote{margin-top:10px;padding:10px 12px;border-left:3px solid #bd8d37;background:rgba(190,141,55,.08);color:#665e52!important}.photo-preview{border:2px solid #c59b4d!important;background:#fff;padding:4px}
#rppRecovery{margin:12px 0;padding:14px;border:1px solid rgba(174,126,41,.38);background:rgba(193,146,55,.08);border-radius:8px;color:#273650}#rppRecovery strong{display:block;color:#8a651f;margin-bottom:5px}#rppRecovery .rpp-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}#rppRecovery button{border:1px solid #b18537;border-radius:999px;background:#0b2348;color:#f4d88b;padding:9px 13px;cursor:pointer}
.previewbar{pointer-events:none!important;background:#ebcf7d!important;color:#261c0b!important;border-top:1px solid rgba(118,78,17,.25)!important}.paper{background:#f8f0de!important;border:1px solid #c59c50!important;box-shadow:0 24px 70px rgba(0,0,0,.35)!important}.paper h2{color:#132746!important}.pmeta,.pbody{color:#2a3447!important}.preview-actions .btn:not(.primary){background:#0a2348!important;color:#f0d283!important}
@media(max-width:560px){.wrap{padding-left:14px!important;padding-right:14px!important}.wrap:before{inset:8px}.rpp-author-title{font-size:39px}.rpp-author-sub{font-size:16px}#auth.panel,#editor .panel{padding:26px 18px!important;border-radius:14px!important}.panel textarea{min-height:260px!important}}
</style>
<script>
(()=>{
  const $=s=>document.querySelector(s);
  const fields=['record_date','org','name','title','body'];
  const norm=v=>String(v??'');
  const storyOrg=s=>norm(s?.org||[s?.soku,s?.bunku,s?.honbu,s?.shibu].filter(Boolean).join('／'));
  const valueFor=(s,k)=>k==='org'?storyOrg(s):norm(s?.[k]);
  const storySignature=s=>fields.map(k=>valueFor(s,k)).join('\\u241f');
  const setFields=s=>{if(!s)return;for(const id of fields){const el=$('#'+id);if(el)el.value=valueFor(s,id)}if(typeof window.counts==='function')window.counts()};
  const setMessage=(text,cls='ok')=>{const e=$('#savemsg');if(e){e.textContent=text;e.className='note '+cls}};

  function ensureHero(){
    const wrap=document.querySelector('.wrap');if(!wrap||$('#rppAuthorHero'))return;
    const hero=document.createElement('header');hero.id='rppAuthorHero';hero.innerHTML='<div class="rpp-kicker">MEMORIAL COLLECTION 2026</div><div class="rpp-author-rule"></div><div class="rpp-author-title">WRITE YOUR STORY</div><div class="rpp-author-sub">原稿を投稿・編集</div>';
    wrap.insertBefore(hero,wrap.firstChild);
  }

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
    btn.onclick=()=>{const status=badge.textContent.trim()==='提出済'?'submitted':'draft';if(typeof window.saveServer==='function')return window.saveServer(status)};
    refresh();new MutationObserver(refresh).observe(badge,{childList:true,subtree:true,characterData:true});
  }

  function showRecovery(local,server,email){
    if($('#rppRecovery'))return;
    const anchor=$('#deadlineEditor')||$('#formArea');if(!anchor)return;
    const box=document.createElement('div');box.id='rppRecovery';
    box.innerHTML='<strong>この端末に、クラウドより新しい下書きがあります。</strong><div class="note">端末側とクラウド側を自動で上書きせず、どちらを使うか選べます。</div><div class="rpp-actions"><button type="button" id="restoreLocal">端末の下書きを復元</button><button type="button" id="keepCloud">クラウド版を使う</button></div>';
    anchor.insertAdjacentElement('afterend',box);
    $('#restoreLocal').onclick=()=>{const merged={...local,org:storyOrg(local),status:server?.status==='submitted'?'submitted':(local.status||'draft')};setFields(merged);if($('#statusBadge'))$('#statusBadge').textContent=merged.status==='submitted'?'提出済':'下書き';try{localStorage.setItem('rpp_draft_'+email,JSON.stringify({...merged,saved_at:new Date().toISOString()}))}catch{}setMessage(server?.status==='submitted'?'端末の新しい内容を復元しました。提出済み状態は維持しています。':'端末の新しい下書きを復元しました。','ok');box.remove()};
    $('#keepCloud').onclick=()=>{const normalized={...server,org:storyOrg(server)};setFields(normalized);if($('#statusBadge'))$('#statusBadge').textContent=server?.status==='submitted'?'提出済':'下書き';try{localStorage.setItem('rpp_draft_'+email,JSON.stringify({...normalized,saved_at:server?.updated_at||new Date().toISOString()}))}catch{}setMessage('クラウド版を使用します。端末下書きはクラウド版に合わせました。','ok');box.remove()};
  }

  async function inspectAuthorState(){
    for(let i=0;i<30;i++){if(!$('#editor')?.classList.contains('hidden'))break;await new Promise(r=>setTimeout(r,250))}
    if($('#editor')?.classList.contains('hidden'))return;
    protectSubmittedSave();
    try{const r=await fetch('/api/me/story',{credentials:'same-origin',cache:'no-store'});if(!r.ok){markPhotoOptional(false);return}const d=await r.json(),server=d.story||null,email=String(d.email||'').toLowerCase();markPhotoOptional(Boolean(server?.photo_key));if(!email||!server)return;let local=null;try{local=JSON.parse(localStorage.getItem('rpp_draft_'+email)||'null')}catch{}if(!local?.saved_at||!server.updated_at)return;const localTs=Date.parse(local.saved_at),serverTs=Date.parse(server.updated_at);if(Number.isFinite(localTs)&&Number.isFinite(serverTs)&&localTs>serverTs+1500&&storySignature(local)!==storySignature(server))showRecovery(local,server,email)}catch{markPhotoOptional(false)}
  }

  ensureHero();markPhotoOptional(false);inspectAuthorState();
  const editor=$('#editor');if(editor)new MutationObserver(()=>{if(!editor.classList.contains('hidden'))inspectAuthorState()}).observe(editor,{attributes:true,attributeFilter:['class']});
})();
</script>`;

const INDEX_ENHANCEMENT = `
<style>
body{background:#041126!important}body:before{background:radial-gradient(circle at 50% 66%,rgba(247,207,105,.38),transparent 7%),radial-gradient(circle at 18% 17%,rgba(255,255,255,.13) 0 1px,transparent 1.6px),radial-gradient(circle at 78% 22%,rgba(255,255,255,.12) 0 1px,transparent 1.6px),radial-gradient(circle at 62% 42%,rgba(246,214,136,.12) 0 1px,transparent 1.6px),linear-gradient(180deg,#07152f 0%,#0b1d3e 48%,#050f22 100%)!important}body:after{width:42vw!important;min-width:240px!important;height:92vh!important;background:linear-gradient(180deg,rgba(255,230,151,0),rgba(244,205,104,.08) 26%,rgba(242,194,70,.34) 100%)!important;filter:blur(8px)!important}
.wrap{width:min(100%,900px)!important}.gate,.cover,.toc,.reader{padding-left:18px!important;padding-right:18px!important}.gate,.cover{position:relative}.gate:before,.cover:before{content:"";position:absolute;inset:14px;border:1px solid rgba(216,174,90,.64);box-shadow:inset 0 0 0 8px rgba(216,174,90,.035);pointer-events:none}.gate-card{max-width:760px!important;padding:64px 38px 48px!important;background:linear-gradient(180deg,rgba(6,18,38,.78),rgba(5,15,32,.9))!important;border:1px solid rgba(225,187,97,.62)!important;box-shadow:0 30px 90px rgba(0,0,0,.36),inset 0 0 0 8px rgba(223,183,88,.035),0 0 0 1px rgba(84,55,13,.35)!important}.gate-card .eyebrow{font-family:ui-serif,"Yu Mincho",serif!important;font-size:12px!important;letter-spacing:.28em!important;color:#e6c673!important}.gate-card h1,.cover h1{font-size:clamp(46px,10vw,86px)!important;line-height:1.02!important;color:#e4c276!important;letter-spacing:.06em!important;text-shadow:0 4px 28px rgba(221,171,68,.13)}.gate-card .sub{font-family:ui-serif,"Yu Mincho",serif!important;color:#e5d7ae!important;font-size:clamp(18px,4vw,28px)!important;line-height:1.7!important}.gate-bridge{margin:22px 0 10px;color:#ddba66;font:500 15px/1.6 ui-serif,"Yu Mincho",serif;letter-spacing:.13em}.input{background:rgba(4,15,34,.72)!important;border:1px solid #a87b31!important;color:#fff!important;border-radius:9px!important;padding:16px 18px!important}.primary{border-radius:5px!important;min-height:58px!important;background:linear-gradient(135deg,#9e6e20,#e7c470 50%,#b47c24)!important;border:1px solid #d7b45f!important;box-shadow:inset 0 0 0 2px rgba(255,238,184,.24)!important;font:600 18px ui-serif,"Yu Mincho",serif!important;letter-spacing:.08em!important}.gate-author{margin-top:22px!important;border:0!important;background:none!important;color:#e5c773!important;font-family:ui-serif,"Yu Mincho",serif!important;text-decoration:none!important;letter-spacing:.07em}.gate-author:before{content:"✎ ";font-size:18px}.rule{background:linear-gradient(90deg,transparent,#d0a04a,transparent)!important}.cover{justify-content:center!important}.cover .jp{color:#eadcae!important;font-size:22px!important}.cover .bridge{color:#e2bd67!important;font-size:15px!important}.cover .ghost{border-radius:5px!important;border-color:rgba(215,174,78,.58)!important;background:rgba(4,15,34,.62)!important;color:#efd486!important}
.toc{position:relative}.toc h2{font-size:34px!important;color:#ecd486!important;text-align:center!important}.toc .note{text-align:center}.toc-item{border-top-color:rgba(219,181,89,.28)!important}.toc-item button{padding:19px 8px!important}.toc-title{font-size:19px!important;color:#f2e5bd!important}.toc-name{color:#bfc6d6!important}.toc-search{margin:14px 0 18px;position:sticky;top:58px;z-index:15;padding:8px 0;background:linear-gradient(180deg,rgba(6,18,38,.98),rgba(6,18,38,.9),rgba(6,18,38,0))}.toc-search input{width:100%;border:1px solid rgba(216,184,102,.48);background:rgba(255,255,255,.065);color:#fff;border-radius:999px;padding:13px 17px;font:14px ui-sans-serif,system-ui;outline:none}.toc-search input:focus{border-color:#f0d98c;box-shadow:0 0 0 3px rgba(216,184,102,.1)}.toc-search-meta{margin:7px 5px 0;font:11px ui-sans-serif,system-ui;color:#aeb5c5}
.paper{position:relative!important;background:linear-gradient(180deg,#fffaf0,#f3ebda)!important;color:#1b263d!important;min-height:78vh!important;padding:46px 38px 54px!important;border:1px solid #caa256!important;border-radius:18px!important;box-shadow:0 28px 85px rgba(0,0,0,.42),inset 0 0 0 7px rgba(184,137,49,.055)!important}.paper:after{content:"";position:absolute;inset:10px;border:1px solid rgba(183,135,47,.28);border-radius:11px;pointer-events:none}.paper .story-label{color:#9a7028!important;letter-spacing:.24em!important}.paper h2{color:#112850!important;font-size:clamp(30px,6vw,46px)!important;letter-spacing:.06em!important;margin-top:22px!important}.meta{color:#465167!important;font-size:14px!important;line-height:1.9!important}.photo{width:min(76%,420px)!important;max-height:430px!important;border:1px solid #b88d3e!important;padding:6px!important;background:#fffaf0!important;box-shadow:0 10px 30px rgba(43,30,11,.12)}.body{color:#273245!important;line-height:2.15!important;font-family:ui-serif,"Yu Mincho","Hiragino Mincho ProN",serif!important}.reader-nav button,.mini-btn{border-radius:999px!important;border-color:rgba(218,177,79,.52)!important;background:rgba(5,17,38,.76)!important;color:#efd486!important}.top-actions{background:linear-gradient(180deg,rgba(5,16,36,.98),rgba(5,16,36,.88),transparent)!important}.preview{pointer-events:none!important}
@media(max-width:520px){.gate,.cover,.toc,.reader{padding-left:12px!important;padding-right:12px!important}.gate:before,.cover:before{inset:8px}.gate-card{padding:52px 18px 38px!important}.gate-card h1,.cover h1{font-size:48px!important}.gate-card .sub{font-size:20px!important}.paper{padding:38px 22px 46px!important;border-radius:14px!important}.paper h2{font-size:32px!important}.body{line-height:2.05!important}.photo{width:88%!important}}
</style>
<script>
(()=>{
  const gate=document.querySelector('#gate .gate-card');
  if(gate&&!document.querySelector('.gate-bridge')){const bridge=document.createElement('div');bridge.className='gate-bridge';bridge.textContent='✦ そして、11.15、11.18へ ✦';const rule=gate.querySelector('.rule');if(rule)gate.insertBefore(bridge,rule)}
  if(gate&&!document.querySelector('#gateAuthorLink')){const a=document.createElement('a');a.id='gateAuthorLink';a.className='btn gate-author';a.href='./author';a.textContent='原稿を書く / EDIT MY STORY';gate.appendChild(a)}

  const list=document.querySelector('#tocList');if(!list)return;
  const wrap=document.createElement('div');wrap.className='toc-search';wrap.innerHTML='<input id="tocSearch" type="search" inputmode="search" autocomplete="off" placeholder="題名・氏名で検索"><div id="tocSearchMeta" class="toc-search-meta"></div>';
  list.insertAdjacentElement('beforebegin',wrap);
  const input=wrap.querySelector('#tocSearch'),meta=wrap.querySelector('#tocSearchMeta');
  const normalize=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/\\s+/g,'');
  function apply(){const q=normalize(input.value);const items=[...list.querySelectorAll('.toc-item')];let shown=0;for(const item of items){const ok=!q||normalize(item.textContent).includes(q);item.hidden=!ok;if(ok)shown++}meta.textContent=q?shown+'件見つかりました':'全 '+items.length+' 件'}
  input.addEventListener('input',apply);new MutationObserver(apply).observe(list,{childList:true,subtree:true});apply();
})();
</script>`;

function appendHtml(response,html){return new HTMLRewriter().on('body',{element(el){el.append(html,{html:true})}}).transform(response)}

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
