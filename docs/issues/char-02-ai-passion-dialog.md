# char-02: AIとの偏愛深掘り対話機能

## 概要
ユーザーが入力した偏愛に対して、AIが追加で質問を投げかけて深掘りすることで、より豊かな偏愛情報を集める対話UIと API を実装する。

## 目的
- 表面的なタグだけでなく「なぜ好きか」「どこに熱中しているか」を引き出す
- 後段のキャラ人格生成プロンプトに渡す情報量を増やす

## タスク
- Cloud Function `deepenPassion(initialText, history)` を `functions/src/passion/deepen.ts` に実装
  - OpenAI API (chat.completions または responses API) を呼び出し、次に聞くべき質問1つを返す
  - 3〜5往復で打ち切るロジック
- フロント側に対話UI(吹き出し形式)を実装し、ユーザーが回答を返すたびに Function を呼ぶ
- 対話の最終結果(全往復のサマリ)を `description` フィールドに反映できるようにする
- OpenAI APIキーは Functions の secret manager / `.env` に置く(README追記)

## 完了条件
- ローカルで対話が成立し、最終的にサマリ文字列が取得できる
- 失敗時(APIエラー)に画面でエラーメッセージが出る

## 関連
- 仕様書「6. AI関連機能」
- 依存: [char-01](./char-01-passion-registration-ui.md)
- 後続: [char-03](./char-03-passion-firestore.md), [char-04](./char-04-egg-generation.md)
