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
