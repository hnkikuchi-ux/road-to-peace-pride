import app from './faithful-cover-v11-r27.js';

const REEDIT_FIX=`<style id="rppReeditFixR28">
body.rpp-author-r5 #rppEditLogin .rpp-r28-email-field{margin-top:16px!important}
body.rpp-author-r5 #rppEditLogin .rpp-r28-email-field label{font-weight:650!important;color:#263650!important}
body.rpp-author-r5 #rppEditLogin #rppEditEmail{font-size:16px!important}
body.rpp-author-r5 #rppEditLogin #rppEditLoginBtn{touch-action:manipulation!important}
</style>
<script>
(()=>{
  const clean=v=>String(v||'').trim().toLowerCase();
  const digits=v=>String(v||'').replace(/\\D/g,'').slice(0,6);
  const msg=(t)=>{const el=document.getElementById('rppEditMsg');if(el)el.textContent=t};
  const safeJson=async r=>{try{return await r.clone().json()}catch{return {}}};

  async function editLogin(btn){
    const localEmail=document.getElementById('rppEditEmail');
    const topEmail=document.getElementById('email');
    const codeInput=document.getElementById('rppEditCode');
    const mail=clean(localEmail?.value||topEmail?.value);
    const code=digits(codeInput?.value);
    if(!/^\\S+@\\S+\\.\\S+$/.test(mail)||code.length!==6){
      msg('登録メールアドレスと6桁の認識コードを入力してください。');
      return;
    }
    if(btn)btn.disabled=true;
    msg('確認しています…');
    try{
      const r=await fetch('/api/edit-code/login',{
        method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',
        body:JSON.stringify({email:mail,code})
      });
      const d=await safeJson(r);
      if(!r.ok){msg(d.error||'メールアドレスまたは6桁の認識コードを確認してください。');return}
      if(topEmail)topEmail.value=mail;
      try{email=mail}catch{}
      msg('認証しました。以前の原稿を開きます。');
      if(typeof openEditor!=='function')throw new Error('原稿画面を開く準備ができていません。');
      const ok=await openEditor();
      if(!ok)throw new Error('以前の原稿を開けませんでした。');
      const editor=document.getElementById('editor');
      if(!editor||editor.classList.contains('hidden'))throw new Error('原稿画面を表示できませんでした。');
      editor.scrollIntoView({block:'start'});
    }catch(e){msg(e?.message||'通信できませんでした。もう一度お試しください。')}
    finally{if(btn)btn.disabled=false}
  }

  function install(){
    document.documentElement.dataset.rppReeditFix='r28';
    const box=document.getElementById('rppEditLogin');
    const code=document.getElementById('rppEditCode');
    if(!box||!code)return;
    box.classList.remove('hidden');box.setAttribute('aria-hidden','false');

    let field=document.getElementById('rppEditEmailField');
    if(!field){
      field=document.createElement('div');
      field.id='rppEditEmailField';field.className='field rpp-r28-email-field';
      field.innerHTML='<label for="rppEditEmail">登録メールアドレス</label><input id="rppEditEmail" type="email" inputmode="email" autocomplete="email" placeholder="登録したメールアドレス">';
      code.closest('.field')?.insertAdjacentElement('beforebegin',field);
    }
    const editEmail=document.getElementById('rppEditEmail');
    const topEmail=document.getElementById('email');
    if(editEmail&&topEmail&&!editEmail.value&&topEmail.value)editEmail.value=topEmail.value;
    if(editEmail&&!editEmail.dataset.r28Sync){
      editEmail.dataset.r28Sync='1';
      editEmail.addEventListener('input',()=>{if(topEmail)topEmail.value=editEmail.value});
    }

    code.maxLength=6;code.setAttribute('inputmode','numeric');code.setAttribute('pattern','[0-9]{6}');
    code.placeholder='保存している6桁の認識コード';
    const label=code.closest('.field')?.querySelector('label');if(label)label.textContent='6桁の認識コード';
    const note=box.querySelector('.rpp-code-note');if(note)note.textContent='登録メールアドレスと、初回に保存した6桁の認識コードを入力してください。メールの再送は不要です。';

    let btn=document.getElementById('rppEditLoginBtn');
    if(btn&&btn.dataset.r28Bound!=='1'){
      const fresh=btn.cloneNode(true);
      fresh.dataset.r27Bound='direct';
      fresh.dataset.r28Bound='1';
      fresh.type='button';fresh.disabled=false;fresh.textContent='以前の原稿を編集する';
      btn.replaceWith(fresh);btn=fresh;
      btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();editLogin(btn)});
    }
  }

  const run=()=>{install();setTimeout(install,120);setTimeout(install,500);setTimeout(install,1400);setTimeout(install,2200)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  addEventListener('pageshow',run);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)install()});
  document.addEventListener('click',e=>{if(e.target?.closest?.('#logout'))setTimeout(run,80)},true);
})();
</script>`;

function inject(response){
  const headers=new Headers(response.headers);
  headers.set('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');headers.delete('Content-Length');
  return new HTMLRewriter()
    .on('html',{element(el){el.setAttribute('data-rpp-reedit-fix','r28')}})
    .on('body',{element(el){el.append(REEDIT_FIX,{html:true})}})
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
