# HubSpot Sales Dashboard API仕様書

## 概要

本ドキュメントでは、HubSpot Sales DashboardのAPI仕様を定義します。

**Base URL**: `https://hubspot-sales-dashboard.vercel.app`

---

## 認証

### セッション認証

すべてのAPI（認証APIを除く）はセッション認証が必要です。
認証はCookieベースで行われ、`dashboard-session` Cookieが有効な場合にアクセスが許可されます。

---

## API一覧

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| POST | /api/auth/login | ログイン | 不要 |
| POST | /api/auth/logout | ログアウト | 必要 |
| GET | /api/hubspot/deals | 案件一覧取得 | 必要 |
| GET | /api/hubspot/metrics | メトリクス取得 | 必要 |

---

## 認証API

### POST /api/auth/login

ユーザー認証を行い、セッションを作成します。

#### リクエスト

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| username | string | ✓ | ユーザー名 |
| password | string | ✓ | パスワード |

#### レスポンス

**成功 (200 OK):**
```json
{
  "success": true
}
```

**エラー (400 Bad Request):**
```json
{
  "error": "Username and password are required"
}
```

**エラー (401 Unauthorized):**
```json
{
  "error": "Invalid credentials"
}
```

**エラー (500 Internal Server Error):**
```json
{
  "error": "Internal server error"
}
```

#### Cookie

成功時、以下のCookieが設定されます:

| 名前 | 値 | オプション |
|-----|-----|-----------|
| dashboard-session | セッショントークン | httpOnly, secure, sameSite=lax, maxAge=604800 |

---

### POST /api/auth/logout

セッションを破棄してログアウトします。

#### リクエスト

**Headers:**
```
Cookie: dashboard-session=<session_token>
```

#### レスポンス

**成功 (200 OK):**
```json
{
  "success": true
}
```

**エラー (500 Internal Server Error):**
```json
{
  "error": "Internal server error"
}
```

---

## HubSpot連携API

### GET /api/hubspot/deals

HubSpotから案件一覧を取得します。

#### リクエスト

**Headers:**
```
Cookie: dashboard-session=<session_token>
```

#### レスポンス

**成功 (200 OK):**
```json
{
  "deals": [
    {
      "id": "12345678",
      "properties": {
        "dealname": "株式会社ABC - 新規プロジェクト",
        "dealstage": "presentationscheduled",
        "amount": "5000000",
        "closedate": "2026-03-31",
        "pipeline": "default",
        "hs_deal_stage_probability": "0.6",
        "days_to_close": null,
        "hubspot_owner_id": "123456",
        "createdate": "2026-01-10T09:00:00.000Z",
        "hs_lastmodifieddate": "2026-01-17T14:30:00.000Z",
        "hs_projected_amount": "3000000",
        "hs_is_closed": "false",
        "hs_is_closed_won": "false",
        "hs_is_closed_lost": "false"
      }
    }
  ],
  "total": 150
}
```

#### プロパティ詳細

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| id | string | 案件ID |
| properties.dealname | string | 案件名 |
| properties.dealstage | string | ステージID |
| properties.amount | string \| null | 金額 |
| properties.closedate | string \| null | クローズ予定日 (ISO 8601) |
| properties.pipeline | string | パイプラインID |
| properties.hs_deal_stage_probability | string \| null | ステージ確度 (0-1) |
| properties.days_to_close | string \| null | クローズまでの日数 |
| properties.hubspot_owner_id | string \| null | 担当者ID |
| properties.createdate | string | 作成日時 (ISO 8601) |
| properties.hs_lastmodifieddate | string | 最終更新日時 (ISO 8601) |
| properties.hs_is_closed | string | クローズ済みフラグ ("true"/"false") |

**エラー (500 Internal Server Error):**
```json
{
  "error": "Failed to fetch deals",
  "message": "HubSpot API error: 401 Unauthorized"
}
```

---

### GET /api/hubspot/metrics

ダッシュボード表示用のメトリクスを取得します。

#### リクエスト

**Headers:**
```
Cookie: dashboard-session=<session_token>
```

#### レスポンス

**成功 (200 OK):**
```json
{
  "metrics": {
    "totalPipelineAmount": 125000000,
    "forecastAmount": 75000000,
    "conversionRate": 65.5,
    "staleDeals": 3,
    "averageMeddicScore": 64
  },
  "funnelData": [
    {
      "stage": "アポイントメント予約済み",
      "amount": 30000000,
      "count": 15
    },
    {
      "stage": "適格性確認済み",
      "amount": 45000000,
      "count": 12
    },
    {
      "stage": "プレゼン予定",
      "amount": 25000000,
      "count": 8
    },
    {
      "stage": "意思決定者同席",
      "amount": 15000000,
      "count": 5
    },
    {
      "stage": "契約送付済み",
      "amount": 10000000,
      "count": 3
    }
  ],
  "dealsCount": 43
}
```

#### メトリクス詳細

| フィールド | 型 | 説明 |
|-----------|-----|------|
| metrics.totalPipelineAmount | number | アクティブ案件の合計金額 |
| metrics.forecastAmount | number | 確度加重予測金額 |
| metrics.conversionRate | number | 予選通過率 (%) |
| metrics.staleDeals | number | 停滞案件数（7日以上更新なし） |
| metrics.averageMeddicScore | number | 平均MEDDICスコア |
| funnelData | array | ステージ別ファネルデータ |
| funnelData[].stage | string | ステージ名 |
| funnelData[].amount | number | ステージ合計金額 |
| funnelData[].count | number | ステージ案件数 |
| dealsCount | number | 総案件数 |

**エラー (500 Internal Server Error):**
```json
{
  "error": "Failed to fetch metrics"
}
```

---

## エラーコード

| HTTPコード | 説明 |
|-----------|------|
| 200 | 成功 |
| 400 | 不正なリクエスト |
| 401 | 認証失敗 |
| 403 | アクセス拒否 |
| 500 | サーバーエラー |

---

## 使用例

### cURLによるログイン

```bash
curl -X POST https://hubspot-sales-dashboard.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"secret"}' \
  -c cookies.txt
```

### cURLによるデータ取得

```bash
curl https://hubspot-sales-dashboard.vercel.app/api/hubspot/deals \
  -b cookies.txt
```

### JavaScript (fetch)

```javascript
// ログイン
const loginRes = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'secret' }),
  credentials: 'include'
});

// データ取得
const dealsRes = await fetch('/api/hubspot/deals', {
  credentials: 'include'
});
const data = await dealsRes.json();
```

---

## レート制限

現在、明示的なレート制限は実装されていません。
ただし、HubSpot APIの制限（100リクエスト/10秒）に依存します。

---

## 変更履歴

| 日付 | バージョン | 内容 |
|------|-----------|------|
| 2026-01-18 | 1.0.0 | 初版作成 |
