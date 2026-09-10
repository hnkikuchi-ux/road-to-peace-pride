import app from './faithful-cover-v11-r30.js';

const GUIDE_STYLE=`<style id="rppAuthorFirstTimeGuideR31Fixed">
/* The first-time guide is real markup in author.html so its position and
   accessible text stay stable while the page initializes. */
#rppFirstTimeGuide{
  display:block!important;
  margin:14px 0 18px!important;
  padding:12px 13px!important;
  border:1px solid rgba(181,137,49,.48)!important;
  border-left:4px solid #c99b39!important;
  background:rgba(216,184,102,.10)!important;
  color:#27344b!important;
  font-family:ui-sans-serif,system-ui,"Yu Gothic",sans-serif!important;
  font-size:14px!important;
  font-weight:500!important;
  font-style:normal!important;
  line-height:1.7!important;
  letter-spacing:0!important;
  text-align:left!important;
  white-space:normal!important;
  text-shadow:none!important;
  transition:none!important;
  animation:none!important;
}
#rppFirstTimeGuide b{font-weight:800!important}
@media(max-width:560px){
  #rppFirstTimeGuide{margin:12px 0 16px!important;padding:11px 12px!important;font-size:14px!important;line-height:1.7!important}
}
</style>`;

function injectAuthor(response){
  const headers=new Headers(response.headers);
  headers.set('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');
  headers.set('Pragma','no-cache');
  headers.set('Expires','0');
  headers.delete('Content-Length');
  return new HTMLRewriter()
    .on('html',{element(el){el.setAttribute('data-rpp-first-time-guide','r31-markup-fixed')}})
    .on('head',{element(el){el.append(GUIDE_STYLE,{html:true})}})
    .transform(new Response(response.body,{status:response.status,statusText:response.statusText,headers}));
}

export default{
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx);
    const url=new URL(request.url);
    const path=url.pathname.replace(/\/$/,'')||'/';
    const type=response.headers.get('content-type')||'';
    if(type.includes('text/html')&&['/author','/author.html'].includes(path))return injectAuthor(response);
    return response;
  }
};
