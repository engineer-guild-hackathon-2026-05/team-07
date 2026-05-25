---
name: url-exchange-flow
description: 卵生成後に共有URLを発行し、AはonSnapshotで成立を待機、Bはクリックで交換成立→育成画面、というリモート交換方式の要件
metadata:
  type: project
---

# 共有URL方式の卵交換フロー

最終更新: 2026-05-25
ステータス: 要件確定
対応Issue: なし（新規。既存 QR 方式 [exch-01〜04](../issues/) と並列の交換手段として追加）

## 目的（Why）
対面で QR を読み合うのが難しい場面（離れた友人同士、LINE グループで配りたい等）でも、卵を渡せるようにする。「URL を送る → クリックで成立」という LINE 文化に乗せて、交換のハードルを下げる。

## スコープ

### 含むもの
- 卵生成完了後／自分の卵詳細画面に「共有URLを発行」ボタンを追加
- Cloud Function で交換トークン（uuid）付きの共有URLを生成し、`exchanges/{exchangeId}` を `status: 'pending'` で保存
- A 側の「交換待ち」画面（共有URL表示＋ LINE 等への共有導線＋待機UI）
- A 側で `exchanges/{exchangeId}` を `onSnapshot` 購読し、`status === 'completed'` を検知したら **対応する育成画面 `/character/{characterId}` へ自動遷移**
- B 側のランディング `/exchange/receive/{exchangeId}`（仮）でログイン状態を確認し、Cloud Function `completeExchange` を呼んで成立 → 育成画面へ遷移
- URL は **1回使い切り**（先着 1 名が `pending → completed` に遷移させた時点で他は無効）
- URL は **発行から 24 時間で失効**
- A 自身がクリックした場合は **エラー表示で拒否**（`fromUid == caller.uid` をサーバ側で弾く）
- B が未ログインの場合は **エラー画面**（「ログインして開き直してください」）

### 含まないもの（明示的に対象外）
- プッシュ通知（FCM）による A への通知 → **後追いタスク**
- 匿名認証（Anonymous Auth）での受け取り
- 同一URLの複数人受け取り（バラ撒き型）
- A が待機画面を閉じた後の復帰導線（次回開いたとき未読の成立通知を拾う等）→ 後追い
- 既存 QR 方式（exch-01〜04）の変更・廃止 → 並列で残す
- 共有URLのプレビュー OGP 画像生成

## 成功条件（Definition of Done）
- [ ] A が「共有URL発行」ボタンを押すと、`exchanges/{exchangeId}` が `status: 'pending'`, `fromUid`, `eggId`, `expiresAt`（24h後）で作成され、共有可能なURLが画面に表示される
- [ ] A の画面はそのまま「交換待ち」状態で表示され続け、コピー／LINE シェア導線が機能する
- [ ] B が URL を開くと、ログイン済みの場合 `completeExchange({ exchangeId })` が呼ばれ、`exchanges` が `status: 'completed'`, `toUid` を埋めた状態に更新され、egg の `currentOwnerUid` も B に移譲される
- [ ] B は成立後、自動で `/character/{characterId}` の育成画面に遷移する
- [ ] A 側は `onSnapshot` で `status: 'completed'` を検知し、同じ育成画面（A 側の視点では「相手に贈った卵がキャラ化した」表示 or 通常の育成画面）に **自動遷移する**
- [ ] 期限切れ・既に成立済み・自己クリックの 3 パターンで適切なエラーメッセージが返り、フロントで分岐表示される
- [ ] B が未ログイン状態でURLを開いたら「ログインして開き直してください」エラー画面になる
- [ ] 既存の QR 方式（exch-01〜04）は引き続き動作する（リグレッションなし）

## 制約
- **技術**: React 19 + Vite + TS（`app/src/`）、Firebase Functions Node22（`app/functions/src/`）、Firestore、Firebase Auth
- **データ**: `AGENTS.md` の `exchanges` コレクションスキーマに準拠。新規追加が必要なフィールド：
  - `status: 'pending' | 'completed' | 'expired'`
  - `expiresAt: Timestamp`
  - `shareMethod: 'qr' | 'url'`（QR方式と区別する用。任意）
  - `pending` 状態では `toUid`, `toUserName` は未設定
- **セキュリティ**: `firestore.rules` で `exchanges` は
  - 作成: `fromUid == auth.uid` のみ
  - 読み取り: `fromUid == auth.uid || toUid == auth.uid`（ただし `status: 'pending'` の URL 経由 read は callable 内で行うのでクライアント直読は不要）
  - 更新: クライアント直接更新は不可。Cloud Function 経由のみ
