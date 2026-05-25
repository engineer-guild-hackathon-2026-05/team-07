# AI 活用ログ — Team {{TEAM_NUMBER}}

> 記入者: WAKAMIYA（ChatGPTで記入）

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

### #012 dev起点でのブランチ再構成とPR提出

- **時刻**：10:30
- **ツール**：Codex (GPT-5) + GitHub CLI
- **目的**：未マージPR依存を避けるため、dev起点ブランチでIssue #6を提出
- **プロンプト**：
  ```
  実行してください
  ```
- **出力サマリ**：`feat/6-add-passion-aichat` で差分をコミット・pushし、PR #45 を作成。本文崩れを修正して `Close #6` を保持。
- **評価**：採用
- **採用 / 不採用の理由**：差分の独立性が高まり、レビューしやすいPRとして提出できたため。

### #013 依存Issue未マージ時のPR運用修正

- **時刻**：10:45
- **ツール**：Codex (GPT-5) + GitHub CLI
- **目的**：#6 が #5 に依存する前提へPR運用を修正
- **プロンプト**：
  ```
  変更して欲しいし、#5の変更内容マージされてないのに#6実装して良かったの？そこが問題だったのではないの？
  ```
- **出力サマリ**：PR #45 を Draft 化し、base を `dev` から `feature/5-make-passion` へ変更（stacked PR化）。
- **評価**：採用
- **採用 / 不採用の理由**：依存関係をPR構造に反映でき、レビュー順序を明確化できたため。

### #014 #5取り込み時の競合解消

- **時刻**：11:00
- **ツール**：Codex (GPT-5) + Git
- **目的**：`feature/5-make-passion` 取り込み時のコンフリクト解消
- **プロンプト**：
  ```
  This branch has conflicts that must be resolved
  ...
  app/src/lib/passionRepository.ts
  app/src/pages/AddPassion.tsx
  app/src/types/firestore.ts
  ```
- **出力サマリ**：3ファイルの競合を解消。#5の構造（`AddPassionForm`/`useAddPassion`）を維持しつつ、#6要件（aichat遷移、chatHistory保持）を統合。`app` ビルド成功確認。
- **評価**：採用
- **採用 / 不採用の理由**：依存ブランチの変更と#6実装を両立した形で整合性を回復できたため。

### #015 FunctionsでOpenAI接続を実装

- **時刻**：12:20
- **ツール**：Codex (GPT-5)
- **目的**：Cloud Functions のダミー応答を GPT API 実接続へ切り替え
- **プロンプト**：
  ```
  functionsを立てます。apikeyを発行したので、これから実際にaiと接続します。
  使うのはGPTのapiです
  ```
- **出力サマリ**：`functions/src/index.ts` に `generatePassionReply` callable を実装。`OPENAI_API_KEY` と `OPENAI_MODEL` を参照し、OpenAI Responses APIへ問い合わせて返答を返す構成に変更。`npm run build` 成功確認。
- **評価**：採用
- **採用 / 不採用の理由**：既存クライアント導線を維持したまま本番API接続へ移行できたため。

### #016 作成/育成で共通API+JSONプロンプト化

- **時刻**：12:45
- **ツール**：Codex (GPT-5)
- **目的**：キャラクター作成と育成で同一 Cloud Functions を使い、プロンプトをJSON分離
- **プロンプト**：
  ```
  キャラクター作成部分と、キャラクター育成部分で、それぞれおなじAPIを叩きたいので、プロンプトをjsonで別ファイルに準備して、同じcloud functionsを叩けるようにしたいな
  ```
- **出力サマリ**：`functions/src/prompts/character_making.json` と `character_growing.json` を追加。共通 callable `generateAiReply` を実装し `promptType` でJSONプロンプトを切替。互換用に `generatePassionReply` も維持。フロントに共通クライアント `src/lib/aiReply.ts` を追加し、`CharacterChat` から `promptType=character_growing` で呼び出すよう変更。
- **評価**：採用
- **採用 / 不採用の理由**：プロンプト管理の一元化と機能間の再利用性が上がり、Functions/フロントともビルド成功したため。

