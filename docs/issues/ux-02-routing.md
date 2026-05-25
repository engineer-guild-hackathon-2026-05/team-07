# ux-02: ルーティング設定

## 概要
React Router(または同等のルーティングライブラリ)を導入し、画面遷移の土台を作る。

## 目的
- 各担当が並行してページコンポーネントを足せるようにする

## タスク
- `react-router-dom` を `app/package.json` に追加
- `app/src/App.tsx` を Router 化
- ルート定義:
  - `/login`
  - `/` (ホーム、要認証)
  - `/passions/new`
  - `/exchange/share`, `/exchange/scan`
  - `/characters/:characterId`
  - `/profile`
- 各ルートは仮コンポーネントでOK(各担当が後で差し替え)
- `<RequireAuth>` ラッパーで未認証ユーザーを `/login` に飛ばす

## 完了条件
- 各 URL に遷移してそれっぽい仮画面が表示される
- ブラウザの戻る/進むが動く

## 関連
- 依存: [ux-01](./ux-01-auth.md)
- 後続: 全画面Issue
