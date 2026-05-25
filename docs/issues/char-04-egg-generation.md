# char-04: キャラクター卵生成Cloud Function

## 概要
偏愛情報から OpenAI でキャラクター人格を生成し、`eggs` コレクションに保存する Cloud Function を実装する。

## 目的
- 偏愛を「交換可能なキャラクター卵」というオブジェクトに変換する
- 交換・育成機能の入力データを用意する

## タスク
- `functions/src/egg/createEgg.ts` に `createEgg({ passionIds })` を実装
- 処理フロー:
  1. 指定 passion を読み込み(複数対応)
  2. OpenAI に「これらの偏愛から、ユーザーを代弁するAIキャラの人格・口調・口癖・性格を JSON で出力して」と依頼
  3. 返ってきた JSON を `characterPrompt` フィールドに保存
  4. `eggs/{eggId}` ドキュメントを作成
     - `sourceUserUid`, `basedOnPassionIds`, `characterPrompt`, `hatchLevel: 0`, `createdAt`, `currentOwnerUid: sourceUserUid`
- Functions の callable として export
- フロント `app/src/firebase/egg.ts` から呼び出すラッパーを作成

## 完了条件
- 偏愛登録完了後、卵が生成され Firestore に保存される
- 生成された卵がホーム画面の自分の卵一覧に表示される(表示は [char-05](./char-05-egg-display.md) で)

## 関連
- 依存: [char-03](./char-03-passion-firestore.md), [infra-02](./infra-02-data-model.md)
- 後続: [char-05](./char-05-egg-display.md), [exch-03](./exch-03-exchange-function.md)
