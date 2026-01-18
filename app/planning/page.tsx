'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Target,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  BarChart3,
  ArrowLeft,
  LayoutDashboard,
} from 'lucide-react';

import {
  KGI,
  KPI,
  SalesEquation,
  Risk,
  CustomerSegment,
} from '@/app/types/planning';
import {
  DEFAULT_KGI,
  DEFAULT_KPIS,
  DEFAULT_EQUATIONS,
  DEFAULT_RISKS,
  SEGMENT_DEFAULTS,
} from './lib/constants';
import {
  calculateKGIProgress,
  updateEquation,
  detectBottlenecks,
  recommendFocusKPIs,
  formatCurrency,
  calculateTotalRevenue,
  runSimulation,
} from './lib/calculations';

import KGIHeader from './components/KGIHeader';
import KPITree from './components/KPITree';
import SalesEquationPanel from './components/SalesEquationPanel';
import RiskPanel from './components/RiskPanel';
import SimulationPanel from './components/SimulationPanel';
import BottleneckPanel from './components/BottleneckPanel';

export default function PlanningDashboard() {
  // -----------------------------------------------------
  // 状態管理
  // -----------------------------------------------------
  const [kgi, setKgi] = useState<KGI>(DEFAULT_KGI);
  const [kpis, setKpis] = useState<KPI[]>(DEFAULT_KPIS);
  const [equations, setEquations] = useState<SalesEquation[]>(DEFAULT_EQUATIONS);
  const [risks, setRisks] = useState<Risk[]>(DEFAULT_RISKS);

  // UI状態
  const [activeTab, setActiveTab] = useState<'overview' | 'equation' | 'risk' | 'simulation'>('overview');
  const [selectedSegment, setSelectedSegment] = useState<CustomerSegment | 'all'>('all');

  // シミュレーション用の対策進捗オーバーライド
  const [countermeasureProgress, setCountermeasureProgress] = useState<Map<string, number>>(new Map());

  // -----------------------------------------------------
  // 派生データの計算（メモ化）
  // -----------------------------------------------------
  const kgiProgress = useMemo(() => calculateKGIProgress(kgi), [kgi]);

  const totalProjectedRevenue = useMemo(
    () => calculateTotalRevenue(equations),
    [equations]
  );

  const bottlenecks = useMemo(() => detectBottlenecks(kpis), [kpis]);

  const focusKPIIds = useMemo(() => recommendFocusKPIs(bottlenecks), [bottlenecks]);

  // シミュレーション結果
  const simulationResult = useMemo(() => {
    if (countermeasureProgress.size === 0) return null;

    return runSimulation(
      kgi,
      equations,
      kpis,
      risks,
      [],
      countermeasureProgress
    );
  }, [kgi, equations, kpis, risks, countermeasureProgress]);

  // 達成確率の計算
  const achievementProbability = useMemo(() => {
    const rate = (totalProjectedRevenue / kgi.targetRevenue) * 100;
    return Math.min(100, Math.max(0, Math.round(100 / (1 + Math.exp(-0.1 * (rate - 80))))));
  }, [totalProjectedRevenue, kgi.targetRevenue]);

  // -----------------------------------------------------
  // イベントハンドラ
  // -----------------------------------------------------
  const handleEquationChange = useCallback(
    (equationId: string, field: 'leadCount' | 'conversionRate' | 'averageUnitPrice' | 'growthRate', value: number) => {
      setEquations((prev) =>
        prev.map((eq) =>
          eq.id === equationId ? updateEquation(eq, { [field]: value }) : eq
        )
      );
    },
    []
  );

  const handleCountermeasureProgressChange = useCallback(
    (countermeasureId: string, progress: number) => {
      setCountermeasureProgress((prev) => {
        const next = new Map(prev);
        next.set(countermeasureId, progress);
        return next;
      });
    },
    []
  );

  const handleKPIFocusToggle = useCallback((kpiId: string) => {
    setKpis((prev) => {
      const toggleFocus = (kpis: KPI[]): KPI[] =>
        kpis.map((kpi) => ({
          ...kpi,
          isFocusKPI: kpi.id === kpiId ? !kpi.isFocusKPI : kpi.isFocusKPI,
          children: toggleFocus(kpi.children),
        }));
      return toggleFocus(prev);
    });
  }, []);

  const handleResetSimulation = useCallback(() => {
    setCountermeasureProgress(new Map());
    setEquations(DEFAULT_EQUATIONS);
  }, []);

  // -----------------------------------------------------
  // レンダリング
  // -----------------------------------------------------
  return (
    <div className="min-h-screen pb-12">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-light sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-main rounded-xl flex items-center justify-center shadow-lg">
                <Target className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-brand-main">事業計画ダッシュボード</h1>
                <p className="text-sm text-gray-secondary">アローサル・テクノロジー {kgi.fiscalYear}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* セグメントフィルター */}
              <select
                value={selectedSegment}
                onChange={(e) => setSelectedSegment(e.target.value as CustomerSegment | 'all')}
                className="px-4 py-2 text-sm bg-white border border-gray-line text-gray-main rounded-lg font-medium hover:bg-gray-light transition focus:outline-none focus:ring-2 focus:ring-brand-sub shadow-sm"
              >
                <option value="all">全セグメント</option>
                <option value="SMB">SMB</option>
                <option value="ENT">ENT</option>
              </select>

              <button
                onClick={handleResetSimulation}
                className="px-4 py-2 bg-gray-light hover:bg-brand-support-light text-gray-main rounded-lg font-medium transition shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                リセット
              </button>

              <Link
                href="/"
                className="px-4 py-2 bg-brand-main hover:bg-brand-support text-white rounded-lg font-medium transition shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                営業ダッシュボード
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* ページタイトル */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-main mb-2">KGI/KPI管理</h2>
          <p className="text-gray-secondary">
            売上目標 {formatCurrency(kgi.targetRevenue).display} / 粗利目標 {formatCurrency(kgi.targetGrossProfit).display}
          </p>
        </div>

        {/* KGIヘッダー */}
        <KGIHeader
          kgi={kgi}
          progress={kgiProgress}
          projectedRevenue={simulationResult?.projectedRevenue ?? totalProjectedRevenue}
          achievementProbability={simulationResult?.achievementProbability ?? achievementProbability}
        />

        {/* タブナビゲーション */}
        <div className="flex gap-2 mt-8 mb-6">
          {[
            { id: 'overview', label: '概要', icon: BarChart3 },
            { id: 'equation', label: '売上方程式', icon: TrendingUp },
            { id: 'risk', label: 'リスク・対策', icon: AlertTriangle },
            { id: 'simulation', label: 'シミュレーション', icon: Target },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-main text-white shadow-lg'
                  : 'bg-white text-gray-main border-2 border-gray-line hover:border-brand-sub hover:text-brand-sub'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* メインコンテンツ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左カラム: KPIツリー */}
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <KPITree
                  kpis={kpis}
                  focusKPIIds={focusKPIIds}
                  onFocusToggle={handleKPIFocusToggle}
                  selectedSegment={selectedSegment}
                />
                <SalesEquationPanel
                  equations={equations}
                  onChange={handleEquationChange}
                  selectedSegment={selectedSegment}
                />
              </div>
            )}

            {activeTab === 'equation' && (
              <SalesEquationPanel
                equations={equations}
                onChange={handleEquationChange}
                selectedSegment={selectedSegment}
                expanded
              />
            )}

            {activeTab === 'risk' && (
              <RiskPanel
                risks={risks}
                countermeasureProgress={countermeasureProgress}
                onProgressChange={handleCountermeasureProgressChange}
              />
            )}

            {activeTab === 'simulation' && (
              <SimulationPanel
                kgi={kgi}
                equations={equations}
                risks={risks}
                countermeasureProgress={countermeasureProgress}
                onEquationChange={handleEquationChange}
                onProgressChange={handleCountermeasureProgressChange}
                simulationResult={simulationResult}
              />
            )}
          </div>

          {/* 右カラム: ボトルネック・推奨 */}
          <div className="space-y-6">
            <BottleneckPanel
              bottlenecks={simulationResult?.newBottlenecks ?? bottlenecks}
              focusKPIIds={simulationResult?.newFocusKPIs ?? focusKPIIds}
              onFocusKPI={handleKPIFocusToggle}
            />

            {/* クイックサマリー */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-line">
              <h3 className="text-lg font-bold text-gray-main mb-4">クイックサマリー（月毎）</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-light">
                  <span className="text-sm text-gray-secondary">SMB月間商談数</span>
                  <span className="text-sm font-bold text-gray-main">
                    {SEGMENT_DEFAULTS.SMB.monthlyLeadCount.toLocaleString()}件/月
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-light">
                  <span className="text-sm text-gray-secondary">ENT月間商談数</span>
                  <span className="text-sm font-bold text-gray-main">
                    {SEGMENT_DEFAULTS.ENT.monthlyLeadCount.toLocaleString()}件/月
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-light">
                  <span className="text-sm text-gray-secondary">SMB成長率</span>
                  <span className="text-sm font-bold text-brand-gold">
                    {(SEGMENT_DEFAULTS.SMB.growthRate * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-light">
                  <span className="text-sm text-gray-secondary">ENT成長率</span>
                  <span className="text-sm font-bold text-brand-gold">
                    {(SEGMENT_DEFAULTS.ENT.growthRate * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-light">
                  <span className="text-sm text-gray-secondary">年間予測売上</span>
                  <span className="text-sm font-bold text-brand-sub">
                    {formatCurrency(simulationResult?.projectedRevenue ?? totalProjectedRevenue).display}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-secondary">目標との差額</span>
                  <span className={`text-sm font-bold ${
                    (simulationResult?.projectedRevenue ?? totalProjectedRevenue) >= kgi.targetRevenue
                      ? 'text-brand-sub'
                      : 'text-brand-accent'
                  }`}>
                    {formatCurrency(
                      (simulationResult?.projectedRevenue ?? totalProjectedRevenue) - kgi.targetRevenue
                    ).display}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="mt-12 bg-white border-t border-gray-light">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <p className="text-center text-sm text-gray-secondary">
            事業計画ダッシュボード · Built with Next.js & Vercel
          </p>
        </div>
      </footer>
    </div>
  );
}
