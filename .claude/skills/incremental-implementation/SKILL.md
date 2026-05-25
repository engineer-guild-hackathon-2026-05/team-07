---
name: incremental-implementation
description: 要件サマリが確定した後の実装フェーズで、1 機能ずつ・テスト or 動作検証を先回し・AGENTS.md / git-conventions.md 準拠を保ちながら進めるためのワークフローを駆動する。「実装して」「コード書いて」「PR 作って」「機能追加して」「これお願い」など実装着手リクエストが来たら必ず起動すること。要件サマリ or Issue ファイルが未確定なら先に `socratic-requirements-builder` を起動してから本スキルに戻る。実装フェーズでの巨大 PR・全部入り変更・検証後回し・規約違反を防ぐ最終ゲート。
---

# Incremental Implementation

要件確定後の実装フェーズで、「1 機能ずつ小さく・検証を先回し・規約準拠で・必要なら綺麗に書き直す」を駆動するスキル。

> このプロジェクトはエンジニアギルドハッカソン 2026/05 team-07「偏愛キャラクター育成アプリ」。技術スタックは **React 19 + Vite + TypeScript + TailwindCSS v4（`app/`）+ Firebase Cloud Functions（`app/functions/`）+ Firestore + Firebase Auth**。npm 管理。テストフレームワークは未導入のため、検証は「型・lint・実機動作確認」を主軸にする（必要なら vitest を導入する）。

## いつ起動するか

以下のいずれかに該当したら **自動起動** する：

- 要件サマリ（`docs/requirements/*.md`）または Issue ファイル（`docs/issues/*.md`）が既に存在する状態で実装着手の合図が来た
- 「実装して」「コード書いて」「PR 作って」「機能追加して」「これお願い」など実装フェーズへの遷移ワード
- 既存機能への中規模以上の追加・改修

**起動しないケース:**

- 要件サマリ・Issue ファイルが未確定 → 先に `socratic-requirements-builder` を起動し、合意済みサマリができてから戻る
- タイポ修正・1 行変更・既存 PR への小修正など意図が自明で TDD ループが過剰
- ユーザーが「すぐ書いて」「TDD いらない」と明示

## ワークフロー（6 Step）

### Step 1: Pre-flight（実装着手前の読み込み）

実装開始前に、必ず以下を読む：

1. リポジトリルートの `AGENTS.md`（Firestoreデータモデル＋セキュリティ規約。**必読**）
2. 対象機能の要件サマリ `docs/requirements/<feature>.md`、または該当 Issue `docs/issues/<id>.md`
3. `docs/rules/git-conventions.md`（ブランチ・コミット命名規約）
4. 関連ファイル：
   - フロント実装なら `app/src/firebase/firebase.ts`（Firebase 初期化）、`app/src/types/firestore.ts`（型定義）
   - Functions 実装なら `app/functions/src/index.ts`、`app/functions/src/types/`
   - セキュリティルール変更なら `app/firestore.rules`
5. 関連既存コードを軽くサーチ（Glob/Grep などファイル検索ツールが使える環境なら活用）

**なぜか:** プロジェクト固有規約（日本語コミットメッセージ・`prefix/Issue番号_desc` ブランチ命名・Firestore コレクション構造・セキュリティルール）を知らずに書き始めると、後で全面書き直しになる。`AGENTS.md` には **`.env` などの秘匿ファイル読み取り禁止** や **外部送信コマンド禁止** のセキュリティ規約もあるので必ず確認。

**作業ディレクトリの分岐（このPJ特有）:**

- フロント変更: `cd app && ...`
- Functions 変更: `cd app/functions && ...`
- ルール／インデックス変更: `app/firestore.rules`, `app/firestore.indexes.json`（`app/` 配下）

ルートでは npm スクリプトは動かない。コマンド実行時にカレントを意識する。

### Step 2: Scope cut（1 機能・1 PR の境界確定）

実装に入る前に「今回の PR で何を含めるか」を 1 文で書き出す。

**目安となる数値基準（テスト/型定義除く）:**

- 1 PR = **変更 300 行以下** または **5 ファイル以下**
- 超えそうなら必ず分割する。「ついで」の修正は別 PR に切り出す
- 例外: 自動生成ファイル・型定義の一括追加・Firestoreスキーマ移行など本質的に分割不能なもの

**ユーザーに提案型で確認:**

> 「今回の PR は『偏愛登録フォームの UI コンポーネント追加』のみに絞り、Firestore 保存処理は別PRにします。これで進めてよいですか？」

**ブランチ名はこのPJの規約に従う**（`docs/rules/git-conventions.md`）:

