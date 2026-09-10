import os
import sys
import time

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


BASE = os.environ.get('RPP_BASE_URL', 'https://road-to-peace-pride.hn-kikuchi.workers.dev')
WAIT = 25
FORBIDDEN = ('承認コード', '確認コード', '認証コード', '8桁', '23:59', '記録の編集・提出期限')


def check(value, label):
    if not value:
        raise AssertionError(label)
    print('  ✓ ' + label, flush=True)


options = Options()
options.add_argument('--headless=new')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
options.add_argument('--lang=ja-JP')
options.add_argument('--window-size=390,844')
options.add_argument(
    '--user-agent=Mozilla/5.0 (Linux; Android 16; Pixel 9) '
    'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36 Line/15.0.0'
)
options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})

driver = webdriver.Chrome(options=options)
driver.set_window_size(390, 844)
wait = WebDriverWait(driver, WAIT)


def severe_errors():
    markers = ('uncaught', 'syntaxerror', 'referenceerror', 'typeerror', 'javascript error')
    return [
        entry for entry in driver.get_log('browser')
        if entry.get('level') == 'SEVERE'
        and any(marker in entry.get('message', '').lower() for marker in markers)
    ]


try:
    print('1) Author first-use layout at LINE-sized viewport', flush=True)
    driver.get(BASE + '/author.html?mobile-final-qa=' + str(int(time.time())))
    wait.until(EC.visibility_of_element_located((By.ID, 'rppFirstTimeGuide')))
    time.sleep(1)
    guide = driver.find_element(By.ID, 'rppFirstTimeGuide')
    guide_text = guide.text.replace('\n', ' ')
    check('初めての方' in guide_text, 'first-time heading is visible')
    check('メールアドレスを入力し、「認識コードを送信」を押してください。' in guide_text,
          'first action is stated exactly')
    check(driver.find_element(By.ID, 'send').text.strip() == '認識コードを送信',
          'first-use CTA uses the canonical term')
    check(driver.find_element(By.ID, 'rppEditLoginBtn').text.strip() == '以前の原稿を編集する',
          'returning-author entry is clearly separated')
    check(driver.find_element(By.ID, 'deadlineAuth').text.strip() == '提出期限：2026年10月31日',
          'deadline shows date only')
    check(not driver.find_element(By.ID, 'record_date').is_displayed(),
          'record date is not a user input')
    page_text = driver.find_element(By.TAG_NAME, 'body').text
    check(not any(term in page_text for term in FORBIDDEN), 'legacy wording is absent')
    first_top = guide.rect['y']
    time.sleep(1.5)
    check(abs(guide.rect['y'] - first_top) <= 2, 'first-time guidance does not move after load')
    check(driver.execute_script(
        'return document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2'
    ), 'author page has no horizontal overflow at 390px')
    check(not severe_errors(), 'author page has no JavaScript exception')

    print('2) Viewer shell safety at LINE-sized viewport', flush=True)
    driver.get(BASE + '/?mobile-final-qa=' + str(int(time.time())))
    wait.until(EC.visibility_of_element_located((By.ID, 'gate')))
    favorite = driver.find_element(By.ID, 'fav')
    check(not favorite.is_displayed(), 'favorite control is not displayed')
    # Selenium's visible-text property is empty while the reader panel is hidden
    # behind the password gate. Inspect the actual labels without changing state.
    check(driver.find_element(By.ID, 'fontDown').get_attribute('textContent').strip() == 'A−'
          and driver.find_element(By.ID, 'fontUp').get_attribute('textContent').strip() == 'A＋',
          'reader font controls remain present')
    check(driver.execute_script(
        'return document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2'
    ), 'viewer shell has no horizontal overflow at 390px')
    errors = severe_errors()
    if errors:
        print(errors, file=sys.stderr)
    check(not errors, 'removing favorite does not stop viewer JavaScript')

    print('3) Admin login at mobile width', flush=True)
    driver.get(BASE + '/admin.html?mobile-final-qa=' + str(int(time.time())))
    wait.until(EC.visibility_of_element_located((By.ID, 'login')))
    password = driver.find_element(By.ID, 'password')
    check(password.get_attribute('type') == 'password', 'admin credential field stays masked')
    check(driver.execute_script(
        'return document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2'
    ), 'admin login has no horizontal overflow at 390px')
    check(not severe_errors(), 'admin login has no JavaScript exception')

    print('MOBILE / LINE-SIZED BROWSER SMOKE PASSED', flush=True)
finally:
    driver.quit()
