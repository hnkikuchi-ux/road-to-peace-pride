import os,time,sys
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

BASE=os.environ.get('RPP_BASE_URL','https://road-to-peace-pride.hn-kikuchi.workers.dev')
OUT=Path(os.environ.get('RPP_SCREENSHOT_DIR','artifacts/screens')); OUT.mkdir(parents=True,exist_ok=True)
WAIT=25

def visible(d,s): return WebDriverWait(d,WAIT).until(EC.visibility_of_element_located((By.CSS_SELECTOR,s)))
def clickable(d,s): return WebDriverWait(d,WAIT).until(EC.element_to_be_clickable((By.CSS_SELECTOR,s)))
def ok(s): print('  ✓ '+s,flush=True)
def assert_in(needle,value,label):
    if needle not in value: raise AssertionError(f'{label}: {value}')
def inside(card,el,tol=2):
    c=card.rect;r=el.rect
    return r['x']>=c['x']-tol and r['x']+r['width']<=c['x']+c['width']+tol and r['y']>=c['y']-tol and r['y']+r['height']<=c['y']+c['height']+tol

def verify_top(d):
    card=visible(d,'#gate .gate-card')
    WebDriverWait(d,WAIT).until(lambda x:x.find_element(By.CSS_SELECTOR,'#gate .gate-card').get_attribute('data-artwork-version')=='premium-v5-parts')
    assert card.get_attribute('data-artwork-assets')=='bg,input,unlock,author,divider,lock'
    bg=d.execute_script("return getComputedStyle(document.querySelector('#gate .gate-card'),'::before').backgroundImage")
    assert_in('premium-v5-bg.webp',bg,'background asset')
    divider=visible(d,'.rpp-title-divider'); assert_in('premium-v5-divider.webp',d.execute_script('return getComputedStyle(arguments[0]).backgroundImage',divider),'divider asset')
    pw=visible(d,'#pw'); assert_in('premium-v5-input.webp',d.execute_script('return getComputedStyle(arguments[0]).backgroundImage',pw),'input asset')
    unlock=visible(d,'#unlock'); assert_in('premium-v5-unlock.webp',d.execute_script('return getComputedStyle(arguments[0]).backgroundImage',unlock),'unlock asset')
    author=visible(d,'#gateAuthorLink'); assert_in('premium-v5-author.webp',d.execute_script('return getComputedStyle(arguments[0]).backgroundImage',author),'author asset')
    lock=visible(d,'.rpp-v5-lock'); assert_in('premium-v5-lock.webp',d.execute_script('return getComputedStyle(arguments[0]).backgroundImage',lock),'lock asset')
    assert d.find_elements(By.CSS_SELECTOR,'.rpp-v5-frame') and len(d.find_elements(By.CSS_SELECTOR,'.rpp-v5-corner'))==4
    assert visible(d,'#rppCrispCopy .rpp-road').text.strip()=='ROAD TO'
    assert visible(d,'#rppCrispCopy .rpp-pride').text.strip()=='PEACE PRIDE'
    assert visible(d,'#rppCrispCopy .rpp-jp-date').text.strip()=='9.12までの'
    assert visible(d,'#rppCrispCopy .rpp-jp-main').text.strip()=='挑戦と誓いの記録'
    bridge=visible(d,'#rppCrispCopy .bridge'); assert '11.15' in bridge.text and '11.18' in bridge.text
    assert unlock.get_attribute('aria-label')=='記録をひらく'
    assert author.get_attribute('aria-label')=='私の記録を綴る / WRITE YOUR STORY'
    pseudo=d.execute_script("const e=arguments[0];return [getComputedStyle(e,'::before').content,getComputedStyle(e,'::after').content]",author)
    assert '私の記録を綴る' in pseudo[0] and 'WRITE YOUR STORY' in pseudo[1]
    ratio=card.rect['height']/card.rect['width']; assert abs(ratio-(1672/941))<.03,(ratio,card.rect)
    anim=d.execute_script("return getComputedStyle(document.querySelector('#gate .gate-card'),'::before').animationName"); assert 'rppArtworkBreath' in anim
    for n,e in [('password',pw),('unlock',unlock),('author',author)]: assert inside(card,e),(n,e.rect,card.rect)
    return card,pw,unlock,author

opt=Options();opt.add_argument('--headless=new');opt.add_argument('--no-sandbox');opt.add_argument('--disable-dev-shm-usage');opt.add_argument('--lang=ja-JP');opt.add_argument('--force-device-scale-factor=1');opt.set_capability('goog:loggingPrefs',{'browser':'ALL'})
d=webdriver.Chrome(options=opt)
try:
    print('1) Premium v5 mobile top',flush=True)
    d.set_window_size(390,844);d.get(BASE+'/?qa=v5-'+str(int(time.time())))
    card,pw,unlock,author=verify_top(d)
    if d.execute_script('return document.documentElement.scrollWidth > window.innerWidth + 2'): raise AssertionError('mobile horizontal overflow')
    d.save_screenshot(str(OUT/'01-top-cover.png'));d.save_screenshot(str(OUT/'05-mobile-motion-top.png'));ok('mobile v5 layered top rendered and captured')
    d.execute_script("const e=arguments[0],r=e.getBoundingClientRect();e.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:r.left+r.width/2,clientY:r.top+r.height/2,pointerId:1}));",unlock)
    WebDriverWait(d,3).until(lambda x:'rpp-pressed' in (x.find_element(By.ID,'unlock').get_attribute('class') or ''));ok('pressed feedback remains active')
    d.execute_script("arguments[0].dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:1}));",unlock)
    pw.send_keys('demo');clickable(d,'#unlock').click();visible(d,'#cover:not(.hidden)');ok('viewer login still works')
    clickable(d,'#tocBtn').click();visible(d,'#toc:not(.hidden)');items=WebDriverWait(d,WAIT).until(lambda x:x.find_elements(By.CSS_SELECTOR,'.toc-item button'));assert items;items[0].click();visible(d,'#reader:not(.hidden)');ok('TOC and story opening still work')

    print('2) Premium v5 desktop top',flush=True)
    d.set_window_size(1440,900);d.get(BASE+'/?qa=v5-desktop-'+str(int(time.time())))
    card,pw,unlock,author=verify_top(d)
    assert card.rect['width']<=430.5 and card.rect['height']<=900,card.rect
    vw=d.execute_script('return window.innerWidth');vh=d.execute_script('return window.innerHeight');r=card.rect;assert r['x']>=0 and r['x']+r['width']<=vw+2 and r['y']>=0 and r['y']+r['height']<=vh+2,(r,vw,vh)
    pride=visible(d,'#rppCrispCopy .rpp-pride');pr=pride.rect;assert pr['x']>=r['x'] and pr['x']+pr['width']<=r['x']+r['width']+2,('title clipped',pr,r)
    d.save_screenshot(str(OUT/'06-desktop-exact-login.png'));ok('desktop v5 top fits without title/control clipping')

    errors=[x for x in d.get_log('browser') if x.get('level')=='SEVERE' and any(k in x.get('message','') for k in ['Uncaught','SyntaxError','ReferenceError','TypeError'])]
    if errors: print(errors,file=sys.stderr);raise AssertionError('severe browser JS error')
    print('PREMIUM V5 BROWSER QA PASSED',flush=True)
finally:
    d.quit()
