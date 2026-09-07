import app from './faithful-cover-v11-r16.js';

const ADMIN_MAIL_R17=`
<script>
(()=>{
  const el=id=>document.getElementById(id);
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
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
  async function saveAndVerify(requireKey=false){
    const key=(el('brevoKey')?.value||'').trim();
    const sender=(el('senderEmail')?.value||'').trim();
    const name=(el('senderName')?.value||'ROAD TO PEACE PRIDE').trim();
    if(!sender)throw new Error('送信元メールアドレスを入力してください。');
    if(key){
      show('Brevo APIキーを暗号化保存中…');
      await api('/api/admin/email-settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({api_key:key,sender_email:sender,sender_name:name})});
      const verify=await api('/api/admin/email-settings');
      if(!verify.configured)throw new Error('APIキーの保存を確認できませんでした。');
      if(el('brevoKey'))el('brevoKey').value='';
      show('Brevo APIキー保存確認済み（'+(verify.source||'encrypted-d1')+'）','ok');
      return verify;
    }
    const current=await api('/api/admin/email-settings');
    if(!current.configured){
      if(requireKey)throw new Error('Brevo APIキーを入力してください。');
      throw new Error('Brevo APIキーがまだ保存されていません。');
    }
    return current;
  }
  async function doSave(btn){
    btn.disabled=true;
    try{const d=await saveAndVerify(true);show('メール送信設定済（'+(d.source||'encrypted-d1')+'）','ok')}
    catch(e){show('メール設定の保存に失敗しました：'+e.message)}
    finally{btn.disabled=false}
  }
  async function doTest(btn){
    const to=(el('testTo')?.value||'').trim();
    if(!to){show('テスト送信先を入力してください。');return}
    btn.disabled=true;
    try{
      await saveAndVerify(true);
      show('APIキー保存確認済み。Brevoへテスト送信中…');
      const d=await api('/api/admin/email-test',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({to})});
      show(eventText(d),!!d.deliveryVerified);
      if(!d.deliveryVerified&&d.accepted){
        await sleep(2500);
        const r=await api('/api/admin/email-delivery?email='+encodeURIComponent(to));
        show(eventText(r),!!r.deliveryVerified);
      }
    }catch(e){show('認証メール処理に失敗しました：'+e.message)}
    finally{btn.disabled=false}
  }
  function mark(){
    if(el('r17MailFix'))return;
    const actions=el('testMail')?.closest('.actions');if(!actions)return;
    const n=document.createElement('div');n.id='r17MailFix';n.className='note';n.style.marginTop='10px';n.style.fontWeight='700';
    n.textContent='MAIL FIX r17｜APIキー保存確認後にBrevo送信します';
    actions.insertAdjacentElement('afterend',n);
  }
  document.addEventListener('click',e=>{
    const btn=e.target?.closest?.('#saveMail,#testMail');if(!btn)return;
    e.preventDefault();e.stopImmediatePropagation();
    if(btn.id==='saveMail')doSave(btn);else doTest(btn);
  },true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mark,{once:true});else mark();
  setTimeout(mark,200);
})();
</script>`;

function injectAdmin(response){
  const headers=new Headers(response.headers);headers.set('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');headers.set('Pragma','no-cache');
  const transformed=new HTMLRewriter().on('body',{element(el){el.append(ADMIN_MAIL_R17,{html:true})}}).transform(new Response(response.body,{status:response.status,statusText:response.statusText,headers}));
  return transformed;
}

export default{
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx),url=new URL(request.url),path=url.pathname.replace(/\/$/,'');
    const type=response.headers.get('content-type')||'';
    if(type.includes('text/html')&&['/admin','/admin.html'].includes(path))return injectAdmin(response);
    return response;
  }
};
