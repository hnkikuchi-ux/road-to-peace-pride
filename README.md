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
- 20秒ごとCloudflareへ自動保存
- 端末にもローカルバックアップ
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
- 投稿者セッションはHttpOnly + Secure Cookie
- 管理セッションもHttpOnly + Secure Cookie
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
- 投稿者一覧
- 提出済 / 下書き / 写真ありフィルター
- JSONバックアップ
- CSV出力
- 本文＋写真の完全ZIPバックアップ

## Preview → Production

Preview中は以下で動作確認できます。

- 閲覧パスワード: `demo`（本番パスワード未設定時）
- 管理画面: `654321` でも確認可能
- メール未設定時: OTPを投稿画面内に表示

本番切替は管理画面から行います。

1. 閲覧パスワードを設定
2. 管理者パスワードを設定
3. Brevo APIキー + 送信元メールを設定
4. テストメール送信
5. `/status.html` が READY になったことを確認
6. Site Mode を `PRODUCTION` に変更

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
- PREVIEW / PRODUCTION
- D1
- KV写真Storage
- 閲覧パスワード
- 管理者パスワード
- Email OTP
- 文集OPEN / PAUSED
- 原稿締切
- 次に必要な設定

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
