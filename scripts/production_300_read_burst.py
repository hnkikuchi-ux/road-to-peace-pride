import concurrent.futures
import json
import os
from pathlib import Path
import statistics
import time
import urllib.error
import urllib.parse
import urllib.request


BASE = os.environ.get(
    'RPP_BASE_URL', 'https://road-to-peace-pride.hn-kikuchi.workers.dev'
).rstrip('/')
TOTAL = 300
WORKERS = 16
EXPECTED_BUILD = json.loads(
    (Path(__file__).resolve().parent.parent / 'public' / 'version.json').read_text(
        encoding='utf-8'
    )
)['build']
ROUTES = ('/', '/author.html', '/admin.html', '/api/health', '/version.json')


def validate(route, status, content_type, body):
    if status != 200:
        raise AssertionError(f'{route}: HTTP {status}')
    text = body.decode('utf-8')
    if route == '/':
        if 'id="gate"' not in text or 'id="reader"' not in text:
            raise AssertionError('viewer shell is incomplete')
    elif route == '/author.html':
        if '初めての方' not in text or '提出期限：2026年10月31日' not in text:
            raise AssertionError('author guidance is incomplete')
    elif route == '/admin.html':
        if 'id="login"' not in text or 'type="password"' not in text:
            raise AssertionError('admin login shell is incomplete')
    elif route == '/api/health':
        if 'application/json' not in content_type:
            raise AssertionError('health response is not JSON')
        data = json.loads(text)
        if data.get('ok') is not True or data.get('productionReady') is not True:
            raise AssertionError('production health is not ready')
    elif route == '/version.json':
        if 'application/json' not in content_type:
            raise AssertionError('version response is not JSON')
        data = json.loads(text)
        if data.get('build') != EXPECTED_BUILD:
            raise AssertionError('unexpected production build')


def read_once(index):
    route = ROUTES[index % len(ROUTES)]
    query = urllib.parse.urlencode({'read_burst': f'{int(time.time())}-{index}'})
    request = urllib.request.Request(
        f'{BASE}{route}?{query}',
        headers={
            'Accept': 'application/json,text/html;q=0.9,*/*;q=0.8',
            'Cache-Control': 'no-cache',
            'User-Agent': 'RPP-production-read-QA/1.0',
        },
    )
    started = time.perf_counter()
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            body = response.read()
            status = response.status
            content_type = response.headers.get('Content-Type', '')
    except urllib.error.HTTPError as error:
        raise AssertionError(f'{route}: HTTP {error.code}') from error
    validate(route, status, content_type, body)
    return (time.perf_counter() - started) * 1000


def percentile(values, proportion):
    ordered = sorted(values)
    position = max(0, min(len(ordered) - 1, round((len(ordered) - 1) * proportion)))
    return ordered[position]


def main():
    started = time.perf_counter()
    failures = []
    latencies = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=WORKERS) as pool:
        futures = {pool.submit(read_once, index): index for index in range(TOTAL)}
        for future in concurrent.futures.as_completed(futures):
            index = futures[future]
            try:
                latencies.append(future.result())
            except Exception as error:
                failures.append(f'request {index}: {error}')

    elapsed = time.perf_counter() - started
    if failures:
        for failure in failures[:20]:
            print('  ✗ ' + failure, flush=True)
        raise SystemExit(f'{len(failures)} of {TOTAL} production reads failed')

    print(f'  ✓ {TOTAL} production reads returned valid current content', flush=True)
    print(f'  ✓ five public routes handled {TOTAL // len(ROUTES)} reads each', flush=True)
    print(
        '  latency: '
        f'median={statistics.median(latencies):.0f} ms, '
        f'p95={percentile(latencies, 0.95):.0f} ms, '
        f'max={max(latencies):.0f} ms, total={elapsed:.1f} s',
        flush=True,
    )
    print('PRODUCTION 300-READ BURST PASSED', flush=True)


if __name__ == '__main__':
    main()
