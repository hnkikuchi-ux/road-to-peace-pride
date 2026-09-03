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
    d.get(BASE+'/refresh?qa=v6-'+str(int(time.time())))
    card=vis(d,'#gate .gate-card')
    WebDriverWait(d,WAIT).until(lambda x: card.get_attribute('data-top-polish')=='premium-v6')
    road=vis(d,'#rppCrispCopy .rpp-road');pride=vis(d,'#rppCrispCopy .rpp-pride')
    jp=vis(d,'#rppCrispCopy .jp');bridge=vis(d,'#rppCrispCopy .bridge');panel=vis(d,'.rpp-v5-panel')
    pw=vis(d,'#pw');unlock=vis(d,'#unlock');author=vis(d,'#gateAuthorLink');lock=vis(d,'.rpp-v5-lock')

    family=d.execute_script('return getComputedStyle(arguments[0]).fontFamily',pride)
    assert any(k in family for k in ['Didot','Bodoni','Times New Roman','Georgia']),family
    assert road.text.strip()=='ROAD TO' and pride.text.strip().replace('\n',' ')=='PEACE PRIDE'

    assert bridge.rect['y']>bottom(jp)-8,(jp.rect,bridge.rect)
    assert bottom(bridge)<panel.rect['y'],(bridge.rect,panel.rect)

    assert pw.rect['height']>=46,pw.rect
    assert unlock.rect['height']>=55,unlock.rect
    assert author.rect['height']>=58,author.rect
    assert pw.rect['width']/pw.rect['height']<7.5,pw.rect
    assert unlock.rect['width']/unlock.rect['height']<5.5,unlock.rect
    assert author.rect['width']/author.rect['height']<5.3,author.rect
    assert bottom(pw)+10<=unlock.rect['y'],(pw.rect,unlock.rect)
    assert bottom(unlock)+10<=author.rect['y'],(unlock.rect,author.rect)
    assert panel.rect['y']<=pw.rect['y'] and bottom(author)<=bottom(panel)+2,(panel.rect,pw.rect,author.rect)

    lock_bg=d.execute_script('return getComputedStyle(arguments[0]).backgroundImage',lock)
    assert lock_bg=='none',lock_bg
    assert d.execute_script('return document.documentElement.scrollWidth<=window.innerWidth+2')
    d.save_screenshot(str(OUT/'10-premium-v6-top.png'))
    print('PREMIUM V6 TOP POLISH PASSED',flush=True)
finally:
    d.quit()