```
<prefix>/<Issue番号>_<英語の簡単な説明>
```
- 例: `feat/2_create_passion_ui`, `fix/15_qr_read_error`, `chore/3_add_tailwind`
- prefix は `feat` / `fix` / `chore` / `docs` / `refactor` から選ぶ

### Step 3: Worktree 判断（並行作業時のみ）

並行作業が発生する場合のみ `git worktree` で別ディレクトリを切り出す。常用ではない。

**worktree を使う条件:**

- 別機能を中断せずに割り込み作業を受けたい
- 同じファイルを 2 つの異なるアプローチで試したい（実験的試行）
- レビュー指摘対応中に別機能の開発を並行したい

該当しなければスキップしてよい。ハッカソンでは多くの場合不要。

```bash
git worktree add ../team-07-<feature> -b feat/<Issue番号>_<name>
```

### Step 4: 実装ループ（Red → Green → Refactor）

実装の中核。

#### このPJのテスト戦略（重要）

| 対象 | 検証方法 | TDD |
|---|---|---|
| **Cloud Functions（`app/functions/`）のビジネスロジック・データ変換・トリガー処理** | **vitest + firebase-functions-test** で TDD | **必須**（省略禁止） |
| Cloud Functions から呼ぶ純粋ユーティリティ（バリデーション、整形、スコアリングなど） | vitest で TDD | **必須** |
| React UI コンポーネント（見た目・操作フロー） | `npm run dev` で実機動作確認＋必要ならスクリーンショット | 任意 |
| React 内の純粋ロジック関数（`app/src/lib/` 等に切り出した分） | vitest で TDD | 推奨 |
| Firestore セキュリティルール | `firebase emulators:start --only firestore` でルール検証 | 余裕があれば |
| 一回限りの叩き台コード（捨てる前提） | テスト省略可、ただしユーザーに明示 | 不要 |

**バックエンド TDD は省略禁止。** Cloud Functions は本番でユーザーデータを直接操作するため、ロジックを「動いたっぽい」で済ませない。テストが書きにくいなら設計を疑う（依存方向・責務分離を見直す）。

#### バックエンドのテスト環境セットアップ（未導入なら Step 1 でやる）

`app/functions/package.json` にはまだテストランナーが入っていない（`firebase-functions-test` は devDependency に既にある）。**初回の Cloud Functions 実装着手時に必ず導入する**：

```bash
cd app/functions
npm install -D vitest @vitest/ui
```

`package.json` の scripts に追加：
```json
"test": "vitest",
"test:run": "vitest --run"
```

ルート（`app/functions/`）に `vitest.config.ts` を作成し、最低限：
```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: { environment: 'node', globals: true }
});
```

導入後、`src/**/*.test.ts` 形式でテストを置く。`firebase-functions-test` でモック化したコンテキストを使い、Firestore に触る処理は emulator 経由でテストする（または依存を引数注入してテスト可能な構造にする）。

#### フロントエンドのテスト導入（任意）

React 純粋ロジックを `app/src/lib/` 等に切り出した場合のみ：
```bash
cd app
npm install -D vitest jsdom
```
UI コンポーネントの実機確認は `npm run dev` で行うのが基本。Testing Library までは導入しない（ハッカソンでは過剰）。

#### Red: 失敗するテストを書く

- 要件サマリ／Issue の「成功条件」から 1 つ取り、それを検証するテストを書く
- まだ実装が無いのでテストは失敗する（Red）
- バックエンドでは Firestore 依存を直接 import せず、関数の引数で渡せる形に分離してテスト可能にする

#### Green: テストが通る最小コードを書く

- 美しさは後回し。テストを通すことだけ考える
- ハードコードでも OK。次の Red でテストの網が広がれば自然と一般化を強いられる

#### Refactor: コードを整理する

- テストが通り続ける範囲で重複を消し、命名を整え、責務を分ける
- リファクタ後に必ずテストを再実行

#### Post-change Verification（毎ループ末で必須）

変更後は必ず以下を実行する。1 つでも fail なら次のループに進まない：

**フロント変更時（`app/` 配下）:**

```bash
cd app
npm run lint                    # ESLint
npx tsc -b --noEmit             # 型チェック（tsconfig.json のプロジェクト参照を含む）
# あれば: npm run test -- --run  # vitest（導入済みなら）
npm run dev                     # ブラウザで実機動作確認（UI 変更時）
```

**Functions 変更時（`app/functions/` 配下）— テストは必須:**

```bash
cd app/functions
npm run test:run                # vitest（TDD 必須対象）
npm run lint                    # ESLint
npm run build                   # tsc コンパイル（型チェック兼ねる）
# 必要なら: firebase emulators:start --only functions  # 統合動作確認
```

