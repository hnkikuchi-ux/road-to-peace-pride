import os,time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

BASE=os.environ.get('RPP_BASE_URL','https://road-to-peace-pride.hn-kikuchi.workers.dev')
opt=Options(); opt.add_argument('--headless=new'); opt.add_argument('--no-sandbox'); opt.add_argument('--disable-dev-shm-usage'); opt.add_argument('--window-size=390,844'); opt.add_argument('--lang=ja-JP')
d=webdriver.Chrome(options=opt)
try:
    d.get(BASE+'/')
    time.sleep(3)
    src=d.page_source.splitlines()
    print('PAGE SOURCE LINES',len(src),flush=True)
    for n in range(82,95):
        if n<=len(src): print(f'{n}: {src[n-1]}',flush=True)
finally:
    d.quit()
