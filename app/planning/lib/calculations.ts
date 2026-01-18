// =====================================================
// アローサル・テクノロジー 事業計画 計算ロジック
// =====================================================

import {
  KGI,
  KPI,
  SalesEquation,
  Risk,
  Countermeasure,
  CustomerSegment,
  BottleneckAnalysis,
  PlanVsActual,
  EquationAdjustment,
  FormattedCurrency,
} from '@/app/types/planning';
import { SEGMENT_DEFAULTS, THRESHOLDS, CURRENCY_FORMAT } from './constants';

// -----------------------------------------------------
// 売上方程式計算
// -----------------------------------------------------

/**
 * 売上方程式の計算
 * 売上 = 商談数 × 成約率 × 平均単価
 */
export function calculateSalesEquation(equation: SalesEquation): {
  expectedDeals: number;
  expectedRevenue: number;
} {
  const expectedDeals = equation.leadCount * equation.conversionRate;
  const expectedRevenue = expectedDeals * equation.averageUnitPrice;

  return {
    expectedDeals: Math.round(expectedDeals * 10) / 10,
    expectedRevenue: Math.round(expectedRevenue),
  };
}

/**
 * 目標売上から必要商談数を逆算
 */
export function calculateRequiredDeals(
  targetRevenue: number,
  conversionRate: number,
  averageUnitPrice: number
): number {
  if (conversionRate === 0 || averageUnitPrice === 0) return 0;
  return Math.ceil(targetRevenue / (conversionRate * averageUnitPrice));
}

/**
 * セグメント別の必要商談数を計算
 */
export function calculateSegmentRequiredDeals(
  targetRevenue: number,
  segment: CustomerSegment
): number {
  const config = SEGMENT_DEFAULTS[segment];
  return calculateRequiredDeals(
    targetRevenue,
    config.conversionRate,
    config.averageUnitPrice
  );
}

/**
 * 売上方程式を更新して再計算
 */
export function updateEquation(
  equation: SalesEquation,
  updates: Partial<Pick<SalesEquation, 'leadCount' | 'conversionRate' | 'averageUnitPrice'>>
): SalesEquation {
  const updated = { ...equation, ...updates };
  const { expectedDeals, expectedRevenue } = calculateSalesEquation(updated);
  return {
    ...updated,
    expectedDeals,
    expectedRevenue,
  };
}

// -----------------------------------------------------
// KGI/KPI達成率計算
// -----------------------------------------------------

/**
 * 達成率を計算
 */
export function calculateAchievementRate(actual: number, target: number): number {
  if (target === 0) return 0;
  return (actual / target) * 100;
}

/**
 * KGI進捗を計算
 */
export function calculateKGIProgress(kgi: KGI): {
  revenueProgress: number;
  grossProfitProgress: number;
  overallProgress: number;
  revenueGap: number;
  grossProfitGap: number;
} {
  const revenueProgress = calculateAchievementRate(kgi.actualRevenue, kgi.targetRevenue);
  const grossProfitProgress = calculateAchievementRate(kgi.actualGrossProfit, kgi.targetGrossProfit);

  // 総合進捗（売上60%、粗利40%の加重平均）
  const overallProgress = revenueProgress * 0.6 + grossProfitProgress * 0.4;

  return {
    revenueProgress: Math.round(revenueProgress * 10) / 10,
    grossProfitProgress: Math.round(grossProfitProgress * 10) / 10,
    overallProgress: Math.round(overallProgress * 10) / 10,
    revenueGap: kgi.targetRevenue - kgi.actualRevenue,
    grossProfitGap: kgi.targetGrossProfit - kgi.actualGrossProfit,
  };
}

/**
 * KPIの達成率を計算
 */
export function calculateKPIAchievement(kpi: KPI): number {
  return calculateAchievementRate(kpi.actualValue, kpi.targetValue);
}

// -----------------------------------------------------
// 対策効果の計算
// -----------------------------------------------------

/**
 * 対策の現在効果を計算
 * 効果 = 進捗率 × 効果見込み × 調整係数
 */
export function calculateCountermeasureEffect(
  countermeasure: Countermeasure,
  kpiId: string
): number {
  const impact = countermeasure.kpiImpacts.find((i) => i.kpiId === kpiId);
  if (!impact) return 0;

  const progressMultiplier = countermeasure.progressPercent / 100;
  const effectMultiplier = countermeasure.effectPercent / 100;

  return progressMultiplier * effectMultiplier * impact.adjustmentFactor;
}

/**
 * 対策進捗更新時のKPI値再計算
 */
export function recalculateKPIWithCountermeasures(
  kpi: KPI,
  baseValue: number,
  risks: Risk[],
  progressOverrides?: Map<string, number>
): number {
  let adjustedValue = baseValue;

  // このKPIに関連するリスクの対策効果を集計
  for (const risk of risks) {
    if (!risk.linkedKPIIds.includes(kpi.id)) continue;

    for (const cm of risk.countermeasures) {
      const progress = progressOverrides?.get(cm.id) ?? cm.progressPercent;
      const updatedCm = { ...cm, progressPercent: progress };
      const effect = calculateCountermeasureEffect(updatedCm, kpi.id);
      adjustedValue *= 1 + effect;
    }
  }

  return Math.round(adjustedValue);
}

