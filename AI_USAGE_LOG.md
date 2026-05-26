# AI 活用ログ — Team 07（統合版）

審査項目「AI 活用度」の根拠資料。Day1〜Day3 を通して、AI ツールをどう使ったかを記録する。  
**メンバー別ログ（`docs/ai_usage_logs/`）を時系列順に統合したもの。**  
（SHIMMEN / WAKAMIYA / YOSHIMURA=@aoi0814）

## 記入ルール

- 開発の節目ごとに追記する（5 分単位で書くより、機能/論点単位で書く）
- プロンプトは「実際に投げた文」を残す（要約は審査時に減点要因になりうる）
- 出力評価は **採用 / 一部採用 / 不採用** の 3 値で正直に
- 「採用しなかった理由」も書くと AI 活用の判断力アピールになる

---

## Day 1（2026-05-24）

### #001 components移動後の依存修正

- **時刻**：22:30
- **担当者**：WAKAMIYA
- **ツール**：Codex (GPT-5)
- **目的**：`components` を移動した後の import 崩れ修正
- **プロンプト**：
  ```
  componentsを移動したから依存関係を直して
  ```
- **出力サマリ**：`App.tsx` の import を `features/components` に更新し、`BottomNav.tsx` の型 import 相対パスも修正。`npm run build` 成功まで確認。
- **評価**：採用
- **採用の理由**：変更範囲が小さく、ビルド検証込みで安全に修正できたため。

---

### #002 AGENTS確認とPR作成

- **時刻**：22:40
- **担当者**：WAKAMIYA
- **ツール**：Codex (GPT-5) + GitHub CLI
- **目的**：運用ルール確認後に PR 作成
- **プロンプト**：
  ```
  場所間違えてました。それに従ってghコマンドを使用してプルリクを出して
  ```
- **出力サマリ**：`gh pr create` で PR #30 を作成。本文崩れがあったため `gh pr edit` で修正。
- **評価**：採用
- **採用の理由**：PR 作成自体は完了し、最終的に本文もルール準拠へ修正できたため。

---

### #003 Firestore データモデルの型定義実装（issue #20）

- **時刻**：22:50
- **担当者**：SHIMMEN
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
  - `app/functions/src/types/firestore.ts` にミラーファイルを配置
  - `app/functions/src/index.ts` の未使用 import を修正（`noUnusedLocals` によるコンパイルエラー解消）
  - `tsc --noEmit` 両プロジェクトでエラーなしを確認
- **評価**：採用
- **採用の理由**：型・定数・JSDoc コメントの構造が仕様書と 1:1 で対応しており、チームが即使用できる状態だった

---

### #004 コミット・PR 作成

- **時刻**：22:56
- **担当者**：SHIMMEN
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

### #005 npm ciエラー原因切り分け

- **時刻**：23:15
- **担当者**：WAKAMIYA
- **ツール**：Codex (GPT-5)
- **目的**：`npm ci` エラーの原因説明
- **プロンプト**：
  ```
  npm error code EUSAGE ... The `npm ci` command can only install with an existing package-lock.json ...
  ```
- **出力サマリ**：ルートではなく `app/` に `package-lock.json` がある構成を特定し、`cd app && npm ci` を案内。
- **評価**：採用
- **採用の理由**：実行パス誤りが根因で、再現性のある対処ができたため。

---

### #024 UI/UX担当の着手・ローカルMVP計画

- **時刻**：21:15
- **担当者**：YOSHIMURA (@aoi0814)
- **ツール**：Cursor（Composer）
- **目的**：ハッカソン初日に UI/UX 担当として何から着手すべきか整理し、コストをかけずに動く画面を作る
- **プロンプト**：
  ```
  今このプログラムで何をしていくべきか教えて
  ```
  ```
  UI/UXローカルMVP実装計画

  Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

  To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.
  ```
- **出力サマリ**：リポジトリ構成と Issue 一覧を読み取り、ローカル MVP 計画に沿って画面分割・QR 交換 UI・モックデータの土台を実装。
- **評価**：採用
- **採用の理由**：Firebase 課金を避けつつ、チームが並行開発できる UI 骨格を初日のうちに用意できたため。

---

### #025 ux-02 QR・未実装UIの追加

- **時刻**：23:01
- **担当者**：YOSHIMURA (@aoi0814)
- **ツール**：Cursor（Composer）
- **目的**：交換フローの UX 完成度を上げ、カメラ読み取りと自分の QR 同時表示を実装する
- **プロンプト**：
  ```
  UI/UXのところでまだ実装できてない部分を教えてほしいのとそこを実装してほしい。
  あと、QRの部分は、自分がQRを読み込む部分、つまりカメラを実装してほしい。
  ```
  ```
  なんでこのブラウザではカメラは使えないの？あとカメラ画面と自分のQRは一緒に表示されるようにして。操作性、可視性とかも意識すること。
  ```
