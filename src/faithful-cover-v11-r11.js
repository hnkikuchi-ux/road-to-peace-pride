import app from './faithful-cover-v11-r10.js';

const enc=new TextEncoder();
let schemaReady;

function json(data,status=200,headers={}){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}})}
function emailOf(v){return String(v||'').trim().toLowerCase()}
function randomHex(bytes=32){const b=new Uint8Array(bytes);crypto.getRandomValues(b);return Array.from(b,x=>x.toString(16).padStart(2,'0')).join('')}
function random6(){const b=new Uint32Array(1);crypto.getRandomValues(b);return String(b[0]%1000000).padStart(6,'0')}
async function sha256(v){const b=await crypto.subtle.digest('SHA-256',enc.encode(String(v)));return Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('')}
function pepper(env){return String(env.EDIT_CODE_PEPPER||env.OTP_PEPPER||env.SETUP_KEY||'')}
function authorCookie(token,maxAge=43200){return `rpp_author=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`}
async function ensureSchema(env){
  if(!schemaReady)schemaReady=env.DB.exec(`
    CREATE TABLE IF NOT EXISTS rpp_sessions(token_hash TEXT PRIMARY KEY,kind TEXT NOT NULL,subject TEXT,expires_at TEXT NOT NULL,created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS rpp_edit_codes(email TEXT PRIMARY KEY,code_hash TEXT NOT NULL,salt TEXT NOT NULL,attempts INTEGER NOT NULL DEFAULT 0,locked_until TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
  `);
  return schemaReady;
}
async function replaceWith6(env,email){
  await ensureSchema(env);
  const p=pepper(env);if(!p)throw new Error('EDIT_CODE_SECRET_MISSING');
  const code=random6(),salt=randomHex(16),hash=await sha256(`${email}:${salt}:${code}:${p}`),now=new Date().toISOString();
  await env.DB.prepare('INSERT INTO rpp_edit_codes(email,code_hash,salt,attempts,locked_until,created_at,updated_at) VALUES(?,?,?,0,NULL,?,?) ON CONFLICT(email) DO UPDATE SET code_hash=excluded.code_hash,salt=excluded.salt,attempts=0,locked_until=NULL,updated_at=excluded.updated_at').bind(email,hash,salt,now,now).run();
  return code;
}
async function createSession(env,email,maxAge=43200){
  const token=randomHex(32),hash=await sha256(token),now=new Date(),expires=new Date(now.getTime()+maxAge*1000).toISOString();
  await env.DB.prepare('INSERT INTO rpp_sessions(token_hash,kind,subject,expires_at,created_at) VALUES(?,?,?,?,?)').bind(hash,'author',email,expires,now.toISOString()).run();
  return token;
}
async function handleSixLogin(request,env){
  await ensureSchema(env);const p=pepper(env);if(!p)return json({error:'承認コードの保護キーが未設定です。'},503);
  const b=await request.json().catch(()=>({})),email=emailOf(b.email),code=String(b.code||'').replace(/\D/g,'');
  if(!/^\S+@\S+\.\S+$/.test(email)||code.length!==6)return json({error:'メールアドレスと6桁の承認コードを確認してください。'},400);
  const row=await env.DB.prepare('SELECT * FROM rpp_edit_codes WHERE email=?').bind(email).first();
  if(!row)return json({error:'承認コードがまだ発行されていません。まずメール認証を行ってください。'},404);
  if(row.locked_until&&Date.parse(row.locked_until)>Date.now())return json({error:'認証試行が続いたため一時的にロックしています。15分ほど待ってからお試しください。'},429);
  const got=await sha256(`${email}:${row.salt}:${code}:${p}`);
  if(got!==row.code_hash){
    let attempts=Number(row.attempts||0)+1,locked=null;
    if(attempts>=8){attempts=0;locked=new Date(Date.now()+15*60*1000).toISOString()}
    await env.DB.prepare('UPDATE rpp_edit_codes SET attempts=?,locked_until=?,updated_at=? WHERE email=?').bind(attempts,locked,new Date().toISOString(),email).run();
    return json({error:locked?'認証試行が続いたため15分間ロックしました。':'6桁の承認コードを確認してください。'},locked?429:401);
  }
  await env.DB.prepare('UPDATE rpp_edit_codes SET attempts=0,locked_until=NULL,updated_at=? WHERE email=?').bind(new Date().toISOString(),email).run();
  const token=await createSession(env,email,43200);
  return json({ok:true,email},200,{'Set-Cookie':authorCookie(token,43200)});
}