### #003 コミット整理と新規Issue作成

- **時刻**：13:10
- **ツール**：Codex (GPT-5) + GitHub CLI
- **目的**：コミット運用整理と、キャラクター作成（偏愛登録/偏愛深掘り）Issueの起票
- **プロンプト**：
  ```
  WAKAMIYA.mdちゃんと更新してくださいねー！
  それでは、issueを立てます。
  キャラクター作成の、偏愛登録と偏愛深掘りを実装するissueを立ててください
  ```
- **出力サマリ**：AI usage log を更新した上で、偏愛登録 + 偏愛深掘りを対象にした実装IssueをGitHubで作成。
- **評価**：採用
- **採用 / 不採用の理由**：運用ルールとタスク管理を同時に満たせたため。

### #004 偏愛深掘り機能の実装方針整理

- **時刻**：13:25
- **ツール**：Codex (GPT-5)
- **目的**：実装前に偏愛深掘り機能の方針と追加機能を明文化
- **プロンプト**：
  ```
  それでは、偏愛深掘り機能を実装します。
  実装方針と追加する機能を先に説明してください。
  ```
- **出力サマリ**：共通 Cloud Functions API `generateAiReply` を `promptType=character_making` で利用する方針を提示。追加機能として、深掘りチャットUI、会話履歴保存（`passions/{passionId}.chatHistory`）、卵生成導線（1ユーザー1卵制限）を整理。
- **評価**：採用
- **採用 / 不採用の理由**：実装前にスコープと責務分割を共有でき、作業の手戻りを減らせるため。

### #005 偏愛深掘り機能の実装

- **時刻**：13:45
- **ツール**：Codex (GPT-5)
- **目的**：偏愛登録後にAI深掘りチャットへ遷移し、会話履歴を保存する
- **プロンプト**：
  ```
  では実装してください
  ```
- **出力サマリ**：`AddPassion` 送信後に `passionId` を使って `/passions/:passionId/aichat` へ遷移。`PassionAiChat` 画面を追加し、`generateAiReply(promptType=character_making)` で応答取得。`passions/{passionId}.chatHistory` へ会話履歴を保存。`PassionDoc` 型にも `chatHistory` を追加。`app` と `functions` のビルド成功確認。
- **評価**：採用
- **採用 / 不採用の理由**：Issue #50 の深掘り導線に必要な機能を一式実装できたため。

### #006 セキュリティ指摘への是正対応

- **時刻**：14:10
- **ツール**：Codex (GPT-5)
- **目的**：セキュリティレビュー指摘（認証必須化・情報露出抑制・ルール強化）を修正
- **プロンプト**：
  ```
  修正してください
  ```
- **出力サマリ**：`generateAiReply` / `generatePassionReply` に認証必須チェックを追加。OpenAIエラー詳細をクライアントへ返さないよう変更し、詳細はFunctionsログへ出力。`passions` の Firestore Rules に許可フィールドと型/件数制約を追加。`chatHistory` 更新を `runTransaction` 化して競合耐性を強化。`app` / `functions` ビルド成功確認。
- **評価**：採用
- **採用 / 不採用の理由**：高優先の課金悪用リスクと情報露出リスクを先に潰し、データ整合性も向上できたため。

---

## Day 3（2026-05-26）

### #001 セキュリティ調査

- **時刻**：14:30
- **ツール**：GitHub Copilot
- **目的**：アプリ全体のセキュリティ設計と実装状況を確認する
- **プロンプト**：
  ```
  このアプリケーションのセキュリティを調査してください。
  usage log wakamiya.mdの中に、もともと入っている文章のフォーマットに倣って情報を追加してください。あなたの名前も書いてください
  ```