- **出力サマリ**：`Exchange` 画面に QR スキャナと自分の QR 表示を同居させるレイアウトを追加。HTTPS / localhost 制約を説明。
- **評価**：一部採用
- **採用しなかった理由**：デスクトップブラウザではカメラ API 制約があり実機検証が別途必要。レイアウト方針（カメラ＋自分の QR 同時表示）は採用。

---

## Day 2（2026-05-25）

### #006 AI 活用ログ記録

- **時刻**：00:31
- **担当者**：SHIMMEN
- **ツール**：Claude Code（claude-sonnet-4-6）
- **目的**：Day 1 の実装内容を ai_usage_logs に機能・論点単位でまとめる
- **プロンプト**：
  ```
  ここまでの実装内容を、docs/ai_usage_logs にまとめてください。
  機能・論点単位でまとめ、プロンプトは私が渡したものを記録してください。
  時刻も取得できるのあれば正確に記録してください。
  ```
- **出力サマリ**：`docs/ai_usage_logs/SHIMMEN.md` を PULL_REQUEST_TEMPLATE.md の書式に準じた形式で記録
- **評価**：採用
- **採用の理由**：機能・設計判断・コミットを別エントリに分け、実際のプロンプトを省略せず記録できた

---

### #007 Issue #14 キャラクター育成レイアウト実装

- **時刻**：01:00
- **担当者**：SHIMMEN
- **ツール**：Claude Code（claude-sonnet-4-6）
- **目的**：`/characters/:characterId` でキャラクターと会話できる育成画面のレイアウトを実装する。Tailwind CSS・React Router のセットアップも合わせて行う
- **プロンプト**：
  ```
  以下のissue を実装してください。

  ## やりたいこと
  キャラクター育成画面（/characters/:characterId）を実装する。

  ## タスク
  - app/src/features/配下にcharacter-growing ディレクトリを作成し、そこで実装を行ってください
  - React Router で /characters/:characterId ルートを追加
  - Tailwind CSS のセットアップ（@tailwindcss/vite プラグイン）
  - キャラクター選択・表示・ルーティングの基盤実装
  - localStorage によるチャット履歴の永続化（Firestore 移行まで）
  ```
- **出力サマリ**：
  - `app/vite.config.ts` に `@tailwindcss/vite` プラグイン追加
  - `app/src/index.css` に `@import "tailwindcss"` と `@theme` ブロック（デザイントークン）追加
  - `app/src/features/character-growing/` ディレクトリを作成し、`CharacterAvatar` / `ChatBubble` / `ChatInput` コンポーネントを実装
  - `app/src/pages/CharacterDetail.tsx` を新規作成
  - `main.tsx` に `BrowserRouter` を追加、React Router で `/characters/:characterId` ルート設定
  - PR #36 作成 → dev へマージ
- **評価**：採用
- **採用の理由**：Tailwind v4 のセットアップ（`@import "tailwindcss"` ディレクティブ）やルーティング構成が既存コードを壊さず統合されており、そのまま採用できる状態だった

---

### #008 Issue #15 キャラクターチャットUI実装・UI調整

- **時刻**：04:30
- **担当者**：SHIMMEN
- **ツール**：Claude Code（claude-sonnet-4-6）
- **目的**：grow-02 として定義されたキャラクターチャットUIを実装する。アバター表示・チャット送信・ローディング・履歴モーダルを含む
- **プロンプト**：
  ```
  以下のissue を実装してください。（grow-02 キャラクターチャットUI）

  ## やりたいこと
  キャラクターとチャットできる画面を実装する

  ## タスク
  - CharacterChat コンポーネントを作成（チャット送信・AI返信モック・履歴保持）
  - CharacterAvatar を char_blue_transparent.png・親密度ハートバッジ・ステータスモーダルで再設計
  - ChatInput に disabled prop 追加（AI応答中はグレーアウト）
  - ローディング中の「考え中」表示
  - 会話履歴をモーダルで表示（履歴ボタンから開く）
  - localStorage でチャット履歴を永続化
  ```
- **出力サマリ**：
  - `app/src/components/CharacterChat.tsx` を新規作成。メッセージ送受信・900ms モック遅延・localStorage 永続化を実装
  - `CharacterAvatar` を `char_blue_transparent.png` 使用・親密度ハートバッジ・ステータスモーダル付きに更新
  - `ChatInput` に `disabled` prop 追加
  - 会話履歴モーダルをスクロール対応で実装
  - PR #43 作成 → dev へマージ
  - その後ユーザー指摘による修正を複数回実施（以下）：
    - 「キャラクターはchar_blue_transparent.pngを用いるようにし、画像に縁や影を付けないでください。また、キャラクターのステータスボタンの下に横線とチャット画面が表示されているので、どちらも削除してください。チャット画面は履歴ボタンから確認できるようにします。」
    - 「キャラクターは画面中央に配置してください。現在は上すぎます。また、もう少しキャラクターを大きくしてください。閉じるボタンは色が薄いのでもっと濃くしてください。会話履歴モーダルの縦の長さの最小値ももう少し大きくしてください。」
