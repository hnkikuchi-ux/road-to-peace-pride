(() => {
  const $ = (id) => document.getElementById(id);
  const ua = navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(ua);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  let deferredPrompt = null;

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  const showInstalled = () => {
    $('guideTitle').textContent = 'インストール済みです';
    $('devicePill').textContent = '完了';
    $('status').textContent = 'ホーム画面の「議員ホーム」から利用できます。';
    $('status').classList.add('done');
    $('openButton').classList.remove('hidden');
    $('installButton').classList.add('hidden');
    $('iosGuide').classList.add('hidden');
    $('androidGuide').classList.add('hidden');
  };

  if (isStandalone) {
    showInstalled();
    return;
  }

  if (isIOS) {
    $('guideTitle').textContent = 'iPhone・iPadへの追加方法';
    $('devicePill').textContent = 'iPhone';
    $('status').textContent = 'Safariで、次の3つだけ操作してください。';
    $('status').classList.add('warn');
    $('iosGuide').classList.remove('hidden');
  } else if (isAndroid) {
    $('guideTitle').textContent = 'Androidへのインストール';
    $('devicePill').textContent = 'Android';
    $('status').textContent = '下のボタンが有効になったら押してください。';
    $('androidGuide').classList.remove('hidden');
    $('installButton').classList.remove('hidden');
    $('installButton').disabled = true;
    $('installButton').textContent = 'インストール準備中…';
  } else {
    $('guideTitle').textContent = 'スマホで開いてください';
    $('devicePill').textContent = 'PC';
    $('status').textContent = 'このURLをiPhoneまたはAndroidで開くと、端末別の案内が表示されます。';
    $('openButton').classList.remove('hidden');
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    $('installButton').disabled = false;
    $('installButton').textContent = 'この端末にインストール';
  });

  $('installButton').addEventListener('click', async () => {
    if (!deferredPrompt) {
      $('status').textContent = 'Chrome右上のメニューから「アプリをインストール」を選んでください。';
      return;
    }
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
  });

  window.addEventListener('appinstalled', showInstalled);
})();