- **出力サマリ**：
  - `app/firestore.rules` は認証必須を前提とし、`users` / `passions` / `chats` を本人判定、`eggs` / `characters` / `exchanges` は作成・更新を Cloud Functions のみ許可する設計。クライアントからの不正な `create` / `delete` を原則拒否している。
  - `app/src/firebase/auth.ts` では Google / 匿名 /デモログインを提供し、Firebase Auth で認証したユーザーのみ `users/{uid}` を作成・更新する構造。`useAuth` では `ensureUserDocument` による Firestore 書き込みもあり、Firestore ルールとの整合性が重要。
  - `app/functions/src/index.ts` の OpenAI 呼び出しは `process.env.OPENAI_API_KEY` を参照し、秘密鍵を Cloud Functions 実行環境に閉じる実装。クライアント側に API キーが流出しない点は良好。
  - ただし `firebaseConfig` が `app/src/firebase/firebase.ts` にベタ書きされており、Firebase プロジェクトIDなどは公開クライアント設定として扱われるため、機密情報は `.env` に分離する運用が望ましい。
- **評価**：不採用
- **採用 / 不採用の理由**：
ログの追記のみでセキュリティに関する出力がなかった。

---

### #002 functions/.env のGit管理除外

- **時刻**：14:40
- **ツール**：Codex (GPT-5)
- **目的**：`functions/.env` を誤ってコミットしないようにする
- **プロンプト**：
  ```
  functions .envをgit ignore
  ```
- **出力サマリ**：`app/functions/.gitignore` に `.env` と `.env.*` を追加し、Functions用環境変数ファイルをGit管理対象外に設定。
- **評価**：採用
- **採用 / 不採用の理由**：APIキーなど機微情報の漏洩リスクを下げる基本対策のため。

---

### #003 Functions deploy失敗（lint）への対処

- **時刻**：14:55
- **ツール**：Codex (GPT-5)
- **目的**：`firebase deploy --only functions` の predeploy lint エラーを解消
- **プロンプト**：
  ```
  firebase deploy --only functions
  ...
  Invalid option '--ext' ... You're using eslint.config.js ...
  ```
- **出力サマリ**：`functions/package.json` の lint スクリプトを `ESLINT_USE_FLAT_CONFIG=false` 付きに修正し、さらに `functions/src/index.ts` と `functions/src/types/firestore.ts` の lint違反（JSDoc/spacing）を修正。`npm --prefix functions run lint` で成功確認。
- **評価**：採用
- **採用 / 不採用の理由**：デプロイ前チェックが通る状態を再現できたため。

---

### #004 AIチャット internal 調査のためのエラー可視化

- **時刻**：16:30
- **ツール**：Codex (GPT-5)
- **目的**：`internal` エラー原因をフロントで即時判別できるようにする
- **プロンプト**：
  ```
  変えて
  mdも忘れずにねー
  ```
- **出力サマリ**：`app/src/pages/PassionAiChat.tsx` の `catch` を変更し、`console.error(error)` と `error.message` を画面表示するように修正。Functions 側が返す `unauthenticated` / `failed-precondition` / `internal` などの差分をクライアントで直接確認できる状態にした。
- **評価**：採用
- **採用 / 不採用の理由**：Network/Functionsログだけで切り分けが進まない状況で、デバッグ速度を上げる実用的な改善になったため。

---

### #005 Functions Emulator 接続の導入

- **時刻**：16:55
- **ツール**：Codex (GPT-5)
- **目的**：本番デプロイ前にローカルで callable function を検証できるようにする
- **プロンプト**：
  ```
  エミュレーター繋いで欲しい
  ```
- **出力サマリ**：`src/firebase/firebase.ts` で `functions` を `asia-northeast1` 固定生成し、`import.meta.env.DEV` 時に `connectFunctionsEmulator(functions, "127.0.0.1", 5001)` を適用。`src/lib/aiReply.ts` と `src/lib/passionAi.ts` は個別 `getFunctions` を廃止して共通 `functions` インスタンスを参照するよう統一。
- **評価**：採用
- **採用 / 不採用の理由**：開発時の通信先が明示され、internalエラーの再現と切り分けをローカルで安全に実施できるため。

