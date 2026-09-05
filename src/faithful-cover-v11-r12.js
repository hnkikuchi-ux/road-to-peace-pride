import app from './faithful-cover-v11-r11.js';

const R12=`
<style>
/* r12 — simplified authoring flow */
body.rpp-author-r12 #deadlineAuth:empty,body.rpp-author-r12 #deadlineEditor:empty{display:none!important}
body.rpp-author-r12 .r12-auto-date{display:none!important}
body.rpp-author-r12 .r12-savebox{margin:12px 0 20px;padding:12px 13px;border:1px solid rgba(216,184,102,.24);background:rgba(255,255,255,.025);font-size:12px;line-height:1.75;color:#d8dce5}
body.rpp-author-r12 .r12-savebox b{color:#efd98d;font-weight:700}
body.rpp-author-r12 .r12-org-grid{display:grid;grid-template-columns:1fr;gap:10px;margin-top:10px}
body.rpp-author-r12 .r12-org-grid .field{margin:0}
body.rpp-author-r12 .r12-org-grid input{min-height:48px}
body.rpp-author-r12 .r12-writing-note{margin:8px 0 10px;color:#efe5c8;font-size:13px;line-height:1.85}
body.rpp-author-r12 .r12-photo-note{margin-top:8px;padding:10px 12px;border-left:3px solid #d8b866;background:rgba(216,184,102,.07);color:#f4ecd6;font-size:12px;line-height:1.8}
body.rpp-author-r12 .r12-actions{display:grid;gap:10px;margin-top:22px}
body.rpp-author-r12 .r12-actions #save,body.rpp-author-r12 .r12-actions #previewBtn,body.rpp-author-r12 .r12-actions #submit{width:100%;min-height:50px}
body.rpp-author-r12 .r12-logout{margin-top:18px;padding-top:16px;border-top:1px solid rgba(216,184,102,.16)}
body.rpp-author-r12 .r12-logout #logout{width:100%;opacity:.78}
body.rpp-author-r12 #storyPreview{align-items:start;padding:0;background:rgba(0,4,14,.95);overflow:auto}
body.rpp-author-r12 #storyPreview .paper{margin:18px auto 32px;width:min(calc(100% - 20px),760px);max-height:none;min-height:calc(100vh - 50px);background:linear-gradient(180deg,#fbf7ec,#f3ead7);padding:clamp(28px,7vw,58px) clamp(20px,6vw,54px);border:1px solid #d5b966;box-shadow:0 28px 90px rgba(0,0,0,.5)}
body.rpp-author-r12 #storyPreview .paper:before{content:'ROAD TO PEACE PRIDE';display:block;text-align:center;font-family:ui-serif,'Yu Mincho',serif;letter-spacing:.20em;font-size:10px;color:#8d6b25;margin-bottom:24px}
body.rpp-author-r12 #storyPreview .ey{display:none}
body.rpp-author-r12 #storyPreview h2{font-family:ui-serif,'Yu Mincho',serif;font-size:clamp(25px,7vw,38px);letter-spacing:.04em;margin:0 0 14px;color:#182139}
body.rpp-author-r12 #storyPreview .pmeta{font-size:12px;line-height:1.9;color:#6b6254;margin-bottom:22px}
body.rpp-author-r12 #storyPreview .pbody{font-family:ui-serif,'Yu Mincho',serif;font-size:16px;line-height:2.05;color:#252525}
body.rpp-author-r12 .r12-preview-photo{display:block;width:min(100%,520px);max-height:420px;object-fit:cover;margin:0 auto 26px;border:1px solid #cdb36e}
@media(min-width:560px){body.rpp-author-r12 .r12-org-grid{grid-template-columns:repeat(3,1fr)}}
</style>
<script>
(()=>{
 const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
 const today=()=>{const d=new Date(),p=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())};
 function fieldOf(id){return document.getElementById(id)?.closest('.field')||null}
 function addOrgDetails(orgField){
   if(document.getElementById('rppBunku'))return;
   const grid=document.createElement('div');grid.className='r12-org-grid';
   grid.innerHTML='<div class="field"><label>分区</label><input id="rppBunku" maxlength="120" placeholder="分区を入力"></div><div class="field"><label>本部</label><input id="rppHonbu" maxlength="120" placeholder="本部を入力"></div><div class="field"><label>部</label><input id="rppShibu" maxlength="120" placeholder="部を入力"></div>';
   orgField.appendChild(grid);
 }
 function syncSaveWords(){
   const s=document.getElementById('saveState');if(s){const t=s.textContent||'';if(/保存済|端末|Cloudflare|PREVIEW/i.test(t))s.textContent='下書き保存済です。';else s.textContent='自動で下書き保存されます。'}
 }
 function apply(){
   const editor=document.getElementById('editor');if(!editor)return false;
   document.body.classList.add('rpp-author-r12');
   const top=document.querySelector('.top a.pill');if(top)top.textContent='トップへ戻る';
   const panel=editor.querySelector('.panel');if(!panel)return false;
   const head=panel.querySelector('h1');if(head)head.textContent='あなたの記録';
   const ey=panel.querySelector('.ey');if(ey)ey.textContent='YOUR STORY';

   const dateField=fieldOf('record_date');if(dateField){dateField.classList.add('r12-auto-date');const rd=document.getElementById('record_date');if(rd&&!rd.value)rd.value=today()}
   ['deadlineAuth','deadlineEditor'].forEach(id=>{const e=document.getElementById(id);if(e&&/締切は現在設定されていません/.test(e.textContent||'')){e.textContent='';e.classList.add('hidden')}});

   const status=panel.querySelector('.status');if(status){status.className='r12-savebox';status.innerHTML='<b>自動で下書き保存されます。</b><br><span id="saveState">下書き保存済です。</span>'}

   const form=document.getElementById('formArea');if(!form)return true;
   const nameField=fieldOf('name'),orgNative=fieldOf('org'),titleField=fieldOf('title'),bodyField=fieldOf('body'),photoField=fieldOf('photo');
   const orgSelect=document.getElementById('rppOrgSelect');const orgField=(orgSelect&&orgSelect.closest('.field'))||orgNative;
   if(orgField){const l=orgField.querySelector('label');if(l)l.textContent='組織';addOrgDetails(orgField)}
   if(nameField){const l=nameField.querySelector('label');if(l)l.textContent='氏名'}
   if(titleField){const l=titleField.querySelector('label');if(l)l.textContent='題名'}
   if(bodyField){
      const l=bodyField.querySelector('label');if(l)l.textContent='あなたの記録';
      let n=bodyField.querySelector('.r12-writing-note');if(!n){n=document.createElement('div');n.className='r12-writing-note';n.textContent='9.12までの挑戦・これからの誓い・思いをありのまま綴ってください。';bodyField.querySelector('textarea')?.insertAdjacentElement('beforebegin',n)}
      const ta=document.getElementById('body');if(ta)ta.placeholder='本文はこちらに入力してください。';
   }
   if(photoField){const l=photoField.querySelector('label');if(l)l.textContent='写真';let n=photoField.querySelector('.r12-photo-note');if(!n){n=document.createElement('div');n.className='r12-photo-note';n.innerHTML='<b>写真は任意です。</b><br>写真なしでもそのまま提出できます。';photoField.querySelector('#photo')?.insertAdjacentElement('afterend',n)}const old=document.getElementById('photoOptionalNote');if(old)old.style.display='none'}

   const order=[nameField,orgField,titleField,bodyField,photoField].filter(Boolean);order.forEach(x=>form.appendChild(x));
   const confirm=document.getElementById('confirm');if(confirm){confirm.checked=true;const row=confirm.closest('label');if(row)row.style.display='none'}
   let actions=form.querySelector('.r12-actions');if(!actions){actions=document.createElement('div');actions.className='r12-actions';form.appendChild(actions)}
   ['save','previewBtn','submit'].forEach(id=>{const b=document.getElementById(id);if(b)actions.appendChild(b)});
   const submit=document.getElementById('submit');if(submit)submit.textContent='この内容で提出する';
   const prev=document.getElementById('previewBtn');if(prev)prev.textContent='掲載イメージを確認';
   const save=document.getElementById('save');if(save)save.textContent='下書き保存';
   const logout=document.getElementById('logout');if(logout){let box=form.querySelector('.r12-logout');if(!box){box=document.createElement('div');box.className='r12-logout';form.appendChild(box)}box.appendChild(logout)}
   const oldStack=form.querySelector('.stack');if(oldStack&&oldStack.children.length===0)oldStack.remove();

   ['save','previewBtn','submit','submitPreview'].forEach(id=>{const b=document.getElementById(id);if(b&&!b.dataset.r12Date){b.dataset.r12Date='1';b.addEventListener('click',()=>{const rd=document.getElementById('record_date');if(rd&&!rd.value)rd.value=today();if(confirm)confirm.checked=true},true)}});
   syncSaveWords();
   return true;
 }
 function installFetch(){if(window.__rpp12Fetch)return;window.__rpp12Fetch=true;const native=window.fetch.bind(window);window.fetch=async(input,init)=>{
   const u=typeof input==='string'?input:(input&&input.url)||'';let ni=init;
   if(u.includes('/api/me/story')&&init?.method==='PUT'&&init.body){try{const b=JSON.parse(init.body);const soku=document.getElementById('rppOrgSelect')?.value||document.getElementById('org')?.value||b.soku||'';b.soku=soku;b.org=soku;b.bunku=document.getElementById('rppBunku')?.value.trim()||'';b.honbu=document.getElementById('rppHonbu')?.value.trim()||'';b.shibu=document.getElementById('rppShibu')?.value.trim()||'';if(!b.record_date)b.record_date=today();ni={...init,body:JSON.stringify(b)}}catch(e){}
   }
   const r=await native(input,ni);
   if(u.includes('/api/me/story')&&(!init||init.method==='GET')){try{const d=await r.clone().json(),s=d.story||{};setTimeout(()=>{const map=[['rppBunku',s.bunku],['rppHonbu',s.honbu],['rppShibu',s.shibu]];map.forEach(([id,v])=>{const e=document.getElementById(id);if(e&&v!=null)e.value=v})},80)}catch(e){}}
   return r;
 }}
 function previewEnhance(){const m=document.getElementById('storyPreview');if(!m||m.dataset.r12Obs)return;m.dataset.r12Obs='1';new MutationObserver(()=>{if(m.classList.contains('hidden'))return;const meta=document.getElementById('pMeta');if(meta){const parts=[document.getElementById('name')?.value,document.getElementById('rppOrgSelect')?.value||document.getElementById('org')?.value,document.getElementById('rppBunku')?.value,document.getElementById('rppHonbu')?.value,document.getElementById('rppShibu')?.value].filter(Boolean);meta.textContent=parts.join(' ／ ')}let img=m.querySelector('.r12-preview-photo');const src=document.getElementById('photoPreview');if(src&&!src.classList.contains('hidden')&&src.src){if(!img){img=document.createElement('img');img.className='r12-preview-photo';document.getElementById('pBody')?.insertAdjacentElement('beforebegin',img)}img.src=src.src;img.alt='掲載写真'}else if(img)img.remove()},).observe(m,{attributes:true,attributeFilter:['class']})}
 ready(()=>{installFetch();const run=()=>{apply();previewEnhance()};run();setTimeout(run,120);setTimeout(run,500);setTimeout(run,1300);new MutationObserver(run).observe(document.body,{subtree:true,childList:true});setInterval(syncSaveWords,1500)});
})();
</script>`;

function inject(response){return new HTMLRewriter().on('body',{element(el){el.append(R12,{html:true})}}).transform(response)}
export default{async fetch(request,env,ctx){const response=await app.fetch(request,env,ctx),url=new URL(request.url),type=response.headers.get('content-type')||'';if(type.includes('text/html')&&['/author','/author.html'].includes(url.pathname.replace(/\/$/,'')))return inject(response);return response}};