const SIX_UI=`
<script>
(()=>{
  const apply=()=>{
    const code=document.getElementById('rppEditCode');
    if(!code)return false;
    const old=sessionStorage.getItem('rpp_latest_edit_code');if(old&&!/^\\d{6}$/.test(old))sessionStorage.removeItem('rpp_latest_edit_code');
    code.maxLength=6;code.placeholder='6桁の承認コード';code.setAttribute('inputmode','numeric');
    const field=code.closest('.field');const label=field&&field.querySelector('label');if(label)label.textContent='承認コード（6桁）';
    const guide=document.querySelector('.rpp-author-guide');if(guide)guide.innerHTML='<b>🔑 6桁の承認コードについて</b><br>初回のメール認証後に、あなた専用の6桁コードを発行します。この同じコードを、提出後の再編集でも使います。スクリーンショットやメモで保存してください。';
    const note=document.querySelector('#auth > .note');if(note)note.textContent='初回はメールに届く確認コードで本人確認します。認証後に、再編集にも使う固定6桁コードを発行します。';
    const msg=document.querySelector('#rppEditLogin .rpp-code-note');if(msg)msg.textContent='この6桁コードは繰り返し使えます。紛失した場合は、登録メールアドレスで本人確認して新しい6桁コードを再発行できます。';
    const btn=document.getElementById('rppEditLoginBtn');
    if(btn&&!btn.dataset.sixBound){
      btn.dataset.sixBound='1';
      btn.onclick=async()=>{
        const email=(document.getElementById('email')?.value||'').trim();
        const val=(document.getElementById('rppEditCode')?.value||'').replace(/\\D/g,'');
        const out=document.getElementById('rppEditMsg');
        if(!email||val.length!==6){if(out)out.textContent='メールアドレスと6桁の承認コードを入力してください。';return}
        btn.disabled=true;
        try{
          const r=await fetch('/api/edit-code/login',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({email,code:val})});
          const d=await r.json();
          if(!r.ok){if(out)out.textContent=d.error||'6桁の承認コードを確認してください。';return}
          if(out)out.textContent='認証しました。原稿を開きます。';location.reload();
        }catch(e){if(out)out.textContent='通信できませんでした。'}finally{btn.disabled=false}
      };
    }
    document.querySelectorAll('.rpp-edit-code-value').forEach(el=>{const v=el.textContent.replace(/\\D/g,'');if(v.length===6)el.textContent=v.slice(0,3)+' '+v.slice(3)});
    return true;
  };
  const run=()=>{apply();setTimeout(apply,120);setTimeout(apply,500);setTimeout(apply,1200)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  new MutationObserver(()=>apply()).observe(document.documentElement,{subtree:true,childList:true});
})();
</script>`;
function inject(response){return new HTMLRewriter().on('body',{element(el){el.append(SIX_UI,{html:true})}}).transform(response)}

export default {
  async fetch(request,env,ctx){
    const url=new URL(request.url),path=url.pathname.replace(/\/$/,'')||'/';
    if(path==='/api/edit-code/login'&&request.method==='POST')return handleSixLogin(request,env);
    if(path==='/api/auth/verify'&&request.method==='POST'){
      let payload={};try{payload=await request.clone().json()}catch(e){}
      const response=await app.fetch(request,env,ctx);if(!response.ok)return response;
      let data={};try{data=await response.clone().json()}catch(e){return response}
      const email=emailOf(data.email||payload.email);
      if(email&&data.editCode){
        try{
          const code=await replaceWith6(env,email);
          const headers=new Headers(response.headers);headers.set('Content-Type','application/json; charset=utf-8');headers.set('Cache-Control','no-store');
          data.editCode=code;data.editCodeDigits=6;data.editCodePersistent=true;
          return new Response(JSON.stringify(data),{status:response.status,headers});
        }catch(e){if(String(e?.message)==='EDIT_CODE_SECRET_MISSING')return json({error:'承認コードの保護キーが未設定です。管理者にご連絡ください。'},503);return json({error:'6桁の承認コードを発行できませんでした。'},500)}
      }
      return response;
    }
    const response=await app.fetch(request,env,ctx),type=response.headers.get('content-type')||'';
    if(type.includes('text/html')&&['/author','/author.html'].includes(path))return inject(response);
    return response;
  }
};
