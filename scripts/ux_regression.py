import os, re, time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select

BASE=os.environ.get('RPP_BASE_URL','https://giin-home-cloud-pilot.hn-kikuchi.workers.dev')
os.makedirs('artifacts/screens',exist_ok=True)
GROUPS=['中区','南総区','港南総区','磯子総区','金沢総区','栄区']

def check(ok,label):
    if not ok: raise AssertionError(label)
    print('  ✓ '+label)

def driver():
    o=Options();o.add_argument('--headless=new');o.add_argument('--no-sandbox');o.add_argument('--disable-dev-shm-usage');o.add_argument('--window-size=390,844')
    return webdriver.Chrome(options=o)

print('1) Solemn district chapters + TOC search')
d=driver();w=WebDriverWait(d,15)
try:
    d.get(BASE+'/')
    w.until(EC.visibility_of_element_located((By.ID,'pw'))).send_keys('demo')
    unlock=w.until(EC.visibility_of_element_located((By.ID,'unlock')))
    check(unlock.is_enabled(),'viewer unlock is enabled')
    d.execute_script("arguments[0].click()",unlock)
    w.until(EC.visibility_of_element_located((By.ID,'tocBtn'))).click()
    w.until(lambda x:len(x.find_elements(By.CSS_SELECTOR,'.rpp-district-section'))>=6)
    names=[x.text for x in d.find_elements(By.CSS_SELECTOR,'.rpp-district-section:not(.rpp-legacy-section) .rpp-district-name')]
    check(names==GROUPS,'district chapters appear in the required order')
    nav=[x.text for x in d.find_elements(By.CSS_SELECTOR,'#rppDistrictNav button')]
    check(nav==GROUPS,'district navigation has exactly the six publication groups')
    search=w.until(EC.visibility_of_element_located((By.ID,'tocSearch')))
    check('題名・氏名' in search.get_attribute('placeholder'),'TOC search remains title/name only')
    search.send_keys('山田')
    time.sleep(.3)
    visible=[x for x in d.find_elements(By.CSS_SELECTOR,'.toc-item') if x.is_displayed()]
    check(len(visible)==1,'TOC search filters grouped preview stories')
    check('山田 太郎' in visible[0].text,'TOC search finds author name inside a chapter')
    d.save_screenshot('artifacts/screens/index-r7-district-chapters.png')
finally:
    d.quit()

