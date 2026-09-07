const {webkit,devices}=require('playwright');
const base=process.env.RPP_BASE_URL||'https://road-to-peace-pride.hn-kikuchi.workers.dev';
(async()=>{
  const browser=await webkit.launch({headless:true});
  const context=await browser.newContext({...devices['iPhone 13']});
  const page=await context.newPage();
  const pageErrors=[];
  page.on('pageerror',e=>pageErrors.push(String(e)));
  await page.goto(base+'/author.html?webkit-syntax-diag='+Date.now(),{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(1200);
  const result=await page.evaluate(()=>[...document.scripts].map((s,i)=>{
    if(s.src)return {i,src:s.src,inline:false};
    const text=s.textContent||'';
    try{new Function(text);return {i,inline:true,ok:true,len:text.length,head:text.slice(0,180)}}
    catch(e){return {i,inline:true,ok:false,len:text.length,error:String(e),head:text.slice(0,700),tail:text.slice(-700)}}
  }));
  console.log('PAGE_ERRORS',JSON.stringify(pageErrors,null,2));
  console.log('INLINE_PARSE_RESULTS');
  for(const r of result){if(r.inline)console.log(JSON.stringify(r));}
  const bad=result.filter(r=>r.inline&&!r.ok);
  if(!bad.length&&pageErrors.length)console.log('No inline parse failure found; error may be in an external script or parser-time HTML transformation.');
  await browser.close();
  if(bad.length)process.exit(2);
  if(pageErrors.length)process.exit(3);
})().catch(e=>{console.error(e);process.exit(1)});
