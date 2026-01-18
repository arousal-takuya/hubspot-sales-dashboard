// =====================================================
// アローサル・テクノロジー 事業計画 定数定義
// =====================================================

import {
  CustomerSegment,
  ProductType,
  ProductConfig,
  KGI,
  KPI,
  SalesEquation,
  Risk,
  RiskCategory,
} from '@/app/types/planning';

// -----------------------------------------------------
// KGI デフォルト値
// -----------------------------------------------------
export const DEFAULT_KGI: KGI = {
  id: 'kgi-fy2025',
  name: 'FY2025 事業目標',
  targetRevenue: 500_000_000,       // 5億円
  actualRevenue: 0,
  targetGrossProfit: 150_000_000,   // 1.5億円
  actualGrossProfit: 0,
  grossProfitMargin: 0.30,          // 30%
  fiscalYear: 'FY2025',
};

// -----------------------------------------------------
// セグメント別デフォルト値
// -----------------------------------------------------
export const SEGMENT_DEFAULTS: Record<CustomerSegment, {
  targetRevenue: number;
  averageUnitPrice: number;
  conversionRate: number;
  leadTimeMonths: number;
  requiredDeals: number;
}> = {
  SMB: {
    targetRevenue: 200_000_000,     // 2億円
    averageUnitPrice: 3_000_000,    // 300万円
    conversionRate: 0.05,           // 5%
    leadTimeMonths: 2,
    // 必要商談数 = 2億 / (5% × 300万) = 1,333.33 ≈ 1,334
    requiredDeals: Math.ceil(200_000_000 / (0.05 * 3_000_000)),
  },
  ENT: {
    targetRevenue: 300_000_000,     // 3億円
    averageUnitPrice: 20_000_000,   // 2,000万円
    conversionRate: 0.10,           // 10%
    leadTimeMonths: 4,
    // 必要商談数 = 3億 / (10% × 2000万) = 150
    requiredDeals: Math.ceil(300_000_000 / (0.10 * 20_000_000)),
  },
};

// -----------------------------------------------------
// 商材設定
// -----------------------------------------------------
export const PRODUCT_CONFIGS: ProductConfig[] = [
  {
    type: 'training_smb',
    name: '研修（SMB）',
    description: 'SMB向け研修プログラム',
    segments: ['SMB'],
    priceRange: { min: 2_000_000, max: 5_000_000 },
    targetRevenue: 150_000_000,     // 1.5億円
    hasRevenueShare: false,
    isRecurring: false,
  },
  {
    type: 'training_ent',
    name: '研修（ENT）',
    description: 'エンタープライズ向け研修プログラム',
    segments: ['ENT'],
    priceRange: { min: 5_000_000, max: 30_000_000 },
    targetRevenue: 200_000_000,     // 2億円
    hasRevenueShare: false,
    isRecurring: false,
  },
  {
    type: 'workflow',
    name: 'ワークフロー',
    description: 'ワークフロー構築・導入支援',
    segments: ['ENT'],
    priceRange: { min: 10_000_000, max: 50_000_000 },
    targetRevenue: 100_000_000,     // 1億円
    hasRevenueShare: true,
    isRecurring: false,
  },
  {
    type: 'consulting',
    name: 'コンサルティング',
    description: '月額コンサルティングサービス',
    segments: ['SMB', 'ENT'],
    priceRange: { min: 300_000, max: 1_000_000 },
    targetRevenue: 30_000_000,      // 3,000万円
    hasRevenueShare: false,
    isRecurring: true,
    monthlyPrice: 300_000,
  },
  {
    type: 'gem_experience',
    name: 'Gem/Workflow体験',
    description: '有料貸出による体験サービス',
    segments: ['SMB', 'ENT'],
    priceRange: { min: 100_000, max: 500_000 },
    targetRevenue: 15_000_000,      // 1,500万円
    hasRevenueShare: false,
    isRecurring: false,
  },
  {
    type: 'community',
    name: '有料コミュニティ',
    description: '月額制コミュニティ',
    segments: ['SMB', 'ENT'],
    priceRange: { min: 10_000, max: 10_000 },
    targetRevenue: 5_000_000,       // 500万円
    hasRevenueShare: false,
    isRecurring: true,
    monthlyPrice: 10_000,
  },
];

