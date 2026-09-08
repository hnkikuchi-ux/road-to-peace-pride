import app from './faithful-cover-v11-r26.js';

const REEDIT_NO_RELOAD=`<script>
(()=>{
  const codeTerm=v=>String(v||'')
    .replace(/編集用承認コード/g,'認識コード')
    .replace(/本人確認コード/g,'認識コード')
    .replace(/認証コード/g,'認識コード')
    .replace(/確認コード/g,'認識コード')
    .replace(/承認コード/g,'認識コード');
  async function openReedit(btn){
    const emailInput=document.getElementById('email');
    const codeInput=document.getElementById('rppEditCode');
    const out=document.getElementById('rppEditMsg');
    const mail=(emailInput?.value||'').trim().toLowerCase();
    const code=(codeInput?.value||'').replace(/\\D/g,'');
    if(!/^\\S+@\\S+\\.\\S+$/.test(mail)||code.length!==6){if(out)out.textContent='メールアドレスと6桁の認識コードを入力してください。';return}
    if(btn)btn.disabled=true;
    try{
      const r=await fetch('/api/edit-code/login',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({email:mail,code})});
      const d=await r.json();
      if(!r.ok){if(out)out.textContent=codeTerm(d.error)||'6桁の認識コードを確認してください。';return}
      if(out)out.textContent='認証しました。原稿を開きます。';
      let ok=false;
      if(typeof openEditor==='function')ok=await openEditor();
      else throw new Error('原稿画面を開く準備ができていません。ページを更新してもう一度お試しください。');
      if(!ok)throw new Error('原稿を開けませんでした。');
      const editor=document.getElementById('editor');
      if(!editor||editor.classList.contains('hidden'))throw new Error('原稿画面を表示できませんでした。');
      editor.scrollIntoView({block:'start'});
      setTimeout(()=>document.dispatchEvent(new Event('rpp:reedit-opened')),0);
    }catch(e){if(out)out.textContent=codeTerm(e?.message)||'通信できませんでした。'}finally{if(btn)btn.disabled=false}
  }
  function mark(){
    const btn=document.getElementById('rppEditLoginBtn');
    if(!btn)return;
    if(!btn.getAttribute('type'))btn.setAttribute('type','button');
    if(btn.dataset.r27Bound==='direct')return;
    btn.onclick=null;
    btn.dataset.r27Bound='direct';
    btn.addEventListener('click',e=>{
      e.preventDefault();
      e.stopImmediatePropagation();
      openReedit(btn);
    },true);
  }
  document.addEventListener('click',e=>{
    const btn=e.target?.closest?.('#rppEditLoginBtn');
    if(!btn||btn.dataset.r27Bound==='direct')return;
    e.preventDefault();
    e.stopImmediatePropagation();
    openReedit(btn);
  },true);
  const run=()=>{mark();setTimeout(mark,120);setTimeout(mark,500);setTimeout(mark,1200)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  addEventListener('pageshow',run);
  document.addEventListener('click',e=>{if(e.target?.closest?.('#rppEditTab')){setTimeout(mark,0);setTimeout(mark,80)}},true);
})();
</script>`;

