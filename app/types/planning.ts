// =====================================================
// アローサル・テクノロジー 事業計画立案・予実管理ツール 型定義
// =====================================================

// -----------------------------------------------------
// 基本Enum・定数
// -----------------------------------------------------
export type CustomerSegment = 'SMB' | 'ENT';

export type ProductType =
  | 'training_smb'      // 研修（SMB向け）
  | 'training_ent'      // 研修（ENT向け）
  | 'workflow'          // ワークフロー
  | 'consulting'        // コンサル
  | 'gem_experience'    // Gem/Workflow体験（有料貸出）
  | 'community';        // 有料コミュニティ

export type RiskLevel = 'high' | 'medium' | 'low';
export type RiskStatus = 'identified' | 'mitigating' | 'resolved';
export type RiskCategory = 'lead_shortage' | 'price_decline' | 'competition' | 'resource' | 'market';

// -----------------------------------------------------
// KGI/KPI構造
// -----------------------------------------------------
export interface KGI {
  id: string;
  name: string;
  targetRevenue: number;        // 売上目標（円）
  actualRevenue: number;        // 売上実績（円）
  targetGrossProfit: number;    // 粗利目標（円）
  actualGrossProfit: number;    // 粗利実績（円）
  grossProfitMargin: number;    // 粗利率 (0-1)
  fiscalYear: string;           // 例: "FY2025"
}

export interface KPI {
  id: string;
  parentId: string | null;      // KGI.idまたは上位KPI.id
  name: string;
  description: string;
  formula: string;              // 計算式（表示用）
  targetValue: number;
  actualValue: number;
  unit: 'yen' | 'count' | 'percentage' | 'months' | 'rate';
  weight: number;               // KGI達成への寄与度 (0-100)
  isFocusKPI: boolean;          // 注力KPIかどうか
  segment?: CustomerSegment;    // セグメント別の場合
  productType?: ProductType;    // 商材別の場合
  children: KPI[];              // さらに分解されたKPI
  linkedRiskIds: string[];      // 関連リスクID
}

// -----------------------------------------------------
// 売上方程式
// -----------------------------------------------------
export interface SalesEquation {
  id: string;
  segment: CustomerSegment;
  productType?: ProductType;

  // 方程式の各変数
  leadCount: number;              // 商談数
  conversionRate: number;         // 成約率 (0-1)
  averageUnitPrice: number;       // 平均単価（円）
  leadTimeMonths: number;         // リードタイム（月）

  // 計算結果（派生）
  expectedDeals: number;          // 予想成約件数
  expectedRevenue: number;        // 予想売上

  // デフォルト値（参照用）
  defaults: {
    leadCount: number;
    averageUnitPrice: number;
    conversionRate: number;
    leadTimeMonths: number;
  };
}

// -----------------------------------------------------
// 商材設定
// -----------------------------------------------------
export interface ProductConfig {
  type: ProductType;
  name: string;
  description: string;
  segments: CustomerSegment[];    // 対象セグメント
  priceRange: {
    min: number;
    max: number;
  };
  targetRevenue: number;          // 売上目標
  hasRevenueShare: boolean;       // レベニューシェアあり
  isRecurring: boolean;           // 継続課金
  monthlyPrice?: number;          // 月額の場合
}

// -----------------------------------------------------
// リスク管理
// -----------------------------------------------------
export interface Risk {
  id: string;
  title: string;
  description: string;
  category: RiskCategory;
  level: RiskLevel;
  status: RiskStatus;
  probability: number;            // 発生確率 (0-100)
  impact: number;                 // 影響度 (0-100)
  linkedKPIIds: string[];         // 関連KPI ID
  countermeasures: Countermeasure[];
}

export interface Countermeasure {
  id: string;
  riskId: string;
  title: string;
  description: string;
  owner: string;                  // 担当者
  deadline?: string;              // 期限
  progressPercent: number;        // 対策進捗度 (0-100)
  effectPercent: number;          // 効果見込み (0-100)

  // 対策度合いによる再計算への影響
  kpiImpacts: KPIImpact[];
}

export interface KPIImpact {
  kpiId: string;
  impactType: 'lead_count' | 'conversion_rate' | 'unit_price';
  adjustmentFactor: number;       // 調整係数 (-1 to 1)
}

// -----------------------------------------------------
// 予実管理
// -----------------------------------------------------
export interface MonthlyActual {
  id: string;
  yearMonth: string;              // "2025-01"形式
  segment: CustomerSegment;
  productType?: ProductType;

  // 実績値
  revenue: number;
  dealCount: number;
  leadCount: number;
  grossProfit: number;

  // メモ・コメント
  notes?: string;
}

export interface PlanVsActual {
  kpiId: string;
  kpiName: string;
  yearMonth: string;
  plannedValue: number;
  actualValue: number;
  variance: number;               // 乖離（actualValue - plannedValue）
  variancePercent: number;        // 乖離率
  status: 'on_track' | 'at_risk' | 'off_track';
}

// -----------------------------------------------------
// ボトルネック分析
// -----------------------------------------------------
export interface BottleneckAnalysis {
  kpiId: string;
  kpiName: string;
  segment?: CustomerSegment;

  // ボトルネック判定
  isBottleneck: boolean;
  bottleneckScore: number;        // 0-100
  achievementRate: number;        // 達成率

  // 理由・推奨
  reason: string;
  recommendedActions: string[];
}

// -----------------------------------------------------
// シミュレーション
// -----------------------------------------------------
export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  createdAt: string;

  // 方程式の調整値
  equationAdjustments: EquationAdjustment[];

  // 対策進捗の仮定
  countermeasureProgress: {
    countermeasureId: string;
    assumedProgress: number;      // 0-100
  }[];

  // シミュレーション結果
  projectedRevenue: number;
  projectedGrossProfit: number;
  achievementProbability: number; // KGI達成確率

  // 変更されたボトルネック
  newBottlenecks: BottleneckAnalysis[];
  newFocusKPIs: string[];
}

export interface EquationAdjustment {
  equationId: string;
  field: 'leadCount' | 'conversionRate' | 'averageUnitPrice';
  originalValue: number;
  adjustedValue: number;
  adjustmentReason?: string;
}

// -----------------------------------------------------
// ダッシュボード状態
// -----------------------------------------------------
export interface PlanningDashboardState {
  // 現在の表示設定
  currentFiscalYear: string;
  selectedSegment: CustomerSegment | 'all';
  selectedProduct: ProductType | 'all';

  // データ
  kgi: KGI;
  kpis: KPI[];
  equations: SalesEquation[];
  products: ProductConfig[];
  risks: Risk[];
  monthlyActuals: MonthlyActual[];

  // 分析結果
  bottlenecks: BottleneckAnalysis[];
  focusKPIIds: string[];

  // シミュレーション
  currentScenario: SimulationScenario | null;
  isSimulationMode: boolean;
}

// -----------------------------------------------------
// UI状態
// -----------------------------------------------------
export interface UIState {
  expandedKPIIds: string[];
  expandedRiskIds: string[];
  activeTab: 'overview' | 'equation' | 'risk' | 'actual' | 'simulation';
  isLoading: boolean;
  error: string | null;
}

// -----------------------------------------------------
// フォーマット用ヘルパー型
// -----------------------------------------------------
export interface FormattedCurrency {
  value: number;
  display: string;        // "¥3億" or "¥3,000万" など
  shortDisplay: string;   // "3億" or "3000万" など
}

export interface FormattedPercent {
  value: number;          // 0-1
  display: string;        // "5.0%"
}
