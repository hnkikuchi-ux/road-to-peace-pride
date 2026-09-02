import os,time
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

BASE=os.environ.get('RPP_BASE_URL','https://giin-home-cloud-pilot.hn-kikuchi.workers.dev')
OUT=Path(os.environ.get('RPP_SCREENSHOT_DIR','artifacts/screens'));OUT.mkdir(parents=True,exist_ok=True)

def wait_visible(d,sel): return WebDriverWait(d,20).until(EC.visibility_of_element_located((By.CSS_SELECTOR,sel)))
def ok(msg): print('  ✓ '+msg,flush=True)

opt=Options();opt.add_argument('--headless=new');opt.add_argument('--no-sandbox');opt.add_argument('--disable-dev-shm-usage');opt.add_argument('--lang=ja-JP')
d=webdriver.Chrome(options=opt)
try:
    d.set_window_size(390,844);d.get(BASE+'/')
    unlock=wait_visible(d,'#unlock')
    WebDriverWait(d,20).until(lambda x:x.find_element(By.ID,'unlock').text.strip()=='記録をひらく')
    assert 'rpp-action' in (unlock.get_attribute('class') or '')
    ok('top CTA is live text and motion-enabled')
    d.execute_script("const e=arguments[0],r=e.getBoundingClientRect();e.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:r.left+r.width/2,clientY:r.top+r.height/2,pointerId:1}));",unlock)
    WebDriverWait(d,3).until(lambda x:'rpp-pressed' in (x.find_element(By.ID,'unlock').get_attribute('class') or ''))
    ok('pointerdown gives immediate pressed state')
    d.execute_script("arguments[0].dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:1}));",unlock)
    WebDriverWait(d,3).until(lambda x:'rpp-pressed' not in (x.find_element(By.ID,'unlock').get_attribute('class') or ''))
    ok('pointerup releases pressed state')
    d.save_screenshot(str(OUT/'05-mobile-motion-top.png'))

    d.set_window_size(1440,900);d.get(BASE+'/');card=wait_visible(d,'#gate .gate-card')
    WebDriverWait(d,20).until(lambda x:x.execute_script("return window.innerWidth>=900 && getComputedStyle(document.querySelector('#gate .gate-card')).height!=='auto'"))
    rect=card.rect
    assert rect['width']>900, rect
    h1=wait_visible(d,'#gate .gate-card > h1'); assert 'PEACE PRIDE' in h1.text
    pw=wait_visible(d,'#pw'); assert pw.rect['x']>700
    ok('desktop uses wide editorial two-column composition')
    d.save_screenshot(str(OUT/'06-desktop-editorial-login.png'))
    print('MOTION / DESKTOP QA PASSED',flush=True)
finally:
    d.quit()
