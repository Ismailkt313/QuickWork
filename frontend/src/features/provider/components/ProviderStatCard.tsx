import React from 'react';
import type { IconType } from 'react-icons';

interface ProviderStatCardProps {
  title: string;
  value: string | number;
  icon: IconType;
  colorClass: string;
  trend?: {
    value: string;
    isUp: boolean;
  };
  loading?: boolean;
}

const ProviderStatCard: React.FC<ProviderStatCardProps> = ({
  title,
  value,
  icon: Icon,
  colorClass,
  trend,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="provider-stat-card animate-pulse">
        <div className="flex justify-between items-start mb-3">
          <div className="w-9 h-9 bg-slate-100 rounded-xl"></div>
          <div className="w-12 h-5 bg-slate-50 rounded-lg"></div>
        </div>
        <div className="w-20 h-6 bg-slate-100 rounded-lg mb-1.5"></div>
        <div className="w-16 h-3.5 bg-slate-50 rounded-md"></div>
      </div>
    );
  }

  // Derive soft background + text color from the colorClass (e.g. "bg-blue-600" → "bg-blue-50", "text-blue-600")
  const baseColor = colorClass.replace('bg-', '').replace(/-([\d]+)$/, '');
  const iconBgClass = `bg-${baseColor}-50`;
  const iconTextClass = `text-${baseColor}-600`;

  return (
    <div className="provider-stat-card group">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBgClass} border border-slate-100 group-hover:scale-105 transition-transform duration-300`}>
          <Icon size={20} className={iconTextClass} />
        </div>
        {trend && trend.value && (
          <div className={`flex items-center gap-0.5 text-[10px] font-bold px-2 py-1 rounded-lg ${trend.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            <span>{trend.isUp ? '↑' : '↓'}</span>
            <span>{trend.value}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl font-extrabold text-slate-900 leading-none tracking-tight">{value}</h3>
      </div>
    </div>
  );
};

export default ProviderStatCard;