- **評価**：一部採用
- **採用しなかった理由**：初出力では画像にドロップシャドウが付いていた・メイン画面にチャット履歴が表示されていた・キャラクターの配置が上寄りすぎるなど UI の細部で複数回修正が必要だった。ロジック（localStorage 永続化・モック遅延・状態管理）は初回から採用

---

### #009 キャラクター返信吹き出し実装

- **時刻**：05:45（再実装：13:05）
- **担当者**：SHIMMEN
- **ツール**：Claude Code（claude-sonnet-4-6）
- **目的**：キャラクターの返信をキャラクター名の上に吹き出しとして表示し、一定時間後にフェードアウトさせる
- **プロンプト**：
  ```
  追加で修正点です。ユーザがメッセージを送信したとき、キャラクターからの返信を吹き出しとして表示してください。
  吹き出しは、キャラクターが話しているようにややキャラクターに重ねてください。
  また、ローディングの「考え中」はその吹き出しの中に表示してください。
  ```
  （追加指示）
  ```
  吹き出しはキャラクターの名前の上に表示するようにし、吹き出しのとがった部分は中央下向きにしてください。
  また、吹き出しは一定時間でフェードアウトするようにしてください。
  ```
  （コンフリクト後の再実装依頼）
  ```
  コンフリクトにより変更が消えてしまったので、キャラクター返信の吹き出しやフェードアウト、
  「考え中」のローディングを吹き出しの中に表示する機能を実装し直してください。
  ```
- **出力サマリ**：
  - `CharacterChat.tsx` に `lastCharReply` / `replyFading` state を追加
  - 吹き出しをキャラクター名の上（flex 列の上部）に配置、テールを `left-1/2 -translate-x-1/2` で中央下向きに
  - ローディング中は「考え中 ●●●」アニメーション、返信到着後は返信テキストを同じ吹き出し内に表示
  - `useEffect` で返信表示から 3 秒後にフェードアウト開始、4.2 秒で DOM から除去
  - 旧 `LoadingBubble` コンポーネントを削除し吹き出しに統合
  - PR #48 作成 → dev へマージ
- **評価**：採用
- **採用の理由**：吹き出し位置・テール向き・フェードアウトのタイミングが 2 度の追加指示で希望通りに収束した。コンフリクトによる消失は開発フローの問題であり実装品質には影響なし

---

### #010 Vite importエラー調査と復旧

- **時刻**：08:00
- **担当者**：WAKAMIYA
- **ツール**：Codex (GPT-5)
- **目的**：`react-router-dom` 解決失敗エラーの修正
- **プロンプト**：
  ```
  [plugin:vite:import-analysis] Failed to resolve import "react-router-dom" from "src/main.tsx".
  ```
- **出力サマリ**：依存自体は存在し、実際は `node_modules/vite/.../node.js` 破損（不正文字列）を特定。`npm ci` 再実行で復旧、`npm run build` 成功確認。
- **評価**：採用
- **採用の理由**：症状と根因が異なるケースを切り分けでき、環境復旧まで完了したため。

---

### #011 Issue確認と対象決定

- **時刻**：08:20
- **担当者**：WAKAMIYA
- **ツール**：Codex (GPT-5) + GitHub CLI
- **目的**：着手 Issue の明確化
- **プロンプト**：
  ```
  isssueをまず取得してください
  ```
- **出力サマリ**：`gh issue list` で open issue 一覧取得。`#5 feature: char-01 偏愛登録画面UI` へ着手決定。
- **評価**：採用
- **採用の理由**：実装前にタスク対象を明確化できたため。

---

### #012 char-01実装方針の調整

- **時刻**：08:35
- **担当者**：WAKAMIYA
- **ツール**：Codex (GPT-5)
- **目的**：変更量を抑えた差し替え方針への変更
- **プロンプト**：
  ```
  addpassionは編集せず、routerが呼び出すのを今実装したadd passion formに差し替えることで変更の量を減らせませんか？
  ```
- **出力サマリ**：`AddPassion.tsx` を復元し、`App.tsx` の `/passions/new` で `AddPassionForm` を直接呼ぶ形へ変更。
- **評価**：採用
- **採用の理由**：既存ページへの影響を減らしつつ、feature分離を維持できたため。

---

### #013 Firestore保存への切り替え

- **時刻**：08:50
- **担当者**：WAKAMIYA
- **ツール**：Codex (GPT-5)
- **目的**：`AGENTS.md` のデータ構造に合わせて `passions` 保存を Firestore 化
- **プロンプト**：
  ```
  その上で、提供されたデータ構造に従ってpassionをfirebaseに登録できるように変更してください
  ```
- **出力サマリ**：`createPassionInFirestore` を追加し、`ownerUid/title/description/tags/embedding/createdAt/visibility` を `passions` へ登録。フォーム submit は async 対応。
- **評価**：採用
- **採用の理由**：Issue要件（Firebase登録）に直結する実装で、ビルド確認まで完了したため。

