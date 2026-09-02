const enc = new TextEncoder();
let schemaReady;

const SAMPLE_STORIES = [
  {id:'sample-1',title:'誓いを胸に、新しい一歩へ',name:'山田 太郎',org:'〇〇総区／〇〇分区',record_date:'2026-09-12',category:'体験談',body:'PEACE PRIDEを目指す挑戦の中で、私は一人の友との対話を重ねました。\n\n思うように進まない日もありましたが、励ましてくださる方々への感謝を胸に、最後まで一歩を踏み出し続けました。\n\n9.12を迎えた時、結果だけではなく、自分自身が逃げずに挑戦し続けたことが大きな財産になったと感じました。これからも、この誓いを忘れず前へ進みます。',has_photo:false},
  {id:'sample-2',title:'仲間と刻んだ挑戦の軌跡',name:'佐藤 健',org:'〇〇総区／△△分区',record_date:'2026-09-12',category:'体験談',body:'一人では越えられない壁も、仲間と声を掛け合うことで乗り越えられることを実感した日々でした。\n\n毎回の活動、対話、練習。その一つ一つが自分の弱さと向き合う時間でもありました。\n\n支えてくださったすべての方への感謝を胸に、次の目標へ挑戦していきます。',has_photo:false},
  {id:'sample-3',title:'希望をつなぐために',name:'鈴木 一郎',org:'〇〇総区／□□分区',record_date:'2026-09-12',category:'決意',body:'今回の挑戦を通して、目の前の一人を大切にすることの意味を改めて学びました。\n\n小さな一歩でも、積み重ねれば必ず未来につながる。そう確信できたことが最大の収穫です。\n\nそして、11.15、11.18へ。新しい決意で出発します。',has_photo:false}
];

