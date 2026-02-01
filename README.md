# HubSpot Sales Dashboard - Evidence-Based

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/arousal-takuya/hubspot-sales-dashboard)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22.0.0-blue)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/next.js-15.5-black)](https://nextjs.org/)

HubSpotのCRMデータと連携したエビデンスベース営業管理ダッシュボード

![Dashboard Preview](https://via.placeholder.com/800x400?text=Dashboard+Preview)

## 機能

### 主要メトリクス
- **担当者手当合計**: 全アクティブ案件の金額合計
- **AI調査進予測**: 確度加重による予測金額
- **予選通過率**: ステージ通過率の可視化
- **停滞案件**: 7日以上更新のない案件を自動検知
- **平均MEDDICスコア**: 案件品質スコア

### 可視化機能
- **パイプラインファネル**: ステージ別の案件金額と件数
- **案件一覧テーブル**: AI確度、MEDDIC進捗、ブロッカーステータス
- **Micro-Agentsステータス**: 各種エージェントの稼働状態

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **チャート**: Recharts
- **HubSpot連携**: @hubspot/api-client
- **アイコン**: lucide-react

## セットアップ

### 1. 依存関係のインストール

```bash
cd hubspot-sales-dashboard
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、HubSpot Access Tokenを設定:

```bash
cp .env.local.example .env.local
```

`.env.local`を編集:

```env
HUBSPOT_ACCESS_TOKEN=your_hubspot_access_token_here
```

### 3. HubSpot Access Tokenの取得方法

1. HubSpotアカウントにログイン
2. Settings（設定） > Integrations（統合） > Private Apps（プライベートアプリ）に移動
3. 「Create a private app」をクリック
4. アプリ名を設定（例: "Sales Dashboard"）
5. 必要なスコープを選択:
   - `crm.objects.deals.read` - 案件の読み取り
   - `crm.schemas.deals.read` - 案件スキーマの読み取り
6. 「Create app」をクリックしてトークンを生成
7. 生成されたAccess Tokenをコピーして`.env.local`に貼り付け

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開く

## プロジェクト構造

```
hubspot-sales-dashboard/
├── app/
│   ├── api/
│   │   └── hubspot/
│   │       ├── deals/route.ts      # 案件データAPI
│   │       └── metrics/route.ts    # メトリクス集計API
│   ├── components/
│   │   ├── MetricCard.tsx          # メトリクスカード
│   │   ├── PipelineFunnel.tsx      # ファネルチャート
│   │   └── DealsTable.tsx          # 案件テーブル
│   ├── lib/
│   │   ├── hubspot.ts              # HubSpot API連携
│   │   └── analytics.ts            # データ集計ロジック
│   ├── types/
│   │   └── index.ts                # TypeScript型定義
│   ├── globals.css                 # グローバルスタイル
│   ├── layout.tsx                  # ルートレイアウト
│   └── page.tsx                    # メインダッシュボード
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## カスタマイズ

### MEDDICスコアの追加

HubSpotにカスタムプロパティ`meddic_score`を作成してください:

1. Settings > Properties > Deal properties
2. 「Create property」
3. プロパティ名: `meddic_score`
4. タイプ: Number
5. 保存

`app/lib/hubspot.ts`の`getAllDeals`関数に`meddic_score`を追加:

```typescript
const response = await hubspotClient.crm.deals.basicApi.getPage(limit, undefined, [
  // ... existing properties
  'meddic_score',
]);
```

### AI確度の追加

同様に`ai_probability`カスタムプロパティを作成し、ダッシュボードに反映できます。

### ステージのカスタマイズ

HubSpotのパイプライン設定に基づいてステージが自動的に取得されます。

## デプロイ

### Vercelへのデプロイ

```bash
npm install -g vercel
vercel
```

環境変数`HUBSPOT_ACCESS_TOKEN`をVercelの環境変数に設定してください。

### その他のプラットフォーム

Next.jsが動作する任意のプラットフォームにデプロイ可能です:
- Netlify
- AWS Amplify
- Google Cloud Run
- Docker

## トラブルシューティング

### HubSpot APIエラー

```
Error: Failed to fetch deals
```

**解決方法**:
1. `.env.local`のAccess Tokenが正しいか確認
2. HubSpotアプリのスコープが正しく設定されているか確認
3. アプリが無効化されていないか確認

### ビルドエラー

```
Module not found: Can't resolve '@hubspot/api-client'
```

**解決方法**:
```bash
rm -rf node_modules package-lock.json
npm install
```

## ライセンス

MIT

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## サポート

問題が発生した場合は、GitHubのIssuesで報告してください。

<!-- Test for n8n notification Sun Feb  1 13:57:23 JST 2026 -->
