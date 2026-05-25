# infra-02: データモデル(TypeScript型)定義

## 概要
仕様書「7. データ」に基づき、Firestore のコレクション定義と TypeScript の型を共通モジュールとして整備する。

## 目的
- フロント/Functions 双方で同じ型を使い、フィールド名のブレを防ぐ
- 4人並行開発の初日にスキーマを固定して後戻りを減らす

## タスク
- `app/src/types/firestore.ts` (or 共通モジュール) を作成し、以下を定義:
  - `User`, `Passion`, `Egg`, `Character`, `Exchange`, `Chat`, `ChatMessage`
- `Timestamp` は Firestore の `Timestamp` 型と ISO string で取り回しを統一
- 各コレクション名の定数 (`COLLECTIONS.PASSIONS = "passions"` 等) を export
- Functions 側でも同じ型を再利用できるよう `functions/src/types` から re-export または共有

## 完了条件
- 全コレクションの型が定義され、コンパイルが通る
- README またはコメントに各フィールドの簡単な説明がある

## 関連
- 仕様書「7. データ」
- 依存: なし
- 後続: ほぼ全Issueの前提