function json(data,status=200,extra={}){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra}})}
function text(data,status=200,extra={}){return new Response(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra}})}
function nowIso(){return new Date().toISOString()}
function safeText(v,max=10000){return String(v??'').slice(0,max)}
function cleanEmail(v){return String(v||'').trim().toLowerCase()}
function randomHex(bytes=32){const b=new Uint8Array(bytes);crypto.getRandomValues(b);return Array.from(b,x=>x.toString(16).padStart(2,'0')).join('')}
function randomCode(){const b=new Uint32Array(1);crypto.getRandomValues(b);return String(b[0]%1000000).padStart(6,'0')}
async function sha256(v){const b=await crypto.subtle.digest('SHA-256',enc.encode(String(v)));return Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('')}
function cookieMap(request){const out={};for(const p of (request.headers.get('cookie')||'').split(';')){const i=p.indexOf('=');if(i>0)out[p.slice(0,i).trim()]=decodeURIComponent(p.slice(i+1).trim())}return out}
function sessionCookie(name,token,maxAge){return `${name}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`}
function clearCookie(name){return `${name}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`}
function csvCell(v){const s=String(v??'');return /[",\n\r]/.test(s)?`"${s.replace(/"/g,'""')}"`:s}
function bytesToB64(bytes){let s='';for(let i=0;i<bytes.length;i+=0x8000)s+=String.fromCharCode(...bytes.subarray(i,Math.min(i+0x8000,bytes.length)));return btoa(s)}
function b64ToBytes(s){const raw=atob(s),out=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);return out}

async function ensureSchema(env){
  if(!schemaReady){
    schemaReady=env.DB.exec(`
      CREATE TABLE IF NOT EXISTS rpp_sessions(token_hash TEXT PRIMARY KEY,kind TEXT NOT NULL,subject TEXT,expires_at TEXT NOT NULL,created_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS rpp_otps(email TEXT PRIMARY KEY,code_hash TEXT NOT NULL,expires_at TEXT NOT NULL,sent_at TEXT NOT NULL,attempts INTEGER NOT NULL DEFAULT 0);
      CREATE TABLE IF NOT EXISTS rpp_stories(id TEXT PRIMARY KEY,author_email TEXT NOT NULL UNIQUE,record_date TEXT,soku TEXT,bunku TEXT,honbu TEXT,shibu TEXT,category TEXT,name TEXT,title TEXT,body TEXT,photo_key TEXT,status TEXT NOT NULL DEFAULT 'draft',created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS rpp_settings(key TEXT PRIMARY KEY,value TEXT);
      CREATE INDEX IF NOT EXISTS idx_rpp_stories_status ON rpp_stories(status,updated_at);
      INSERT OR IGNORE INTO rpp_settings(key,value) VALUES('site_mode','preview');
      INSERT OR IGNORE INTO rpp_settings(key,value) VALUES('target_count','300');
      INSERT OR IGNORE INTO rpp_settings(key,value) VALUES('submission_deadline','');
      INSERT OR IGNORE INTO rpp_settings(key,value) VALUES('book_open','true');
      INSERT OR IGNORE INTO rpp_settings(key,value) VALUES('viewer_password_hash','');
      INSERT OR IGNORE INTO rpp_settings(key,value) VALUES('viewer_password_salt','');
      INSERT OR IGNORE INTO rpp_settings(key,value) VALUES('admin_password_hash','');
      INSERT OR IGNORE INTO rpp_settings(key,value) VALUES('admin_password_salt','');
      INSERT OR IGNORE INTO rpp_settings(key,value) VALUES('brevo_api_key_enc','');
      INSERT OR IGNORE INTO rpp_settings(key,value) VALUES('otp_sender_email','');
      INSERT OR IGNORE INTO rpp_settings(key,value) VALUES('otp_sender_name','ROAD TO PEACE PRIDE');
    `);
  }
  return schemaReady;
}
async function settings(env){
  const rows=(await env.DB.prepare('SELECT key,value FROM rpp_settings').all()).results||[];
  const out={site_mode:'preview',target_count:'300',submission_deadline:'',book_open:'true',viewer_password_hash:'',viewer_password_salt:'',admin_password_hash:'',admin_password_salt:'',brevo_api_key_enc:'',otp_sender_email:'',otp_sender_name:'ROAD TO PEACE PRIDE'};
  for(const r of rows)out[r.key]=r.value??'';
  return out;
}
async function putSettings(env,obj){for(const [k,v] of Object.entries(obj))await env.DB.prepare('INSERT INTO rpp_settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind(k,String(v??'')).run()}
function isPreview(env,s){if(String(env.FORCE_PREVIEW||'').toLowerCase()==='true')return true;return (s.site_mode||'preview')!=='production'}
function deadlinePassed(s){const v=String(s.submission_deadline||'').trim();if(!v)return false;const t=Date.parse(v);return Number.isFinite(t)&&Date.now()>t}
function emailConfigured(env,s){return Boolean((env.BREVO_API_KEY&&env.OTP_SENDER_EMAIL)||(s.brevo_api_key_enc&&s.otp_sender_email))}
function publicConfig(env,s){return {preview:isPreview(env,s),siteMode:s.site_mode||'preview',targetCount:Number(s.target_count||300),submissionDeadline:s.submission_deadline||'',deadlinePassed:deadlinePassed(s),bookOpen:String(s.book_open)!=='false',emailConfigured:emailConfigured(env,s),viewerPasswordConfigured:Boolean(env.VIEWER_PASSWORD||s.viewer_password_hash),adminPasswordConfigured:Boolean(env.ADMIN_PASSWORD||env.SETUP_KEY||s.admin_password_hash)}}

async function cryptoKey(env){if(!env.SETUP_KEY)throw new Error('SETUP_KEY is required for encrypted settings');const digest=await crypto.subtle.digest('SHA-256',enc.encode(String(env.SETUP_KEY)));return crypto.subtle.importKey('raw',digest,{name:'AES-GCM'},false,['encrypt','decrypt'])}
async function encryptSecret(env,value){const key=await cryptoKey(env),iv=crypto.getRandomValues(new Uint8Array(12)),cipher=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,enc.encode(String(value))));return `${bytesToB64(iv)}.${bytesToB64(cipher)}`}
async function decryptSecret(env,payload){if(!payload)return '';const [a,b]=String(payload).split('.');if(!a||!b)return '';const key=await cryptoKey(env),iv=b64ToBytes(a),cipher=b64ToBytes(b);const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv},key,cipher);return new TextDecoder().decode(plain)}

async function createSession(env,kind,subject,maxAgeSec){const token=randomHex(32),hash=await sha256(token),expires=new Date(Date.now()+maxAgeSec*1000).toISOString();await env.DB.prepare('INSERT INTO rpp_sessions(token_hash,kind,subject,expires_at,created_at) VALUES(?,?,?,?,?)').bind(hash,kind,subject||null,expires,nowIso()).run();return token}
async function getSession(env,request,kind,cookieName){const token=cookieMap(request)[cookieName];if(!token)return null;return env.DB.prepare('SELECT * FROM rpp_sessions WHERE token_hash=? AND kind=? AND expires_at>?').bind(await sha256(token),kind,nowIso()).first()}
async function deleteSession(env,request,cookieName){const token=cookieMap(request)[cookieName];if(token)await env.DB.prepare('DELETE FROM rpp_sessions WHERE token_hash=?').bind(await sha256(token)).run()}
async function requireAdmin(env,request){return getSession(env,request,'admin','rpp_admin')}

async function resolveMailConfig(env,s){
  if(env.BREVO_API_KEY&&env.OTP_SENDER_EMAIL)return {apiKey:String(env.BREVO_API_KEY),senderEmail:String(env.OTP_SENDER_EMAIL),senderName:String(env.OTP_SENDER_NAME||'ROAD TO PEACE PRIDE')};
  if(s.brevo_api_key_enc&&s.otp_sender_email)return {apiKey:await decryptSecret(env,s.brevo_api_key_enc),senderEmail:s.otp_sender_email,senderName:s.otp_sender_name||'ROAD TO PEACE PRIDE'};
  return null;
}
async function sendOtpEmail(env,s,email,code){
  const cfg=await resolveMailConfig(env,s);if(!cfg)return false;
  const body={sender:{email:cfg.senderEmail,name:cfg.senderName},to:[{email}],subject:'【ROAD TO PEACE PRIDE】認証コード',htmlContent:`<div style="font-family:sans-serif;line-height:1.8"><p>原稿投稿画面の認証コードです。</p><p style="font-size:30px;letter-spacing:.18em;font-weight:700">${code}</p><p>このコードは10分間有効です。</p><p style="color:#777;font-size:12px">ROAD TO PEACE PRIDE / MEMORIAL COLLECTION 2026</p></div>`};
  const r=await fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',headers:{'Content-Type':'application/json','api-key':cfg.apiKey,'accept':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw new Error(`Email service error: ${r.status}`);return true;
}
async function validViewerPassword(env,s,supplied){if(env.VIEWER_PASSWORD)return String(supplied)===String(env.VIEWER_PASSWORD);if(s.viewer_password_hash&&s.viewer_password_salt)return (await sha256(`${s.viewer_password_salt}:${String(supplied)}`))===s.viewer_password_hash;return isPreview(env,s)&&String(supplied)==='demo'}
async function validAdminPassword(env,s,supplied){
  if(s.admin_password_hash&&s.admin_password_salt&&((await sha256(`${s.admin_password_salt}:${String(supplied)}`))===s.admin_password_hash))return true;
  if(env.ADMIN_PASSWORD&&String(supplied)===String(env.ADMIN_PASSWORD))return true;
  if(env.SETUP_KEY&&String(supplied)===String(env.SETUP_KEY))return true;
  return isPreview(env,s)&&String(supplied)==='654321';
}
async function listAdminStories(env){return (await env.DB.prepare('SELECT id,author_email,record_date,soku,bunku,honbu,shibu,category,name,title,body,status,photo_key,created_at,updated_at FROM rpp_stories ORDER BY updated_at DESC').all()).results||[]}

async function api(request,env,path){
  await ensureSchema(env);const s=await settings(env),cfg=publicConfig(env,s),preview=cfg.preview;
  if(Math.random()<0.02){await env.DB.prepare('DELETE FROM rpp_sessions WHERE expires_at<?').bind(nowIso()).run().catch(()=>{});await env.DB.prepare('DELETE FROM rpp_otps WHERE expires_at<?').bind(nowIso()).run().catch(()=>{})}

  if(path==='/api/config'&&request.method==='GET')return json(cfg);
  if(path==='/api/health'&&request.method==='GET'){const row=await env.DB.prepare('SELECT COUNT(*) n FROM rpp_stories').first();return json({ok:true,...cfg,stories:Number(row?.n||0),storageConfigured:Boolean(env.MEDIA),worker:'road-to-peace-pride'})}

  if(path==='/api/viewer/login'&&request.method==='POST'){
    if(!cfg.bookOpen)return json({error:'現在、文集の閲覧を一時停止しています。'},403);const b=await request.json().catch(()=>({}));if(!cfg.viewerPasswordConfigured&&!preview)return json({error:'閲覧パスワードが未設定です。'},503);if(!await validViewerPassword(env,s,b.password))return json({error:'パスワードを確認してください。'},401);const token=await createSession(env,'viewer',null,60*60*24*7);return json({ok:true,preview},200,{'Set-Cookie':sessionCookie('rpp_viewer',token,60*60*24*7)});
  }
  if(path==='/api/viewer/logout'&&request.method==='POST'){await deleteSession(env,request,'rpp_viewer');return json({ok:true},200,{'Set-Cookie':clearCookie('rpp_viewer')})}
  if(path==='/api/stories'&&request.method==='GET'){
    if(!cfg.bookOpen)return json({error:'現在、文集の閲覧を一時停止しています。'},403);if(!await getSession(env,request,'viewer','rpp_viewer'))return json({error:'閲覧認証が必要です。'},401);const rows=(await env.DB.prepare("SELECT id,record_date,soku,bunku,honbu,shibu,category,name,title,body,photo_key,status,updated_at FROM rpp_stories WHERE status='submitted' ORDER BY record_date ASC,updated_at ASC").all()).results||[];if(!rows.length&&preview)return json({stories:SAMPLE_STORIES,preview:true});return json({stories:rows.map(r=>({...r,org:[r.soku,r.bunku,r.honbu,r.shibu].filter(Boolean).join('／'),has_photo:Boolean(r.photo_key),photo_url:r.photo_key?`/api/story-photo/${encodeURIComponent(r.id)}`:null})),preview});
  }
  const photoMatch=path.match(/^\/api\/story-photo\/([^/]+)$/);if(photoMatch&&request.method==='GET'){
    if(!await getSession(env,request,'viewer','rpp_viewer'))return new Response('Unauthorized',{status:401});const row=await env.DB.prepare('SELECT photo_key FROM rpp_stories WHERE id=? AND status=?').bind(decodeURIComponent(photoMatch[1]),'submitted').first();if(!row?.photo_key)return new Response('Not found',{status:404});const obj=await env.MEDIA.getWithMetadata(row.photo_key,'arrayBuffer');if(!obj.value)return new Response('Not found',{status:404});return new Response(obj.value,{headers:{'Content-Type':obj.metadata?.contentType||'image/jpeg','Cache-Control':'private, max-age=300','X-Content-Type-Options':'nosniff'}});
  }

  if(path==='/api/auth/request'&&request.method==='POST'){
    if(cfg.deadlinePassed)return json({error:'現在は原稿受付期間を終了しています。'},403);const b=await request.json().catch(()=>({})),email=cleanEmail(b.email);if(!/^\S+@\S+\.\S+$/.test(email))return json({error:'メールアドレスを確認してください。'},400);const old=await env.DB.prepare('SELECT sent_at FROM rpp_otps WHERE email=?').bind(email).first();if(old?.sent_at&&Date.now()-Date.parse(old.sent_at)<120000)return json({error:'再送は2分ほど待ってから行ってください。'},429);const code=randomCode(),pepper=env.OTP_PEPPER||env.SETUP_KEY||(preview?'preview-pepper':'');if(!pepper)return json({error:'OTP保護キーが未設定です。'},503);const codeHash=await sha256(`${email}:${code}:${pepper}`),expires=new Date(Date.now()+10*60*1000).toISOString();await env.DB.prepare('INSERT INTO rpp_otps(email,code_hash,expires_at,sent_at,attempts) VALUES(?,?,?,?,0) ON CONFLICT(email) DO UPDATE SET code_hash=excluded.code_hash,expires_at=excluded.expires_at,sent_at=excluded.sent_at,attempts=0').bind(email,codeHash,expires,nowIso()).run();let mailed=false;try{mailed=await sendOtpEmail(env,s,email,code)}catch(e){if(!preview)return json({error:'認証メールを送信できませんでした。送信設定を確認してください。'},502)}if(!mailed&&!preview)return json({error:'メール送信サービスが未設定です。'},503);return json({ok:true,preview,previewCode:preview&&!mailed?code:undefined});
  }
  if(path==='/api/auth/verify'&&request.method==='POST'){
    if(cfg.deadlinePassed)return json({error:'現在は原稿受付期間を終了しています。'},403);const b=await request.json().catch(()=>({})),email=cleanEmail(b.email),code=String(b.code||'').trim(),row=await env.DB.prepare('SELECT * FROM rpp_otps WHERE email=?').bind(email).first();if(!row||Date.parse(row.expires_at)<Date.now())return json({error:'認証コードの有効期限が切れています。'},401);if(Number(row.attempts||0)>=6)return json({error:'認証試行回数を超えました。コードを再送してください。'},429);const pepper=env.OTP_PEPPER||env.SETUP_KEY||(preview?'preview-pepper':''),got=await sha256(`${email}:${code}:${pepper}`);if(got!==row.code_hash){await env.DB.prepare('UPDATE rpp_otps SET attempts=attempts+1 WHERE email=?').bind(email).run();return json({error:'認証コードを確認してください。'},401)}await env.DB.prepare('DELETE FROM rpp_otps WHERE email=?').bind(email).run();const token=await createSession(env,'author',email,60*60*24*30);return json({ok:true,email},200,{'Set-Cookie':sessionCookie('rpp_author',token,60*60*24*30)});
  }
  if(path==='/api/auth/logout'&&request.method==='POST'){await deleteSession(env,request,'rpp_author');return json({ok:true},200,{'Set-Cookie':clearCookie('rpp_author')})}
  if(path==='/api/me/story'){
    const session=await getSession(env,request,'author','rpp_author');if(!session)return json({error:'投稿者認証が必要です。'},401);const email=session.subject;if(request.method==='GET'){const row=await env.DB.prepare('SELECT * FROM rpp_stories WHERE author_email=?').bind(email).first();return json({story:row||null,email,...cfg})}if(request.method==='PUT'){if(cfg.deadlinePassed)return json({error:'原稿受付期間を終了しているため保存できません。'},403);const b=await request.json().catch(()=>({})),title=safeText(b.title,100),body=safeText(b.body,10000),name=safeText(b.name,200),status=b.status==='submitted'?'submitted':'draft';if([...title].length>40)return json({error:'題名は40字以内です。'},400);if(status==='submitted'&&(!name||!title||!body))return json({error:'氏名・題名・本文を入力してください。'},400);const old=await env.DB.prepare('SELECT id,created_at,photo_key FROM rpp_stories WHERE author_email=?').bind(email).first(),id=old?.id||crypto.randomUUID(),created=old?.created_at||nowIso(),updated=nowIso();await env.DB.prepare(`INSERT INTO rpp_stories(id,author_email,record_date,soku,bunku,honbu,shibu,category,name,title,body,photo_key,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(author_email) DO UPDATE SET record_date=excluded.record_date,soku=excluded.soku,bunku=excluded.bunku,honbu=excluded.honbu,shibu=excluded.shibu,category=excluded.category,name=excluded.name,title=excluded.title,body=excluded.body,status=excluded.status,updated_at=excluded.updated_at`).bind(id,email,safeText(b.record_date,20),safeText(b.soku,100),safeText(b.bunku,100),safeText(b.honbu,100),safeText(b.shibu,100),safeText(b.category,30),name,title,body,old?.photo_key||null,status,created,updated).run();return json({ok:true,story:await env.DB.prepare('SELECT * FROM rpp_stories WHERE author_email=?').bind(email).first(),...cfg})}
  }
  if(path==='/api/me/photo'&&request.method==='POST'){
    if(cfg.deadlinePassed)return json({error:'原稿受付期間を終了しているため写真を保存できません。'},403);const session=await getSession(env,request,'author','rpp_author');if(!session)return json({error:'投稿者認証が必要です。'},401);const type=request.headers.get('content-type')||'';if(!type.startsWith('image/'))return json({error:'画像ファイルを選んでください。'},400);const bytes=await request.arrayBuffer();if(bytes.byteLength>3*1024*1024)return json({error:'写真は3MB以下にしてください。'},413);const email=session.subject;let row=await env.DB.prepare('SELECT id FROM rpp_stories WHERE author_email=?').bind(email).first();if(!row){const id=crypto.randomUUID(),now=nowIso();await env.DB.prepare('INSERT INTO rpp_stories(id,author_email,status,created_at,updated_at) VALUES(?,?,?,?,?)').bind(id,email,'draft',now,now).run();row={id}}const key=`rpp/${row.id}/main.jpg`;await env.MEDIA.put(key,bytes,{metadata:{contentType:'image/jpeg',storyId:row.id}});await env.DB.prepare('UPDATE rpp_stories SET photo_key=?,updated_at=? WHERE id=?').bind(key,nowIso(),row.id).run();return json({ok:true,hasPhoto:true});
  }

  if(path==='/api/admin/login'&&request.method==='POST'){
    const b=await request.json().catch(()=>({}));if(!await validAdminPassword(env,s,b.password))return json({error:'管理者認証を確認してください。'},401);const token=await createSession(env,'admin','admin',60*60*12);return json({ok:true,preview},200,{'Set-Cookie':sessionCookie('rpp_admin',token,60*60*12)});
  }
  if(path==='/api/admin/logout'&&request.method==='POST'){await deleteSession(env,request,'rpp_admin');return json({ok:true},200,{'Set-Cookie':clearCookie('rpp_admin')})}
  if(path==='/api/admin/stats'&&request.method==='GET'){
    if(!await requireAdmin(env,request))return json({error:'管理者認証が必要です。'},401);const total=await env.DB.prepare('SELECT COUNT(*) n FROM rpp_stories').first(),submitted=await env.DB.prepare("SELECT COUNT(*) n FROM rpp_stories WHERE status='submitted'").first(),draft=await env.DB.prepare("SELECT COUNT(*) n FROM rpp_stories WHERE status='draft'").first(),photos=await env.DB.prepare('SELECT COUNT(*) n FROM rpp_stories WHERE photo_key IS NOT NULL').first();return json({total:Number(total?.n||0),submitted:Number(submitted?.n||0),draft:Number(draft?.n||0),photos:Number(photos?.n||0),...cfg});
  }
  if(path==='/api/admin/stories'&&request.method==='GET'){
    if(!await requireAdmin(env,request))return json({error:'管理者認証が必要です。'},401);const rows=await listAdminStories(env);return json({stories:rows.map(r=>({...r,org:[r.soku,r.bunku,r.honbu,r.shibu].filter(Boolean).join('／'),has_photo:Boolean(r.photo_key)}))});
  }
  if(path==='/api/admin/settings'){
    if(!await requireAdmin(env,request))return json({error:'管理者認証が必要です。'},401);
    if(request.method==='GET'){return json({site_mode:s.site_mode,target_count:Number(s.target_count||300),submission_deadline:s.submission_deadline||'',book_open:String(s.book_open)!=='false',...cfg})}
    if(request.method==='PUT'){
      const b=await request.json().catch(()=>({}));let viewerHash=s.viewer_password_hash||'',viewerSalt=s.viewer_password_salt||'',adminHash=s.admin_password_hash||'',adminSalt=s.admin_password_salt||'';
      if(String(b.viewer_password_new||'').trim()){if(String(b.viewer_password_new).length<8)return json({error:'閲覧パスワードは8文字以上にしてください。'},400);viewerSalt=randomHex(16);viewerHash=await sha256(`${viewerSalt}:${String(b.viewer_password_new)}`)}
      if(String(b.admin_password_new||'').trim()){if(String(b.admin_password_new).length<10)return json({error:'管理者パスワードは10文字以上にしてください。'},400);adminSalt=randomHex(16);adminHash=await sha256(`${adminSalt}:${String(b.admin_password_new)}`)}
      const next={target_count:String(Math.max(1,Math.min(5000,Number(b.target_count||s.target_count||300)))),submission_deadline:safeText(b.submission_deadline??s.submission_deadline,40),book_open:String(b.book_open!==false),site_mode:b.site_mode==='production'?'production':'preview',viewer_password_hash:viewerHash,viewer_password_salt:viewerSalt,admin_password_hash:adminHash,admin_password_salt:adminSalt};
      if(next.site_mode==='production'){const nextS={...s,...next},missing=[];if(!(env.VIEWER_PASSWORD||nextS.viewer_password_hash))missing.push('閲覧パスワード');if(!(env.ADMIN_PASSWORD||env.SETUP_KEY||nextS.admin_password_hash))missing.push('管理者パスワード');if(!emailConfigured(env,nextS))missing.push('メールOTP設定');if(missing.length)return json({error:`本番切替前に設定してください: ${missing.join(' / ')}`},400)}
      await putSettings(env,next);const refreshed=await settings(env);return json({ok:true,...publicConfig(env,refreshed)});
    }
  }
  if(path==='/api/admin/email-settings'){
    if(!await requireAdmin(env,request))return json({error:'管理者認証が必要です。'},401);
    if(request.method==='GET')return json({configured:emailConfigured(env,s),source:(env.BREVO_API_KEY&&env.OTP_SENDER_EMAIL)?'cloudflare-secret':(s.brevo_api_key_enc?'encrypted-d1':'none'),senderEmail:env.OTP_SENDER_EMAIL||s.otp_sender_email||'',senderName:env.OTP_SENDER_NAME||s.otp_sender_name||'ROAD TO PEACE PRIDE'});
    if(request.method==='PUT'){
      const b=await request.json().catch(()=>({}));const senderEmail=cleanEmail(b.sender_email||s.otp_sender_email),senderName=safeText(b.sender_name||s.otp_sender_name||'ROAD TO PEACE PRIDE',100);if(!/^\S+@\S+\.\S+$/.test(senderEmail))return json({error:'送信元メールアドレスを確認してください。'},400);let encrypted=s.brevo_api_key_enc||'';if(String(b.api_key||'').trim())encrypted=await encryptSecret(env,String(b.api_key).trim());if(!encrypted&&!env.BREVO_API_KEY)return json({error:'Brevo APIキーを入力してください。'},400);await putSettings(env,{brevo_api_key_enc:encrypted,otp_sender_email:senderEmail,otp_sender_name:senderName});return json({ok:true,configured:true,senderEmail,senderName});
    }
    if(request.method==='DELETE'){await putSettings(env,{brevo_api_key_enc:'',otp_sender_email:'',otp_sender_name:'ROAD TO PEACE PRIDE'});return json({ok:true})}
  }
  if(path==='/api/admin/email-test'&&request.method==='POST'){
    if(!await requireAdmin(env,request))return json({error:'管理者認証が必要です。'},401);const b=await request.json().catch(()=>({})),to=cleanEmail(b.to);if(!/^\S+@\S+\.\S+$/.test(to))return json({error:'テスト送信先を確認してください。'},400);try{await sendOtpEmail(env,await settings(env),to,'123456');return json({ok:true})}catch(e){return json({error:`テスト送信に失敗しました: ${String(e?.message||e)}`},502)}
  }
  if(path==='/api/admin/export.csv'&&request.method==='GET'){
    if(!await requireAdmin(env,request))return json({error:'管理者認証が必要です。'},401);const rows=await listAdminStories(env),header=['id','author_email','record_date','soku','bunku','honbu','shibu','category','name','title','body','status','has_photo','created_at','updated_at'];const lines=[header.join(','),...rows.map(r=>[r.id,r.author_email,r.record_date,r.soku,r.bunku,r.honbu,r.shibu,r.category,r.name,r.title,r.body,r.status,r.photo_key?'1':'0',r.created_at,r.updated_at].map(csvCell).join(','))];return text('\uFEFF'+lines.join('\r\n'),200,{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="road-to-peace-pride-stories.csv"'});
  }
  if(path==='/api/admin/export.json'&&request.method==='GET'){
    if(!await requireAdmin(env,request))return json({error:'管理者認証が必要です。'},401);const rows=(await env.DB.prepare('SELECT * FROM rpp_stories ORDER BY updated_at DESC').all()).results||[];return text(JSON.stringify({exported_at:nowIso(),settings:{site_mode:s.site_mode,target_count:s.target_count,submission_deadline:s.submission_deadline,book_open:s.book_open},stories:rows},null,2),200,{'Content-Type':'application/json; charset=utf-8','Content-Disposition':'attachment; filename="road-to-peace-pride-backup.json"'});
  }
  const adminPhotoMatch=path.match(/^\/api\/admin\/photo\/([^/]+)$/);if(adminPhotoMatch&&request.method==='GET'){
    if(!await requireAdmin(env,request))return new Response('Unauthorized',{status:401});const row=await env.DB.prepare('SELECT photo_key FROM rpp_stories WHERE id=?').bind(decodeURIComponent(adminPhotoMatch[1])).first();if(!row?.photo_key)return new Response('Not found',{status:404});const obj=await env.MEDIA.getWithMetadata(row.photo_key,'arrayBuffer');if(!obj.value)return new Response('Not found',{status:404});return new Response(obj.value,{headers:{'Content-Type':obj.metadata?.contentType||'image/jpeg','Cache-Control':'private, max-age=60'}});
  }
  return null;
}

export default {
  async fetch(request,env){const url=new URL(request.url),path=url.pathname.replace(/\/$/,'')||'/';try{if(path.startsWith('/api/')){const res=await api(request,env,path);if(res)return res}return env.ASSETS.fetch(request)}catch(e){console.error(e);return json({error:'処理に失敗しました。'},500)}}
};