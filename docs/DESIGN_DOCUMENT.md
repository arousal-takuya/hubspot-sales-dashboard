# HubSpot Sales Dashboard 設計書

## 1. 概要

### 1.1 プロジェクト概要
HubSpot Sales Dashboardは、HubSpot CRMのデータを可視化し、営業チームの意思決定を支援するWebアプリケーションです。

### 1.2 目的
- HubSpotの案件データをリアルタイムで可視化
- 営業パイプラインの状況を一目で把握
- 停滞案件の早期発見と対応支援
- AIによる確度予測の提供

### 1.3 技術スタック
| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 15.1.3 (App Router) |
| 言語 | TypeScript 5.7.2 |
| UI | React 19.0.0 |
| スタイリング | Tailwind CSS 3.4.17 |
| チャート | Recharts 2.15.0 |
| アイコン | Lucide React 0.469.0 |
| 日付処理 | date-fns 4.1.0 |
| API連携 | HubSpot API Client 11.2.0 |
| デプロイ | Vercel |

---

## 2. システムアーキテクチャ

### 2.1 全体構成図

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                 Next.js Application                  │    │
│  │  ┌───────────────┐  ┌───────────────────────────┐   │    │
│  │  │   Frontend    │  │      API Routes           │   │    │
│  │  │  (React/TSX)  │  │  /api/hubspot/*           │   │    │
│  │  │               │  │  /api/auth/*              │   │    │
│  │  └───────────────┘  └───────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   HubSpot API   │
                    │  (External)     │
                    └─────────────────┘
```

### 2.2 ディレクトリ構成

```
hubspot-sales-dashboard/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.ts      # ログインAPI
│   │   │   └── logout/
│   │   │       └── route.ts      # ログアウトAPI
│   │   └── hubspot/
│   │       ├── deals/
│   │       │   └── route.ts      # 案件データ取得API
│   │       └── metrics/
│   │           └── route.ts      # メトリクス取得API
│   ├── components/
│   │   ├── DealsTable.tsx        # 案件一覧テーブル
│   │   ├── MetricCard.tsx        # メトリクスカード
│   │   └── PipelineFunnel.tsx    # パイプラインファネル
│   ├── lib/
│   │   ├── analytics.ts          # 分析ロジック
│   │   ├── auth.ts               # 認証ユーティリティ
│   │   └── hubspot.ts            # HubSpot API連携
│   ├── login/
│   │   └── page.tsx              # ログインページ
│   ├── types/
│   │   └── index.ts              # 型定義
│   ├── globals.css               # グローバルスタイル
│   ├── layout.tsx                # ルートレイアウト
│   └── page.tsx                  # ダッシュボードページ
├── middleware.ts                  # 認証ミドルウェア
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 3. データモデル

### 3.1 型定義 (`app/types/index.ts`)

#### Deal (案件)
```typescript
interface Deal {
  id: string;
  dealname: string;
  dealstage: string;
  amount?: number;
  closedate?: string;
  pipeline: string;
  hs_deal_stage_probability?: number;
  days_to_close?: number;
  hubspot_owner_id?: string;
  createdate: string;
  hs_lastmodifieddate: string;
  meddic_score?: number;
  ai_probability?: number;
  blocker_status?: string;
}
```

#### DashboardMetrics (ダッシュボードメトリクス)
```typescript
interface DashboardMetrics {
  totalPipelineAmount: number;    // 担当者手当合計
  forecastAmount: number;         // AI調査進予測
  conversionRate: number;         // 予選通過率
  staleDeals: number;             // 停滞案件数
  averageMeddicScore: number;     // 平均MEDDICスコア
}
```

#### PipelineFunnelData (ファネルデータ)
```typescript
interface PipelineFunnelData {
  stage: string;
  amount: number;
  count: number;
}
```

---

## 4. API設計

### 4.1 認証API

#### POST /api/auth/login
ユーザーログイン処理

**リクエスト:**
```json
{
  "username": "string",
  "password": "string"
}
```

**レスポンス:**
- 成功: `{ "success": true }`
- 失敗: `{ "error": "Invalid credentials" }`

#### POST /api/auth/logout
ログアウト処理

**レスポンス:**
- 成功: `{ "success": true }`

### 4.2 HubSpot連携API

#### GET /api/hubspot/deals
案件一覧取得

**レスポンス:**
```json
{
  "deals": [
    {
      "id": "string",
      "properties": {
        "dealname": "string",
        "dealstage": "string",
        "amount": "string",
        "closedate": "string",
        "createdate": "string",
        "hs_deal_stage_probability": "string"
      }
    }
  ],
  "total": 100
}
```

#### GET /api/hubspot/metrics
メトリクス取得

**レスポンス:**
```json
{
  "metrics": {
    "totalPipelineAmount": 50000000,
    "forecastAmount": 30000000,
    "conversionRate": 65.5,
    "staleDeals": 5,
    "averageMeddicScore": 64
  },
  "funnelData": [
    { "stage": "リード", "amount": 10000000, "count": 20 },
    { "stage": "商談", "amount": 20000000, "count": 15 }
  ],
  "dealsCount": 35
}
```

---

## 5. コンポーネント設計

### 5.1 コンポーネント一覧

| コンポーネント | 説明 | Props |
|---------------|------|-------|
| `MetricCard` | KPIカード表示 | title, value, subtitle, trend, variant, icon |
| `PipelineFunnel` | パイプラインファネルチャート | data |
| `DealsTable` | 案件一覧テーブル | deals, stageLookup |

### 5.2 MetricCard

**Props:**
```typescript
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  icon?: 'up' | 'down' | 'alert' | 'check';
}
```

**バリアント別スタイル:**
- `default`: 白背景、青ボーダー
- `success`: 緑グラデーション背景
- `warning`: 黄色グラデーション背景
- `danger`: 赤グラデーション背景

### 5.3 PipelineFunnel

**Props:**
```typescript
interface PipelineFunnelProps {
  data: Array<{
    stage: string;
    amount: number;
    count: number;
  }>;
}
```

**機能:**
- Rechartsによる横棒グラフ表示
- ステージごとに異なる色を適用
- ホバー時に金額・件数をツールチップ表示

### 5.4 DealsTable

**Props:**
```typescript
interface DealsTableProps {
  deals: Deal[];
  stageLookup: Map<string, string>;
}
```

**機能:**
- 日付フィルター（全期間/7日/30日/90日/180日/1年）
- ページネーション（20件ずつ表示）
- HubSpotへの外部リンク
- 確度に応じたプログレスバー表示

---

## 6. 認証システム

### 6.1 認証フロー

```
┌─────────┐     ┌─────────────┐     ┌──────────┐
│  User   │────▶│ Login Page  │────▶│ API Call │
└─────────┘     └─────────────┘     └──────────┘
                                          │
                                          ▼
                               ┌─────────────────┐
                               │ Validate Creds  │
                               │ (env vars)      │
                               └─────────────────┘
                                          │
                          ┌───────────────┴───────────────┐
                          ▼                               ▼
                   ┌──────────┐                    ┌──────────┐
                   │ Success  │                    │  Fail    │
                   │ Set Cookie│                    │ Return 401│
                   └──────────┘                    └──────────┘
```

### 6.2 セッション管理

- **Cookie名**: `dashboard-session`
- **有効期限**: 7日間
- **オプション**: httpOnly, secure (本番), sameSite: lax

### 6.3 ミドルウェア (`middleware.ts`)

保護されたルートへのアクセスを制御:
- 未認証ユーザーは `/login` にリダイレクト
- 認証済みユーザーが `/login` にアクセスした場合は `/` にリダイレクト

---

## 7. HubSpot API連携

### 7.1 接続設定

```typescript
const HUBSPOT_API_BASE = 'https://api.hubapi.com';
const ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
```

### 7.2 取得データ

| プロパティ | 説明 |
|-----------|------|
| dealname | 案件名 |
| dealstage | ステージID |
| amount | 金額 |
| closedate | クローズ予定日 |
| pipeline | パイプラインID |
| hs_deal_stage_probability | ステージ確度 |
| createdate | 作成日 |
| hs_lastmodifieddate | 最終更新日 |
| hs_is_closed | クローズ済みフラグ |

### 7.3 ページネーション

HubSpot APIは1回のリクエストで最大100件まで取得可能。
全件取得のため、`after`パラメータを使用して複数回リクエストを実行。

---

## 8. 分析ロジック

### 8.1 メトリクス計算 (`app/lib/analytics.ts`)

#### 担当者手当合計
```typescript
const totalPipelineAmount = openDeals.reduce((sum, deal) => {
  const amount = parseFloat(deal.properties.amount || '0');
  return sum + amount;
}, 0);
```

#### AI調査進予測（確度加重）
```typescript
const forecastAmount = openDeals.reduce((sum, deal) => {
  const amount = parseFloat(deal.properties.amount || '0');
  const probability = parseFloat(deal.properties.hs_deal_stage_probability || '0');
  return sum + (amount * probability);
}, 0);
```

#### 停滞案件判定
更新日から7日以上経過した案件を停滞案件としてカウント。

### 8.2 通貨フォーマット

```typescript
function formatCurrency(amount: number): string {
  if (amount >= 100000000) {
    return `¥${(amount / 100000000).toFixed(1)}億`;
  } else if (amount >= 10000) {
    return `¥${(amount / 10000).toFixed(1)}万`;
  }
  return `¥${amount.toLocaleString('ja-JP')}`;
}
```

---

## 9. 環境変数

| 変数名 | 説明 | 必須 |
|--------|------|------|
| HUBSPOT_ACCESS_TOKEN | HubSpot APIアクセストークン | ✓ |
| DASHBOARD_USERNAME | ダッシュボードログインユーザー名 | ✓ |
| DASHBOARD_PASSWORD | ダッシュボードログインパスワード | ✓ |

---

## 10. デプロイ

### 10.1 Vercel設定

1. GitHubリポジトリと連携
2. 環境変数を設定
3. 自動デプロイ有効化

### 10.2 ドメイン

- 本番URL: https://hubspot-sales-dashboard.vercel.app

---

## 11. セキュリティ考慮事項

### 11.1 実装済み

- セッションベース認証
- HTTPOnly Cookie
- 環境変数による認証情報管理
- HTTPS通信（Vercel自動）

### 11.2 今後の改善候補

- [ ] CSRF対策の強化
- [ ] レート制限の実装
- [ ] 監査ログの追加
- [ ] 2要素認証の導入

---

## 12. 画面一覧

### 12.1 ログイン画面 (`/login`)

- ユーザー名入力
- パスワード入力
- ログインボタン
- エラーメッセージ表示

### 12.2 ダッシュボード画面 (`/`)

- ヘッダー（タイトル、リフレッシュボタン、ログアウト）
- KPIカード（5種類）
- パイプラインファネルチャート
- Micro-Agentsパネル
- 案件一覧テーブル

---

## 13. 今後の拡張計画

1. **リアルタイム更新**: WebSocket/Server-Sent Eventsによる自動更新
2. **フィルター機能強化**: 担当者別、金額範囲、ステージ別フィルター
3. **エクスポート機能**: CSV/Excel出力
4. **通知機能**: 停滞案件のSlack/Email通知
5. **ダッシュボードカスタマイズ**: ウィジェットの並び替え・非表示

---

## 更新履歴

| 日付 | バージョン | 内容 |
|------|-----------|------|
| 2026-01-18 | 1.0.0 | 初版作成 |
