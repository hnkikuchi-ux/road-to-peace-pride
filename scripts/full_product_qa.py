import base64, os, re, tempfile, time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select

BASE=os.environ.get('RPP_BASE_URL','https://road-to-peace-pride.hn-kikuchi.workers.dev')
GROUPS=['中区','南総区','港南総区','磯子総区','金沢総区','栄区']
FORBIDDEN=['そして、11.15、11.18へ','OUR VOW, OUR JOURNEY','STORIES ↓','続きから読む','WRITE YOUR STORY｜私の記録を綴る','WRITE YOUR STORY｜原稿を書く','ログアウト','前回：']
os.makedirs('artifacts/screens',exist_ok=True)

def check(ok,label):
    if not ok: raise AssertionError(label)
    print('  ✓ '+label,flush=True)

def mkdriver(w=390,h=844):
    o=Options();o.add_argument('--headless=new');o.add_argument('--no-sandbox');o.add_argument('--disable-dev-shm-usage');o.add_argument('--lang=ja-JP');o.add_argument(f'--window-size={w},{h}')
    d=webdriver.Chrome(options=o);d.set_window_size(w,h);return d

def visible_text(d,selector):
    return '\n'.join(x.text for x in d.find_elements(By.CSS_SELECTOR,selector) if x.is_displayed())

def clickjs(d,el): d.execute_script('arguments[0].click()',el)

def tiny_jpeg():
    # Valid 2x2 RGB JPEG. Keep this decodable by createImageBitmap; the older
    # header-only fixture was accepted as a file but failed during browser decode.
    raw=base64.b64decode('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAACAAIDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD7LooooA//2Q==')
    f=tempfile.NamedTemporaryFile(suffix='.jpg',delete=False);f.write(raw);f.close();return f.name

print('A) Viewer: unlock -> privacy consent -> cover -> direct CONTENTS -> story reader')
d=mkdriver();w=WebDriverWait(d,20)
try:
    d.get(BASE+'/refresh?fullqa='+str(int(time.time())))
    d.execute_script("localStorage.removeItem('rpp_viewer_consent_v1')")
    pw=w.until(EC.visibility_of_element_located((By.ID,'pw')));pw.send_keys('demo');clickjs(d,d.find_element(By.ID,'unlock'))
    consent=w.until(EC.visibility_of_element_located((By.ID,'rppViewerConsent')))
    check('閲覧にあたっての確認事項' in consent.text,'privacy consent appears after viewer password')
    check('本企画参加者のみ' in consent.text,'participant-only purpose is stated')
    check('外部共有' in consent.text,'external sharing restriction is stated')
    accept=d.find_element(By.ID,'rppConsentAccept');check(not accept.is_enabled(),'consent button starts disabled')
    d.find_element(By.ID,'rppConsentCheck').click();check(accept.is_enabled(),'checking consent enables continue button')
    clickjs(d,accept);w.until(EC.invisibility_of_element_located((By.ID,'rppViewerConsent')))
    check(d.execute_script("return localStorage.getItem('rpp_viewer_consent_v1')==='1'"),'consent is remembered on this device')
    w.until(EC.visibility_of_element_located((By.ID,'cover')));w.until(EC.visibility_of_element_located((By.ID,'toc')));time.sleep(.5)
    cover=d.find_element(By.ID,'cover');toc=d.find_element(By.ID,'toc');ctext=visible_text(d,'#cover *')
    for phrase in FORBIDDEN:
        if phrase in ctext:
            hits=[]
            for el in d.find_elements(By.CSS_SELECTOR,'#cover *'):
                if el.is_displayed() and phrase in el.text:
                    hits.append({'tag':el.tag_name,'id':el.get_attribute('id'),'class':el.get_attribute('class'),'text':el.text[:300],'before':d.execute_script("return getComputedStyle(arguments[0],'::before').content",el),'after':d.execute_script("return getComputedStyle(arguments[0],'::after').content",el)})
            print('DIAG FORBIDDEN',repr(phrase),hits,flush=True)
        check(phrase not in ctext,f'cover does not show: {phrase}')
    check('9.12までの挑戦と誓いの記録' in cover.text,'cover keeps the main memorial subtitle')
    check('CONTENTS' in toc.text,'contents begins immediately after cover')
    check(not d.find_elements(By.CSS_SELECTOR,'#toc .top-actions .eyebrow'),'small CONTENTS label is removed')
    check(d.execute_script('return document.documentElement.scrollWidth<=document.documentElement.clientWidth+2'),'viewer has no horizontal overflow on mobile')
    sections=w.until(lambda x:x.find_elements(By.CSS_SELECTOR,'.rpp-district-section:not(.rpp-legacy-section)'))
    check(len(sections)==6,'six publication organization sections render')
    names=[x.text for x in d.find_elements(By.CSS_SELECTOR,'.rpp-district-section:not(.rpp-legacy-section) .rpp-district-name')]
    check(names==GROUPS,'organization order is correct')
    check(all('rpp-open' not in s.get_attribute('class') for s in sections),'all organization sections start closed')
    heads=d.find_elements(By.CSS_SELECTOR,'.rpp-district-section:not(.rpp-legacy-section) .rpp-district-head')
    clickjs(d,heads[0]);time.sleep(.45);check('rpp-open' in sections[0].get_attribute('class'),'organization accordion opens')
    items=sections[0].find_elements(By.CSS_SELECTOR,'.toc-item button')
    if not items:
        for i,h in enumerate(heads[1:],1):
            clickjs(d,h);time.sleep(.45);items=sections[i].find_elements(By.CSS_SELECTOR,'.toc-item button')
            if items: break
    check(bool(items),'at least one demo/public story can be opened')
    clickjs(d,items[0]);w.until(EC.visibility_of_element_located((By.ID,'reader')))
    check(bool(d.find_element(By.ID,'title').text.strip()),'story reader shows title')
    check(bool(d.find_element(By.ID,'body').text.strip()),'story reader shows body')
    clickjs(d,d.find_element(By.ID,'backToc'));w.until(EC.visibility_of_element_located((By.ID,'toc')))
    check(d.find_element(By.ID,'toc').is_displayed(),'reader returns to contents')
    d.save_screenshot('artifacts/screens/fullqa-viewer.png')
