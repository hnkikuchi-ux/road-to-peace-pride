import app from './faithful-cover-v11-r17.js';

const HUMAN_CONFIRMATION_SOURCE='human-receipt-confirmed-2026-09-07';

async function hasStoredEmailConfig(env){
  if(env.BREVO_API_KEY&&env.OTP_SENDER_EMAIL)return true;
  try{
    const rows=(await env.DB.prepare("SELECT key,value FROM rpp_settings WHERE key IN ('brevo_api_key_enc','otp_sender_email')").all()).results||[];
    const m=Object.fromEntries(rows.map(r=>[r.key,String(r.value||'')]));
    return Boolean(m.brevo_api_key_enc.trim()&&m.otp_sender_email.trim());
  }catch{return false}
}

async function applyHumanReceiptConfirmation(env){
  try{
    const row=await env.DB.prepare("SELECT value FROM rpp_settings WHERE key='email_delivery_verification_source'").first();
    if(row?.value)return;
    if(!await hasStoredEmailConfig(env))return;
    const now=new Date().toISOString();
    await env.DB.batch([
      env.DB.prepare("INSERT INTO rpp_settings(key,value) VALUES('email_delivery_verified_at',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(now),
      env.DB.prepare("INSERT INTO rpp_settings(key,value) VALUES('email_delivery_verification_source',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(HUMAN_CONFIRMATION_SOURCE)
    ]);
  }catch(e){console.error('human delivery confirmation bootstrap failed',e)}
}

export default{
  async fetch(request,env,ctx){
    await applyHumanReceiptConfirmation(env);
    return app.fetch(request,env,ctx);
  }
};
