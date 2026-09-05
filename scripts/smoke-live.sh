#!/usr/bin/env bash
set -euo pipefail
BASE="${RPP_BASE_URL:-https://road-to-peace-pride.hn-kikuchi.workers.dev}"
COOKIE="$(mktemp)"; AUTHOR_COOKIE="$(mktemp)"
trap 'rm -f "$COOKIE" "$AUTHOR_COOKIE" /tmp/rpp-*.json /tmp/rpp-*.html' EXIT
http(){ curl -sS --retry 2 --retry-delay 1 "$@"; }
pass(){ echo "  ✓ $1"; }
fail(){ echo "  ✗ $1"; exit 1; }
contains(){ grep -Fq "$2" "$1" && pass "$3" || fail "$3"; }
not_contains(){ if grep -Fq "$2" "$1"; then fail "$3"; else pass "$3"; fi; }

EXPECTED_BUILD="$(python3 -c "import json; print(json.load(open('public/version.json'))['build'])")"
echo '0) Live build'
for i in $(seq 1 30); do
  http "$BASE/version.json?ts=$(date +%s)-$i" -o /tmp/rpp-version.json || true
  LIVE="$(python3 -c "import json; print(json.load(open('/tmp/rpp-version.json')).get('build',''))" 2>/dev/null || true)"
  [[ "$LIVE" == "$EXPECTED_BUILD" ]] && break
  sleep 4
done
[[ "$LIVE" == "$EXPECTED_BUILD" ]] || fail 'latest build is not live'
pass 'latest r14 build is live'

echo '1) Static/live pages'
for page in index author admin; do
  path='/'; [[ "$page" != index ]] && path="/$page.html"
  code=$(curl -sS -L -o "/tmp/rpp-$page.html" -w '%{http_code}' "$BASE$path")
  [[ "$code" == 200 ]] && pass "$page page HTTP 200" || fail "$page page HTTP $code"
done
contains /tmp/rpp-index.html '閲覧にあたっての確認事項' 'privacy consent is shipped'
contains /tmp/rpp-index.html '本企画参加者のみ' 'participant-only notice is shipped'
contains /tmp/rpp-index.html '外部共有' 'external-sharing restriction is shipped'
contains /tmp/rpp-index.html 'id="fontUp"' 'reader font-size control remains'
contains /tmp/rpp-author.html 'rppOrgDetail' 'combined organization-detail input is shipped'
contains /tmp/rpp-author.html '写真は任意です。' 'photo optional notice remains'
not_contains /tmp/rpp-admin.html '654321' 'admin page has no demo admin code'

echo '2) Public health'
http "$BASE/api/health?ts=$(date +%s)" -o /tmp/rpp-health.json
python3 - <<'PY'
import json
x=json.load(open('/tmp/rpp-health.json'))
checks={'health ok':x.get('ok') is True,'preview mode':x.get('preview') is True,'photo storage binding':x.get('storageConfigured') is True,'security guard v3':x.get('securityGuard')=='v3','author OTP direct':x.get('authorOtpDirect') is True,'diagnostics protected':x.get('diagnosticsProtected') is True,'story count hidden':'stories' not in x}
for k,v in checks.items():
 print(('  ✓ ' if v else '  ✗ ')+k)
 if not v: raise SystemExit(x)
PY

echo '3) Viewer authentication'
CODE=$(curl -sS -o /tmp/rpp-stories0.json -w '%{http_code}' "$BASE/api/stories")
[[ "$CODE" == 401 ]] && pass 'stories require viewer auth' || fail "stories unauth status=$CODE"
CODE=$(curl -sS -c "$COOKIE" -b "$COOKIE" -o /tmp/rpp-login.json -w '%{http_code}' -X POST "$BASE/api/viewer/login" -H 'content-type: application/json' --data '{"password":"demo"}')
[[ "$CODE" == 200 ]] && pass 'preview viewer login works' || fail "viewer login status=$CODE"
CODE=$(curl -sS -c "$COOKIE" -b "$COOKIE" -o /tmp/rpp-stories.json -w '%{http_code}' "$BASE/api/stories")
[[ "$CODE" == 200 ]] && pass 'stories load after login' || fail "stories after login status=$CODE"

echo '4) Author OTP and fixed six-digit edit key'
EMAIL="smoke-${GITHUB_RUN_ID:-local}-${GITHUB_RUN_ATTEMPT:-1}@example.invalid"
CODE=$(curl -sS -c "$AUTHOR_COOKIE" -b "$AUTHOR_COOKIE" -o /tmp/rpp-otp.json -w '%{http_code}' -X POST "$BASE/api/auth/request" -H 'content-type: application/json' --data "{\"email\":\"$EMAIL\"}")
[[ "$CODE" == 200 ]] || fail "OTP request status=$CODE"
OTP=$(python3 -c "import json; print(json.load(open('/tmp/rpp-otp.json')).get('previewCode',''))")
[[ "$OTP" =~ ^[0-9]{6}$ ]] && pass 'six-digit email verification OTP issued' || fail 'preview OTP missing'
CODE=$(curl -sS -c "$AUTHOR_COOKIE" -b "$AUTHOR_COOKIE" -o /tmp/rpp-verify.json -w '%{http_code}' -X POST "$BASE/api/auth/verify" -H 'content-type: application/json' --data "{\"email\":\"$EMAIL\",\"code\":\"$OTP\"}")
[[ "$CODE" == 200 ]] || fail "OTP verify status=$CODE"
EDIT=$(python3 -c "import json; print(json.load(open('/tmp/rpp-verify.json')).get('editCode',''))")
[[ "$EDIT" =~ ^[0-9]{6}$ ]] && pass 'fixed edit key is six digits' || { cat /tmp/rpp-verify.json; fail 'fixed six-digit edit key missing'; }
CODE=$(curl -sS -c "$AUTHOR_COOKIE" -b "$AUTHOR_COOKIE" -o /tmp/rpp-me.json -w '%{http_code}' "$BASE/api/me/story")
[[ "$CODE" == 200 ]] && pass 'author session opens' || fail "author session status=$CODE"

echo '5) Preview write guard'
CODE=$(curl -sS -c "$AUTHOR_COOKIE" -b "$AUTHOR_COOKIE" -o /tmp/rpp-save.json -w '%{http_code}' -X PUT "$BASE/api/me/story" -H 'content-type: application/json' --data '{"record_date":"","soku":"磯子総区","bunku":"","honbu":"","shibu":"","category":"","name":"テスト","title":"テスト","body":"テスト","status":"draft"}')
[[ "$CODE" == 403 ]] && pass 'preview blocks cloud story writes' || fail "preview write status=$CODE"

echo '6) Logout'
CODE=$(curl -sS -c "$AUTHOR_COOKIE" -b "$AUTHOR_COOKIE" -o /tmp/rpp-alogout.json -w '%{http_code}' -X POST "$BASE/api/auth/logout")
[[ "$CODE" == 200 ]] && pass 'author logout works' || fail "author logout status=$CODE"
CODE=$(curl -sS -c "$COOKIE" -b "$COOKIE" -o /tmp/rpp-vlogout.json -w '%{http_code}' -X POST "$BASE/api/viewer/logout")
[[ "$CODE" == 200 ]] && pass 'viewer logout works' || fail "viewer logout status=$CODE"
echo 'LIVE SMOKE TEST PASSED'
