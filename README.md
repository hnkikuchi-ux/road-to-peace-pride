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
  ├─ API
  ├─ D1: 原稿・セッション・設定
  └─ KV: 投稿写真
```

Supabaseは必須ではありません。現在Cloudflare側にすでに存在するD1/KVを再利用する構成へ移行しました。

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
- 20秒ごとクラウド自動保存
- 端末にもローカルバックアップ
- 写真1枚
- 写真は最大1600pxへ再圧縮
- 題名40字以内
- 本文1000字程度

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
Cloudflare KV `MEDIA`

概念上のキー:

```text
rpp/<story-id>/main.jpg
```

## 認証・セキュリティ

- 閲覧パスワード判定はWorker側
- 投稿者OTPはD1へハッシュ保存・10分で失効
- OTPは連続再送を120秒制限
- 投稿者セッションはHttpOnly Cookie
- 管理セッションもHttpOnly Cookie
- 写真の公開URLを固定で発行しない
- GitHubには投稿本文・投稿写真・本番パスワードを保存しない

## Preview / Production

環境変数 `PREVIEW_MODE` が未設定または `true` の間は公開確認モードです。

本番化時はCloudflare側で以下を設定します。

- `PREVIEW_MODE=false`
- `VIEWER_PASSWORD`（共通閲覧パスワード）
- `BREVO_API_KEY`（メールOTP送信用）
- `OTP_SENDER_EMAIL`（Brevoで認証済み送信元）
- `OTP_SENDER_NAME`（任意）
- `OTP_PEPPER`（任意・推奨）

管理者認証は既存Worker Secret `SETUP_KEY` を利用できます。

## Preview Mode

本番メール設定前は、メール送信の代わりに投稿画面へOTPを表示して動作確認できます。
閲覧用の確認パスワードは `demo` です。

## Design

- NAVY / INDIGO / subtle PURPLE
- GOLD typography / ornament
- 夜明け・地平線・光の道
- アイボリーの本文紙面
- mobile-first
- solemn memorial editorial aesthetic

## Repository

`hnkikuchi-ux/road-to-peace-pride`
