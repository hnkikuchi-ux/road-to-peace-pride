import os,time
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

BASE=os.environ.get('RPP_BASE_URL','https://road-to-peace-pride.hn-kikuchi.workers.dev')
OUT=Path(os.environ.get('RPP_SCREENSHOT_DIR','artifacts/screens'));OUT.mkdir(parents=True,exist_ok=True)

def wait_visible(d,sel): return WebDriverWait(d,20).until(EC.visibility_of_element_located((By.CSS_SELECTOR,sel)))
def ok(msg): print('  ✓ '+msg,flush=True)

def inside_viewport(d,el,tolerance=2):
    r=el.rect; vw=float(d.execute_script('return window.innerWidth')); vh=float(d.execute_script('return window.innerHeight'))
    return r['x']>=-tolerance and r['x']+r['width']<=vw+tolerance and r['y']>=-tolerance and r['y']+r['height']<=vh+tolerance

opt=Options();opt.add_argument('--headless=new');opt.add_argument('--no-sandbox');opt.add_argument('--disable-dev-shm-usage');opt.add_argument('--lang=ja-JP')
d=webdriver.Chrome(options=opt)
try:
    d.set_window_size(390,844);d.get(BASE+'/')
    card=wait_visible(d,'#gate .gate-card')
    WebDriverWait(d,25).until(lambda x:x.find_element(By.CSS_SELECTOR,'#gate .gate-card').get_attribute('data-master')=='vector-live-941x1672')
    assert card.get_attribute('data-master-format')=='svg+html'
    assert card.get_attribute('data-master-pixels')=='vector'
    bg=d.execute_script("return getComputedStyle(document.querySelector('#gate .gate-card'),'::before').backgroundImage")
    assert 'mobile-dawn.svg' in bg, bg
    unlock=wait_visible(d,'#unlock')
    assert unlock.get_attribute('aria-label')=='記録をひらく'
    assert 'rpp-action' in (unlock.get_attribute('class') or '')
    author=wait_visible(d,'#gateAuthorLink')
    assert author.get_attribute('aria-label')=='私の記録を綴る / WRITE YOUR STORY'
    assert author.find_element(By.CSS_SELECTOR,'.rpp-ja').text.strip()=='私の記録を綴る'
    assert author.find_element(By.CSS_SELECTOR,'.rpp-en').text.strip()=='WRITE YOUR STORY'
    ok('crisp vector top and unified two-line story CTA are motion-enabled')
    d.execute_script("const e=arguments[0],r=e.getBoundingClientRect();e.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:r.left+r.width/2,clientY:r.top+r.height/2,pointerId:1}));",unlock)
    WebDriverWait(d,3).until(lambda x:'rpp-pressed' in (x.find_element(By.ID,'unlock').get_attribute('class') or ''))
    ok('pointerdown gives immediate pressed state')
    d.execute_script("arguments[0].dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:1}));",unlock)
    WebDriverWait(d,3).until(lambda x:'rpp-pressed' not in (x.find_element(By.ID,'unlock').get_attribute('class') or ''))
    ok('pointerup releases pressed state')
    d.save_screenshot(str(OUT/'05-mobile-motion-top.png'))

    d.set_window_size(1440,900);d.get(BASE+'/');card=wait_visible(d,'#gate .gate-card')
    WebDriverWait(d,25).until(lambda x:x.find_element(By.CSS_SELECTOR,'#gate .gate-card').get_attribute('data-master')=='vector-live-941x1672')
    assert card.get_attribute('data-master-format')=='svg+html'
    rect=card.rect
    ratio=rect['height']/rect['width']
    assert abs(ratio-(1672/941))<.03, ('desktop master ratio changed',ratio,rect)
    assert rect['width']<=570 and rect['height']<=900, rect
    assert inside_viewport(d,card), ('desktop cover clipped',rect,d.execute_script('return [window.innerWidth,window.innerHeight]'))
    pw=wait_visible(d,'#pw'); unlock=wait_visible(d,'#unlock'); author=wait_visible(d,'#gateAuthorLink')
    for name,el in [('password',pw),('unlock',unlock),('author',author)]:
        cr=card.rect; r=el.rect
        assert r['x']>=cr['x']-2 and r['x']+r['width']<=cr['x']+cr['width']+2 and r['y']>=cr['y']-2 and r['y']+r['height']<=cr['y']+cr['height']+2, (name,'outside master',r,cr)
    title=wait_visible(d,'#rppCrispCopy .title')
    assert 'PEACE PRIDE' in title.text
    assert author.get_attribute('aria-label')=='私の記録を綴る / WRITE YOUR STORY'
    ok('desktop preserves the crisp portrait composition and aligned live controls')
    d.save_screenshot(str(OUT/'06-desktop-exact-login.png'))
    print('MOTION / CRISP VECTOR COVER QA PASSED',flush=True)
finally:
    d.quit()
