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
    d.get(BASE+'/refresh?v11r2='+str(int(time.time()*1000)))
    card=WebDriverWait(d,25).until(EC.visibility_of_element_located((By.CSS_SELECTOR,'#gate .gate-card')))
    WebDriverWait(d,25).until(lambda x: card.get_attribute('data-v11-layout')=='reference-frame-stars')
    assert card.get_attribute('data-v11-frame')=='full-rectangle'
    assert card.get_attribute('data-v11-button')=='refined-gold-r2'
    assert card.get_attribute('data-v11-revision')=='r2'
    assert card.get_attribute('data-v11-stars')=='animated'
    cr=card.rect
    assert abs(cr['width']/cr['height']-9/16)<.015,(w,cr)
    assert cr['width']<=w+1,(w,cr)

    panel_el=d.find_element(By.CSS_SELECTOR,'#rppFaithfulV7 .v7-panel')
    panel=panel_el.rect
    outer=d.find_element(By.CSS_SELECTOR,'#rppFaithfulV7 .v7-frame-outer').rect
    pw=d.find_element(By.ID,'pw').rect
    helper=d.find_element(By.CSS_SELECTOR,'#rppFaithfulV7 .v10-helper').rect
    unlock_el=d.find_element(By.ID,'unlock')
    unlock=unlock_el.rect
    author=d.find_element(By.ID,'gateAuthorLink').rect
    lock=d.find_element(By.CSS_SELECTOR,'#rppFaithfulV7 .v7-lock').rect
    corners=d.find_elements(By.CSS_SELECTOR,'#rppFaithfulV7 .v11-corners i')
    stars=d.find_elements(By.CSS_SELECTOR,'#rppFaithfulV7 .v11-star')
    title_rule=d.find_element(By.CSS_SELECTOR,'#rppFaithfulV7 .v7-deco.top')

    assert d.execute_script("return getComputedStyle(arguments[0]).clipPath",panel_el) in ('none',''),(w,'panel clipped')
    assert len(corners)==4,(w,len(corners))
    assert len(stars)==4,(w,len(stars))
    assert all('v11Shoot' in d.execute_script("return getComputedStyle(arguments[0]).animationName",s) for s in stars),(w,'star animation missing')
    bg=d.execute_script("return getComputedStyle(arguments[0]).backgroundImage",unlock_el)
    assert 'unlock-luxury-v11.svg' in bg,(w,bg)
    assert d.execute_script("return parseInt(getComputedStyle(arguments[0]).fontWeight)",unlock_el)>=800,(w,'unlock text not bold')
    assert float(d.execute_script("return parseFloat(getComputedStyle(arguments[0]).top)",title_rule))>0,(w,'title divider missing')
    assert lock['width']>=20 and lock['height']>=20,(w,lock)
    assert panel['x']>=outer['x']+3 and panel['x']+panel['width']<=outer['x']+outer['width']-3,(w,outer,panel)
    assert panel['y']+8<=pw['y'],(w,panel,pw)
    assert pw['y']+pw['height']<=helper['y']+5,(w,pw,helper)
    assert helper['y']+helper['height']+4<=unlock['y'],(w,helper,unlock)
    assert unlock['y']+unlock['height']<=panel['y']+panel['height']-3,(w,panel,unlock)
    assert panel['y']+panel['height']+7<=author['y'],(w,panel,author)
    assert author['y']+author['height']<=outer['y']+outer['height']-6,(w,outer,author)
    assert d.execute_script('return document.documentElement.scrollWidth <= window.innerWidth + 1')
    d.save_screenshot(str(out/f'61-faithful-v11-r2-{w}.png'))
    print(f'  ✓ {w}x{h} v11 r2 refined CTA + full frame + stars',flush=True)
  print('FAITHFUL V11 R2 POLISH + FRAME + LOCK + SHOOTING STARS OK',flush=True)
finally:
  d.quit()