// -----------------------------------------------------
// デフォルト売上方程式
// -----------------------------------------------------
export const DEFAULT_EQUATIONS: SalesEquation[] = [
  {
    id: 'eq-smb',
    segment: 'SMB',
    leadCount: SEGMENT_DEFAULTS.SMB.requiredDeals,
    conversionRate: SEGMENT_DEFAULTS.SMB.conversionRate,
    averageUnitPrice: SEGMENT_DEFAULTS.SMB.averageUnitPrice,
    leadTimeMonths: SEGMENT_DEFAULTS.SMB.leadTimeMonths,
    expectedDeals: Math.round(SEGMENT_DEFAULTS.SMB.requiredDeals * SEGMENT_DEFAULTS.SMB.conversionRate),
    expectedRevenue: SEGMENT_DEFAULTS.SMB.targetRevenue,
    defaults: {
      leadCount: SEGMENT_DEFAULTS.SMB.requiredDeals,
      averageUnitPrice: SEGMENT_DEFAULTS.SMB.averageUnitPrice,
      conversionRate: SEGMENT_DEFAULTS.SMB.conversionRate,
      leadTimeMonths: SEGMENT_DEFAULTS.SMB.leadTimeMonths,
    },
  },
  {
    id: 'eq-ent',
    segment: 'ENT',
    leadCount: SEGMENT_DEFAULTS.ENT.requiredDeals,
    conversionRate: SEGMENT_DEFAULTS.ENT.conversionRate,
    averageUnitPrice: SEGMENT_DEFAULTS.ENT.averageUnitPrice,
    leadTimeMonths: SEGMENT_DEFAULTS.ENT.leadTimeMonths,
    expectedDeals: Math.round(SEGMENT_DEFAULTS.ENT.requiredDeals * SEGMENT_DEFAULTS.ENT.conversionRate),
    expectedRevenue: SEGMENT_DEFAULTS.ENT.targetRevenue,
    defaults: {
      leadCount: SEGMENT_DEFAULTS.ENT.requiredDeals,
      averageUnitPrice: SEGMENT_DEFAULTS.ENT.averageUnitPrice,
      conversionRate: SEGMENT_DEFAULTS.ENT.conversionRate,
      leadTimeMonths: SEGMENT_DEFAULTS.ENT.leadTimeMonths,
    },
  },
];

