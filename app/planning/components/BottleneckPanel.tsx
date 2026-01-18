'use client';

import {
  AlertTriangle,
  Star,
  TrendingDown,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';
import { BottleneckAnalysis } from '@/app/types/planning';

interface BottleneckPanelProps {
  bottlenecks: BottleneckAnalysis[];
  focusKPIIds: string[];
  onFocusKPI: (kpiId: string) => void;
}

export default function BottleneckPanel({
  bottlenecks,
  focusKPIIds,
  onFocusKPI,
}: BottleneckPanelProps) {
  if (bottlenecks.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-line">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-brand-sub/10 flex items-center justify-center">
          <Star className="w-6 h-6 text-brand-sub" />
        </div>
        <h3 className="text-sm font-semibold text-gray-main mb-1">ボトルネックなし</h3>
        <p className="text-xs text-gray-secondary">
          現在の計画は順調に進んでいます
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-line overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-light">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-gold rounded-xl flex items-center justify-center shadow-sm">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-main">ボトルネック分析</h3>
            <p className="text-xs text-gray-secondary">KGI達成を阻害している可能性が高いKPI</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {bottlenecks.slice(0, 5).map((bottleneck, index) => {
          const isFocus = focusKPIIds.includes(bottleneck.kpiId);
          const severity = bottleneck.bottleneckScore > 50 ? 'high' :
                          bottleneck.bottleneckScore > 30 ? 'medium' : 'low';

          return (
            <div
              key={bottleneck.kpiId}
              className={`rounded-xl border transition-all ${
                isFocus
                  ? 'bg-brand-gold/5 border-brand-gold'
                  : 'bg-white border-gray-light'
              }`}
            >
              <div className="p-3">
                <div className="flex items-start gap-3">
                  {/* 順位 */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    index === 0 ? 'bg-brand-accent/10 text-brand-accent' :
                    index === 1 ? 'bg-brand-gold/20 text-brand-gold' :
                    'bg-gray-light text-gray-secondary'
                  }`}>
                    {index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-main truncate">
                        {bottleneck.kpiName}
                      </span>
                      {bottleneck.segment && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${
                          bottleneck.segment === 'SMB'
                            ? 'bg-brand-sub/10 text-brand-sub'
                            : 'bg-brand-main/10 text-brand-main'
                        }`}>
                          {bottleneck.segment}
                        </span>
                      )}
                      {isFocus && (
                        <Star className="w-3.5 h-3.5 text-brand-gold fill-brand-gold shrink-0" />
                      )}
                    </div>

                    {/* 達成率バー */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-1.5 bg-gray-light rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            severity === 'high' ? 'bg-brand-accent' :
                            severity === 'medium' ? 'bg-brand-gold' : 'bg-brand-sub'
                          }`}
                          style={{ width: `${bottleneck.achievementRate}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium shrink-0 ${
                        severity === 'high' ? 'text-brand-accent' :
                        severity === 'medium' ? 'text-brand-gold' : 'text-brand-sub'
                      }`}>
                        {bottleneck.achievementRate.toFixed(0)}%
                      </span>
                    </div>

                    {/* 理由 */}
                    <p className="text-xs text-gray-secondary mb-2">{bottleneck.reason}</p>

                    {/* 推奨アクション */}
                    {bottleneck.recommendedActions.length > 0 && (
                      <div className="space-y-1">
                        {bottleneck.recommendedActions.slice(0, 2).map((action, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs text-gray-main">
                            <Lightbulb className="w-3 h-3 text-brand-gold" />
                            <span>{action}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 注力KPIに設定ボタン */}
                  <button
                    onClick={() => onFocusKPI(bottleneck.kpiId)}
                    className={`p-2 rounded-lg transition-colors shrink-0 ${
                      isFocus
                        ? 'bg-brand-gold/20 text-brand-gold'
                        : 'bg-gray-light text-gray-line hover:bg-brand-gold/10 hover:text-brand-gold'
                    }`}
                    title={isFocus ? '注力KPIを解除' : '注力KPIに設定'}
                  >
                    <Star className={`w-4 h-4 ${isFocus ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* スコア表示 */}
              <div className="px-3 py-2 border-t border-gray-light flex items-center justify-between text-xs">
                <span className="text-gray-secondary">ボトルネックスコア</span>
                <span className={`font-medium ${
                  severity === 'high' ? 'text-brand-accent' :
                  severity === 'medium' ? 'text-brand-gold' : 'text-brand-sub'
                }`}>
                  {bottleneck.bottleneckScore.toFixed(1)}
                </span>
              </div>
            </div>
          );
        })}

        {bottlenecks.length > 5 && (
          <div className="text-center py-2">
            <span className="text-xs text-gray-secondary">
              他 {bottlenecks.length - 5} 件のボトルネック
            </span>
          </div>
        )}
      </div>

      {/* 推奨される注力KPI */}
      {focusKPIIds.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-light bg-brand-sub/5">
          <div className="flex items-center gap-2 text-xs">
            <Star className="w-4 h-4 text-brand-sub" />
            <span className="text-gray-secondary">推奨注力KPI:</span>
            <span className="text-brand-sub font-medium">
              {focusKPIIds.length}件設定中
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
