---
name: egg-create-line-share
description: 卵作成画面 (PassionEggCreatePage) の卵生成完了後に「LINEでリンク共有」ボタンを追加し、createUrlExchange で発行した受け取りURLを LINE で送れるようにする
metadata:
  type: project
---

# 卵作成画面に LINE 共有ボタンを追加

最終更新: 2026-05-26
ステータス: 要件確定
対応 Issue: なし（[url-exchange-flow](./url-exchange-flow.md) の延長／実装適用）

## 目的（Why）
現状、`/passions/:passionId/egg-create` で卵を生成しても、その場から相手へ共有する導線がない（「ホームへ戻る」しかない）。せっかく作った卵をその勢いで LINE で渡せるようにして、交換完了までの離脱を減らす。

## スコープ

**含むもの:**
- `PassionEggCreatePage` の卵生成完了後（`phase === 'done'`）にのみ、「LINEで共有」ボタンを表示する
- ボタン押下時に `callCreateUrlExchange({ eggId })` を呼んで `exchangeId` を取得し、`buildReceiveUrlForExchange(exchangeId)` で受け取り URL を生成
- 受け取り URL を `buildLineShareUrl(shareText)` で LINE 共有 URL に組み立て、`window.open` で別タブを開く
- 共有 URL 発行中はボタンを `disabled` にし、ローディング表示（「URL発行中…」など）
- 失敗時はエラーメッセージを画面に表示

**含まないもの:**
- ExchangeWait 画面への自動遷移（このボタンは「LINE で送るだけ」に留める。`onSnapshot` 購読・受け取り検知は既存 ExchangeWait 側の責務で、本要件には含めない）
- 「リンクをコピー」「ネイティブ共有シート」など LINE 以外の共有手段（必要なら別途）
- 共有テキストのリッチ化（passion / character の混ぜ込み）：今回は ExchangeWait と同等のシンプル文面で揃える
- 卵生成前の段階での共有

## 成功条件（Done）
- [ ] 卵を作成した直後（`phase === 'done'`）に「LINEで共有」ボタンが表示される
- [ ] ボタン押下で `createUrlExchange` callable が呼ばれ、戻ってきた `exchangeId` から受け取り URL を組み立て、LINE 共有 URL が新規タブで開く
- [ ] 発行中はボタンが disabled になり、二重発行されない
- [ ] 失敗時は画面下部にエラーメッセージが表示され、再試行できる
- [ ] 卵生成前（`phase === 'idle' | 'creating' | 'error'`）ではボタンが表示されない
- [ ] 既存の「卵を作成する」ボタン／「ホームへ戻る」リンクの挙動は壊れていない

## 制約・前提
- フレームワーク: React 19 + Vite + TS、ルーティング `react-router-dom`
- 共有 URL ロジック: `app/src/lib/exchangeShare.ts` の `buildLineShareUrl` を再利用
- Exchange callable: `app/src/firebase/exchange.ts` の `callCreateUrlExchange` / `buildReceiveUrlForExchange` を再利用
- データ: Firestore `exchanges` コレクション、`url-exchange-flow.md` のスキーマに準拠（書き込みは Cloud Function 側で実施）
- 認可: `createUrlExchange` 側で `fromUid == auth.uid` チェック済みなので、フロントは追加チェック不要
- 期限: Day 3（ハッカソン、最速で動かす）

## 未確定事項
- [ ] 共有テキスト本文: いったん ExchangeWait と同じ `偏愛から生まれた卵を渡します🥚\n受け取る → {URL}` で揃える（必要なら後で差し替え）
- [ ] LINE 以外の共有手段（コピー等）を後で並べるかは別途検討
