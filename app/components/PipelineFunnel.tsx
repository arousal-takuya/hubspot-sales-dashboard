'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
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

// CustomTooltipをコンポーネント外部に移動してReact Error #310を回避
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

// ResponsiveContainerの代わりにuseRefとResizeObserverを使用
// React 19 + recharts 2.x の互換性問題を回避
export default function PipelineFunnel({ data }: PipelineFunnelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 400 });

  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const { width } = containerRef.current.getBoundingClientRect();
      setDimensions({ width: width || 600, height: 400 });
    }
  }, []);

  useEffect(() => {
    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [updateDimensions]);

  return (
    <div className="glass-card rounded-2xl p-6 shadow-md">
      <h3 className="text-lg font-bold text-slate-900 mb-4">パイプラインファネル</h3>
      <div ref={containerRef} style={{ width: '100%', height: 400 }}>
        {dimensions.width > 0 && (
          <BarChart
            data={data}
            layout="vertical"
            width={dimensions.width}
            height={dimensions.height}
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
        )}
      </div>
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
