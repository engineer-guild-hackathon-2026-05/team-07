# infra-01: Firestoreセキュリティルール整備

## 概要
現状 `app/firestore.rules` は全アクセス拒否になっている。本サービスの権限要件に合わせて、認証済みユーザーが必要最小限のドキュメントにアクセスできるよう整備する。

## 目的
- 不正アクセスを防ぎつつ、各機能が正常に動作するルールを定義する
- 後続のフロント/Cloud Function実装が前提とできる権限境界を確立する

## タスク
- `users/{uid}`: 本人のみ作成・更新可、認証済みなら read 可
- `passions/{passionId}`: `ownerUid == request.auth.uid` のみ書き込み可、`visibility == 'public'` または所有者なら read 可
- `eggs/{eggId}`: 作成は Cloud Function 経由のみ、`currentOwnerUid` のみ read 可
- `characters/{characterId}`: 関連 egg の `currentOwnerUid` のみ read/update 可
- `exchanges/{exchangeId}`: 作成は Cloud Function、read は `fromUid`/`toUid` のみ
- `chats/{chatId}`: `userUid` 本人のみ read/write 可
- Firestore エミュレータ向けの簡易テストを `app/test/firestore-rules.test.ts` などで用意(余裕があれば)

## 完了条件
- `firebase emulators:exec` でローカル動作確認できる
- 本人以外がパッションを書き換えできないことが確認できる

## 関連
- 仕様書「8. 権限」
- 依存: なし(他Issueの前提となるので最優先)
