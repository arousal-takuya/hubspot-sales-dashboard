# 🚀 クイックデプロイガイド

## ステップ1: GitHubリポジトリを作成

1. https://github.com/new にアクセス
2. Repository name: `hubspot-sales-dashboard`
3. Public を選択
4. **「Initialize this repository with a README」のチェックを外す**
5. 「Create repository」をクリック

## ステップ2: コードをプッシュ

以下のコマンドを実行（YOUR_USERNAMEは自分のGitHubユーザー名に置き換え）:

```bash
cd /Users/takuya-sato/Downloads/Claude作業用/hubspot-sales-dashboard

git remote add origin https://github.com/YOUR_USERNAME/hubspot-sales-dashboard.git
git branch -M main
git push -u origin main
```

**認証が求められた場合**:
- Username: GitHubユーザー名
- Password: Personal Access Token
  - https://github.com/settings/tokens で作成
  - スコープ: `repo` をチェック

## ステップ3: Vercelにデプロイ

1. https://vercel.com/new にアクセス
2. 「Import Git Repository」
3. GitHubアカウントを接続
4. `hubspot-sales-dashboard` を選択して「Import」

## ステップ4: 環境変数を設定

「Environment Variables」セクションで:

- **Name**: `HUBSPOT_ACCESS_TOKEN`
- **Value**: `your-hubspot-access-token-here`
- **Environments**: Production, Preview, Development（全てチェック）

「Deploy」をクリック！

---

## ✅ 完成！

数分後、デプロイURLが表示されます:
- `https://hubspot-sales-dashboard-xxx.vercel.app`

---

## 🎨 デザイン仕様

現在のデザイン:
- ✅ ライトモード（白基調）
- ✅ 青グラデーション背景 (#0052d4 → #4364f7 → #6fb1fc)
- ✅ グラスモーフィズム（glass-card）
- ✅ モダンなUI/UX

---

## 📝 次回の更新方法

コードを変更したら:

```bash
git add -A
git commit -m "Update: 変更内容"
git push
```

→ Vercelが自動でデプロイ！
