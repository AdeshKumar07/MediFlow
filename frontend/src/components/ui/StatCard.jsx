import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * StatCard — premium dashboard metric card
 *
 * Props:
 *   title       {string}
 *   value       {string|number}
 *   subtitle    {string}       optional secondary line
 *   icon        {ReactNode}    lucide icon component instance
 *   iconBg      {string}       tailwind class for icon bg — defaults to brand
 *   trend       {number}       optional % change (positive = up, negative = down)
 *   accentColor {string}       hex or tw color variable for glow
 *   formatter   {function}     optional value formatter
 */
const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  iconBg = 'bg-indigo-500/15',
  iconColor = 'text-indigo-400',
  trend,
  formatter,
  delay = 0,
}) => {
  const displayValue = formatter ? formatter(value) : value;

  return (
    <div
      className="group relative glass rounded-2xl p-6 hover:border-brand-500/20
                 hover:shadow-md transition-card overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Subtle glow in top-right corner on hover */}
      <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-brand-500/5 blur-2xl
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} ${iconColor} flex-shrink-0`}>
          {icon}
        </div>
      </div>

      <div className="mt-4">
        <p className="font-outfit text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
          {displayValue ?? '—'}
        </p>
        {subtitle && (
          <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{subtitle}</p>
        )}
      </div>

      {trend !== undefined && trend !== null && (
        <div className="mt-3 flex items-center gap-1.5">
          {trend >= 0 ? (
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-red-600" />
          )}
          <span className={`text-xs font-semibold ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
          <span className="text-xs text-slate-400">vs last period</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
