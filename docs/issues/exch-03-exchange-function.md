# exch-03: 交換処理Cloud Function

## 概要
QR読み取り時に呼ばれる、卵の所有権移転処理を実装する。

## 目的
- フロントから直接 Firestore を書き換えると不整合・チートが起きやすいため、Function でアトミックに処理する

## タスク
- `functions/src/exchange/completeExchange.ts` に callable `completeExchange({ exchangeToken })` を実装
- 処理:
  1. `exchanges` から `status: 'pending'` のドキュメントを検索
  2. `fromUid != caller.uid` を確認(自分とは交換できない)
  3. 該当 egg の `currentOwnerUid` を caller に更新
  4. `exchanges/{exchangeId}` を `status: 'completed'` に更新し `toUid`, `createdAt` を埋める
  5. (任意) `meetingContext` に時刻・位置情報を残す
- 失敗ケース(期限切れ・既に交換済み・自分自身)のエラーメッセージを定義

## 完了条件
- 別アカウント同士で交換が成立する
- 不正パターンで適切なエラーが返る

## 関連
- 依存: [char-04](./char-04-egg-generation.md), [infra-01](./infra-01-firestore-rules.md)
- 後続: [exch-04](./exch-04-exchange-history.md), [grow-01](./grow-01-character-screen.md)
