import uiWorker from './ui-enhancer.js';

export default {
  async fetch(request,env,ctx){
    const url=new URL(request.url);
    if(url.pathname==='/author'){
      url.pathname='/author.html';
      return uiWorker.fetch(new Request(url.toString(),request),env,ctx);
    }
    return uiWorker.fetch(request,env,ctx);
  }
};
