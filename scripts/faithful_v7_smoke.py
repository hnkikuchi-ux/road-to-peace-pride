import os,time
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

BASE=os.environ.get('RPP_BASE_URL','https://road-to-peace-pride.hn-kikuchi.workers.dev')
OUT=Path('artifacts/screens');OUT.mkdir(parents=True,exist_ok=True)
opt=Options();opt.add_argument('--headless=new');opt.add_argument('--no-sandbox');opt.add_argument('--disable-dev-shm-usage');opt.add_argument('--lang=ja-JP')
d=webdriver.Chrome(options=opt)
try:
    d.set_window_size(390,844)
    d.get(BASE+'/refresh?faithful_v7='+str(int(time.time())))
    root=WebDriverWait(d,25).until(EC.visibility_of_element_located((By.ID,'rppFaithfulV7')))
    card=d.find_element(By.CSS_SELECTOR,'#gate .gate-card')
    WebDriverWait(d,20).until(lambda x: card.get_attribute('data-top-polish')=='faithful-v7')
    assert root.get_attribute('data-layout')=='faithful-v7-9x16'
    cr=card.rect
    ratio=cr['width']/cr['height']
    assert abs(ratio-(9/16)) < .02,ratio
    road=d.find_element(By.CSS_SELECTOR,'.v7-road')
    pride=d.find_element(By.CSS_SELECTOR,'.v7-pride')
    assert road.text.strip()=='ROAD TO'
    assert pride.text.replace('\n',' ').strip()=='PEACE PRIDE'
    assert pride.rect['height'] < 75,pride.rect
    font=d.execute_script("return getComputedStyle(document.querySelector('.v7-pride')).fontFamily")
    assert 'Cormorant' in font or 'Baskerville' in font or 'Georgia' in font,font
    bridge=d.find_element(By.CSS_SELECTOR,'.v7-bridge')
    assert '11.15' in bridge.text and '11.18' in bridge.text
    assert float(d.execute_script("return parseFloat(getComputedStyle(document.querySelector('.v7-bridge')).fontSize)")) >= 12
    panel=d.find_element(By.CSS_SELECTOR,'.v7-panel').rect
    pw=d.find_element(By.ID,'pw'); unlock=d.find_element(By.ID,'unlock'); author=d.find_element(By.ID,'gateAuthorLink')
    pr,ur,ar=pw.rect,unlock.rect,author.rect
    assert pr['height'] >= 44,pr
    assert ur['height'] >= 48,ur
    assert ar['height'] >= 48,ar
    assert ur['y']-(pr['y']+pr['height']) >= 8,(pr,ur)
    assert ar['y']-(ur['y']+ur['height']) >= 20,(ur,ar)
    assert pr['y'] >= panel['y'] and ar['y']+ar['height'] <= panel['y']+panel['height']+2
    lock=d.find_element(By.CSS_SELECTOR,'.v7-lock svg')
    assert lock.is_displayed() and lock.rect['width'] >= 20 and lock.rect['height'] >= 20,lock.rect
    bg=d.execute_script("return getComputedStyle(document.querySelector('#gate .gate-card'),'::before').backgroundImage")
    assert 'premium-v5-bg.webp' in bg,bg
    d.save_screenshot(str(OUT/'20-faithful-v7-top.png'))
    pw.send_keys('demo')
    unlock.click()
    WebDriverWait(d,20).until(EC.visibility_of_element_located((By.ID,'cover')))
    print('FAITHFUL V7 TOP OK',round(ratio,4),round(pr['height'],1),round(ur['height'],1),round(ar['height'],1),flush=True)
finally:
    d.quit()
