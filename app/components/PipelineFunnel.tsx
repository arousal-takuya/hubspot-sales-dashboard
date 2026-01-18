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

// ブランドカラーに合わせたステージカラー
const STAGE_COLORS = [
  '#00146E', // brand-main
  '#0F2356', // brand-support
  '#01B3EF', // brand-sub
  '#C6AF80', // brand-gold
  '#7F7F7F', // gray-secondary
  '#B2B2B2', // gray-line
  '#ED2F4F', // brand-accent
];

// CustomTooltipをコンポーネント外部に移動してReact Error #310を回避
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-line rounded-xl p-3 shadow-lg">
        <p className="text-gray-main font-semibold mb-1">{payload[0].payload.stage}</p>
        <p className="text-gray-main text-sm">金額: {formatCurrency(payload[0].value)}</p>
        <p className="text-gray-secondary text-xs mt-1">件数: {payload[0].payload.count}件</p>
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
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-line">
      <h3 className="text-lg font-bold text-gray-main mb-4">パイプラインファネル</h3>
      <div ref={containerRef} style={{ width: '100%', height: 400 }}>
        {dimensions.width > 0 && (
          <BarChart
            data={data}
            layout="vertical"
            width={dimensions.width}
            height={dimensions.height}
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
            <XAxis
              type="number"
              stroke="#7F7F7F"
              tickFormatter={(value) => formatCurrency(value)}
            />
            <YAxis
              dataKey="stage"
              type="category"
              stroke="#7F7F7F"
              width={90}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F5F5F5' }} />
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
          <span className="text-gray-secondary font-medium">ステージ別件数</span>
        </div>
        {data.map((stage, index) => (
          <div key={index} className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: STAGE_COLORS[index % STAGE_COLORS.length] }}
            />
            <span className="text-gray-main font-medium">{stage.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
