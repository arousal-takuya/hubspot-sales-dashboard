# デプロイガイド - GitHub & Vercel

## 🚀 GitHub & Vercel へのデプロイ手順

### ステップ1: GitHubリポジトリの作成

#### A. GitHub Web UIを使用（推奨）

1. **GitHubにログイン**: https://github.com
2. **新規リポジトリ作成**:
   - 右上の「+」→「New repository」をクリック
   - Repository name: `hubspot-sales-dashboard`
   - Description: `HubSpot Sales Dashboard with Evidence-Based Intelligence`
   - Visibility: Public (または Private)
   - **チェックを入れない**: Initialize this repository with a README
3. **リポジトリを作成**: 「Create repository」をクリック

#### B. リモートリポジトリの設定

ターミナルで以下を実行:

```bash
cd /Users/takuya-sato/Downloads/Claude作業用/hubspot-sales-dashboard

# GitHubのリモートを追加（YOUR_USERNAMEを自分のユーザー名に置き換え）
git remote add origin https://github.com/YOUR_USERNAME/hubspot-sales-dashboard.git

# メインブランチの確認
git branch -M main

# プッシュ
git push -u origin main
```

**認証が求められた場合**:
- Username: GitHubのユーザー名
- Password: Personal Access Token（PAT）を使用
  - https://github.com/settings/tokens で生成
  - スコープ: `repo` をチェック

### ステップ2: Vercelへのデプロイ

#### A. Vercelアカウントの作成/ログイン

1. https://vercel.com にアクセス
2. 「Sign Up」または「Log in」
3. GitHubアカウントで認証

#### B. プロジェクトのインポート

1. **New Project**をクリック
2. **Import Git Repository**:
   - GitHubアカウントを接続（初回のみ）
   - `hubspot-sales-dashboard`リポジトリを選択
   - 「Import」をクリック

#### C. プロジェクト設定

**Configure Project**画面で以下を設定:

1. **Project Name**: `hubspot-sales-dashboard` (デフォルトのまま)
2. **Framework Preset**: Next.js（自動検出される）
3. **Root Directory**: `.` (デフォルトのまま)
4. **Build and Output Settings**: デフォルトのまま

#### D. 環境変数の設定

**Environment Variables**セクション:

1. **Add**をクリック
2. 以下を入力:
   - **Name**: `HUBSPOT_ACCESS_TOKEN`
   - **Value**: `your-hubspot-access-token-here`
   - **Environment**: Production, Preview, Development（すべてチェック）
3. **Save**をクリック

#### E. デプロイ実行

1. **Deploy**ボタンをクリック
2. ビルドが開始されます（通常1-3分）
3. 完了すると以下が表示されます:
   - ✅ Build Completed
   - 🌐 デプロイURL: `https://hubspot-sales-dashboard-xxx.vercel.app`

### ステップ3: デプロイの確認

1. **Visit**ボタンをクリックして本番サイトを確認
2. ダッシュボードが正しく表示されることを確認
3. HubSpotデータが読み込まれることを確認

---

## 🔄 更新のデプロイ

コードを更新した場合、以下の手順で自動デプロイされます:

```bash
# 変更をコミット
git add -A
git commit -m "機能追加: 〇〇"

# GitHubにプッシュ
git push origin main
```

→ Vercelが自動的に新しいデプロイを開始

---

## 🛠️ カスタムドメインの設定（オプション）

### 独自ドメインを使用する場合:

1. **Vercelダッシュボード**:
   - プロジェクト → Settings → Domains
2. **Add Domain**をクリック
3. ドメイン名を入力（例: `sales.yourdomain.com`）
4. DNSレコードの設定:
   - ドメインレジストラでCNAMEレコードを追加
   - Name: `sales` (または任意のサブドメイン)
   - Value: `cname.vercel-dns.com`
5. 検証完了後、HTTPSが自動で有効化

---

## 🔐 セキュリティ設定

### 環境変数の保護

- ✅ `.env.local` はGitに含まれない（`.gitignore`で除外済み）
- ✅ Vercelの環境変数は暗号化されて保存
- ✅ トークンはサーバーサイドでのみ使用

### アクセストークンの更新

HubSpotトークンを更新する場合:

1. Vercel Dashboard → Settings → Environment Variables
2. `HUBSPOT_ACCESS_TOKEN` を編集
3. 新しい値を入力してSave
4. **Redeploy**をクリックして反映

---

## 📊 デプロイステータスの確認

### Vercel Dashboard

- **Deployments**: デプロイ履歴を確認
- **Analytics**: トラフィック分析
- **Logs**: エラーログの確認

### デプロイURL

- **本番**: `https://hubspot-sales-dashboard.vercel.app`
- **プレビュー**: PR毎に自動生成（`https://hubspot-sales-dashboard-git-branch.vercel.app`）

---

## 🐛 トラブルシューティング

### ビルドエラー

**エラー**: `Module not found`

**解決方法**:
```bash
# 依存関係を再インストール
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

### 環境変数エラー

**エラー**: `Failed to fetch deals`

**解決方法**:
1. Vercel Dashboard → Settings → Environment Variables
2. `HUBSPOT_ACCESS_TOKEN` が正しく設定されているか確認
3. トークンの有効期限を確認
4. Redeployを実行

### デプロイが失敗する

**原因**: ビルド時間オーバー、メモリ不足

**解決方法**:
- Vercelの無料プランでは制限あり
- Pro プランへのアップグレードを検討

---

## 📝 次のステップ

### プロダクション最適化

1. **パフォーマンス改善**:
   - キャッシュ戦略の実装
   - ISR（Incremental Static Regeneration）の活用

2. **監視設定**:
   - Vercel Analytics の有効化
   - エラートラッキング（Sentry など）

3. **CI/CD 強化**:
   - GitHub Actions でテスト自動化
   - プレビューデプロイでレビュー

---

## ✅ チェックリスト

デプロイ前の確認:

- [ ] `.env.local` がGitに含まれていない
- [ ] `package.json` の依存関係が最新
- [ ] ビルドがローカルで成功する（`npm run build`）
- [ ] HubSpot Access Token が有効
- [ ] 本番環境でのテストデータ確認

---

**現在の状態**:
- ✅ Git リポジトリ初期化済み
- ✅ ライトモードデザイン適用済み
- ✅ HubSpot API連携済み
- 🔄 GitHubへのプッシュ待機中
- 🔄 Vercelへのデプロイ待機中

**推奨される次のアクション**:
1. GitHubリポジトリを作成
2. リモートを設定してプッシュ
3. Vercelで import してデプロイ
