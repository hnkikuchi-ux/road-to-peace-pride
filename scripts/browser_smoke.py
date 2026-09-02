import os, re, time, sys
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

BASE=os.environ.get('RPP_BASE_URL','https://giin-home-cloud-pilot.hn-kikuchi.workers.dev')
WAIT=20

def ok(msg): print(f'  ✓ {msg}', flush=True)
def fail(msg):
    print(f'  ✗ {msg}', flush=True)
    raise AssertionError(msg)

def visible(driver, selector):
    return WebDriverWait(driver,WAIT).until(EC.visibility_of_element_located((By.CSS_SELECTOR,selector)))

def click(driver, selector):
    el=WebDriverWait(driver,WAIT).until(EC.element_to_be_clickable((By.CSS_SELECTOR,selector)))
    driver.execute_script('arguments[0].scrollIntoView({block:"center"});',el)
    el.click(); return el

opt=Options()
opt.add_argument('--headless=new')
opt.add_argument('--no-sandbox')
opt.add_argument('--disable-dev-shm-usage')
opt.add_argument('--window-size=390,844')
opt.add_argument('--lang=ja-JP')
opt.add_argument('--force-device-scale-factor=1')
opt.set_capability('goog:loggingPrefs', {'browser':'ALL'})

driver=webdriver.Chrome(options=opt)
driver.set_window_size(390,844)
try:
    print('1) Viewer mobile journey', flush=True)
    driver.get(BASE+'/')
    visible(driver,'#gate')
    pw=visible(driver,'#pw'); pw.send_keys('demo')
    click(driver,'#unlock')
    visible(driver,'#cover:not(.hidden)'); ok('viewer password opens cover')
    click(driver,'#tocBtn')
    visible(driver,'#toc:not(.hidden)')
    items=WebDriverWait(driver,WAIT).until(lambda d:d.find_elements(By.CSS_SELECTOR,'.toc-item button'))
    if len(items)<1: fail('TOC contains at least one story')
    ok(f'TOC renders {len(items)} preview stories')
    items[0].click()
    visible(driver,'#reader:not(.hidden)'); visible(driver,'#body')
    title=driver.find_element(By.ID,'title').text.strip()
    if not title: fail('story title is visible')
    ok('story opens from TOC')
    before=float(driver.execute_script("return parseFloat(getComputedStyle(document.querySelector('#body')).fontSize)"))
    click(driver,'#fontUp')
    after=float(driver.execute_script("return parseFloat(getComputedStyle(document.querySelector('#body')).fontSize)"))
    if after<=before: fail('A+ increases body font size')
    ok('A+ changes reading font size')
    click(driver,'#backToc'); visible(driver,'#toc:not(.hidden)'); ok('reader returns to TOC')
    if driver.execute_script('return document.documentElement.scrollWidth > window.innerWidth + 2'):
        fail('viewer has horizontal overflow at 390px')
    ok('viewer fits 390px mobile width')

    print('2) Author mobile journey', flush=True)
    driver.get(BASE+'/author.html')
    visible(driver,'#auth')
    email=f'browser-smoke-{int(time.time())}@example.invalid'
    driver.find_element(By.ID,'email').send_keys(email)
    click(driver,'#send')
    WebDriverWait(driver,WAIT).until(lambda d:'PREVIEW用認証コード' in d.find_element(By.ID,'authmsg').text)
    msg=driver.find_element(By.ID,'authmsg').text
    m=re.search(r'(\d{6})',msg)
    if not m: fail('preview OTP is displayed')
    otp=m.group(1); ok('preview OTP is displayed')
    visible(driver,'#otp').send_keys(otp)
    click(driver,'#verify')
    visible(driver,'#editor:not(.hidden)'); ok('OTP opens author editor without viewer password')
    for field,value in [('soku','テスト総区'),('bunku',''),('honbu','テスト本部'),('shibu','テスト支部'),('name','ブラウザ確認'),('title','動作確認用下書き'),('body','これは公開されないPREVIEW動作確認用の入力です。')]:
        el=driver.find_element(By.ID,field); el.clear(); el.send_keys(value)
    for field in ('soku','bunku','honbu','shibu'):
        if driver.find_element(By.ID,field).tag_name.lower()!='input': fail(f'{field} is not a free-text input')
    ok('organization fields are free-text inputs')
    click(driver,'#save')
    WebDriverWait(driver,WAIT).until(lambda d:'端末' in d.find_element(By.ID,'savemsg').text or 'PREVIEW' in d.find_element(By.ID,'savemsg').text)
    ok('preview draft save stays device-side')
    if driver.execute_script('return document.documentElement.scrollWidth > window.innerWidth + 2'):
        fail('author page has horizontal overflow at 390px')
    ok('author editor fits 390px mobile width')

    print('3) Admin guard in browser', flush=True)
    driver.get(BASE+'/admin.html')
    visible(driver,'#login')
    driver.find_element(By.ID,'password').send_keys('654321')
    click(driver,'#go')
    WebDriverWait(driver,WAIT).until(lambda d:d.find_element(By.ID,'loginMsg').text.strip()!='')
    dash_classes=driver.find_element(By.ID,'dash').get_attribute('class') or ''
    if 'hidden' not in dash_classes: fail('old admin demo code opened dashboard')
    ok('old admin demo code is rejected in UI')

    print('4) System status page', flush=True)
    driver.get(BASE+'/status.html')
    visible(driver,'#box')
    WebDriverWait(driver,WAIT).until(lambda d:'Cloudflare Worker' in d.find_element(By.ID,'box').text)
    if 'ERROR' in driver.find_element(By.ID,'box').text: fail('status page reports system error')
    ok('status page renders live health')

    logs=[x for x in driver.get_log('browser') if x.get('level')=='SEVERE']
    markers=('Uncaught','SyntaxError','ReferenceError','TypeError','javascript error')
    js_errors=[x for x in logs if any(m.lower() in x.get('message','').lower() for m in markers)]
    if js_errors:
        print(js_errors, file=sys.stderr)
        fail('severe browser JavaScript errors detected')
    ok('no severe browser JavaScript exceptions')
    print('MOBILE BROWSER SMOKE PASSED', flush=True)
finally:
    driver.quit()
