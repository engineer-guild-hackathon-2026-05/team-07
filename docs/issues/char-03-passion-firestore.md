# char-03: 偏愛情報のFirestore保存

## 概要
`char-01`/`char-02` で得た偏愛情報を `passions` コレクションに保存し、再取得・一覧表示できるようにする。

## 目的
- 偏愛データを永続化し、卵生成・プロフィール画面・交換などに使える状態にする

## タスク
- `app/src/firebase/passion.ts` に `createPassion(input): Promise<passionId>` を実装
  - フィールド: `ownerUid`, `title`, `description`, `tags`, `embedding`(空でOK、後で別Issueで埋める), `createdAt`, `visibility`
- 自分の偏愛一覧を取得する `listMyPassions(uid)` も実装
- 登録画面の submit ハンドラから呼び出して動作確認
- 保存後はホーム or プロフィール画面に遷移

## 完了条件
- Firestore に正しい構造で書き込まれる
- 自分の偏愛がプロフィールで一覧できる

## 関連
- 依存: [char-01](./char-01-passion-registration-ui.md), [infra-01](./infra-01-firestore-rules.md), [infra-02](./infra-02-data-model.md)
- 後続: [char-04](./char-04-egg-generation.md)
