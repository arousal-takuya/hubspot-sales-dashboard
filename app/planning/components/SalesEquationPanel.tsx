'use client';

import { useMemo } from 'react';
import { Calculator, Users, Percent, DollarSign, ArrowRight, Clock } from 'lucide-react';
import { SalesEquation, CustomerSegment } from '@/app/types/planning';
import { formatCurrency, formatPercent } from '../lib/calculations';

interface SalesEquationPanelProps {
  equations: SalesEquation[];
  onChange: (
    equationId: string,
    field: 'leadCount' | 'conversionRate' | 'averageUnitPrice',
    value: number
  ) => void;
  selectedSegment: CustomerSegment | 'all';
  expanded?: boolean;
}

export default function SalesEquationPanel({
  equations,
  onChange,
  selectedSegment,
  expanded = false,
}: SalesEquationPanelProps) {
  const filteredEquations = selectedSegment === 'all'
    ? equations
    : equations.filter((eq) => eq.segment === selectedSegment);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-line overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-light">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-main rounded-xl flex items-center justify-center shadow-sm">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-main">売上方程式</h3>
            <p className="text-xs text-gray-secondary">スライダーを動かしてシミュレーション</p>
          </div>
        </div>
      </div>

      <div className={`p-4 ${expanded ? 'space-y-6' : 'space-y-4'}`}>
        {filteredEquations.map((equation) => (
          <EquationCard
            key={equation.id}
            equation={equation}
            onChange={onChange}
            expanded={expanded}
          />
        ))}

        {/* 合計 */}
        <div className="border-t border-gray-light pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-secondary font-medium">予測売上合計</span>
            <span className="text-xl font-bold text-brand-sub">
              {formatCurrency(
                filteredEquations.reduce((sum, eq) => sum + eq.expectedRevenue, 0)
              ).display}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface EquationCardProps {
  equation: SalesEquation;
  onChange: (
    equationId: string,
    field: 'leadCount' | 'conversionRate' | 'averageUnitPrice',
    value: number
  ) => void;
  expanded: boolean;
}

function EquationCard({ equation, onChange, expanded }: EquationCardProps) {
  const isSMB = equation.segment === 'SMB';
  const defaults = equation.defaults;

  // スライダーの範囲を計算
  const leadRange = {
    min: Math.round(defaults.leadCount * 0.5),
    max: Math.round(defaults.leadCount * 2),
  };
  const conversionRange = {
    min: defaults.conversionRate * 0.5,
    max: Math.min(defaults.conversionRate * 3, 0.5),
  };
  const priceRange = {
    min: Math.round(defaults.averageUnitPrice * 0.5),
    max: Math.round(defaults.averageUnitPrice * 2),
  };

  return (
    <div className="rounded-xl border border-gray-line bg-white transition-all">
      {/* ヘッダー */}
      <div className="px-4 py-3 border-b border-gray-light">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
              isSMB
                ? 'bg-brand-sub/10 text-brand-sub'
                : 'bg-brand-main/10 text-brand-main'
            }`}>
              {equation.segment}
            </span>
            <span className="text-sm text-gray-main font-medium">売上方程式</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-secondary">
            <Clock className="w-3.5 h-3.5" />
            リードタイム: {equation.leadTimeMonths}カ月
          </div>
        </div>
      </div>

      {/* 方程式表示 */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-center gap-2 text-sm mb-4">
          <div className="flex items-center gap-1 px-3 py-2 bg-gray-light rounded-lg">
            <Users className="w-4 h-4 text-gray-secondary" />
            <span className="text-gray-main font-medium">{equation.leadCount.toLocaleString()}</span>
            <span className="text-gray-secondary">件</span>
          </div>
          <span className="text-gray-line">×</span>
          <div className="flex items-center gap-1 px-3 py-2 bg-gray-light rounded-lg">
            <Percent className="w-4 h-4 text-gray-secondary" />
            <span className="text-gray-main font-medium">{formatPercent(equation.conversionRate, true)}</span>
          </div>
          <span className="text-gray-line">×</span>
          <div className="flex items-center gap-1 px-3 py-2 bg-gray-light rounded-lg">
            <DollarSign className="w-4 h-4 text-gray-secondary" />
            <span className="text-gray-main font-medium">{formatCurrency(equation.averageUnitPrice).shortDisplay}</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-line" />
          <div className={`flex items-center gap-1 px-4 py-2 rounded-lg ${
            isSMB ? 'bg-brand-sub/10' : 'bg-brand-main/10'
          }`}>
            <span className={`text-lg font-bold ${
              isSMB ? 'text-brand-sub' : 'text-brand-main'
            }`}>
              {formatCurrency(equation.expectedRevenue).display}
            </span>
          </div>
        </div>

        {/* スライダー */}
        <div className="space-y-4">
          {/* 商談数 */}
          <VariableSlider
            label="商談数"
            value={equation.leadCount}
            min={leadRange.min}
            max={leadRange.max}
            step={10}
            defaultValue={defaults.leadCount}
            unit="件"
            icon={Users}
            isSMB={isSMB}
            onChange={(value) => onChange(equation.id, 'leadCount', value)}
          />

          {/* 成約率 */}
          <VariableSlider
            label="成約率"
            value={equation.conversionRate}
            min={conversionRange.min}
            max={conversionRange.max}
            step={0.005}
            defaultValue={defaults.conversionRate}
            unit="%"
            icon={Percent}
            isSMB={isSMB}
            formatValue={(v) => formatPercent(v, true)}
            onChange={(value) => onChange(equation.id, 'conversionRate', value)}
          />

          {/* 平均単価 */}
          <VariableSlider
            label="平均単価"
            value={equation.averageUnitPrice}
            min={priceRange.min}
            max={priceRange.max}
            step={100000}
            defaultValue={defaults.averageUnitPrice}
            unit="円"
            icon={DollarSign}
            isSMB={isSMB}
            formatValue={(v) => formatCurrency(v).shortDisplay}
            onChange={(value) => onChange(equation.id, 'averageUnitPrice', value)}
          />
        </div>

        {/* 結果サマリー */}
        <div className="mt-4 pt-4 border-t border-gray-light grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-secondary">予測成約件数</div>
            <div className="text-lg font-semibold text-gray-main">
              {equation.expectedDeals.toFixed(1)}
              <span className="text-sm text-gray-secondary ml-1">件</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-secondary">デフォルト比</div>
            <div className={`text-lg font-semibold ${
              equation.expectedRevenue >= defaults.leadCount * defaults.conversionRate * defaults.averageUnitPrice
                ? 'text-brand-sub'
                : 'text-brand-gold'
            }`}>
              {((equation.expectedRevenue / (defaults.leadCount * defaults.conversionRate * defaults.averageUnitPrice)) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface VariableSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit: string;
  icon: React.ElementType;
  isSMB: boolean;
  formatValue?: (value: number) => string;
  onChange: (value: number) => void;
}

function VariableSlider({
  label,
  value,
  min,
  max,
  step,
  defaultValue,
  unit,
  icon: Icon,
  isSMB,
  formatValue,
  onChange,
}: VariableSliderProps) {
  const displayValue = formatValue ? formatValue(value) : `${value.toLocaleString()}${unit}`;
  const defaultDisplayValue = formatValue ? formatValue(defaultValue) : `${defaultValue.toLocaleString()}${unit}`;
  const percentage = ((value - min) / (max - min)) * 100;
  const diffFromDefault = value - defaultValue;
  const diffPercent = (diffFromDefault / defaultValue) * 100;

  const sliderColor = isSMB ? '#01B3EF' : '#00146E';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-secondary" />
          <span className="text-sm text-gray-main">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-main">{displayValue}</span>
          {diffFromDefault !== 0 && (
            <span className={`text-xs ${diffFromDefault > 0 ? 'text-brand-sub' : 'text-brand-accent'}`}>
              ({diffFromDefault > 0 ? '+' : ''}{diffPercent.toFixed(1)}%)
            </span>
          )}
        </div>
      </div>

      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${sliderColor} 0%, ${sliderColor} ${percentage}%, #E5E5E5 ${percentage}%, #E5E5E5 100%)`,
          }}
        />

        {/* デフォルト値マーカー */}
        <div
          className="absolute top-1/2 w-0.5 h-4 bg-gray-secondary -translate-y-1/2 pointer-events-none"
          style={{ left: `${((defaultValue - min) / (max - min)) * 100}%` }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-gray-secondary">
        <span>{formatValue ? formatValue(min) : `${min.toLocaleString()}${unit}`}</span>
        <span className="text-gray-main">デフォルト: {defaultDisplayValue}</span>
        <span>{formatValue ? formatValue(max) : `${max.toLocaleString()}${unit}`}</span>
      </div>
    </div>
  );
}
