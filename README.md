# ROAD TO PEACE PRIDE
## MEMORIAL COLLECTION 2026

**9.12までの挑戦と誓いの記録**  
OUR VOW, OUR JOURNEY  
そして、11.15、11.18へ

約300人規模のオンライン文集を、スマートフォン中心で閲覧・投稿できるWebアプリです。

## 現在の公開構成

```text
GitHub
  ↓ 自動デプロイ
Cloudflare Workers + Static Assets
  ├─ 閲覧パスワード認証
  ├─ 投稿者メールOTP認証
  ├─ 管理者認証
  ├─ Security Guard
  ├─ API
  ├─ D1: 原稿・セッション・運用設定
  └─ KV: 投稿写真
```

**Supabaseは不要です。** 既存Cloudflare D1/KVをそのまま利用します。

## 閲覧

- 共通閲覧パスワード
- CONTENTSは「題名＋氏名」のみ
- スマホ左右スワイプ
- お気に入り
- 本文は原文のまま表示
- 写真は認証済み閲覧者だけAPI経由で取得

## 投稿者

- Googleアカウント不要
- Email + 6桁OTP
- 自分の原稿だけ作成・編集
- 組織名（総区・分区・本部・支部）は自由入力
- 端末へ即時ローカル保存
- PRODUCTIONでは20秒ごとCloudflareへ自動保存
- PREVIEWでは安全のためCloudflareへの原稿・写真保存を停止
- 本人JSONバックアップ
- 写真1枚
- 写真は最大1600pxへ再圧縮
- 題名40字以内
- 本文1000字程度
- 管理者設定の締切後はサーバー側でも保存停止

### 原文保護

投稿された本文に対して、AIによる自動の

- 校正
- 要約
- 言い換え
- 文体変更

は行いません。

## データ保存

### 本文・メタデータ
Cloudflare D1 `rpp_stories`

### 写真
Cloudflare KV binding `MEDIA`

概念上のキー:

```text
rpp/<story-id>/main.jpg
```

## 認証・セキュリティ

- 閲覧パスワード判定はWorker側
- 閲覧パスワードはハッシュ化してD1保存可能
- 投稿者OTPはD1へハッシュ保存・10分で失効
- OTP連続再送は120秒制限
- 認証試行回数制限
- PRODUCTIONでOTPを要求するには先に閲覧パスワード認証が必要
- 投稿者セッションはHttpOnly + Secure Cookie
- 管理セッションもHttpOnly + Secure Cookie
- 管理画面の簡易デモコードは無効
- 初回管理認証はCloudflare `SETUP_KEY` を使用可能
- Security GuardがPREVIEW中の原稿・写真クラウド書込みを停止
- 写真の固定公開URLを発行しない
- GitHubには投稿本文・投稿写真・本番パスワードを保存しない
- Brevo APIキーは管理画面から入力可能。Cloudflare `SETUP_KEY` を使いAES-GCMで暗号化してD1保存

## 管理画面

`/admin.html`

管理画面から以下を設定・確認できます。

- 対象人数
- 原稿締切
- PREVIEW / PRODUCTION
- 文集閲覧ON/OFF
- 閲覧パスワード
- 管理者パスワード
- Brevo APIキー
- OTP送信元メール
- OTPテスト送信
- 本番条件チェック
- 投稿者一覧
- 提出済 / 下書き / 写真ありフィルター
- JSONバックアップ
- CSV出力
- 本文＋写真の完全ZIPバックアップ

## Preview → Production

PREVIEW中は安全確認モードです。

- 閲覧パスワードは、本番パスワード未設定時のみ `demo` を利用可能
- 管理画面の簡易デモコードは使用しない
- 管理画面の初回ログインはCloudflare `SETUP_KEY` を使用可能
- メール未設定時は投稿画面に確認用OTPを表示
- 原稿・写真はCloudflareへ保存せず端末保存のみ

本番切替は管理画面から行います。

1. SETUP_KEYで管理画面へログイン
2. 管理者パスワードを設定
3. 閲覧パスワードを設定
4. Brevo APIキー + 送信元メールを設定
5. テストメール送信
6. `/status.html` が READY になったことを確認
7. 投稿・閲覧テストを実施
8. Site Mode を `PRODUCTION` に変更

本番切替時、必要設定が足りない場合はWorker側で拒否します。

## Email OTP

現在はBrevo APIを使用する設計です。

必要なもの:

- Brevoアカウント
- Brevo API Key
- Brevoで利用可能な送信元メールアドレス

APIキーはCloudflareのSecrets画面へ直接入力しなくても、管理画面から暗号化保存できます。

## System Status

`/status.html`

以下を自動診断します。

- Worker API
- Security Guard
- PREVIEW / PRODUCTION
- PREVIEW中のクラウド書込み停止状態
- D1
- KV写真Storage
- 閲覧パスワード
- 管理者パスワード
- Email OTP
- 文集OPEN / PAUSED
- 原稿締切
- Build Version
- 次に必要な設定

## 自動チェック

GitHub Actionsで、pushごとに以下を検証します。

- `src/rpp-worker.js` 構文
- `src/secure-worker.js` 構文
- 必須公開ファイル
- `wrangler.jsonc` が `secure-worker.js` を起動対象にしていること
- WranglerによるCloudflareデプロイドライラン

## Design

- NAVY / INDIGO / subtle PURPLE
- GOLD typography / ornament
- 夜明け・地平線・光の道
- アイボリーの本文紙面
- mobile-first
- solemn memorial editorial aesthetic

## Repository

`hnkikuchi-ux/road-to-peace-pride`

## Cloudflare

現在のWorker名は既存の秘密設定を維持するため `giin-home-cloud-pilot` を一時的に継続しています。文集本番設定完了後に公開URL名を整理できます。
