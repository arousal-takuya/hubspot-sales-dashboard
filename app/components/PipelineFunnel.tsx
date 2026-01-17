'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '@/app/lib/analytics';

interface PipelineFunnelProps {
  data: Array<{
    stage: string;
    amount: number;
    count: number;
  }>;
}

const STAGE_COLORS = [
  '#3b82f6', // blue
  '#06b6d4', // cyan
  '#10b981', // green
  '#84cc16', // lime
  '#eab308', // yellow
  '#f59e0b', // amber
  '#ef4444', // red
];

export default function PipelineFunnel({ data }: PipelineFunnelProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border-2 border-blue-200 rounded-xl p-3 shadow-xl">
          <p className="text-slate-900 font-semibold mb-1">{payload[0].payload.stage}</p>
          <p className="text-slate-700 text-sm">金額: {formatCurrency(payload[0].value)}</p>
          <p className="text-slate-600 text-xs mt-1">件数: {payload[0].payload.count}件</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card rounded-2xl p-6 shadow-md">
      <h3 className="text-lg font-bold text-slate-900 mb-4">パイプラインファネル</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
          <XAxis
            type="number"
            stroke="#64748b"
            tickFormatter={(value) => formatCurrency(value)}
          />
          <YAxis
            dataKey="stage"
            type="category"
            stroke="#64748b"
            width={90}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
          <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={STAGE_COLORS[index % STAGE_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-end gap-2 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <span className="text-slate-600 font-medium">ステージ別件数</span>
        </div>
        {data.map((stage, index) => (
          <div key={index} className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: STAGE_COLORS[index % STAGE_COLORS.length] }}
            />
            <span className="text-slate-700 font-medium">{stage.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
