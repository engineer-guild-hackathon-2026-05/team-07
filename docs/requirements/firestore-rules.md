# Firestore セキュリティルール整備

最終更新: 2026-05-25
ステータス: 要件確定
対応Issue: [infra-01: Firestoreセキュリティルール整備](../issues/infra-01-firestore-rules.md)

## 目的（Why）

現状 `app/firestore.rules` は `allow read, write: if false;` の全拒否状態で、
クライアントから一切の read / write ができない。これでは各機能を実装しても動かない。

`egh-team7` Firebase プロジェクトは **公開 API キー経由で世界中からアクセス可能**で、
唯一の防御線が Firestore セキュリティルールであるため、最低限の認可境界を
ここで確立する。

## スコープ

### 含むもの

- `app/firestore.rules` の書き換え（全コレクションの権限定義）
- 各コレクションのヘルパー関数（`isSignedIn`, `isSelf`, `isUnchanged`）
- `chats/{chatId}/messages/{messageId}` サブコレクションのルール
- 設計判断の文書化（このファイル）

### 含まないもの（明示的に対象外）

- Firestore Emulator でのルールテスト自動化（ハッカソン時間制約のため省略。
  検証は `firebase deploy --dry-run` の構文検証 + Firebase Console での手動確認）
- 卵生成・交換などの Cloud Function 実装（別Issue char-04 / exch-03）
- カスタムクレーム（管理者ロール等）の運用
- App Check の導入

## 成功条件（Definition of Done）

- [x] `firebase deploy --only firestore:rules --dry-run` で構文エラーなし
- [ ] 全コレクションに対して認証必須化されている
- [ ] `passions` の所有者以外がドキュメント書き換えできないルールになっている
- [ ] `eggs` / `characters` / `exchanges` のクライアント create は不可（Cloud Function 経由のみ）
- [ ] `chats/{chatId}/messages` サブコレクションが親 chat の `userUid` で守られている

## 制約

- 技術: Firestore Rules v2
- データ: `app/src/types/firestore.ts` の Doc 型に合わせる（特に `characters.ownerUid`、
  `eggs.currentOwnerUid` をフィールド名として利用）
- セキュリティ: API キーは公開前提なので、ルールが唯一の防御線
- 期限: ハッカソン Day1 基盤として早期確定 (Day2 以降の機能実装の前提)
- 規約: コミット・ブランチ命名は `docs/rules/git-conventions.md` 準拠

## 設計判断の解説

### 1. すべて認証必須

`request.auth != null` を全エンドポイントで必須化。匿名アクセスは一切認めない。
これは Firebase Auth に登録したユーザーだけがアプリを使う前提に基づく。

### 2. Cloud Function 専用ドキュメント

`eggs` / `characters` / `exchanges` の **作成はクライアントから不可** (`allow create: if false`)。
これらは Cloud Function (admin SDK) からのみ作成される。Admin SDK は Firestore ルールを
**バイパスする**ため、`if false` でも Functions からは書き込める。

| ドキュメント | 作成元 | 該当 Issue |
|---|---|---|
| `eggs` | `char-04` の egg 生成 Cloud Function | docs/issues/char-04-egg-generation.md |
| `characters` | egg 孵化時の Cloud Function (TBD) | 後続 |
| `exchanges` | `exch-03` の交換 Cloud Function | docs/issues/exch-03-exchange-function.md |

→ **このルール状態では char-04 / exch-03 の Cloud Function が無いとデータ生成できない**。
依存順序を明確化するため、あえてこの厳しさを Day1 で固定する。

### 3. 重要フィールドの不変性

ownership に関わるフィールド（`ownerUid`, `currentOwnerUid`, `eggId` 等）は
`isUnchanged()` ヘルパーで **client update では変更不可** とする。

例: 卵の所有権移転 (`eggs.currentOwnerUid` 変更) は本来 `exchanges` のフローで起きるが、
クライアントから直接更新できると「QR を経由せず勝手に他人の卵を奪う」攻撃が成立する。
そのため Cloud Function 経由でしか変更できないようにする。

### 4. 非正規化フィールドへの依存

`characters.ownerUid` は `refactor/20_firestore_schema_refinement` で追加した
非正規化フィールド。本来は `eggId` 経由で `eggs.currentOwnerUid` を引かなくては
ならないが、`get()` を毎回呼ぶと余分な read 課金が発生するため、
`characters` 自身に `ownerUid` を持たせている。

整合性維持の責務は **キャラ作成・所有権移転の Cloud Function** が担う:
- 卵を孵化させて character 作成 → `ownerUid := egg.currentOwnerUid`
- 交換で egg の所有権が移った → 関連する character の `ownerUid` も同時更新

### 5. サブコレクション (chat messages) の `get()`

`chats/{chatId}/messages/{messageId}` のルールでは親 chat の `userUid` を
`get(/databases/$(database)/documents/chats/$(chatId))` で取得して所有者判定する。

トレードオフ:
- ✅ chat 全体に対する ACL を 1 箇所で管理できる
- ❌ メッセージ操作のたびに 1 read 余分にかかる（ルール評価分）

ハッカソン規模（≒ 1 ユーザーあたり数千メッセージ未満）では無視できるコスト。

将来的にスケールが必要なら、メッセージにも `userUid` を持たせて非正規化判定に
切り替える選択肢がある。

### 6. 公開 / 非公開の `passions.visibility`

`passions` のみ `visibility: "public" | "private"` を持ち、`public` なら
他人も read 可能。今後「他人の偏愛を探索する」機能が入った時にこのルールが効く。
`private` は所有者本人のみ read。

## 検証手順

### A. 構文検証（自動）

```bash
cd app
npx firebase-tools deploy --only firestore:rules --dry-run
```

→ `✔ cloud.firestore: rules file firestore.rules compiled successfully` を確認。

### B. クラウドへのデプロイ（手動）

PR を merge した後、誰か 1 人が以下を実行:

```bash
cd app
firebase login    # 未ログインなら
firebase deploy --only firestore:rules
```

### C. 動作確認（手動 / Firebase Console）

deploy 後、以下を Firebase Console (https://console.firebase.google.com/project/egh-team7/firestore) で目視確認:

1. 「Rules」タブに新ルールが反映されているか
2. 「Rules Playground」で以下のシナリオが期待通り評価されるか:
   - 認証なしユーザーが任意のドキュメントを read → **deny**
   - 認証済みユーザーが自分の `users/{自分のuid}` を read → **allow**
   - 認証済みユーザーが他人の `passions/{他人のid}` (private) を read → **deny**
   - 認証済みユーザーが他人名義で `passions` create → **deny**

## 未確定事項

- [ ] Cloud Function 実装後、Functions が rules をバイパスしている挙動の動作確認
- [ ] `App Check` の導入要否（API キー公開を受けて、bot からの濫用を抑える追加防御）
- [ ] 万一データ汚染が起きた時の復旧フロー（Day3 デモ直前なら手動 reset で対応）

## 関連

- 仕様書: `AGENTS.md` 7-8章
- 関連スキーマ: `app/src/types/firestore.ts` (`refactor/20_firestore_schema_refinement` の変更が前提)
- 関連コード: `app/firestore.rules`
- 関連 Issue: `infra-01`, `char-04`, `exch-03`
