# セットアップガイド

## クイックスタート（5分で起動）

### 1. プロジェクトのセットアップ

```bash
cd hubspot-sales-dashboard
npm install
```

### 2. HubSpot Access Tokenの取得

#### 方法A: 既存のトークンを使用（推奨）

現在のMCP接続で使用しているトークンをそのまま利用できます。

1. `.env.local`ファイルを作成:
```bash
cp .env.local.example .env.local
```

2. `.env.local`を編集してトークンを追加:
```env
HUBSPOT_ACCESS_TOKEN=pat-na2-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

#### 方法B: 新しいPrivate Appを作成

1. [HubSpot Private Apps](https://app.hubspot.com/developer/21080726/application)にアクセス
2. 「Create a private app」をクリック
3. アプリ名: `Sales Dashboard`
4. 必要なスコープを選択:
   - ✅ `crm.objects.deals.read`
   - ✅ `crm.schemas.deals.read`
5. 「Create app」→ トークンをコピー
6. `.env.local`に貼り付け

### 3. 開発サーバーを起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く

## 動作確認

正常に起動すると、以下が表示されます:

✅ ダッシュボードのメトリクスカード（5つ）
✅ パイプラインファネルチャート
✅ 案件一覧テーブル

## トラブルシューティング

### エラー: "Failed to fetch deals"

**原因**: HubSpot APIトークンが無効または権限不足

**解決方法**:
1. `.env.local`のトークンを確認
2. Private Appのスコープを確認
3. アプリが無効化されていないか確認

### エラー: "Module not found"

**原因**: 依存関係がインストールされていない

**解決方法**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### データが表示されない

**原因**: HubSpotに案件データがない

**解決方法**:
1. HubSpotでテスト案件を作成
2. 金額、ステージ、確度を設定
3. ダッシュボードをリロード

## カスタマイズオプション

### MEDDICスコアの追加

HubSpotにカスタムプロパティを追加:

1. Settings > Properties > Deal properties
2. Create property
   - Name: `meddic_score`
   - Type: Number (0-100)
3. 保存

`app/lib/hubspot.ts`を編集:
```typescript
// Line 23あたり
const response = await hubspotClient.crm.deals.basicApi.getPage(limit, undefined, [
  // 既存のプロパティ...
  'meddic_score',  // ← 追加
]);
```

### AI確度の追加

同様に`ai_probability`カスタムプロパティを作成し、案件テーブルに表示可能。

### 停滞日数の変更

デフォルトは7日ですが、変更可能:

`app/lib/analytics.ts` Line 24:
```typescript
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 14);  // 14日に変更
```

## デプロイ

### Vercelへのデプロイ

```bash
npm install -g vercel
vercel
```

Environment Variablesに追加:
- `HUBSPOT_ACCESS_TOKEN`: あなたのトークン

デプロイ完了後、URLが表示されます。

## 次のステップ

- [ ] カスタムプロパティ（MEDDIC、AI確度）の追加
- [ ] フィルター機能の実装（担当者、ステージ）
- [ ] 日付範囲選択の追加
- [ ] エクスポート機能（CSV、PDF）
- [ ] リアルタイム更新（Webhook連携）

## サポート

問題が発生した場合は、以下を確認してください:

1. Node.js バージョン: 18.17以上
2. npm バージョン: 9以上
3. HubSpot Access Token: 有効期限内
4. ネットワーク: HubSpot APIにアクセス可能

それでも解決しない場合は、GitHubのIssuesで報告してください。
