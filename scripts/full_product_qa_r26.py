import os, re, time
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select

BASE=os.environ.get('RPP_BASE_URL','https://road-to-peace-pride.hn-kikuchi.workers.dev')
GROUPS=['中区','南総区','港南総区','磯子総区','金沢総区','栄区']
PHOTO=str((Path.cwd()/'public/assets/top-cover.webp').resolve())

def check(ok,label):
    if not ok: raise AssertionError(label)
    print('  ✓ '+label,flush=True)

def driver(w=390,h=844):
    o=Options();o.add_argument('--headless=new');o.add_argument('--no-sandbox');o.add_argument('--disable-dev-shm-usage');o.add_argument('--lang=ja-JP');o.add_argument(f'--window-size={w},{h}')
    d=webdriver.Chrome(options=o);d.set_window_size(w,h);return d

def click(d,el): d.execute_script('arguments[0].click()',el)

print('A) Viewer journey')
d=driver();w=WebDriverWait(d,20)
try:
    d.get(BASE+'/refresh?r26qa='+str(int(time.time())))
    d.execute_script("localStorage.removeItem('rpp_viewer_consent_v1')")
    w.until(EC.visibility_of_element_located((By.ID,'pw'))).send_keys('demo');click(d,d.find_element(By.ID,'unlock'))
    consent=w.until(EC.visibility_of_element_located((By.ID,'rppViewerConsent')));check('閲覧にあたっての確認事項' in consent.text,'privacy consent opens')
    d.find_element(By.ID,'rppConsentCheck').click();click(d,d.find_element(By.ID,'rppConsentAccept'))
    w.until(EC.visibility_of_element_located((By.ID,'cover')));w.until(EC.visibility_of_element_located((By.ID,'toc')))
    check(d.find_element(By.ID,'gate').get_attribute('data-r25-stars')=='periodic','top has periodic shooting-star layer')
    check(len(d.find_elements(By.CSS_SELECTOR,'#rppR25MeteorSky i'))==4,'four shooting stars are installed')
    check(len(d.find_elements(By.CSS_SELECTOR,'.rpp-district-section:not(.rpp-legacy-section)'))==6,'six organization chapters render')
    check(d.execute_script('return document.documentElement.scrollWidth<=document.documentElement.clientWidth+2'),'viewer has no mobile horizontal overflow')
finally:d.quit()

