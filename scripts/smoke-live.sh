#!/usr/bin/env bash
set -euo pipefail

BASE="${RPP_BASE_URL:-https://giin-home-cloud-pilot.hn-kikuchi.workers.dev}"
COOKIE="$(mktemp)"
trap 'rm -f "$COOKIE" /tmp/rpp-*.json /tmp/rpp-*.html' EXIT

http(){ curl -sS --retry 2 --retry-delay 1 "$@"; }
pass(){ echo "  ✓ $1"; }
fail(){ echo "  ✗ $1"; exit 1; }
contains(){ local file="$1" text="$2" label="$3"; grep -Fq "$text" "$file" && pass "$label" || fail "$label"; }
not_contains(){ local file="$1" text="$2" label="$3"; if grep -Fq "$text" "$file"; then fail "$label"; else pass "$label"; fi; }

EXPECTED_BUILD="$(python3 -c "import json; print(json.load(open('public/version.json'))['build'])")"
echo "Waiting for live assets and Security Guard v3"
ready=0
for i in $(seq 1 30); do
  LIVE_BUILD=''; GUARD=''
  if http "$BASE/version.json?ts=$(date +%s)" -o /tmp/rpp-version.json 2>/dev/null; then
    LIVE_BUILD="$(python3 -c "import json; print(json.load(open('/tmp/rpp-version.json')).get('build',''))" 2>/dev/null || true)"
  fi
  if http "$BASE/api/health?ts=$(date +%s)" -o /tmp/rpp-health-wait.json 2>/dev/null; then
    GUARD="$(python3 -c "import json; print(json.load(open('/tmp/rpp-health-wait.json')).get('securityGuard',''))" 2>/dev/null || true)"
  fi
  if [[ "$LIVE_BUILD" == "$EXPECTED_BUILD" && "$GUARD" == "v3" ]]; then ready=1; break; fi
  echo "  assets=$LIVE_BUILD guard=$GUARD ($i/30)"
  sleep 4
done
[[ "$ready" == 1 ]] || fail "latest Cloudflare assets and Security Guard v3 are live"
pass "latest Cloudflare assets and Security Guard v3 are live"

echo "1) Static pages"
for page in index author admin; do
  path="/"; [[ "$page" != index ]] && path="/$page.html"
  code=$(curl -sS -L -o "/tmp/rpp-$page.html" -w '%{http_code}' "$BASE$path")
  [[ "$code" == 200 ]] && pass "$page page HTTP 200 after redirects" || fail "$page page HTTP $code"
done
contains /tmp/rpp-index.html '続きから読む' 'reader has resume control'
contains /tmp/rpp-index.html 'id="fontUp"' 'reader has font-size control'
contains /tmp/rpp-author.html 'id="org"' 'author has one organization field'
not_contains /tmp/rpp-author.html 'id="soku"' 'legacy 総区 field removed'
not_contains /tmp/rpp-author.html 'id="bunku"' 'legacy 分区 field removed'
not_contains /tmp/rpp-author.html 'id="honbu"' 'legacy 本部 field removed'
not_contains /tmp/rpp-author.html 'id="shibu"' 'legacy 支部 field removed'
not_contains /tmp/rpp-author.html 'id="category"' 'category field removed'
not_contains /tmp/rpp-author.html 'id="export"' 'manual device export button removed'
contains /tmp/rpp-author.html '写真（任意・1枚まで）' 'photo remains optional'
not_contains /tmp/rpp-author.html 'organization-master.json' 'author page has no organization-master dependency'
not_contains /tmp/rpp-admin.html '654321' 'admin page has no demo admin code'

STATUS_CODE=$(curl -sS -o /dev/null -w '%{http_code}' "$BASE/status.html")
[[ "$STATUS_CODE" == "302" ]] && pass 'diagnostics page requires admin session' || fail "diagnostics unauth status=$STATUS_CODE"

echo "2) Sanitized public health/config"
http "$BASE/api/health?ts=$(date +%s)" -o /tmp/rpp-health.json
python3 - <<'PY'
import json
x=json.load(open('/tmp/rpp-health.json'))
checks={
 'health ok': x.get('ok') is True,
 'preview mode': x.get('preview') is True,
 'photo storage binding': x.get('storageConfigured') is True,
 'admin demo disabled': x.get('adminDemoDisabled') is True,
 'preview cloud writes disabled': x.get('previewSubmissionsAllowed') is False,
 'security guard v3': x.get('securityGuard') == 'v3',
 'author OTP is direct': x.get('authorOtpDirect') is True,
 'production OTP rate limit enabled': x.get('otpRateLimited') is True,
 'diagnostics protected': x.get('diagnosticsProtected') is True,
 'story count hidden from public health': 'stories' not in x,
 'email config hidden from public health': 'emailConfigured' not in x,
 'admin config hidden from public health': 'adminPasswordConfigured' not in x,
}
for k,v in checks.items():
 print(('  ✓ ' if v else '  ✗ ')+k)
 if not v: raise SystemExit(x)
