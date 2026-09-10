import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import worker from '../src/faithful-cover-v11-r33.js';

const normalizeBind = (value) => {
  if (value === undefined) return null;
  if (typeof value === 'boolean') return Number(value);
  return value;
};

class D1Statement {
  constructor(db, sql) {
    this.db = db;
    this.sql = sql;
    this.values = [];
  }
  bind(...values) {
    this.values = values.map(normalizeBind);
    return this;
  }
  execute() {
    const result = this.db.prepare(this.sql).run(...this.values);
    return { success: true, meta: { changes: Number(result.changes || 0) } };
  }
  async run() {
    return this.execute();
  }
  async first(column) {
    const row = this.db.prepare(this.sql).get(...this.values);
    if (column) return row?.[column] ?? null;
    return row ?? null;
  }
  async all() {
    return { success: true, results: this.db.prepare(this.sql).all(...this.values) };
  }
}

class D1Database {
  constructor() {
    this.db = new DatabaseSync(':memory:');
  }
  prepare(sql) {
    return new D1Statement(this.db, sql);
  }
  async exec(sql) {
    this.db.exec(sql);
    return { count: 0, duration: 0 };
  }
  async batch(statements) {
    this.db.exec('BEGIN');
    try {
      const results = statements.map((statement) => statement.execute());
      this.db.exec('COMMIT');
      return results;
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }
  close() {
    this.db.close();
  }
}

class MemoryKv {
  constructor() {
    this.items = new Map();
  }
  async put(key, value, options = {}) {
    this.items.set(key, { value, metadata: options.metadata || null });
  }
  async get(key, type = 'text') {
    const item = this.items.get(key);
    if (!item) return null;
    if (type === 'json') return JSON.parse(String(item.value));
    if (type === 'arrayBuffer') {
      if (item.value instanceof ArrayBuffer) return item.value.slice(0);
      if (ArrayBuffer.isView(item.value)) return item.value.buffer.slice(0);
      return new TextEncoder().encode(String(item.value)).buffer;
    }
    return String(item.value);
  }
  async getWithMetadata(key, type = 'text') {
    return { value: await this.get(key, type), metadata: this.items.get(key)?.metadata || null };
  }
  async delete(key) {
    this.items.delete(key);
  }
}

const database = new D1Database();
const env = {
  DB: database,
  MEDIA: new MemoryKv(),
  SETUP_KEY: 'final-qa-setup-key-at-least-thirty-two-characters',
  FORCE_PREVIEW: 'true',
  ALLOW_PREVIEW_SUBMISSIONS: 'true',
  ASSETS: { fetch: async () => new Response('Not found', { status: 404 }) },
};

const origin = 'http://road-to-peace-pride.test';
let authorCookie = '';
let viewerCookie = '';
let adminCookie = '';

function cookieFrom(response, name) {
  const raw = response.headers.get('set-cookie') || '';
  const found = raw.match(new RegExp(`(?:^|,\\s*)(${name}=[^;]+)`));
  return found?.[1] || '';
}

async function request(url, init = {}) {
  return worker.fetch(new Request(origin + url, init), env, {});
}

async function jsonRequest(url, init = {}, expected = 200) {
  const response = await request(url, init);
  const type = response.headers.get('content-type') || '';
  const raw = await response.text();
  assert.match(type, /application\/json/i, `${url} must return JSON, received ${type}`);
  assert.doesNotThrow(() => JSON.parse(raw), `${url} returned invalid JSON: ${raw.slice(0, 120)}`);
  const data = JSON.parse(raw);
  assert.equal(response.status, expected, `${url}: ${data.error || raw}`);
  return { response, data };
}

function body(data) {
  return {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(data),
  };
}

function authorBody(data, method = 'PUT') {
  return {
    method,
    headers: { 'content-type': 'application/json', cookie: authorCookie },
    body: JSON.stringify(data),
  };
}

function japanDate() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

try {
  const health = await jsonRequest('/api/health');
  assert.equal(health.data.ok, true);
  assert.equal(health.data.preview, true);

  const email = `final-qa-${Date.now()}@example.invalid`;
  const otpRequest = await jsonRequest('/api/auth/request', body({ email }));
  assert.match(otpRequest.data.previewCode, /^\d{6}$/);

  const verified = await jsonRequest('/api/auth/verify', body({ email, code: otpRequest.data.previewCode }));
  assert.match(verified.data.editCode, /^\d{6}$/);
  assert.equal(verified.data.editCode, otpRequest.data.previewCode, 'initial OTP must remain the edit code');
  const recognitionCode = verified.data.editCode;
  authorCookie = cookieFrom(verified.response, 'rpp_author');
  assert.ok(authorCookie, 'author cookie must be issued');

  const initial = await jsonRequest('/api/me/story', { headers: { cookie: authorCookie } });
  assert.equal(initial.data.story, null);

  const draftPayload = {
    record_date: '2020-01-01',
    soku: '磯子総区',
    bunku: 'QA分区／QA本部／QA部',
    honbu: '',
    shibu: '',
    category: '',
    name: '最終確認テスト',
    title: '初回提出前の下書き',
    body: '初回投稿から再編集までの動作を確認するテスト本文です。',
    status: 'draft',
  };
  const draft = await jsonRequest('/api/me/story', authorBody(draftPayload));
  assert.equal(draft.data.story.status, 'draft');

  const submitted = await jsonRequest('/api/rpp/resubmit', authorBody({
    ...draftPayload,
    title: '初回提出の公開内容',
    status: 'submitted',
  }, 'POST'));
  assert.equal(submitted.data.story.status, 'submitted');
  assert.notEqual(submitted.data.story.record_date, '2020-01-01', 'draft date must not become the record date');
  assert.equal(submitted.data.story.record_date, japanDate(), 'first submission date must be recorded in Japan time');
  assert.equal(submitted.data.story.photo_key, null, 'a story must be submittable without a photo');
  const storyId = submitted.data.story.id;
  const firstRecordDate = submitted.data.story.record_date;

  const viewerLogin = await jsonRequest('/api/viewer/login', body({ password: 'demo' }));
  viewerCookie = cookieFrom(viewerLogin.response, 'rpp_viewer');
  assert.ok(viewerCookie, 'viewer cookie must be issued');
  const publicBefore = await jsonRequest('/api/stories', { headers: { cookie: viewerCookie } });
  assert.equal(publicBefore.data.stories.find((story) => story.id === storyId)?.title, '初回提出の公開内容');

  const savedEdit = await jsonRequest('/api/me/story', authorBody({
    ...draftPayload,
    record_date: firstRecordDate,
    title: '保存のみ・まだ非公開',
    status: 'submitted',
  }));
  assert.equal(savedEdit.data.workingDraftSaved, true);
  const publicAfterSave = await jsonRequest('/api/stories', { headers: { cookie: viewerCookie } });
  assert.equal(publicAfterSave.data.stories.find((story) => story.id === storyId)?.title, '初回提出の公開内容');

  const resubmitted = await jsonRequest('/api/rpp/resubmit', authorBody({
    ...draftPayload,
    record_date: '2030-12-31',
    title: '再提出後の公開内容',
    status: 'submitted',
  }, 'POST'));
  assert.equal(resubmitted.data.story.id, storyId, 're-edit must not create a new story');
  assert.equal(resubmitted.data.story.record_date, firstRecordDate, 're-submit must preserve first submission date');
  const publicAfterResubmit = await jsonRequest('/api/stories', { headers: { cookie: viewerCookie } });
  assert.equal(publicAfterResubmit.data.stories.find((story) => story.id === storyId)?.title, '再提出後の公開内容');

  await jsonRequest('/api/auth/logout', { method: 'POST', headers: { cookie: authorCookie } });
  const editLogin = await jsonRequest('/api/edit-code/login', body({ email, code: recognitionCode }));
  authorCookie = cookieFrom(editLogin.response, 'rpp_author');
  const reopened = await jsonRequest('/api/me/story', { headers: { cookie: authorCookie } });
  assert.equal(reopened.data.story.id, storyId);
  assert.equal(reopened.data.story.title, '再提出後の公開内容');

  await jsonRequest('/api/auth/logout', { method: 'POST', headers: { cookie: authorCookie } });
  const repeatedEditLogin = await jsonRequest('/api/edit-code/login', body({ email, code: recognitionCode }));
  authorCookie = cookieFrom(repeatedEditLogin.response, 'rpp_author');
  const repeatedlyReopened = await jsonRequest('/api/me/story', { headers: { cookie: authorCookie } });
  assert.equal(repeatedlyReopened.data.story.id, storyId, 'the same recognition code must be reusable');

  await jsonRequest('/api/auth/logout', { method: 'POST', headers: { cookie: authorCookie } });
  const recoveryOtp = await jsonRequest('/api/auth/request', body({ email }));
  const recovered = await jsonRequest('/api/auth/verify', body({
    email,
    code: recoveryOtp.data.previewCode,
    resetEditCode: true,
  }));
  assert.match(recovered.data.editCode, /^\d{6}$/);
  assert.notEqual(recovered.data.editCode, recognitionCode, 'recovery must rotate the recognition code');
  authorCookie = cookieFrom(recovered.response, 'rpp_author');
  const recoveredStory = await jsonRequest('/api/me/story', { headers: { cookie: authorCookie } });
  assert.equal(recoveredStory.data.story.id, storyId, 'recovery must preserve the existing story');

  await jsonRequest('/api/edit-code/login', body({ email, code: recognitionCode }), 401);
  const newCodeLogin = await jsonRequest('/api/edit-code/login', body({ email, code: recovered.data.editCode }));
  authorCookie = cookieFrom(newCodeLogin.response, 'rpp_author');
  const reopenedAfterRecovery = await jsonRequest('/api/me/story', { headers: { cookie: authorCookie } });
  assert.equal(reopenedAfterRecovery.data.story.id, storyId);

  await jsonRequest('/api/admin/stats', {}, 401);
  await jsonRequest('/api/admin/login', body({ password: 'not-the-admin-password' }), 401);
  const adminLogin = await jsonRequest('/api/admin/login', body({ password: env.SETUP_KEY }));
  const baseAdminCookie = cookieFrom(adminLogin.response, 'rpp_admin');
  const fullAdminCookie = cookieFrom(adminLogin.response, 'rpp_admin_full');
  assert.ok(baseAdminCookie, 'base admin cookie must be issued');
  assert.ok(fullAdminCookie, 'full admin guard cookie must be issued');
  adminCookie = `${baseAdminCookie}; ${fullAdminCookie}`;
  assert.ok(!JSON.stringify(adminLogin.data).includes(env.SETUP_KEY), 'admin login response must not expose the key');

  const adminStats = await jsonRequest('/api/admin/stats', { headers: { cookie: adminCookie } });
  assert.equal(adminStats.data.total, 1);
  assert.equal(adminStats.data.submitted, 1);
  const adminStories = await jsonRequest('/api/admin/stories', { headers: { cookie: adminCookie } });
  const adminStory = adminStories.data.stories.find((story) => story.id === storyId);
  assert.equal(adminStory?.title, '再提出後の公開内容');
  assert.equal(adminStory?.body, draftPayload.body);
  assert.equal(adminStory?.author_email, email);

  const adminSettings = await jsonRequest('/api/admin/settings', { headers: { cookie: adminCookie } });
  const emailSettings = await jsonRequest('/api/admin/email-settings', { headers: { cookie: adminCookie } });
  for (const payload of [adminSettings.data, emailSettings.data]) {
    const serialized = JSON.stringify(payload);
    assert.ok(!serialized.includes(env.SETUP_KEY), 'admin API must not return SETUP_KEY');
    assert.doesNotMatch(serialized, /brevo_api_key|admin_password_hash|viewer_password_hash|private_key/i);
  }

  const reset = await jsonRequest('/api/admin/author-reset', {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie: adminCookie },
    body: JSON.stringify({ email }),
  });
  assert.equal(reset.data.ok, true);
  assert.equal(reset.data.deleted.stories, 1);
  const afterReset = await jsonRequest('/api/admin/stories', { headers: { cookie: adminCookie } });
  assert.equal(afterReset.data.stories.length, 0);
  await jsonRequest('/api/admin/logout', { method: 'POST', headers: { cookie: adminCookie } });
  await jsonRequest('/api/admin/stats', { headers: { cookie: adminCookie } }, 401);

  console.log('FINAL API QA PASSED');
  console.log('  ✓ 6-digit recognition code lifecycle');
  console.log('  ✓ draft save remains unpublished until resubmit');
  console.log('  ✓ Japan-time first submission date and story ID are preserved');
  console.log('  ✓ a photo remains optional');
  console.log('  ✓ lost-code recovery keeps the existing story');
  console.log('  ✓ admin login, story review, author reset and logout stay protected');
  console.log('  ✓ admin responses do not expose passwords, hashes or API keys');
  console.log('  ✓ API success/error responses remain valid JSON');
} finally {
  database.close();
}
