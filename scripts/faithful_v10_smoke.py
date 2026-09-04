import os,time
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

BASE=os.environ.get('RPP_BASE_URL','https://road-to-peace-pride.hn-kikuchi.workers.dev')
SIZES=[(360,800),(390,844),(430,932)]
out=Path('artifacts/screens');out.mkdir(parents=True,exist_ok=True)

opt=Options();opt.add_argument('--headless=new');opt.add_argument('--no-sandbox');opt.add_argument('--disable-dev-shm-usage');opt.add_argument('--lang=ja-JP')
d=webdriver.Chrome(options=opt)
try:
  for w,h in SIZES:
    d.set_window_size(w,h)
    d.get(BASE+'/refresh?v10='+str(int(time.time()*1000)))
    card=WebDriverWait(d,25).until(EC.visibility_of_element_located((By.CSS_SELECTOR,'#gate .gate-card')))
    WebDriverWait(d,25).until(lambda x: card.get_attribute('data-v10-layout')=='approved-clean-cards')
    WebDriverWait(d,5).until(lambda x: len(x.find_elements(By.CSS_SELECTOR,'#rppFaithfulV7 .v10-helper'))==1)
    assert card.get_attribute('data-v10-author')=='standalone'
    assert card.get_attribute('data-v10-icons')=='none'
    cr=card.rect
    assert abs(cr['width']/cr['height']-9/16)<.015,(w,cr)
    assert cr['width']<=w+1,(w,cr)

    label=d.find_element(By.CSS_SELECTOR,'#rppFaithfulV7 .v7-label')
    assert d.execute_script('return getComputedStyle(arguments[0]).display',label)=='none'
    panel_top=d.find_element(By.CSS_SELECTOR,'#rppFaithfulV7 .v7-panel-top')
    assert d.execute_script('return getComputedStyle(arguments[0]).display',panel_top)=='none'

    panel=d.find_element(By.CSS_SELECTOR,'#rppFaithfulV7 .v7-panel').rect
    outer=d.find_element(By.CSS_SELECTOR,'#rppFaithfulV7 .v7-frame-outer').rect
    pw=d.find_element(By.ID,'pw').rect
    helper=d.find_element(By.CSS_SELECTOR,'#rppFaithfulV7 .v10-helper').rect
    unlock=d.find_element(By.ID,'unlock').rect
    author=d.find_element(By.ID,'gateAuthorLink').rect
    u_shine=d.find_element(By.CSS_SELECTOR,'#rppFaithfulV7 .v9-shine-layer.unlock').rect
    a_shine=d.find_element(By.CSS_SELECTOR,'#rppFaithfulV7 .v9-shine-layer.author').rect

    assert panel['x']>=outer['x']+3 and panel['x']+panel['width']<=outer['x']+outer['width']-3,(w,outer,panel)
    assert panel['y']+8<=pw['y'],(w,panel,pw)
    assert pw['y']+pw['height']<=helper['y']+4,(w,pw,helper)
    assert helper['y']+helper['height']+4<=unlock['y'],(w,helper,unlock)
    assert unlock['y']+unlock['height']<=panel['y']+panel['height']-4,(w,panel,unlock)
    assert panel['y']+panel['height']+6<=author['y'],(w,panel,author)
    assert author['y']+author['height']<=outer['y']+outer['height']-6,(w,outer,author)
    assert abs(u_shine['x']-unlock['x'])<2 and abs(u_shine['y']-unlock['y'])<2,(w,unlock,u_shine)
    assert abs(a_shine['x']-author['x'])<2 and abs(a_shine['y']-author['y'])<2,(w,author,a_shine)
    assert d.execute_script('return document.documentElement.scrollWidth <= window.innerWidth + 1')
    d.save_screenshot(str(out/f'50-faithful-v10-{w}.png'))
    print(f'  ✓ {w}x{h} v10 clean-card geometry',flush=True)
  print('FAITHFUL V10 CLEAN LAYOUT + SHINE OK',flush=True)
finally:
  d.quit()