---

### #014 Tailwind適用状況の確認

- **時刻**：09:05
- **担当者**：WAKAMIYA
- **ツール**：Codex (GPT-5)
- **目的**：Tailwind 利用方針の確認
- **プロンプト**：
  ```
  tailwind使ってください
  ```
- **出力サマリ**：`@tailwindcss/vite` プラグイン、`index.css` の `@import "tailwindcss"`、`ChatBubble.tsx` の Tailwind クラスを確認。現状すでに Tailwind で実装されている箇所を明示。
- **評価**：採用
- **採用の理由**：追加実装の前に現状把握を行い、重複作業を防げたため。

---

### #015 char_makingのTailwind化

- **時刻**：09:20
- **担当者**：WAKAMIYA
- **ツール**：Codex (GPT-5)
- **目的**：`features/charcter_making` のフォームUIを Tailwind クラスへ移行
- **プロンプト**：
  ```
  charmakingをtailwindに書き換えて
  ```
- **出力サマリ**：`AddPassionForm.tsx` を `panel/form-panel/field` 依存から脱却し、入力欄・タグ追加・公開範囲・送信ボタンを Tailwind クラスで再構成。ビルド成功を確認。
- **評価**：採用
- **採用の理由**：要求範囲（charmaking）に限定して UI を Tailwind 化できたため。

---

### #016 Issue #5 のPR発行

- **時刻**：09:40
- **担当者**：WAKAMIYA
- **ツール**：Codex (GPT-5) + GitHub CLI
- **目的**：Issue #5 実装内容を dev 向けに提出
- **プロンプト**：
  ```
  プルリクエスト発行して
  ```
- **出力サマリ**：`feature/5-make-passion` から `dev` へ PR #44 を作成。本文に変更点と `Close #5` を記載。
- **評価**：採用
- **採用の理由**：レビュー可能な形で作業成果を共有できたため。

---

### #017 Issue #6 AI深掘り対話（ダミー）実装

- **時刻**：10:10
- **担当者**：WAKAMIYA
- **ツール**：Codex (GPT-5)
- **目的**：卵作成後に AI チャットへ遷移し、会話履歴を `passions` 直下へ保存
- **プロンプト**：
  ```
  6を解決しよう。
  卵を作成ボタンを押すと、aichatに移動します。ここでは、cloud functionsを用いて後々gpt apiを叩きますが、一旦そこはダミーでじっそうしてください。会話履歴はfirebaseのpassion直下にチャット履歴フィールドを作成してください。
  ```
- **出力サマリ**：`/passions/:passionId/aichat` 画面を追加。`generatePassionReply` callable function（ダミー応答）を実装。`passions/{passionId}` に `chatHistory` 配列を保存する repository を追加し、送受信ごとに更新。
- **評価**：採用
- **採用の理由**：Issue要件（遷移・Functions利用・passion直下履歴保存）を満たし、フロント/Functionsともビルド成功したため。

---

### #018 dev起点でのブランチ再構成とPR提出

- **時刻**：10:30
- **担当者**：WAKAMIYA
- **ツール**：Codex (GPT-5) + GitHub CLI
- **目的**：未マージPR依存を避けるため、dev起点ブランチでIssue #6を提出
- **プロンプト**：
  ```
  実行してください
  ```
- **出力サマリ**：`feat/6-add-passion-aichat` で差分をコミット・pushし、PR #45 を作成。本文崩れを修正して `Close #6` を保持。
- **評価**：採用
- **採用の理由**：差分の独立性が高まり、レビューしやすいPRとして提出できたため。

---

### #019 依存Issue未マージ時のPR運用修正

- **時刻**：10:45
- **担当者**：WAKAMIYA
- **ツール**：Codex (GPT-5) + GitHub CLI
- **目的**：#6 が #5 に依存する前提へPR運用を修正
- **プロンプト**：
  ```
  変更して欲しいし、#5の変更内容マージされてないのに#6実装して良かったの？そこが問題だったのではないの？
  ```
- **出力サマリ**：PR #45 を Draft 化し、base を `dev` から `feature/5-make-passion` へ変更（stacked PR化）。
- **評価**：採用
- **採用の理由**：依存関係をPR構造に反映でき、レビュー順序を明確化できたため。

---

### #020 #5取り込み時の競合解消

- **時刻**：11:00
- **担当者**：WAKAMIYA
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
- **採用の理由**：依存ブランチの変更と#6実装を両立した形で整合性を回復できたため。

---

### #021 Issue #16 AI返信バックエンド（sendMessage）実装