const AUTHOR_CLARITY=`<style id="rppAuthorClarityR27">
/* AUTHOR CLARITY r27.9 — simple auth then automatic new/edit routing */
#rppAuthorHero{display:none!important}
body.rpp-author-r5 .top{display:none!important}
body.rpp-author-r5 .wrap{padding-top:10px!important}
body.rpp-author-r5 #auth{color:#17243a!important}
body.rpp-author-r5 #auth h1{color:#17243a!important;text-shadow:none!important;opacity:1!important}
body.rpp-author-r5 #auth .ey{color:#8a671b!important;opacity:1!important}
body.rpp-author-r5 #auth .note,
body.rpp-author-r5 #auth p,
body.rpp-author-r5 #auth small,
body.rpp-author-r5 #auth .rpp-code-note{color:#4b5360!important;opacity:1!important}
body.rpp-author-r5 #auth label{color:#263650!important;opacity:1!important;font-weight:650!important}
body.rpp-author-r5 #auth .rpp-author-guide{
  color:#4b3c20!important;opacity:1!important;
  background:linear-gradient(90deg,#fff4d2,#fffaf0)!important;
  border-color:#c69b3c!important;
  margin-top:14px!important;
  margin-bottom:18px!important
}
body.rpp-author-r5 #auth .rpp-author-guide b{color:#76520f!important;opacity:1!important}
body.rpp-author-r5 #auth input:not([type="checkbox"]){
  color:#17243a!important;-webkit-text-fill-color:#17243a!important;
  background:#fffdf8!important;border-color:#c9ad67!important;opacity:1!important
}
body.rpp-author-r5 #auth input::placeholder{
  color:#747a82!important;-webkit-text-fill-color:#747a82!important;opacity:1!important
}
body.rpp-author-r5 #auth .rpp-auth-tabs,
body.rpp-author-r5 #auth #rppEditLogin{display:none!important}
body.rpp-author-r5 #auth button:disabled{
  opacity:.62!important;color:#665e50!important;-webkit-text-fill-color:#665e50!important
}
body.rpp-author-r5 #auth #send,
body.rpp-author-r5 #auth #verify{
  color:#1c160c!important;-webkit-text-fill-color:#1c160c!important
}
body.rpp-author-r5 #auth > .note:first-of-type{
  margin:7px 2px 12px!important;
  color:#59616d!important;
  font-size:12px!important;
  line-height:1.7!important
}
body.rpp-author-r5 #auth #authmsg{min-height:20px!important}
body.rpp-author-r5 #submit,
body.rpp-author-r5 #submitPreview{touch-action:manipulation}
@media(max-width:560px){
  body.rpp-author-r5 .wrap{padding-top:8px!important}
  body.rpp-author-r5 #auth{margin-top:0!important}
  body.rpp-author-r5 #auth .rpp-author-guide{margin-bottom:16px!important}
}
</style>
<script>
(()=>{
  const normalizeCodeTerms=v=>String(v||'')
    .replace(/編集用承認コード/g,'認識コード')
    .replace(/本人確認コード/g,'認識コード')
    .replace(/認証コード/g,'認識コード')
    .replace(/確認コード/g,'認識コード')
    .replace(/承認コード/g,'認識コード');
  const normalizeTree=root=>{
    if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(n=>{const v=normalizeCodeTerms(n.nodeValue);if(v!==n.nodeValue)n.nodeValue=v});
    root.querySelectorAll?.('input[placeholder]').forEach(el=>{const v=normalizeCodeTerms(el.placeholder);if(v!==el.placeholder)el.placeholder=v});
  };
  const numericCodeInput=(el,submitId)=>{
    if(!el)return;
    el.maxLength=6;
    el.setAttribute('inputmode','numeric');
    el.setAttribute('pattern','[0-9]{6}');
    el.setAttribute('autocomplete','one-time-code');
    el.setAttribute('enterkeyhint','done');
    if(el.dataset.rppNumericCode==='1')return;
    el.dataset.rppNumericCode='1';
    el.addEventListener('input',()=>{const next=el.value.replace(/\\D/g,'').slice(0,6);if(el.value!==next)el.value=next});
    el.addEventListener('keydown',e=>{if(e.key==='Enter'&&el.value.replace(/\\D/g,'').length===6){e.preventDefault();document.getElementById(submitId)?.click()}});
  };
  const apply=()=>{
    document.documentElement.dataset.rppAuthorClarity='r27-9';
    document.title='私の記録を綴る | ROAD TO PEACE PRIDE';
    const auth=document.getElementById('auth');
    const h1=auth?.querySelector('h1');
    if(h1&&h1.textContent!=='私の記録を綴る')h1.textContent='私の記録を綴る';
    if(!auth||!h1)return;

    document.getElementById('rppEmailFirstHint')?.remove();

    const note=auth.querySelector(':scope > .note');
    if(note){note.id='rppRecognitionHelp';note.textContent='メールアドレスを入力すると、本人確認用の6桁の認識コードをメールでお送りします。届いた認識コードを入力して「認証する」を押してください。'}

    const email=document.getElementById('email');
    const emailField=email?.closest?.('.field')||email?.parentElement;
    const send=document.getElementById('send');
    const otpbox=document.getElementById('otpbox');
    const otp=document.getElementById('otp');
    const tabs=auth.querySelector('.rpp-auth-tabs');
    const guide=auth.querySelector('.rpp-author-guide');
    const editBox=document.getElementById('rppEditLogin');
    const authmsg=document.getElementById('authmsg');
    const deadline=document.getElementById('deadlineAuth');

    if(tabs){tabs.classList.add('hidden');tabs.setAttribute('aria-hidden','true')}
    if(editBox){editBox.classList.add('hidden');editBox.setAttribute('aria-hidden','true')}
    if(email){email.setAttribute('autocomplete','email');email.setAttribute('aria-describedby','rppRecognitionHelp')}
    if(send){send.textContent='認識コードを送信';send.setAttribute('type','button')}
    if(otp){otp.placeholder='6桁の認識コード';otp.setAttribute('aria-label','6桁認識コード');const label=otp.closest('.field')?.querySelector('label');if(label)label.textContent='6桁認識コード';numericCodeInput(otp,'verify')}
    const verify=document.getElementById('verify');if(verify)verify.setAttribute('type','button');
    if(authmsg){authmsg.setAttribute('role','status');authmsg.setAttribute('aria-live','polite')}
    if(guide)guide.innerHTML='<b>🔑 6桁の認識コードについて</b><br>初回のメール認証で届く6桁の認識コードを、そのまま提出後の再編集にも使用します。スクリーンショットまたはメモで保存してください。';

    const card=document.getElementById('rppEditCodeCard');
    if(card){
      const ch=card.querySelector('h2');if(ch)ch.textContent='あなたの6桁認識コード';
      const badge=card.querySelector('.rpp-code-saved-badge');if(badge)badge.textContent='再編集にも使う認識コードです';
      const copy=card.querySelector('#rppCopyEditCode');if(copy)copy.textContent='認識コードをコピー';
      normalizeTree(card);
    }
    const cp=document.getElementById('rppCodeCheckpoint');
    if(cp){
      const kicker=cp.querySelector('.rpp-checkpoint-kicker');if(kicker)kicker.textContent='YOUR 6-DIGIT KEY';
      const title=cp.querySelector('#rppCheckpointTitle');if(title)title.textContent='メールで届いた6桁の認識コードを保存してください';
      const lead=cp.querySelector('.rpp-checkpoint-lead');if(lead)lead.textContent='本人確認で使用した同じ6桁の認識コードです。この認識コードが、あとから原稿を編集するための「鍵」になります。';
      const copy=cp.querySelector('#rppCheckpointCopy');if(copy)copy.textContent='認識コードをコピー';
      const saved=cp.querySelector('.rpp-saved-check span');if(saved)saved.innerHTML='<b>スクリーンショットまたはメモで保存しました</b><br>次回編集するときも、この同じ6桁の認識コードを使用します。';
      const foot=cp.querySelector('.rpp-checkpoint-foot');if(foot)foot.textContent='紛失した場合は、登録メールアドレスへの本人確認で新しい認識コードを再発行できます。';
      normalizeTree(cp);
    }

    const ordered=[emailField,note,send,guide,otpbox,deadline,authmsg].filter(Boolean);
    let cursor=h1;
    for(const el of ordered){
      if(el===h1)continue;
      cursor.insertAdjacentElement('afterend',el);
      cursor=el;
    }
    normalizeTree(auth);
  };
  const schedule=()=>{apply();setTimeout(apply,120);setTimeout(apply,420);setTimeout(apply,900)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
  addEventListener('pageshow',schedule);

  if(!window.__rppRecognitionTerms){
    window.__rppRecognitionTerms=true;
    const nativeFetch=window.fetch.bind(window);
    window.fetch=async(input,init)=>{
      const response=await nativeFetch(input,init);
      const u=typeof input==='string'?input:(input?.url||'');
      if(/\\/api\\/(?:auth\\/request|auth\\/verify|edit-code\\/login|me\\/story)/.test(u))schedule();
      return response;
    };
  }
  document.addEventListener('click',e=>{
    const target=e.target?.closest?.('#send,#verify,#rppCheckpointContinue');
    if(!target)return;
    schedule();
    if(target.id==='send'){
      [180,420,800].forEach(ms=>setTimeout(()=>{const box=document.getElementById('otpbox'),input=document.getElementById('otp');if(box&&input&&!box.classList.contains('hidden')&&document.activeElement!==input)input.focus({preventScroll:true})},ms));
    }
  },true);
})();
</script>`;

