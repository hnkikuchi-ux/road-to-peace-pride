import os,time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE=os.environ.get('RPP_BASE_URL','https://road-to-peace-pride.hn-kikuchi.workers.dev')
GROUPS=['中区','南総区','港南総区','磯子総区','金沢総区','栄区']

def check(ok,label):
    if not ok: raise AssertionError(label)
    print('  ✓ '+label,flush=True)

o=Options();o.add_argument('--headless=new');o.add_argument('--no-sandbox');o.add_argument('--disable-dev-shm-usage');o.add_argument('--window-size=390,844')
d=webdriver.Chrome(options=o);w=WebDriverWait(d,20)
try:
    d.get(BASE+'/')
    # Current product flow is password -> consent -> cover with CONTENTS directly below.
    # Consent was already tested in full_product_qa, so remember it here and isolate scale.
    d.execute_script("localStorage.setItem('rpp_viewer_consent_v1','1')")
    d.execute_script("""
      const groups=['中区','南総区','港南総区','磯子総区','金沢総区','栄区'];
      const fake=Array.from({length:300},(_,i)=>({
        id:'scale-'+i,record_date:'2026-09-'+String((i%28)+1).padStart(2,'0'),
        org:groups[i%groups.length],soku:groups[i%groups.length],name:'投稿者 '+String(i+1),
        title:'300人運用テスト '+String(i+1),body:'本文テスト '.repeat(80),status:'submitted',has_photo:i%2===0
      }));
      const nativeFetch=window.fetch.bind(window);
      window.fetch=async(input,init)=>{
        const u=typeof input==='string'?input:(input&&input.url)||'';
        if(u.includes('/api/stories')){
          window.__scaleStoriesRequestedAt=performance.now();
          return new Response(JSON.stringify({stories:fake}),{status:200,headers:{'Content-Type':'application/json'}});
        }
        return nativeFetch(input,init);
      };
    """)
    w.until(EC.visibility_of_element_located((By.ID,'pw'))).send_keys('demo')
    start=time.perf_counter()
    d.execute_script("arguments[0].click()",w.until(EC.element_to_be_clickable((By.ID,'unlock'))))
    w.until(EC.visibility_of_element_located((By.ID,'toc')))
    w.until(lambda x:len(x.find_elements(By.CSS_SELECTOR,'.rpp-district-section:not(.rpp-legacy-section)'))==6)
    w.until(lambda x:len(x.find_elements(By.CSS_SELECTOR,'.toc-item'))==300)
    elapsed=(time.perf_counter()-start)*1000
    time.sleep(.5)
    check(len(d.find_elements(By.CSS_SELECTOR,'.toc-item'))==300,'300 stories render into the contents')
    check(elapsed<5000,f'300-story load and grouping remains responsive ({elapsed:.0f} ms)')
    sections=d.find_elements(By.CSS_SELECTOR,'.rpp-district-section:not(.rpp-legacy-section)')
    check(len(sections)==6,'300 stories remain grouped into six organizations')
    names=[x.text for x in d.find_elements(By.CSS_SELECTOR,'.rpp-district-section:not(.rpp-legacy-section) .rpp-district-name')]
    check(names==GROUPS,'organization order remains correct at scale')
    counts=[len(s.find_elements(By.CSS_SELECTOR,':scope > .toc-item')) for s in sections]
    check(counts==[50]*6,'300 stories distribute evenly across the six organizations')
    heads=d.find_elements(By.CSS_SELECTOR,'.rpp-district-section:not(.rpp-legacy-section) .rpp-district-head')
    d.execute_script('arguments[0].click()',heads[0]);time.sleep(.45)
    open_sections=[s for s in sections if 'rpp-open' in (s.get_attribute('class') or '')]
    check(len(open_sections)==1,'only one organization opens at a time at scale')
    first_items=open_sections[0].find_elements(By.CSS_SELECTOR,':scope > .toc-item')
    check(len(first_items)==50,'opened organization contains its 50 records')
    displayed=d.execute_script("return [...arguments[0].querySelectorAll(':scope > .toc-item')].every(x=>getComputedStyle(x).display!=='none' && getComputedStyle(x).opacity!=='0')",open_sections[0])
    check(displayed,'opened organization records finish their reveal animation')
    d.execute_script('arguments[0].click()',heads[1]);time.sleep(.45)
    open_sections=[s for s in sections if 'rpp-open' in (s.get_attribute('class') or '')]
    check(len(open_sections)==1 and 'rpp-open' in sections[1].get_attribute('class'),'switching organizations closes the previous one')
    check(d.execute_script('return document.documentElement.scrollWidth<=document.documentElement.clientWidth+2'),'300-story contents has no horizontal overflow on mobile')
    print('300-STORY SCALE REGRESSION PASSED',flush=True)
finally:
    d.quit()
