(function(g){
'use strict';
const encoder=new TextEncoder();
const crcTable=new Uint32Array(256);
for(let n=0;n<256;n++){
  let c=n;
  for(let k=0;k<8;k++)c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1);
  crcTable[n]=c>>>0;
}
function crc32(bytes){
  let c=0xffffffff;
  for(let i=0;i<bytes.length;i++)c=crcTable[(c^bytes[i])&0xff]^(c>>>8);
  return (c^0xffffffff)>>>0;
}
async function toBytes(data){
  if(typeof data==='string')return encoder.encode(data);
  if(data instanceof Uint8Array)return data;
  if(data instanceof ArrayBuffer)return new Uint8Array(data);
  if(ArrayBuffer.isView(data))return new Uint8Array(data.buffer,data.byteOffset,data.byteLength);
  if(typeof Blob!=='undefined'&&data instanceof Blob)return new Uint8Array(await data.arrayBuffer());
  throw new TypeError('Unsupported ZIP file data');
}
function dosDateTime(value){
  const d=value instanceof Date?value:new Date(value||Date.now());
  const year=Math.max(1980,Math.min(2107,d.getFullYear()));
  const date=((year-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate();
  const time=(d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1);
  return {date,time};
}
function localHeader(name,size,crc,dt){
  const out=new Uint8Array(30+name.length),v=new DataView(out.buffer);
  v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x0800,true);v.setUint16(8,0,true);
  v.setUint16(10,dt.time,true);v.setUint16(12,dt.date,true);v.setUint32(14,crc,true);v.setUint32(18,size,true);v.setUint32(22,size,true);
  v.setUint16(26,name.length,true);v.setUint16(28,0,true);out.set(name,30);return out;
}
function centralHeader(name,size,crc,dt,offset){
  const out=new Uint8Array(46+name.length),v=new DataView(out.buffer);
  v.setUint32(0,0x02014b50,true);v.setUint16(4,20,true);v.setUint16(6,20,true);v.setUint16(8,0x0800,true);v.setUint16(10,0,true);
  v.setUint16(12,dt.time,true);v.setUint16(14,dt.date,true);v.setUint32(16,crc,true);v.setUint32(20,size,true);v.setUint32(24,size,true);
  v.setUint16(28,name.length,true);v.setUint16(30,0,true);v.setUint16(32,0,true);v.setUint16(34,0,true);v.setUint16(36,0,true);
  v.setUint32(38,0,true);v.setUint32(42,offset,true);out.set(name,46);return out;
}
function endRecord(count,centralSize,centralOffset){
  const out=new Uint8Array(22),v=new DataView(out.buffer);
  v.setUint32(0,0x06054b50,true);v.setUint16(4,0,true);v.setUint16(6,0,true);v.setUint16(8,count,true);v.setUint16(10,count,true);
  v.setUint32(12,centralSize,true);v.setUint32(16,centralOffset,true);v.setUint16(20,0,true);return out;
}
async function makeZip(files){
  if(!Array.isArray(files)||!files.length)throw new Error('ZIPに含めるファイルがありません。');
  if(files.length>65535)throw new Error('ZIPのファイル数上限を超えています。');
  const localParts=[],centralParts=[];let offset=0;
  for(const file of files){
    const name=encoder.encode(String(file.name||'file').replace(/^\/+/,''));
    if(!name.length||name.length>65535)throw new Error('ZIP内ファイル名が不正です。');
    const data=await toBytes(file.data),size=data.byteLength;
    if(size>0xffffffff)throw new Error('4GBを超えるファイルはバックアップできません。');
    const crc=crc32(data),dt=dosDateTime(file.date),lh=localHeader(name,size,crc,dt),ch=centralHeader(name,size,crc,dt,offset);
    localParts.push(lh,data);centralParts.push(ch);offset+=lh.byteLength+size;
    if(offset>0xffffffff)throw new Error('ZIP全体が4GBを超えています。分割バックアップが必要です。');
  }
  const centralOffset=offset,centralSize=centralParts.reduce((a,b)=>a+b.byteLength,0);
  if(centralOffset+centralSize>0xffffffff)throw new Error('ZIP全体が4GBを超えています。');
  return new Blob([...localParts,...centralParts,endRecord(files.length,centralSize,centralOffset)],{type:'application/zip'});
}
g.RppZip={makeZip,toBytes,crc32};
})(globalThis);

