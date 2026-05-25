# Firebase デプロイ CI/CD パイプライン

最終更新: 2026-05-24
ステータス: 要件確定
対応Issue: なし（新規。必要なら後で `docs/issues/infra-03-cicd-pipeline.md` を起こす）

## 目的（Why）

開発メンバーが手動で `firebase deploy` を叩く運用は、

- デプロイ作業者の手間と属人化
- 「ローカルで動いた」ものがそのまま本番に出るリスク
- チームメンバーが PR の見た目を確認する手段が「自分でローカル起動」しかない

という課題がある。GitHub Actions による自動デプロイ＋PRプレビュー環境を整備し、**コードを上げた瞬間にチーム全員が本番URL／プレビューURLで動作確認できる状態** にする。ハッカソン期間中の開発スピードと品質を両立させる。

## スコープ

### 含むもの

- GitHub Actions ワークフロー（`.github/workflows/` 配下）の新規作成
- 対象デプロイ成果物（3種すべて）:
  - **Firebase Hosting**（`app/` の React フロント、Vite ビルド成果物）
  - **Cloud Functions**（`app/functions/`、Node 22）
  - **Firestore rules / indexes**（`app/firestore.rules`, `app/firestore.indexes.json`）
- トリガー2系統:
  - `dev` ブランチへの push → **本番 Firebase プロジェクトへフルデプロイ**
  - PR の open / synchronize → **Firebase Hosting Preview Channel に一時デプロイ**し、PRに preview URL をコメント
- PR時の品質ゲート（最低限）:
  - `app/` の `npm run lint` と `npm run build`（型チェック含む）
  - `app/functions/` の `npm run lint` と `npm run build`
- Firebase 認証用シークレット運用ルール（GitHub Secrets 命名と設定手順）の README 追記

### 含まないもの（明示的に対象外）

- staging / production の環境分離（Firebase プロジェクトは1つのみ運用）
- E2E / 単体テスト実行（このリポにテストが存在しないため。将来追加時に拡張）
- 自動リリースノート生成・タグ付け
- Cloud Functions のリージョン別デプロイ最適化
- 本番障害時のロールバック自動化（手動で `firebase hosting:rollback` 等で対応）
- `main` ブランチでの自動デプロイ（今回のフローでは `dev` を本番反映ブランチとして扱う）

## 成功条件（Definition of Done）

- [ ] `.github/workflows/deploy.yml`（本番デプロイ）と `.github/workflows/preview.yml`（PRプレビュー）の2ファイルが存在する
- [ ] `dev` ブランチへの push をトリガに、Hosting + Functions + Firestore rules/indexes が自動でデプロイされる
- [ ] PR を open または push 更新すると、Firebase Hosting Preview Channel に一時デプロイされ、PR に preview URL が自動コメントされる
- [ ] PR の checks に lint / build（型チェック）が表示される
- [ ] CI が落ちている PR は GitHub の保護ブランチ設定でマージブロックできる（設定手順をドキュメント化）
- [ ] GitHub Secrets に必要なキー（後述）が設定済みで、ワークフローが緑（success）になる
- [ ] `README.md` または `docs/rules/` に CI/CD 運用方法の章が追加されている

## 制約

- **技術**:
  - GitHub Actions（macOS/ubuntu-latest）
  - Node.js 22（`app/functions/package.json` の `engines.node` に揃える）
  - Firebase CLI（`firebase-tools`）
  - 公式 Action `FirebaseExtended/action-hosting-deploy@v0`（Hosting + Preview Channel 用）
  - Functions / Firestore rules は `firebase deploy --only ...` を Action 内で実行
- **データ**: Firestore スキーマ変更は伴わない（`AGENTS.md` のデータモデルに影響なし）
- **セキュリティ**:
  - Firebase Service Account JSON は GitHub Secrets で管理し、平文コミット禁止
  - PR の preview デプロイは fork からの PR では実行しない（Service Account 漏洩防止 — `pull_request_target` を避け、同一リポからの PR のみ対応）
  - `AGENTS.md` の「Secret 値を出力しない／curl/wget の禁止」に準拠
- **期限**: ハッカソン中の早期日（Day 1〜2 のうちに整備しておくと残り日で恩恵が大きい）
- **その他規約**:
  - ブランチ名・コミット規約は `docs/rules/git-conventions.md` に準拠（`chore/<n>_setup_cicd` 形式）

## 主な振る舞い

- **正常系（dev push）**:
  1. 開発者が `dev` に push（直接 or PR マージ）
  2. Actions が起動 → `app/` と `app/functions/` で `npm ci` → lint → build
  3. すべて通れば Hosting / Functions / Firestore rules/indexes をデプロイ
  4. 本番 URL（`https://<project-id>.web.app`）で即確認可能
- **正常系（PR）**:
  1. 開発者が PR を open
  2. Actions が lint / build を実行 → 通れば Preview Channel にデプロイ
  3. PR に bot コメントで preview URL が貼られる（例: `https://<project>--pr-42-xxx.web.app`）
  4. PR を close / merge すると Preview Channel は自動削除
- **異常系**:
  - lint / build 失敗 → デプロイ実行されず PR check が赤、Slack 等への通知は今回スコープ外
  - Service Account シークレット未設定 → ワークフロー失敗、README に設定手順を記載してリカバリ
  - Functions デプロイのみ失敗 → Hosting は既にデプロイ済みになる可能性あり（部分失敗を許容、手動でリトライ）
- **境界条件**:
  - `dev` 以外のブランチへの push ではデプロイしない（PR を作って初めて preview）
  - fork からの PR では Secrets が露出するため preview をスキップし、lint/build のみ実行
  - 同一 PR への連続 push は最新 commit のみデプロイ（古いジョブは concurrency でキャンセル）

## 未確定事項

- [ ] Firebase プロジェクト ID（本番）— 実装時にユーザーから確認
- [ ] Service Account の発行が済んでいるか、未済なら発行手順から案内するか
- [ ] `app/firebase.json` の `hosting.frameworksBackend.region: asia-east1` は Firebase の Web Frameworks 機能を使う設定 — Preview Channel が Web Frameworks と組み合わせて動くか要検証（必要なら静的ビルド出力先を `dist/` に変更）
- [ ] 既存メンバー4名のうち、Service Account 設定操作を実施できる権限保持者は誰か
- [ ] 本番デプロイの通知（Slack / Discord）— 今回は対象外だが将来要否を再検討

## 関連

- 仕様書: 本ファイル
- 関連コード:
  - `app/firebase.json`（Hosting / Functions / Firestore 設定）
  - `app/package.json`（フロント scripts）
  - `app/functions/package.json`（Functions scripts、Node 22）
  - `app/firestore.rules`, `app/firestore.indexes.json`
- 関連規約:
  - `docs/rules/git-conventions.md`
  - `AGENTS.md`（Security & Anti-Exfiltration Rules — シークレット運用に直結）
- 関連 issue/PR: なし（本要件で新規ブランチ `chore/<n>_setup_cicd` を切る想定）