finally:d.quit()

print('B) Author: first auth -> fixed 6-digit code -> simplified editor -> preview -> submit')
d=mkdriver();w=WebDriverWait(d,20);jpg=None;issued=''
try:
    d.get(BASE+'/author.html?fullqa='+str(int(time.time())))
    email=f'fullqa-{int(time.time())}@example.invalid'
    w.until(EC.visibility_of_element_located((By.ID,'email'))).send_keys(email);clickjs(d,d.find_element(By.ID,'send'))
    msg=w.until(lambda x:x.find_element(By.ID,'authmsg').text);m=re.search(r'(\d{6})',msg);check(bool(m),'preview email verification code is issued')
    d.find_element(By.ID,'otp').send_keys(m.group(1));clickjs(d,d.find_element(By.ID,'verify'))
    checkpoint=w.until(EC.visibility_of_element_located((By.ID,'rppCodeCheckpoint')));cm=re.search(r'(?<!\d)(\d{3})\s?(\d{3})(?!\d)',checkpoint.text);check(bool(cm),'persistent edit code shown as six digits')
    issued=''.join(cm.groups());check('この6桁コード' in checkpoint.text,'checkpoint explains the same six-digit code is used later')
    d.find_element(By.ID,'rppCodeSaved').click();clickjs(d,d.find_element(By.ID,'rppCheckpointContinue'))
    w.until(EC.visibility_of_element_located((By.ID,'editor')));time.sleep(.8);bodytxt=d.find_element(By.ID,'editor').text
    for phrase in ['SAVE STATUS','原稿の締切は現在設定されていません。','基本情報','記載日・組織名・氏名を入力してください。','写真・確認・提出','皆さまの記録を、総区ごとの章に分けて掲載するために使用します。','アップロード前に最大1600pxへ圧縮し、JPEG再生成で通常の位置情報等のメタデータを除去します。']:
        check(phrase not in bodytxt,f'legacy/help text removed: {phrase}')
    check('自動で下書き保存されます。' in bodytxt,'friendly autosave message shown')
    check(not d.find_element(By.ID,'record_date').is_displayed(),'record date is hidden from author')
    check(d.find_element(By.ID,'name').is_displayed(),'name field is visible')
    org=Select(w.until(EC.visibility_of_element_located((By.ID,'rppOrgSelect'))));check([o.text for o in org.options][1:]==GROUPS,'organization selector contains exactly six groups')
    detail=w.until(EC.visibility_of_element_located((By.ID,'rppOrgDetail')));check(detail.is_displayed(),'combined district/headquarters/unit field is visible')
    for id_ in ['rppBunku','rppHonbu','rppShibu']:check(not d.find_element(By.ID,id_).is_displayed(),f'legacy {id_} field is hidden')
    check(d.find_element(By.ID,'body').get_attribute('placeholder')=='本文はこちらに入力してください。','body placeholder is simplified')
    check('9.12までの挑戦・これからの誓い・思いをありのまま綴ってください。' in bodytxt,'writing prompt is present')
    check('写真は任意です。' in bodytxt,'optional-photo message is prominent')
    check(d.find_element(By.ID,'save').text=='下書き保存','draft button label correct');check(d.find_element(By.ID,'previewBtn').text=='掲載イメージを確認','preview button label correct');check(d.find_element(By.ID,'submit').text=='この内容で提出する','submit button label correct')
    d.find_element(By.ID,'name').send_keys('QA テスト');org.select_by_visible_text('磯子総区');detail.send_keys('テスト分区／テスト本部／テスト部')
    d.find_element(By.ID,'title').send_keys('希望をつなぐために');d.find_element(By.ID,'body').send_keys('9.12までの挑戦と、これからの誓いを綴るテスト本文です。');time.sleep(.3)
    local=d.execute_script("return Object.keys(localStorage).filter(k=>k.startsWith('rpp_draft_')).map(k=>localStorage.getItem(k)).join('')");check('希望をつなぐために' in local,'typing is immediately preserved to local draft storage')
    jpg=tiny_jpeg();d.find_element(By.ID,'photo').send_keys(jpg);time.sleep(1.0)
    clickjs(d,d.find_element(By.ID,'previewBtn'));w.until(EC.visibility_of_element_located((By.ID,'storyPreview')));time.sleep(.4)
    check(d.find_element(By.ID,'pTitle').text=='希望をつなぐために','publication preview shows the title');meta=d.find_element(By.ID,'pMeta').text
    for v in ['QA テスト','磯子総区','テスト分区／テスト本部／テスト部']:check(v in meta,f'publication preview includes {v}')
    check('9.12までの挑戦と、これからの誓い' in d.find_element(By.ID,'pBody').text,'publication preview shows full body');check(bool(d.find_elements(By.CSS_SELECTOR,'#storyPreview .r12-preview-photo')),'publication preview includes selected photo')
    d.save_screenshot('artifacts/screens/fullqa-author-preview.png');clickjs(d,d.find_element(By.ID,'closePreview'));w.until(EC.invisibility_of_element_located((By.ID,'storyPreview')))
    clickjs(d,d.find_element(By.ID,'save'));time.sleep(.4);check('保存' in d.find_element(By.ID,'saveState').text or '下書き' in d.find_element(By.ID,'saveState').text,'draft save state is understandable')
    clickjs(d,d.find_element(By.ID,'submit'));time.sleep(.8);check('提出済' in d.find_element(By.ID,'statusBadge').text,'submission updates status clearly');check(d.execute_script('return document.documentElement.scrollWidth<=document.documentElement.clientWidth+2'),'author editor has no horizontal overflow on mobile')
    d.save_screenshot('artifacts/screens/fullqa-author-editor.png')
    print('C) Re-edit: logout -> same email + same fixed six-digit code')
    clickjs(d,d.find_element(By.ID,'logout'));w.until(EC.visibility_of_element_located((By.ID,'auth')));time.sleep(.4);clickjs(d,w.until(EC.visibility_of_element_located((By.ID,'rppEditTab'))))
    emailbox=d.find_element(By.ID,'email');emailbox.clear();emailbox.send_keys(email);w.until(EC.visibility_of_element_located((By.ID,'rppEditCode'))).send_keys(issued);clickjs(d,d.find_element(By.ID,'rppEditLoginBtn'));w.until(EC.visibility_of_element_located((By.ID,'editor')));check(d.find_element(By.ID,'editor').is_displayed(),'same six-digit code reopens the manuscript')
finally:
    if jpg:
        try:os.unlink(jpg)
        except:pass
    d.quit()

print('D) Mobile/tablet responsive smoke')
for width,height in [(360,800),(390,844),(430,932),(768,1024)]:
    d=mkdriver(width,height);w=WebDriverWait(d,15)
    try:
        d.get(BASE+'/author.html?viewport='+str(width));w.until(EC.visibility_of_element_located((By.ID,'auth')));check(d.execute_script('return document.documentElement.scrollWidth<=document.documentElement.clientWidth+2'),f'author login no horizontal overflow at {width}px')
    finally:d.quit()
print('FULL PRODUCT QA PASSED',flush=True)
