import app from './final-polish-v2.js';

const ADMIN_LABELS = `
<script>
(()=>{
  const byHref=(href,text)=>{const el=document.querySelector('.top .actions a[href="'+href+'"]');if(el)el.textContent=text};
  byHref('./index.html','閲覧トップ');
  byHref('./author.html','記録を書く');
  byHref('./status.html','システム診断');
  for(const h of document.querySelectorAll('h2')){
    if(h.textContent.trim()==='BOOK SETTINGS｜運用設定')h.textContent='COLLECTION SETTINGS｜公開・運用設定';
  }
  for(const label of document.querySelectorAll('.field > label')){
    if(label.textContent.trim()==='閲覧状態')label.textContent='公開状態';
  }
  const open=document.querySelector('label.check');
  if(open&&open.textContent.includes('文集を閲覧可能にする')){
    for(const node of open.childNodes){
      if(node.nodeType===Node.TEXT_NODE&&node.textContent.includes('文集を閲覧可能にする'))node.textContent=' 記録を公開する';
    }
  }
})();
</script>`;

export default {
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx);
    const type=response.headers.get('content-type')||'';
    if(!type.includes('text/html'))return response;
    const path=new URL(request.url).pathname.replace(/\/$/,'')||'/';
    let transformed=new HTMLRewriter().on('head',{element(el){el.append('<style>.preview,.previewbar{pointer-events:none}</style>',{html:true})}}).transform(response);
    if(path==='/admin'||path==='/admin.html'){
      transformed=new HTMLRewriter().on('body',{element(el){el.append(ADMIN_LABELS,{html:true})}}).transform(transformed);
    }
    return transformed;
  }
};
