const enc = new TextEncoder();
let schemaReady;

const SAMPLE_STORIES = [
  {id:'sample-1',title:'誓いを胸に、新しい一歩へ',name:'山田 太郎',org:'〇〇総区／〇〇分区',record_date:'2026-09-12',category:'体験談',body:'PEACE PRIDEを目指す挑戦の中で、私は一人の友との対話を重ねました。\n\n思うように進まない日もありましたが、励ましてくださる方々への感謝を胸に、最後まで一歩を踏み出し続けました。\n\n9.12を迎えた時、結果だけではなく、自分自身が逃げずに挑戦し続けたことが大きな財産になったと感じました。これからも、この誓いを忘れず前へ進みます。',has_photo:false},
  {id:'sample-2',title:'仲間と刻んだ挑戦の軌跡',name:'佐藤 健',org:'〇〇総区／△△分区',record_date:'2026-09-12',category:'体験談',body:'一人では越えられない壁も、仲間と声を掛け合うことで乗り越えられることを実感した日々でした。\n\n毎回の活動、対話、練習。その一つ一つが自分の弱さと向き合う時間でもありました。\n\n支えてくださったすべての方への感謝を胸に、次の目標へ挑戦していきます。',has_photo:false},
  {id:'sample-3',title:'希望をつなぐために',name:'鈴木 一郎',org:'〇〇総区／□□分区',record_date:'2026-09-12',category:'決意',body:'今回の挑戦を通して、目の前の一人を大切にすることの意味を改めて学びました。\n\n小さな一歩でも、積み重ねれば必ず未来につながる。そう確信できたことが最大の収穫です。\n\nそして、11.15、11.18へ。新しい決意で出発します。',has_photo:false}
];