print('2) Author edit-code checkpoint, district select, Japanese date, polished sections')
d=driver();w=WebDriverWait(d,15)
try:
    d.get(BASE+'/author.html')
    check('私の記録を綴る' in w.until(EC.visibility_of_element_located((By.CSS_SELECTOR,'#auth h1'))).text,'author heading matches product language')
    check(len(d.find_elements(By.CSS_SELECTOR,'.rpp-author-step'))==3,'three-step author guide is visible')
    email=f'ux-{int(time.time())}@example.invalid'
    w.until(EC.visibility_of_element_located((By.ID,'email'))).send_keys(email)
    d.find_element(By.ID,'send').click()
    msg=w.until(lambda x:x.find_element(By.ID,'authmsg').text)
    m=re.search(r'(\d{6})',msg);check(bool(m),'preview OTP is available')
    d.find_element(By.ID,'otp').send_keys(m.group(1));d.find_element(By.ID,'verify').click()

    checkpoint=w.until(EC.visibility_of_element_located((By.ID,'rppCodeCheckpoint')))
    check(checkpoint.is_displayed(),'edit-code checkpoint appears before writing')
    code_text=d.find_element(By.CSS_SELECTOR,'.rpp-checkpoint-code').text
    code_digits=re.sub(r'\D','',code_text)
    check(len(code_digits)==8,'persistent edit code is eight digits')
    cont=d.find_element(By.ID,'rppCheckpointContinue')
    check(not cont.is_enabled(),'continue is disabled until code-save acknowledgement')
    d.save_screenshot('artifacts/screens/author-r7-code-checkpoint.png')
    d.find_element(By.ID,'rppCodeSaved').click()
    check(cont.is_enabled(),'continue enables after code-save acknowledgement')
    cont.click()

    w.until(EC.visibility_of_element_located((By.ID,'editor')))
    w.until(lambda x:len(x.find_elements(By.CSS_SELECTOR,'.rpp-form-section'))==3)
    check(len(d.find_elements(By.CSS_SELECTOR,'.rpp-form-section'))==3,'author form is organized into three sections')
    heads=[x.text for x in d.find_elements(By.CSS_SELECTOR,'.rpp-section-title')]
    check(heads==['基本情報','あなたの記録','写真・確認・提出'],'author section titles are correct')

    org_select=w.until(EC.visibility_of_element_located((By.ID,'rppOrgSelect')))
    options=[o.text for o in Select(org_select).options][1:]
    check(options==GROUPS,'author can choose exactly the six publication groups')
    check('総区ごとの章に分けて掲載' in d.find_element(By.CSS_SELECTOR,'#rppOrgSelect + .rpp-meta-note').text,'organization purpose is clearly explained')

    date_display=w.until(EC.visibility_of_element_located((By.ID,'rppRecordDateDisplay')))
    w.until(lambda x:bool(re.match(r'^\d{4}/\d{1,2}/\d{1,2}$',x.find_element(By.ID,'rppRecordDateDisplay').get_attribute('value') or '')))
    check(bool(re.match(r'^\d{4}/\d{1,2}/\d{1,2}$',date_display.get_attribute('value'))),'date is displayed in Japanese YYYY/M/D format')

    Select(org_select).select_by_visible_text('磯子総区')
    check(d.find_element(By.ID,'org').get_attribute('value')=='磯子総区','selected district is stored as district only')
    d.save_screenshot('artifacts/screens/author-r7-editor.png')

    check(not any(d.find_elements(By.ID,x) for x in ('soku','bunku','honbu','shibu')),'legacy organization fields are absent')
    check(len(d.find_elements(By.ID,'category'))==0,'category is absent')
    check(len(d.find_elements(By.ID,'export'))==0,'manual device export button is absent')
    photo_label=d.find_element(By.CSS_SELECTOR,'#photo').find_element(By.XPATH,'ancestor::div[contains(@class,"field")][1]/label').text
    check('任意' in photo_label,'photo is explicitly optional')
    check('写真なしでも' in d.find_element(By.ID,'photoOptionalNote').text,'UI says submission works without a photo')
    d.find_element(By.ID,'name').send_keys('写真なしテスト')
    d.find_element(By.ID,'title').send_keys('総区別掲載と日付表示の確認')
    d.find_element(By.ID,'body').send_keys('総区を選択し、日本式の日付表示のまま、写真なしでも提出できることを確認するテストです。')
    d.execute_script("document.getElementById('confirm').click()")
    d.execute_script("document.getElementById('submit').click()")
    w.until(lambda x:x.find_element(By.ID,'statusBadge').text=='提出済')
    check(d.find_element(By.ID,'statusBadge').text=='提出済','story submits without a photo in preview')
    save=d.find_element(By.ID,'save');check('提出済みのまま' in save.text,'manual save warns that submitted state is preserved')
    d.execute_script("arguments[0].click()",save);time.sleep(.2)
    check(d.find_element(By.ID,'statusBadge').text=='提出済','manual save does not demote a submitted story')
    status=d.execute_script("return JSON.parse(localStorage.getItem('rpp_draft_'+arguments[0])).status",email)
    check(status=='submitted','device autosave also keeps submitted state')
    org=d.execute_script("return JSON.parse(localStorage.getItem('rpp_draft_'+arguments[0])).org",email)
    check(org=='磯子総区','device autosave keeps district-only organization value')
    saved_date=d.execute_script("return JSON.parse(localStorage.getItem('rpp_draft_'+arguments[0])).record_date",email)
    check(bool(re.match(r'^\d{4}-\d{2}-\d{2}$',saved_date)),'internal saved date remains sortable ISO format')
finally:
    d.quit()

print('UX REGRESSION PASSED')
