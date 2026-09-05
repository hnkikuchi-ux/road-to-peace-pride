import app from './faithful-cover-v11-r4.js';

const AUTHOR_R5 = `
<style>
/* author-polish-r5 — code checkpoint + calm mobile writing flow */
body.rpp-author-r5{background:#061226!important}
body.rpp-author-r5 .wrap{width:min(100%,760px)!important;padding:20px 14px 96px!important}
body.rpp-author-r5 .top{padding:2px 2px 8px;margin-bottom:16px!important}
body.rpp-author-r5 .top .brand{font-size:12px;letter-spacing:.18em;color:#efd98d}
body.rpp-author-r5 .top .pill{min-height:42px;display:inline-flex;align-items:center}
body.rpp-author-r5 .panel{
  position:relative;overflow:hidden;border-radius:2px!important;
  border:1px solid rgba(231,187,79,.66)!important;
  background:linear-gradient(180deg,rgba(7,23,52,.94),rgba(3,14,34,.96))!important;
  box-shadow:inset 0 0 0 1px rgba(255,233,163,.045),0 24px 70px rgba(0,0,0,.30)!important;
}
body.rpp-author-r5 #auth:before{
  content:'';position:absolute;inset:0;pointer-events:none;opacity:.6;
  background:radial-gradient(circle at 12% 9%,rgba(255,224,134,.55) 0 1px,transparent 1.5px),
             radial-gradient(circle at 82% 17%,rgba(255,255,255,.45) 0 1px,transparent 1.4px),
             radial-gradient(circle at 66% 34%,rgba(231,187,79,.38) 0 1px,transparent 1.5px);
  background-size:97px 91px,131px 117px,151px 139px;
}
body.rpp-author-r5 #auth>*{position:relative;z-index:1}
body.rpp-author-r5 .rpp-author-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:2px 0 18px}
body.rpp-author-r5 .rpp-author-step{border-top:1px solid rgba(216,184,102,.28);padding-top:8px;text-align:center;color:#9da7bb;font-size:10px;line-height:1.5;letter-spacing:.04em}
body.rpp-author-r5 .rpp-author-step b{display:block;color:#efd98d;font-size:11px;margin-bottom:2px}
body.rpp-author-r5 .rpp-author-step.active{border-top-color:#efd98d;color:#e9dfc1}
body.rpp-author-r5 .rpp-author-guide{border-left:3px solid #d8b866!important;background:linear-gradient(90deg,rgba(216,184,102,.12),rgba(216,184,102,.045))!important;padding:14px 14px 14px 16px!important}
body.rpp-author-r5 .rpp-auth-tab{min-height:48px!important;border-radius:999px!important}
body.rpp-author-r5 input,body.rpp-author-r5 textarea{border-radius:8px!important;min-height:48px}
body.rpp-author-r5 textarea{min-height:340px!important;padding:15px!important}
body.rpp-author-r5 .btn{min-height:48px;display:inline-flex;align-items:center;justify-content:center}
body.rpp-author-r5 .primary{min-height:52px!important;box-shadow:0 8px 24px rgba(198,150,51,.16)}
body.rpp-author-r5 .status{border-left:3px solid #d8b866!important;background:rgba(216,184,102,.07)!important;padding:12px 14px!important}
body.rpp-author-r5 .rpp-form-section{margin:18px 0;padding:18px 16px 16px;border:1px solid rgba(216,184,102,.25);background:rgba(255,255,255,.025);box-shadow:inset 0 0 26px rgba(10,25,52,.16)}
body.rpp-author-r5 .rpp-section-head{display:flex;gap:12px;align-items:flex-start;margin:0 0 16px;padding-bottom:12px;border-bottom:1px solid rgba(216,184,102,.18)}
body.rpp-author-r5 .rpp-section-no{flex:0 0 auto;width:34px;height:34px;display:grid;place-items:center;border:1px solid rgba(239,217,141,.55);border-radius:50%;color:#efd98d;font-family:ui-serif,"Yu Mincho",serif;font-size:13px}
body.rpp-author-r5 .rpp-section-title{font-family:ui-serif,"Yu Mincho",serif;font-size:18px;letter-spacing:.05em;color:#fff;margin:0 0 3px}
body.rpp-author-r5 .rpp-section-desc{font-size:11px;line-height:1.7;color:#9fa9bb}
body.rpp-author-r5 .rpp-form-section .field{margin:14px 0!important}
body.rpp-author-r5 .rpp-form-section label{color:#eee3c5!important;font-weight:650}
body.rpp-author-r5 #submit{font-size:15px;letter-spacing:.05em}
body.rpp-author-r5 #logout{opacity:.78}
body.rpp-author-r5 #rppEditCodeCard.rpp-code-collapsed{padding:13px 14px!important;text-align:left!important}
body.rpp-author-r5 #rppEditCodeCard.rpp-code-collapsed h2{font-size:16px!important;margin:4px 0!important}
body.rpp-author-r5 #rppEditCodeCard.rpp-code-collapsed .rpp-edit-code-value,
body.rpp-author-r5 #rppEditCodeCard.rpp-code-collapsed p{display:none!important}
body.rpp-author-r5 #rppEditCodeCard.rpp-code-collapsed.rpp-code-visible .rpp-edit-code-value{display:block!important;text-align:center}
body.rpp-author-r5 #rppEditCodeCard.rpp-code-collapsed.rpp-code-visible p{display:block!important;text-align:center}
body.rpp-author-r5 .rpp-code-saved-badge{display:inline-block;margin-top:6px;padding:4px 8px;border:1px solid rgba(169,226,187,.35);border-radius:999px;color:#bce8c8;font-size:10px}
body.rpp-author-r5 .rpp-code-tools{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
body.rpp-author-r5 .rpp-code-tools .btn{width:auto!important;min-width:0!important;min-height:40px!important;padding:8px 12px!important;font-size:11px}

body.rpp-code-checkpoint-open{overflow:hidden!important}
#rppCodeCheckpoint{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:16px;background:rgba(0,5,18,.88);backdrop-filter:blur(12px)}
#rppCodeCheckpoint .rpp-checkpoint-card{width:min(100%,560px);max-height:94vh;overflow:auto;position:relative;padding:24px 20px 22px;border:1px solid rgba(239,217,141,.86);background:linear-gradient(180deg,#10254a,#06152f 72%,#041027);box-shadow:0 30px 90px rgba(0,0,0,.55),inset 0 0 0 7px #071935,inset 0 0 0 8px rgba(231,187,79,.28);text-align:center}
#rppCodeCheckpoint .rpp-checkpoint-kicker{font-size:10px;letter-spacing:.24em;color:#efd98d;font-weight:800}
#rppCodeCheckpoint h2{font-family:ui-serif,"Yu Mincho",serif;font-size:clamp(21px,6vw,28px);font-weight:500;line-height:1.45;letter-spacing:.04em;margin:10px 0 8px}
#rppCodeCheckpoint .rpp-checkpoint-lead{font-size:12px;line-height:1.85;color:#d5d8df;margin:0 auto 14px;max-width:430px}
#rppCodeCheckpoint .rpp-checkpoint-code{margin:14px auto 12px;padding:14px 8px;border-top:1px solid rgba(239,217,141,.45);border-bottom:1px solid rgba(239,217,141,.45);font-variant-numeric:tabular-nums;font-weight:800;font-size:clamp(32px,10vw,48px);letter-spacing:.18em;color:#f2d98f;text-shadow:0 0 20px rgba(239,217,141,.15)}
#rppCodeCheckpoint .rpp-copy{width:100%;margin-top:2px}
#rppCodeCheckpoint .rpp-copy-state{min-height:21px;margin-top:6px;color:#bce8c8;font-size:11px}
#rppCodeCheckpoint .rpp-saved-check{display:flex;align-items:flex-start;gap:10px;text-align:left;margin:14px 0;padding:13px;border:1px solid rgba(216,184,102,.34);background:rgba(216,184,102,.07);cursor:pointer}
#rppCodeCheckpoint .rpp-saved-check input{width:20px!important;height:20px!important;min-height:0!important;flex:0 0 auto;margin:1px 0 0;accent-color:#d8b866}
#rppCodeCheckpoint .rpp-saved-check span{font-size:12px;line-height:1.7;color:#f1ead6}
#rppCodeCheckpoint .rpp-continue{width:100%;min-height:54px;font-weight:800}
#rppCodeCheckpoint .rpp-continue:disabled{opacity:.35;cursor:not-allowed;filter:saturate(.5)}
#rppCodeCheckpoint .rpp-checkpoint-foot{font-size:10px;line-height:1.7;color:#98a4b8;margin:12px 5px 0}

@media(max-width:520px){
  body.rpp-author-r5 .panel{padding:20px 15px!important}
  body.rpp-author-r5 .rpp-form-section{margin-left:-2px;margin-right:-2px;padding:16px 13px}
  body.rpp-author-r5 .rpp-author-steps{gap:3px}
  body.rpp-author-r5 .rpp-author-step{font-size:9px}
  #rppCodeCheckpoint{padding:10px}
  #rppCodeCheckpoint .rpp-checkpoint-card{padding:22px 16px 18px}
  #rppCodeCheckpoint .rpp-checkpoint-code{letter-spacing:.12em}
}
</style>
<script>
(()=>{
  const ready=(fn)=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
  const digits=(v)=>String(v||'').replace(/\\D/g,'');
  const copyText=async(text)=>{
    try{if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(text);return true}}catch(e){}
    try{const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.focus();ta.select();const ok=document.execCommand('copy');ta.remove();return ok}catch(e){return false}
  };

  function addSteps(){
    const auth=document.getElementById('auth');if(!auth||document.getElementById('rppAuthorSteps'))return;
    document.body.classList.add('rpp-author-r5');
    const ey=auth.querySelector('.ey');
    const steps=document.createElement('div');steps.id='rppAuthorSteps';steps.className='rpp-author-steps';
    steps.innerHTML='<div class="rpp-author-step active"><b>01</b>本人確認</div><div class="rpp-author-step"><b>02</b>コード保存</div><div class="rpp-author-step"><b>03</b>原稿作成</div>';
    if(ey)ey.insertAdjacentElement('afterend',steps);else auth.insertAdjacentElement('afterbegin',steps);
    const h=auth.querySelector('h1');if(h)h.textContent='私の記録を綴る';
    const back=document.querySelector('.top .pill');if(back)back.textContent='← 公開ブックへ';
  }

  function makeSection(num,title,desc,nodes){
    nodes=nodes.filter(Boolean);if(!nodes.length)return null;
    const parent=nodes[0].parentNode;if(!parent)return null;
    const sec=document.createElement('section');sec.className='rpp-form-section';sec.dataset.rppSection=num;
    sec.innerHTML='<div class="rpp-section-head"><div class="rpp-section-no">'+num+'</div><div><div class="rpp-section-title">'+title+'</div><div class="rpp-section-desc">'+desc+'</div></div></div>';
    parent.insertBefore(sec,nodes[0]);nodes.forEach(n=>sec.appendChild(n));return sec;
  }

  function polishEditor(){
    const editor=document.getElementById('editor'),form=document.getElementById('formArea');if(!editor||!form||form.dataset.r5Sections==='1')return;
    form.dataset.r5Sections='1';
    const field=(id)=>document.getElementById(id)?.closest('.field');
    const confirm=document.getElementById('confirm')?.closest('label');
    const stack=document.getElementById('submit')?.closest('.stack');
    makeSection('01','基本情報','記載日・組織名・氏名を入力してください。',[field('record_date'),field('org'),field('name')]);
    makeSection('02','あなたの記録','題名と、9.12までの挑戦・誓い・思いをそのまま綴ってください。',[field('title'),field('body')]);
    makeSection('03','写真・確認・提出','写真は任意です。内容を確認して提出してください。',[field('photo'),confirm,stack]);
    const submit=document.getElementById('submit');if(submit)submit.textContent='この内容で提出する';
  }

  function compactCodeCard(card){
    if(!card||card.dataset.r5Compact==='1')return;
    card.dataset.r5Compact='1';card.classList.add('rpp-code-collapsed');
    const h=card.querySelector('h2');if(h)h.textContent='編集用承認コード';
    const badge=document.createElement('div');badge.className='rpp-code-saved-badge';badge.textContent='保存後もここから確認できます';
    if(h)h.insertAdjacentElement('afterend',badge);
    const copy=card.querySelector('#rppCopyEditCode');
    const tools=document.createElement('div');tools.className='rpp-code-tools';
    const reveal=document.createElement('button');reveal.type='button';reveal.className='btn secondary';reveal.textContent='コードを表示';
    reveal.onclick=()=>{const on=card.classList.toggle('rpp-code-visible');reveal.textContent=on?'コードを隠す':'コードを表示'};
    tools.appendChild(reveal);if(copy){copy.textContent='コードをコピー';tools.appendChild(copy)};
    card.appendChild(tools);
  }

  function showCheckpoint(rawCode,reset){
    const code=digits(rawCode);if(code.length!==8)return;
    document.getElementById('rppCodeCheckpoint')?.remove();
    document.body.classList.add('rpp-code-checkpoint-open');
    const overlay=document.createElement('div');overlay.id='rppCodeCheckpoint';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','rppCheckpointTitle');
    const shown=code.slice(0,4)+' '+code.slice(4);
    overlay.innerHTML='<div class="rpp-checkpoint-card"><div class="rpp-checkpoint-kicker">YOUR EDIT KEY</div><h2 id="rppCheckpointTitle">'+(reset?'新しい編集用承認コードを保存してください':'編集用承認コードを保存してください')+'</h2><p class="rpp-checkpoint-lead">このコードが、あなたの原稿をあとから編集するための「鍵」になります。原稿を書き始める前に保存してください。</p><div class="rpp-checkpoint-code">'+shown+'</div><button type="button" id="rppCheckpointCopy" class="btn secondary rpp-copy">承認コードをコピー</button><div id="rppCheckpointCopyState" class="rpp-copy-state"></div><label class="rpp-saved-check"><input id="rppCodeSaved" type="checkbox"><span><b>スクリーンショットまたはメモで保存しました</b><br>次回編集するときに、この8桁コードを使用します。</span></label><button type="button" id="rppCheckpointContinue" class="btn primary rpp-continue" disabled>保存しました。原稿を書く</button><p class="rpp-checkpoint-foot">紛失した場合は、登録したメールアドレスへの本人確認で新しいコードを再発行できます。</p></div>';
    document.body.appendChild(overlay);
    const copy=document.getElementById('rppCheckpointCopy'),state=document.getElementById('rppCheckpointCopyState'),saved=document.getElementById('rppCodeSaved'),cont=document.getElementById('rppCheckpointContinue');
    copy.onclick=async()=>{const ok=await copyText(code);state.textContent=ok?'コピーしました。メモ等に保存してください。':'コピーできない場合はスクリーンショットで保存してください。'};
    saved.onchange=()=>{cont.disabled=!saved.checked};
    cont.onclick=()=>{
      if(!saved.checked)return;
      overlay.remove();document.body.classList.remove('rpp-code-checkpoint-open');sessionStorage.setItem('rpp_r5_code_ack','1');
      const card=document.getElementById('rppEditCodeCard');compactCodeCard(card);
      setTimeout(()=>{const editor=document.getElementById('editor');if(editor&&!editor.classList.contains('hidden'))editor.scrollIntoView({behavior:'smooth',block:'start'})},80);
    };
    setTimeout(()=>copy.focus(),50);
  }

  ready(()=>{
    addSteps();polishEditor();
    const editor=document.getElementById('editor');if(editor){
      const obs=new MutationObserver(()=>{polishEditor();const card=document.getElementById('rppEditCodeCard');if(card&&!document.getElementById('rppCodeCheckpoint'))compactCodeCard(card)});
      obs.observe(editor,{childList:true,subtree:true});
      const existing=document.getElementById('rppEditCodeCard');if(existing)compactCodeCard(existing);
    }
    const previousFetch=window.fetch.bind(window);
    window.fetch=async(input,init)=>{
      const response=await previousFetch(input,init);
      const u=typeof input==='string'?input:(input&&input.url)||'';
      if(u.includes('/api/auth/verify')){
        try{const d=await response.clone().json();if(response.ok&&d.editCode)setTimeout(()=>showCheckpoint(d.editCode,!!d.editCodeReset),0)}catch(e){}
      }
      return response;
    };
  });
})();
</script>`;

function applyAuthor(response){return new HTMLRewriter().on('body',{element(el){el.append(AUTHOR_R5,{html:true})}}).transform(response)}

export default {
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx);
    const url=new URL(request.url),type=response.headers.get('content-type')||'';
    if(type.includes('text/html')&&['/author','/author.html'].includes(url.pathname))return applyAuthor(response);
    return response;
  }
};