テストが落ちている状態で次のループに進まない。lint・型エラーも同様。

**Firestore ルール／インデックス変更時:**

- `firebase deploy --only firestore:rules --dry-run` でルール文法チェック
- 余裕があれば emulator で実テスト

**(a) Claude がコマンド実行環境を持つ場合（推奨）:**

- 上記コマンドを直接実行する。複数並列で実行できるものは並列化（lint と tsc など独立コマンドは同時）
- 関連ファイルのみが速いコマンドがあればそれを優先する
- UI 変更は必ず `npm run dev` でブラウザ確認まで行う（型・lint だけでは UI バグは検出できない）

**(b) Claude がコマンドを実行できない環境の場合:**

ユーザーへ以下の標準プロンプトでログを依頼する：

> 「以下のコマンドを実行して、出力をそのまま貼り付けてください：
>   （フロント変更がある場合）
>   - `cd app && npm run lint`
>   - `cd app && npx tsc -b --noEmit`
>   （Functions も触ったなら）
>   - `cd app/functions && npm run test:run`
>   - `cd app/functions && npm run lint && npm run build`
> いずれか fail した場合、その出力を見て修正します。」

ユーザー負担を最小化するため、**全件実行ではなく変更したパッケージのみ**にする。

#### サブエージェント運用

実装ループの中で、規模・重要度に応じてサブエージェントを起動する。

| 役割 | 起動条件 | やること |
|---|---|---|
| **Reviewer**（必須） | 全ての実装ループ末 | `AGENTS.md` 準拠チェック・型/lint 結果の確認・Firestore セキュリティルール観点（ownerUid 一致など）・XSS/Injection 観点の素読み |
| **Architect**（任意） | 3 ファイル超 or 200 行超 or Firestoreスキーマ変更 or Cloud Functions のエンドポイント追加 が絡む時 | 実装前の設計レビュー・代替案の提示 |
| **Coder**（任意） | 上記 Architect 起動条件 + context 切り替えを避けたい時 | 設計に沿った実装の実行 |

**Reviewer 起動時の注意（confirmation bias 対策）:**

同一セッション内で Reviewer を呼ぶと、自分が書いたコードに引っ張られて「完璧です」と言いがち。これを防ぐため、Reviewer プロンプトには **必ず厳しい制約を入れる**：

> 「あえて批判的な視点で、`AGENTS.md` のセキュリティ規約違反・Firestore セキュリティルールとの整合性・テスト/型/lint でカバーされていないエッジケースを **最低 3 つ** 指摘してください。『問題なし』という結論は受け付けません。重箱の隅でも構わないので必ず 3 件挙げてください。」

**より高精度なレビューが必要な場合:**

- 重要機能（認証・交換ロジック・課金が絡むなら課金・Firestore セキュリティルール変更など）は、**別の Claude ウィンドウまたは別モデルにコードを投げてレビューさせる** 方が精度が高い
- 同一セッションでの Reviewer は妥協策と認識する

**重要:** Reviewer の指摘は次のループ前に対応する。先送り禁止。

### Step 5: Elegant rewrite チェック（完成後 1 回）

初版が完成してテスト（あれば）・型・lint が緑になり、実機動作が確認できたら、**1 度だけ** 以下のプロンプトで再実装を試す：

> 「Knowing everything you know now, scrap this and implement the elegant solution.」（今知っていること全部踏まえて、これを破棄してエレガントな解を実装してみて）

- 結果が初版より明確に良ければ採用、そうでなければ初版を残す
- 採否はユーザー判断に委ねる（diff を見せて選んでもらう）
- 1 度限り。無限ループに陥らない

**防衛策（必須）:**

「scrap this」と指示すると、ループでなんとか通した「泥臭いけれど重要なエッジケース」まで一緒に捨ててしまうことがある。これを防ぐ：

- **テストコード（あれば）自体は書き換えない**（実装中に追加した分岐・防御コードはテストが守る）
- テストが無いフロント UI なら、要件サマリ／Issue の「成功条件」チェック項目を1つずつ実機で再確認
- 再実装後、**前ステップで通した条件・テストケースが全て緑のままであることを確認**
- 再実装版が既存テストを 1 つでも落としたら、その時点で破棄して初版に戻す
- 再実装版を採用する場合も、テスト全件（あれば）+ 型 + lint + 実機確認の Post-change Verification を再走させる

**なぜか:** 初実装は要件理解の途上で書かれる。1 回まわした後に「最初から知っていたら」の視点で書き直すと、不要な抽象や寄り道が消えやすい。ただしエッジケース対応は「途中で気づいた価値」なので、テスト or 成功条件チェックで保護することで失わない。

