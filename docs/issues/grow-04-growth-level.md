# grow-04: 育成進行度・知識レベル管理

## 概要
チャットを通じてキャラクターの `growthLevel` / `knowledgeAreas` / `affinityScore` を変動させ、画面に反映する。

## 目的
- 「育成している」体験を可視化し、ユーザーがチャットを続けるモチベーションを作る

## タスク
- 進行度の算出ロジックを定義(例: チャット 5往復で +1 レベル)
- `grow-03` の `sendMessage` Function 内で、応答後にスコア更新を行う
- 知識領域は OpenAI に「このやり取りで深まった話題ラベルを返して」と聞き、`knowledgeAreas` 配列にマージ
- フロントの育成画面 (`grow-01`) に円グラフ or バー表示
- レベルアップ時のトースト or アニメーション

## 完了条件
- チャットを進めると数値が増え、画面に反映される
- 数値の最大値・上限ハンドリングがある

## 関連
- 依存: [grow-01](./grow-01-character-screen.md), [grow-03](./grow-03-chat-backend.md)
- 後続: [grow-05](./grow-05-topic-unlock.md)
