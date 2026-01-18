'use client';

import React, { useEffect, useState, useMemo } from 'react';
import MetricCard from './components/MetricCard';
import PipelineFunnel from './components/PipelineFunnel';
import DealsTable from './components/DealsTable';
import { formatCurrency } from './lib/analytics';
import { LayoutDashboard, TrendingUp, AlertTriangle, Target, Sparkles, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<any>(null);
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const [metricsRes, dealsRes] = await Promise.all([
          fetch('/api/hubspot/metrics'),
          fetch('/api/hubspot/deals'),
        ]);

        if (!metricsRes.ok || !dealsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const metricsData = await metricsRes.json();
        const dealsData = await dealsRes.json();

        setMetrics(metricsData);
        setDeals(dealsData.deals);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // useMemoでstageLookupをメモ化してReact Error #310を回避
  const stageLookup = useMemo(() => {
    const lookup = new Map<string, string>();
    if (metrics?.funnelData) {
      metrics.funnelData.forEach((stage: any, index: number) => {
        lookup.set(index.toString(), stage.stage);
      });
    }
    return lookup;
  }, [metrics?.funnelData]);

  // useMemoでtransformedDealsをメモ化
  const transformedDeals = useMemo(() => {
    return deals.map((deal: any) => ({
      id: deal.id,
      dealname: deal.properties.dealname,
      dealstage: deal.properties.dealstage,
      amount: parseFloat(deal.properties.amount || '0'),
      closedate: deal.properties.closedate,
      createdate: deal.properties.createdate,
      hs_deal_stage_probability: parseFloat(deal.properties.hs_deal_stage_probability || '0'),
    }));
  }, [deals]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center glass-card rounded-2xl p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-700 font-medium">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card rounded-2xl p-8 max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-red-600 text-xl font-bold mb-2">エラーが発生しました</h2>
            <p className="text-slate-700 mb-4">{error}</p>
            <p className="text-slate-500 text-sm">
              .env.localファイルにHUBSPOT_ACCESS_TOKENが設定されているか確認してください。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="glass-card border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center shadow-lg">
                <LayoutDashboard className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">HubSpot Sales Dashboard</h1>
                <p className="text-sm text-slate-600">Evidence-Based Sales Intelligence</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Live</span>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition shadow-md hover:shadow-lg"
              >
                <Sparkles className="w-4 h-4 inline mr-2" />
                Refresh
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition shadow-md hover:shadow-lg"
              >
                <LogOut className="w-4 h-4 inline mr-2" />
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">営業ダッシュボード</h2>
          <p className="text-slate-600">
            最終更新: {new Date().toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })} JST
          </p>
        </div>

        {/* Metrics Grid */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <MetricCard
              title="担当者手当合計"
              value={formatCurrency(metrics.metrics.totalPipelineAmount)}
              subtitle="アクティブ案件の合計"
              variant="default"
            />
            <MetricCard
              title="AI調査進予測"
              value={formatCurrency(metrics.metrics.forecastAmount)}
              subtitle="確度加重予測"
              variant="success"
              icon="check"
            />
            <MetricCard
              title="予選通過率"
              value={`${metrics.metrics.conversionRate.toFixed(0)}%`}
              subtitle="通過率"
              variant="warning"
              trend={-37}
            />
            <MetricCard
              title="停滞案件"
              value={`${metrics.metrics.staleDeals}件`}
              subtitle="要対応"
              variant="danger"
              icon="alert"
            />
            <MetricCard
              title="平均MEDDICスコア"
              value={metrics.metrics.averageMeddicScore}
              subtitle="全アクティブ案件"
              variant="default"
            />
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            {metrics?.funnelData && <PipelineFunnel data={metrics.funnelData} />}
          </div>
          <div className="glass-card rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Micro-Agents</h3>
              <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                {deals.length}/{deals.length} Active
              </span>
            </div>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                  <span className="text-sm font-semibold text-slate-900">Gem_01</span>
                  <span className="ml-auto px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">稼働中</span>
                </div>
                <p className="text-xs text-slate-600 font-medium">ファクト収集エージェント</p>
                <p className="text-xs text-slate-500 mt-1">ゴール: 重要客からエビデンスを自動抽出</p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                  <span className="text-sm font-semibold text-slate-900">Gem_02</span>
                  <span className="ml-auto px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">稼働中</span>
                </div>
                <p className="text-xs text-slate-600 font-medium">競合監査エージェント</p>
                <p className="text-xs text-slate-500 mt-1">担当者手当とエビデンスベースで検証</p>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-white rounded-xl p-4 border border-yellow-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse shadow-lg shadow-yellow-500/50"></div>
                  <span className="text-sm font-semibold text-slate-900">Gem_03</span>
                  <span className="ml-auto px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">処理中</span>
                </div>
                <p className="text-xs text-slate-600 font-medium">停滞案件エージェント</p>
                <p className="text-xs text-slate-500 mt-1">7日以上の進捗停滞を自動検知</p>
              </div>
            </div>
          </div>
        </div>

        {/* Deals Table */}
        {transformedDeals.length > 0 && (
          <DealsTable deals={transformedDeals} stageLookup={stageLookup} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 glass-card border-t border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <p className="text-center text-sm text-slate-600">
            Powered by HubSpot API · Built with Next.js & Vercel
          </p>
        </div>
      </footer>
    </div>
  );
}
