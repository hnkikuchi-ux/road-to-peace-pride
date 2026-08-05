[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/hnkikuchi-ux/giin-home-free)

<!-- dash-content-start -->

# 議員ホーム クラウド実証版

スマホから活動報告・プロフィール・政策・実績を更新し、議員ごとの公開URLを発行できる実証版です。

## 主な機能

- 議員ごとの個別公開URL
- スマホ中心の管理画面
- 活動報告の公開とSNS共有
- 5日間更新がない場合、以後1日1回の更新案内
- D1への記事・プロフィール保存
- KVへの写真保存

## 公開方法

上の **Deploy to Cloudflare** ボタンを押します。

Cloudflareの設定画面では、管理者専用パスワード `SETUP_KEY` を決めます。D1、KV、データベースの表は自動で作成されます。

公開完了後、発行されたURLの末尾に `/setup.html` を付けて開き、試用する議員を登録します。

例：

```text
https://giin-home-cloud-pilot.xxxxx.workers.dev/setup.html
```

登録すると、議員ごとに次の3点が発行されます。

- 一般公開URL
- 本人用管理URL
- 管理キー

本人用管理URLと管理キーは、各議員へ個別に渡してください。

<!-- dash-content-end -->

## 技術構成

- Cloudflare Workers
- Workers Static Assets
- Cloudflare D1
- Workers KV
- TypeScript
