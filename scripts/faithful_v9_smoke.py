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
        d.get(BASE+'/refresh?v9='+str(int(time.time()*1000)))
        card=WebDriverWait(d,25).until(EC.visibility_of_element_located((By.CSS_SELECTOR,'#gate .gate-card')))
        WebDriverWait(d,25).until(lambda x: card.get_attribute('data-top-polish')=='faithful-v9')
        WebDriverWait(d,3).until(lambda x: len(x.find_elements(By.CSS_SELECTOR,'#unlock .v9-shine'))==1 and len(x.find_elements(By.CSS_SELECTOR,'#gateAuthorLink .v9-shine'))==1)
        assert card.get_attribute('data-v9-layout')=='responsive-premium'
        assert card.get_attribute('data-v9-road')=='base-art-only'
        cr=card.rect
        ratio=cr['width']/cr['height']; assert abs(ratio-9/16)<.015,(w,h,ratio)
        assert cr['width'] <= w+1,(w,cr)

        road=d.find_element(By.CSS_SELECTOR,'#rppFaithfulV8 .v8-road')
        assert d.execute_script("return getComputedStyle(arguments[0]).display",road)=='none'

        main=d.find_element(By.CSS_SELECTOR,'#rppFaithfulV7 .v7-main').rect
        bridge=d.find_element(By.CSS_SELECTOR,'#rppFaithfulV7 .v7-bridge').rect
        panel=d.find_element(By.CSS_SELECTOR,'#rppFaithfulV7 .v7-panel').rect
        outer=d.find_element(By.CSS_SELECTOR,'#rppFaithfulV7 .v7-frame-outer').rect
        pw=d.find_element(By.ID,'pw').rect
        unlock=d.find_element(By.ID,'unlock').rect
        author=d.find_element(By.ID,'gateAuthorLink').rect

        assert main['y']+main['height'] < bridge['y'],(w,main,bridge)
        assert bridge['y']+bridge['height'] < panel['y'],(w,bridge,panel)
        assert panel['x'] >= outer['x']+4 and panel['x']+panel['width'] <= outer['x']+outer['width']-4,(w,outer,panel)
        assert panel['y'] >= outer['y']+4 and panel['y']+panel['height'] <= outer['y']+outer['height']-4,(w,outer,panel)
        assert panel['y']+8 <= pw['y'] and pw['y']+pw['height']+7 <= unlock['y'],(w,panel,pw,unlock)
        assert unlock['y']+unlock['height']+6 <= author['y'],(w,unlock,author)
        assert author['y']+author['height'] <= panel['y']+panel['height']-4,(w,panel,author)
        assert d.find_elements(By.CSS_SELECTOR,'#unlock .v9-shine')
        assert d.find_elements(By.CSS_SELECTOR,'#gateAuthorLink .v9-shine')
        assert d.execute_script("return document.documentElement.scrollWidth <= window.innerWidth + 1")
        d.save_screenshot(str(out/f'40-faithful-v9-{w}.png'))
        print(f'  ✓ {w}x{h} responsive geometry',flush=True)
    print('FAITHFUL V9 RESPONSIVE + SHINE OK',flush=True)
finally:
    d.quit()
