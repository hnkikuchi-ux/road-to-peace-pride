import app from './faithful-cover-v11-r6.js';

const R7 = `
<style>
/* faithful v11-r7 — solemn district chapters + Japanese author metadata */
:root{--r7-navy:#061226;--r7-navy2:#0b1d3c;--r7-gold:#d8b866;--r7-gold2:#efd98d}

/* Author metadata controls */
body.rpp-author-r5 select#rppOrgSelect,
body.rpp-author-r5 input#rppRecordDateDisplay{
  width:100%;min-height:48px;border:1px solid rgba(216,184,102,.44);border-radius:8px;
  background:rgba(2,16,37,.92);color:#fff;padding:12px 13px;font-size:15px;outline:none;
  -webkit-text-fill-color:#fff;
}
body.rpp-author-r5 select#rppOrgSelect:focus,
body.rpp-author-r5 input#rppRecordDateDisplay:focus{
  border-color:var(--r7-gold2);box-shadow:0 0 0 3px rgba(216,184,102,.10)
}
body.rpp-author-r5 select#rppOrgSelect option{background:#071832;color:#fff}
body.rpp-author-r5 #org.rpp-native-org,
body.rpp-author-r5 #record_date.rpp-native-date{
  position:absolute!important;width:1px!important;height:1px!important;min-height:1px!important;
  padding:0!important;margin:0!important;opacity:0!important;pointer-events:none!important;
}
.rpp-meta-note{margin-top:8px;padding:10px 11px;border-left:2px solid rgba(239,217,141,.72);background:rgba(216,184,102,.055);color:#b9c0cf;font-size:11px;line-height:1.75}
.rpp-date-tools{display:flex;gap:8px;align-items:center;margin-top:8px;flex-wrap:wrap}
.rpp-date-tools .btn{width:auto!important;min-height:38px!important;padding:7px 12px!important;font-size:11px!important}

/* Solemn district index */
body.rpp-district-book #toc{position:relative}
body.rpp-district-book #toc:before{
  content:'';position:absolute;inset:0;pointer-events:none;opacity:.42;
  background:radial-gradient(circle at 12% 8%,rgba(255,231,151,.50) 0 1px,transparent 1.4px),
             radial-gradient(circle at 83% 14%,rgba(255,255,255,.34) 0 1px,transparent 1.4px),
             radial-gradient(circle at 55% 31%,rgba(231,187,79,.34) 0 1px,transparent 1.5px);
  background-size:123px 113px,171px 151px,197px 181px;
}
body.rpp-district-book #toc>*{position:relative;z-index:1}
.rpp-index-intro{text-align:center;margin:0 auto 26px;max-width:620px}
.rpp-index-kicker{font:800 10px/1.4 ui-sans-serif,system-ui;letter-spacing:.28em;color:var(--r7-gold2)}
.rpp-index-intro h2{font-size:clamp(26px,7vw,38px)!important;letter-spacing:.07em;margin:10px 0 8px!important;color:#fff}
.rpp-index-intro p{font-size:12px;line-height:1.9;color:#b9c0cf;margin:0 auto}
.rpp-district-nav{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:22px 0 30px}
.rpp-district-nav button{
  min-height:46px;border:1px solid rgba(216,184,102,.38);border-radius:2px;
  background:linear-gradient(180deg,rgba(12,31,62,.86),rgba(5,17,39,.88));color:#efe5c8;
  font-family:ui-serif,'Yu Mincho',serif;font-size:12px;letter-spacing:.05em;cursor:pointer;
  box-shadow:inset 0 0 0 1px rgba(255,236,171,.025)
}
.rpp-district-nav button:hover,.rpp-district-nav button:focus{border-color:rgba(239,217,141,.82);color:#fff;outline:none}
.rpp-district-section{margin:0 0 34px;scroll-margin-top:86px}
.rpp-district-section.rpp-empty-filter{display:none}
.rpp-district-head{display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;margin-bottom:8px;padding:15px 4px 13px;border-top:1px solid rgba(239,217,141,.52);border-bottom:1px solid rgba(216,184,102,.20)}
.rpp-chapter-no{font:800 9px/1.35 ui-sans-serif,system-ui;letter-spacing:.18em;color:#bba36d;white-space:nowrap}
.rpp-district-name{font-family:ui-serif,'Yu Mincho',serif;font-size:clamp(19px,5.5vw,25px);letter-spacing:.10em;color:#fff}
.rpp-district-count{font:700 10px/1.4 ui-sans-serif,system-ui;color:#d8c58e;white-space:nowrap}
.rpp-district-section .toc-item{margin:0;border-top:0!important;border-bottom:1px solid rgba(216,184,102,.17)!important}
.rpp-district-section .toc-item button{padding:18px 7px!important}
.rpp-district-section .toc-title{color:#fff}
.rpp-district-section .toc-name{color:#b8c0d0}
.rpp-district-empty{padding:17px 6px 22px;color:#7f899d;font-size:11px;line-height:1.8;text-align:center;border-bottom:1px solid rgba(216,184,102,.12)}
.rpp-legacy-section .rpp-district-head{opacity:.68}
body.rpp-district-book #toc>h2,body.rpp-district-book #toc>p.note{display:none!important}

/* Reader continues the same chapter-book language */
body.rpp-district-book .paper{box-shadow:0 26px 86px rgba(0,0,0,.48),inset 0 0 0 1px rgba(157,123,45,.15)}
body.rpp-district-book .story-label{letter-spacing:.24em}

@media(max-width:520px){
  .rpp-district-nav{grid-template-columns:repeat(2,1fr);gap:7px}
  .rpp-district-nav button{min-height:44px;font-size:11px}
  .rpp-district-head{grid-template-columns:1fr auto;gap:6px 10px}
  .rpp-chapter-no{grid-column:1/-1}
  .rpp-district-name{font-size:20px}
}
</style>
<script>
(()=>{
  const GROUPS=['中区','南総区','港南総区','磯子総区','金沢総区','栄区'];
  const ready=(fn)=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
  const pad2=n=>String(n).padStart(2,'0');
  const jDate=(v)=>{
    const s=String(v||'').trim(),m=s.match(/^(\\d{4})[-\\/](\\d{1,2})[-\\/](\\d{1,2})$/);
    if(!m)return s;return Number(m[1])+'/'+Number(m[2])+'/'+Number(m[3]);
  };
  const isoDate=(v)=>{
    const s=String(v||'').trim(),m=s.match(/^(\\d{4})[-\\/](\\d{1,2})[-\\/](\\d{1,2})$/);
    if(!m)return '';
    const y=Number(m[1]),mo=Number(m[2]),d=Number(m[3]);
    const dt=new Date(y,mo-1,d);if(dt.getFullYear()!==y||dt.getMonth()!==mo-1||dt.getDate()!==d)return '';
    return y+'-'+pad2(mo)+'-'+pad2(d);
  };
  const resolveGroup=(s,i)=>{
    const raw=String((s&&s.org)||'');
    for(const g of GROUPS)if(raw===g||raw.includes(g))return g;
    if(String(s&&s.id||'').startsWith('sample-'))return GROUPS[i%GROUPS.length];
    return '未分類';
  };

  function authorMeta(){
    const org=document.getElementById('org'),date=document.getElementById('record_date');
    if(!org||!date)return;
    document.body.classList.add('rpp-author-r7');

    if(!document.getElementById('rppOrgSelect')){
      org.classList.add('rpp-native-org');
      const field=org.closest('.field'),label=field&&field.querySelector('label');
      if(label)label.textContent='総区（掲載する章）';
      const sel=document.createElement('select');sel.id='rppOrgSelect';sel.setAttribute('aria-label','総区を選択');
      sel.innerHTML='<option value="">総区を選択してください</option>'+GROUPS.map(g=>'<option value="'+g+'">'+g+'</option>').join('');
      org.insertAdjacentElement('beforebegin',sel);
      const note=document.createElement('div');note.className='rpp-meta-note';note.innerHTML='皆さまの記録を、<b>総区ごとの章に分けて掲載するため</b>に使用します。掲載したい総区を1つ選択してください。';
      sel.insertAdjacentElement('afterend',note);
      const sync=()=>{
        const raw=String(org.value||'');const found=GROUPS.find(g=>raw===g||raw.includes(g))||'';
        if(found)sel.value=found;
      };
      sel.addEventListener('change',()=>{org.value=sel.value;org.dispatchEvent(new Event('input',{bubbles:true}));org.dispatchEvent(new Event('change',{bubbles:true}))});
      sel.addEventListener('focus',sync);sync();setTimeout(sync,80);setTimeout(sync,350);
    }

    if(!document.getElementById('rppRecordDateDisplay')){
      date.classList.add('rpp-native-date');
      const field=date.closest('.field'),label=field&&field.querySelector('label');
      if(label)label.textContent='記載日';
      const display=document.createElement('input');display.id='rppRecordDateDisplay';display.type='text';display.inputMode='numeric';display.placeholder='例：2026/9/5';display.autocomplete='off';
      date.insertAdjacentElement('beforebegin',display);
      const tools=document.createElement('div');tools.className='rpp-date-tools';
      const pick=document.createElement('button');pick.type='button';pick.className='btn secondary';pick.textContent='カレンダーから選ぶ';
      const note=document.createElement('span');note.className='note';note.textContent='日本式（例：2026/9/5）で表示します。';
      tools.append(pick,note);display.insertAdjacentElement('afterend',tools);
      const fromNative=()=>{if(date.value)display.value=jDate(date.value)};
      const toNative=()=>{const iso=isoDate(display.value);if(!iso)return;date.value=iso;display.value=jDate(iso);date.dispatchEvent(new Event('input',{bubbles:true}));date.dispatchEvent(new Event('change',{bubbles:true}))};
      display.addEventListener('change',toNative);display.addEventListener('blur',toNative);
      date.addEventListener('change',fromNative);
      pick.onclick=()=>{try{if(date.showPicker)date.showPicker()}catch(e){}};
      fromNative();setTimeout(fromNative,80);setTimeout(fromNative,350);
    }

    const sel=document.getElementById('rppOrgSelect');
    const guard=(btn)=>btn&&btn.addEventListener('click',e=>{
      if(sel&&!sel.value){e.preventDefault();e.stopImmediatePropagation();const msg=document.getElementById('savemsg');if(msg){msg.textContent='掲載する総区を選択してください。';msg.className='note warn'}sel.focus()}
    },true);
    ['previewBtn','submit','submitPreview'].forEach(id=>{const b=document.getElementById(id);if(b&&!b.dataset.r7Guard){b.dataset.r7Guard='1';guard(b)}});
  }

  let organizing=false;
  function ensureIntro(){
    const toc=document.getElementById('toc'),list=document.getElementById('tocList');if(!toc||!list)return;
    document.body.classList.add('rpp-district-book');
    if(document.getElementById('rppIndexIntro'))return;
    const intro=document.createElement('div');intro.id='rppIndexIntro';intro.className='rpp-index-intro';
    intro.innerHTML='<div class="rpp-index-kicker">OUR VOW, OUR JOURNEY</div><h2>総区別の記録</h2><p>一人ひとりが綴った挑戦と誓いの記録を、総区ごとの章に分けて掲載しています。</p><div id="rppDistrictNav" class="rpp-district-nav"></div>';
    list.insertAdjacentElement('beforebegin',intro);
    const nav=intro.querySelector('#rppDistrictNav');
    GROUPS.forEach((g,i)=>{const b=document.createElement('button');b.type='button';b.textContent=g;b.onclick=()=>document.getElementById('rppDistrict-'+i)?.scrollIntoView({behavior:'smooth',block:'start'});nav.appendChild(b)});
  }
  function organizeToc(){
    const list=document.getElementById('tocList');if(!list||organizing)return;
    const flat=[...list.children].filter(x=>x.classList&&x.classList.contains('toc-item'));
    if(!flat.length){bindSearch();return}
    let ss=[];try{ss=stories||[]}catch(e){return}
    organizing=true;
    const buckets=new Map(GROUPS.map(g=>[g,[]]));buckets.set('未分類',[]);
    flat.forEach((item,i)=>{const s=ss[i]||{},g=resolveGroup(s,i);item.dataset.rppGroup=g;item.dataset.rppSearch=((s.title||'')+' '+(s.name||'')).toLowerCase();buckets.get(g).push(item)});
    list.textContent='';
    [...GROUPS,'未分類'].forEach((g,gi)=>{
      const items=buckets.get(g)||[];if(g==='未分類'&&!items.length)return;
      const sec=document.createElement('section');sec.className='rpp-district-section'+(g==='未分類'?' rpp-legacy-section':'');if(g!=='未分類')sec.id='rppDistrict-'+gi;
      const no=g==='未分類'?'ARCHIVE':'CHAPTER '+String(gi+1).padStart(2,'0');
      sec.innerHTML='<div class="rpp-district-head"><div class="rpp-chapter-no">'+no+'</div><div class="rpp-district-name">'+g+'</div><div class="rpp-district-count">'+items.length+' RECORD'+(items.length===1?'':'S')+'</div></div>';
      if(items.length)items.forEach(x=>sec.appendChild(x));else{const e=document.createElement('div');e.className='rpp-district-empty';e.textContent='この章の記録は、これから掲載されます。';sec.appendChild(e)}
      list.appendChild(sec);
    });
    organizing=false;bindSearch();filterGroups();
  }
  function filterGroups(){
    const input=document.getElementById('tocSearch'),q=String(input&&input.value||'').trim().toLowerCase();
    document.querySelectorAll('.rpp-district-section').forEach(sec=>{
      const items=[...sec.querySelectorAll('.toc-item')];let visible=0;
      items.forEach(item=>{const ok=!q||String(item.dataset.rppSearch||item.textContent||'').toLowerCase().includes(q);item.style.display=ok?'':'none';if(ok)visible++});
      sec.classList.toggle('rpp-empty-filter',!!q&&visible===0);
    });
  }
  function bindSearch(){const s=document.getElementById('tocSearch');if(s&&s.dataset.r7Bound!=='1'){s.dataset.r7Bound='1';s.addEventListener('input',()=>setTimeout(filterGroups,0))}}

  function readerDate(){
    let s;try{s=stories[current]}catch(e){return}if(!s)return;
    const meta=document.getElementById('meta');if(!meta)return;
    const idx=current||0,g=resolveGroup(s,idx),vals=[s.name,g==='未分類'?(s.org||''):g,jDate(s.record_date)].filter(Boolean);
    meta.textContent='';vals.forEach((v,i)=>{meta.append(document.createTextNode(v));if(i<vals.length-1)meta.append(document.createElement('br'))});
  }

  ready(()=>{
    authorMeta();ensureIntro();
    const editor=document.getElementById('editor');if(editor)new MutationObserver(()=>{setTimeout(authorMeta,30);setTimeout(()=>{const d=document.getElementById('recordDateDisplay')||document.getElementById('rppRecordDateDisplay');const n=document.getElementById('record_date');if(d&&n&&n.value)d.value=jDate(n.value);const s=document.getElementById('rppOrgSelect'),o=document.getElementById('org');if(s&&o){const f=GROUPS.find(g=>String(o.value||'').includes(g));if(f)s.value=f}},120)}).observe(editor,{attributes:true,attributeFilter:['class']});
    const list=document.getElementById('tocList');if(list){new MutationObserver(()=>{if(!organizing)setTimeout(organizeToc,0)}).observe(list,{childList:true});setTimeout(organizeToc,120)}
    const tocBtn=document.getElementById('tocBtn');if(tocBtn)tocBtn.addEventListener('click',()=>{setTimeout(ensureIntro,0);setTimeout(organizeToc,20);setTimeout(organizeToc,180)});
    const back=document.getElementById('backToc');if(back)back.addEventListener('click',()=>{setTimeout(organizeToc,20);setTimeout(organizeToc,180)});
    const reader=document.getElementById('reader');if(reader)new MutationObserver(()=>setTimeout(readerDate,0)).observe(reader,{attributes:true,attributeFilter:['class']});
    ['next','prev','resumeBtn'].forEach(id=>document.getElementById(id)?.addEventListener('click',()=>setTimeout(readerDate,0)));
    setTimeout(readerDate,200);
  });
})();
</script>`;

function inject(response){return new HTMLRewriter().on('body',{element(el){el.append(R7,{html:true})}}).transform(response)}

export default {
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx),type=response.headers.get('content-type')||'';
    if(type.includes('text/html'))return inject(response);
    return response;
  }
};