function json(data,status=200,extra={}){
  return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra}});
}
function text(data,status=200,extra={}){return new Response(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra}})}
function nowIso(){return new Date().toISOString()}
async function sha256(value){const b=await crypto.subtle.digest('SHA-256',enc.encode(String(value)));return Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('')}
function randomHex(bytes=32){const b=new Uint8Array(bytes);crypto.getRandomValues(b);return Array.from(b,x=>x.toString(16).padStart(2,'0')).join('')}
function randomCode(){const b=new Uint32Array(1);crypto.getRandomValues(b);return String(b[0]%1000000).padStart(6,'0')}
function cookieMap(request){const out={};for(const p of (request.headers.get('cookie')||'').split(';')){const i=p.indexOf('=');if(i>0)out[p.slice(0,i).trim()]=decodeURIComponent(p.slice(i+1).trim())}return out}
function sessionCookie(name,token,maxAge){return `${name}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`}
function clearCookie(name){return `${name}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`}
function cleanEmail(v){return String(v||'').trim().toLowerCase()}
function safeText(v,max=10000){return String(v??'').slice(0,max)}
function csvCell(v){const s=String(v??'');return /[",\n\r]/.test(s)?`"${s.replace(/"/g,'""')}"`:s}

async function ensureSchema(env){
  if(!schemaReady){
    schemaReady=env.DB.exec(`
      CREATE TABLE IF NOT EXISTS rpp_sessions(
        token_hash TEXT PRIMARY KEY,
        kind TEXT NOT NULL,
        subject TEXT,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS rpp_otps(
        email TEXT PRIMARY KEY,
        code_hash TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        sent_at TEXT NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS rpp_stories(
        id TEXT PRIMARY KEY,
        author_email TEXT NOT NULL UNIQUE,
        record_date TEXT,
        soku TEXT,
        bunku TEXT,
        honbu TEXT,
        shibu TEXT,
        category TEXT,
        name TEXT,
        title TEXT,
        body TEXT,
        photo_key TEXT,
        status TEXT NOT NULL DEFAULT 'draft',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS rpp_settings(
        key TEXT PRIMARY KEY,
        value TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_rpp_stories_status ON rpp_stories(status,updated_at);
      INSERT OR IGNORE INTO rpp_settings(key,value) VALUES('site_mode','preview');
      INSERT OR IGNORE INTO rpp_settings(key,value) VALUES('target_count','300');
      INSERT OR IGNORE INTO rpp_settings(key,value) VALUES('submission_deadline','');
      INSERT OR IGNORE INTO rpp_settings(key,value) VALUES('auto_publish','true');
      INSERT OR IGNORE INTO rpp_settings(key,value) VALUES('book_open','true');
    `);
  }
  return schemaReady;
}

async function settings(env){
  const rows=(await env.DB.prepare('SELECT key,value FROM rpp_settings').all()).results||[];
  const out={site_mode:'preview',target_count:'300',submission_deadline:'',auto_publish:'true',book_open:'true'};
  for(const r of rows)out[r.key]=r.value??'';
  return out;
}
function isPreview(env,s){
  if(String(env.FORCE_PREVIEW||'').toLowerCase()==='true')return true;
  return (s?.site_mode||'preview')!=='production';
}
function deadlinePassed(s){
  const v=String(s?.submission_deadline||'').trim();if(!v)return false;
  const t=Date.parse(v);return Number.isFinite(t)&&Date.now()>t;
}
function publicConfig(env,s){
  const preview=isPreview(env,s);
  return {
    preview,
    siteMode:s.site_mode||'preview',
    targetCount:Number(s.target_count||300),
    submissionDeadline:s.submission_deadline||'',
    deadlinePassed:deadlinePassed(s),
    autoPublish:String(s.auto_publish)!=='false',
    bookOpen:String(s.book_open)!=='false',
    emailConfigured:Boolean(env.BREVO_API_KEY&&env.OTP_SENDER_EMAIL),
    viewerPasswordConfigured:Boolean(env.VIEWER_PASSWORD),
    adminPasswordConfigured:Boolean(env.ADMIN_PASSWORD||env.SETUP_KEY)
  };
}

async function createSession(env,kind,subject,maxAgeSec){
  const token=randomHex(32), tokenHash=await sha256(token), now=Date.now();
  const expires=new Date(now+maxAgeSec*1000).toISOString();
  await env.DB.prepare('INSERT INTO rpp_sessions(token_hash,kind,subject,expires_at,created_at) VALUES(?,?,?,?,?)').bind(tokenHash,kind,subject||null,expires,new Date(now).toISOString()).run();
  return token;
}
async function getSession(env,request,kind,cookieName){
  const token=cookieMap(request)[cookieName];if(!token)return null;
  const hash=await sha256(token);
  return env.DB.prepare('SELECT * FROM rpp_sessions WHERE token_hash=? AND kind=? AND expires_at>?').bind(hash,kind,nowIso()).first();
}
async function deleteSession(env,request,cookieName){const token=cookieMap(request)[cookieName];if(token)await env.DB.prepare('DELETE FROM rpp_sessions WHERE token_hash=?').bind(await sha256(token)).run()}
async function requireAdmin(env,request){return getSession(env,request,'admin','rpp_admin')}

async function sendOtpEmail(env,email,code){
  if(!env.BREVO_API_KEY)return false;
  const senderEmail=env.OTP_SENDER_EMAIL||'';if(!senderEmail)throw new Error('OTP_SENDER_EMAIL is not configured');
  const body={sender:{email:senderEmail,name:env.OTP_SENDER_NAME||'ROAD TO PEACE PRIDE'},to:[{email}],subject:'【ROAD TO PEACE PRIDE】認証コード',htmlContent:`<div style="font-family:sans-serif;line-height:1.8"><p>原稿投稿画面の認証コードです。</p><p style="font-size:30px;letter-spacing:.18em;font-weight:700">${code}</p><p>このコードは10分間有効です。</p></div>`};
  const r=await fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',headers:{'Content-Type':'application/json','api-key':env.BREVO_API_KEY,'accept':'application/json'},body:JSON.stringify(body)});
  if(!r.ok)throw new Error(`Email service error: ${r.status}`);return true;
}

async function listAdminStories(env){
  return (await env.DB.prepare(`SELECT id,author_email,record_date,soku,bunku,honbu,shibu,category,name,title,status,photo_key,created_at,updated_at FROM rpp_stories ORDER BY updated_at DESC`).all()).results||[];
}
async function api(request,env,url,path){
  await ensureSchema(env);const s=await settings(env),cfg=publicConfig(env,s),preview=cfg.preview;

  if(path==='/api/config'&&request.method==='GET')return json(cfg);
  if(path==='/api/health'&&request.method==='GET'){
    const row=await env.DB.prepare('SELECT COUNT(*) n FROM rpp_stories').first();
    return json({ok:true,...cfg,stories:Number(row?.n||0),storageConfigured:Boolean(env.MEDIA)});
  }

  if(path==='/api/viewer/login'&&request.method==='POST'){
    if(!cfg.bookOpen)return json({error:'現在、文集の閲覧を一時停止しています。'},403);
    const body=await request.json().catch(()=>({}));const expected=env.VIEWER_PASSWORD||(preview?'demo':'');
    if(!expected)return json({error:'閲覧パスワードが未設定です。'},503);
    if(String(body.password||'')!==String(expected))return json({error:'パスワードを確認してください。'},401);
    const token=await createSession(env,'viewer',null,60*60*24*7);return json({ok:true,preview},200,{'Set-Cookie':sessionCookie('rpp_viewer',token,60*60*24*7)});
  }
  if(path==='/api/viewer/logout'&&request.method==='POST'){await deleteSession(env,request,'rpp_viewer');return json({ok:true},200,{'Set-Cookie':clearCookie('rpp_viewer')})}
  if(path==='/api/stories'&&request.method==='GET'){
    if(!cfg.bookOpen)return json({error:'現在、文集の閲覧を一時停止しています。'},403);
    if(!await getSession(env,request,'viewer','rpp_viewer'))return json({error:'閲覧認証が必要です。'},401);
    const rows=(await env.DB.prepare("SELECT id,record_date,soku,bunku,honbu,shibu,category,name,title,body,photo_key,status,updated_at FROM rpp_stories WHERE status='submitted' ORDER BY record_date ASC, updated_at ASC").all()).results||[];
    if(!rows.length&&preview)return json({stories:SAMPLE_STORIES,preview:true});
    return json({stories:rows.map(r=>({...r,org:[r.soku,r.bunku,r.honbu,r.shibu].filter(Boolean).join('／'),has_photo:Boolean(r.photo_key),photo_url:r.photo_key?`/api/story-photo/${encodeURIComponent(r.id)}`:null})),preview});
  }
  const photoMatch=path.match(/^\/api\/story-photo\/([^/]+)$/);
  if(photoMatch&&request.method==='GET'){
    if(!await getSession(env,request,'viewer','rpp_viewer'))return new Response('Unauthorized',{status:401});
    const id=decodeURIComponent(photoMatch[1]);const row=await env.DB.prepare('SELECT photo_key FROM rpp_stories WHERE id=? AND status=?').bind(id,'submitted').first();
    if(!row?.photo_key)return new Response('Not found',{status:404});const obj=await env.MEDIA.getWithMetadata(row.photo_key,'arrayBuffer');if(!obj.value)return new Response('Not found',{status:404});
    return new Response(obj.value,{headers:{'Content-Type':obj.metadata?.contentType||'image/jpeg','Cache-Control':'private, max-age=300','X-Content-Type-Options':'nosniff'}});
  }

  if(path==='/api/auth/request'&&request.method==='POST'){
    if(cfg.deadlinePassed)return json({error:'現在は原稿受付期間を終了しています。'},403);
    const body=await request.json().catch(()=>({}));const email=cleanEmail(body.email);if(!/^\S+@\S+\.\S+$/.test(email))return json({error:'メールアドレスを確認してください。'},400);
    const old=await env.DB.prepare('SELECT sent_at FROM rpp_otps WHERE email=?').bind(email).first();if(old?.sent_at&&Date.now()-Date.parse(old.sent_at)<120000)return json({error:'再送は2分ほど待ってから行ってください。'},429);
    const code=randomCode(),pepper=env.OTP_PEPPER||env.SETUP_KEY||'preview-pepper',codeHash=await sha256(`${email}:${code}:${pepper}`),expires=new Date(Date.now()+10*60*1000).toISOString(),sent=nowIso();
    await env.DB.prepare('INSERT INTO rpp_otps(email,code_hash,expires_at,sent_at,attempts) VALUES(?,?,?,?,0) ON CONFLICT(email) DO UPDATE SET code_hash=excluded.code_hash,expires_at=excluded.expires_at,sent_at=excluded.sent_at,attempts=0').bind(email,codeHash,expires,sent).run();
    let mailed=false;try{mailed=await sendOtpEmail(env,email,code)}catch(e){if(!preview)return json({error:'認証メールを送信できませんでした。'},502)}
    if(!mailed&&!preview)return json({error:'メール送信サービスが未設定です。'},503);return json({ok:true,preview,previewCode:preview&&!mailed?code:undefined});
  }
  if(path==='/api/auth/verify'&&request.method==='POST'){
    if(cfg.deadlinePassed)return json({error:'現在は原稿受付期間を終了しています。'},403);
    const body=await request.json().catch(()=>({}));const email=cleanEmail(body.email),code=String(body.code||'').trim();const row=await env.DB.prepare('SELECT * FROM rpp_otps WHERE email=?').bind(email).first();
    if(!row||Date.parse(row.expires_at)<Date.now())return json({error:'認証コードの有効期限が切れています。'},401);if(Number(row.attempts||0)>=6)return json({error:'認証試行回数を超えました。コードを再送してください。'},429);
    const pepper=env.OTP_PEPPER||env.SETUP_KEY||'preview-pepper',got=await sha256(`${email}:${code}:${pepper}`);if(got!==row.code_hash){await env.DB.prepare('UPDATE rpp_otps SET attempts=attempts+1 WHERE email=?').bind(email).run();return json({error:'認証コードを確認してください。'},401)}
    await env.DB.prepare('DELETE FROM rpp_otps WHERE email=?').bind(email).run();const token=await createSession(env,'author',email,60*60*24*30);return json({ok:true,email},200,{'Set-Cookie':sessionCookie('rpp_author',token,60*60*24*30)});
  }
  if(path==='/api/auth/logout'&&request.method==='POST'){await deleteSession(env,request,'rpp_author');return json({ok:true},200,{'Set-Cookie':clearCookie('rpp_author')})}
  if(path==='/api/me/story'){
    const session=await getSession(env,request,'author','rpp_author');if(!session)return json({error:'投稿者認証が必要です。'},401);const email=session.subject;
    if(request.method==='GET'){const row=await env.DB.prepare('SELECT * FROM rpp_stories WHERE author_email=?').bind(email).first();return json({story:row||null,email,...cfg})}
    if(request.method==='PUT'){
      if(cfg.deadlinePassed)return json({error:'原稿受付期間を終了しているため保存できません。'},403);
      const b=await request.json().catch(()=>({})),title=safeText(b.title,100),body=safeText(b.body,10000),name=safeText(b.name,200),status=b.status==='submitted'?'submitted':'draft';
      if([...title].length>40)return json({error:'題名は40字以内です。'},400);if(status==='submitted'&&(!name||!title||!body))return json({error:'氏名・題名・本文を入力してください。'},400);
      const existing=await env.DB.prepare('SELECT id,created_at,photo_key FROM rpp_stories WHERE author_email=?').bind(email).first();const id=existing?.id||crypto.randomUUID(),created=existing?.created_at||nowIso(),updated=nowIso();
      await env.DB.prepare(`INSERT INTO rpp_stories(id,author_email,record_date,soku,bunku,honbu,shibu,category,name,title,body,photo_key,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(author_email) DO UPDATE SET record_date=excluded.record_date,soku=excluded.soku,bunku=excluded.bunku,honbu=excluded.honbu,shibu=excluded.shibu,category=excluded.category,name=excluded.name,title=excluded.title,body=excluded.body,status=excluded.status,updated_at=excluded.updated_at`).bind(id,email,safeText(b.record_date,20),safeText(b.soku,100),safeText(b.bunku,100),safeText(b.honbu,100),safeText(b.shibu,100),safeText(b.category,30),name,title,body,existing?.photo_key||null,status,created,updated).run();
      const story=await env.DB.prepare('SELECT * FROM rpp_stories WHERE author_email=?').bind(email).first();return json({ok:true,story,...cfg});
    }
  }
  if(path==='/api/me/photo'&&request.method==='POST'){
    if(cfg.deadlinePassed)return json({error:'原稿受付期間を終了しているため写真を保存できません。'},403);
    const session=await getSession(env,request,'author','rpp_author');if(!session)return json({error:'投稿者認証が必要です。'},401);const type=request.headers.get('content-type')||'';if(!type.startsWith('image/'))return json({error:'画像ファイルを選んでください。'},400);
    const bytes=await request.arrayBuffer();if(bytes.byteLength>3*1024*1024)return json({error:'写真は3MB以下にしてください。'},413);const email=session.subject;let row=await env.DB.prepare('SELECT id,created_at FROM rpp_stories WHERE author_email=?').bind(email).first();
    if(!row){const id=crypto.randomUUID(),now=nowIso();await env.DB.prepare('INSERT INTO rpp_stories(id,author_email,status,created_at,updated_at) VALUES(?,?,?,?,?)').bind(id,email,'draft',now,now).run();row={id,created_at:now}}
    const key=`rpp/${row.id}/main.jpg`;await env.MEDIA.put(key,bytes,{metadata:{contentType:'image/jpeg',storyId:row.id}});await env.DB.prepare('UPDATE rpp_stories SET photo_key=?,updated_at=? WHERE id=?').bind(key,nowIso(),row.id).run();return json({ok:true,hasPhoto:true});
  }

  if(path==='/api/admin/login'&&request.method==='POST'){
    const b=await request.json().catch(()=>({}));const expected=env.ADMIN_PASSWORD||env.SETUP_KEY||(preview?'654321':'');if(!expected)return json({error:'管理者パスワードが未設定です。'},503);if(String(b.password||'')!==String(expected))return json({error:'管理者認証を確認してください。'},401);
    const token=await createSession(env,'admin','admin',60*60*12);return json({ok:true,preview},200,{'Set-Cookie':sessionCookie('rpp_admin',token,60*60*12)});
  }
  if(path==='/api/admin/logout'&&request.method==='POST'){await deleteSession(env,request,'rpp_admin');return json({ok:true},200,{'Set-Cookie':clearCookie('rpp_admin')})}
  if(path==='/api/admin/stats'&&request.method==='GET'){
    if(!await requireAdmin(env,request))return json({error:'管理者認証が必要です。'},401);
    const total=await env.DB.prepare('SELECT COUNT(*) n FROM rpp_stories').first(),submitted=await env.DB.prepare("SELECT COUNT(*) n FROM rpp_stories WHERE status='submitted'").first(),draft=await env.DB.prepare("SELECT COUNT(*) n FROM rpp_stories WHERE status='draft'").first(),photos=await env.DB.prepare('SELECT COUNT(*) n FROM rpp_stories WHERE photo_key IS NOT NULL').first();
    return json({total:Number(total?.n||0),submitted:Number(submitted?.n||0),draft:Number(draft?.n||0),photos:Number(photos?.n||0),...cfg});
  }
  if(path==='/api/admin/stories'&&request.method==='GET'){
    if(!await requireAdmin(env,request))return json({error:'管理者認証が必要です。'},401);const rows=await listAdminStories(env);return json({stories:rows.map(r=>({...r,org:[r.soku,r.bunku,r.honbu,r.shibu].filter(Boolean).join('／'),has_photo:Boolean(r.photo_key)}))});
  }
  if(path==='/api/admin/settings'){
    if(!await requireAdmin(env,request))return json({error:'管理者認証が必要です。'},401);
    if(request.method==='GET')return json({...s,...cfg});
    if(request.method==='PUT'){
      const b=await request.json().catch(()=>({}));
      const next={
        target_count:String(Math.max(1,Math.min(5000,Number(b.target_count||s.target_count||300)))),
        submission_deadline:safeText(b.submission_deadline??s.submission_deadline,40),
        auto_publish:String(b.auto_publish!==false),
        book_open:String(b.book_open!==false),
        site_mode:(b.site_mode==='production'?'production':'preview')
      };
      if(next.site_mode==='production'){
        const missing=[];if(!env.VIEWER_PASSWORD)missing.push('VIEWER_PASSWORD');if(!(env.ADMIN_PASSWORD||env.SETUP_KEY))missing.push('ADMIN_PASSWORD');if(!(env.BREVO_API_KEY&&env.OTP_SENDER_EMAIL))missing.push('BREVO_API_KEY / OTP_SENDER_EMAIL');
        if(missing.length)return json({error:`本番切替前にCloudflare Secretsを設定してください: ${missing.join(', ')}`},400);
      }
      for(const [k,v] of Object.entries(next))await env.DB.prepare('INSERT INTO rpp_settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind(k,v).run();
      const refreshed=await settings(env);return json({ok:true,...refreshed,...publicConfig(env,refreshed)});
    }
  }
  if(path==='/api/admin/export.csv'&&request.method==='GET'){
    if(!await requireAdmin(env,request))return json({error:'管理者認証が必要です。'},401);const rows=await listAdminStories(env);const header=['id','author_email','record_date','soku','bunku','honbu','shibu','category','name','title','status','has_photo','created_at','updated_at'];
    const lines=[header.join(','),...rows.map(r=>[r.id,r.author_email,r.record_date,r.soku,r.bunku,r.honbu,r.shibu,r.category,r.name,r.title,r.status,r.photo_key?'1':'0',r.created_at,r.updated_at].map(csvCell).join(','))];
    return text('\uFEFF'+lines.join('\r\n'),200,{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="road-to-peace-pride-stories.csv"'});
  }
  if(path==='/api/admin/export.json'&&request.method==='GET'){
    if(!await requireAdmin(env,request))return json({error:'管理者認証が必要です。'},401);const rows=(await env.DB.prepare('SELECT * FROM rpp_stories ORDER BY updated_at DESC').all()).results||[];
    return text(JSON.stringify({exported_at:nowIso(),settings:s,stories:rows},null,2),200,{'Content-Type':'application/json; charset=utf-8','Content-Disposition':'attachment; filename="road-to-peace-pride-backup.json"'});
  }
  const adminPhotoMatch=path.match(/^\/api\/admin\/photo\/([^/]+)$/);
  if(adminPhotoMatch&&request.method==='GET'){
    if(!await requireAdmin(env,request))return new Response('Unauthorized',{status:401});const id=decodeURIComponent(adminPhotoMatch[1]);const row=await env.DB.prepare('SELECT photo_key FROM rpp_stories WHERE id=?').bind(id).first();if(!row?.photo_key)return new Response('Not found',{status:404});const obj=await env.MEDIA.getWithMetadata(row.photo_key,'arrayBuffer');if(!obj.value)return new Response('Not found',{status:404});return new Response(obj.value,{headers:{'Content-Type':obj.metadata?.contentType||'image/jpeg','Cache-Control':'private, max-age=60'}});
  }

  return null;
}

export default {
  async fetch(request,env){
    const url=new URL(request.url),path=url.pathname.replace(/\/$/,'')||'/';
    try{if(path.startsWith('/api/')){const res=await api(request,env,url,path);if(res)return res}return env.ASSETS.fetch(request)}catch(error){console.error(error);let preview=true;try{await ensureSchema(env);preview=isPreview(env,await settings(env))}catch{}return json({error:preview?String(error?.message||error):'処理に失敗しました。'},500)}
  }
};