- **時刻**：18:29
- **担当者**：SHIMMEN
- **ツール**：Claude Code（claude-sonnet-4-6）
- **目的**：キャラクターの `characterPrompt` と過去チャット履歴を踏まえた返答を OpenAI API 経由で生成する Cloud Functions callable を実装する
- **プロンプト**：
  ```
  以下のissue #16 を実装してください。

  ## やりたいこと
  ユーザーメッセージを受け取り、キャラクターの `characterPrompt` と過去履歴を踏まえた応答を生成する。

  ## なぜやるか（解きたい課題）
  - 偏愛キャラとして自然に会話できるバックエンドを構築する
  - キャラの口調・知識の偏りを再現する
  - ユーザがメッセージを送信すると、それに対してAIが返信する

  ## タスク
  - `functions/src/chat/sendMessage.ts` callable を作成
  - 入力: `characterId`, `userMessage`
  - 処理:
    1. caller が currentOwnerUid 一致か確認
    2. `characters/{characterId}` を読み込み、 system prompt に `src/prompts/character_growing.json` の内容をセットする
    3. 直近 N 件のチャット履歴を取得
    4. OpenAI に投げて応答取得
    5. user/assistant の2件を `chats/{chatId}.messages` に追記
    6. (任意) 応答内容から `affinityScore` を微増、後続Issueに渡せる形に
  - レート制限(同一ユーザーが秒間連投できないように)

  ## 完了条件
  - [ ] フロントから送信して、キャラらしい返答が返る
  - [ ] 履歴がFirestoreに残り、ページリロードしても見える
  ```
  （追加指示）
  ```
  keyの名前は"OPENAI_API_KEY"です。.env.localは読み込まないでください。続きをお願いします。
  ```
  （PR作成）
  ```
  プルリクエストを作成してください。.github/PULL_REQUEST_TEMPLATE.mdを参考にしてください。
  ```
- **出力サマリ**：
  - `functions/src/chat/sendMessage.ts` を新規作成。OpenAI Chat Completions API 呼び出し・Firestore へのメッセージ永続化・レート制限を実装
  - `functions/src/admin.ts` に Firebase Admin 初期化を整理
  - `app/src/lib/chatRepository.ts` を新規作成（Firestore のチャット読み書きロジックをクライアント側に配置）
  - PR #53 作成（`feat/16_make_growing_room_ai`）
- **評価**：一部採用
- **採用しなかった理由**：実装完了後のテストで「メッセージがAIに送信されているか」の確認が必要な状態となり、dev へのマージは保留。ロジック自体（Functions callable 構造・Firestore 書き込み）は正しく、後続で統合予定

---

### #022 AI活用ログ追記（Day2 後半分）

- **時刻**：23:38
- **担当者**：SHIMMEN
- **ツール**：Claude Code（claude-sonnet-4-6）
- **目的**：Day 2 後半（#021 以降）の実装内容を ai_usage_logs に追記する
- **プロンプト**：
  ```
  docs/ai_usage_logs/SHIMMEN.mdにclaudeの使用記録を追加したいです。
  ログなどからその内容を時刻・プロンプト含めて追記できますか。
  ```
- **出力サマリ**：セッションログ（.jsonl）と git コミット履歴を照合し、#021〜#022 を SHIMMEN.md に追記。時刻・プロンプトはログから復元
- **評価**：採用
- **採用の理由**：セッションログから実際のプロンプトと時刻を正確に復元でき、要約なしで記録できた

---

### #023 AI_USAGE_LOG.md への時系列統合

- **時刻**：23:45
- **担当者**：SHIMMEN
- **ツール**：Claude Code（claude-sonnet-4-6）
- **目的**：SHIMMEN.md と WAKAMIYA.md の AI 活用ログを時系列順に AI_USAGE_LOG.md へ統合する
- **プロンプト**：
  ```
  app/docs/ai_usage_logs/配下のSHIMMEN.mdとWAKAMIYA.mdに書かれているAi使用ログを、
  AI_USAGE_LOG.mdに時系列順で統合してください。
  統合にAIを用いたこともAI_USAGE_LOG.mdに追加してください。
  ```
- **出力サマリ**：SHIMMEN.md（8件）と WAKAMIYA.md（14件）の計22件を時刻順にソートし、各エントリに `担当者` フィールドを追加して統合。本エントリ（#023）も含め全23件を AI_USAGE_LOG.md に記録
- **評価**：採用
- **採用の理由**：両ファイルの全プロンプト・出力サマリを改変なく保持しつつ、担当者と時刻で一覧化できた

---

### #026 Issue #21 ux-01 Firebase Auth ログイン

- **時刻**：00:37
- **担当者**：YOSHIMURA (@aoi0814)
- **ツール**：Cursor（Composer）
- **目的**：Google / Anonymous ログイン、`users` 初回作成、保護ルートを Issue #21 どおりに実装する
- **プロンプト**：
  ```
  ux-02はまだ実行しないんだけど、
  - **[ux-01] Firebase Authログイン**
      - Google + Anonymous、初回時に `users` を作成、保護ルート対応

  は機能として付け加えたい。
  イメージとして初期画面に画像のようなものを追加してほしい
  ```
