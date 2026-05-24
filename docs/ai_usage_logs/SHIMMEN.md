# AI 活用ログ — Team 07（SHIMMEN）

審査項目「AI 活用度」の根拠資料。Day1〜Day3 を通して、AI ツールをどう使ったかを記録する。
**最低 1 日 3 件以上**の記入を目安に。

## 記入ルール

- 開発の節目ごとに追記する（5 分単位で書くより、機能/論点単位で書く）
- プロンプトは「実際に投げた文」を残す（要約は審査時に減点要因になりうる）
- 出力評価は **採用 / 一部採用 / 不採用** の 3 値で正直に
- 「採用しなかった理由」も書くと AI 活用の判断力アピールになる

---

## Day 1（2026-05-24）

### #001 Firestore データモデルの型定義実装（issue #20）

- **時刻**：22:50
- **ツール**：Claude Code（claude-sonnet-4-6）
- **目的**：全 Firestore コレクションの TypeScript 型と定数を共通モジュールとして整備し、フロント/Functions 間のフィールド名のブレを防ぐ
- **プロンプト**：
  ```
  以下のissue #20 を実装してください。

  ## やりたいこと

  仕様書「7. データ」に基づき、Firestore のコレクション定義と TypeScript の型を共通モジュールとして整備する。

  ## なぜやるか（解きたい課題）

  - フロント/Functions 双方で同じ型を使い、フィールド名のブレを防ぐ
  - 4人並行開発の初日にスキーマを固定して後戻りを減らす

  ## タスク

  - `app/src/types/firestore.ts` (or 共通モジュール) を作成し、以下を定義:
    - `User`, `Passion`, `Egg`, `Character`, `Exchange`, `Chat`, `ChatMessage`
  - `Timestamp` は Firestore の `Timestamp` 型と ISO string で取り回しを統一
  - 各コレクション名の定数 (`COLLECTIONS.PASSIONS = "passions"` 等) を export
  - Functions 側でも同じ型を再利用できるよう `functions/src/types` から re-export または共有

  ## 完了条件

  - [ ] 全コレクションの型が定義され、コンパイルが通る
  - [ ] README またはコメントに各フィールドの簡単な説明がある

  ## 工数感

  S

  ## 関連

  - 仕様書「7. データ」
  - 依存: なし
  - 後続: ほぼ全Issueの前提
  ```
- **出力サマリ**：
  - `app/src/types/firestore.ts` を新規作成。`UserDoc` / `PassionDoc` / `EggDoc` / `CharacterDoc` / `ExchangeDoc` / `ChatDoc` / `ChatMessageDoc` の 7 型と `COLLECTIONS` 定数、`CollectionName` 型を定義
  - `app/functions/src/types/firestore.ts` にミラーファイルを配置（後述 #002 参照）
  - `app/functions/src/index.ts` の未使用 import を修正（`noUnusedLocals` によるコンパイルエラー解消）
  - `tsc --noEmit` 両プロジェクトでエラーなしを確認
- **評価**：採用
- **採用の理由**：型・定数・JSDoc コメントの構造が仕様書と 1:1 で対応しており、チームが即使用できる状態だった

---

### #002 コミット・PR 作成

- **時刻**：22:56
- **ツール**：Claude Code（claude-sonnet-4-6）
- **目的**：実装を意味のある単位でコミットし、PR テンプレートに沿ったプルリクエストを作成する
- **プロンプト**：
  ```
  ここまでの更新を意味のある単位でcommitし、プルリクエストを作成してください。
  プルリクエストはPULL_REQUEST_TEMPLATE.mdを参考にしてください。
  ```
- **出力サマリ**：
  - コミット①：`feat: Firestoreコレクションの型定義と定数を追加 (#20)`（型定義ファイル 2 件）
  - コミット②：`fix: functions/index.tsの未使用インポートをコメントアウト`（既存バグ修正）
  - PR #27 作成：https://github.com/engineer-guild-hackathon-2026-05/team-07/pull/27
- **評価**：採用
- **採用の理由**：機能追加と既存バグ修正を分けたコミット分割、PR テンプレートへの設計判断の記載など、レビュアー視点で必要な情報が揃っていた

---

## Day 2（2026-05-25）

### #003 AI 活用ログ記録

- **時刻**：00:31
- **ツール**：Claude Code（claude-sonnet-4-6）
- **目的**：Day 1 の実装内容を ai_usage_logs に機能・論点単位でまとめる
- **プロンプト**：
  ```
  ここまでの実装内容を、docs/ai_usage_logs にまとめてください。
  機能・論点単位でまとめ、プロンプトは私が渡したものを記録してください。
  時刻も取得できるのあれば正確に記録してください。
  ```
- **出力サマリ**：本ファイル（SHIMMEN.md）を PULL_REQUEST_TEMPLATE.md の書式に準じた形式で記録
- **評価**：採用
- **採用の理由**：機能・設計判断・コミットを別エントリに分け、実際のプロンプトを省略せず記録できた

---

## Day 3（2026-05-26）

### #00X

---
