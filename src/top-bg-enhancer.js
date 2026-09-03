import uiWorker from './ui-enhancer.js';

// Legacy top-art renderer retired.
// The approved 941x1672 master artwork is now owned by exact-cover.js / exact-cover-avif.js.
// Keep this module as a compatibility pass-through so the established wrapper chain remains stable.
export default {
  async fetch(request,env,ctx){
    return uiWorker.fetch(request,env,ctx);
  }
};
