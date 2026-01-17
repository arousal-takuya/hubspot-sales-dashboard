# クイックスタートガイド

## 🚀 5分で起動

### 1. 依存関係のインストール（初回のみ）

```bash
cd hubspot-sales-dashboard
npm install
```

### 2. 環境変数の設定（初回のみ）

`.env.local`ファイルはすでに設定済みです。

### 3. サーバー起動

```bash
npm run dev
```

### 4. ブラウザでアクセス

http://localhost:3000

## ✅ 動作確認

以下が表示されれば成功です：

- ✅ 5つのメトリクスカード（担当者手当合計、AI調査進予測など）
- ✅ パイプラインファネルチャート（9つのステージ）
- ✅ 案件一覧テーブル（最大100件）
- ✅ Micro-Agentsステータス

## 📊 現在のデータ状況

- **総案件数**: 100件（HubSpotから取得）
- **パイプライン**: "default"（9ステージ）
- **更新頻度**: ページリロード時

## 🔧 カスタマイズ

### 取得件数を増やす

`app/lib/hubspot.ts`の`getAllDeals()`関数：

```typescript
export async function getAllDeals(limit: number = 200) { // 100 → 200に変更
```

### 特定のパイプラインを指定

`app/api/hubspot/metrics/route.ts`：

```typescript
const stages = await getPipelineStages('your-pipeline-id');
```

### フィルタリングを有効化

`app/lib/hubspot.ts`の`getOpenDeals()`：

```typescript
return allDeals.filter(deal => {
  // オープン案件のみ
  return deal.properties.hs_is_closed !== 'true';
});
```

## 🐛 トラブルシューティング

### データが表示されない

```bash
# サーバーログを確認
tail -f /tmp/claude/-Users-takuya-sato-Downloads-Claude---/tasks/b527a68.output
```

### APIエラー

- `.env.local`のトークンを確認
- HubSpot Private Appのスコープを確認（`crm.objects.deals.read`）

### ポートが使用中

```bash
# 3000ポートを使用しているプロセスを確認
lsof -i :3000
# 停止する場合
kill -9 <PID>
```

## 📝 次の改善案

1. **リアルタイム更新**: 自動リフレッシュ機能
2. **フィルター**: 日付範囲、担当者、ステージ
3. **エクスポート**: CSV、PDFダウンロード
4. **詳細ビュー**: 案件の詳細情報モーダル
5. **カスタムプロパティ**: MEDDIC、AI確度の追加

## 🌐 デプロイ

### Vercel（推奨）

```bash
npm install -g vercel
vercel
```

環境変数を設定：
- `HUBSPOT_ACCESS_TOKEN`: あなたのトークン

## 📞 サポート

問題が発生した場合：
1. README.mdを確認
2. SETUP_GUIDE.mdの詳細手順を確認
3. GitHubでIssueを作成

---

**現在の状態**: ✅ 稼働中
**アクセスURL**: http://localhost:3000
**HubSpot連携**: ✅ 100件の案件データ取得済み
