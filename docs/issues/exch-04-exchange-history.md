# exch-04: 交換履歴画面

## 概要
自分が過去に行った交換の履歴を時系列で見られる画面を実装する。

## 目的
- 「いつ・誰と・何の卵を交換したか」を後から振り返れるようにする
- プロフィール画面の一部として表示する

## タスク
- `app/src/firebase/exchange.ts` に `listMyExchanges(uid)` を実装(`fromUid == uid` OR `toUid == uid`)
- プロフィール画面内のタブ or 専用ページとして表示
- 各履歴の表示要素:
  - 日時
  - 相手の名前/アイコン
  - 受け渡した卵 or キャラ
  - meetingContext(あれば)
- ページネーション or 無限スクロール(余裕があれば)

## 完了条件
- 交換完了後、履歴に追加されることが確認できる
- 自分が `fromUid` でも `toUid` でも一覧に出る

## 関連
- 依存: [exch-03](./exch-03-exchange-function.md), [ux-05](./ux-05-profile.md)
