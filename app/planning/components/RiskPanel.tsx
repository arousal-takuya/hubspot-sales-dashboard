'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  Shield,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Clock,
  User,
  Target,
} from 'lucide-react';
import { Risk, Countermeasure } from '@/app/types/planning';
import { RISK_CATEGORY_LABELS } from '../lib/constants';

interface RiskPanelProps {
  risks: Risk[];
  countermeasureProgress: Map<string, number>;
  onProgressChange: (countermeasureId: string, progress: number) => void;
}

export default function RiskPanel({
  risks,
  countermeasureProgress,
  onProgressChange,
}: RiskPanelProps) {
  const [expandedRiskIds, setExpandedRiskIds] = useState<Set<string>>(
    new Set(risks.map((r) => r.id))
  );

  const toggleExpand = (id: string) => {
    setExpandedRiskIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getRiskLevelColor = (level: Risk['level']) => {
    switch (level) {
      case 'high':
        return 'bg-brand-accent/10 text-brand-accent border-brand-accent/20';
      case 'medium':
        return 'bg-brand-gold/10 text-brand-gold border-brand-gold/20';
      case 'low':
        return 'bg-brand-sub/10 text-brand-sub border-brand-sub/20';
    }
  };

  const getRiskStatusIcon = (status: Risk['status']) => {
    switch (status) {
      case 'identified':
        return <AlertTriangle className="w-4 h-4 text-brand-gold" />;
      case 'mitigating':
        return <Clock className="w-4 h-4 text-brand-sub" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-brand-sub" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-line overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-light">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-gold rounded-xl flex items-center justify-center shadow-sm">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-main">リスク・対策管理</h3>
            <p className="text-xs text-gray-secondary">対策の進捗度をスライダーで調整してシミュレーション</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {risks.map((risk) => (
          <div
            key={risk.id}
            className="rounded-xl border border-gray-line overflow-hidden bg-white"
          >
            {/* リスクヘッダー */}
            <button
              onClick={() => toggleExpand(risk.id)}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-light/50 transition-colors"
            >
              {expandedRiskIds.has(risk.id) ? (
                <ChevronDown className="w-4 h-4 text-gray-secondary" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-secondary" />
              )}

              {getRiskStatusIcon(risk.status)}

              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-main">{risk.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getRiskLevelColor(risk.level)}`}>
                    {risk.level === 'high' ? '高' : risk.level === 'medium' ? '中' : '低'}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-light text-gray-secondary">
                    {RISK_CATEGORY_LABELS[risk.category]}
                  </span>
                </div>
              </div>

              {/* リスクスコア */}
              <div className="flex items-center gap-4 text-xs">
                <div className="text-center">
                  <div className="text-gray-secondary">発生確率</div>
                  <div className="text-gray-main font-medium">{risk.probability}%</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-secondary">影響度</div>
                  <div className="text-gray-main font-medium">{risk.impact}%</div>
                </div>
              </div>
            </button>

            {/* 対策一覧 */}
            {expandedRiskIds.has(risk.id) && (
              <div className="px-4 pb-4 space-y-3 border-t border-gray-light pt-3">
                <p className="text-xs text-gray-secondary mb-3">{risk.description}</p>

                {risk.countermeasures.map((cm) => (
                  <CountermeasureCard
                    key={cm.id}
                    countermeasure={cm}
                    progress={countermeasureProgress.get(cm.id) ?? cm.progressPercent}
                    onProgressChange={(progress) => onProgressChange(cm.id, progress)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface CountermeasureCardProps {
  countermeasure: Countermeasure;
  progress: number;
  onProgressChange: (progress: number) => void;
}

function CountermeasureCard({
  countermeasure,
  progress,
  onProgressChange,
}: CountermeasureCardProps) {
  const effectiveEffect = (progress / 100) * countermeasure.effectPercent;

  return (
    <div className="bg-gray-light/50 rounded-xl p-4 space-y-3 border border-gray-light">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-main">{countermeasure.title}</div>
          <div className="text-xs text-gray-secondary mt-1">{countermeasure.description}</div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-secondary">
          <User className="w-3.5 h-3.5" />
          {countermeasure.owner}
        </div>
      </div>

      {/* 進捗スライダー */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-secondary">対策進捗</span>
          <span className="text-gray-main font-medium">{progress}%</span>
        </div>

        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={progress}
          onChange={(e) => onProgressChange(parseInt(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #01B3EF 0%, #01B3EF ${progress}%, #E5E5E5 ${progress}%, #E5E5E5 100%)`,
          }}
        />

        <div className="flex justify-between text-[10px] text-gray-secondary">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* 効果表示 */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-light">
        <div className="flex items-center gap-2 text-xs">
          <Target className="w-3.5 h-3.5 text-brand-sub" />
          <span className="text-gray-secondary">効果見込み</span>
          <span className="text-brand-sub font-medium">{countermeasure.effectPercent}%</span>
        </div>
        <div className="text-xs">
          <span className="text-gray-secondary">現在の効果: </span>
          <span className={`font-medium ${effectiveEffect > 0 ? 'text-brand-sub' : 'text-gray-secondary'}`}>
            {effectiveEffect.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* KPI影響 */}
      {countermeasure.kpiImpacts.length > 0 && (
        <div className="text-xs text-gray-secondary">
          影響KPI: {countermeasure.kpiImpacts.map((i) => i.kpiId).join(', ')}
        </div>
      )}
    </div>
  );
}