// ADMIN MAIL FIX r18: the static admin asset always loads this file.
// Capture the mail buttons before legacy inline handlers so a test can never run
// before the Brevo API key has been persisted and verified in D1.
(function(){
'use strict';
const $=id=>document.getElementById(id);
function show(text,ok=false){const m=$('mailMsg');if(!m)return;m.textContent=text;m.className='msg '+(ok?'ok':'warn')}
async function api(url,opt={}){
  const r=await fetch(url,{credentials:'same-origin',cache:'no-store',...opt});let d={};
  try{d=await r.json()}catch{}
  if(!r.ok)throw new Error(d.error||('HTTP '+r.status));
  return d;
}
function eventText(d){
  const e=d.deliveryEvent||{},name=String(e.event||'').toLowerCase(),reason=e.reason?(' / '+e.reason):'';
  if(d.deliveryVerified||name.includes('delivered'))return 'Brevo配信確認：DELIVERED（受信側へ配信済み）';
  if(/blocked|hard.?bounce|invalid|error|spam/.test(name))return 'Brevo配信エラー：'+(e.event||'unknown')+reason;
  if(/deferred|soft.?bounce/.test(name))return 'Brevoで配信遅延：'+(e.event||'pending')+reason;
  if(e.event)return 'Brevo受付済み・配信確認中：'+e.event+reason;
  return d.accepted?'Brevo受付済み。配信結果を確認中です。':'テストメール送信を確認できませんでした。';
}
async function ensureSaved(requireKey=false){
  const key=($('brevoKey')?.value||'').trim();
  const sender=($('senderEmail')?.value||'').trim();
  const senderName=($('senderName')?.value||'ROAD TO PEACE PRIDE').trim();
  if(!sender)throw new Error('送信元メールアドレスを入力してください。');
  if(key){
    show('Brevo APIキーを暗号化保存中…');
    await api('/api/admin/email-settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({api_key:key,sender_email:sender,sender_name:senderName})});
  }
  const check=await api('/api/admin/email-settings');
  if(!check.configured){
    if(requireKey&&!key)throw new Error('Brevo APIキーを入力してください。');
    throw new Error('Brevo APIキーの保存を確認できませんでした。');
  }
  if(key&&$('brevoKey'))$('brevoKey').value='';
  return check;
}
async function saveMail(btn){
  btn.disabled=true;
  try{const d=await ensureSaved(true);show('メール送信設定済（'+(d.source||'encrypted-d1')+'）','ok')}
  catch(e){show('メール設定の保存に失敗しました：'+e.message)}
  finally{btn.disabled=false}
}
async function testMail(btn){
  const to=($('testTo')?.value||'').trim();
  if(!to){show('テスト送信先を入力してください。');return}
  btn.disabled=true;
  try{
    const saved=await ensureSaved(true);
    show('APIキー保存確認済み（'+(saved.source||'encrypted-d1')+'）。Brevoへ送信中…','ok');
    const d=await api('/api/admin/email-test',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({to})});
    show(eventText(d),!!d.deliveryVerified);
  }catch(e){show('認証メール処理に失敗しました：'+e.message)}
  finally{btn.disabled=false}
}
function mark(){
  if(!$('brevoKey')||$('staticMailFixR18'))return;
  const actions=$('testMail')?.closest('.actions');if(!actions)return;
  const n=document.createElement('div');n.id='staticMailFixR18';n.className='note';n.style.marginTop='10px';n.style.fontWeight='700';
  n.textContent='MAIL FIX r18｜APIキー保存確認後にBrevo送信します';
  actions.insertAdjacentElement('afterend',n);
}
document.addEventListener('click',e=>{
  const btn=e.target?.closest?.('#saveMail,#testMail');if(!btn)return;
  e.preventDefault();e.stopImmediatePropagation();
  if(btn.id==='saveMail')saveMail(btn);else testMail(btn);
},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mark,{once:true});else mark();
setTimeout(mark,100);
})();
