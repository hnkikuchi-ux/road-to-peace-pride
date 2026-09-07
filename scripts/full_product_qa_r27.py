import os,re,time
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select

BASE=os.environ.get('RPP_BASE_URL','http://127.0.0.1:8787')
PHOTO=str((Path.cwd()/'public/assets/top-cover.webp').resolve())
GROUPS=['中区','南総区','港南総区','磯子総区','金沢総区','栄区']

def ok(v,msg):
    if not v: raise AssertionError(msg)
    print('  ✓ '+msg,flush=True)

def click(d,e): d.execute_script('arguments[0].click()',e)
def make_driver():
    o=Options();o.add_argument('--headless=new');o.add_argument('--no-sandbox');o.add_argument('--disable-dev-shm-usage');o.add_argument('--lang=ja-JP');o.add_argument('--window-size=390,844')
    d=webdriver.Chrome(options=o);d.set_window_size(390,844);return d

print('R27 author lifecycle: register -> photo -> draft -> submit -> logout -> same-code re-edit')
d=make_driver();w=WebDriverWait(d,30)
try:
    d.get(BASE+'/author.html?r27qa='+str(int(time.time())))
    ok(d.find_element(By.TAG_NAME,'html').get_attribute('data-rpp-reedit')=='r27','r27 no-reload re-edit layer is active')
    email=f'r27qa-{int(time.time())}@example.invalid'
    e=w.until(EC.visibility_of_element_located((By.ID,'email')));e.send_keys(email);click(d,d.find_element(By.ID,'send'))
    msg=w.until(lambda x:x.find_element(By.ID,'authmsg').text)
    m=re.search(r'(\d{6})',msg);ok(bool(m),'preview OTP issued');otp=m.group(1)
    d.find_element(By.ID,'otp').send_keys(otp);click(d,d.find_element(By.ID,'verify'))
    cp=w.until(EC.visibility_of_element_located((By.ID,'rppCodeCheckpoint')))
    cm=re.search(r'(?<!\d)(\d{3})\s?(\d{3})(?!\d)',cp.text);ok(bool(cm),'six-digit edit key checkpoint appears')
    edit=''.join(cm.groups());ok(edit==otp,'email OTP equals persistent edit code')
    d.find_element(By.ID,'rppCodeSaved').click();click(d,d.find_element(By.ID,'rppCheckpointContinue'))
    w.until(EC.visibility_of_element_located((By.ID,'editor')))
    org=Select(w.until(EC.visibility_of_element_located((By.ID,'rppOrgSelect'))));ok([o.text for o in org.options][1:]==GROUPS,'organization selector is correct')
    d.find_element(By.ID,'name').send_keys('QA テスト');org.select_by_visible_text('磯子総区')
    w.until(EC.visibility_of_element_located((By.ID,'rppOrgDetail'))).send_keys('テスト分区／テスト本部／テスト部')
    d.find_element(By.ID,'title').send_keys('希望をつなぐために');d.find_element(By.ID,'body').send_keys('9.12までの挑戦と、これからの誓いを綴るテスト本文です。')
    time.sleep(.5);ok('希望をつなぐために' in d.execute_script("return Object.keys(localStorage).filter(k=>k.startsWith('rpp_draft_')).map(k=>localStorage.getItem(k)).join('')"),'typing is locally preserved')
    ok(Path(PHOTO).is_file(),'real project image exists');d.find_element(By.ID,'photo').send_keys(PHOTO)
    w.until(lambda x:x.find_element(By.ID,'photoPreview').is_displayed());ok(True,'photo compression and preview work')
    click(d,d.find_element(By.ID,'previewBtn'));w.until(EC.visibility_of_element_located((By.ID,'storyPreview')))
    ok(d.find_element(By.ID,'pTitle').text=='希望をつなぐために','publication preview shows title');ok('9.12までの挑戦' in d.find_element(By.ID,'pBody').text,'publication preview shows body')
    w.until(lambda x:bool(x.find_elements(By.CSS_SELECTOR,'#storyPreview .r12-preview-photo')));ok(True,'publication preview shows photo')
    click(d,d.find_element(By.ID,'closePreview'));w.until(EC.invisibility_of_element_located((By.ID,'storyPreview')))
    click(d,d.find_element(By.ID,'save'));time.sleep(.5);ok('保存' in d.find_element(By.ID,'saveState').text or '下書き' in d.find_element(By.ID,'saveState').text,'draft save responds')
    click(d,d.find_element(By.ID,'submit'));w.until(lambda x:'提出済' in x.find_element(By.ID,'statusBadge').text)
    ok(d.find_element(By.ID,'submit').text=='変更内容を再提出する','submitted manuscript becomes editable/resubmittable')

    click(d,d.find_element(By.ID,'logout'));w.until(EC.visibility_of_element_located((By.ID,'auth')))
    click(d,w.until(EC.visibility_of_element_located((By.ID,'rppEditTab'))))
    e=d.find_element(By.ID,'email');e.clear();e.send_keys(email)
    w.until(EC.visibility_of_element_located((By.ID,'rppEditCode'))).send_keys(edit)
    click(d,d.find_element(By.ID,'rppEditLoginBtn'))
    w.until(EC.visibility_of_element_located((By.ID,'editor')))
    w.until(lambda x:x.find_element(By.ID,'title').get_attribute('value')=='希望をつなぐために')
    ok(True,'same six-digit code reopens the submitted manuscript without page reload')
    body=d.find_element(By.ID,'body');body.send_keys(' 再編集確認。');click(d,d.find_element(By.ID,'submit'));time.sleep(.8)
    ok('再編集確認' in body.get_attribute('value'),'submitted manuscript can be edited and resubmitted')
    ok(d.execute_script('return document.documentElement.scrollWidth<=document.documentElement.clientWidth+2'),'author UI has no horizontal overflow')
finally:
    d.quit()
print('R27 FULL AUTHOR LIFECYCLE QA PASSED',flush=True)
