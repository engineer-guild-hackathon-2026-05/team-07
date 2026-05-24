# AI 活用ログ — Team {{TEAM_NUMBER}}

審査項目「AI 活用度」の根拠資料。Day1〜Day3 を通して、AI ツールをどう使ったかを記録する。
**最低 1 日 3 件以上**の記入を目安に。

## 記入ルール

- 開発の節目ごとに追記する（5 分単位で書くより、機能/論点単位で書く）
- プロンプトは「実際に投げた文」を残す（要約は審査時に減点要因になりうる）
- 出力評価は **採用 / 一部採用 / 不採用** の 3 値で正直に
- 「採用しなかった理由」も書くと AI 活用の判断力アピールになる

---

## Day 1（2026-05-24）

### #001 components移動後の依存修正

- **時刻**：22:30
- **ツール**：Codex (GPT-5)
- **目的**：`components` を移動した後の import 崩れ修正
- **プロンプト**：
  ```
  componentsを移動したから依存関係を直して
  ```
- **出力サマリ**：`App.tsx` の import を `features/components` に更新し、`BottomNav.tsx` の型 import 相対パスも修正。`npm run build` 成功まで確認。
- **評価**：採用
- **採用 / 不採用の理由**：変更範囲が小さく、ビルド検証込みで安全に修正できたため。

### #002 AGENTS確認とPR作成

- **時刻**：22:40
- **ツール**：Codex (GPT-5) + GitHub CLI
- **目的**：運用ルール確認後に PR 作成
- **プロンプト**：
  ```
  場所間違えてました。それに従ってghコマンドを使用してプルリクを出して
  ```
- **出力サマリ**：`gh pr create` で PR #30 を作成。本文崩れがあったため `gh pr edit` で修正。
- **評価**：採用
- **採用 / 不採用の理由**：PR 作成自体は完了し、最終的に本文もルール準拠へ修正できたため。

### #003 npm ciエラー原因切り分け

- **時刻**：23:15
- **ツール**：Codex (GPT-5)
- **目的**：`npm ci` エラーの原因説明
- **プロンプト**：
  ```
  npm error code EUSAGE ... The `npm ci` command can only install with an existing package-lock.json ...
  ```
- **出力サマリ**：ルートではなく `app/` に `package-lock.json` がある構成を特定し、`cd app && npm ci` を案内。
- **評価**：採用
- **採用 / 不採用の理由**：実行パス誤りが根因で、再現性のある対処ができたため。

---

## Day 2（2026-05-25）

### #004 Vite importエラー調査と復旧

- **時刻**：08:00
- **ツール**：Codex (GPT-5)
- **目的**：`react-router-dom` 解決失敗エラーの修正
- **プロンプト**：
  ```
  [plugin:vite:import-analysis] Failed to resolve import "react-router-dom" from "src/main.tsx".
  ```
- **出力サマリ**：依存自体は存在し、実際は `node_modules/vite/.../node.js` 破損（不正文字列）を特定。`npm ci` 再実行で復旧、`npm run build` 成功確認。
- **評価**：採用
- **採用 / 不採用の理由**：症状と根因が異なるケースを切り分けでき、環境復旧まで完了したため。

### #005 Issue確認と対象決定

- **時刻**：08:20
- **ツール**：Codex (GPT-5) + GitHub CLI
- **目的**：着手 Issue の明確化
- **プロンプト**：
  ```
  isssueをまず取得してください
  ```
- **出力サマリ**：`gh issue list` で open issue 一覧取得。`#5 feature: char-01 偏愛登録画面UI` へ着手決定。
- **評価**：採用
- **採用 / 不採用の理由**：実装前にタスク対象を明確化できたため。

### #006 char-01実装方針の調整

- **時刻**：08:35
- **ツール**：Codex (GPT-5)
- **目的**：変更量を抑えた差し替え方針への変更
- **プロンプト**：
  ```
  addpassionは編集せず、routerが呼び出すのを今実装したadd passion formに差し替えることで変更の量を減らせませんか？
  ```
