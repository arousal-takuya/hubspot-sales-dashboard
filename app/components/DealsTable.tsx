'use client';

import React, { useState, useMemo } from 'react';
import { formatCurrency } from '@/app/lib/analytics';
import { ExternalLink, Calendar, ChevronDown } from 'lucide-react';

interface Deal {
  id: string;
  dealname: string;
  dealstage: string;
  amount?: number;
  closedate?: string;
  createdate?: string;
  hs_deal_stage_probability?: number;
  companyName?: string;
}

interface DealsTableProps {
  deals: Deal[];
  stageLookup: Map<string, string>;
}

export default function DealsTable({ deals, stageLookup }: DealsTableProps) {
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState(20);

  const getStageColor = (probability?: number) => {
    if (!probability) return 'bg-slate-600';
    if (probability >= 0.7) return 'bg-green-600';
    if (probability >= 0.4) return 'bg-yellow-600';
    return 'bg-orange-600';
  };

  const getProbabilityLabel = (probability?: number) => {
    if (!probability) return '未設定';
    return `${Math.round(probability * 100)}%`;
  };

  const filteredDeals = useMemo(() => {
    if (dateFilter === 'all') return deals;

    const now = new Date();
    const filterDate = new Date();

    switch (dateFilter) {
      case '7days':
        filterDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        filterDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        filterDate.setDate(now.getDate() - 90);
        break;
      case '180days':
        filterDate.setDate(now.getDate() - 180);
        break;
      case '1year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return deals;
    }

    return deals.filter((deal) => {
      if (!deal.createdate) return false;
      const createDate = new Date(deal.createdate);
      return createDate >= filterDate;
    });
  }, [deals, dateFilter]);

  const visibleDeals = filteredDeals.slice(0, visibleCount);
  const hasMore = visibleCount < filteredDeals.length;

  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-md">
      <div className="px-6 py-4 border-b border-blue-100 flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-bold text-slate-900">案件一覧 (AI監査済み)</h3>
        <div className="flex gap-2 flex-wrap items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-600" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-1.5 text-sm bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全期間 ({deals.length}件)</option>
              <option value="7days">過去7日間</option>
              <option value="30days">過去30日間</option>
              <option value="90days">過去90日間</option>
              <option value="180days">過去180日間</option>
              <option value="1year">過去1年間</option>
            </select>
          </div>
          <span className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg font-medium">
            表示中: {visibleDeals.length}件 / 全{filteredDeals.length}件
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-50 to-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                クライアント
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                ステージ
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                MEDDIC
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                予算金額
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                AI確度
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                作成日
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                完了予定
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100">
            {visibleDeals.map((deal) => (
              <tr key={deal.id} className="hover:bg-blue-50/50 transition cursor-pointer">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-bold">
                        {deal.dealname.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{deal.dealname}</div>
                      {deal.companyName && (
                        <div className="text-xs text-slate-600">{deal.companyName}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                    {stageLookup.get(deal.dealstage) || deal.dealstage}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getStageColor(deal.hs_deal_stage_probability)}`}
                      style={{ width: `${(deal.hs_deal_stage_probability || 0) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-600 mt-1 font-medium">
                    {getProbabilityLabel(deal.hs_deal_stage_probability)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-slate-900">
                    {deal.amount ? formatCurrency(deal.amount) : '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-bold ${
                    (deal.hs_deal_stage_probability || 0) >= 0.5 ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {getProbabilityLabel(deal.hs_deal_stage_probability)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                  {deal.createdate ? new Date(deal.createdate).toLocaleDateString('ja-JP') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                  {deal.closedate ? new Date(deal.closedate).toLocaleDateString('ja-JP') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <a
                    href={`https://app.hubspot.com/contacts/21080726/record/0-3/${deal.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="px-6 py-4 border-t border-blue-100 text-center">
          <button
            onClick={() => setVisibleCount(prev => prev + 20)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg font-medium transition shadow-md hover:shadow-lg inline-flex items-center gap-2"
          >
            さらに読み込む ({filteredDeals.length - visibleCount}件)
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
