import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  icon?: 'up' | 'down' | 'alert' | 'check';
}

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  variant = 'default',
  icon,
}: MetricCardProps) {
  const variantStyles = {
    default: 'bg-white border-blue-100',
    success: 'bg-gradient-to-br from-green-50 to-white border-green-200',
    warning: 'bg-gradient-to-br from-yellow-50 to-white border-yellow-200',
    danger: 'bg-gradient-to-br from-red-50 to-white border-red-200',
  };

  const iconComponents = {
    up: <TrendingUp className="w-5 h-5 text-green-600" />,
    down: <TrendingDown className="w-5 h-5 text-red-600" />,
    alert: <AlertCircle className="w-5 h-5 text-red-600" />,
    check: <CheckCircle className="w-5 h-5 text-green-600" />,
  };

  return (
    <div
      className={`rounded-2xl border-2 p-6 ${variantStyles[variant]} shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-600 mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900 mb-1">{value}</h3>
          {subtitle && (
            <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="ml-4 p-2 bg-white/50 rounded-lg">
            {iconComponents[icon]}
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-1">
          {trend >= 0 ? (
            <TrendingUp className="w-4 h-4 text-green-600" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-600" />
          )}
          <span
            className={`text-sm font-bold ${
              trend >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
          </span>
          <span className="text-xs text-slate-500 ml-1">vs 前月</span>
        </div>
      )}
    </div>
  );
}
