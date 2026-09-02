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

const TOP_FINAL = `
<style>
#gate #gateAuthorLink.rpp-action{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;line-height:1!important}
#gate #gateAuthorLink.rpp-action .rpp-ja{display:block!important;font-family:ui-serif,"Yu Mincho","Hiragino Mincho ProN",serif!important;font-weight:600!important;letter-spacing:.08em!important}
#gate #gateAuthorLink.rpp-action .rpp-en{display:block!important;margin-top:.42em!important;font-family:ui-serif,"Times New Roman",serif!important;font-weight:600!important;letter-spacing:.16em!important;color:#dfbd67!important}
@media(max-width:899px){#gate #gateAuthorLink.rpp-action .rpp-ja{font-size:clamp(16px,4.3vw,24px)!important}#gate #gateAuthorLink.rpp-action .rpp-en{font-size:clamp(8px,2.35vw,12px)!important}}
@media(min-width:900px){#gate #gateAuthorLink{top:83%!important;height:58px!important}#gate #gateAuthorLink.rpp-action .rpp-ja{font-size:15px!important}#gate #gateAuthorLink.rpp-action .rpp-en{font-size:9px!important}}
</style>
<script>
(()=>{
 const author=document.querySelector('#gateAuthorLink');
 if(author){author.setAttribute('aria-label','私の記録を綴る / WRITE YOUR STORY');author.innerHTML='<span class="rpp-ja">私の記録を綴る</span><span class="rpp-en">WRITE YOUR STORY</span>'}
 const open=document.querySelector('#unlock');if(open){open.textContent='記録をひらく';open.setAttribute('aria-label','記録をひらく')}
})();
</script>`;

export default {
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx);
    const type=response.headers.get('content-type')||'';
    if(!type.includes('text/html'))return response;
    const path=new URL(request.url).pathname.replace(/\/$/,'')||'/';
    let transformed=new HTMLRewriter().on('head',{element(el){el.append('<style>.preview,.previewbar{pointer-events:none}</style>',{html:true})}}).transform(response);
    if(path==='/'||path==='/index.html'){
      transformed=new HTMLRewriter().on('body',{element(el){el.append(TOP_FINAL,{html:true})}}).transform(transformed);
    }
    if(path==='/admin'||path==='/admin.html'){
      transformed=new HTMLRewriter().on('body',{element(el){el.append(ADMIN_LABELS,{html:true})}}).transform(transformed);
    }
    return transformed;
  }
};
