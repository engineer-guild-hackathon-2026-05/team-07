# ux-06: デザインシステム整備

## 概要
Tailwind ベースで、色・タイポ・余白・基本コンポーネントの規約を定める。

## 目的
- 4人が独立してUIを書いても、全体のトーンが揃うようにする
- ハッカソンでも体験品質を担保する

## タスク
- `app/tailwind.config.ts` (または相当箇所) で:
  - ブランドカラー (primary, accent, surface, text 等)
  - フォントサイズスケール
  - radius / shadow のトークン
- 基本コンポーネントを `app/src/components/ui/` に用意:
  - `Button` (primary / secondary / ghost)
  - `TextField`, `Textarea`
  - `TagInput` (char-01 で使う)
  - `Card`
  - `Modal`
- 簡易スタイルガイドページ `/dev/style` を作って一覧できると嬉しい(任意)

## 完了条件
- 上記基本コンポーネントが他Issueから import して使える
- 色とフォントが画面間で一致している

## 関連
- 依存: なし(初日に着手)
- 後続: ほぼ全UIIssue
