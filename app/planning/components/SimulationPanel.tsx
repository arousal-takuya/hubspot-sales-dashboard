'use client';

import { useMemo } from 'react';
import {
  FlaskConical,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Sparkles,
  Target,
  AlertTriangle,
} from 'lucide-react';
import { KGI, SalesEquation, Risk, EquationAdjustment, BottleneckAnalysis } from '@/app/types/planning';
import { formatCurrency, formatPercent, calculateTotalRevenue } from '../lib/calculations';
import { DEFAULT_EQUATIONS } from '../lib/constants';

interface SimulationPanelProps {
  kgi: KGI;
  equations: SalesEquation[];
  risks: Risk[];
  countermeasureProgress: Map<string, number>;
  onEquationChange: (
    equationId: string,
    field: 'leadCount' | 'conversionRate' | 'averageUnitPrice',
    value: number
  ) => void;
  onProgressChange: (countermeasureId: string, progress: number) => void;
  simulationResult: {
    projectedRevenue: number;
    projectedGrossProfit: number;
    achievementProbability: number;
    newBottlenecks: BottleneckAnalysis[];
    newFocusKPIs: string[];
  } | null;
}

export default function SimulationPanel({
  kgi,
  equations,
  risks,
  countermeasureProgress,
  onEquationChange,
  onProgressChange,
  simulationResult,
}: SimulationPanelProps) {
  const currentRevenue = calculateTotalRevenue(equations);
  const defaultRevenue = calculateTotalRevenue(DEFAULT_EQUATIONS);

  const revenueChange = currentRevenue - defaultRevenue;
  const revenueChangePercent = (revenueChange / defaultRevenue) * 100;

  // 対策の総合進捗
  const totalCountermeasures = risks.reduce((sum, r) => sum + r.countermeasures.length, 0);
  const totalProgress = risks.reduce((sum, risk) => {
    return sum + risk.countermeasures.reduce((cmSum, cm) => {
      return cmSum + (countermeasureProgress.get(cm.id) ?? cm.progressPercent);
    }, 0);
  }, 0);
  const averageProgress = totalCountermeasures > 0 ? totalProgress / totalCountermeasures : 0;

  return (
    <div className="space-y-6">
      {/* シミュレーション概要 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-line overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-light">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-main rounded-xl flex items-center justify-center shadow-sm">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-main">シミュレーション結果</h3>
              <p className="text-xs text-gray-secondary">What-Ifシナリオで予測を確認</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* メイン結果 */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-brand-sub/5 rounded-xl p-4 border border-brand-sub/20">
              <div className="text-xs text-gray-secondary mb-1">現在の予測売上</div>
              <div className="text-2xl font-bold text-gray-main">
                {formatCurrency(simulationResult?.projectedRevenue ?? currentRevenue).display}
              </div>
              <div className={`flex items-center gap-1 mt-2 text-sm ${
                revenueChange >= 0 ? 'text-brand-sub' : 'text-brand-accent'
              }`}>
                {revenueChange >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>
                  {revenueChange >= 0 ? '+' : ''}
                  {formatCurrency(revenueChange).shortDisplay}
                  ({revenueChangePercent >= 0 ? '+' : ''}{revenueChangePercent.toFixed(1)}%)
                </span>
              </div>
            </div>

            <div className="bg-brand-main/5 rounded-xl p-4 border border-brand-main/20">
              <div className="text-xs text-gray-secondary mb-1">達成確率</div>
              <div className={`text-2xl font-bold ${
                (simulationResult?.achievementProbability ?? 0) >= 80
                  ? 'text-brand-sub'
                  : (simulationResult?.achievementProbability ?? 0) >= 50
                  ? 'text-brand-gold'
                  : 'text-brand-accent'
              }`}>
                {simulationResult?.achievementProbability ??
                  Math.round(100 / (1 + Math.exp(-0.1 * ((currentRevenue / kgi.targetRevenue * 100) - 80))))}%
              </div>
              <div className="text-xs text-gray-secondary mt-2">
                目標: {formatCurrency(kgi.targetRevenue).display}
              </div>
            </div>
          </div>

          {/* 対策進捗サマリー */}
          <div className="bg-gray-light/50 rounded-xl p-4 mb-4 border border-gray-light">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-main">対策実行状況</span>
              <span className="text-sm font-medium text-gray-main">{averageProgress.toFixed(0)}%</span>
            </div>
            <div className="w-full h-3 bg-gray-light rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-sub rounded-full transition-all duration-300"
                style={{ width: `${averageProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-secondary mt-1">
              <span>対策未着手</span>
              <span>完全実行</span>
            </div>
          </div>

          {/* What-If シナリオ */}
          <div className="space-y-3">
            <div className="text-xs text-gray-main font-medium">What-If シナリオ</div>

            <button
              onClick={() => {
                // 全対策を50%に設定
                risks.forEach((risk) => {
                  risk.countermeasures.forEach((cm) => {
                    onProgressChange(cm.id, 50);
                  });
                });
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-line hover:border-brand-gold hover:bg-brand-gold/5 rounded-xl transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-gold/10 flex items-center justify-center">
                  <Target className="w-4 h-4 text-brand-gold" />
                </div>
                <div>
                  <div className="text-sm text-gray-main font-medium">対策50%実行</div>
                  <div className="text-xs text-gray-secondary">全対策を50%進捗に設定</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-line" />
            </button>

            <button
              onClick={() => {
                // 全対策を100%に設定
                risks.forEach((risk) => {
                  risk.countermeasures.forEach((cm) => {
                    onProgressChange(cm.id, 100);
                  });
                });
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-line hover:border-brand-sub hover:bg-brand-sub/5 rounded-xl transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-sub/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-brand-sub" />
                </div>
                <div>
                  <div className="text-sm text-gray-main font-medium">対策100%実行</div>
                  <div className="text-xs text-gray-secondary">全対策を完全実行に設定</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-line" />
            </button>

            <button
              onClick={() => {
                // 商談数を1.5倍に設定
                equations.forEach((eq) => {
                  onEquationChange(eq.id, 'leadCount', Math.round(eq.defaults.leadCount * 1.5));
                });
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-line hover:border-brand-main hover:bg-brand-main/5 rounded-xl transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-main/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-brand-main" />
                </div>
                <div>
                  <div className="text-sm text-gray-main font-medium">商談1.5倍</div>
                  <div className="text-xs text-gray-secondary">商談獲得数を50%増加</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-line" />
            </button>
          </div>
        </div>
      </div>

      {/* 変更されたボトルネック */}
      {simulationResult && simulationResult.newBottlenecks.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-line overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-light">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-brand-gold" />
              <h3 className="text-lg font-bold text-gray-main">シミュレーション後のボトルネック</h3>
            </div>
          </div>

          <div className="p-4 space-y-2">
            {simulationResult.newBottlenecks.slice(0, 3).map((bottleneck) => (
              <div
                key={bottleneck.kpiId}
                className="flex items-center justify-between px-4 py-3 bg-gray-light/50 rounded-xl border border-gray-light"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    bottleneck.bottleneckScore > 50 ? 'bg-brand-accent' :
                    bottleneck.bottleneckScore > 30 ? 'bg-brand-gold' : 'bg-brand-sub'
                  }`} />
                  <span className="text-sm text-gray-main font-medium">{bottleneck.kpiName}</span>
                  {bottleneck.segment && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      bottleneck.segment === 'SMB'
                        ? 'bg-brand-sub/10 text-brand-sub'
                        : 'bg-brand-main/10 text-brand-main'
                    }`}>
                      {bottleneck.segment}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-secondary">
                  達成率: <span className="font-medium text-gray-main">{bottleneck.achievementRate.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 比較表 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-line overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-light">
          <h3 className="text-lg font-bold text-gray-main">デフォルト vs 現在の設定</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-light bg-gray-light/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-secondary">項目</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-secondary">デフォルト</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-secondary">現在</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-secondary">変化</th>
              </tr>
            </thead>
            <tbody>
              {equations.map((eq) => {
                const defaultEq = DEFAULT_EQUATIONS.find((d) => d.id === eq.id);
                if (!defaultEq) return null;

                const leadChange = eq.leadCount - defaultEq.leadCount;
                const conversionChange = eq.conversionRate - defaultEq.conversionRate;
                const priceChange = eq.averageUnitPrice - defaultEq.averageUnitPrice;
                const revenueChange = eq.expectedRevenue - defaultEq.expectedRevenue;

                return (
                  <>
                    <tr key={`${eq.id}-header`} className="bg-gray-light/30">
                      <td colSpan={4} className="px-4 py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          eq.segment === 'SMB'
                            ? 'bg-brand-sub/10 text-brand-sub'
                            : 'bg-brand-main/10 text-brand-main'
                        }`}>
                          {eq.segment}
                        </span>
                      </td>
                    </tr>
                    <tr key={`${eq.id}-leads`} className="border-b border-gray-light">
                      <td className="px-4 py-2 text-gray-main">商談数</td>
                      <td className="px-4 py-2 text-right text-gray-secondary">{defaultEq.leadCount.toLocaleString()}件</td>
                      <td className="px-4 py-2 text-right text-gray-main font-medium">{eq.leadCount.toLocaleString()}件</td>
                      <td className={`px-4 py-2 text-right ${leadChange >= 0 ? 'text-brand-sub' : 'text-brand-accent'}`}>
                        {leadChange >= 0 ? '+' : ''}{leadChange.toLocaleString()}
                      </td>
                    </tr>
                    <tr key={`${eq.id}-conversion`} className="border-b border-gray-light">
                      <td className="px-4 py-2 text-gray-main">成約率</td>
                      <td className="px-4 py-2 text-right text-gray-secondary">{formatPercent(defaultEq.conversionRate, true)}</td>
                      <td className="px-4 py-2 text-right text-gray-main font-medium">{formatPercent(eq.conversionRate, true)}</td>
                      <td className={`px-4 py-2 text-right ${conversionChange >= 0 ? 'text-brand-sub' : 'text-brand-accent'}`}>
                        {conversionChange >= 0 ? '+' : ''}{formatPercent(conversionChange, true)}
                      </td>
                    </tr>
                    <tr key={`${eq.id}-price`} className="border-b border-gray-light">
                      <td className="px-4 py-2 text-gray-main">平均単価</td>
                      <td className="px-4 py-2 text-right text-gray-secondary">{formatCurrency(defaultEq.averageUnitPrice).shortDisplay}</td>
                      <td className="px-4 py-2 text-right text-gray-main font-medium">{formatCurrency(eq.averageUnitPrice).shortDisplay}</td>
                      <td className={`px-4 py-2 text-right ${priceChange >= 0 ? 'text-brand-sub' : 'text-brand-accent'}`}>
                        {priceChange >= 0 ? '+' : ''}{formatCurrency(priceChange).shortDisplay}
                      </td>
                    </tr>
                    <tr key={`${eq.id}-revenue`} className="border-b border-gray-line">
                      <td className="px-4 py-2 text-gray-main font-medium">予測売上</td>
                      <td className="px-4 py-2 text-right text-gray-secondary">{formatCurrency(defaultEq.expectedRevenue).display}</td>
                      <td className="px-4 py-2 text-right text-gray-main font-bold">{formatCurrency(eq.expectedRevenue).display}</td>
                      <td className={`px-4 py-2 text-right font-bold ${revenueChange >= 0 ? 'text-brand-sub' : 'text-brand-accent'}`}>
                        {revenueChange >= 0 ? '+' : ''}{formatCurrency(revenueChange).shortDisplay}
                      </td>
                    </tr>
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