- **出力サマリ**：`auth.ts` / `Login.tsx` / `RequireAuth` / `users` 初回作成・Firestore ルールを追加。PR #33 作成。
- **評価**：採用
- **採用の理由**：Issue 完了条件を満たし dev へ提出できたため。

---

### #027 Issue ux-04/05/06 ホーム・プロフィール・画面分割

- **時刻**：01:49
- **担当者**：YOSHIMURA (@aoi0814)
- **ツール**：Cursor（Composer）
- **目的**：ホーム・プロフィール・共通 UI を Issue 単位で実装し、`App.tsx` をページ分割する
- **プロンプト**：
  ```
  ux-04 #24 ホーム画面
  ux-05 #25 プロフィール画面を完璧に実装しよう
  ux-06 #26 デザインシステム整備
  を完璧に実装しよう
  ```
  ```
  UX 04/05/06 完成計画

  Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

  To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.
  ```
- **出力サマリ**：React Router で各ページを分割し、`HeaderBar` / `BottomNav` / 共通 UI コンポーネントを追加。PR #39。
- **評価**：採用
- **採用の理由**：担当 Issue の画面骨格とナビ統合が一度で揃ったため。

---

### #028 Issue ux-06 Tailwind デザインシステム

- **時刻**：04:26
- **担当者**：YOSHIMURA (@aoi0814)
- **ツール**：Cursor（Composer）
- **目的**：色・タイポ・余白・基本コンポーネントの規約を Tailwind で固定する
- **プロンプト**：
  ```
  このissueを解決して
  ## やりたいこと

  Tailwind ベースで、色・タイポ・余白・基本コンポーネントの規約を定める。
  （Button / TextField / TagInput / Card / Modal、`/dev/style` 等）
  ```
- **出力サマリ**：`@theme` トークンと `features/components/ui/`、スタイルガイドページを実装。PR #41 / #42。
- **評価**：採用
- **採用の理由**：他 UI Issue から import できるコンポーネント群が揃ったため。

---

### #029 PC向けUI・交換UX・assets画像活用

- **時刻**：05:18
- **担当者**：YOSHIMURA (@aoi0814)
- **ツール**：Cursor（Composer）
- **目的**：PC 操作性の改善と交換画面の独自 UX（LINE 共有等）を実装する
- **プロンプト**：
  ```
  プログラムをしっかり読んでから、スマホ時にはあの画面でいいんだけど、PCで開くときはあの画面だと操作性が悪いよね？それを修正しよう。
  ```
  ```
  このアプリの良さというか種の目的は、交換という部分にある。交換部分でユニークなアイデアがあれば教えてほしい。例えば「Lineでの共有はこちらから！」みたいなボタンを作るとか
  ```
- **出力サマリ**：PC レイアウト、assets 画像によるキャラ表示、交換画面の LINE 共有ボタンを実装。PR #46。
- **評価**：採用
- **採用の理由**：デバイス別 UX とコア体験（交換）に直結する改善を反映できたため。

---

### #030 デザインシステム統一・ログインGIF

- **時刻**：18:08
- **担当者**：YOSHIMURA (@aoi0814)
- **ツール**：Cursor（Composer）
- **目的**：ボタン・入力の一貫性向上と dead code 除去、ログインの動きあるヒーロー
- **プロンプト**：
  ```
  features/components/ui/ 削除
  dead code 除去
  AddPassionForm を components/ui に統一
  google-login-button / share-action-button を共通コンポーネント化
  をやってほしい
  ```
  ```
  ログイン画面に画像が貼ってあると思うんだけど、その画像を動画とかgifとかにして、ブラウザ開いたら動きがあるようにしてほしい。
  ```
- **出力サマリ**：共通ボタン化・フォーム統一・`hero.gif` 追加。PR #51。
- **評価**：採用
- **採用の理由**：指摘優先度どおりに整理できログインの第一印象も改善したため。

---

### #031 偏愛追加画面PCレイアウト修正

- **時刻**：18:39
- **担当者**：YOSHIMURA (@aoi0814)
- **ツール**：Cursor（Composer）
- **目的**：PC 表示時のフォームずれを修正する
- **プロンプト**：
  ```
  UIがずれてるから直して。
  ```
- **出力サマリ**：`AddPassion` 周辺の flex / max-width を調整。PR #52。
- **評価**：採用
- **採用の理由**：スクリーンショット指摘どおりのずれを解消できたため。

---

### #032 スマホBottomNav下端固定

- **時刻**：22:10
- **担当者**：YOSHIMURA (@aoi0814)
- **ツール**：Cursor（Composer）
- **目的**：スマホでナビとボタンを下端に固定しつつデザインを維持する
- **プロンプト**：
  ```
  まずプログラムを読んで理解して。そのあとUIを直したいんだけど、スマホ型の時にボタンを宙に浮いてる感じじゃなくて下にくっつけてほしいのね。その時デザイン的に劣化しないように気を付けて
  ```
