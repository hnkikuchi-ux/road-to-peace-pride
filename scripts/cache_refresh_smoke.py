import os,time
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
    d.get(BASE+'/refresh?qa='+str(int(time.time())))
    card=WebDriverWait(d,25).until(EC.visibility_of_element_located((By.CSS_SELECTOR,'#gate .gate-card')))
    WebDriverWait(d,25).until(lambda x: card.get_attribute('data-top-polish')=='faithful-v7')
    root=d.find_element(By.ID,'rppFaithfulV7')
    assert root.get_attribute('data-layout')=='faithful-v7-9x16'
    bg=d.execute_script("return getComputedStyle(document.querySelector('#gate .gate-card'),'::before').backgroundImage")
    assert 'premium-v5-bg.webp' in bg,bg
    assert d.find_element(By.ID,'unlock').get_attribute('aria-label')=='記録をひらく'
    print('CACHE REFRESH ROUTE SHOWS FAITHFUL V7',flush=True)
finally:
    d.quit()