PY

echo "3) Viewer authentication"
CODE=$(curl -sS -o /tmp/rpp-stories0.json -w '%{http_code}' "$BASE/api/stories")
[[ "$CODE" == "401" ]] && pass 'stories require viewer auth' || { cat /tmp/rpp-stories0.json; fail "stories unauth status=$CODE"; }
CODE=$(curl -sS -c "$COOKIE" -b "$COOKIE" -o /tmp/rpp-login.json -w '%{http_code}' -X POST "$BASE/api/viewer/login" -H 'content-type: application/json' --data '{"password":"demo"}')
[[ "$CODE" == "200" ]] && pass 'preview viewer login works' || { cat /tmp/rpp-login.json; fail "viewer login status=$CODE"; }
CODE=$(curl -sS -c "$COOKIE" -b "$COOKIE" -o /tmp/rpp-stories.json -w '%{http_code}' "$BASE/api/stories")
[[ "$CODE" == "200" ]] || { cat /tmp/rpp-stories.json; fail "stories after login status=$CODE"; }
python3 - <<'PY'
import json
x=json.load(open('/tmp/rpp-stories.json'))
ok=isinstance(x.get('stories'),list) and x.get('preview') is True
print(('  ✓ ' if ok else '  ✗ ')+'stories load after viewer login')
if not ok: raise SystemExit(x)
PY

echo "4) Author preview authentication"
AUTHOR_COOKIE="$(mktemp)"
EMAIL="smoke-${GITHUB_RUN_ID:-local}-${GITHUB_RUN_ATTEMPT:-1}@example.invalid"
CODE=$(curl -sS -c "$AUTHOR_COOKIE" -b "$AUTHOR_COOKIE" -o /tmp/rpp-otp.json -w '%{http_code}' -X POST "$BASE/api/auth/request" -H 'content-type: application/json' --data "{\"email\":\"$EMAIL\"}")
[[ "$CODE" == "200" ]] || { cat /tmp/rpp-otp.json; rm -f "$AUTHOR_COOKIE"; fail "OTP request status=$CODE"; }
OTP=$(python3 -c "import json; print(json.load(open('/tmp/rpp-otp.json')).get('previewCode',''))")
[[ "$OTP" =~ ^[0-9]{6}$ ]] && pass 'direct preview OTP issued without viewer login' || { cat /tmp/rpp-otp.json; rm -f "$AUTHOR_COOKIE"; fail 'preview OTP missing'; }
CODE=$(curl -sS -c "$AUTHOR_COOKIE" -b "$AUTHOR_COOKIE" -o /tmp/rpp-verify.json -w '%{http_code}' -X POST "$BASE/api/auth/verify" -H 'content-type: application/json' --data "{\"email\":\"$EMAIL\",\"code\":\"$OTP\"}")
[[ "$CODE" == "200" ]] && pass 'author OTP verifies' || { cat /tmp/rpp-verify.json; rm -f "$AUTHOR_COOKIE"; fail "OTP verify status=$CODE"; }
CODE=$(curl -sS -c "$AUTHOR_COOKIE" -b "$AUTHOR_COOKIE" -o /tmp/rpp-me.json -w '%{http_code}' "$BASE/api/me/story")
[[ "$CODE" == "200" ]] && pass 'author can open own editor session' || { cat /tmp/rpp-me.json; rm -f "$AUTHOR_COOKIE"; fail "author session status=$CODE"; }

echo "5) PREVIEW cloud-write guard"
CODE=$(curl -sS -c "$AUTHOR_COOKIE" -b "$AUTHOR_COOKIE" -o /tmp/rpp-save.json -w '%{http_code}' -X PUT "$BASE/api/me/story" -H 'content-type: application/json' --data '{"record_date":"2026-09-12","soku":"テスト組織","bunku":"","honbu":"","shibu":"","category":"","name":"テスト","title":"テスト","body":"テスト","status":"draft"}')
[[ "$CODE" == "403" ]] && pass 'preview blocks cloud story writes' || { cat /tmp/rpp-save.json; rm -f "$AUTHOR_COOKIE"; fail "preview write status=$CODE"; }

echo "6) Admin demo code must be rejected"
CODE=$(curl -sS -o /tmp/rpp-adminlogin.json -w '%{http_code}' -X POST "$BASE/api/admin/login" -H 'content-type: application/json' --data '{"password":"654321"}')
[[ "$CODE" == "401" ]] && pass 'old admin demo code is rejected' || { cat /tmp/rpp-adminlogin.json; rm -f "$AUTHOR_COOKIE"; fail "admin demo status=$CODE"; }

curl -sS -c "$AUTHOR_COOKIE" -b "$AUTHOR_COOKIE" -X POST "$BASE/api/auth/logout" >/dev/null || true
curl -sS -c "$COOKIE" -b "$COOKIE" -X POST "$BASE/api/viewer/logout" >/dev/null || true
rm -f "$AUTHOR_COOKIE"
echo "LIVE SMOKE TEST PASSED"
