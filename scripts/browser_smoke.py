import os, re, time, sys
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

BASE=os.environ.get('RPP_BASE_URL','https://road-to-peace-pride.hn-kikuchi.workers.dev')
WAIT=20
SHOT_DIR=Path(os.environ.get('RPP_SCREENSHOT_DIR','artifacts/screens'))
SHOT_DIR.mkdir(parents=True, exist_ok=True)

def ok(msg): print(f'  ✓ {msg}', flush=True)
def fail(msg):
    print(f'  ✗ {msg}', flush=True)
    raise AssertionError(msg)

def visible(driver, selector): return WebDriverWait(driver,WAIT).until(EC.visibility_of_element_located((By.CSS_SELECTOR,selector)))
def click(driver, selector):
    el=WebDriverWait(driver,WAIT).until(EC.element_to_be_clickable((By.CSS_SELECTOR,selector)))
    driver.execute_script('arguments[0].scrollIntoView({block:"center"});',el); el.click(); return el

def shot(driver,name):
    path=SHOT_DIR/name; driver.save_screenshot(str(path)); ok(f'visual QA screenshot: {path}')

def full_shot(driver,name):
    old=driver.get_window_size(); height=int(driver.execute_script('return Math.max(document.body.scrollHeight,document.documentElement.scrollHeight)'))
    driver.set_window_size(390,min(max(height+160,844),6000)); driver.execute_script('window.scrollTo(0,0)'); time.sleep(.2); shot(driver,name); driver.set_window_size(old['width'],old['height'])