// -----------------------------------------------------
// デフォルトKPIツリー
// -----------------------------------------------------
export const DEFAULT_KPIS: KPI[] = [
  // SMB売上KPI
  {
    id: 'kpi-smb-revenue',
    parentId: 'kgi-fy2025',
    name: 'SMB売上',
    description: 'SMBセグメントの年間売上',
    formula: '商談数 × 成約率 × 平均単価',
    targetValue: 200_000_000,
    actualValue: 0,
    unit: 'yen',
    weight: 40,
    isFocusKPI: false,
    segment: 'SMB',
    linkedRiskIds: ['risk-deal-shortage', 'risk-price-decline'],
    children: [
      {
        id: 'kpi-smb-deals',
        parentId: 'kpi-smb-revenue',
        name: 'SMB商談数',
        description: '年間獲得商談数',
        formula: '目標売上 ÷ (成約率 × 平均単価)',
        targetValue: SEGMENT_DEFAULTS.SMB.requiredDeals,
        actualValue: 0,
        unit: 'count',
        weight: 50,
        isFocusKPI: true,
        segment: 'SMB',
        linkedRiskIds: ['risk-deal-shortage'],
        children: [],
      },
      {
        id: 'kpi-smb-conversion',
        parentId: 'kpi-smb-revenue',
        name: 'SMB成約率',
        description: '商談からの成約率',
        formula: '成約数 ÷ 商談数',
        targetValue: 5,
        actualValue: 0,
        unit: 'percentage',
        weight: 30,
        isFocusKPI: false,
        segment: 'SMB',
        linkedRiskIds: [],
        children: [],
      },
      {
        id: 'kpi-smb-unit-price',
        parentId: 'kpi-smb-revenue',
        name: 'SMB平均単価',
        description: '案件あたりの平均単価',
        formula: '総売上 ÷ 成約件数',
        targetValue: 3_000_000,
        actualValue: 0,
        unit: 'yen',
        weight: 20,
        isFocusKPI: false,
        segment: 'SMB',
        linkedRiskIds: ['risk-price-decline'],
        children: [],
      },
    ],
  },
  // ENT売上KPI
  {
    id: 'kpi-ent-revenue',
    parentId: 'kgi-fy2025',
    name: 'ENT売上',
    description: 'エンタープライズセグメントの年間売上',
    formula: '商談数 × 成約率 × 平均単価',
    targetValue: 300_000_000,
    actualValue: 0,
    unit: 'yen',
    weight: 60,
    isFocusKPI: false,
    segment: 'ENT',
    linkedRiskIds: ['risk-deal-shortage', 'risk-price-decline'],
    children: [
      {
        id: 'kpi-ent-deals',
        parentId: 'kpi-ent-revenue',
        name: 'ENT商談数',
        description: '年間獲得商談数',
        formula: '目標売上 ÷ (成約率 × 平均単価)',
        targetValue: SEGMENT_DEFAULTS.ENT.requiredDeals,
        actualValue: 0,
        unit: 'count',
        weight: 50,
        isFocusKPI: true,
        segment: 'ENT',
        linkedRiskIds: ['risk-deal-shortage'],
        children: [],
      },
      {
        id: 'kpi-ent-conversion',
        parentId: 'kpi-ent-revenue',
        name: 'ENT成約率',
        description: '商談からの成約率',
        formula: '成約数 ÷ 商談数',
        targetValue: 10,
        actualValue: 0,
        unit: 'percentage',
        weight: 30,
        isFocusKPI: false,
        segment: 'ENT',
        linkedRiskIds: [],
        children: [],
      },
      {
        id: 'kpi-ent-unit-price',
        parentId: 'kpi-ent-revenue',
        name: 'ENT平均単価',
        description: '案件あたりの平均単価',
        formula: '総売上 ÷ 成約件数',
        targetValue: 20_000_000,
        actualValue: 0,
        unit: 'yen',
        weight: 20,
        isFocusKPI: false,
        segment: 'ENT',
        linkedRiskIds: ['risk-price-decline'],
        children: [],
      },
    ],
  },
];

