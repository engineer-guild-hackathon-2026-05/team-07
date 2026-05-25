# exch-02: QRコード読み取り画面

## 概要
相手のQRコードをカメラで読み取り、交換処理をトリガーする画面を実装する。

## 目的
- 対面交換のもう一方のフローを完成させる

## タスク
- ライブラリ選定(`@yudiel/react-qr-scanner` 等)を `app/package.json` に追加
- ページ `/exchange/scan` (`app/src/pages/ExchangeScan.tsx`) を作成
- カメラ permission のハンドリング(拒否時のフォールバックUI)
- 読み取り成功時に交換トークンを抽出し `exch-03` の callable を呼ぶ
- 読み取り後は「○○さんの卵を受け取りました」表示

## 完了条件
- スマホブラウザでカメラが起動し QR を読み取れる
- 不正なQR(本サービス外)を読み取ったらエラー表示

## 関連
- 依存: [exch-01](./exch-01-qr-display.md), [exch-03](./exch-03-exchange-function.md)
