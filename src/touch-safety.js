import app from './final-polish-v2.js';

export default {
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx);
    const type=response.headers.get('content-type')||'';
    if(!type.includes('text/html'))return response;
    return new HTMLRewriter().on('head',{element(el){el.append('<style>.preview,.previewbar{pointer-events:none}</style>',{html:true})}}).transform(response);
  }
};