/**
 * 全KPIを対策進捗で再計算
 */
export function recalculateAllKPIsWithCountermeasures(
  kpis: KPI[],
  risks: Risk[],
  progressOverrides: Map<string, number>
): KPI[] {
  const recalculateKPI = (kpi: KPI): KPI => {
    const adjustedActual = recalculateKPIWithCountermeasures(
      kpi,
      kpi.actualValue,
      risks,
      progressOverrides
    );

    return {
      ...kpi,
      actualValue: adjustedActual,
      children: kpi.children.map(recalculateKPI),
    };
  };

  return kpis.map(recalculateKPI);
}

// -----------------------------------------------------
// ボトルネック検出
// -----------------------------------------------------

/**
 * ボトルネックを検出
 * スコア = (100 - 達成率) × (重要度 / 100)
 */
export function detectBottlenecks(kpis: KPI[]): BottleneckAnalysis[] {
  const bottlenecks: BottleneckAnalysis[] = [];

  const analyzeKPI = (kpi: KPI) => {
    const achievementRate = calculateKPIAchievement(kpi);
    const bottleneckScore = (100 - achievementRate) * (kpi.weight / 100);

    if (bottleneckScore > THRESHOLDS.bottleneck.threshold) {
      let reason = '';
      const recommendedActions: string[] = [];

      if (achievementRate < 30) {
        reason = `達成率${achievementRate.toFixed(1)}%と大幅に不足。KGI達成への影響大`;
        recommendedActions.push('緊急対策の策定と実行');
        recommendedActions.push('リソースの追加投入を検討');
      } else if (achievementRate < 60) {
        reason = `達成率${achievementRate.toFixed(1)}%で遅延。早期のテコ入れが必要`;
        recommendedActions.push('対策の進捗加速');
        recommendedActions.push('週次でのモニタリング強化');
      } else {
        reason = `達成率${achievementRate.toFixed(1)}%。目標達成に向けた追い込みが必要`;
        recommendedActions.push('残り期間での集中施策');
      }

      bottlenecks.push({
        kpiId: kpi.id,
        kpiName: kpi.name,
        segment: kpi.segment,
        isBottleneck: true,
        bottleneckScore: Math.round(bottleneckScore * 10) / 10,
        achievementRate: Math.round(achievementRate * 10) / 10,
        reason,
        recommendedActions,
      });
    }

    // 子KPIも分析
    kpi.children.forEach(analyzeKPI);
  };

  kpis.forEach(analyzeKPI);

  // スコア降順でソート
  return bottlenecks.sort((a, b) => b.bottleneckScore - a.bottleneckScore);
}

/**
 * 注力KPIを推奨
 */
export function recommendFocusKPIs(
  bottlenecks: BottleneckAnalysis[],
  maxCount: number = THRESHOLDS.focusKPI.maxCount
): string[] {
  return bottlenecks.slice(0, maxCount).map((b) => b.kpiId);
}

// -----------------------------------------------------
// 予実乖離計算
// -----------------------------------------------------

/**
 * 予実乖離を計算
 */
export function calculateVariance(
  plannedValue: number,
  actualValue: number
): {
  variance: number;
  variancePercent: number;
  status: 'on_track' | 'at_risk' | 'off_track';
} {
  const variance = actualValue - plannedValue;
  const variancePercent = plannedValue !== 0 ? (variance / plannedValue) * 100 : 0;

  let status: 'on_track' | 'at_risk' | 'off_track';
  if (variancePercent >= THRESHOLDS.variance.onTrack) {
    status = 'on_track';
  } else if (variancePercent >= THRESHOLDS.variance.atRisk) {
    status = 'at_risk';
  } else {
    status = 'off_track';
  }

  return {
    variance,
    variancePercent: Math.round(variancePercent * 10) / 10,
    status,
  };
}

/**
 * KPIの予実対比を生成
 */
export function generatePlanVsActual(
  kpi: KPI,
  yearMonth: string,
  plannedValue: number
): PlanVsActual {
  const { variance, variancePercent, status } = calculateVariance(plannedValue, kpi.actualValue);

  return {
    kpiId: kpi.id,
    kpiName: kpi.name,
    yearMonth,
    plannedValue,
    actualValue: kpi.actualValue,
    variance,
    variancePercent,
    status,
  };
}

// -----------------------------------------------------
// シミュレーション
// -----------------------------------------------------

/**
 * シミュレーションを実行
 */
