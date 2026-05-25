# exch-01: QRコード生成・表示画面

## 概要
卵を交換するための、自分側のQRコード表示画面を実装する。

## 目的
- 対面ユーザーに QR で交換情報を渡し、卵の引き渡しトリガーにする

## タスク
- ライブラリ選定(`qrcode` or `qrcode.react`)し `app/package.json` に追加
- ページ `/exchange/share` (`app/src/pages/ExchangeShare.tsx`) を作成
- QR の内容: 一時的な交換トークン(uuid) + `fromUid` を埋め込んだ URL or JSON
- 一時トークンは Firestore `exchanges/{pendingId}` に `status: 'pending'` で保存し、相手スキャンで `status: 'completed'` に更新する設計にする
- 30秒ごとに QR を再生成 or 一定時間でタイムアウト
- 「どの卵を渡すか」を選ぶUI(自分の卵一覧から選択)

## 完了条件
- QR が画面表示され、スマホで読み取れる
- 渡す卵を選んで「交換待ち」状態にできる

## 関連
- 仕様書「5. 交換画面」
- 依存: [char-05](./char-05-egg-display.md), [infra-02](./infra-02-data-model.md)
- 関連: [exch-02](./exch-02-qr-scan.md), [exch-03](./exch-03-exchange-function.md)
