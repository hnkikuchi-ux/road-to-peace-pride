import app from './faithful-cover-v11-r7.js';

const R8 = `
<style>
/* faithful v11-r8 — final solemn author control polish */
body.rpp-author-r5 #rppOrgSelect{
  -webkit-appearance:none!important;appearance:none!important;
  color:#fff!important;-webkit-text-fill-color:#fff!important;
  padding-right:46px!important;
  border:1px solid rgba(239,217,141,.62)!important;
  background:
    linear-gradient(45deg,transparent 50%,#d8b866 50%) calc(100% - 19px) 50%/6px 6px no-repeat,
    linear-gradient(135deg,#d8b866 50%,transparent 50%) calc(100% - 14px) 50%/6px 6px no-repeat,
    linear-gradient(180deg,#071a37,#041225)!important;
  box-shadow:inset 0 0 0 1px rgba(255,239,180,.035),0 8px 24px rgba(0,0,0,.12)!important;
}
body.rpp-author-r5 #rppOrgSelect:hover,
body.rpp-author-r5 #rppOrgSelect:focus{
  border-color:#efd98d!important;
  box-shadow:0 0 0 3px rgba(216,184,102,.10),inset 0 0 0 1px rgba(255,239,180,.045)!important;
}
body.rpp-author-r5 #rppOrgSelect option{background:#071832!important;color:#fff!important}
body.rpp-author-r5 #editor .rpp-form-section label{
  color:#f2e7c9!important;opacity:1!important;font-weight:650!important;
}
body.rpp-author-r5 #editor .rpp-section-desc{color:#aeb8ca!important;opacity:1!important}
body.rpp-author-r5 #editor .rpp-meta-note{color:#c3cad7!important}
body.rpp-author-r5 #editor .rpp-date-tools .note{color:#aeb8ca!important}
</style>`;

function inject(response){return new HTMLRewriter().on('body',{element(el){el.append(R8,{html:true})}}).transform(response)}

export default {
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx),type=response.headers.get('content-type')||'';
    if(type.includes('text/html'))return inject(response);
    return response;
  }
};
