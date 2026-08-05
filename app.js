const STORAGE_KEY = 'gikaiAiHpPrototypeV5';
const adminMode = new URLSearchParams(location.search).get('admin') === '1';

const templateDefaults = {
  trust: '#0f3d66',
  local: '#2f7a65',
  modern: '#22252a',
  pink: '#c94f7c',
  yellow: '#b97800'
};

const defaultState = {
  template: 'trust',
  themeColor: '#0f3d66',
  profile: {
    name: '山田 はなこ',
    town: '〇〇町',
    office: '〇〇町議会議員',
    catch: '皆さまの声を、町政へ。\n暮らしに寄り添い、未来をひらく。',
    message: '小さな声を大切に、現場第一で取り組みます。',
    profileText: '〇〇町で生まれ育ち、地域の皆さまに支えていただきながら活動しています。子育て、福祉、防災を中心に、安心して暮らし続けられる町を目指します。',
    image: '',
    imagePositionX: 50,
    imagePositionY: 50,
    imageZoom: 100,
    facts: [
      { label: '活動地域', value: '〇〇町' },
      { label: '大切にする姿勢', value: '現場第一・対話第一' },
      { label: '経歴', value: '地域の皆さまと歩んできました' },
      { label: '趣味', value: '地域散策、読書' },
      { label: '目指す町', value: '誰もが安心して暮らせる町' }
    ]
  },
  socialLinks: {
    instagram: '',
    youtube: '',
    facebook: '',
    x: '',
    line: ''
  },
  policies: [
    { title: '子育て・教育', description: '子どもたちが安心して学び、子育て家庭が孤立しない環境を整えます。' },
    { title: '防災・安全', description: '通学路や生活道路の安全点検、防災情報の分かりやすい発信を進めます。' },
    { title: '福祉・健康', description: '高齢者や障がいのある方をはじめ、誰もが安心して暮らせる支援を充実させます。' }
  ],
  achievements: [
    { title: '通学路の安全対策を推進', description: '地域の皆さまから寄せられたお声を受け、危険箇所の現場確認と改善要望を行いました。', image: '' },
    { title: '公園設備の改善へ', description: '老朽化した設備について町へ働きかけ、安心して利用できる環境づくりを進めました。', image: '' },
    { title: '子育て世代の声を町政へ', description: '保護者の皆さまとの対話を重ね、子育て支援の充実に向けた提案を行いました。', image: '' }
  ],
  posts: [
    {
      id: 'sample-cleanup',
      title: '△△地区の清掃活動に参加しました',
      body: '本日午前、〇〇町の△△地区で行われた清掃活動に参加しました。\n\n自治会の皆さまや地域の子どもたちと一緒に、道路や公園のごみ拾いを行いました。\n\n地域の方からは、公園のベンチの老朽化や、夜間の暗さについてもお声を伺いました。現場の状況を確認し、町への相談も含めて対応を検討してまいります。\n\nご参加いただいた皆さま、ありがとうございました。',
      caption: '【写真1】地域の皆さまと清掃活動を行いました。',
      category: '地域活動',
      date: '2026-08-04',
      images: [],
      status: 'published',
      createdAt: '2026-08-04T00:00:00.000Z'
    }
  ],
  draft: null
};

let state = loadState();
let selectedActivityImages = [];
let pendingProfileImage = '';
let pendingAchievementImages = [null, null, null];
let recognition = null;
let recognizing = false;
let activeVoiceTarget = '';
let topStep = 0;

const $ = (id) => document.getElementById(id);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function normalizeState(saved = {}) {
  const base = clone(defaultState);
  const profile = { ...base.profile, ...(saved.profile || {}) };
  if (!profile.town) {
    const match = String(profile.office || '').match(/(.+?町)/);
    profile.town = match ? match[1] : '〇〇町';
  }
  const positionX = Number(profile.imagePositionX);
  const positionY = Number(profile.imagePositionY);
  const imageZoom = Number(profile.imageZoom);
  profile.imagePositionX = Math.max(0, Math.min(100, Number.isFinite(positionX) ? positionX : 50));
  profile.imagePositionY = Math.max(0, Math.min(100, Number.isFinite(positionY) ? positionY : 50));
  profile.imageZoom = Math.max(100, Math.min(160, Number.isFinite(imageZoom) ? imageZoom : 100));
  const savedFacts = Array.isArray(profile.facts) ? profile.facts.slice(0, 5) : [];
  while (savedFacts.length < 5) savedFacts.push({ label: '', value: '' });
  profile.facts = savedFacts;

  return {
    ...base,
    ...saved,
    profile,
    socialLinks: { ...base.socialLinks, ...(saved.socialLinks || {}) },
    policies: Array.isArray(saved.policies) && saved.policies.length ? saved.policies.slice(0, 3) : base.policies,
    achievements: Array.isArray(saved.achievements) ? saved.achievements.slice(0, 3) : base.achievements,
    posts: Array.isArray(saved.posts) ? saved.posts : base.posts
  };
}

