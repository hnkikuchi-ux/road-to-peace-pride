import os, re, time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE=os.environ.get('RPP_BASE_URL','https://giin-home-cloud-pilot.hn-kikuchi.workers.dev')

def check(ok,label):
    if not ok: raise AssertionError(label)
    print('  ✓ '+label)

def driver():
    o=Options();o.add_argument('--headless=new');o.add_argument('--no-sandbox');o.add_argument('--disable-dev-shm-usage');o.add_argument('--window-size=390,844')
    return webdriver.Chrome(options=o)

print('1) TOC search at 300-item scale')
d=driver();w=WebDriverWait(d,15)
try:
    d.get(BASE+'/')
    w.until(EC.visibility_of_element_located((By.ID,'pw'))).send_keys('demo')
    d.find_element(By.ID,'unlock').click()
    w.until(EC.visibility_of_element_located((By.ID,'tocBtn'))).click()
    search=w.until(EC.visibility_of_element_located((By.ID,'tocSearch')))
    check('題名・氏名' in search.get_attribute('placeholder'),'TOC search is title/name only')
    search.send_keys('山田')
    time.sleep(.3)
    visible=[x for x in d.find_elements(By.CSS_SELECTOR,'.toc-item') if x.is_displayed()]
    check(len(visible)==1,'TOC search filters preview stories')
    check('山田 太郎' in visible[0].text,'TOC search finds author name')
finally:
    d.quit()

print('2) Optional photo and submitted-safe editing')
d=driver();w=WebDriverWait(d,15)
try:
    d.get(BASE+'/author.html')
    email=f'ux-{int(time.time())}@example.invalid'
    w.until(EC.visibility_of_element_located((By.ID,'email'))).send_keys(email)
    d.find_element(By.ID,'send').click()
    msg=w.until(lambda x:x.find_element(By.ID,'authmsg').text)
    m=re.search(r'(\d{6})',msg);check(bool(m),'preview OTP is available')
    d.find_element(By.ID,'otp').send_keys(m.group(1));d.find_element(By.ID,'verify').click()
    w.until(EC.visibility_of_element_located((By.ID,'editor')))
    photo_label=d.find_element(By.CSS_SELECTOR,'#photo').find_element(By.XPATH,'ancestor::div[contains(@class,"field")][1]/label').text
    check('任意' in photo_label,'photo is explicitly optional')
    check('写真なしでも' in d.find_element(By.ID,'photoOptionalNote').text,'UI says submission works without a photo')
    d.find_element(By.ID,'name').send_keys('写真なしテスト')
    d.find_element(By.ID,'title').send_keys('写真なしで提出できるか')
    d.find_element(By.ID,'body').send_keys('写真を添付しない場合でも、原稿だけで提出できることを確認するテストです。')
    d.find_element(By.ID,'confirm').click();d.find_element(By.ID,'submit').click()
    w.until(lambda x:x.find_element(By.ID,'statusBadge').text=='提出済')
    check(d.find_element(By.ID,'statusBadge').text=='提出済','story submits without a photo in preview')
    save=d.find_element(By.ID,'save');check('提出済みのまま' in save.text,'manual save warns that submitted state is preserved')
    save.click();time.sleep(.2)
    check(d.find_element(By.ID,'statusBadge').text=='提出済','manual save does not demote a submitted story')
    status=d.execute_script("return JSON.parse(localStorage.getItem('rpp_draft_'+arguments[0])).status",email)
    check(status=='submitted','device backup also keeps submitted state')
finally:
    d.quit()

print('UX REGRESSION PASSED')
