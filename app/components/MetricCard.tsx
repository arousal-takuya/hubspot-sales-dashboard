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
    default: 'bg-white border-gray-line',
    success: 'bg-white border-brand-sub/30',
    warning: 'bg-white border-brand-gold/30',
    danger: 'bg-white border-brand-accent/30',
  };

  const iconComponents = {
    up: <TrendingUp className="w-5 h-5 text-brand-sub" />,
    down: <TrendingDown className="w-5 h-5 text-brand-accent" />,
    alert: <AlertCircle className="w-5 h-5 text-brand-accent" />,
    check: <CheckCircle className="w-5 h-5 text-brand-sub" />,
  };

  return (
    <div
      className={`rounded-2xl border p-6 ${variantStyles[variant]} shadow-sm hover:shadow-md transition-all duration-300`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-secondary mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-gray-main mb-1">{value}</h3>
          {subtitle && (
            <p className="text-xs text-gray-secondary font-medium">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="ml-4 p-2 bg-gray-light/50 rounded-lg">
            {iconComponents[icon]}
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-1">
          {trend >= 0 ? (
            <TrendingUp className="w-4 h-4 text-brand-sub" />
          ) : (
            <TrendingDown className="w-4 h-4 text-brand-accent" />
          )}
          <span
            className={`text-sm font-bold ${
              trend >= 0 ? 'text-brand-sub' : 'text-brand-accent'
            }`}
          >
            {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
          </span>
          <span className="text-xs text-gray-secondary ml-1">vs 前月</span>
        </div>
      )}
    </div>
  );
}
