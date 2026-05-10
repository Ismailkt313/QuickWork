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
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Work Schedule</h3>
          <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mt-0.5">Live Availability</p>
        </div>
        <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
          <RiCalendarCheckLine size={16} />
        </div>
      </div>

      <div className="space-y-5 flex-1 flex flex-col">
        <div className="flex items-center gap-3.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 ${availableToday ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
            <RiTimeLine size={20} />
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Status Today</p>
            <p className={`text-sm font-bold ${availableToday ? 'text-emerald-600' : 'text-rose-600'}`}>
              {availableToday ? 'Open for Jobs' : 'Offline'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100 flex-shrink-0">
            <RiCalendarCheckLine size={20} />
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Upcoming Leave</p>
            <p className="text-sm font-semibold text-slate-800">
              {nextBlockedDate ? new Date(nextBlockedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No leave planned'}
            </p>
          </div>
        </div>

        <div className="mt-auto p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex gap-2.5">
          <RiInformationLine className="text-blue-500 flex-shrink-0 mt-0.5" size={14} />
          <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
            Providers with accurate schedules receive 30% more direct invitations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AvailabilitySummaryCard;
