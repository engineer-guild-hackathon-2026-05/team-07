# Firestore スキーマ改善（検索高速化 + 更新簡素化）

最終更新: 2026-05-25
ステータス: 要件確定
対応Issue: [infra-02: データモデル(TypeScript型)定義](../issues/infra-02-data-model.md) の継続改善

## 目的（Why）

PR #20 で定義された Firestore スキーマ（`AGENTS.md` 7章 / `app/src/types/firestore.ts`）には、実装着手前にいくつか「読み込みが多段になる」「更新時にドキュメント全体を読み書きする」課題が残っている。本タスクでは以下2点を最適化する：

1. **検索（read）時間の短縮** — 主要画面で 1 クエリで完結する
2. **更新（write）処理の簡素化** — 配列の上書き読み書きを避け、ピンポイント書き込みで済む構造にする

## スコープ

### 含むもの

- `AGENTS.md` 「7. データ」のスキーマ図更新
- `app/src/types/firestore.ts` の型定義更新（フィールド追加・配列削除・サブコレクション化）
- `app/functions/src/types/firestore.ts` の同期更新（mirror）
- `app/firestore.indexes.json` への複合インデックス定義の追加

### 含まないもの（明示的に対象外）

- `app/firestore.rules` のルール記述（→ `infra-01` で別途対応）
- ランタイムコードの書き換え（`localRepository.ts` → Firestore 連携などは別Issue）
- 既存データの移行スクリプト（まだ本番データが無いため不要）
- Firestore Emulator のセットアップ
- Vector search（`passions.embedding`）の運用設計

## 成功条件（Definition of Done）

- [x] `docs/requirements/firestore-schema-refinement.md` を作成（このファイル）
- [ ] `AGENTS.md` のスキーマ図が改善後の構造を反映している
- [ ] `app/src/types/firestore.ts` の `*Doc` 型が新スキーマに沿っている
- [ ] `app/functions/src/types/firestore.ts` が src 側と一致している
- [ ] `app/firestore.indexes.json` に必要な複合インデックスが入っている
- [ ] `cd app && npm run lint && npx tsc -b --noEmit` が緑
- [ ] `cd app/functions && npm run lint && npm run build` が緑

## 制約

- 技術: TypeScript / Firestore (v12 client SDK + admin SDK)
- データ: スキーマレスとはいえチームで合意した共通形を `*Doc` 型として固定する
- セキュリティ: 非正規化フィールド（`sourceUserName` 等）は `firestore.rules` で書き込み制御要（infra-01 で別途）
- 期限: ハッカソン Day1 基盤として早期確定
- 規約: コミット・ブランチ命名は `docs/rules/git-conventions.md` 準拠

## 主な改善点と振る舞い

### 1. `chatId` と `characterId` を決定論的 ID に変更

- `characterId = eggId`（1卵1キャラの 1-to-1 対応）
- `chatId = ${characterId}_${userUid}`
- → 検索クエリ不要、`getDoc(doc(db, COLLECTIONS.CHATS, chatId))` 1回で取得可能

### 2. `characters.ownerUid` を追加（非正規化）

- AGENTS.md 原案では「自分のキャラ一覧」を出すために `eggs` を経由する 2 ステップが必要
- `ownerUid` を持たせれば 1 クエリで完結

### 3. `eggs.hatched` フラグ追加

- 「孵化前の卵」「孵化済み（= キャラ化済み）」の判別に使う
- ホーム画面で「卵だけ」「キャラだけ」フィルタ可能

### 4. `chats.messages` 配列 → サブコレクション化

- `chats/{chatId}/messages/{messageId}` に分離
- メッセージ追記が `addDoc` の単発書き込みで済む（旧: ドキュメント全体 read & write）
- 「最新N件だけ取得」が `limit(N)` で可能（旧: 全件読込）
- ドキュメント上限 1MB の制約から解放

### 5. 表示用の非正規化フィールド追加

| ドキュメント | 追加フィールド | 用途 |
|---|---|---|
| `eggs` | `sourceUserName` | 「誰が作った卵か」を users に再 fetch せず表示 |
| `exchanges` | `fromUserName`, `toUserName`, `eggName` | 交換履歴画面の一覧描画用 |
| `chats` | `lastMessagePreview` | チャット履歴一覧の冒頭プレビュー |

トレードオフ: 元データを変更した時に複製先を更新する責務がアプリ側に発生する。
ハッカソン MVP の範囲では「ユーザー名・キャラ名は変更不可」前提で割り切る。

### 6. `updatedAt` の追加

- `users`, `characters`, `chats` に `updatedAt` を追加
- 「最近更新したキャラ順」「最近やりとりしたチャット順」のソートで使う

## 必要な複合インデックス

```jsonc
// app/firestore.indexes.json
{
  "indexes": [
    { "collectionGroup": "passions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "ownerUid", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
    ]},
    { "collectionGroup": "eggs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "currentOwnerUid", "order": "ASCENDING" },
        { "fieldPath": "hatched", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
    ]},
    { "collectionGroup": "characters",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "ownerUid", "order": "ASCENDING" },
        { "fieldPath": "updatedAt", "order": "DESCENDING" }
    ]},
    { "collectionGroup": "exchanges",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "fromUid", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
    ]},
    { "collectionGroup": "exchanges",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "toUid", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
    ]},
    { "collectionGroup": "messages",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "createdAt", "order": "ASCENDING" }
    ]}
  ],
  "fieldOverrides": []
}
```

## 未確定事項

- [ ] `passions.embedding` の vector search 採用可否（Firestore Vector Search の制約調査）
- [ ] チャットメッセージ数が長期で増えた場合の pagination 戦略（ハッカソン期間内では不要）
- [ ] 非正規化フィールドの整合性維持（名前変更機能を実装する段階で検討）

## 関連

- AGENTS.md「7. データ」
- 仕様書: `docs/issues/infra-02-data-model.md`
- 関連コード:
  - `app/src/types/firestore.ts`
  - `app/functions/src/types/firestore.ts`
  - `app/firestore.indexes.json`
  - `app/firestore.rules`（別Issue `infra-01` で対応）
