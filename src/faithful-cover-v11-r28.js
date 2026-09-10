import app from './faithful-cover-v11-r27.js';

const REEDIT_FIX=`<style id="rppReeditFixR28">
body.rpp-author-r5 #rppEditLogin .rpp-r28-email-field{margin-top:16px!important}
body.rpp-author-r5 #rppEditLogin .rpp-r28-email-field label{font-weight:650!important;color:#263650!important}
body.rpp-author-r5 #rppEditLogin #rppEditEmail{font-size:16px!important}
body.rpp-author-r5 #rppEditLogin #rppEditLoginBtn{touch-action:manipulation!important}
body.rpp-author-r5 #rppEditMsg.rpp-r28-error{margin-top:10px;padding:12px;border-left:3px solid #c69b3c;background:#fff7df;color:#654d18!important}
body.rpp-author-r5 #rppReissueBox{margin-top:12px;padding:14px;border:1px solid rgba(151,119,45,.34);background:rgba(255,249,232,.72)}
body.rpp-author-r5 #rppReissueBox .rpp-r28-reissue-help{font-size:12px;line-height:1.7;color:#59616d;margin:0 0 10px}
body.rpp-author-r5 #rppReissueBtn,body.rpp-author-r5 #rppReissueVerify{width:100%;min-height:46px;touch-action:manipulation}
body.rpp-author-r5 #rppSubmitSuccessR28{display:none;margin:16px 0 4px;padding:18px 16px;border:2px solid #d8b866;background:linear-gradient(135deg,rgba(216,184,102,.20),rgba(239,217,141,.08));color:#fff4cc;text-align:center;line-height:1.7}
body.rpp-author-r5 #rppSubmitSuccessR28.rpp-show{display:block}
body.rpp-author-r5 #rppSubmitSuccessR28 b{display:block;font-size:19px;color:#ffe69b;margin-bottom:4px}
body.rpp-author-r5 #rppSubmitSuccessR28 span{font-size:12px;color:#e8e0c9}
</style>
<script>
(()=>{
  const clean=v=>String(v||'').trim().toLowerCase();
  const digits=v=>String(v||'').replace(/\\D/g,'').slice(0,6);
  const safeJson=async r=>{try{return await r.clone().json()}catch{return {}}};
  const msg=(t,error=false)=>{const el=document.getElementById('rppEditMsg');if(el){el.textContent=t;el.classList.toggle('rpp-r28-error',!!error)}};

  function topEmailValue(){return clean(document.getElementById('rppEditEmail')?.value||document.getElementById('email')?.value)}
  function syncEmail(mail){const top=document.getElementById('email'),local=document.getElementById('rppEditEmail');if(top)top.value=mail;if(local)local.value=mail;try{email=mail}catch{}}

  async function openExisting(mail){
    syncEmail(mail);
    if(typeof openEditor!=='function')throw new Error('原稿画面を開く準備ができていません。');
    const ok=await openEditor();
    if(!ok)throw new Error('以前の原稿を開けませんでした。');
    const editor=document.getElementById('editor');
    if(!editor||editor.classList.contains('hidden'))throw new Error('原稿画面を表示できませんでした。');
    editor.scrollIntoView({block:'start'});
  }

  async function editLogin(btn){
    const mail=topEmailValue(),code=digits(document.getElementById('rppEditCode')?.value);
    if(!/^\\S+@\\S+\\.\\S+$/.test(mail)||code.length!==6){msg('登録メールアドレスと6桁の認識コードを入力してください。',true);return}
    if(btn)btn.disabled=true;msg('確認しています…');
    try{
      const r=await fetch('/api/edit-code/login',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({email:mail,code})});
      const d=await safeJson(r);
      if(!r.ok){
        msg('認識コードが現在の登録と一致しません。保存したコードが使えない場合は、下の「認識コードを再発行する」から同じメールアドレスで再認証してください。既存の原稿が開き、新しい原稿は作成されません。',true);
        const re=document.getElementById('rppReissueBox');if(re)re.classList.remove('hidden');
        return;
      }
      msg('認証しました。以前の原稿を開きます。');
      await openExisting(mail);
    }catch(e){msg(e?.message||'通信できませんでした。もう一度お試しください。',true)}
    finally{if(btn)btn.disabled=false}
  }

  async function requestReissue(btn){
    const mail=topEmailValue();
    if(!/^\\S+@\\S+\\.\\S+$/.test(mail)){msg('登録メールアドレスを入力してください。',true);return}
    if(btn)btn.disabled=true;msg('新しい認識コードを送信しています…');
    try{
      const r=await fetch('/api/auth/request',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({email:mail})});
      const d=await safeJson(r);
      if(!r.ok)throw new Error(d.error||'認識コードを送信できませんでした。');
      syncEmail(mail);
      const box=document.getElementById('rppReissueBox');if(box)box.classList.remove('hidden');
      const input=document.getElementById('rppReissueCode');if(input){input.value='';input.focus({preventScroll:true})}
      msg('新しい6桁の認識コードをメールに送りました。下に入力してください。');
    }catch(e){msg(e?.message||'通信できませんでした。',true)}finally{if(btn)btn.disabled=false}
  }

  async function verifyReissue(btn){
    const mail=topEmailValue(),code=digits(document.getElementById('rppReissueCode')?.value);
    if(!/^\\S+@\\S+\\.\\S+$/.test(mail)||code.length!==6){msg('メールに届いた6桁の認識コードを入力してください。',true);return}
    if(btn)btn.disabled=true;msg('新しい認識コードを確認しています…');
    try{
      const r=await fetch('/api/auth/verify',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({email:mail,code,resetEditCode:true})});
      const d=await safeJson(r);
      if(!r.ok)throw new Error(d.error||'認識できませんでした。');
      syncEmail(mail);
      msg('認証しました。この6桁の認識コードを今後の再編集にも使えます。');
      await openExisting(mail);
    }catch(e){msg(e?.message||'認証できませんでした。',true)}finally{if(btn)btn.disabled=false}
  }

  function installReissue(box){
    let re=document.getElementById('rppReissueBox');
    if(!re){
      re=document.createElement('div');re.id='rppReissueBox';re.className='hidden';
      re.innerHTML='<p class="rpp-r28-reissue-help">保存した6桁の認識コードが使えない場合は、登録メールアドレスへ新しい認識コードを再発行できます。同じメールアドレスで認証すれば、提出済みの原稿をそのまま開きます。</p><button id="rppReissueBtn" type="button" class="btn secondary">認識コードを再発行する</button><div id="rppReissueVerifyBox" class="field"><label for="rppReissueCode">新しい6桁の認識コード</label><input id="rppReissueCode" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="メールに届いた6桁の認識コード"></div><button id="rppReissueVerify" type="button" class="btn primary">新しい認識コードで編集する</button>';
      box.appendChild(re);
    }
    const ri=document.getElementById('rppReissueCode');if(ri&&!ri.dataset.r28Digits){ri.dataset.r28Digits='1';ri.addEventListener('input',()=>{ri.value=digits(ri.value)})}
    const rb=document.getElementById('rppReissueBtn');if(rb&&!rb.dataset.r28Bound){rb.dataset.r28Bound='1';rb.addEventListener('click',e=>{e.preventDefault();requestReissue(rb)})}
    const rv=document.getElementById('rppReissueVerify');if(rv&&!rv.dataset.r28Bound){rv.dataset.r28Bound='1';rv.addEventListener('click',e=>{e.preventDefault();verifyReissue(rv)})}
  }

  function install(){
    document.documentElement.dataset.rppReeditFix='r28';
    const box=document.getElementById('rppEditLogin'),code=document.getElementById('rppEditCode');if(!box||!code)return;
    box.classList.remove('hidden');box.setAttribute('aria-hidden','false');
    let field=document.getElementById('rppEditEmailField');
    if(!field){field=document.createElement('div');field.id='rppEditEmailField';field.className='field rpp-r28-email-field';field.innerHTML='<label for="rppEditEmail">登録メールアドレス</label><input id="rppEditEmail" type="email" inputmode="email" autocomplete="email" placeholder="登録したメールアドレス">';code.closest('.field')?.insertAdjacentElement('beforebegin',field)}
    const editEmail=document.getElementById('rppEditEmail'),topEmail=document.getElementById('email');
    if(editEmail&&topEmail&&!editEmail.value&&topEmail.value)editEmail.value=topEmail.value;
    if(editEmail&&!editEmail.dataset.r28Sync){editEmail.dataset.r28Sync='1';editEmail.addEventListener('input',()=>{if(topEmail)topEmail.value=editEmail.value})}
    code.maxLength=6;code.setAttribute('inputmode','numeric');code.setAttribute('pattern','[0-9]{6}');code.placeholder='保存している6桁の認識コード';
    const label=code.closest('.field')?.querySelector('label');if(label)label.textContent='6桁の認識コード';
    const note=box.querySelector('.rpp-code-note');if(note)note.textContent='登録メールアドレスと、初回に保存した6桁の認識コードを入力してください。メールの再送は不要です。';
    let btn=document.getElementById('rppEditLoginBtn');
    if(btn&&btn.dataset.r28Bound!=='2'){
      const fresh=btn.cloneNode(true);fresh.dataset.r27Bound='direct';fresh.dataset.r28Bound='2';fresh.type='button';fresh.disabled=false;fresh.textContent='以前の原稿を編集する';btn.replaceWith(fresh);btn=fresh;
      btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();editLogin(btn)});
    }
    installReissue(box);
  }

  const run=()=>{install();requestAnimationFrame(install)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  addEventListener('pageshow',run);document.addEventListener('visibilitychange',()=>{if(!document.hidden)install()});
  document.addEventListener('click',e=>{if(e.target?.closest?.('#logout'))requestAnimationFrame(run)},true);
})();
</script>`;

