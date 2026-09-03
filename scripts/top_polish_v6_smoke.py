import os,time
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

BASE=os.environ.get('RPP_BASE_URL','https://road-to-peace-pride.hn-kikuchi.workers.dev')
OUT=Path('artifacts/screens');OUT.mkdir(parents=True,exist_ok=True)
WAIT=25

def vis(d,s): return WebDriverWait(d,WAIT).until(EC.visibility_of_element_located((By.CSS_SELECTOR,s)))
def bottom(e): return e.rect['y']+e.rect['height']

opt=Options();opt.add_argument('--headless=new');opt.add_argument('--no-sandbox');opt.add_argument('--disable-dev-shm-usage');opt.add_argument('--lang=ja-JP');opt.add_argument('--force-device-scale-factor=1')
d=webdriver.Chrome(options=opt)
try:
    d.set_window_size(390,844)
    d.get(BASE+'/refresh?qa=v6-refined-'+str(int(time.time())))
    card=vis(d,'#gate .gate-card')
    WebDriverWait(d,WAIT).until(lambda x: card.get_attribute('data-top-polish')=='premium-v6-refined')
    road=vis(d,'#rppCrispCopy .rpp-road');pride=vis(d,'#rppCrispCopy .rpp-pride')
    jp=vis(d,'#rppCrispCopy .jp');bridge=vis(d,'#rppCrispCopy .bridge');panel=vis(d,'.rpp-v5-panel')
    pw=vis(d,'#pw');unlock=vis(d,'#unlock');author=vis(d,'#gateAuthorLink');lock=vis(d,'.rpp-v5-lock')

    family=d.execute_script('return getComputedStyle(arguments[0]).fontFamily',pride)
    assert 'Cormorant Garamond' in family,family
    assert road.text.strip()=='ROAD TO' and pride.text.strip().replace('\n',' ')=='PEACE PRIDE'
    assert pride.rect['width']<=card.rect['width']*.96,(pride.rect,card.rect)

    bridge_size=float(d.execute_script('return parseFloat(getComputedStyle(arguments[0]).fontSize)',bridge))
    assert bridge_size>=12,bridge_size
    assert bridge.rect['y']>bottom(jp)-8,(jp.rect,bridge.rect)
    assert bottom(bridge)<panel.rect['y'],(bridge.rect,panel.rect)

    assert pw.rect['height']>=50,pw.rect
    assert unlock.rect['height']>=60,unlock.rect
    assert author.rect['height']>=64,author.rect
    assert pw.rect['width']/pw.rect['height']<7.2,pw.rect
    assert unlock.rect['width']/unlock.rect['height']<5.2,unlock.rect
    assert author.rect['width']/author.rect['height']<5.0,author.rect
    assert bottom(pw)+10<=unlock.rect['y'],(pw.rect,unlock.rect)
    assert bottom(unlock)+10<=author.rect['y'],(unlock.rect,author.rect)
    assert panel.rect['y']<=pw.rect['y'] and bottom(author)<=bottom(panel)+2,(panel.rect,pw.rect,author.rect)

    assert lock.find_elements(By.CSS_SELECTOR,'svg'), 'clean SVG lock missing'
    lock_box=lock.find_element(By.CSS_SELECTOR,'svg').rect
    assert lock_box['width']>=24 and lock_box['height']>=28,lock_box

    unlock_bg=d.execute_script('return getComputedStyle(arguments[0]).backgroundImage',unlock)
    author_bg=d.execute_script('return getComputedStyle(arguments[0]).backgroundImage',author)
    assert 'premium-v5-unlock.webp' not in unlock_bg,unlock_bg
    assert 'premium-v5-author.webp' not in author_bg,author_bg
    assert 'linear-gradient' in unlock_bg,unlock_bg
    assert 'linear-gradient' in author_bg,author_bg

    assert d.execute_script('return document.documentElement.scrollWidth<=window.innerWidth+2')
    d.save_screenshot(str(OUT/'10-premium-v6-refined-top.png'))
    print('PREMIUM V6 REFINED TOP PASSED',flush=True)
finally:
    d.quit()