**ハッカソンでの判断:** 期間が短い場合、Elegant rewrite は **Day3 以降の余裕がある時** に限定して良い。Day1/Day2 は動くものを優先。

### Step 6: Context hygiene（セッション切替時 or 長期化時）

以下のタイミングで `docs/handoff/<feature>.md` に書き出す：

- セッションを跨ぐ／別の人（含・次の Claude セッション、または他のチームメンバー）に引き継ぐ可能性がある
- 作業が 1 セッションで終わらず、context window が膨れてきた
- 中断する（割り込み・休憩・退勤）

ディレクトリが無ければ `mkdir -p docs/handoff` で作成する。

**フォーマット（厳守）:**

```markdown
# <機能名> 引き継ぎ

最終更新: <YYYY-MM-DD>
状態: 設計中 / 実装中 / レビュー待ち / マージ可
対応Issue: <docs/issues/xxx.md があればリンク>
ブランチ: <feat/X_xxx>

## 完了済み
- [x] ...

## 進行中
- [ ] <今やっていたこと>（次の一歩: ...）

## 未着手
- [ ] ...

## 詰まっている点 / 仮定
- ...

## 関連ファイル
- 要件サマリ: docs/requirements/<feature>.md or docs/issues/<id>.md
- 触っているコード: <例: app/src/components/PassionForm.tsx, app/functions/src/index.ts>
- 関連 issue/PR: ...
```

## コミット・PRのお作法

`docs/rules/git-conventions.md` に従う。要点：

- **コミットメッセージは日本語OK、Conventional Commits 準拠**: `feat: 偏愛入力用のフォームコンポーネントを作成`
- prefix と `:` の後に半角スペース1つ
- prefix: `feat` / `fix` / `chore` / `docs` / `refactor` / `style`
- PR 本文には `Close #<Issue番号>` を必ず入れる（マージで Issue 自動クローズ）
- PR タイトルもコミット同様の形式

## ユーザー確認の上限

- ユーザーへの選択肢提示は **最大 3 ターンまで**
- それを超えそうなら、その時点の情報＋合理的仮定で進め、仮定を `docs/handoff/<feature>.md` の「詰まっている点 / 仮定」セクションに明記する
- ユーザーに「これでいいですか？」と聞くときは Yes/No か選択肢で答えられる形にする（オープン質問は避ける）

## アンチパターン

- ❌ 要件サマリ・Issue ファイル・`AGENTS.md` を読まずに着手する
- ❌ Firestore コレクション構造を `AGENTS.md` で確認せず、勝手にスキーマを決める
- ❌ `firestore.rules` 変更を伴うのに、認可ロジックの検証を後回しにする
- ❌ 1 PR に複数機能を詰め込む（300 行超・5 ファイル超を放置）
- ❌ Post-change Verification（lint・型・実機 or テスト）をスキップする
- ❌ `app/` で実行すべきコマンドをリポジトリルートで実行して「動かない」と言う
- ❌ ブランチ名・コミットメッセージが `docs/rules/git-conventions.md` 規約から外れている
- ❌ Issue番号を入れずに PR を作る（`Close #N` 漏れも含む）
- ❌ UI 変更時にブラウザで実機確認せず「完了」と報告する
- ❌ **Cloud Functions のロジックをテストなしで書く**（バックエンド TDD は省略禁止）
- ❌ `app/functions/` にテストランナー未導入の状態で Cloud Functions 実装を進める（Step 1 で vitest を入れる）
- ❌ Firestore に直接依存した Cloud Functions コードを書いてテストできない構造にする（依存注入で分離せよ）
- ❌ Reviewer に制約なしで「レビューして」と振り、「問題なし」を鵜呑みにする
- ❌ Elegant rewrite で **テストコードまで** 書き換える／既存テストが落ちたまま採用する
- ❌ 些細な修正にもサブエージェント 3 体（Reviewer/Architect/Coder）を全部起動する（過剰）
- ❌ Reviewer の指摘を「後で直す」と先送りする
- ❌ Elegant rewrite を何度もループする（1 度限り）
- ❌ 並行作業しないのに worktree を切る（無駄な複雑化）
- ❌ Context hygiene をしないまま長セッションを跨ぐ
- ❌ `.env` などの秘匿ファイルを読もうとする（`AGENTS.md` で禁止）

## 関連スキル

- `socratic-requirements-builder`: 要件確定段階のスキル。本スキル起動時に要件サマリ／Issue ファイルが無ければ先にこちらを呼ぶ
- `verify`: 実機動作確認をしたいときに使う。本スキル Step 4 の Post-change Verification と組み合わせると良い
