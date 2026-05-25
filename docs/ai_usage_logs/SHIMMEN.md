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

### #004 Issue #14 キャラクター育成レイアウト実装

- **時刻**：01:00
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

### #005 Issue #15 キャラクターチャットUI実装・UI調整

- **時刻**：04:30
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

### #006 キャラクター返信吹き出し実装

- **時刻**：05:45（再実装：13:05）
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

### #007 Issue #16 AI返信バックエンド（sendMessage）実装

- **時刻**：18:29
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

### #008 AI活用ログ追記（Day2 後半分）

- **時刻**：23:38
- **ツール**：Claude Code（claude-sonnet-4-6）
- **目的**：Day 2 後半（#007 以降）の実装内容を ai_usage_logs に追記する
- **プロンプト**：
  ```
  docs/ai_usage_logs/SHIMMEN.mdにclaudeの使用記録を追加したいです。
  ログなどからその内容を時刻・プロンプト含めて追記できますか。
  ```
- **出力サマリ**：セッションログ（.jsonl）と git コミット履歴を照合し、#007〜#008 を本ファイルに追記。時刻・プロンプトはログから復元
- **評価**：採用
- **採用の理由**：セッションログから実際のプロンプトと時刻を正確に復元でき、要約なしで記録できた

---

## Day 3（2026-05-26）

### #00X

---
