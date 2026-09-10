import app from './faithful-cover-v11-r26.js';

const REEDIT_NO_RELOAD=`<script>
(()=>{
  const codeTerm=v=>String(v||'');
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
      if(out)out.textContent='認証しました。以前の原稿を開きます。';
      let ok=false;
      if(typeof openEditor==='function')ok=await openEditor();
      else throw new Error('原稿画面を開く準備ができていません。ページを更新してもう一度お試しください。');
      if(!ok)throw new Error('原稿を開けませんでした。');
      const editor=document.getElementById('editor');
      if(!editor||editor.classList.contains('hidden'))throw new Error('原稿画面を表示できませんでした。');
      editor.scrollIntoView({block:'start'});
      queueMicrotask(()=>document.dispatchEvent(new Event('rpp:reedit-opened')));
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
  const run=()=>requestAnimationFrame(mark);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  addEventListener('pageshow',run);
})();
</script>`;

const AUTHOR_CLARITY=`<style id="rppAuthorClarityR27">
/* AUTHOR CLARITY r27.10 — first-time email auth + direct six-digit re-edit */
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
body.rpp-author-r5 #auth .rpp-auth-tabs{display:none!important}
body.rpp-author-r5 #auth #rppEditLogin{
  display:block!important;
  margin:24px 0 6px!important;
  padding:22px 0 0!important;
  border-top:1px solid rgba(151,119,45,.34)!important
}
body.rpp-author-r5 #auth #rppEditLogin:before{
  content:'以前の原稿を編集する';display:block;margin:0 0 4px;
  color:#263650;font-family:ui-serif,"Yu Mincho",serif;font-size:20px;font-weight:600;letter-spacing:.03em
}
body.rpp-author-r5 #auth #rppEditLogin:after{
  content:'初回に保存した6桁の認識コードがあれば、メールの再送は不要です。';display:block;margin:10px 2px 0;
  color:#59616d;font-size:11px;line-height:1.7
}
body.rpp-author-r5 #auth #rppEditLoginBtn{width:100%;min-height:48px}
body.rpp-author-r5 #auth #rppForgotCode{display:none!important}
body.rpp-author-r5 #auth button:disabled{
  opacity:.62!important;color:#665e50!important;-webkit-text-fill-color:#665e50!important
}
body.rpp-author-r5 #auth #send,
body.rpp-author-r5 #auth #verify,
body.rpp-author-r5 #auth #rppEditLoginBtn{
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
  body.rpp-author-r5 #auth #rppEditLogin{margin-top:22px!important;padding-top:20px!important}
}
</style>
<script>
(()=>{
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
    document.documentElement.dataset.rppAuthorClarity='r27-10';
    document.title='私の記録を綴る | ROAD TO PEACE PRIDE';
    const auth=document.getElementById('auth');
    const h1=auth?.querySelector('h1');
    if(h1&&h1.textContent!=='私の記録を綴る')h1.textContent='私の記録を綴る';
    if(!auth||!h1)return;

    document.getElementById('rppEmailFirstHint')?.remove();

    const note=auth.querySelector(':scope > .note');
    if(note){note.id='rppRecognitionHelp';note.textContent='メール認証後に原稿を入力できます。初回に届く6桁の認識コードは、提出後の再編集にも使います。'}

    const firstGuide=document.getElementById('rppFirstTimeGuide');
    const email=document.getElementById('email');
    const emailField=email?.closest?.('.field')||email?.parentElement;
    const send=document.getElementById('send');
    const otpbox=document.getElementById('otpbox');
    const otp=document.getElementById('otp');
    const tabs=auth.querySelector('.rpp-auth-tabs');
    const guide=auth.querySelector('.rpp-author-guide');
    const editBox=document.getElementById('rppEditLogin');
    const editCode=document.getElementById('rppEditCode');
    const editBtn=document.getElementById('rppEditLoginBtn');
    const editMsg=document.getElementById('rppEditMsg');
    const editNote=editBox?.querySelector('.rpp-code-note');
    const authmsg=document.getElementById('authmsg');
    const deadline=document.getElementById('deadlineAuth');

    if(tabs){tabs.classList.add('hidden');tabs.setAttribute('aria-hidden','true')}
    if(editBox){editBox.classList.remove('hidden');editBox.setAttribute('aria-hidden','false')}
    if(email){email.setAttribute('autocomplete','email');email.setAttribute('aria-describedby','rppRecognitionHelp')}
    if(send){send.textContent='認識コードを送信';send.setAttribute('type','button')}
    if(otp){otp.placeholder='6桁の認識コード';otp.setAttribute('aria-label','6桁認識コード');const label=otp.closest('.field')?.querySelector('label');if(label)label.textContent='6桁の認識コード';numericCodeInput(otp,'verify')}
    const verify=document.getElementById('verify');if(verify)verify.setAttribute('type','button');
    if(editCode){editCode.placeholder='保存している6桁の認識コード';editCode.setAttribute('aria-label','保存している6桁認識コード');const label=editCode.closest('.field')?.querySelector('label');if(label)label.textContent='保存している6桁の認識コード';numericCodeInput(editCode,'rppEditLoginBtn')}
    if(editBtn){editBtn.textContent='以前の原稿を編集する';editBtn.setAttribute('type','button')}
    if(editMsg){editMsg.setAttribute('role','status');editMsg.setAttribute('aria-live','polite')}
    if(editNote)editNote.textContent='登録メールアドレスと、初回に保存した6桁の認識コードを入力してください。メールの再送は不要です。';
    if(authmsg){authmsg.setAttribute('role','status');authmsg.setAttribute('aria-live','polite')}
    if(guide)guide.innerHTML='<b>🔑 6桁の認識コードについて</b><br>初回のメール認証で届く6桁の認識コードを、そのまま提出後の再編集にも使用します。スクリーンショットまたはメモで保存してください。';

    const card=document.getElementById('rppEditCodeCard');
    if(card){
      const ch=card.querySelector('h2');if(ch)ch.textContent='あなたの6桁の認識コード';
      const badge=card.querySelector('.rpp-code-saved-badge');if(badge)badge.textContent='再編集にも使う認識コードです';
      const copy=card.querySelector('#rppCopyEditCode');if(copy)copy.textContent='認識コードをコピー';
    }
    const cp=document.getElementById('rppCodeCheckpoint');
    if(cp){
      const kicker=cp.querySelector('.rpp-checkpoint-kicker');if(kicker)kicker.textContent='YOUR 6-DIGIT KEY';
      const title=cp.querySelector('#rppCheckpointTitle');if(title)title.textContent='メールで届いた6桁の認識コードを保存してください';
      const lead=cp.querySelector('.rpp-checkpoint-lead');if(lead)lead.textContent='本人確認で使用した同じ6桁の認識コードです。この認識コードが、あとから原稿を編集するための「鍵」になります。';
      const copy=cp.querySelector('#rppCheckpointCopy');if(copy)copy.textContent='認識コードをコピー';
      const saved=cp.querySelector('.rpp-saved-check span');if(saved)saved.innerHTML='<b>スクリーンショットまたはメモで保存しました</b><br>次回編集するときも、この同じ6桁の認識コードを使用します。';
      const foot=cp.querySelector('.rpp-checkpoint-foot');if(foot)foot.textContent='紛失した場合は、登録メールアドレスへの本人確認で新しい認識コードを再発行できます。';
    }

    const ordered=[firstGuide,emailField,note,send,guide,otpbox,editBox,deadline,authmsg].filter(Boolean);
    let cursor=h1;
    for(const el of ordered){
      if(el===h1)continue;
      cursor.insertAdjacentElement('afterend',el);
      cursor=el;
    }
  };
  const schedule=()=>requestAnimationFrame(apply);
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
    const target=e.target?.closest?.('#send,#verify,#rppCheckpointContinue,#rppEditLoginBtn');
    if(!target)return;
    schedule();
    if(target.id==='send'){
      requestAnimationFrame(()=>{const box=document.getElementById('otpbox'),input=document.getElementById('otp');if(box&&input&&!box.classList.contains('hidden')&&document.activeElement!==input)input.focus({preventScroll:true})});
    }
  },true);
})();
</script>`;

function inject(response){
  const headers=new Headers(response.headers);headers.set('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');headers.delete('Content-Length');
  return new HTMLRewriter()
    .on('html',{element(el){el.setAttribute('data-rpp-reedit','r27');el.setAttribute('data-rpp-author-clarity','r27-10');el.setAttribute('data-rpp-submit-fix','r27-9')}})
    .on('body',{element(el){el.append(REEDIT_NO_RELOAD,{html:true});el.append(AUTHOR_CLARITY,{html:true})}})
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
