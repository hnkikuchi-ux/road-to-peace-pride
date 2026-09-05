import os, re, time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select

BASE=os.environ.get('RPP_BASE_URL','https://road-to-peace-pride.hn-kikuchi.workers.dev')
os.makedirs('artifacts/screens',exist_ok=True)
GROUPS=['中区','南総区','港南総区','磯子総区','金沢総区','栄区']

def check(ok,label):
    if not ok: raise AssertionError(label)
    print('  ✓ '+label)

def driver():
    o=Options();o.add_argument('--headless=new');o.add_argument('--no-sandbox');o.add_argument('--disable-dev-shm-usage');o.add_argument('--window-size=390,844')
    return webdriver.Chrome(options=o)

print('1) Luxury accordion contents + TOC search')
d=driver();w=WebDriverWait(d,15)
try:
    d.get(BASE+'/')
    w.until(EC.visibility_of_element_located((By.ID,'pw'))).send_keys('demo')
    d.execute_script("arguments[0].click()",w.until(EC.visibility_of_element_located((By.ID,'unlock'))))
    w.until(EC.visibility_of_element_located((By.ID,'tocBtn'))).click()
    w.until(lambda x:len(x.find_elements(By.CSS_SELECTOR,'.rpp-district-section:not(.rpp-legacy-section)'))==6)
    names=[x.text for x in d.find_elements(By.CSS_SELECTOR,'.rpp-district-section:not(.rpp-legacy-section) .rpp-district-name')]
    check(names==GROUPS,'six organization names appear in the required order')
    check(len(d.find_elements(By.ID,'rppDistrictNav'))==0 or not d.find_element(By.ID,'rppDistrictNav').is_displayed(),'old district navigation is hidden')
    check('総区別' not in d.find_element(By.ID,'toc').text,'district-grouping wording is not shown')
    sections=d.find_elements(By.CSS_SELECTOR,'.rpp-district-section:not(.rpp-legacy-section)')
    check(all('rpp-open' not in s.get_attribute('class') for s in sections),'all organization sections start closed')
    heads=d.find_elements(By.CSS_SELECTOR,'.rpp-district-section:not(.rpp-legacy-section) .rpp-district-head')
    d.execute_script("arguments[0].click()",heads[0]);time.sleep(.25)
    check('rpp-open' in sections[0].get_attribute('class'),'tapping an organization opens its records below')
    d.execute_script("arguments[0].click()",heads[1]);time.sleep(.25)
    check('rpp-open' not in sections[0].get_attribute('class') and 'rpp-open' in sections[1].get_attribute('class'),'opening another organization closes the previous one')
    family=d.execute_script("return getComputedStyle(arguments[0]).fontFamily",d.find_elements(By.CLASS_NAME,'rpp-district-name')[0])
    check(('Bodoni' in family) or ('Didot' in family) or ('Times' in family),'organization headings use luxury serif typography')
    search=w.until(EC.visibility_of_element_located((By.ID,'tocSearch')))
    check('題名・氏名' in search.get_attribute('placeholder'),'TOC search remains title/name only')
    d.save_screenshot('artifacts/screens/index-r9-luxury-accordion.png')
finally:
    d.quit()

print('2) Author edit-code checkpoint, organization select, Japanese date')
d=driver();w=WebDriverWait(d,15)
try:
    d.get(BASE+'/author.html')
    check('私の記録を綴る' in w.until(EC.visibility_of_element_located((By.CSS_SELECTOR,'#auth h1'))).text,'author heading matches product language')
    email=f'ux-{int(time.time())}@example.invalid'
    w.until(EC.visibility_of_element_located((By.ID,'email'))).send_keys(email)
    d.find_element(By.ID,'send').click()
    msg=w.until(lambda x:x.find_element(By.ID,'authmsg').text)
    m=re.search(r'(\d{6})',msg);check(bool(m),'preview OTP is available')
    d.find_element(By.ID,'otp').send_keys(m.group(1));d.find_element(By.ID,'verify').click()
    checkpoint=w.until(EC.visibility_of_element_located((By.ID,'rppCodeCheckpoint')))
    check(checkpoint.is_displayed(),'edit-code checkpoint appears before writing')
    d.find_element(By.ID,'rppCodeSaved').click();d.find_element(By.ID,'rppCheckpointContinue').click()
    w.until(EC.visibility_of_element_located((By.ID,'editor')))
    org_select=w.until(EC.visibility_of_element_located((By.ID,'rppOrgSelect')))
    options=[o.text for o in Select(org_select).options][1:]
    check(options==GROUPS,'author can choose exactly the six publication organizations')
    date_display=w.until(EC.visibility_of_element_located((By.ID,'rppRecordDateDisplay')))
    w.until(lambda x:bool(re.match(r'^\d{4}/\d{1,2}/\d{1,2}$',x.find_element(By.ID,'rppRecordDateDisplay').get_attribute('value') or '')))
    check(bool(re.match(r'^\d{4}/\d{1,2}/\d{1,2}$',date_display.get_attribute('value'))),'date is displayed in Japanese YYYY/M/D format')
    Select(org_select).select_by_visible_text('磯子総区')
    check(d.find_element(By.ID,'org').get_attribute('value')=='磯子総区','selected organization is stored as organization only')
    d.save_screenshot('artifacts/screens/author-r9-editor.png')
finally:
    d.quit()

print('UX REGRESSION PASSED')