- **出力サマリ**：`AddPassion.tsx` を復元し、`App.tsx` の `/passions/new` で `AddPassionForm` を直接呼ぶ形へ変更。
- **評価**：採用
- **採用 / 不採用の理由**：既存ページへの影響を減らしつつ、feature分離を維持できたため。

### #007 Firestore保存への切り替え

- **時刻**：08:50
- **ツール**：Codex (GPT-5)
- **目的**：`AGENTS.md` のデータ構造に合わせて `passions` 保存を Firestore 化
- **プロンプト**：
  ```
  その上で、提供されたデータ構造に従ってpassionをfirebaseに登録できるように変更してください
  ```
- **出力サマリ**：`createPassionInFirestore` を追加し、`ownerUid/title/description/tags/embedding/createdAt/visibility` を `passions` へ登録。フォーム submit は async 対応。
- **評価**：採用
- **採用 / 不採用の理由**：Issue要件（Firebase登録）に直結する実装で、ビルド確認まで完了したため。

### #008 Tailwind適用状況の確認

- **時刻**：09:05
- **ツール**：Codex (GPT-5)
- **目的**：Tailwind 利用方針の確認
- **プロンプト**：
  ```
  tailwind使ってください
  ```
- **出力サマリ**：`@tailwindcss/vite` プラグイン、`index.css` の `@import "tailwindcss"`、`ChatBubble.tsx` の Tailwind クラスを確認。現状すでに Tailwind で実装されている箇所を明示。
- **評価**：採用
- **採用 / 不採用の理由**：追加実装の前に現状把握を行い、重複作業を防げたため。

### #009 char_makingのTailwind化

- **時刻**：09:20
- **ツール**：Codex (GPT-5)
- **目的**：`features/charcter_making` のフォームUIを Tailwind クラスへ移行
- **プロンプト**：
  ```
  charmakingをtailwindに書き換えて
  ```
- **出力サマリ**：`AddPassionForm.tsx` を `panel/form-panel/field` 依存から脱却し、入力欄・タグ追加・公開範囲・送信ボタンを Tailwind クラスで再構成。ビルド成功を確認。
- **評価**：採用
- **採用 / 不採用の理由**：要求範囲（charmaking）に限定して UI を Tailwind 化できたため。

### #010 Issue #5 のPR発行

- **時刻**：09:40
- **ツール**：Codex (GPT-5) + GitHub CLI
- **目的**：Issue #5 実装内容を dev 向けに提出
- **プロンプト**：
  ```
  プルリクエスト発行して
  ```
- **出力サマリ**：`feature/5-make-passion` から `dev` へ PR #44 を作成。本文に変更点と `Close #5` を記載。
- **評価**：採用
- **採用 / 不採用の理由**：レビュー可能な形で作業成果を共有できたため。

### #011 Issue #6 AI深掘り対話（ダミー）実装

- **時刻**：10:10
- **ツール**：Codex (GPT-5)
- **目的**：卵作成後に AI チャットへ遷移し、会話履歴を `passions` 直下へ保存
- **プロンプト**：
  ```
  6を解決しよう。
  卵を作成ボタンを押すと、aichatに移動します。ここでは、cloud functionsを用いて後々gpt apiを叩きますが、一旦そこはダミーでじっそうしてください。会話履歴はfirebaseのpassion直下にチャット履歴フィールドを作成してください。
  ```
- **出力サマリ**：`/passions/:passionId/aichat` 画面を追加。`generatePassionReply` callable function（ダミー応答）を実装。`passions/{passionId}` に `chatHistory` 配列を保存する repository を追加し、送受信ごとに更新。
- **評価**：採用
- **採用 / 不採用の理由**：Issue要件（遷移・Functions利用・passion直下履歴保存）を満たし、フロント/Functionsともビルド成功したため。

---

## Day 3（2026-05-26）

### #00X

---