const SUBMIT_CONFIRM=`<script>
(()=>{
  let submitIntentAt=0,submitIntentWasEdit=false;
  function ensureSuccess(){
    const submit=document.getElementById('submit');if(!submit)return null;
    let box=document.getElementById('rppSubmitSuccessR28');
    if(!box){box=document.createElement('div');box.id='rppSubmitSuccessR28';box.setAttribute('role','status');box.setAttribute('aria-live','assertive');box.setAttribute('tabindex','-1');submit.insertAdjacentElement('afterend',box)}
    return box;
  }
  function hideSuccess(){const box=document.getElementById('rppSubmitSuccessR28');if(box)box.classList.remove('rpp-show')}
  function normalizeSaveLabel(){
    const save=document.getElementById('save');if(!save)return;
    if(save.textContent.includes('提出済みのまま'))save.textContent='変更内容を保存';
    if(!save.dataset.r28LabelWatch){
      save.dataset.r28LabelWatch='1';
      new MutationObserver(()=>{if(save.textContent.includes('提出済みのまま'))save.textContent='変更内容を保存'}).observe(save,{subtree:true,childList:true,characterData:true});
    }
  }
  function installIntentHandlers(){
    if(document.documentElement.dataset.r28SubmitIntentBound==='1')return;
    document.documentElement.dataset.r28SubmitIntentBound='1';
    document.addEventListener('click',e=>{
      if(e.target?.closest?.('#submit')){
        submitIntentAt=Date.now();
        submitIntentWasEdit=String(document.getElementById('statusBadge')?.textContent||'').includes('提出済');
        hideSuccess();
      }else if(e.target?.closest?.('#save')){
        submitIntentAt=0;
        hideSuccess();
        setTimeout(normalizeSaveLabel,0);
      }
    },true);
    const editor=document.getElementById('editor');
    if(editor&&!editor.dataset.r28DirtyWatch){editor.dataset.r28DirtyWatch='1';editor.addEventListener('input',hideSuccess,true)}
  }
  function cleanLabels(){
    document.documentElement.dataset.rppSubmissionUx='r28-3';
    normalizeSaveLabel();
    const auth=document.getElementById('auth');
    ensureSuccess();installIntentHandlers();
  }
  function showSuccess(isEdit){
    const box=ensureSuccess();if(!box)return;
    box.innerHTML='<b>✓ '+(isEdit?'変更内容を再提出しました！':'提出が完了しました！')+'</b><span>原稿は正常に保存されています。締切までは再編集できます。</span>';
    box.classList.add('rpp-show');
    box.focus({preventScroll:true});box.scrollIntoView({block:'center',behavior:'smooth'});
    const msg=document.getElementById('savemsg');if(msg){msg.textContent=isEdit?'変更内容を再提出しました。':'提出しました。';msg.className='note ok'}
  }
  const previousFetch=window.fetch.bind(window);
  window.fetch=async(input,init)=>{
    const url=typeof input==='string'?input:(input?.url||'');
    const method=String(init?.method||'GET').toUpperCase();
    let submitted=false;
    if(url.includes('/api/me/story')&&method!=='GET'){
      try{const body=typeof init?.body==='string'?JSON.parse(init.body):null;submitted=body?.status==='submitted'}catch{}
    }
    const response=await previousFetch(input,init);
    const hasFreshSubmitIntent=submitIntentAt>0&&(Date.now()-submitIntentAt)<15000;
    if(submitted&&response.ok&&hasFreshSubmitIntent){
      const wasEdit=submitIntentWasEdit;
      submitIntentAt=0;
      setTimeout(()=>showSuccess(wasEdit),80);
    }
    return response;
  };
  const run=()=>{cleanLabels();requestAnimationFrame(cleanLabels)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  addEventListener('pageshow',run);document.addEventListener('visibilitychange',()=>{if(!document.hidden)cleanLabels()});
})();
</script>`;

function inject(response){
  const headers=new Headers(response.headers);headers.set('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');headers.delete('Content-Length');
  return new HTMLRewriter()
    .on('html',{element(el){el.setAttribute('data-rpp-reedit-fix','r28');el.setAttribute('data-rpp-submission-ux','r28-3')}})
    .on('body',{element(el){el.append(REEDIT_FIX,{html:true});el.append(SUBMIT_CONFIRM,{html:true})}})
    .transform(new Response(response.body,{status:response.status,statusText:response.statusText,headers}));
}

export default{
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx),url=new URL(request.url),type=response.headers.get('content-type')||'';
    const path=url.pathname.replace(/\/$/,'')||'/';
    if(type.includes('text/html')&&['/author','/author.html'].includes(path))return inject(response);
    return response;
  }
};
