'use client';

import { Target, TrendingUp, Wallet, Gauge } from 'lucide-react';
import { KGI } from '@/app/types/planning';
import { formatCurrency } from '../lib/calculations';

interface KGIHeaderProps {
  kgi: KGI;
  progress: {
    revenueProgress: number;
    grossProfitProgress: number;
    overallProgress: number;
    revenueGap: number;
    grossProfitGap: number;
  };
  projectedRevenue: number;
  achievementProbability: number;
}

export default function KGIHeader({
  kgi,
  progress,
  projectedRevenue,
  achievementProbability,
}: KGIHeaderProps) {
  const projectedGrossProfit = projectedRevenue * kgi.grossProfitMargin;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 売上目標 */}
      <div className="rounded-2xl border border-gray-line p-6 bg-white shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-brand-support-light flex items-center justify-center">
                <Target className="w-4 h-4 text-brand-main" />
              </div>
              <p className="text-sm font-semibold text-gray-secondary">売上目標</p>
            </div>
            <h3 className="text-3xl font-bold text-gray-main mb-1">
              {formatCurrency(kgi.targetRevenue).display}
            </h3>
            <p className="text-xs text-gray-secondary font-medium">
              実績: {formatCurrency(kgi.actualRevenue).display}
            </p>
          </div>
          <span className="px-3 py-1 bg-brand-support-light text-brand-main text-xs font-bold rounded-full">
            {progress.revenueProgress.toFixed(1)}%
          </span>
        </div>
        <div className="mt-4">
          <div className="w-full h-2 bg-gray-light rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-sub rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, progress.revenueProgress)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 粗利目標 */}
      <div className="rounded-2xl border border-gray-line p-6 bg-white shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-brand-support-light flex items-center justify-center">
                <Wallet className="w-4 h-4 text-brand-main" />
              </div>
              <p className="text-sm font-semibold text-gray-secondary">粗利目標</p>
            </div>
            <h3 className="text-3xl font-bold text-gray-main mb-1">
              {formatCurrency(kgi.targetGrossProfit).display}
            </h3>
            <p className="text-xs text-gray-secondary font-medium">
              粗利率 {(kgi.grossProfitMargin * 100).toFixed(0)}%
            </p>
          </div>
          <span className="px-3 py-1 bg-brand-support-light text-brand-main text-xs font-bold rounded-full">
            {progress.grossProfitProgress.toFixed(1)}%
          </span>
        </div>
        <div className="mt-4">
          <div className="w-full h-2 bg-gray-light rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-main rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, progress.grossProfitProgress)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 予測売上 */}
      <div className="rounded-2xl border border-gray-line p-6 bg-white shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-brand-support-light flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-brand-main" />
              </div>
              <p className="text-sm font-semibold text-gray-secondary">予測売上</p>
            </div>
            <h3 className="text-3xl font-bold text-gray-main mb-1">
              {formatCurrency(projectedRevenue).display}
            </h3>
            <p className="text-xs text-gray-secondary font-medium">
              予測粗利: {formatCurrency(projectedGrossProfit).display}
            </p>
          </div>
          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
            projectedRevenue >= kgi.targetRevenue
              ? 'bg-brand-sub/10 text-brand-sub'
              : 'bg-brand-gold/20 text-brand-gold'
          }`}>
            {projectedRevenue >= kgi.targetRevenue ? '達成見込' : '未達見込'}
          </span>
        </div>
        <div className="mt-4 text-xs text-gray-secondary">
          目標比: <span className={`font-bold ${projectedRevenue >= kgi.targetRevenue ? 'text-brand-sub' : 'text-brand-gold'}`}>
            {((projectedRevenue / kgi.targetRevenue) * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* 達成確率 */}
      <div className="rounded-2xl border border-gray-line p-6 bg-white shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-brand-support-light flex items-center justify-center">
                <Gauge className="w-4 h-4 text-brand-main" />
              </div>
              <p className="text-sm font-semibold text-gray-secondary">達成確率</p>
            </div>
            <h3 className={`text-3xl font-bold mb-1 ${
              achievementProbability >= 80
                ? 'text-brand-sub'
                : achievementProbability >= 50
                ? 'text-brand-gold'
                : 'text-brand-accent'
            }`}>
              {achievementProbability}%
            </h3>
            <p className="text-xs text-gray-secondary font-medium">シミュレーション結果</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="relative w-full h-3 bg-gray-light rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                achievementProbability >= 80
                  ? 'bg-brand-sub'
                  : achievementProbability >= 50
                  ? 'bg-brand-gold'
                  : 'bg-brand-accent'
              }`}
              style={{ width: `${achievementProbability}%` }}
            />
            <div
              className="absolute top-0 w-0.5 h-full bg-gray-secondary"
              style={{ left: '80%' }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-secondary mt-1">
            <span>0%</span>
            <span>50%</span>
            <span className="text-gray-main font-medium">80%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