function loadState() {
  try {
    for (const key of [STORAGE_KEY, 'gikaiAiHpPrototypeV4', 'gikaiAiHpPrototypeV3', 'gikaiAiHpPrototypeV2', 'gikaiAiHpPrototypeV1']) {
      const saved = localStorage.getItem(key);
      if (saved) return normalizeState(JSON.parse(saved));
    }
  } catch {
    // 初期データを使用
  }
  return clone(defaultState);
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    showToast('画像が多いため保存できませんでした。写真の容量を小さくしてください');
  }
}

function showToast(message) {
  const toast = $('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2800);
}

function setView(view) {
  document.body.dataset.currentView = view;
  $$('.view').forEach((el) => el.classList.toggle('active', el.id === `${view}View`));
  const returnButton = $('previewReturnButton');
  if (returnButton) returnButton.classList.toggle('hidden', !(adminMode && view === 'site'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setAdminTab(tab) {
  $$('.admin-panel').forEach((el) => el.classList.toggle('active', el.id === `${tab}Panel`));
  if (tab === 'top') showWizardStep(topStep);
  if (['photo', 'profile', 'policy', 'achievement', 'social'].includes(tab)) populateQuickEditors();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(`${dateString}T00:00:00`);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function escapeHtml(text = '') {
  return String(text).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));
}

function setThemeColor(hex) {
  const safe = /^#[0-9a-f]{6}$/i.test(hex) ? hex : '#0f3d66';
  const rgb = safe.slice(1).match(/.{2}/g).map((v) => parseInt(v, 16));
  document.body.style.setProperty('--primary', safe);
  document.body.style.setProperty('--primary-rgb', rgb.join(', '));
  document.querySelector('meta[name="theme-color"]').setAttribute('content', safe);
}

function normalizeUrl(value = '') {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(candidate);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

const socialMeta = {
  instagram: { label: 'Instagram', icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle class="fill-dot" cx="17.5" cy="6.5" r="1.2"></circle></svg>' },
  youtube: { label: 'YouTube', icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 8.1a3 3 0 0 0-2.1-2.1C17 5.5 12 5.5 12 5.5s-5 0-6.9.5A3 3 0 0 0 3 8.1 31 31 0 0 0 2.5 12a31 31 0 0 0 .5 3.9A3 3 0 0 0 5.1 18c1.9.5 6.9.5 6.9.5s5 0 6.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-3.9 31 31 0 0 0-.5-3.9Z"></path><path class="fill-white" d="m10 9 5 3-5 3Z"></path></svg>' },
  facebook: { label: 'Facebook', icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4.5c-.5-.1-2.1-.2-3.4-.2-3.4 0-5.6 2-5.6 5.8V13H4.5v4H8v7h4.3v-7h3.4l.6-4h-4v-2.5C12.3 9.3 12.7 8 14 8Z"></path></svg>' },
  x: { label: 'X', icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4.2l3.6 5.1L17.2 4H20l-5.9 6.9L20.8 20h-4.2l-4.2-5.8L7.5 20H4.7l6.3-7.6Z"></path></svg>' },
  line: { label: 'LINE', icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.1c0-4-3.9-7.2-8.6-7.2S3.3 7.1 3.3 11.1c0 3.6 3.2 6.6 7.4 7.1.3.1.7.2.8.5.1.3.1.7 0 1l-.1.8c0 .3-.2 1.2 1.1.7 1.3-.6 7.2-4.2 9.8-7.2.8-.9 1.2-1.9 1.2-2.9Z"></path><path class="fill-white" d="M7 9.1h1.1v4H10v1H7Zm3.8 0h1.1v5h-1.1Zm2 0h1l2.2 3v-3h1.1v5h-1l-2.2-3v3h-1.1Zm5.1 0h3v1h-1.9v.9h1.8v1h-1.8v1h2v1h-3.1Z"></path></svg>' }
};

function renderSocialLinks() {
  const links = Object.entries(state.socialLinks || {})
    .map(([key, value]) => [key, normalizeUrl(value)])
    .filter(([key, url]) => socialMeta[key] && url);

  const container = $('heroSocials');
  container.innerHTML = links.map(([key, url]) => {
    const meta = socialMeta[key];
    return `<a class="social-link ${key}" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" aria-label="${meta.label}を開く">${meta.icon}<span>${meta.label}</span></a>`;
  }).join('');
  container.classList.toggle('hidden', links.length === 0);
}

function renderSite() {
  document.body.dataset.template = state.template;
  setThemeColor(state.themeColor);

  const p = state.profile;
  if ($('adminOwnerName')) $('adminOwnerName').textContent = `${p.name}議員の管理画面`;
  if ($('dashboardName')) $('dashboardName').textContent = p.name;
  $('siteTownBadge').textContent = p.town;
  $('heroOffice').textContent = p.office;
  $('heroName').textContent = p.name;
  $('heroCatch').innerHTML = escapeHtml(p.catch).replace(/\n/g, '<br>');
  $('profileHeading').textContent = p.name;
  $('profileText').textContent = p.profileText;
  $('footerName').textContent = p.name;
  $('footerOffice').textContent = p.office;
  $('footerCopyright').textContent = `© ${p.name} 公式ホームページ`;
  document.title = `${p.name}｜${p.office}`;

  const image = $('profileImage');
  const fallback = $('profileFallback');
  if (p.image) {
    image.src = p.image;
    image.hidden = false;
    fallback.hidden = true;
    image.style.objectPosition = `${p.imagePositionX}% ${p.imagePositionY}%`;
    image.style.transformOrigin = `${p.imagePositionX}% ${p.imagePositionY}%`;
    image.style.transform = `scale(${p.imageZoom / 100})`;
  } else {
    image.removeAttribute('src');
    image.hidden = true;
    fallback.hidden = false;
  }

  const visibleFacts = (p.facts || []).filter((fact) => String(fact.label || '').trim() && String(fact.value || '').trim());
  $('profileFacts').innerHTML = visibleFacts.map((fact) => `
    <div class="profile-fact"><strong>${escapeHtml(fact.label)}</strong><span>${escapeHtml(fact.value)}</span></div>
  `).join('');

  $('policyGrid').innerHTML = state.policies.map((policy, index) => `
    <article class="policy-card">
      <div class="policy-card-top">
        <div class="policy-number">0${index + 1}</div>
        <div class="policy-title-block">
          <span>重点政策</span>
          <h3>${escapeHtml(policy.title)}</h3>
        </div>
      </div>
      <p>${escapeHtml(policy.description)}</p>
    </article>
  `).join('');

  const achievements = (state.achievements || []).filter((item) => item.title || item.description || item.image);
  $('achievementGrid').innerHTML = achievements.map((item, index) => `
    <article class="achievement-card">
      <div class="achievement-image">
        ${item.image ? `<img src="${item.image}" alt="${escapeHtml(item.title || '主な実績')}">` : `<div class="achievement-placeholder"><span>0${index + 1}</span><strong>ACHIEVEMENT</strong></div>`}
      </div>
      <div class="achievement-body">
        <span class="achievement-label">主な実績</span>
        <h3>${escapeHtml(item.title || '地域の課題を改善')}</h3>
        <p>${escapeHtml(item.description || '')}</p>
      </div>
    </article>
  `).join('');
  $('emptyAchievements').classList.toggle('hidden', achievements.length > 0);

  renderSocialLinks();

  const posts = [...state.posts]
    .filter((post) => post.status !== 'draft')
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  $('postGrid').innerHTML = posts.map((post) => `
    <article class="post-card">
      <div class="post-image">
        ${post.images?.[0] ? `<img src="${post.images[0]}" alt="${escapeHtml(post.title)}">` : '<div class="post-image-placeholder">ACTIVITY</div>'}
      </div>
      <div class="post-body">
        <span class="post-meta">${escapeHtml(post.category)} ｜ ${formatDate(post.date)}</span>
        <h3>${escapeHtml(post.title)}</h3>
        <p>${escapeHtml(post.body.replace(/\n/g, ' ').slice(0, 110))}${post.body.length > 110 ? '…' : ''}</p>
      </div>
    </article>
  `).join('');
  $('emptyPosts').classList.toggle('hidden', posts.length > 0);
}

function populateAdmin() {
  const p = state.profile;
  $('editName').value = p.name;
  $('editTown').value = p.town;
  $('editOffice').value = p.office;
  $('editCatch').value = p.catch;
  $('editProfile').value = p.profileText;
  $('editColor').value = state.themeColor;
  $('editImagePositionX').value = p.imagePositionX ?? 50;
  $('editImagePositionY').value = p.imagePositionY ?? 50;
  $('editImageZoom').value = p.imageZoom ?? 100;
  [1, 2, 3, 4, 5].forEach((i) => {
    const fact = p.facts?.[i - 1] || { label: '', value: '' };
    $(`profileFactLabel${i}`).value = fact.label || '';
    $(`profileFactValue${i}`).value = fact.value || '';
  });
  updatePositionPreview();

  const social = state.socialLinks || {};
  $('socialInstagram').value = social.instagram || '';
  $('socialYoutube').value = social.youtube || '';
  $('socialFacebook').value = social.facebook || '';
  $('socialX').value = social.x || '';
  $('socialLine').value = social.line || '';

  state.policies.forEach((policy, index) => {
    $(`policy${index + 1}`).value = policy.title;
    $(`policyDesc${index + 1}`).value = policy.description;
  });

  [0, 1, 2].forEach((index) => {
    const item = state.achievements[index] || { title: '', description: '', image: '' };
    $(`achievementTitle${index + 1}`).value = item.title || '';
    $(`achievementDesc${index + 1}`).value = item.description || '';
    $(`achievementPhotoStatus${index + 1}`).textContent = item.image ? '現在の写真を使用します。変更する場合は新しい写真を選んでください。' : '写真を選択できます。';
  });

  $$('.template-card').forEach((card) => card.classList.toggle('active', card.dataset.template === state.template));

  const today = new Date();
  const offset = today.getTimezoneOffset();
  const local = new Date(today.getTime() - offset * 60 * 1000).toISOString().slice(0, 10);
  $('activityDate').value ||= local;
}

function populateQuickEditors() {
  const p = state.profile;
  if ($('quickProfileText')) $('quickProfileText').value = p.profileText || '';
  [1, 2, 3, 4, 5].forEach((i) => {
    const fact = p.facts?.[i - 1] || { label: '', value: '' };
    if ($(`quickFactLabel${i}`)) $(`quickFactLabel${i}`).value = fact.label || '';
    if ($(`quickFactValue${i}`)) $(`quickFactValue${i}`).value = fact.value || '';
  });
  [1, 2, 3].forEach((i) => {
    const policy = state.policies[i - 1] || { title: '', description: '' };
    if ($(`quickPolicy${i}`)) $(`quickPolicy${i}`).value = policy.title || '';
    if ($(`quickPolicyDesc${i}`)) $(`quickPolicyDesc${i}`).value = policy.description || '';
    const achievement = state.achievements[i - 1] || { title: '', description: '', image: '' };
    if ($(`quickAchievementTitle${i}`)) $(`quickAchievementTitle${i}`).value = achievement.title || '';
    if ($(`quickAchievementDesc${i}`)) $(`quickAchievementDesc${i}`).value = achievement.description || '';
    if ($(`quickAchievementPhotoStatus${i}`)) $(`quickAchievementPhotoStatus${i}`).textContent = achievement.image ? '現在の写真を使用します。変更するときだけ選択してください。' : '写真を選択できます。';
  });
  const social = state.socialLinks || {};
  ['Instagram', 'Youtube', 'Facebook', 'X', 'Line'].forEach((name) => {
    const key = name.toLowerCase();
    if ($(`quickSocial${name}`)) $(`quickSocial${name}`).value = social[key] || '';
  });
  if ($('quickImagePositionX')) $('quickImagePositionX').value = p.imagePositionX ?? 50;
  if ($('quickImagePositionY')) $('quickImagePositionY').value = p.imagePositionY ?? 50;
  if ($('quickImageZoom')) $('quickImageZoom').value = p.imageZoom ?? 100;
  if ($('quickProfileImageStatus')) $('quickProfileImageStatus').textContent = p.image ? '現在の写真を使用します。変更するときだけ新しい写真を選んでください。' : '写真を選択してください。';
  updateQuickPositionPreview();
}

function updateQuickPositionPreview() {
  const image = $('quickPositionPreviewImage');
  const fallback = $('quickPositionPreviewFallback');
  if (!image || !fallback) return;
  const x = Number($('quickImagePositionX').value || 50);
  const y = Number($('quickImagePositionY').value || 50);
  const zoom = Number($('quickImageZoom').value || 100);
  const src = pendingProfileImage || state.profile.image || '';
  $('quickPositionXValue').textContent = `${x}%`;
  $('quickPositionYValue').textContent = `${y}%`;
  $('quickImageZoomValue').textContent = `${zoom}%`;
  if (src) {
    image.src = src;
    image.hidden = false;
    fallback.hidden = true;
    image.style.objectPosition = `${x}% ${y}%`;
    image.style.transformOrigin = `${x}% ${y}%`;
    image.style.transform = `scale(${zoom / 100})`;
  } else {
    image.removeAttribute('src');
    image.hidden = true;
    fallback.hidden = false;
  }
}

function saveFocusedChange(message) {
  saveState();
  renderSite();
  populateAdmin();
  populateQuickEditors();
  showToast(message);
  setAdminTab('dashboard');
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function updatePositionPreview() {
  const image = $('positionPreviewImage');
  const fallback = $('positionPreviewFallback');
  if (!image || !fallback) return;

  const x = Number($('editImagePositionX').value || 50);
  const y = Number($('editImagePositionY').value || 50);
  const zoom = Number($('editImageZoom').value || 100);
  const src = pendingProfileImage || state.profile.image || '';

  $('positionXValue').textContent = `${x}%`;
  $('positionYValue').textContent = `${y}%`;
  $('imageZoomValue').textContent = `${zoom}%`;

  if (src) {
    image.src = src;
    image.hidden = false;
    fallback.hidden = true;
    image.style.objectPosition = `${x}% ${y}%`;
    image.style.transformOrigin = `${x}% ${y}%`;
    image.style.transform = `scale(${zoom / 100})`;
  } else {
    image.removeAttribute('src');
    image.hidden = true;
    fallback.hidden = false;
  }
}

async function prepareActivityPhotos(files) {
  selectedActivityImages = [];
  $('photoPreview').innerHTML = '';
  for (const file of [...files].slice(0, 4)) {
    const dataUrl = await fileToDataUrl(file);
    selectedActivityImages.push(dataUrl);
    const img = document.createElement('img');
    img.src = dataUrl;
    img.alt = file.name;
    img.className = 'photo-thumb';
    $('photoPreview').appendChild(img);
  }
}

function makeTitle(text) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  const locationMatch = normalized.match(/([一-龥ぁ-んァ-ヶA-Za-z0-9〇○△]+(?:町|村|市|地区|公園|駅|学校))/);
  const location = locationMatch ? locationMatch[1] : '地域';

  if (/清掃|ごみ拾い|ゴミ拾い/.test(normalized)) return `${location}の清掃活動に参加しました`;
  if (/視察|現場確認|点検/.test(normalized)) return `${location}の現場を確認しました`;
  if (/要望|相談|声を伺|お声/.test(normalized)) return `${location}で皆さまのお声を伺いました`;
  if (/議会|一般質問/.test(normalized)) return '町議会で一般質問を行いました';
  if (/防災|訓練/.test(normalized)) return `${location}の防災活動に参加しました`;
  return `${location}で活動しました`;
}

function extractSentences(text) {
  return text
    .replace(/\r/g, '')
    .split(/(?<=[。！？!?])\s*|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function politeSentence(sentence) {
  let s = sentence.trim();
  s = s.replace(/しました。?$/, 'しました。');
  if (!/[。！？!?]$/.test(s)) s += '。';
  return s;
}

function buildArticleFromInput(text, date) {
  const sentences = extractSentences(text);
  const dateLead = date ? `${formatDate(date)}、` : '本日、';
  const bodyParts = [];

  if (sentences.length) {
    let first = politeSentence(sentences[0]);
    first = first.replace(/^今日の午前中、?/, '').replace(/^今日、?/, '').replace(/^本日、?/, '');
    bodyParts.push(`${dateLead}${first}`);
  }
  sentences.slice(1).forEach((sentence) => bodyParts.push(politeSentence(sentence)));

  if (!/今後|相談|確認|取り組|進め/.test(text)) bodyParts.push('今後も現場の声を大切にし、必要な対応につなげてまいります。');
  if (!/ありがとう|御礼|感謝/.test(text)) bodyParts.push('ご協力いただいた皆さま、ありがとうございました。');

  return {
    title: makeTitle(text),
    body: bodyParts.join('\n\n'),
    caption: selectedActivityImages.length
      ? selectedActivityImages.map((_, i) => `【写真${i + 1}】活動の様子`).join('\n')
      : '写真は掲載していません。'
  };
}

function updateReviewPreview() {
  const title = $('generatedTitle').value.trim();
  const body = $('generatedBody').value.trim();
  $('reviewMeta').textContent = `${$('activityCategory').value} ｜ ${formatDate($('activityDate').value)}`;
  $('reviewTitlePreview').textContent = title;
  $('reviewBodyPreview').textContent = body.slice(0, 260) + (body.length > 260 ? '…' : '');

  const target = $('reviewImage');
  if (selectedActivityImages[0]) target.innerHTML = `<img src="${selectedActivityImages[0]}" alt="活動写真">`;
  else target.textContent = 'ACTIVITY';
}

function openReview(article) {
  $('generatedTitle').value = article.title;
  $('generatedBody').value = article.body;
  $('generatedCaption').value = article.caption;
  $('reviewStatus').textContent = '下書き';
  $('articleReview').classList.remove('hidden');
  updateReviewPreview();
  $('articleReview').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function applyRevision(instruction) {
  let title = $('generatedTitle').value.trim();
  let body = $('generatedBody').value.trim();

  if (/短く|半分|簡潔/.test(instruction)) {
    const sentences = extractSentences(body);
    body = sentences.slice(0, Math.max(3, Math.ceil(sentences.length * 0.6))).join('\n\n');
  }
  if (/親しみ|柔らか|やさし/.test(instruction)) {
    body = body.replace(/今後も現場の声を大切にし、必要な対応につなげてまいります。/g, 'これからも皆さまのお声を丁寧に伺い、より良い町づくりにつなげてまいります。');
  }
  if (/力強|決意|熱/.test(instruction)) body += '\n\n一つ一つの課題に真剣に向き合い、着実に前へ進めてまいります。';
  if (/タイトル.*短/.test(instruction)) title = title.replace(/地域の皆さまと|皆さまと一緒に|に参加しました/g, '').trim();
  if (/ありがとう|御礼|感謝/.test(instruction) && !/ありがとう|感謝/.test(body)) body += '\n\nご協力いただいた皆さまに、心より感謝申し上げます。';
  if (/大げさ|控えめ/.test(instruction)) body = body.replace(/必ず|全力で|力強く/g, '着実に');
  if (/ですます|丁寧/.test(instruction)) body = body.replace(/だ。/g, 'です。').replace(/である。/g, 'です。');

  $('generatedTitle').value = title;
  $('generatedBody').value = body;
  updateReviewPreview();
}

function buildCurrentPost(status = 'published') {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    title: $('generatedTitle').value.trim(),
    body: $('generatedBody').value.trim(),
    caption: $('generatedCaption').value.trim(),
    category: $('activityCategory').value,
    date: $('activityDate').value,
    images: selectedActivityImages,
    status,
    createdAt: new Date().toISOString()
  };
}

function resetActivityForm() {
  $('activityInput').value = '';
  $('activityPhotos').value = '';
  $('photoPreview').innerHTML = '';
  selectedActivityImages = [];
  $('articleReview').classList.add('hidden');
  $('revisionInput').value = '';
}

function gatherTopForm() {
  const selectedTemplate = $$('.template-card').find((card) => card.classList.contains('active'))?.dataset.template || 'trust';
  const town = $('editTown').value.trim() || '〇〇町';
  const achievements = [1, 2, 3].map((i) => {
    const current = state.achievements[i - 1] || {};
    return {
      title: $(`achievementTitle${i}`).value.trim(),
      description: $(`achievementDesc${i}`).value.trim(),
      image: pendingAchievementImages[i - 1] || current.image || ''
    };
  }).filter((item) => item.title || item.description || item.image);

  return {
    template: selectedTemplate,
    themeColor: $('editColor').value || templateDefaults[selectedTemplate],
    profile: {
      ...state.profile,
      name: $('editName').value.trim() || '議員名',
      town,
      office: $('editOffice').value.trim() || `${town}議会議員`,
      catch: $('editCatch').value.trim(),
      message: state.profile.message || '',
      profileText: $('editProfile').value.trim(),
      image: pendingProfileImage || state.profile.image,
      imagePositionX: Number($('editImagePositionX').value || 50),
      imagePositionY: Number($('editImagePositionY').value || 50),
      imageZoom: Number($('editImageZoom').value || 100),
      facts: [1, 2, 3, 4, 5].map((i) => ({
        label: $(`profileFactLabel${i}`).value.trim(),
        value: $(`profileFactValue${i}`).value.trim()
      }))
    },
    socialLinks: {
      instagram: normalizeUrl($('socialInstagram').value),
      youtube: normalizeUrl($('socialYoutube').value),
      facebook: normalizeUrl($('socialFacebook').value),
      x: normalizeUrl($('socialX').value),
      line: normalizeUrl($('socialLine').value)
    },
    policies: [1, 2, 3].map((i) => ({
      title: $(`policy${i}`).value.trim() || `重点政策${i}`,
      description: $(`policyDesc${i}`).value.trim()
    })),
    achievements
  };
}

function applyTopPreview(save = false) {
  state = { ...state, ...gatherTopForm() };
  renderSite();
  if (save) {
    saveState();
    pendingProfileImage = '';
    pendingAchievementImages = [null, null, null];
    showToast('トップページを保存しました');
  } else {
    showToast('完成イメージを表示しました');
  }
  setView('site');
}

function showWizardStep(index) {
  const steps = $$('.wizard-step[data-wizard="top"]');
  if (!steps.length) return;
  const safeIndex = Math.max(0, Math.min(index, steps.length - 1));
  topStep = safeIndex;
  steps.forEach((step, i) => step.classList.toggle('active', i === safeIndex));
  $('topStepCurrent').textContent = safeIndex + 1;
  $('topStepTotal').textContent = steps.length;
  $('topProgressBar').style.width = `${((safeIndex + 1) / steps.length) * 100}%`;
  $('topBackButton').classList.toggle('hidden', safeIndex === 0);
  $('topNextButton').classList.toggle('hidden', safeIndex === steps.length - 1);
  $('applyTopButton').classList.toggle('hidden', safeIndex !== steps.length - 1);
  $('publishTopButton').classList.toggle('hidden', safeIndex !== steps.length - 1);
  if (safeIndex === steps.length - 1) updateTopSummary();
}

function validateTopStep() {
  if (topStep === 0 && !$('editName').value.trim()) {
    showToast('議員名を入力してください');
    return false;
  }
  return true;
}

function updateTopSummary() {
  const selected = $$('.template-card').find((card) => card.classList.contains('active'));
  const socialCount = ['socialInstagram', 'socialYoutube', 'socialFacebook', 'socialX', 'socialLine']
    .filter((id) => normalizeUrl($(id).value)).length;
  const achievementCount = [1, 2, 3].filter((i) => $(`achievementTitle${i}`).value.trim() || $(`achievementDesc${i}`).value.trim() || pendingAchievementImages[i - 1] || state.achievements[i - 1]?.image).length;
  const factCount = [1, 2, 3, 4, 5].filter((i) => $(`profileFactLabel${i}`).value.trim() && $(`profileFactValue${i}`).value.trim()).length;
  const items = [
    ['議員名', $('editName').value.trim() || '未入力'],
    ['町名', $('editTown').value.trim() || '未入力'],
    ['デザイン', selected?.querySelector('strong')?.textContent || '信頼・誠実'],
    ['SNS', socialCount ? `${socialCount}種類のリンクを表示` : '表示しない'],
    ['キャッチコピー', $('editCatch').value.trim() || '未入力'],
    ['プロフィール項目', factCount ? `${factCount}件を表示` : '表示しない'],
    ['重点政策', [1, 2, 3].map((i) => $(`policy${i}`).value.trim()).filter(Boolean).join('／') || '未入力'],
    ['主な実績', achievementCount ? `${achievementCount}件を表示` : '表示しない']
  ];
  $('topAnswerSummary').innerHTML = items.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><p>${escapeHtml(value)}</p></div>`).join('');
}

function fillSample() {
  $('activityInput').value = '今日の午前中、〇〇町の△△地区で行われた清掃活動に参加しました。\n\n自治会の皆さまや地域の子どもたちと一緒に、道路や公園のごみ拾いをしました。参加者は30人くらいでした。\n\n地域の方から、公園のベンチが古くなっていることや、夜になると周辺が暗いというお話も伺いました。\n\n実際に現場を見ることができ、とても勉強になりました。いただいたご意見を確認し、町にも相談していきたいと思います。';
  showToast('活動報告の例を入力しました');
}

function setupVoiceRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    $$('.voice-button').forEach((button) => {
      button.disabled = true;
      button.textContent = '音声入力は未対応です';
    });
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = 'ja-JP';
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = () => {
    recognizing = true;
    $$('.voice-button').forEach((button) => {
      if (button.dataset.voiceTarget === activeVoiceTarget) button.textContent = '■ 音声入力を停止';
    });
  };

  recognition.onend = () => {
    recognizing = false;
    $$('.voice-button').forEach((button) => { button.textContent = '🎤 話して入力'; });
    $$('.voice-status').forEach((status) => { status.textContent = ''; });
  };

  recognition.onerror = () => showToast('音声入力を開始できませんでした');

  recognition.onresult = (event) => {
    let interim = '';
    let finalText = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) finalText += transcript;
      else interim += transcript;
    }

    const target = $(activeVoiceTarget);
    if (target && finalText) target.value += `${target.value && !target.value.endsWith('\n') ? '\n' : ''}${finalText}`;
    const activeButton = document.querySelector(`.voice-button[data-voice-target="${activeVoiceTarget}"]`);
    const status = activeButton?.parentElement.querySelector('.voice-status');
    if (status) status.textContent = interim || '音声を認識中…';
  };
}

function setupEvents() {
  $$('[data-open-admin]').forEach((button) => button.addEventListener('click', () => setAdminTab(button.dataset.openAdmin)));
  $$('[data-admin-home]').forEach((button) => button.addEventListener('click', () => setAdminTab('dashboard')));
  $('adminHomeButton').addEventListener('click', () => setAdminTab('dashboard'));
  $('previewSiteButton').addEventListener('click', () => setView('site'));
  $('dashboardPreviewButton').addEventListener('click', () => setView('site'));
  $('previewReturnButton').addEventListener('click', () => { setView('admin'); setAdminTab('dashboard'); });
  $('siteTownBadge').addEventListener('click', () => {
    setView('site');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  $('sampleButton').addEventListener('click', fillSample);
  $('activityPhotos').addEventListener('change', (event) => prepareActivityPhotos(event.target.files));
  $('generateArticleButton').addEventListener('click', () => {
    const text = $('activityInput').value.trim();
    if (!text) return showToast('活動内容を入力してください');
    openReview(buildArticleFromInput(text, $('activityDate').value));
  });

  ['generatedTitle', 'generatedBody'].forEach((id) => $(id).addEventListener('input', updateReviewPreview));
  $('reviseButton').addEventListener('click', () => {
    const instruction = $('revisionInput').value.trim();
    if (!instruction) return showToast('修正内容を入力してください');
    applyRevision(instruction);
    $('revisionInput').value = '';
    showToast('修正を反映しました');
  });

  $('returnToQuestionsButton').addEventListener('click', () => {
    $('articleReview').classList.add('hidden');
    document.querySelector('#activityPanel .activity-form-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  $('saveDraftButton').addEventListener('click', () => {
    state.draft = buildCurrentPost('draft');
    saveState();
    $('reviewStatus').textContent = '保存済み';
    showToast('下書きを保存しました');
  });

  $('publishButton').addEventListener('click', () => {
    const post = buildCurrentPost('published');
    if (!post.title || !post.body) return showToast('タイトルと本文を確認してください');
    state.posts.push(post);
    state.draft = null;
    saveState();
    renderSite();
    resetActivityForm();
    setView('site');
    setTimeout(() => $('latest').scrollIntoView({ behavior: 'smooth' }), 200);
    showToast('ホームページを更新しました');
  });

  $$('.template-card').forEach((card) => card.addEventListener('click', () => {
    $$('.template-card').forEach((item) => item.classList.remove('active'));
    card.classList.add('active');
    $('editColor').value = templateDefaults[card.dataset.template];
  }));

  $('editHeroImage').addEventListener('change', async (event) => {
    const [file] = event.target.files;
    if (!file) return;
    pendingProfileImage = await fileToDataUrl(file);
    $('profileImageStatus').textContent = `選択済み：${file.name}`;
    updatePositionPreview();
    showToast('プロフィール写真を読み込みました');
  });

  ['editImagePositionX', 'editImagePositionY', 'editImageZoom'].forEach((id) => {
    $(id).addEventListener('input', updatePositionPreview);
  });
  $('resetImagePosition').addEventListener('click', () => {
    $('editImagePositionX').value = 50;
    $('editImagePositionY').value = 50;
    $('editImageZoom').value = 100;
    updatePositionPreview();
    showToast('写真の位置を中央に戻しました');
  });

  [1, 2, 3].forEach((i) => {
    $(`achievementPhoto${i}`).addEventListener('change', async (event) => {
      const [file] = event.target.files;
      if (!file) return;
      pendingAchievementImages[i - 1] = await fileToDataUrl(file);
      $(`achievementPhotoStatus${i}`).textContent = `選択済み：${file.name}`;
      showToast(`実績${i}の写真を読み込みました`);
    });
  });

  $('topBackButton').addEventListener('click', () => showWizardStep(topStep - 1));
  $('topNextButton').addEventListener('click', () => {
    if (validateTopStep()) showWizardStep(topStep + 1);
  });
  $('applyTopButton').addEventListener('click', () => applyTopPreview(false));
  $('publishTopButton').addEventListener('click', () => applyTopPreview(true));

  $('quickHeroImage').addEventListener('change', async (event) => {
    const [file] = event.target.files;
    if (!file) return;
    pendingProfileImage = await fileToDataUrl(file);
    $('quickProfileImageStatus').textContent = `選択済み：${file.name}`;
    updateQuickPositionPreview();
  });
  ['quickImagePositionX', 'quickImagePositionY', 'quickImageZoom'].forEach((id) => $(id).addEventListener('input', updateQuickPositionPreview));
  $('quickResetImagePosition').addEventListener('click', () => {
    $('quickImagePositionX').value = 50;
    $('quickImagePositionY').value = 50;
    $('quickImageZoom').value = 100;
    updateQuickPositionPreview();
  });
  $('savePhotoOnlyButton').addEventListener('click', () => {
    state.profile.image = pendingProfileImage || state.profile.image;
    state.profile.imagePositionX = Number($('quickImagePositionX').value || 50);
    state.profile.imagePositionY = Number($('quickImagePositionY').value || 50);
    state.profile.imageZoom = Number($('quickImageZoom').value || 100);
    pendingProfileImage = '';
    saveFocusedChange('写真を更新しました');
  });
  $('saveProfileOnlyButton').addEventListener('click', () => {
    state.profile.profileText = $('quickProfileText').value.trim();
    state.profile.facts = [1,2,3,4,5].map((i) => ({ label: $(`quickFactLabel${i}`).value.trim(), value: $(`quickFactValue${i}`).value.trim() }));
    saveFocusedChange('プロフィールを更新しました');
  });
  $('savePolicyOnlyButton').addEventListener('click', () => {
    state.policies = [1,2,3].map((i) => ({ title: $(`quickPolicy${i}`).value.trim() || `重点政策${i}`, description: $(`quickPolicyDesc${i}`).value.trim() }));
    saveFocusedChange('重点政策を更新しました');
  });
  [1,2,3].forEach((i) => {
    $(`quickAchievementPhoto${i}`).addEventListener('change', async (event) => {
      const [file] = event.target.files;
      if (!file) return;
      pendingAchievementImages[i - 1] = await fileToDataUrl(file);
      $(`quickAchievementPhotoStatus${i}`).textContent = `選択済み：${file.name}`;
    });
  });
  $('saveAchievementOnlyButton').addEventListener('click', () => {
    state.achievements = [1,2,3].map((i) => {
      const current = state.achievements[i - 1] || {};
      return { title: $(`quickAchievementTitle${i}`).value.trim(), description: $(`quickAchievementDesc${i}`).value.trim(), image: pendingAchievementImages[i - 1] || current.image || '' };
    }).filter((item) => item.title || item.description || item.image);
    pendingAchievementImages = [null, null, null];
    saveFocusedChange('主な実績を更新しました');
  });
  $('saveSocialOnlyButton').addEventListener('click', () => {
    state.socialLinks = {
      instagram: normalizeUrl($('quickSocialInstagram').value),
      youtube: normalizeUrl($('quickSocialYoutube').value),
      facebook: normalizeUrl($('quickSocialFacebook').value),
      x: normalizeUrl($('quickSocialX').value),
      line: normalizeUrl($('quickSocialLine').value)
    };
    saveFocusedChange('SNSリンクを更新しました');
  });

  $$('.voice-button').forEach((button) => button.addEventListener('click', () => {
    if (!recognition) return;
    if (recognizing && activeVoiceTarget === button.dataset.voiceTarget) {
      recognition.stop();
      return;
    }
    if (recognizing) recognition.stop();
    activeVoiceTarget = button.dataset.voiceTarget;
    setTimeout(() => recognition.start(), 100);
  }));

  $('exportButton').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${state.profile.name}_ホームページ_バックアップ_${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast('バックアップを書き出しました');
  });

  $('importInput').addEventListener('change', async (event) => {
    const [file] = event.target.files;
    if (!file) return;
    try {
      state = normalizeState(JSON.parse(await file.text()));
      saveState();
      pendingProfileImage = '';
      pendingAchievementImages = [null, null, null];
      renderSite();
      populateAdmin();
      showWizardStep(0);
      showToast('バックアップを読み込みました');
    } catch {
      showToast('バックアップを読み込めませんでした');
    }
  });

  $('resetButton').addEventListener('click', () => {
    const ok = window.confirm('試作データを初期状態に戻しますか？');
    if (!ok) return;
    state = clone(defaultState);
    saveState();
    pendingProfileImage = '';
    pendingAchievementImages = [null, null, null];
    renderSite();
    populateAdmin();
    resetActivityForm();
    showWizardStep(0);
    showToast('初期状態に戻しました');
  });
}

function restoreDraft() {
  if (!state.draft) return;
  const draft = state.draft;
  $('activityDate').value = draft.date || $('activityDate').value;
  $('activityCategory').value = draft.category || '地域活動';
  selectedActivityImages = draft.images || [];
  $('photoPreview').innerHTML = selectedActivityImages.map((src) => `<img src="${src}" class="photo-thumb" alt="保存写真">`).join('');
  openReview({ title: draft.title, body: draft.body, caption: draft.caption || '' });
  $('reviewStatus').textContent = '保存済み';
}

function init() {
  renderSite();
  populateAdmin();
  populateQuickEditors();
  setupVoiceRecognition();
  setupEvents();
  showWizardStep(0);
  restoreDraft();
  setView(adminMode ? 'admin' : 'site');
  if (adminMode) setAdminTab('dashboard');
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

init();
