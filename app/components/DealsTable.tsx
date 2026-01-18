'use client';

import React, { useState, useMemo } from 'react';
import { formatCurrency } from '@/app/lib/analytics';
import { ExternalLink, ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';

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
  dateFilter: string;
  onDateFilterChange: (filter: string) => void;
  totalDealsCount: number;
}

type SortKey = 'dealname' | 'dealstage' | 'amount' | 'hs_deal_stage_probability' | 'createdate' | 'closedate';
type SortOrder = 'asc' | 'desc' | null;

export default function DealsTable({ deals, stageLookup, dateFilter, onDateFilterChange, totalDealsCount }: DealsTableProps) {
  const [visibleCount, setVisibleCount] = useState(20);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else if (sortOrder === 'desc') {
        setSortKey(null);
        setSortOrder(null);
      } else {
        setSortOrder('asc');
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) {
      return <ChevronsUpDown className="w-3 h-3 ml-1 opacity-50" />;
    }
    if (sortOrder === 'asc') {
      return <ChevronUp className="w-3 h-3 ml-1" />;
    }
    return <ChevronDown className="w-3 h-3 ml-1" />;
  };

  const getStageColor = (probability?: number) => {
    if (!probability) return 'bg-gray-line';
    if (probability >= 0.7) return 'bg-brand-sub';
    if (probability >= 0.4) return 'bg-brand-gold';
    return 'bg-brand-accent';
  };

  const getProbabilityLabel = (probability?: number) => {
    if (!probability) return '未設定';
    return `${Math.round(probability * 100)}%`;
  };

  // ソートのみ（フィルターは親で処理済み）
  const sortedDeals = useMemo(() => {
    if (!sortKey || !sortOrder) return deals;

    return [...deals].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortKey) {
        case 'dealname':
          aVal = a.dealname || '';
          bVal = b.dealname || '';
          break;
        case 'dealstage':
          aVal = stageLookup.get(a.dealstage) || a.dealstage || '';
          bVal = stageLookup.get(b.dealstage) || b.dealstage || '';
          break;
        case 'amount':
          aVal = a.amount || 0;
          bVal = b.amount || 0;
          break;
        case 'hs_deal_stage_probability':
          aVal = a.hs_deal_stage_probability || 0;
          bVal = b.hs_deal_stage_probability || 0;
          break;
        case 'createdate':
          aVal = a.createdate ? new Date(a.createdate).getTime() : 0;
          bVal = b.createdate ? new Date(b.createdate).getTime() : 0;
          break;
        case 'closedate':
          aVal = a.closedate ? new Date(a.closedate).getTime() : 0;
          bVal = b.closedate ? new Date(b.closedate).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const comparison = aVal.localeCompare(bVal, 'ja');
        return sortOrder === 'asc' ? comparison : -comparison;
      }

      if (sortOrder === 'asc') {
        return aVal - bVal;
      }
      return bVal - aVal;
    });
  }, [deals, sortKey, sortOrder, stageLookup]);

  const visibleDeals = sortedDeals.slice(0, visibleCount);
  const hasMore = visibleCount < sortedDeals.length;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-line">
      <div className="px-6 py-4 border-b border-gray-light flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-bold text-gray-main">案件一覧 (AI監査済み)</h3>
        <span className="px-3 py-1 text-xs bg-brand-sub text-white rounded-lg font-medium">
          表示中: {visibleDeals.length}件 / 全{deals.length}件
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-light/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-secondary uppercase tracking-wider">
                <button
                  onClick={() => handleSort('dealname')}
                  className="inline-flex items-center hover:text-brand-main transition"
                >
                  取引
                  {getSortIcon('dealname')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-secondary uppercase tracking-wider">
                <button
                  onClick={() => handleSort('dealstage')}
                  className="inline-flex items-center hover:text-brand-main transition"
                >
                  ステージ
                  {getSortIcon('dealstage')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-secondary uppercase tracking-wider">
                <button
                  onClick={() => handleSort('hs_deal_stage_probability')}
                  className="inline-flex items-center hover:text-brand-main transition"
                >
                  MEDDIC
                  {getSortIcon('hs_deal_stage_probability')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-secondary uppercase tracking-wider">
                <button
                  onClick={() => handleSort('amount')}
                  className="inline-flex items-center hover:text-brand-main transition"
                >
                  予算金額
                  {getSortIcon('amount')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-secondary uppercase tracking-wider">
                AI確度
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-secondary uppercase tracking-wider">
                <button
                  onClick={() => handleSort('createdate')}
                  className="inline-flex items-center hover:text-brand-main transition"
                >
                  作成日
                  {getSortIcon('createdate')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-secondary uppercase tracking-wider">
                <button
                  onClick={() => handleSort('closedate')}
                  className="inline-flex items-center hover:text-brand-main transition"
                >
                  完了予定
                  {getSortIcon('closedate')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-secondary uppercase tracking-wider">
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-light">
            {visibleDeals.map((deal) => (
              <tr key={deal.id} className="hover:bg-gray-light/30 transition cursor-pointer">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-support-light border border-brand-support-light flex items-center justify-center">
                      <span className="text-brand-main text-xs font-bold">
                        {deal.dealname.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-main">{deal.dealname}</div>
                      {deal.companyName && (
                        <div className="text-xs text-gray-secondary">{deal.companyName}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-lg bg-brand-support-light/50 text-brand-main border border-brand-support-light">
                    {stageLookup.get(deal.dealstage) || deal.dealstage}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="w-full bg-gray-light rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getStageColor(deal.hs_deal_stage_probability)}`}
                      style={{ width: `${(deal.hs_deal_stage_probability || 0) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-secondary mt-1 font-medium">
                    {getProbabilityLabel(deal.hs_deal_stage_probability)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-main">
                    {deal.amount ? formatCurrency(deal.amount) : '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-bold ${
                    (deal.hs_deal_stage_probability || 0) >= 0.5 ? 'text-brand-sub' : 'text-brand-gold'
                  }`}>
                    {getProbabilityLabel(deal.hs_deal_stage_probability)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-main font-medium">
                  {deal.createdate ? new Date(deal.createdate).toLocaleDateString('ja-JP') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-main font-medium">
                  {deal.closedate ? new Date(deal.closedate).toLocaleDateString('ja-JP') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <a
                    href={`https://app.hubspot.com/contacts/21080726/record/0-3/${deal.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-sub hover:text-brand-main"
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
        <div className="px-6 py-4 border-t border-gray-light text-center">
          <button
            onClick={() => setVisibleCount(prev => prev + 20)}
            className="px-4 py-2 bg-brand-main hover:bg-brand-support text-white rounded-lg font-medium transition shadow-md hover:shadow-lg inline-flex items-center gap-2"
          >
            さらに読み込む ({sortedDeals.length - visibleCount}件)
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
