import os,time
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

BASE=os.environ.get('RPP_BASE_URL','https://road-to-peace-pride.hn-kikuchi.workers.dev')
opt=Options();opt.add_argument('--headless=new');opt.add_argument('--no-sandbox');opt.add_argument('--disable-dev-shm-usage');opt.add_argument('--lang=ja-JP')
d=webdriver.Chrome(options=opt)
try:
    d.set_window_size(390,844)
    d.get(BASE+'/refresh?v8='+str(int(time.time())))
    card=WebDriverWait(d,25).until(EC.visibility_of_element_located((By.CSS_SELECTOR,'#gate .gate-card')))
    WebDriverWait(d,25).until(lambda x: card.get_attribute('data-top-polish')=='faithful-v8' and card.get_attribute('data-v8-revision')=='r3')
    root=d.find_element(By.ID,'rppFaithfulV8'); assert root.get_attribute('data-layout')=='faithful-v8-approved'
    assert card.get_attribute('data-light-path')=='approved-center-horizon'
    assert card.get_attribute('data-v8-revision')=='r3'
    cr=card.rect; ratio=cr['width']/cr['height']; assert abs(ratio-9/16)<.015,ratio
    road=d.find_element(By.CSS_SELECTOR,'#rppFaithfulV8 .v8-road'); rr=road.rect
    top=(rr['y']-cr['y'])/cr['height']; bottom=(rr['y']+rr['height']-cr['y'])/cr['height']
    assert .475 <= top <= .495,(top,bottom); assert .642 <= bottom <= .662,(top,bottom)
    bridge=d.find_element(By.CSS_SELECTOR,'#rppFaithfulV7 .v7-bridge').rect
    panel=d.find_element(By.CSS_SELECTOR,'#rppFaithfulV7 .v7-panel').rect
    pw=d.find_element(By.ID,'pw').rect; unlock=d.find_element(By.ID,'unlock').rect; author=d.find_element(By.ID,'gateAuthorLink').rect
    assert pw['y']+pw['height']+8 <= unlock['y'],(pw,unlock)
    assert unlock['y']+unlock['height']+8 <= author['y'],(unlock,author)
    assert panel['y']+8 <= pw['y'] and author['y']+author['height'] <= panel['y']+panel['height']-4,(panel,pw,author)
    assert bridge['y']+bridge['height'] < panel['y'],(bridge,panel)
    clip=d.execute_script("return getComputedStyle(document.getElementById('unlock')).clipPath")
    assert clip in ('none',''),clip
    assert d.find_elements(By.CSS_SELECTOR,'#rppFaithfulV7 .v7-lock svg')
    out=Path('artifacts/screens');out.mkdir(parents=True,exist_ok=True);d.save_screenshot(str(out/'30-faithful-v8-top.png'))
    print('FAITHFUL V8 R3 APPROVED BALANCE OK',flush=True)
finally:
    d.quit()
