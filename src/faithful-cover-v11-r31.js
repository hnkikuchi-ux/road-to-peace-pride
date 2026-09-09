import app from './faithful-cover-v11-r30.js';

const GUIDE_STYLE=`<style id="rppAuthorFirstTimeGuideR31">
/* r31.2: keep the author entrance visually stable even while legacy scripts reorder DOM nodes */
#auth{display:flex!important;flex-direction:column!important}
#auth>*{order:20}
#auth>.ey{order:0}
#auth>h1{order:1}
#auth>#rppFirstTimeGuide{order:2}
#auth>.field{order:3}
#auth>#send{order:4}
#auth>.rpp-author-guide{order:5}
#auth>#otpbox{order:6}
#auth>#rppEditLogin{order:7}
#auth>#deadlineAuth{order:8}
#auth>#authmsg{order:9}
#auth>.rpp-auth-tabs{order:19}
#auth>#rppRecognitionHelp{display:none!important}
#auth>h1::after{content:none!important;display:none!important}
#rppFirstTimeGuide{
  display:block!important;
  margin:8px 0 16px!important;
  padding:11px 13px!important;
  border:1px solid rgba(181,137,49,.48)!important;
  border-left:4px solid #c99b39!important;
  background:rgba(216,184,102,.10)!important;
  color:#27344b!important;
  font-family:ui-sans-serif,system-ui,"Yu Gothic",sans-serif!important;
  font-size:14px!important;
  font-weight:500!important;
  line-height:1.65!important;
  letter-spacing:0!important;
  text-align:left!important;
  white-space:normal!important;
  transition:none!important;
  animation:none!important;
}
#rppFirstTimeGuide b{
  display:block!important;
  margin:0 0 3px!important;
  color:#1f2d49!important;
  font:800 15px/1.45 ui-sans-serif,system-ui,"Yu Gothic",sans-serif!important;
  letter-spacing:0!important;
}
#rppFirstTimeGuide span{
  color:#465063!important;
  font:500 14px/1.65 ui-sans-serif,system-ui,"Yu Gothic",sans-serif!important;
  letter-spacing:0!important;
}
@media(max-width:560px){
  #rppFirstTimeGuide{margin:7px 0 14px!important;padding:10px 12px!important;font-size:13px!important}
  #rppFirstTimeGuide b{font-size:14px!important}
  #rppFirstTimeGuide span{font-size:13px!important}
}
</style>`;

const GUIDE_HTML=`<div id="rppFirstTimeGuide" role="note"><b>初めての方</b><span>メールアドレスを入力して「認識コードを送信」を押してください。</span></div>`;

function injectAuthor(response){
  const headers=new Headers(response.headers);
  headers.set('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');
  headers.set('Pragma','no-cache');
  headers.set('Expires','0');
  headers.delete('Content-Length');
  let inserted=false;
  return new HTMLRewriter()
    .on('html',{element(el){el.setAttribute('data-rpp-first-time-guide','r31-static-stable')}})
    .on('head',{element(el){el.append(GUIDE_STYLE,{html:true})}})
    .on('#auth h1',{element(el){if(!inserted){inserted=true;el.after(GUIDE_HTML,{html:true})}}})
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
