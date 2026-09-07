import app from './faithful-cover-v11-r19.js';

const enc=new TextEncoder();
let editSchemaReady;

function cleanEmail(v){return String(v||'').trim().toLowerCase()}
function digits(v){return String(v||'').replace(/\D/g,'')}
function randomHex(bytes=16){const b=new Uint8Array(bytes);crypto.getRandomValues(b);return Array.from(b,x=>x.toString(16).padStart(2,'0')).join('')}
async function sha256(v){const b=await crypto.subtle.digest('SHA-256',enc.encode(String(v)));return Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('')}
function editPepper(env){return String(env.EDIT_CODE_PEPPER||env.OTP_PEPPER||env.SETUP_KEY||'')}
async function ensureEditSchema(env){
  if(!editSchemaReady)editSchemaReady=env.DB.exec(`
    CREATE TABLE IF NOT EXISTS rpp_edit_codes(
      email TEXT PRIMARY KEY,
      code_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      locked_until TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  return editSchemaReady;
}
async function storeOtpAsEditCode(env,email,code){
  await ensureEditSchema(env);
  const p=editPepper(env);if(!p)throw new Error('EDIT_CODE_SECRET_MISSING');
  const normalized=digits(code);if(normalized.length!==6)throw new Error('EDIT_CODE_INVALID');
  const salt=randomHex(16),hash=await sha256(`${email}:${salt}:${normalized}:${p}`),now=new Date().toISOString();
  await env.DB.prepare('INSERT INTO rpp_edit_codes(email,code_hash,salt,attempts,locked_until,created_at,updated_at) VALUES(?,?,?,0,NULL,?,?) ON CONFLICT(email) DO UPDATE SET code_hash=excluded.code_hash,salt=excluded.salt,attempts=0,locked_until=NULL,updated_at=excluded.updated_at')
    .bind(email,hash,salt,now,now).run();
  return normalized;
}

const AUTHOR_ONE_CODE=`
<style>
/* r20 — one 6-digit code + simplified author header */
#rppAuthorHero{padding:12px 8px 2px!important}
#rppAuthorHero .rpp-author-title,
#rppAuthorHero .rpp-author-sub{display:none!important}
#rppAuthorHero .rpp-author-rule{width:min(210px,55%)!important;margin:10px auto 4px!important}
body.rpp-author-r5 .top{margin-top:0!important;margin-bottom:8px!important}
body.rpp-author-r5 .rpp-author-guide{
  color:#4f432e!important;
  background:linear-gradient(90deg,rgba(196,150,65,.16),rgba(196,150,65,.06))!important;
  border-color:rgba(164,119,36,.40)!important;
}
body.rpp-author-r5 .rpp-author-guide b{color:#795716!important}
body.rpp-author-r5 .rpp-author-step{color:#6f6a61!important;border-top-color:rgba(150,109,34,.25)!important}
body.rpp-author-r5 .rpp-author-step b{color:#a77826!important}
body.rpp-author-r5 .rpp-author-step.active{color:#413a30!important;border-top-color:#b78732!important}
body.rpp-author-r5 #rppEditLogin .rpp-code-note{color:#6f6a61!important}
@media(max-width:560px){#rppAuthorHero{padding:10px 8px 0!important}}
</style>
<script>
(()=>{
  const ONE_CODE_MARK='ONE CODE r20';
  const setText=(el,text)=>{if(el&&el.textContent!==text)el.textContent=text};
  const setHtml=(el,html)=>{if(el&&el.innerHTML!==html)el.innerHTML=html};
  function patch(){
    document.documentElement.dataset.rppOneCode='r20';
    if(document.title!=='私の記録を綴る | ROAD TO PEACE PRIDE')document.title='私の記録を綴る | ROAD TO PEACE PRIDE';
    const hero=document.getElementById('rppAuthorHero');if(hero)hero.dataset.r20=ONE_CODE_MARK;

    const guide=document.querySelector('.rpp-author-guide');
    setHtml(guide,'<b>🔑 6桁コードについて</b><br>初回のメール認証で届く6桁コードを、そのまま提出後の再編集にも使用します。スクリーンショットまたはメモで保存してください。');

    const note=document.querySelector('#auth > .note');
    setText(note,'初回はメールに届く6桁コードで本人確認します。この同じ6桁コードを、提出後の再編集にも使用します。');

    const edit=document.getElementById('rppEditCode');
    if(edit){edit.maxLength=6;edit.placeholder='6桁コード';edit.setAttribute('inputmode','numeric');const label=edit.closest('.field')?.querySelector('label');setText(label,'6桁コード');}
    setText(document.getElementById('rppEditLoginBtn'),'6桁コードで編集する');
    setText(document.querySelector('#rppEditLogin .rpp-code-note'),'初回のメール認証で使用した6桁コードを入力してください。紛失した場合は、メール認証で新しい6桁コードを再発行できます。');

    const card=document.getElementById('rppEditCodeCard');
    if(card){setText(card.querySelector('h2'),'あなたの6桁コード');setText(card.querySelector('.rpp-code-saved-badge'),'再編集にも使う6桁コードです');setText(card.querySelector('#rppCopyEditCode'),'6桁コードをコピー');}

    const cp=document.getElementById('rppCodeCheckpoint');
    if(cp){
      setText(cp.querySelector('.rpp-checkpoint-kicker'),'YOUR 6-DIGIT KEY');
      const title=cp.querySelector('#rppCheckpointTitle');setText(title,'メールで届いた6桁コードを保存してください');if(title)title.dataset.r20Title='1';
      setText(cp.querySelector('.rpp-checkpoint-lead'),'本人確認で使用した同じ6桁コードです。このコードが、あとから原稿を編集するための「鍵」になります。');
      setText(cp.querySelector('#rppCheckpointCopy'),'6桁コードをコピー');
      setHtml(cp.querySelector('.rpp-saved-check span'),'<b>スクリーンショットまたはメモで保存しました</b><br>次回編集するときも、この同じ6桁コードを使用します。');
      setText(cp.querySelector('.rpp-checkpoint-foot'),'紛失した場合は、登録メールアドレスへの本人確認で新しい6桁コードを再発行できます。');
    }
  }
  const run=()=>{patch();setTimeout(patch,120);setTimeout(patch,500);setTimeout(patch,1200)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  new MutationObserver(()=>setTimeout(patch,0)).observe(document.body,{childList:true,subtree:true});
})();
</script>`;

function injectAuthor(response){
  const headers=new Headers(response.headers);headers.set('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');
  return new HTMLRewriter().on('body',{element(el){el.append(AUTHOR_ONE_CODE,{html:true})}})
    .transform(new Response(response.body,{status:response.status,statusText:response.statusText,headers}));
}

export default{
  async fetch(request,env,ctx){
    const url=new URL(request.url),path=url.pathname.replace(/\/$/,'')||'/';
    if(path==='/api/auth/verify'&&request.method==='POST'){
      let payload={};try{payload=await request.clone().json()}catch{}
      const response=await app.fetch(request,env,ctx);if(!response.ok)return response;
      const email=cleanEmail(payload.email),code=digits(payload.code);
      if(!/^\S+@\S+\.\S+$/.test(email)||code.length!==6)return response;
      try{
        await storeOtpAsEditCode(env,email,code);
        let data={};try{data=await response.clone().json()}catch{return response}
        const headers=new Headers(response.headers);headers.set('Content-Type','application/json; charset=utf-8');headers.set('Cache-Control','no-store');
        data.editCode=code;
        data.editCodeDigits=6;
        data.editCodePersistent=true;
        data.editCodeSameAsOtp=true;
        data.editCodeCreated=true;
        data.editCodeReset=Boolean(payload.resetEditCode===true);
        return new Response(JSON.stringify(data),{status:response.status,statusText:response.statusText,headers});
      }catch(e){
        console.error('r20 one-code persistence failed',e);
        return new Response(JSON.stringify({error:'6桁コードを再編集用として保存できませんでした。もう一度認証してください。'}),{status:500,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
      }
    }
    const response=await app.fetch(request,env,ctx),type=response.headers.get('content-type')||'';
    if(type.includes('text/html')&&['/author','/author.html'].includes(path))return injectAuthor(response);
    return response;
  }
};
