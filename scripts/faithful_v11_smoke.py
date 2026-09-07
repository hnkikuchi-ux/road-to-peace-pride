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
    d.set_window_size(w,h);d.get(BASE+'/refresh?faithful='+str(int(time.time()*1000)))
    card=WebDriverWait(d,25).until(EC.visibility_of_element_located((By.CSS_SELECTOR,'#gate .gate-card')))
    WebDriverWait(d,20).until(lambda x:len(x.find_elements(By.CSS_SELECTOR,'#rppR25MeteorSky i'))==4)
    time.sleep(.4)
    cr=card.rect;assert abs(cr['width']/cr['height']-9/16)<.015,(w,cr);assert cr['width']<=w+1,(w,cr)
    panel_el=d.find_element(By.CSS_SELECTOR,'#rppFaithfulV7 .v7-panel');panel=panel_el.rect;outer=d.find_element(By.CSS_SELECTOR,'#rppFaithfulV7 .v7-frame-outer').rect
    pw=d.find_element(By.ID,'pw').rect;helper=d.find_element(By.CSS_SELECTOR,'#rppFaithfulV7 .v10-helper').rect;unlock_el=d.find_element(By.ID,'unlock');unlock=unlock_el.rect;author=d.find_element(By.ID,'gateAuthorLink').rect;lock_el=d.find_element(By.CSS_SELECTOR,'#rppFaithfulV7 .v7-lock');lock=lock_el.rect
    meteors=d.find_elements(By.CSS_SELECTOR,'#rppR25MeteorSky i');sky=d.find_element(By.ID,'rppR25MeteorSky');gate=d.find_element(By.ID,'gate')
    assert gate.get_attribute('data-r25-stars')=='periodic',(w,'periodic star marker missing');assert len(meteors)==4,(w,len(meteors))
    names=[d.execute_script("return getComputedStyle(arguments[0]).animationName",s) for s in meteors];assert all('r25Shoot' in n for n in names),(w,names)
    assert d.execute_script("return getComputedStyle(arguments[0]).pointerEvents",sky)=='none',(w,'meteor layer blocks taps')
    bg=d.execute_script("return getComputedStyle(arguments[0]).backgroundImage",unlock_el);assert 'unlock-luxury-v11.svg' in bg,(w,bg)
    lock_bg=d.execute_script("return getComputedStyle(arguments[0]).backgroundImage",lock_el);assert 'lock-artdeco-v11-r3.svg' in lock_bg,(w,lock_bg)
    assert 17<=lock['width']<=23 and 24<=lock['height']<=33,(w,lock)
    assert lock['x']>=pw['x']+7 and lock['x']+lock['width']<=pw['x']+pw['width']-7,(w,pw,lock)
    assert panel['x']>=outer['x']+3 and panel['x']+panel['width']<=outer['x']+outer['width']-3,(w,outer,panel)
    assert panel['y']+8<=pw['y'] and pw['y']+pw['height']<=helper['y']+5,(w,panel,pw,helper)
    assert helper['y']+helper['height']+4<=unlock['y'] and unlock['y']+unlock['height']<=panel['y']+panel['height']-3,(w,panel,helper,unlock)
    assert panel['y']+panel['height']+7<=author['y'] and author['y']+author['height']<=outer['y']+outer['height']-6,(w,outer,panel,author)
    assert d.execute_script('return document.documentElement.scrollWidth <= window.innerWidth + 1')
    d.save_screenshot(str(out/f'63-faithful-current-{w}.png'));print(f'  ✓ {w}x{h}: 9:16 cover + 4 periodic meteors + tap-safe layout',flush=True)
  print('FAITHFUL CURRENT GATE VISUAL SMOKE OK',flush=True)
finally:d.quit()
