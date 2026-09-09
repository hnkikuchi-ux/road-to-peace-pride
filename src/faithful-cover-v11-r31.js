import app from './faithful-cover-v11-r30.js';

const GUIDE_STYLE=`<style id="rppAuthorFirstTimeGuideR31">
#rppFirstTimeGuide{display:none!important}
#auth #rppRecognitionHelp{display:none!important}
#auth h1::after{
  content:"初めての方は、メールアドレスを入力し「認識コードを送信」を押してください。";
  display:block;
  margin:14px 0 18px;
  padding:12px 14px;
  border:1px solid rgba(181,137,49,.48);
  border-left:4px solid #c99b39;
  background:rgba(216,184,102,.10);
  color:#1f2d49!important;
  font-family:ui-sans-serif,system-ui,"Yu Gothic",sans-serif!important;
  font-size:14px!important;
  font-weight:700!important;
  line-height:1.75!important;
  letter-spacing:0!important;
  text-align:left!important;
  white-space:normal!important;
  transition:none!important;
  animation:none!important;
}
</style>`;

function injectAuthor(response){
  const headers=new Headers(response.headers);
  headers.set('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');
  headers.delete('Content-Length');
  return new HTMLRewriter()
    .on('html',{element(el){el.setAttribute('data-rpp-first-time-guide','r31-fixed-top')}})
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
