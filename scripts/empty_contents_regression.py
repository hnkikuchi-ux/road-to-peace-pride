import os
import time
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options


BASE = os.environ.get('RPP_BASE_URL', 'http://127.0.0.1:8787')
GROUPS = ['中区', '南総区', '港南総区', '磯子総区', '金沢総区', '栄区']
EMPTY_TEXT = 'この章の記録は、これから掲載されます。'


def check(ok, label):
    if not ok:
        raise AssertionError(label)
    print('  ✓ ' + label, flush=True)


out = Path('artifacts/screens')
out.mkdir(parents=True, exist_ok=True)
options = Options()
options.add_argument('--headless=new')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
options.add_argument('--lang=ja-JP')
options.add_argument('--window-size=390,844')
driver = webdriver.Chrome(options=options)
wait = WebDriverWait(driver, 20)

try:
    driver.get(BASE + '/refresh?empty=' + str(int(time.time() * 1000)))
    driver.execute_script("localStorage.setItem('rpp_viewer_consent_v1','1')")
    wait.until(EC.visibility_of_element_located((By.ID, 'pw'))).send_keys('demo')
    driver.execute_script(
        'arguments[0].click()',
        wait.until(EC.element_to_be_clickable((By.ID, 'unlock'))),
    )
    wait.until(EC.visibility_of_element_located((By.ID, 'cover')))
    wait.until(EC.visibility_of_element_located((By.ID, 'toc')))

    # Force an empty public collection before the next document's application
    # scripts run, then reload with the viewer cookie already in place. This is the
    # returning-viewer resumeSession path that previously left the generic note.
    driver.execute_cdp_cmd('Page.addScriptToEvaluateOnNewDocument', {'source': """
      (() => {
        const nativeFetch = window.fetch.bind(window);
        window.fetch = async (input, init) => {
          const url = typeof input === 'string' ? input : (input && input.url) || '';
          if (url.includes('/api/stories')) {
            return new Response(JSON.stringify({stories: []}), {
              status: 200,
              headers: {'Content-Type': 'application/json'}
            });
          }
          return nativeFetch(input, init);
        };
      })();
    """})
    driver.refresh()
    wait.until(EC.visibility_of_element_located((By.ID, 'cover')))
    wait.until(EC.visibility_of_element_located((By.ID, 'toc')))
    sections = wait.until(lambda d: (
        d.find_elements(
            By.CSS_SELECTOR,
            '#tocList > .rpp-district-section:not(.rpp-legacy-section)',
        )
        if len(d.find_elements(
            By.CSS_SELECTOR,
            '#tocList > .rpp-district-section:not(.rpp-legacy-section)',
        )) == 6 else False
    ))

    names = [element.text for element in driver.find_elements(
        By.CSS_SELECTOR,
        '#tocList > .rpp-district-section:not(.rpp-legacy-section) .rpp-district-name',
    )]
    empty_texts = [element.get_attribute('textContent').strip() for element in driver.find_elements(
        By.CSS_SELECTOR,
        '#tocList > .rpp-district-section:not(.rpp-legacy-section) > .rpp-district-empty',
    )]
    heads = driver.find_elements(
        By.CSS_SELECTOR,
        '#tocList > .rpp-district-section:not(.rpp-legacy-section) > .rpp-district-head',
    )

    check(len(sections) == 6, 'returning viewer sees all six organization chapters')
    check(names == GROUPS, 'organization names and order stay unchanged at zero stories')
    check(empty_texts == [EMPTY_TEXT] * 6, 'every empty chapter shows the agreed guidance')
    check(not driver.find_elements(By.CSS_SELECTOR, '#tocList > .note'),
          'legacy generic empty message is removed')
    check(all(head.get_attribute('role') == 'button' for head in heads),
          'all six empty chapters remain usable accordions')
    driver.execute_script('arguments[0].click()', heads[0])
    wait.until(lambda d: 'rpp-open' in (sections[0].get_attribute('class') or ''))
    check(sections[0].find_element(By.CSS_SELECTOR, '.rpp-district-empty').is_displayed(),
          'opening an empty chapter reveals its guidance')
    check(driver.execute_script(
        'return document.documentElement.scrollWidth <= window.innerWidth + 2'
    ), 'zero-story contents has no horizontal overflow on mobile')
    driver.save_screenshot(str(out / '64-empty-six-chapters-390.png'))
    print('EMPTY CONTENTS SIX-CHAPTER REGRESSION PASSED', flush=True)
finally:
    driver.quit()