print('B) First registration -> same OTP/edit code -> draft -> preview -> submit')
d=driver();w=WebDriverWait(d,25)
try:
    d.get(BASE+'/author.html?r26qa='+str(int(time.time())))
    email=f'r26qa-{int(time.time())}@example.invalid'
    eb=w.until(EC.visibility_of_element_located((By.ID,'email')));eb.send_keys(email);click(d,d.find_element(By.ID,'send'))
    authmsg=w.until(lambda x:x.find_element(By.ID,'authmsg').text);m=re.search(r'(\d{6})',authmsg);check(bool(m),'preview OTP is issued');otp=m.group(1)
    d.find_element(By.ID,'otp').send_keys(otp);click(d,d.find_element(By.ID,'verify'))
    cp=w.until(EC.visibility_of_element_located((By.ID,'rppCodeCheckpoint')));cm=re.search(r'(?<!\d)(\d{3})\s?(\d{3})(?!\d)',cp.text);check(bool(cm),'six-digit edit key checkpoint appears')
    edit=''.join(cm.groups());check(edit==otp,'email OTP and edit key are exactly the same six digits');check('同じ6桁コード' in cp.text,'checkpoint explains the same code is reused')
    d.find_element(By.ID,'rppCodeSaved').click();click(d,d.find_element(By.ID,'rppCheckpointContinue'));w.until(EC.visibility_of_element_located((By.ID,'editor')))
    check(d.find_element(By.ID,'name').is_displayed(),'name field is usable')
    org=Select(w.until(EC.visibility_of_element_located((By.ID,'rppOrgSelect'))));check([o.text for o in org.options][1:]==GROUPS,'organization selector is correct')
    detail=w.until(EC.visibility_of_element_located((By.ID,'rppOrgDetail')));check(detail.is_displayed(),'organization detail field is usable')
    d.find_element(By.ID,'name').send_keys('QA テスト');org.select_by_visible_text('磯子総区');detail.send_keys('テスト分区／テスト本部／テスト部')
    d.find_element(By.ID,'title').send_keys('希望をつなぐために');d.find_element(By.ID,'body').send_keys('9.12までの挑戦と、これからの誓いを綴るテスト本文です。')
    time.sleep(.4);local=d.execute_script("return Object.keys(localStorage).filter(k=>k.startsWith('rpp_draft_')).map(k=>localStorage.getItem(k)).join('')");check('希望をつなぐために' in local,'typing is automatically preserved locally')
    check(Path(PHOTO).is_file(),'real project image exists for upload test');d.find_element(By.ID,'photo').send_keys(PHOTO)
    w.until(lambda x:x.find_element(By.ID,'photoPreview').get_attribute('src') and not x.find_element(By.ID,'photoPreview').get_attribute('class').find('hidden')>=0)
    check(d.find_element(By.ID,'photoPreview').is_displayed(),'photo selection, compression and preview work')
    click(d,d.find_element(By.ID,'previewBtn'));w.until(EC.visibility_of_element_located((By.ID,'storyPreview')));check(d.find_element(By.ID,'pTitle').text=='希望をつなぐために','publication preview shows title');check('9.12までの挑戦' in d.find_element(By.ID,'pBody').text,'publication preview shows body');w.until(lambda x:bool(x.find_elements(By.CSS_SELECTOR,'#storyPreview .r12-preview-photo')));check(bool(d.find_elements(By.CSS_SELECTOR,'#storyPreview .r12-preview-photo')),'publication preview shows photo')
    click(d,d.find_element(By.ID,'closePreview'));w.until(EC.invisibility_of_element_located((By.ID,'storyPreview')))
    click(d,d.find_element(By.ID,'save'));time.sleep(.5);check('保存' in d.find_element(By.ID,'saveState').text or '下書き' in d.find_element(By.ID,'saveState').text,'draft save responds')
    click(d,d.find_element(By.ID,'submit'));w.until(lambda x:'提出済' in x.find_element(By.ID,'statusBadge').text);time.sleep(.5)
    check('提出済みの原稿です。内容を変更して再提出できます。' in d.find_element(By.ID,'rppSubmittedNotice').text,'submitted editing guidance is shown');check(d.find_element(By.ID,'submit').text=='変更内容を再提出する','submit button changes to resubmit label')
    check(d.execute_script('return document.documentElement.scrollWidth<=document.documentElement.clientWidth+2'),'author editor has no mobile horizontal overflow')

    print('C) Logout -> re-edit using the same six digits')
    click(d,d.find_element(By.ID,'logout'));w.until(EC.visibility_of_element_located((By.ID,'auth')));click(d,w.until(EC.visibility_of_element_located((By.ID,'rppEditTab'))))
    eb=d.find_element(By.ID,'email');eb.clear();eb.send_keys(email);codebox=w.until(EC.visibility_of_element_located((By.ID,'rppEditCode')));codebox.send_keys(edit);click(d,d.find_element(By.ID,'rppEditLoginBtn'))
    w.until(EC.visibility_of_element_located((By.ID,'editor')));check(d.find_element(By.ID,'title').get_attribute('value')=='希望をつなぐために','same six-digit code reopens the manuscript')
    body=d.find_element(By.ID,'body');body.send_keys(' 再編集確認。');click(d,d.find_element(By.ID,'submit'));time.sleep(.7);check('再編集確認' in body.get_attribute('value'),'submitted manuscript can be edited again')
finally:d.quit()

print('D) Responsive entry screens')
for width,height in [(360,800),(390,844),(430,932),(768,1024)]:
    d=driver(width,height);w=WebDriverWait(d,15)
    try:
        d.get(BASE+f'/author.html?r26viewport={width}');w.until(EC.visibility_of_element_located((By.ID,'auth')))
        check(d.execute_script('return document.documentElement.scrollWidth<=document.documentElement.clientWidth+2'),f'{width}px author screen has no horizontal overflow')
        check(d.find_element(By.ID,'send').is_enabled(),f'{width}px primary auth button is interactive')
    finally:d.quit()
print('R26 FULL PRODUCT LIFECYCLE QA PASSED',flush=True)
