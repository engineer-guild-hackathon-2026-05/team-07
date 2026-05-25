# Issue 一覧 (偏愛キャラクター育成アプリ)

ハッカソン期間中に4人で並行開発するためのIssueリスト。各Issueは概ね1〜2日で完了する想定の中粒度。

## 担当割当の目安

| 担当 | 主領域 | 主要Issue |
|------|--------|-----------|
| A | キャラ生成 | `char-01` 〜 `char-05` |
| B | 交換 | `exch-01` 〜 `exch-04` |
| C | 成長 | `grow-01` 〜 `grow-05` |
| D | UI/UX・基盤 | `ux-01` 〜 `ux-06`、`infra-01`〜`infra-02` |

※`infra-02`(型定義)は最序盤に全員でレビュー、`ux-01`/`ux-02`/`infra-01` は他担当の前提となるため最優先で着手する。

## カテゴリ

### 基盤 (最優先)
- [infra-01: Firestoreセキュリティルール整備](./infra-01-firestore-rules.md)
- [infra-02: データモデル(TypeScript型)定義](./infra-02-data-model.md)

### キャラ生成
- [char-01: 偏愛登録画面UI](./char-01-passion-registration-ui.md)
- [char-02: AIとの偏愛深掘り対話機能](./char-02-ai-passion-dialog.md)
- [char-03: 偏愛情報のFirestore保存](./char-03-passion-firestore.md)
- [char-04: キャラクター卵生成Cloud Function](./char-04-egg-generation.md)
- [char-05: 卵表示UIコンポーネント](./char-05-egg-display.md)

### 交換
- [exch-01: QRコード生成・表示画面](./exch-01-qr-display.md)
- [exch-02: QRコード読み取り画面](./exch-02-qr-scan.md)
- [exch-03: 交換処理Cloud Function](./exch-03-exchange-function.md)
- [exch-04: 交換履歴画面](./exch-04-exchange-history.md)

### 成長
- [grow-01: キャラクター育成画面の骨組み](./grow-01-character-screen.md)
- [grow-02: キャラクターチャットUI](./grow-02-chat-ui.md)
- [grow-03: チャット送受信・OpenAI連携](./grow-03-chat-backend.md)
- [grow-04: 育成進行度・知識レベル管理](./grow-04-growth-level.md)
- [grow-05: 話題解放システム](./grow-05-topic-unlock.md)

### UI/UX
- [ux-01: Firebase Authログイン](./ux-01-auth.md)
- [ux-02: ルーティング設定](./ux-02-routing.md)
- [ux-03: 共通ナビゲーションバー](./ux-03-navigation.md)
- [ux-04: ホーム画面](./ux-04-home.md)
- [ux-05: プロフィール画面](./ux-05-profile.md)
- [ux-06: デザインシステム整備](./ux-06-design-system.md)

## マイルストーン目安

1. **Day 1 (基盤構築)**: `infra-01`, `infra-02`, `ux-01`, `ux-02`, `ux-06`
2. **Day 2-3 (機能実装第1弾)**: `char-01`〜`char-04`, `exch-01`〜`exch-03`, `grow-01`〜`grow-03`, `ux-03`, `ux-04`
3. **Day 4 (機能実装第2弾)**: `char-05`, `exch-04`, `grow-04`, `grow-05`, `ux-05`
4. **Day 5 (統合・デモ準備)**: バグ修正・E2E動作確認・デモシナリオ
