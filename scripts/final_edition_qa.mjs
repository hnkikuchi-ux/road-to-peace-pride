import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import worker from '../src/final-edition.js';

class Statement {
  constructor(db,sql){this.db=db;this.sql=sql;this.values=[]}
  bind(...values){this.values=values;return this}
  execute(){const r=this.db.prepare(this.sql).run(...this.values);return {success:true,meta:{changes:Number(r.changes)}}}
  async run(){return this.execute()}
  async first(column){const r=this.db.prepare(this.sql).get(...this.values);return column?r?.[column]??null:r??null}
  async all(){return {results:this.db.prepare(this.sql).all(...this.values)}}
}
const sqlite=new DatabaseSync(':memory:');
const DB={prepare:sql=>new Statement(sqlite,sql),exec:async sql=>sqlite.exec(sql),batch:async statements=>{sqlite.exec('BEGIN');try{const results=statements.map(s=>s.execute());sqlite.exec('COMMIT');return results}catch(e){sqlite.exec('ROLLBACK');throw e}}};
const media=new Map();
const env={DB,MEDIA:{put:async(k,v,opt)=>media.set(k,{value:v,metadata:opt.metadata}),getWithMetadata:async k=>media.get(k)||{value:null},delete:async k=>media.delete(k)},SETUP_KEY:'local-qa-setup-only',VIEWER_PASSWORD:'local-qa-viewer-only',ASSETS:{fetch:async()=>new Response('asset')} };
let cookie='';
async function req(path,method='GET',payload,options={}){
  const headers={'Cookie':options.anonymous?'':cookie,'Origin':options.origin||'https://test.invalid'};
  if(payload!==undefined)headers['Content-Type']='application/json';
  if(options.intent)headers['X-RPP-Story-Intent']=options.intent;
  const r=await worker.fetch(new Request('https://test.invalid'+path,{method,headers,body:payload===undefined?undefined:JSON.stringify(payload)}),env,{});
  return {r,status:r.status,data:r.headers.get('content-type')?.includes('application/json')?await r.clone().json():null};
}
let r=await req('/api/config');assert.equal(r.status,200);
r=await req('/api/admin/login','POST',{password:env.SETUP_KEY});assert.equal(r.status,200);
cookie=r.r.headers.getSetCookie().map(s=>s.split(';')[0]).join('; ');
sqlite.prepare("UPDATE rpp_settings SET value='production' WHERE key='site_mode'").run();
sqlite.prepare("INSERT INTO rpp_stories(id,author_email,name,soku,bunku,title,body,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)").run('existing','person@test.invalid','Example Existing','南総区','Existing division','Original title','Original body','submitted','2026-01-01','2026-01-02');
sqlite.prepare("INSERT INTO rpp_stories(id,author_email,name,soku,title,body,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)").run('draft','draft@test.invalid','Example Draft','中区','','not submitted','draft','2026-01-01','2026-01-02');
const one={source_key:'local-qa-one',name:'Example One',soku:'中区',honbu:'Example Honbu',title:'無題',body:'Original paragraph.\n\nSecond paragraph.  '};
const two={source_key:'local-qa-two',name:'Example Two',soku:'中区',title:'Photo story',body:'Original body with photo',photo_base64:btoa(String.fromCharCode(255,216,255,217))};
const payload={format:'rpp-admin-import-v1',stories:[one,two]};
assert.equal((await req('/api/admin/final-edition/import','POST',payload,{anonymous:true})).status,401);
assert.equal((await req('/api/admin/final-edition/import','POST',payload,{origin:'https://other.invalid'})).status,403);
r=await req('/api/admin/final-edition/prepare','POST',payload);assert.equal(r.status,200);assert.equal(r.data.added,2);assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM rpp_stories').get().n,2);
r=await req('/api/admin/final-edition/import','POST',payload);assert.equal(r.status,200);assert.equal(r.data.added,2);assert.equal(r.data.photos,1);
const id=r.data.stories[0].id;assert.equal(sqlite.prepare('SELECT body FROM rpp_stories WHERE id=?').get(id).body,one.body);assert.equal(media.size,1);
r=await req('/api/admin/final-edition/import','POST',payload);assert.equal(r.status,200);assert.equal(r.data.added,0);assert.equal(r.data.skipped,2);assert.equal(media.size,1);
assert.equal((await req('/api/admin/final-edition/prepare','POST',{...payload,stories:[{...one,source_key:'changed-key'}]})).status,409);
assert.equal((await req('/api/admin/final-edition/import','POST',{...payload,stories:[{...one,body:'changed'}]})).status,409);
assert.equal((await req('/api/admin/final-edition/import','POST',{...payload,stories:[{...two,source_key:'bad-photo',name:'Bad photo',photo_base64:'bad'}]})).status,400);
assert.equal((await req('/api/admin/final-edition/import','POST',{...payload,stories:[{...one,source_key:'oversize',name:'Oversize',body:'x'.repeat(10001)}]})).status,400);
const before=sqlite.prepare('SELECT * FROM rpp_stories WHERE id=?').get('existing');
r=await req('/api/admin/final-edition/story/existing/org','PATCH',{soku:'金沢総区',expected_soku:'南総区',expected_updated_at:'2026-01-02'});assert.equal(r.status,200);
const after=sqlite.prepare('SELECT * FROM rpp_stories WHERE id=?').get('existing');for(const k of Object.keys(before))if(!['soku','updated_at'].includes(k))assert.equal(after[k],before[k]);assert.equal(after.soku,'金沢総区');
assert.equal((await req('/api/admin/final-edition/story/existing/org','PATCH',{soku:'中区',expected_soku:'南総区',expected_updated_at:'2026-01-02'})).status,409);
const settingsBefore=Object.fromEntries(sqlite.prepare('SELECT key,value FROM rpp_settings').all().map(r=>[r.key,r.value]));
r=await req('/api/admin/final-edition/close','POST',{});assert.equal(r.status,200);assert.equal(r.data.finalEdition,true);assert.equal(r.data.deadlinePassed,true);
const settingsAfter=Object.fromEntries(sqlite.prepare('SELECT key,value FROM rpp_settings').all().map(r=>[r.key,r.value]));for(const k of Object.keys(settingsBefore))if(k!=='submission_deadline')assert.equal(settingsAfter[k],settingsBefore[k]);
for(const [path,method,intent] of [['/api/me/story','PUT','edit-draft'],['/api/me/photo','POST','edit-draft-photo'],['/api/rpp/resubmit','POST'],['/api/auth/request','POST'],['/api/auth/verify','POST'],['/api/edit-code/login','POST']]){r=await req(path,method,{}, {intent});assert.equal(r.status,403);assert.equal(r.data.finalEdition,true)}
assert.equal((await req('/api/stories','GET',undefined,{anonymous:true})).status,401);
assert.equal((await req('/api/config')).data.finalEdition,true);
r=await req('/author');assert.equal(r.status,200);assert.match(await r.r.text(),/投稿受付は終了しました/);
assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM rpp_stories WHERE status='submitted'").get().n,3);assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM rpp_stories WHERE status='draft'").get().n,1);
assert.equal((await req('/api/admin/final-edition/import','POST',{format:'rpp-admin-import-v1',stories:[{source_key:'after-close',name:'Example Late',soku:'中区',title:'無題',body:'Allowed administrator addition'}]})).status,200);
const count=sqlite.prepare('SELECT COUNT(*) n FROM rpp_stories').get().n;
sqlite.exec("CREATE TRIGGER fail_test BEFORE INSERT ON rpp_stories WHEN NEW.name='Fail Transaction' BEGIN SELECT RAISE(ABORT,'test-only'); END");
r=await req('/api/admin/final-edition/import','POST',{format:'rpp-admin-import-v1',stories:[{source_key:'rollback-a',name:'Rollback A',soku:'中区',title:'無題',body:'A'},{source_key:'rollback-b',name:'Fail Transaction',soku:'中区',title:'無題',body:'B'}]});assert.equal(r.status,500);assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM rpp_stories').get().n,count);
console.log('PASS: full-admin auth, same-origin writes, import validation, exact text, idempotency, photos, org-only update, stale-write conflict, closure on all author paths, private reader gate, retained drafts, administrator additions after closure, atomic rollback.');
