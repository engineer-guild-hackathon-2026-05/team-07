# ux-01: Firebase Authログイン

## 概要
Firebase Authentication を用いたログイン/サインアップ画面を作る。

## 目的
- 全機能の前提となるユーザー識別を確立する
- `users/{uid}` ドキュメントを初回ログイン時に作成する

## タスク
- 認証方式: Google サインインを第一選択、Anonymous(ハッカソンデモ用)も併設
- `app/src/firebase/auth.ts` に `signInWithGoogle()`, `signOut()`, `useAuth()` フックを実装
- ログイン画面 `/login` (`app/src/pages/Login.tsx`)
- 初回ログイン時、`users/{uid}` ドキュメントが無ければ `name`/`iconUrl`/`createdAt`/`favoriteTags: []` で作成
- 未ログイン時に保護ルートへアクセスしたら `/login` にリダイレクト (`<RequireAuth>` 相当のラッパー)

## 完了条件
- Google ログイン後、ホーム画面に遷移する
- リロード後もログイン状態が維持される
- `users` コレクションにドキュメントが生成される

## 関連
- 仕様書「6. ユーザー機能 / ログイン」
- 依存: なし
- 後続: 全機能の前提
