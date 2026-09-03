import app from './premium-v5.js';

function cacheHeaders(response, clear=false){
  const headers=new Headers(response.headers);
  headers.set('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');
  headers.set('Pragma','no-cache');
  headers.set('Expires','0');
  headers.set('CDN-Cache-Control','no-store');
  headers.set('Cloudflare-CDN-Cache-Control','no-store');
  if(clear) headers.set('Clear-Site-Data','"cache"');
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}

export default {
  async fetch(request,env,ctx){
    const url=new URL(request.url);
    if(url.pathname==='/refresh'||url.pathname==='/latest'){
      const root=new URL(url);
      root.pathname='/';
      root.searchParams.set('fresh','20260903-v6-refined');
      const forwarded=new Request(root.toString(),request);
      const response=await app.fetch(forwarded,env,ctx);
      return cacheHeaders(response,true);
    }
    const response=await app.fetch(request,env,ctx);
    if(url.pathname==='/'||url.pathname==='/index.html') return cacheHeaders(response,false);
    return response;
  }
};
