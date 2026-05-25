# grow-01: キャラクター育成画面の骨組み

## 概要
卵から孵化したキャラクターを育成するメイン画面のレイアウトを作る。

## 目的
- チャット、育成状況、解放トピックなど複数機能を一画面に統合するハブを用意する

## タスク
- ルート `/characters/:characterId` (`app/src/pages/CharacterDetail.tsx`)
- レイアウト:
  - 上部: キャラクターのビジュアル(`EggCard` の発展版 or 仮絵文字)
  - 中央: 知識レベル・育成進行度・親密度のメーター
  - 下部: チャット入口ボタン + 解放トピック一覧
- `characters/{characterId}` の購読(リアルタイムで進行度反映)
- 該当キャラへのアクセス権チェック(currentOwnerUidが自分でない場合は404)

## 完了条件
- ダミーキャラ1体で画面が表示できる
- リロードしても状態が保持される

## 関連
- 依存: [exch-03](./exch-03-exchange-function.md), [infra-02](./infra-02-data-model.md)
- 後続: [grow-02](./grow-02-chat-ui.md), [grow-04](./grow-04-growth-level.md), [grow-05](./grow-05-topic-unlock.md)