- **既存 Function との関係**: `exch-03` の `completeExchange` を **URL 方式にも対応するよう拡張** するか、別 callable を切るかは設計フェーズで判断（推奨: 同一関数を引数 `{ exchangeId }` で受ける形に統一）
- **期限**: ハッカソン Day 4-5 を想定（QR 方式が一通り動く前提で追加実装）

## 主な振る舞い

### 正常系
1. A: 卵詳細画面で「共有URLを発行」押下
2. Cloud Function `createUrlExchange({ eggId })` が `exchanges/{exchangeId}` を `pending` で作成し、`{ shareUrl, exchangeId }` を返す
3. A: 「交換待ち」画面に遷移。URL をコピー or LINE 共有ボタンで送信
4. A の画面: `onSnapshot(doc(db, 'exchanges', exchangeId))` を購読
5. B: 受け取った URL を開く → `/exchange/receive/{exchangeId}`
6. B: ログイン済み確認 → `completeExchange({ exchangeId })` 呼び出し
7. Function 内で原子的に: 期限・自己交換・既成立をチェック → egg の `currentOwnerUid` を B に → `exchanges` を `completed` に → `toUid`, `toUserName` を埋める
8. B: 成立成功 → `/character/{characterId}` に遷移
9. A: snapshot で `status === 'completed'` 検知 → `/character/{characterId}` に自動遷移

### 異常系
- **B が未ログイン**: 受け取り画面でエラー表示「ログインして開き直してください」（ログイン後の自動リダイレクトは後追い）
- **URL 期限切れ（24h超過）**: `completeExchange` がエラーを返す → B 側で「この交換URLは期限切れです」表示
- **既に成立済み**: `completeExchange` がエラー → B 側で「この卵は既に他の人が受け取りました」表示
- **A が自分のURLをクリック**: `fromUid == caller.uid` で `completeExchange` がエラー → 「自分の卵は受け取れません」表示
- **A が待機画面を閉じた**: 成立してもその場では遷移できない（再訪時の復帰は後追い）。Firestore 上は正常に成立する
- **Firestore 書き込み失敗**: B 側に「交換に失敗しました。もう一度試してください」表示

### 境界条件
- URL 発行から 23h59m で B がアクセス → 成立可
- B のクリックと A の別タブからのキャンセル（仕様化するか後追い）が競合 → Function 内のトランザクションで先勝ち

## 未確定事項
- [ ] 共有URLのドメイン・パスの最終形（`/exchange/receive/{exchangeId}` で良いか、トークン形式にするか）
- [ ] A 側「交換待ち」画面の UI 詳細（キャンセルボタンの有無、共有方法のボタン構成）
- [ ] 成立後の育成画面遷移時、A 側にも「○○さんが受け取りました」のトースト等を出すか
- [ ] `completeExchange` を QR / URL で共通化するか分離するか（設計フェーズで判断）
- [ ] 期限切れドキュメントのクリーンアップ（TTLポリシー or 定期 Function）
- [ ] `firestore.rules` の `exchanges` read 条件で `toUid: ""` 空文字センチネルの安全性レビュー（status==='pending' のときは fromUid のみ許可、'completed' は両者、と分岐する案を検討）
- [ ] `completeExchange` 内で `getUser(callerUid)` をトランザクション外で呼んでいる → toUserName 鮮度の許容範囲を要決定（denormalize の許容 or tx 内に取り込む）
- [ ] 並行性テスト追加: 同時 complete でも先勝ちが保証されることを fake transaction にバージョン管理を入れて検証
- [ ] `EggDoc` に `eggName` フィールドを追加する Firestore スキーマ修正（現状 exchange 側で `${sourceUserName}の卵` を合成しており二重 denormalize になっている）
- [ ] `ExchangeStatus = 'expired'` を実書き込みするコード or TTL バッチを用意（現状はリードオンリーで未使用）

## 関連
- 既存 QR 方式（並列で残す）:
  - [exch-01: QRコード生成・表示](../issues/exch-01-qr-display.md)
  - [exch-02: QRコード読み取り](../issues/exch-02-qr-scan.md)
  - [exch-03: 交換処理Cloud Function](../issues/exch-03-exchange-function.md)
  - [exch-04: 交換履歴](../issues/exch-04-exchange-history.md)
- 前提: [char-04: 卵生成Function](../issues/char-04-egg-generation.md), [infra-01: Firestoreルール](../issues/infra-01-firestore-rules.md)
- 後続予定: FCM プッシュ通知による A への成立通知（別要件）