// -----------------------------------------------------
// デフォルトリスク
// -----------------------------------------------------
export const DEFAULT_RISKS: Risk[] = [
  {
    id: 'risk-deal-shortage',
    title: '商談獲得不足',
    description: 'マーケティング・営業リソースの制約により、目標商談数を達成できないリスク',
    category: 'lead_shortage',
    level: 'high',
    status: 'identified',
    probability: 60,
    impact: 80,
    linkedKPIIds: ['kpi-smb-deals', 'kpi-ent-deals'],
    countermeasures: [
      {
        id: 'cm-deal-1',
        riskId: 'risk-deal-shortage',
        title: 'マーケティング施策強化',
        description: 'コンテンツマーケ、広告、セミナーの拡充',
        owner: 'マーケチーム',
        progressPercent: 0,
        effectPercent: 40,
        kpiImpacts: [
          { kpiId: 'kpi-smb-deals', impactType: 'lead_count', adjustmentFactor: 0.3 },
          { kpiId: 'kpi-ent-deals', impactType: 'lead_count', adjustmentFactor: 0.2 },
        ],
      },
      {
        id: 'cm-deal-2',
        riskId: 'risk-deal-shortage',
        title: 'パートナー連携強化',
        description: 'パートナー経由の商談獲得チャネル構築',
        owner: 'パートナーチーム',
        progressPercent: 0,
        effectPercent: 30,
        kpiImpacts: [
          { kpiId: 'kpi-ent-deals', impactType: 'lead_count', adjustmentFactor: 0.25 },
        ],
      },
      {
        id: 'cm-deal-3',
        riskId: 'risk-deal-shortage',
        title: 'アウトバウンド営業強化',
        description: 'SDRチームの拡充、ターゲットリスト精査',
        owner: '営業チーム',
        progressPercent: 0,
        effectPercent: 25,
        kpiImpacts: [
          { kpiId: 'kpi-smb-deals', impactType: 'lead_count', adjustmentFactor: 0.2 },
          { kpiId: 'kpi-ent-deals', impactType: 'lead_count', adjustmentFactor: 0.15 },
        ],
      },
    ],
  },
  {
    id: 'risk-price-decline',
    title: '単価下落',
    description: '競合参入や価格競争による値引き要請で、平均単価が下落するリスク',
    category: 'price_decline',
    level: 'medium',
    status: 'identified',
    probability: 40,
    impact: 60,
    linkedKPIIds: ['kpi-smb-unit-price', 'kpi-ent-unit-price'],
    countermeasures: [
      {
        id: 'cm-price-1',
        riskId: 'risk-price-decline',
        title: '付加価値提案の強化',
        description: 'ROI可視化、導入効果の定量化による価値訴求',
        owner: 'プリセールス',
        progressPercent: 0,
        effectPercent: 35,
        kpiImpacts: [
          { kpiId: 'kpi-smb-unit-price', impactType: 'unit_price', adjustmentFactor: 0.15 },
          { kpiId: 'kpi-ent-unit-price', impactType: 'unit_price', adjustmentFactor: 0.2 },
        ],
      },
      {
        id: 'cm-price-2',
        riskId: 'risk-price-decline',
        title: 'プレミアムパッケージ開発',
        description: '高付加価値オプションの開発・提案',
        owner: 'プロダクトチーム',
        progressPercent: 0,
        effectPercent: 25,
        kpiImpacts: [
          { kpiId: 'kpi-ent-unit-price', impactType: 'unit_price', adjustmentFactor: 0.15 },
        ],
      },
      {
        id: 'cm-price-3',
        riskId: 'risk-price-decline',
        title: '値引き承認プロセス厳格化',
        description: '値引き基準の明確化と承認フローの整備',
        owner: '営業企画',
        progressPercent: 0,
        effectPercent: 20,
        kpiImpacts: [
          { kpiId: 'kpi-smb-unit-price', impactType: 'unit_price', adjustmentFactor: 0.1 },
          { kpiId: 'kpi-ent-unit-price', impactType: 'unit_price', adjustmentFactor: 0.1 },
        ],
      },
    ],
  },
];

// -----------------------------------------------------
// リスクカテゴリ表示名
// -----------------------------------------------------
export const RISK_CATEGORY_LABELS: Record<RiskCategory, string> = {
  lead_shortage: '商談獲得',
  price_decline: '単価下落',
  competition: '競合',
  resource: 'リソース',
  market: '市場環境',
};

// -----------------------------------------------------
// 閾値・設定
// -----------------------------------------------------
export const THRESHOLDS = {
  // 予実乖離の閾値
  variance: {
    onTrack: -5,      // -5%以上なら順調
    atRisk: -20,      // -20%以上なら要注意
    // それ以下はoff_track
  },
  // ボトルネックスコアの閾値
  bottleneck: {
    threshold: 30,    // このスコア以上がボトルネック
  },
  // 注力KPI推奨の最大数
  focusKPI: {
    maxCount: 3,
  },
};

// -----------------------------------------------------
// 金額フォーマット設定
// -----------------------------------------------------
export const CURRENCY_FORMAT = {
  locale: 'ja-JP',
  currency: 'JPY',
  thresholds: {
    oku: 100_000_000,   // 億
    man: 10_000,        // 万
  },
};

// -----------------------------------------------------
// 月次ラベル
// -----------------------------------------------------
export const MONTH_LABELS = [
  '4月', '5月', '6月', '7月', '8月', '9月',
  '10月', '11月', '12月', '1月', '2月', '3月',
];