const SUBMISSION_FIX=`<script>
(()=>{
  const text=id=>String(document.getElementById(id)?.value||'').trim();
  const setStatus=(message,cls='')=>{
    const el=document.getElementById('savemsg');if(!el)return;
    el.textContent=message;el.className='note '+cls;
  };
  const deadlineClosed=()=>document.getElementById('deadlineEditor')?.classList.contains('closed');
  const repairControls=()=>{
    document.documentElement.dataset.rppSubmitFix='r27-9';
    const area=document.getElementById('formArea');
    if(area&&!deadlineClosed())area.classList.remove('muted');
    for(const id of ['submit','submitPreview','save','previewBtn']){
      const b=document.getElementById(id);if(b&&!deadlineClosed()){b.disabled=false;b.setAttribute('type','button')}
    }
  };
  const validate=()=>{
    const name=text('name'),title=text('title'),body=text('body');
    if(!name||!title||!body){setStatus('氏名・題名・本文を入力してください。','warn');return false}
    if([...title].length>40){setStatus('題名は40字以内にしてください。','warn');return false}
    const confirm=document.getElementById('confirm');
    if(confirm&&confirm.offsetParent!==null&&!confirm.checked){setStatus('掲載内容の確認にチェックしてください。','warn');return false}
    return true;
  };
  const submit=async(fromPreview)=>{
    repairControls();
    if(deadlineClosed()){setStatus('締切後のため提出できません。','warn');return}
    if(!validate())return;
    try{
      if(fromPreview)document.getElementById('storyPreview')?.classList.add('hidden');
      if(typeof saveServer!=='function')throw new Error('提出処理を読み込めませんでした。ページを更新してもう一度お試しください。');
      const ok=await saveServer('submitted');
      if(!ok)return;
      const badge=document.getElementById('statusBadge');if(badge)badge.textContent='提出済';
    }catch(e){setStatus(e?.message||'提出できませんでした。もう一度お試しください。','warn')}
  };
  document.addEventListener('click',e=>{
    const btn=e.target?.closest?.('#submit,#submitPreview');if(!btn)return;
    e.preventDefault();e.stopImmediatePropagation();
    submit(btn.id==='submitPreview');
  },true);
  for(const id of ['name','title','body']){
    const el=document.getElementById(id);if(!el||el.dataset.rppSubmitInput==='1')continue;
    el.dataset.rppSubmitInput='1';
    el.addEventListener('input',()=>{
      const msg=document.getElementById('savemsg');
      if(msg&&msg.textContent.includes('氏名・題名・本文を入力してください'))msg.textContent='';
      repairControls();
    });
  }
  const run=()=>{repairControls();setTimeout(repairControls,150);setTimeout(repairControls,600)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  addEventListener('pageshow',run);document.addEventListener('visibilitychange',()=>{if(!document.hidden)run()});
})();
</script>`;

function inject(response){
  const headers=new Headers(response.headers);headers.set('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');headers.delete('Content-Length');
  return new HTMLRewriter()
    .on('html',{element(el){el.setAttribute('data-rpp-reedit','r27');el.setAttribute('data-rpp-author-clarity','r27-9');el.setAttribute('data-rpp-submit-fix','r27-9')}})
    .on('body',{element(el){el.append(REEDIT_NO_RELOAD,{html:true});el.append(AUTHOR_CLARITY,{html:true});el.append(SUBMISSION_FIX,{html:true})}})
    .transform(new Response(response.body,{status:response.status,statusText:response.statusText,headers}));
}

export default{
  async fetch(request,env,ctx){
    const url=new URL(request.url),path=url.pathname.replace(/\/$/,'')||'/';
    const response=await app.fetch(request,env,ctx),type=response.headers.get('content-type')||'';
    if(type.includes('text/html')&&['/author','/author.html'].includes(path))return inject(response);
    return response;
  }
};
