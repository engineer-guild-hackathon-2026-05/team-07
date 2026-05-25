# grow-03: チャット送受信・OpenAI連携

## 概要
ユーザーメッセージを受け取り、キャラクターの `characterPrompt` と過去履歴を踏まえた応答を生成する。

## 目的
- 偏愛キャラとして自然に会話できるバックエンドを構築する
- キャラの口調・知識の偏りを再現する

## タスク
- `functions/src/chat/sendMessage.ts` callable を作成
- 入力: `characterId`, `userMessage`
- 処理:
  1. caller が currentOwnerUid 一致か確認
  2. `characters/{characterId}` を読み込み、`characterPrompt` を system prompt にセット
  3. 直近 N 件のチャット履歴を取得
  4. OpenAI に投げて応答取得
  5. user/assistant の2件を `chats/{chatId}.messages` に追記
  6. (任意) 応答内容から `affinityScore` を微増、後続Issueに渡せる形に
- レート制限(同一ユーザーが秒間連投できないように)

## 完了条件
- フロントから送信して、キャラらしい返答が返る
- 履歴がFirestoreに残り、ページリロードしても見える

## 関連
- 依存: [grow-02](./grow-02-chat-ui.md), [char-04](./char-04-egg-generation.md), [infra-01](./infra-01-firestore-rules.md)
- 後続: [grow-04](./grow-04-growth-level.md)
