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
    print('  ✓ '+label)

o=Options();o.add_argument('--headless=new');o.add_argument('--no-sandbox');o.add_argument('--disable-dev-shm-usage');o.add_argument('--window-size=390,844')
d=webdriver.Chrome(options=o);w=WebDriverWait(d,20)
try:
    d.get(BASE+'/')
    w.until(EC.visibility_of_element_located((By.ID,'pw'))).send_keys('demo')
    d.execute_script("arguments[0].click()",w.until(EC.element_to_be_clickable((By.ID,'unlock'))))
    w.until(EC.element_to_be_clickable((By.ID,'tocBtn'))).click()
    w.until(lambda x:len(x.find_elements(By.CSS_SELECTOR,'.rpp-district-section'))>=6)
    elapsed=d.execute_script("""
      const groups=['中区','南総区','港南総区','磯子総区','金沢総区','栄区'];
      const t=performance.now();
      stories=Array.from({length:300},(_,i)=>({
        id:'scale-'+i,record_date:'2026-09-'+String((i%28)+1).padStart(2,'0'),
        org:groups[i%groups.length],soku:groups[i%groups.length],name:'投稿者 '+String(i+1),
        title:'300人運用テスト '+String(i+1),body:'本文テスト '.repeat(80),status:'submitted',has_photo:i%2===0
      }));
      renderToc();
      return performance.now()-t;
    """)
    w.until(lambda x:len(x.find_elements(By.CSS_SELECTOR,'.toc-item'))==300)
    time.sleep(.4)
    check(len(d.find_elements(By.CSS_SELECTOR,'.toc-item'))==300,'300 stories render into the contents')
    check(elapsed<1500,f'300-story render remains responsive ({elapsed:.1f} ms)')
    sections=d.find_elements(By.CSS_SELECTOR,'.rpp-district-section:not(.rpp-legacy-section)')
    check(len(sections)==6,'300 stories remain grouped into six organizations')
    heads=d.find_elements(By.CSS_SELECTOR,'.rpp-district-section:not(.rpp-legacy-section) .rpp-district-head')
    d.execute_script('arguments[0].click()',heads[0]);time.sleep(.15)
    open_sections=[s for s in sections if 'rpp-open' in (s.get_attribute('class') or '')]
    check(len(open_sections)==1,'only one organization opens at a time at scale')
    visible=[x for x in d.find_elements(By.CSS_SELECTOR,'.toc-item') if x.is_displayed()]
    check(len(visible)==50,'opened organization shows its 50 records')
    d.execute_script('arguments[0].click()',heads[1]);time.sleep(.15)
    open_sections=[s for s in sections if 'rpp-open' in (s.get_attribute('class') or '')]
    check(len(open_sections)==1 and 'rpp-open' in sections[1].get_attribute('class'),'switching organizations closes the previous one')
    print('300-STORY SCALE REGRESSION PASSED')
finally:
    d.quit()
