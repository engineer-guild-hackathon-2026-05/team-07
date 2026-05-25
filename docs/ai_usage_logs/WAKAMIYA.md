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

### #001 アイデア発散

- **時刻**：HH:MM
- **ツール**：（ChatGPT / Claude / Cursor / GitHub Copilot / etc.）
- **目的**：
- **プロンプト**：
  ```
  （実際のプロンプト）
  ```
- **出力サマリ**：
- **評価**：採用 / 一部採用 / 不採用
- **採用 / 不採用の理由**：

### #002 （次のログ）

---

## Day 2（2026-05-25）

### #001 FunctionsでOpenAI接続を実装

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

### #002 作成/育成で共通API+JSONプロンプト化

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

---

## Day 3（2026-05-26）

### #00X

---