export function runSimulation(
  kgi: KGI,
  equations: SalesEquation[],
  kpis: KPI[],
  risks: Risk[],
  equationAdjustments: EquationAdjustment[],
  countermeasureProgress: Map<string, number>
): {
  projectedRevenue: number;
  projectedGrossProfit: number;
  achievementProbability: number;
  adjustedEquations: SalesEquation[];
  newBottlenecks: BottleneckAnalysis[];
  newFocusKPIs: string[];
} {
  // 方程式の調整を適用
  const adjustedEquations = equations.map((eq) => {
    const adjustments = equationAdjustments.filter((a) => a.equationId === eq.id);
    let updated = eq;

    for (const adj of adjustments) {
      updated = updateEquation(updated, { [adj.field]: adj.adjustedValue });
    }

    return updated;
  });

  // 調整後の予測売上を計算
  const projectedRevenue = adjustedEquations.reduce(
    (sum, eq) => sum + eq.expectedRevenue,
    0
  );

  // 粗利を計算
  const projectedGrossProfit = projectedRevenue * kgi.grossProfitMargin;

  // 対策効果を反映したKPIを再計算
  const adjustedKPIs = recalculateAllKPIsWithCountermeasures(
    kpis,
    risks,
    countermeasureProgress
  );

  // 新しいボトルネックを検出
  const newBottlenecks = detectBottlenecks(adjustedKPIs);
  const newFocusKPIs = recommendFocusKPIs(newBottlenecks);

  // 達成確率を計算（シグモイド関数的なアプローチ）
  const achievementRate = (projectedRevenue / kgi.targetRevenue) * 100;
  const achievementProbability = Math.min(
    100,
    Math.max(0, 100 / (1 + Math.exp(-0.1 * (achievementRate - 80))))
  );

  return {
    projectedRevenue,
    projectedGrossProfit,
    achievementProbability: Math.round(achievementProbability),
    adjustedEquations,
    newBottlenecks,
    newFocusKPIs,
  };
}

// -----------------------------------------------------
// 金額フォーマット
// -----------------------------------------------------

/**
 * 金額を日本語形式にフォーマット
 */
export function formatCurrency(amount: number): FormattedCurrency {
  const { thresholds } = CURRENCY_FORMAT;

  let display: string;
  let shortDisplay: string;

  if (Math.abs(amount) >= thresholds.oku) {
    const value = amount / thresholds.oku;
    display = `¥${value.toFixed(1)}億`;
    shortDisplay = `${value.toFixed(1)}億`;
  } else if (Math.abs(amount) >= thresholds.man) {
    const value = amount / thresholds.man;
    display = `¥${Math.round(value).toLocaleString()}万`;
    shortDisplay = `${Math.round(value).toLocaleString()}万`;
  } else {
    display = `¥${amount.toLocaleString()}`;
    shortDisplay = amount.toLocaleString();
  }

  return { value: amount, display, shortDisplay };
}

/**
 * パーセンテージをフォーマット
 */
export function formatPercent(value: number, isDecimal: boolean = false): string {
  const percent = isDecimal ? value * 100 : value;
  return `${percent.toFixed(1)}%`;
}

// -----------------------------------------------------
// KPIツリー操作
// -----------------------------------------------------

/**
 * KPIツリーから特定のKPIを検索
 */
export function findKPIById(kpis: KPI[], id: string): KPI | null {
  for (const kpi of kpis) {
    if (kpi.id === id) return kpi;
    const found = findKPIById(kpi.children, id);
    if (found) return found;
  }
  return null;
}

/**
 * KPIの実績値を更新
 */
export function updateKPIActualValue(
  kpis: KPI[],
  kpiId: string,
  actualValue: number
): KPI[] {
  return kpis.map((kpi) => {
    if (kpi.id === kpiId) {
      return { ...kpi, actualValue };
    }
    return {
      ...kpi,
      children: updateKPIActualValue(kpi.children, kpiId, actualValue),
    };
  });
}

/**
 * KPIの注力フラグを切り替え
 */
export function toggleFocusKPI(kpis: KPI[], kpiId: string): KPI[] {
  return kpis.map((kpi) => {
    if (kpi.id === kpiId) {
      return { ...kpi, isFocusKPI: !kpi.isFocusKPI };
    }
    return {
      ...kpi,
      children: toggleFocusKPI(kpi.children, kpiId),
    };
  });
}

/**
 * 全KPIをフラット化
 */
export function flattenKPIs(kpis: KPI[]): KPI[] {
  const result: KPI[] = [];

  const flatten = (kpi: KPI) => {
    result.push(kpi);
    kpi.children.forEach(flatten);
  };

  kpis.forEach(flatten);
  return result;
}

// -----------------------------------------------------
// 合計計算
// -----------------------------------------------------

/**
 * 売上方程式の合計売上を計算
 */
export function calculateTotalRevenue(equations: SalesEquation[]): number {
  return equations.reduce((sum, eq) => sum + eq.expectedRevenue, 0);
}

/**
 * セグメント別の売上を計算
 */
export function calculateSegmentRevenue(
  equations: SalesEquation[],
  segment: CustomerSegment
): number {
  return equations
    .filter((eq) => eq.segment === segment)
    .reduce((sum, eq) => sum + eq.expectedRevenue, 0);
}
