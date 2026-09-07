import app from './faithful-cover-v11-r15.js';

const ADMIN_MAIL_AUTOSAVE_PATCH=`
<script>
(()=>{
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const el=id=>document.getElementById(id);
  function show(text,ok=false){const m=el('mailMsg');if(!m)return;m.textContent=text;m.className='msg '+(ok?'ok':'warn')}
  async function api(url,opt={}){
    const r=await fetch(url,{credentials:'same-origin',cache:'no-store',...opt});let d={};
    try{d=await r.json()}catch{}
    if(!r.ok&&r.status!==202)throw new Error(d.error||('HTTP '+r.status));
    return {...d,httpStatus:r.status};
  }
  function eventText(d){
    const e=d.deliveryEvent||{},name=String(e.event||'').toLowerCase(),reason=e.reason?(' / '+e.reason):'';
    if(d.deliveryVerified||name.includes('delivered'))return 'Brevo配信確認：DELIVERED（受信側へ配信済み）';
    if(/blocked|hard.?bounce|invalid|error|spam/.test(name))return 'Brevo配信エラー：'+(e.event||'unknown')+reason;
    if(/deferred|soft.?bounce/.test(name))return 'Brevoで配信遅延：'+(e.event||'pending')+reason;
    if(e.event)return 'Brevo受付済み・配信確認中：'+e.event+reason;
    return 'Brevo受付済みですが、配信イベントはまだ確認できません。';
  }
  async function saveCurrentMailSettings(required=false){
    const key=(el('brevoKey')?.value||'').trim();
    const sender=(el('senderEmail')?.value||'').trim();
    const name=(el('senderName')?.value||'ROAD TO PEACE PRIDE').trim();
    if(!sender){throw new Error('送信元メールアドレスを入力してください。')}
    if(!key){
      const current=await api('/api/admin/email-settings');
      if(current.configured)return current;
      if(required)throw new Error('Brevo APIキーを入力してください。');
      return current;
    }
    show('Brevo APIキーを安全に保存中…');
    const saved=await api('/api/admin/email-settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({api_key:key,sender_email:sender,sender_name:name})});
    if(el('brevoKey'))el('brevoKey').value='';
    show('Brevo APIキーを暗号化保存しました。','ok');
    return saved;
  }
  async function saveMail(){
    const btn=el('saveMail');if(btn)btn.disabled=true;
    try{await saveCurrentMailSettings(true);const d=await api('/api/admin/email-settings');show(d.configured?'メール送信設定済（'+(d.source||'encrypted-d1')+'）':'メール送信は未設定です。',!!d.configured)}
    catch(e){show('メール設定の保存に失敗しました：'+e.message)}
    finally{if(btn)btn.disabled=false}
  }
  async function testMail(){
    const btn=el('testMail'),to=(el('testTo')?.value||'').trim();
    if(!to){show('テスト送信先を入力してください。');return}
    if(btn)btn.disabled=true;
    try{
      await saveCurrentMailSettings(true);
      show('保存確認済み。認証メールを送信し、Brevo配信結果を確認中…');
      const d=await api('/api/admin/email-test',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({to})});
      show(eventText(d),!!d.deliveryVerified);
      if(!d.deliveryVerified&&d.accepted){
        await sleep(2500);
        const r=await api('/api/admin/email-delivery?email='+encodeURIComponent(to));
        show(eventText(r),!!r.deliveryVerified);
      }
    }catch(e){show('認証メール処理に失敗しました：'+e.message)}
    finally{if(btn)btn.disabled=false}
  }
  function install(){
    const save=el('saveMail'),test=el('testMail');
    if(save){save.onclick=saveMail;save.textContent='メール設定を保存'}
    if(test){test.onclick=testMail;test.textContent='認証メールをテスト送信'}
    if(save&&!el('r16MailHint')){
      const n=document.createElement('div');n.id='r16MailHint';n.className='note';n.style.marginTop='10px';
      n.textContent='APIキーを入力したまま「認証メールをテスト送信」を押しても、自動で暗号化保存してから送信します。';
      save.closest('.actions')?.insertAdjacentElement('afterend',n);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  setTimeout(install,300);
})();
</script>`;

function injectAdmin(response){return new HTMLRewriter().on('body',{element(el){el.append(ADMIN_MAIL_AUTOSAVE_PATCH,{html:true})}}).transform(response)}

export default{
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx),url=new URL(request.url),path=url.pathname.replace(/\/$/,'');
    const type=response.headers.get('content-type')||'';
    if(type.includes('text/html')&&['/admin','/admin.html'].includes(path))return injectAdmin(response);
    return response;
  }
};
