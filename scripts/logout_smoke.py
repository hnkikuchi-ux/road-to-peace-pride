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
    # Privacy-consent behavior is covered exhaustively by full_product_qa.
    # This smoke isolates the authenticated viewer logout path.
    d.execute_script("localStorage.setItem('rpp_viewer_consent_v1','1')")
    WebDriverWait(d,WAIT).until(EC.visibility_of_element_located((By.ID,'pw'))).send_keys('demo')
    d.execute_script("arguments[0].click()",WebDriverWait(d,WAIT).until(EC.element_to_be_clickable((By.ID,'unlock'))))
    WebDriverWait(d,WAIT).until(EC.visibility_of_element_located((By.CSS_SELECTOR,'#cover:not(.hidden)')))
    WebDriverWait(d,WAIT).until(EC.visibility_of_element_located((By.CSS_SELECTOR,'#toc:not(.hidden)')))
    # r13 intentionally removes logout from the artwork cover; the persistent
    # viewer logout control lives with CONTENTS instead.
    logout=WebDriverWait(d,WAIT).until(EC.element_to_be_clickable((By.CSS_SELECTOR,'#toc .rpp-viewer-logout')))
    assert logout.text.strip()=='ログアウト'
    assert logout.get_attribute('aria-label')=='閲覧をログアウトしてトップへ戻る'
    d.execute_script("arguments[0].click()",logout)
    WebDriverWait(d,WAIT).until(EC.visibility_of_element_located((By.CSS_SELECTOR,'#gate:not(.hidden)')))
    # The viewer session must be gone, regardless of whether consent remains
    # remembered locally on this device.
    status=d.execute_async_script("const done=arguments[0];fetch('/api/stories',{credentials:'same-origin',cache:'no-store'}).then(r=>done(r.status)).catch(()=>done(-1));")
    assert status==401,status
    assert not any(e.is_displayed() for e in d.find_elements(By.CSS_SELECTOR,'.rpp-viewer-logout'))
    assert d.execute_script('return document.documentElement.scrollWidth <= window.innerWidth + 1')
    print('VIEWER LOGOUT CLEARS SESSION AND RETURNS TO PASSWORD GATE',flush=True)
finally:
    d.quit()