- **出力サマリ**：`BottomNav` と主要 CTA を safe-area 対応の下端固定に変更。PR #56。
- **評価**：採用
- **採用の理由**：モバイルの親指操作性が改善したため。

---

### #033 ログイン画面ランディング化

- **時刻**：22:43
- **担当者**：YOSHIMURA (@aoi0814)
- **ツール**：Cursor（Composer）
- **目的**：キャッチコピーと説明を足し初見ユーザーにアプリの価値を伝える
- **プロンプト**：
  ```
  ログイン画面があまり優秀じゃないように見える。googleできるのはいいんだけど、PC画面でもスマホ画面みたいな表示だし、アプリを開いたときに全く説明がないから、何もつかめない。キャッチコピーとか書いといてほしいね。下のURLのwebアプリケーション参考にして作成してみて。色合いは変えないでね。

  https://habitica.com/static/home
  ```
- **出力サマリ**：キャッチコピー・3ステップ説明・PC 2カラムレイアウトを `Login.tsx` に追加。PR #58。
- **評価**：採用
- **採用の理由**：色トークンを維持したまま初見の理解が改善したため。

---

### #034 二重スクロール・スクロールバー非表示

- **時刻**：22:57
- **担当者**：YOSHIMURA (@aoi0814)
- **ツール**：Cursor（Composer）
- **目的**：ログイン後画面の二重スクロールとスクロールバー表示を解消する
- **プロンプト**：
  ```
  じゃっかんUIがおかしい。サイドの場みたいなやつが2つあるんだけど
  ```
  ```
  ログイン画面後にはスクロールバー入らないかな。見た目があんまりだった
  ```
- **出力サマリ**：`html/body/#root` の overflow を整理しスクロールバー非表示 CSS を追加。PR #59。
- **評価**：一部採用
- **採用しなかった理由**：二重スクロールは追加指示で解消。スクロールバーは OS によって見え方が残る端末があり実機確認が必要だった。

---

## Day 3（2026-05-26）

### #035 GeoGuessr風シネマティックログイン背景

- **時刻**：23:36
- **担当者**：YOSHIMURA (@aoi0814)
- **ツール**：Cursor（Composer）
- **目的**：ログイン画面のインパクトを背景動画で強化する（Google ログイン位置は維持）
- **プロンプト**：
  ```
  Login画面でのUIのインパクトがまだ低いような気がする。今のままでもいいんだけど、背景とかを動画にしてより気が引くことができるUIUXを作りたい。URLをさんこうにしてhttps://www.geoguessr.com/

  googleログインの場所とかには気を遣うように‼たーまと会うようなWebアプリケーション設計を心掛けて‼
  ```
- **出力サマリ**：フルスクリーン背景動画（`login-bg.mp4`）とオーバーレイ、シネマティック 2 カラムログインを実装。
- **評価**：採用
- **採用の理由**：参考サイトの雰囲気を保ちつつ既存の色・Google ログイン導線を維持できたため。

---

### #036 AI 活用ログの時系列統合（AI_USAGE_LOG.md）

- **時刻**：23:58
- **担当者**：SHIMMEN
- **ツール**：Claude Code（claude-sonnet-4-6）
- **目的**：SHIMMEN.md と WAKAMIYA.md に分かれていた AI 活用ログを `AI_USAGE_LOG.md` に時系列順で統合する
- **プロンプト**：
  ```
  app/docs/ai_usage_logs/配下のSHIMMEN.mdとWAKAMIYA.mdに書かれているAi使用ログを、
  AI_USAGE_LOG.mdに時系列順で統合してください。
  統合にAIを用いたこともAI_USAGE_LOG.mdに追加してください。
  ```
- **出力サマリ**：SHIMMEN 8 件・WAKAMIYA 14 件を時系列ソートし、担当者フィールドを付加した 23 件を `AI_USAGE_LOG.md` に出力。統合作業自体も末尾に追記。PR #61 作成 → dev へマージ
- **評価**：採用
- **採用の理由**：両ファイルの日付・時刻フォーマットが異なっても正確にソートされ、既存エントリの内容を損なわず統合できた

---

### #037 ログイン後モバイルスクロール・ナビアイコン

- **時刻**：02:26
- **担当者**：YOSHIMURA (@aoi0814)
- **ツール**：Cursor（Composer）
- **目的**：ログイン後のスマホ操作性とヒーロー見切れ・偏愛タブの分かりやすさを改善する
- **プロンプト**：
  ```
  ログイン画面後なんだけどスマホ画面になるとスクロールできない
  ```
- **出力サマリ**：`app-shell` の overflow 修正、ヒーロー `object-fit` 調整、偏愛タブに `+` アイコンと `aria-label` を追加。PR #65 マージ。
- **評価**：採用
- **採用の理由**：実機で出ていたスクロール不能と見切れを解消しナビの意味も明確化できたため。

---

### #038 AI_USAGE_LOG 追記（YOSHIMURA）

