#!/usr/bin/env bash
set -euo pipefail

BASE="${RPP_BASE_URL:-https://giin-home-cloud-pilot.hn-kikuchi.workers.dev}"
COOKIE="$(mktemp)"
trap 'rm -f "$COOKIE" /tmp/rpp-*.json /tmp/rpp-*.html' EXIT

json_get(){ python3 -c "import json,sys; d=json.load(sys.stdin); print($1)"; }
http(){ curl -sS --retry 2 --retry-delay 1 "$@"; }
status(){ curl -sS -o "$2" -w '%{http_code}' "$1" "${@:3}"; }

EXPECTED_BUILD="$(python3 -c "import json; print(json.load(open('public/version.json'))['build'])")"
echo "Waiting for live build: $EXPECTED_BUILD"
ready=0
for i in $(seq 1 30); do
  if http "$BASE/version.json?ts=$(date +%s)" -o /tmp/rpp-version.json 2>/dev/null; then
    LIVE_BUILD="$(python3 -c "import json; print(json.load(open('/tmp/rpp-version.json')).get('build',''))" 2>/dev/null || true)"
    if [[ "$LIVE_BUILD" == "$EXPECTED_BUILD" ]]; then ready=1; break; fi
    echo "  live=$LIVE_BUILD ($i/30)"
  fi
  sleep 4
done
[[ "$ready" == 1 ]] || { echo "Live deployment did not reach expected build"; exit 1; }

echo "1) Static pages"
http "$BASE/" -o /tmp/rpp-index.html
http "$BASE/author.html" -o /tmp/rpp-author.html
http "$BASE/admin.html" -o /tmp/rpp-admin.html
grep -q '続きから読む' /tmp/rpp-index.html
grep -q 'id="fontUp"' /tmp/rpp-index.html
grep -q '<input id="soku"' /tmp/rpp-author.html
grep -q '<input id="bunku"' /tmp/rpp-author.html
! grep -q 'organization-master.json' /tmp/rpp-author.html
! grep -q '654321' /tmp/rpp-admin.html

echo "2) Health/config"
http "$BASE/api/health?ts=$(date +%s)" -o /tmp/rpp-health.json
python3 - <<'PY'
import json
x=json.load(open('/tmp/rpp-health.json'))
assert x.get('ok') is True, x
assert x.get('preview') is True, x
assert x.get('storageConfigured') is True, x
assert x.get('adminDemoDisabled') is True, x
assert x.get('previewSubmissionsAllowed') is False, x
print('health OK')
PY

echo "3) Viewer authentication"
CODE=$(curl -sS -o /tmp/rpp-stories0.json -w '%{http_code}' "$BASE/api/stories")
[[ "$CODE" == "401" ]] || { cat /tmp/rpp-stories0.json; exit 1; }
CODE=$(curl -sS -c "$COOKIE" -b "$COOKIE" -o /tmp/rpp-login.json -w '%{http_code}' -X POST "$BASE/api/viewer/login" -H 'content-type: application/json' --data '{"password":"demo"}')
[[ "$CODE" == "200" ]] || { cat /tmp/rpp-login.json; exit 1; }
CODE=$(curl -sS -c "$COOKIE" -b "$COOKIE" -o /tmp/rpp-stories.json -w '%{http_code}' "$BASE/api/stories")
[[ "$CODE" == "200" ]] || { cat /tmp/rpp-stories.json; exit 1; }
python3 - <<'PY'
import json
x=json.load(open('/tmp/rpp-stories.json'))
assert isinstance(x.get('stories'), list), x
assert x.get('preview') is True, x
print('viewer OK')
PY

echo "4) Author preview authentication"
EMAIL="smoke-${GITHUB_RUN_ID:-local}-${GITHUB_RUN_ATTEMPT:-1}@example.invalid"
CODE=$(curl -sS -c "$COOKIE" -b "$COOKIE" -o /tmp/rpp-otp.json -w '%{http_code}' -X POST "$BASE/api/auth/request" -H 'content-type: application/json' --data "{\"email\":\"$EMAIL\"}")
[[ "$CODE" == "200" ]] || { cat /tmp/rpp-otp.json; exit 1; }
OTP=$(python3 -c "import json; print(json.load(open('/tmp/rpp-otp.json')).get('previewCode',''))")
[[ "$OTP" =~ ^[0-9]{6}$ ]] || { cat /tmp/rpp-otp.json; exit 1; }
CODE=$(curl -sS -c "$COOKIE" -b "$COOKIE" -o /tmp/rpp-verify.json -w '%{http_code}' -X POST "$BASE/api/auth/verify" -H 'content-type: application/json' --data "{\"email\":\"$EMAIL\",\"code\":\"$OTP\"}")
[[ "$CODE" == "200" ]] || { cat /tmp/rpp-verify.json; exit 1; }
CODE=$(curl -sS -c "$COOKIE" -b "$COOKIE" -o /tmp/rpp-me.json -w '%{http_code}' "$BASE/api/me/story")
[[ "$CODE" == "200" ]] || { cat /tmp/rpp-me.json; exit 1; }

echo "5) PREVIEW cloud-write guard"
CODE=$(curl -sS -c "$COOKIE" -b "$COOKIE" -o /tmp/rpp-save.json -w '%{http_code}' -X PUT "$BASE/api/me/story" -H 'content-type: application/json' --data '{"record_date":"2026-09-12","soku":"テスト総区","bunku":"","honbu":"テスト本部","shibu":"テスト支部","category":"体験談","name":"テスト","title":"テスト","body":"テスト","status":"draft"}')
[[ "$CODE" == "403" ]] || { cat /tmp/rpp-save.json; exit 1; }

echo "6) Admin demo code must be rejected"
CODE=$(curl -sS -o /tmp/rpp-adminlogin.json -w '%{http_code}' -X POST "$BASE/api/admin/login" -H 'content-type: application/json' --data '{"password":"654321"}')
[[ "$CODE" == "401" ]] || { cat /tmp/rpp-adminlogin.json; exit 1; }

curl -sS -c "$COOKIE" -b "$COOKIE" -X POST "$BASE/api/auth/logout" >/dev/null || true
curl -sS -c "$COOKIE" -b "$COOKIE" -X POST "$BASE/api/viewer/logout" >/dev/null || true

echo "LIVE SMOKE TEST PASSED"