opt=Options(); opt.add_argument('--headless=new'); opt.add_argument('--no-sandbox'); opt.add_argument('--disable-dev-shm-usage'); opt.add_argument('--window-size=390,844'); opt.add_argument('--lang=ja-JP'); opt.add_argument('--force-device-scale-factor=1'); opt.set_capability('goog:loggingPrefs', {'browser':'ALL'})
driver=webdriver.Chrome(options=opt); driver.set_window_size(390,844)
try:
    print('1) Viewer mobile journey', flush=True)
    driver.get(BASE+'/'); visible(driver,'#gate'); visible(driver,'#pw')
    WebDriverWait(driver,WAIT).until(lambda d:d.execute_script("return getComputedStyle(document.querySelector('#gate .gate-card')).backgroundImage.includes('mobile-dawn.svg')"))
    if len(driver.find_elements(By.CSS_SELECTOR,'.rpp-sparkles i')) < 10: fail('sparkle layer is missing')
    author=visible(driver,'#gateAuthorLink')
    if author.find_element(By.CSS_SELECTOR,'.rpp-ja').text.strip()!='私の記録を綴る': fail('Japanese story CTA line missing')
    if author.find_element(By.CSS_SELECTOR,'.rpp-en').text.strip()!='WRITE YOUR STORY': fail('English story CTA line missing')
    if author.tag_name.lower()!='a': fail('story CTA is not a single interactive button/link')
    ok('vector cover + animated sparkle layer + single two-line story CTA are active')
    shot(driver,'01-top-cover.png')
    pw=driver.find_element(By.ID,'pw'); pw.send_keys('demo'); click(driver,'#unlock')
    visible(driver,'#cover:not(.hidden)'); ok('viewer password opens cover')
    if driver.find_element(By.ID,'gate').is_displayed(): fail('top gate remains visible after viewer login')
    ok('top gate hides after viewer login')
    click(driver,'#tocBtn'); visible(driver,'#toc:not(.hidden)')
    items=WebDriverWait(driver,WAIT).until(lambda d:d.find_elements(By.CSS_SELECTOR,'.toc-item button'))
    if len(items)<1: fail('TOC contains at least one story')
    ok(f'TOC renders {len(items)} preview stories'); items[0].click(); visible(driver,'#reader:not(.hidden)'); visible(driver,'#body')
    if not driver.find_element(By.ID,'title').text.strip(): fail('story title is visible')
    ok('story opens from TOC'); driver.execute_script('window.scrollTo(0,0)'); full_shot(driver,'02-story-page.png')
    before=float(driver.execute_script("return parseFloat(getComputedStyle(document.querySelector('#body')).fontSize)")); click(driver,'#fontUp'); after=float(driver.execute_script("return parseFloat(getComputedStyle(document.querySelector('#body')).fontSize)"))
    if after<=before: fail('A+ increases body font size')
    ok('A+ changes reading font size'); click(driver,'#backToc'); visible(driver,'#toc:not(.hidden)'); ok('reader returns to TOC')
    if driver.execute_script('return document.documentElement.scrollWidth > window.innerWidth + 2'): fail('viewer has horizontal overflow at 390px')
    ok('viewer fits 390px mobile width')

    print('2) Author mobile journey', flush=True)
    driver.get(BASE+'/author.html'); visible(driver,'#auth')
    if driver.find_element(By.CSS_SELECTOR,'.top a.pill').text.strip()!='閲覧トップ': fail('author top link is not clear Japanese')
    if driver.find_element(By.CSS_SELECTOR,'#auth h1').text.strip()!='あなたの記録を綴る': fail('author access heading still uses old manuscript wording')
    if '公開ブック' in driver.find_element(By.TAG_NAME,'body').text: fail('old 公開ブック wording remains on author page')
    ok('author entry language is clear and consistent')
    email=f'browser-smoke-{int(time.time())}@example.invalid'; driver.find_element(By.ID,'email').send_keys(email); click(driver,'#send')
    WebDriverWait(driver,WAIT).until(lambda d:'PREVIEW用認証コード' in d.find_element(By.ID,'authmsg').text)
    m=re.search(r'(\d{6})',driver.find_element(By.ID,'authmsg').text)
    if not m: fail('preview OTP is displayed')
    otp=m.group(1); ok('preview OTP is displayed'); visible(driver,'#otp').send_keys(otp); click(driver,'#verify'); visible(driver,'#editor:not(.hidden)'); ok('OTP opens author editor without viewer password')
    if driver.find_element(By.CSS_SELECTOR,'#editor h1').text.strip()!='記録の入力・編集': fail('editor heading still uses old manuscript wording')
    deadline=driver.find_element(By.ID,'deadlineEditor').text
    if '記録' not in deadline or '原稿' in deadline: fail('deadline copy is not record-centered language')
    picker=visible(driver,'#rppFilePicker')
    if '写真を選ぶ' not in picker.text: fail('Japanese photo picker is missing')
    ok('author editor uses record-centered language and Japanese photo picker'); driver.execute_script('window.scrollTo(0,0)'); full_shot(driver,'03-author-editor.png')
    org=driver.find_element(By.ID,'org')
    if org.tag_name.lower()!='input': fail('organization is not a free-text input')
    if any(driver.find_elements(By.ID,x) for x in ['soku','bunku','honbu','shibu']): fail('legacy organization fields are still visible')
    if driver.find_elements(By.ID,'category'): fail('category field is still visible')
    if driver.find_elements(By.ID,'export'): fail('manual export button is still visible')
    ok('author form uses one organization field with no category/export button')
    for field,value in [('org','テスト総区 テスト本部 テスト支部'),('name','ブラウザ確認'),('title','動作確認用下書き'),('body','これは公開されないPREVIEW動作確認用の入力です。')]:
        el=driver.find_element(By.ID,field); el.clear(); el.send_keys(value)
    click(driver,'#save'); WebDriverWait(driver,WAIT).until(lambda d:'端末' in d.find_element(By.ID,'savemsg').text or 'PREVIEW' in d.find_element(By.ID,'savemsg').text); ok('preview draft save stays device-side')
    if driver.execute_script('return document.documentElement.scrollWidth > window.innerWidth + 2'): fail('author page has horizontal overflow at 390px')
    ok('author editor fits 390px mobile width')

    print('3) Admin guard in browser', flush=True)
    driver.get(BASE+'/admin.html'); visible(driver,'#login'); driver.find_element(By.ID,'password').send_keys('654321'); click(driver,'#go'); WebDriverWait(driver,WAIT).until(lambda d:d.find_element(By.ID,'loginMsg').text.strip()!='')
    if 'hidden' not in (driver.find_element(By.ID,'dash').get_attribute('class') or ''): fail('old admin demo code opened dashboard')
    ok('old admin demo code is rejected in UI')

    print('4) Diagnostics privacy', flush=True)
    driver.get(BASE+'/status.html'); WebDriverWait(driver,WAIT).until(lambda d:'/admin' in d.current_url); visible(driver,'#login'); ok('unauthenticated diagnostics redirect to admin login')
    logs=[x for x in driver.get_log('browser') if x.get('level')=='SEVERE']; markers=('Uncaught','SyntaxError','ReferenceError','TypeError','javascript error'); js_errors=[x for x in logs if any(m.lower() in x.get('message','').lower() for m in markers)]
    if js_errors: print(js_errors, file=sys.stderr); fail('severe browser JavaScript errors detected')
    ok('no severe browser JavaScript exceptions'); print('MOBILE BROWSER SMOKE PASSED', flush=True)
finally:
    driver.quit()
