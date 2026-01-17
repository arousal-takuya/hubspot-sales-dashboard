# アーキテクチャドキュメント

## 概要

このダッシュボードは、HubSpot CRMデータをリアルタイムで取得し、営業パイプラインの可視化と分析を提供するNext.jsアプリケーションです。

## システムアーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ MetricCard   │  │PipelineFunnel│  │ DealsTable   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└────────────────────────┬────────────────────────────────┘
                         │ API Routes
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    API Layer (Next.js)                  │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │ /api/hubspot/    │  │ /api/hubspot/    │            │
│  │   deals          │  │   metrics        │            │
│  └──────────────────┘  └──────────────────┘            │
└────────────────────────┬────────────────────────────────┘
                         │ HubSpot SDK
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Business Logic Layer                       │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │ hubspot.ts       │  │ analytics.ts     │            │
│  │ (API Client)     │  │ (Data Analytics) │            │
│  └──────────────────┘  └──────────────────┘            │
└────────────────────────┬────────────────────────────────┘
                         │ REST API
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    HubSpot CRM API                      │
│              (Deals, Pipelines, Stages)                 │
└─────────────────────────────────────────────────────────┘
```

## コンポーネント設計

### UIコンポーネント

#### 1. MetricCard
**目的**: KPIメトリクスの表示

**Props**:
- `title`: メトリクスのタイトル
- `value`: メトリクスの値
- `subtitle`: サブタイトル
- `trend`: 前期比較（％）
- `variant`: スタイルバリアント（default, success, warning, danger）
- `icon`: アイコンタイプ

**使用例**:
```tsx
<MetricCard
  title="担当者手当合計"
  value="¥1.9億"
  subtitle="アクティブ案件の合計"
  variant="default"
/>
```

#### 2. PipelineFunnel
**目的**: ステージ別パイプラインの可視化

**Props**:
- `data`: ステージごとの金額と件数データ

**特徴**:
- Rechartsによる横棒グラフ
- ステージごとに色分け
- ホバーでツールチップ表示

#### 3. DealsTable
**目的**: 案件一覧の表示

**Props**:
- `deals`: 案件データ配列
- `stageLookup`: ステージIDから名前へのマッピング

**機能**:
- HubSpotへの直接リンク
- MEDDIC進捗バー
- AI確度の表示
- ステージごとのフィルタリング

## データフロー

### 1. 初期ロード
```
ユーザーアクセス
    ↓
page.tsx (useEffect)
    ↓
並列API呼び出し
    ├─→ /api/hubspot/metrics
    │       ↓
    │   getOpenDeals() + getPipelineStages()
    │       ↓
    │   calculateMetrics() + calculatePipelineFunnel()
    │       ↓
    │   メトリクスとファネルデータを返す
    │
    └─→ /api/hubspot/deals
            ↓
        getOpenDeals()
            ↓
        案件リストを返す
            ↓
State更新 → UI再レンダリング
```

### 2. データ集計ロジック

#### calculateMetrics()
```typescript
入力: HubSpotDeal[]
処理:
  1. オープン案件のフィルタリング
  2. 担当者手当合計の計算（全金額の合計）
  3. 予測金額の計算（金額 × 確度）
  4. 停滞案件のカウント（7日以上更新なし）
  5. 予選通過率の計算（確度50%以上 / 全体）
出力: DashboardMetrics
```

#### calculatePipelineFunnel()
```typescript
入力: HubSpotDeal[], DealStage[]
処理:
  1. ステージごとにグループ化
  2. 各ステージの金額と件数を集計
  3. displayOrderでソート
出力: PipelineFunnelData[]
```

## HubSpot API連携

### 使用エンドポイント

1. **Deals API**
   - `crm.deals.basicApi.getPage()`
   - 取得プロパティ:
     - dealname, dealstage, amount, closedate
     - pipeline, hs_deal_stage_probability
     - days_to_close, hubspot_owner_id
     - createdate, hs_lastmodifieddate
     - hs_projected_amount, hs_is_closed

2. **Pipelines API**
   - `crm.pipelines.pipelinesApi.getById()`
   - パイプラインのステージ情報を取得

### 認証

Private App Access Tokenを使用:
```typescript
const hubspotClient = new Client({
  accessToken: process.env.HUBSPOT_ACCESS_TOKEN
});
```

### エラーハンドリング

```typescript
try {
  const deals = await getAllDeals();
  return NextResponse.json({ deals });
} catch (error) {
  console.error('Error:', error);
  return NextResponse.json(
    { error: 'Failed to fetch deals' },
    { status: 500 }
  );
}
```

## パフォーマンス最適化

### 1. 並列API呼び出し
```typescript
const [metricsRes, dealsRes] = await Promise.all([
  fetch('/api/hubspot/metrics'),
  fetch('/api/hubspot/deals'),
]);
```

### 2. サーバーサイドキャッシング（今後実装予定）
```typescript
export const revalidate = 300; // 5分ごとに再検証
```

### 3. クライアントサイドメモ化
```typescript
const memoizedData = useMemo(() => {
  return calculateMetrics(deals);
}, [deals]);
```

## セキュリティ

### 環境変数
- `.env.local`でトークンを管理
- `.gitignore`で除外
- 本番環境では環境変数として注入

### API Routes
- Next.jsのAPI Routesでバックエンド処理
- クライアントにトークンを露出しない

## 拡張性

### 追加可能な機能

1. **フィルタリング**
   - 日付範囲
   - 担当者
   - パイプライン
   - ステージ

2. **エクスポート**
   - CSV
   - PDF
   - Excel

3. **リアルタイム更新**
   - HubSpot Webhook連携
   - Server-Sent Events

4. **AI機能**
   - 予測分析
   - 異常検知
   - レコメンデーション

## 技術的制約

### HubSpot API制限
- レート制限: 100リクエスト/10秒（Private App）
- ページネーション: 最大100件/リクエスト

### Next.js制約
- API Routesはサーバーレス関数として実行
- タイムアウト: 最大60秒（Vercel）

## デプロイメント

### 環境
- **開発**: `npm run dev` (localhost:3000)
- **本番**: Vercel / Netlify / その他

### 必要な環境変数
```env
HUBSPOT_ACCESS_TOKEN=pat-na2-xxxxx...
```

### ビルドコマンド
```bash
npm run build
npm run start
```

## モニタリング

### ログ
```typescript
console.error('Error fetching deals:', error);
```

### メトリクス（今後実装予定）
- API応答時間
- エラー率
- データ取得頻度

## テスト戦略（今後実装予定）

### 単体テスト
- `analytics.ts`のロジック
- コンポーネントのレンダリング

### 統合テスト
- API Routesの動作確認
- HubSpot API連携

### E2Eテスト
- ダッシュボードの全体フロー

## まとめ

このアーキテクチャは以下の原則に基づいています:

1. **分離**: UI / API / ビジネスロジックの明確な分離
2. **スケーラビリティ**: 機能追加が容易な構造
3. **保守性**: TypeScriptによる型安全性
4. **パフォーマンス**: 並列処理とキャッシング
5. **セキュリティ**: トークンの安全な管理
