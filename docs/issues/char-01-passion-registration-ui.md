# char-01: 偏愛登録画面UI

## 概要
ユーザーが自分の「偏愛」をテキストとタグで登録する画面のUIを実装する。

## 目的
- キャラクター生成の起点となる偏愛情報を入力できるようにする
- 後続のAI対話・卵生成と接続する土台を作る

## タスク
- `/passions/new` ルートに対応するページコンポーネントを `app/src/pages/PassionRegister.tsx` として作成
- 入力項目:
  - タイトル (例: 「85年式の日本車について」)
  - 自由記述 (textarea, 数百字想定)
  - タグ (Enter区切りで複数追加できるchipUI)
  - 公開範囲 (`public` / `private` ラジオ)
- バリデーション(タイトル必須・タグ最大10件など)
- 保存ボタン押下時の onSubmit ハンドラ(中身は `char-03` で接続)
- Tailwindでモバイル優先のレイアウト

## 完了条件
- 画面で入力でき、submit 時にフォーム値が console に出力される
- スマホ幅で崩れない

## 関連
- 仕様書「5. 偏愛登録画面」
- 依存: [ux-02](./ux-02-routing.md), [ux-06](./ux-06-design-system.md)
- 後続: [char-02](./char-02-ai-passion-dialog.md), [char-03](./char-03-passion-firestore.md)
