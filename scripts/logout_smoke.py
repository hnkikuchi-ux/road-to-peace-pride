import os,time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

BASE=os.environ.get('RPP_BASE_URL','https://road-to-peace-pride.hn-kikuchi.workers.dev')
WAIT=25
opt=Options();opt.add_argument('--headless=new');opt.add_argument('--no-sandbox');opt.add_argument('--disable-dev-shm-usage');opt.add_argument('--lang=ja-JP')
d=webdriver.Chrome(options=opt)
try:
    d.set_window_size(390,844)
    d.get(BASE+'/refresh?logout-smoke='+str(int(time.time())))
    WebDriverWait(d,WAIT).until(EC.visibility_of_element_located((By.ID,'pw'))).send_keys('demo')
    WebDriverWait(d,WAIT).until(EC.element_to_be_clickable((By.ID,'unlock'))).click()
    WebDriverWait(d,WAIT).until(EC.visibility_of_element_located((By.CSS_SELECTOR,'#cover:not(.hidden)')))
    logout=WebDriverWait(d,WAIT).until(EC.element_to_be_clickable((By.CSS_SELECTOR,'#cover .rpp-viewer-logout')))
    assert logout.text.strip()=='ログアウト'
    assert logout.get_attribute('aria-label')=='閲覧をログアウトしてトップへ戻る'
    logout.click()
    WebDriverWait(d,WAIT).until(EC.visibility_of_element_located((By.CSS_SELECTOR,'#gate:not(.hidden)')))
    WebDriverWait(d,WAIT).until(lambda x:x.find_element(By.CSS_SELECTOR,'#gate .gate-card').get_attribute('data-artwork-version')=='premium-v5-parts')
    status=d.execute_async_script("const done=arguments[0];fetch('/api/stories',{credentials:'same-origin',cache:'no-store'}).then(r=>done(r.status)).catch(()=>done(-1));")
    assert status==401,status
    assert not any(e.is_displayed() for e in d.find_elements(By.CSS_SELECTOR,'.rpp-viewer-logout'))
    print('VIEWER LOGOUT BUTTON CLEARS SESSION AND RETURNS TO PREMIUM TOP',flush=True)
finally:
    d.quit()