---

### #006 OpenAIレスポンス解析の補強

- **時刻**：17:10
- **ツール**：Codex (GPT-5)
- **目的**：`OpenAI API から応答を取得できませんでした。` エラーの解消
- **プロンプト**：
  ```
  PassionAiChat.tsx:66 FirebaseError: OpenAI API から応答を取得できませんでした。
  ```
- **出力サマリ**：`functions/src/index.ts` のレスポンス解析を修正し、`output_text` だけでなく `output[].content[].text` からも返答を抽出するように変更。空応答判定の取りこぼしを防止。
- **評価**：採用
- **採用 / 不採用の理由**：OpenAI Responses API の返却形式差分に対応でき、internalエラーの再発防止につながるため。

---

### #007 本番向けエラーメッセージ表示へ復元

- **時刻**：17:20
- **ツール**：Codex (GPT-5)
- **目的**：デバッグ用の詳細エラー露出をやめ、本番向けUIに戻す
- **プロンプト**：
  ```
  じゃあ、本番環境用に戻して
  ```
- **出力サマリ**：`app/src/pages/PassionAiChat.tsx` の `catch` を復元し、`console.error` と `error.message` の直接表示を廃止。ユーザー向けには固定文言（再試行案内）のみ表示する実装に戻した。
- **評価**：採用
- **採用 / 不採用の理由**：内部エラー情報の露出を防ぎ、UXとセキュリティのバランスを本番運用向けに戻せたため。

---

### #008 OpenAIレスポンス抽出ロジックの再強化

- **時刻**：17:35
- **ツール**：Codex (GPT-5)
- **目的**：`internal` 発生時にテキスト抽出漏れで失敗しないようにする
- **プロンプト**：
  ```
  直してください
  ```
- **出力サマリ**：`functions/src/index.ts` に `extractReplyText` を追加し、`output_text` だけでなく `output[].content[].text` や `refusal` も含めて返信文を抽出するよう改善。抽出不可時は診断用ログを残しつつ、クライアントには汎用エラーメッセージを返す実装へ統一。
- **評価**：採用
- **採用 / 不採用の理由**：OpenAI Responses API の返却バリエーションによる取りこぼしを減らし、500/internal の再発抑制に寄与するため。

---

### #009 Functions接続先を本番固定に変更

- **時刻**：17:55
- **ツール**：Codex (GPT-5)
- **目的**：ローカル開発中でも Emualtor ではなく本番 Functions を呼び出す
- **プロンプト**：
  ```
  エミュレーターじゃない方叩くようにして欲しい
  ```
- **出力サマリ**：`src/firebase/firebase.ts` から `connectFunctionsEmulator` を削除し、`functions = getFunctions(app, "asia-northeast1")` のみ残す形に変更。`import.meta.env.DEV` 時の自動エミュレータ接続を停止。
- **評価**：採用
- **採用 / 不採用の理由**：`ERR_CONNECTION_REFUSED` の原因だったローカル接続先（127.0.0.1:5001）への依存を解消できたため。

---

### #010 タスク単位コミット運用の明示対応

- **時刻**：18:10
- **ツール**：Codex (GPT-5)
- **目的**：実装差分を作業単位で分割し、レビューしやすい履歴を維持する
- **プロンプト**：
  ```
  作業ごとに分けてコミットしてください。こういうのも全部usageに記録して欲しい
  ```
- **出力サマリ**：未コミット差分を確認し、生成物（`.firebase/**`）を除外したうえで、`functions修正` / `接続先変更` / `usage log更新` の単位でコミット分割する方針を適用。
- **評価**：採用
- **採用 / 不採用の理由**：差分の責務が明確になり、PRレビュー時の確認コストを下げられるため。

---
