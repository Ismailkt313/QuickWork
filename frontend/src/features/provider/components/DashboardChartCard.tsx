import React from 'react';
import { RiBarChartBoxLine } from 'react-icons/ri';

interface DashboardChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  loading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
}

const DashboardChartCard: React.FC<DashboardChartCardProps> = ({
  title,
  subtitle,
  children,
  loading = false,
  isEmpty = false,
  emptyMessage = "No data available for this period"
}) => {
  return (
    <div className="provider-chart-card">
      <div className="mb-5 flex justify-between items-start">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
          {subtitle && <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="flex-1 min-h-0 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-[1px] z-20 rounded-xl">
            <div className="flex flex-col items-center gap-2.5">
              <div className="w-7 h-7 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Updating</p>
            </div>
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300 mb-3">
              <RiBarChartBoxLine size={20} />
            </div>
            <p className="text-slate-400 text-xs font-medium text-center">{emptyMessage}</p>
          </div>
        ) : null}
        <div className={`h-full w-full ${isEmpty ? 'sr-only' : 'visible'}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardChartCard;
