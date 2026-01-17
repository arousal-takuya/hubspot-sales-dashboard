import { HubSpotDeal } from './hubspot';
import { DashboardMetrics, PipelineFunnelData } from '../types';

export function calculateMetrics(deals: HubSpotDeal[]): DashboardMetrics {
  const openDeals = deals.filter(
    deal => deal.properties.hs_is_closed === 'false' || !deal.properties.hs_is_closed
  );

  // 担当者手当合計（全オープン案件の金額合計）
  const totalPipelineAmount = openDeals.reduce((sum, deal) => {
    const amount = parseFloat(deal.properties.amount || '0');
    return sum + amount;
  }, 0);

  // AI調査進予測（確度加重予測）
  const forecastAmount = openDeals.reduce((sum, deal) => {
    const amount = parseFloat(deal.properties.amount || '0');
    const probability = parseFloat(deal.properties.hs_deal_stage_probability || '0');
    return sum + (amount * probability);
  }, 0);

  // 停滞案件（更新から7日以上経過）
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const staleDeals = openDeals.filter(deal => {
    const lastModified = new Date(deal.properties.hs_lastmodifieddate);
    return lastModified < sevenDaysAgo;
  }).length;

  // 予選通過率（仮の計算 - ステージに基づく）
  const totalDeals = deals.length;
  const qualifiedDeals = deals.filter(deal => {
    const probability = parseFloat(deal.properties.hs_deal_stage_probability || '0');
    return probability >= 0.5; // 確度50%以上を通過とみなす
  }).length;

  const conversionRate = totalDeals > 0 ? (qualifiedDeals / totalDeals) * 100 : 0;

  // 平均MEDDICスコア（カスタムプロパティがあれば計算）
  // 今回はダミー値
  const averageMeddicScore = 64;

  return {
    totalPipelineAmount,
    forecastAmount,
    conversionRate,
    staleDeals,
    averageMeddicScore,
  };
}

export function calculatePipelineFunnel(
  deals: HubSpotDeal[],
  stages: Array<{ id: string; label: string; displayOrder: number }>
): PipelineFunnelData[] {
  // オープン案件のみでなく、全案件を集計対象にする
  // これにより、クローズ済み案件も含めてパイプラインの全体像が見える

  // ステージごとに集計
  const stageCounts = new Map<string, { amount: number; count: number }>();

  stages.forEach(stage => {
    stageCounts.set(stage.id, { amount: 0, count: 0 });
  });

  deals.forEach(deal => {
    const stageId = deal.properties.dealstage;
    const amount = parseFloat(deal.properties.amount || '0');

    if (stageCounts.has(stageId)) {
      const current = stageCounts.get(stageId)!;
      current.amount += amount;
      current.count += 1;
    }
  });

  // ステージ順に並べ替えて返す
  return stages
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map(stage => ({
      stage: stage.label,
      amount: stageCounts.get(stage.id)?.amount || 0,
      count: stageCounts.get(stage.id)?.count || 0,
    }));
}

export function formatCurrency(amount: number): string {
  if (amount >= 100000000) {
    return `¥${(amount / 100000000).toFixed(1)}億`;
  } else if (amount >= 10000) {
    return `¥${(amount / 10000).toFixed(1)}万`;
  }
  return `¥${amount.toLocaleString('ja-JP')}`;
}

export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}