- **時刻**：03:00（推定）
- **担当者**：YOSHIMURA (@aoi0814)
- **ツール**：Cursor（Composer）
- **目的**：審査用に自分の AI 活用履歴を `docs/ai_usage_logs/YOSHIMURA.md` と `AI_USAGE_LOG.md` に反映する
- **プロンプト**：
  ```
  AI_USAGE_LOG.mdってフォルダに俺のAI使った変更履歴を反映させないといけない。もう書いてある人がいるから、それを参考にして、書いてくれ。おれのgithubは@aoi0814だよ
  ```
- **出力サマリ**：Cursor セッションログ・git 履歴・PR 一覧を照合し、Day1〜Day3 のエントリを `YOSHIMURA.md` に記録。`AI_USAGE_LOG.md` に時系列統合。
- **評価**：採用
- **採用の理由**：他メンバー（SHIMMEN / WAKAMIYA）と同形式で、実際のプロンプトと採否を残せたため。

---

### #039 Home 画面を育成画面（CharacterChat）に統合

- **時刻**：06:21
- **担当者**：SHIMMEN
- **ツール**：Claude Code（claude-sonnet-4-6）
- **目的**：`/`（Home）と `/characters/:id`（育成）が別画面だったものを一本化する。Home のビジュアル（アカウントチップ・Lv/XP バー・ブリージングアニメーション・アクションピル）と育成画面の機能（AI 送信・吹き出し・履歴・ステータス）をすべて `CharacterChat` に統合する
- **プロンプト**：
  ```
  Home画面 を育成画面に統合したいです。
  - 基本的なUIはHomeのまま、場所を育成画面に移動させてください。
  - どちらにもテキスト入力欄がありますが、AIへ送信する機能があるものを残してください。
    どちらも同じくAIへ送信する処理であれば、一つに統一して育成画面に配置してください。
  - 育成画面の会話履歴ボタンやステータスボタンは残してください。
    また、育成画面の、吹き出しが現れて消える実装なども残してください。
  ```
  （UI 調整）
  ```
  ナビバーのHomeボタンも削除してください。
  キャラの後ろの円形のUIは、キャラがいないときに表示されるもので、
  キャラがいるときは消えるものだと思います。そのようにしてください。
  ステータスボタンはキャラの下に近づけ、履歴ボタンはヘッダーの下、画面の右上に配置してください。
  履歴やステータスを開いたときのモーダルが画面横いっぱいに広がってしまい、
  ナビバーの下に隠れてしまいます。横幅の最大値を持たせるなどして調整してください。
  吹き出しをもっと下に配置し、キャラの真上に表示されるようにしてください。
  ```
  ```
  キャラを地面の上にいるように見せるため、ステータスボタンとともに位置を少し下げてください。
  ```
- **出力サマリ**：
  - `CharacterChat.tsx` を大規模改修。Home の全 UI 要素を移植し、`CharacterAvatar` を廃止して `CharacterIllustration`（egg ベース画像）に置き換え。ステータスモーダルをインライン化
  - 吹き出しを `absolute bottom-full` でキャラ画像の真上に配置（レイアウトシフトなし）
  - `Modal` に `max-w-sm` とナビ分のオーバーレイ調整を追加
  - `BottomNav` の Home タブを削除（`grid-cols-5` → `grid-cols-4`）
  - `App.tsx` でルート `/` を `/characters` へリダイレクト
  - コミット 2 件・PR #81 作成（`refactor/integrate_home_to_growing` → `dev`）
- **評価**：採用
- **採用の理由**：実装前に `CharacterAvatar` と `CharacterIllustration` の違いを確認して方針を決定し、UI 調整は複数回の指示で収束した。吹き出しの `absolute` 配置やモーダルのナビ考慮など実装判断は適切だった

---

### #040 キャラなし時の育成画面に部屋 UI を表示

- **時刻**：06:40（推定）
- **担当者**：SHIMMEN
- **ツール**：Claude Code（claude-sonnet-4-6）
- **目的**：キャラがいない場合の育成画面で、`EmptyState` の代わりに部屋の背景と簡潔なメッセージを表示する
- **プロンプト**：
  ```
  キャラがいないとき、育成画面では部屋のUIを表示し、
  キャラがいるはずの場所に簡潔なメッセージを表示してください。
  ```
  ```
  拡大はされなくなりましたが、ヘッダーが無い分、部屋のUIが上に表示されてしまいます。
  修正してください。
  ```
- **出力サマリ**：`CharacterDetailPage` のキャラなし・卵なしケースを統合し `EmptyState` を廃止。`RoomBackdrop` SVG・メッセージ・「偏愛を登録する」リンクを配置。`max-h-[360px]` で SVG 拡大を防止、`h-36` top スペーサーで位置を補正
- **評価**：採用
- **採用の理由**：SVG の `preserveAspectRatio="slice"` がコンテナ高さに依存する挙動を正確に診断し `max-h` で解決。2 回の指摘で収束した