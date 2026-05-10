import React from 'react';
import { RiCalendarCheckLine, RiTimeLine, RiInformationLine } from 'react-icons/ri';

interface AvailabilitySummaryCardProps {
  availableToday: boolean;
  nextBlockedDate: string | null;
  loading?: boolean;
}

const AvailabilitySummaryCard: React.FC<AvailabilitySummaryCardProps> = ({
  availableToday,
  nextBlockedDate,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="provider-chart-card animate-pulse">
        <div className="w-1/2 h-5 bg-slate-100 rounded mb-5"></div>
        <div className="space-y-5">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
            <div className="flex-1 space-y-1.5">
              <div className="w-1/3 h-2.5 bg-slate-50 rounded"></div>
              <div className="w-1/2 h-4 bg-slate-100 rounded"></div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
            <div className="flex-1 space-y-1.5">
              <div className="w-1/3 h-2.5 bg-slate-50 rounded"></div>
              <div className="w-1/2 h-4 bg-slate-100 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="provider-chart-card">
      <div className="pdash-card-header !px-0 !py-0 !bg-transparent border-none mb-6">
        <div>
          <h3 className="pdash-card-title">Work Schedule</h3>
          <p className="pdash-card-subtitle">Live availability</p>
        </div>
        <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
          <RiCalendarCheckLine size={18} />
        </div>
      </div>

      <div className="space-y-6 flex-1 flex flex-col">
        <div className="flex items-center gap-3.5">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0 ${availableToday ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-rose-500 text-white shadow-rose-200'}`}>
            <RiTimeLine size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status Today</p>
            <p className={`text-base font-extrabold ${availableToday ? 'text-emerald-600' : 'text-rose-600'}`}>
              {availableToday ? 'Open for Jobs' : 'Offline'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100 flex-shrink-0">
            <RiCalendarCheckLine size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Upcoming Leave</p>
            <p className="text-base font-bold text-slate-800">
              {nextBlockedDate ? new Date(nextBlockedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No leave planned'}
            </p>
          </div>
        </div>

        <div className="mt-auto p-3.5 bg-blue-50/50 border border-blue-100/50 rounded-2xl flex gap-3">
          <RiInformationLine className="text-blue-500 flex-shrink-0 mt-0.5" size={15} />
          <p className="text-[11px] text-blue-700 leading-relaxed font-semibold">
            Providers with accurate schedules receive 30% more direct invitations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AvailabilitySummaryCard;
