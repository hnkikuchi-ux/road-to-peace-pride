const enc = new TextEncoder();
function json(data,status=200,extra={}){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...extra}})}
function cleanSlug(value){return String(value||'').trim().toLowerCase().replace(/[^a-z0-9-]/g,'').replace(/-+/g,'-').replace(/^-|-$/g,'')}
function randomKey(){const b=new Uint8Array(32);crypto.getRandomValues(b);return Array.from(b,x=>x.toString(16).padStart(2,'0')).join('')}
async function hash(value){const bytes=await crypto.subtle.digest('SHA-256',enc.encode(value));return Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,'0')).join('')}
function safeState(raw){try{return JSON.parse(raw)}catch{return {}}}
function latestPublishedAt(state){const values=(state?.posts||[]).filter((p)=>p.status!=='draft').map((p)=>Date.parse(p.createdAt||`${p.date||''}T00:00:00`)).filter(Number.isFinite);return values.length?new Date(Math.max(...values)).toISOString():null}
function publicState(state){const next=structuredClone(state||{});next.posts=(next.posts||[]).filter((p)=>p.status!=='draft');next.draft=null;return next}
async function siteByManageKey(env,key){if(!key)return null;return env.DB.prepare('SELECT * FROM sites WHERE manage_key_hash=?').bind(await hash(key)).first()}
function baseState(name,town,office){return {template:'trust',themeColor:'#0f3d66',profile:{name,town,office,catch:'皆さまの声を、町政へ。\n暮らしに寄り添い、未来をひらく。',message:'小さな声を大切に、現場第一で取り組みます。',profileText:'地域の皆さまのお声を大切に、一つ一つの課題に取り組んでまいります。',image:'',imagePositionX:50,imagePositionY:50,imageZoom:100,facts:[{label:'活動地域',value:town},{label:'大切にする姿勢',value:'現場第一・対話第一'},{label:'経歴',value:''},{label:'趣味',value:''},{label:'目指すまち',value:''}]},socialLinks:{instagram:'',youtube:'',facebook:'',x:'',line:''},policies:[{title:'子育て・教育',description:''},{title:'防災・安全',description:''},{title:'福祉・健康',description:''}],achievements:[],posts:[],draft:null}}

export default {
  async fetch(request,env){
    const url=new URL(request.url);const path=url.pathname.replace(/\/$/,'')||'/';
    try{
      if(path==='/api/setup/member'&&request.method==='POST'){
        if(!env.SETUP_KEY||request.headers.get('X-Setup-Key')!==env.SETUP_KEY)return json({error:'セットアップキーが違います。'},403);
        const body=await request.json();const slug=cleanSlug(body.slug);const name=String(body.name||'').trim();const town=String(body.town||'').trim();const office=String(body.office||'').trim()||`${town}議会議員`;
        if(!name||!town||slug.length<3)return json({error:'議員名・自治体名・3文字以上のURL名を入力してください。'},400);
        const exists=await env.DB.prepare('SELECT id FROM sites WHERE slug=?').bind(slug).first();if(exists)return json({error:'この公開URL名はすでに使われています。'},409);
        const id=crypto.randomUUID(),manageKey=randomKey(),manageHash=await hash(manageKey),now=new Date().toISOString(),state=baseState(name,town,office);
        await env.DB.prepare('INSERT INTO sites(id,slug,manage_key_hash,state_json,last_published_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?)').bind(id,slug,manageHash,JSON.stringify(state),null,now,now).run();
        return json({slug,manageKey,publicUrl:`${url.origin}/p/${encodeURIComponent(slug)}`,adminUrl:`${url.origin}/?admin=1&key=${manageKey}`},201);
      }
      const publicMatch=path.match(/^\/api\/public\/([^/]+)$/);
      if(publicMatch&&request.method==='GET'){
        const slug=decodeURIComponent(publicMatch[1]);const row=await env.DB.prepare('SELECT * FROM sites WHERE slug=?').bind(slug).first();if(!row)return json({error:'公開ページが見つかりません。'},404);
        return json({slug:row.slug,createdAt:row.created_at,lastPublishedAt:row.last_published_at,state:publicState(safeState(row.state_json))},200,{'Cache-Control':'public, max-age=30'});
      }
      if(path==='/api/manage/state'){
        const row=await siteByManageKey(env,request.headers.get('X-Manage-Key')||'');if(!row)return json({error:'管理キーを確認してください。'},401);
        if(request.method==='GET')return json({slug:row.slug,createdAt:row.created_at,lastPublishedAt:row.last_published_at,state:safeState(row.state_json)});
        if(request.method==='PUT'){
          const body=await request.json();const state=body.state;if(!state||typeof state!=='object')return json({error:'保存データが正しくありません。'},400);
          const serialized=JSON.stringify(state);if(serialized.length>900000)return json({error:'保存データが大きすぎます。写真を減らしてください。'},413);
          const last=latestPublishedAt(state),now=new Date().toISOString();await env.DB.prepare('UPDATE sites SET state_json=?,last_published_at=?,updated_at=? WHERE id=?').bind(serialized,last,now,row.id).run();return json({ok:true,slug:row.slug,lastPublishedAt:last});
        }
      }
      if(path==='/api/manage/image'&&request.method==='POST'){
        const row=await siteByManageKey(env,request.headers.get('X-Manage-Key')||'');if(!row)return json({error:'管理キーを確認してください。'},401);
        const type=request.headers.get('content-type')||'';if(!type.startsWith('image/'))return json({error:'画像ファイルを選んでください。'},400);
        const bytes=await request.arrayBuffer();if(bytes.byteLength>5*1024*1024)return json({error:'画像は5MB以下にしてください。'},413);
        const key=`${row.id}/${crypto.randomUUID()}.jpg`;await env.MEDIA.put(key,bytes,{metadata:{contentType:type,siteId:row.id}});return json({key,url:`${url.origin}/media/${encodeURIComponent(key)}`},201);
      }
      const mediaMatch=path.match(/^\/media\/(.+)$/);
      if(mediaMatch&&request.method==='GET'){
        const key=decodeURIComponent(mediaMatch[1]);const result=await env.MEDIA.getWithMetadata(key,'arrayBuffer');if(!result.value)return new Response('Not found',{status:404});return new Response(result.value,{headers:{'Content-Type':result.metadata?.contentType||'image/jpeg','Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff'}});
      }
      if(/^\/p\/[^/]+$/.test(path)&&request.method==='GET'){
        const assetUrl=new URL('/index.html',url);return env.ASSETS.fetch(new Request(assetUrl.toString(),{headers:request.headers}));
      }
      return env.ASSETS.fetch(request);
    }catch(error){return json({error:error instanceof Error?error.message:'処理に失敗しました。'},500)}
  }
};
