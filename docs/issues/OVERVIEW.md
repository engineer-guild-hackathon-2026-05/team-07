# Issue 概要一覧

偏愛キャラクター育成アプリ / 4人並行開発用 / 全22件

## 担当割当の目安
- **A**: キャラ生成 (`char-01`〜`char-05`)
- **B**: 交換 (`exch-01`〜`exch-04`)
- **C**: 成長 (`grow-01`〜`grow-05`)
- **D**: UI/UX・基盤 (`ux-01`〜`ux-06`, `infra-01`, `infra-02`)

## マイルストーン
1. **Day 1 基盤**: `infra-01` / `infra-02` / `ux-01` / `ux-02` / `ux-06`
2. **Day 2-3 機能第1弾**: `char-01`〜`char-04` / `exch-01`〜`exch-03` / `grow-01`〜`grow-03` / `ux-03` / `ux-04`
3. **Day 4 機能第2弾**: `char-05` / `exch-04` / `grow-04` / `grow-05` / `ux-05`
4. **Day 5**: 統合・デモ準備

---

## 基盤
| ID | タイトル | 概要 |
|----|---------|------|
| infra-01 | Firestoreセキュリティルール整備 | 全拒否ルールを各コレクションの権限要件に合わせて書き換え |
| infra-02 | データモデル(型)定義 | `User`/`Passion`/`Egg`/`Character`/`Exchange`/`Chat` のTS型とコレクション名定数を共通化 |

## キャラ生成
| ID | タイトル | 概要 |
|----|---------|------|
| char-01 | 偏愛登録画面UI | タイトル/自由記述/タグ/公開範囲を入力するページを作成 |
| char-02 | AIとの偏愛深掘り対話 | OpenAI で 3〜5往復の質問を投げ、偏愛をより深く言語化する |
| char-03 | 偏愛のFirestore保存 | `passions` コレクションへの create / 自分の一覧取得 |
| char-04 | キャラクター卵生成Function | 偏愛から OpenAI でキャラ人格JSONを生成し `eggs` に保存 |
| char-05 | 卵表示UIコンポーネント | `EggCard` を作りホーム・プロフィール・交換画面で再利用 |

## 交換
| ID | タイトル | 概要 |
|----|---------|------|
| exch-01 | QRコード生成・表示 | 渡す卵を選び、一時トークン入りQRを表示する画面 |
| exch-02 | QRコード読み取り | カメラでQRを読み、交換Functionを呼ぶ |
| exch-03 | 交換処理Function | 卵の `currentOwnerUid` 移転と `exchanges` への記録をアトミックに |
| exch-04 | 交換履歴画面 | 自分が関わった交換の時系列リスト |

## 成長
| ID | タイトル | 概要 |
|----|---------|------|
| grow-01 | 育成画面の骨組み | キャラのビジュアル・各種メーター・トピック導線を統合するハブ画面 |
| grow-02 | チャットUI | LINE風吹き出し・入力フォーム・自動スクロール |
| grow-03 | チャット送受信Function | `characterPrompt` を system に、履歴付きでOpenAIに投げ Firestore に追記 |
| grow-04 | 育成進行度・知識レベル管理 | 会話で `growthLevel` / `knowledgeAreas` / `affinityScore` を更新し画面表示 |
| grow-05 | 話題解放システム | レベル閾値ごとに `unlockedTopics` を1つ解放、system promptにも反映 |

## UI/UX
| ID | タイトル | 概要 |
|----|---------|------|
| ux-01 | Firebase Authログイン | Google + Anonymous、初回時に `users` を作成、保護ルート対応 |
| ux-02 | ルーティング設定 | React Router 導入、各画面に仮ルートを敷く |
| ux-03 | 共通ナビゲーションバー | 下部固定タブで Home / 偏愛追加 / 交換 / Profile |
| ux-04 | ホーム画面 | 自分のキャラ・最近交換した卵・育成中キャラ・CTA |
| ux-05 | プロフィール画面 | ユーザー情報 / 偏愛一覧 / 交換履歴 / 育成キャラ / ログアウト |
| ux-06 | デザインシステム整備 | Tailwindトークンと基本UIコンポーネント (Button / TextField / TagInput など) |

---

詳細仕様は各Issueファイル (`./<id>-*.md`) を参照。
