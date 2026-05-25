# grow-02: キャラクターチャットUI

## 概要
キャラクターとの会話画面のUIコンポーネントを実装する(送受信のロジックは別Issue)。

## 目的
- 育成体験のメインインタラクションであるチャットを快適に行えるようにする

## タスク
- `app/src/components/CharacterChat.tsx` を作成
- LINE風の吹き出しUI(キャラ:左、自分:右)
- 入力フォーム + 送信ボタン(Enterで送信、Shift+Enterで改行)
- 既存メッセージ一覧の Firestore subscribe (`chats/{chatId}.messages`)
- 新着メッセージで自動スクロール
- ローディング表示(「考え中...」)

## 完了条件
- ダミーメッセージで吹き出しが正しく表示される
- 長文・連投でレイアウトが崩れない

## 関連
- 依存: [grow-01](./grow-01-character-screen.md), [ux-06](./ux-06-design-system.md)
- 後続: [grow-03](./grow-03-chat-backend.md)
