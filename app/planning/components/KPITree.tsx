'use client';

import { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Star,
  TrendingUp,
  Users,
  DollarSign,
  Percent,
} from 'lucide-react';
import { KPI, CustomerSegment } from '@/app/types/planning';
import { formatCurrency, calculateKPIAchievement } from '../lib/calculations';

interface KPITreeProps {
  kpis: KPI[];
  focusKPIIds: string[];
  onFocusToggle: (kpiId: string) => void;
  selectedSegment: CustomerSegment | 'all';
}

export default function KPITree({
  kpis,
  focusKPIIds,
  onFocusToggle,
  selectedSegment,
}: KPITreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(kpis.map((kpi) => kpi.id))
  );

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredKpis = selectedSegment === 'all'
    ? kpis
    : kpis.filter((kpi) => kpi.segment === selectedSegment);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-line overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-light">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-sub rounded-xl flex items-center justify-center shadow-sm">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-main">KPIツリー</h3>
            <p className="text-xs text-gray-secondary">クリックで展開・折りたたみ</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {filteredKpis.map((kpi) => (
          <KPITreeNode
            key={kpi.id}
            kpi={kpi}
            depth={0}
            expandedIds={expandedIds}
            focusKPIIds={focusKPIIds}
            onToggleExpand={toggleExpand}
            onFocusToggle={onFocusToggle}
          />
        ))}
      </div>
    </div>
  );
}

interface KPITreeNodeProps {
  kpi: KPI;
  depth: number;
  expandedIds: Set<string>;
  focusKPIIds: string[];
  onToggleExpand: (id: string) => void;
  onFocusToggle: (id: string) => void;
}

function KPITreeNode({
  kpi,
  depth,
  expandedIds,
  focusKPIIds,
  onToggleExpand,
  onFocusToggle,
}: KPITreeNodeProps) {
  const isExpanded = expandedIds.has(kpi.id);
  const hasChildren = kpi.children.length > 0;
  const isFocus = focusKPIIds.includes(kpi.id) || kpi.isFocusKPI;
  const achievement = calculateKPIAchievement(kpi);

  const getIcon = () => {
    if (kpi.unit === 'count') return Users;
    if (kpi.unit === 'yen') return DollarSign;
    if (kpi.unit === 'percentage' || kpi.unit === 'rate') return Percent;
    return TrendingUp;
  };

  const Icon = getIcon();

  const getProgressColor = () => {
    if (achievement >= 80) return 'bg-brand-sub';
    if (achievement >= 50) return 'bg-brand-gold';
    return 'bg-brand-accent';
  };

  const formatValue = () => {
    if (kpi.unit === 'yen') return formatCurrency(kpi.targetValue).display;
    if (kpi.unit === 'percentage') return `${kpi.targetValue}%`;
    if (kpi.unit === 'count') return `${kpi.targetValue.toLocaleString()}件`;
    return kpi.targetValue.toLocaleString();
  };

  const formatActual = () => {
    if (kpi.unit === 'yen') return formatCurrency(kpi.actualValue).display;
    if (kpi.unit === 'percentage') return `${kpi.actualValue}%`;
    if (kpi.unit === 'count') return `${kpi.actualValue.toLocaleString()}件`;
    return kpi.actualValue.toLocaleString();
  };

  const segmentBadge = kpi.segment && (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
      kpi.segment === 'SMB'
        ? 'bg-brand-sub/10 text-brand-sub'
        : 'bg-brand-main/10 text-brand-main'
    }`}>
      {kpi.segment}
    </span>
  );

  return (
    <div>
      <div
        className={`flex items-center gap-3 p-4 rounded-xl transition-all cursor-pointer border ${
          isFocus
            ? 'bg-brand-gold/5 border-brand-gold shadow-sm'
            : 'bg-white border-gray-light hover:border-brand-sub/50 hover:shadow-sm'
        }`}
        style={{ marginLeft: depth * 24 }}
      >
        {/* 展開/折りたたみボタン */}
        <button
          onClick={() => hasChildren && onToggleExpand(kpi.id)}
          className={`w-6 h-6 flex items-center justify-center rounded-lg transition-colors ${
            hasChildren ? 'bg-gray-light hover:bg-brand-support-light' : 'cursor-default'
          }`}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-secondary" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-secondary" />
            )
          ) : (
            <div className="w-2 h-2 rounded-full bg-gray-line" />
          )}
        </button>

        {/* アイコン */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          isFocus ? 'bg-brand-gold/20' : 'bg-gray-light'
        }`}>
          <Icon className={`w-4 h-4 ${isFocus ? 'text-brand-gold' : 'text-gray-secondary'}`} />
        </div>

        {/* KPI名・セグメント */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-main truncate">{kpi.name}</span>
            {segmentBadge}
            {isFocus && (
              <Star className="w-4 h-4 text-brand-gold fill-brand-gold" />
            )}
          </div>
          <div className="text-xs text-gray-secondary truncate">{kpi.formula}</div>
        </div>

        {/* 目標値・実績 */}
        <div className="text-right shrink-0">
          <div className="text-sm font-bold text-gray-main">{formatValue()}</div>
          <div className="text-xs text-gray-secondary">実績: {formatActual()}</div>
        </div>

        {/* 達成率プログレス */}
        <div className="w-24 shrink-0">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-secondary">達成率</span>
            <span className={`font-bold ${
              achievement >= 80 ? 'text-brand-sub' :
              achievement >= 50 ? 'text-brand-gold' : 'text-brand-accent'
            }`}>
              {achievement.toFixed(0)}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-light rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getProgressColor()}`}
              style={{ width: `${Math.min(100, achievement)}%` }}
            />
          </div>
        </div>

        {/* 注力KPIトグル */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFocusToggle(kpi.id);
          }}
          className={`p-2 rounded-lg transition-all ${
            isFocus
              ? 'bg-brand-gold/20 text-brand-gold shadow-sm'
              : 'bg-gray-light text-gray-line hover:bg-brand-gold/10 hover:text-brand-gold'
          }`}
          title={isFocus ? '注力KPIを解除' : '注力KPIに設定'}
        >
          <Star className={`w-4 h-4 ${isFocus ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* 子KPI */}
      {hasChildren && isExpanded && (
        <div className="mt-2 space-y-2">
          {kpi.children.map((child) => (
            <KPITreeNode
              key={child.id}
              kpi={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              focusKPIIds={focusKPIIds}
              onToggleExpand={onToggleExpand}
              onFocusToggle={onFocusToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
