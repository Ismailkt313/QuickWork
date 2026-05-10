import React from 'react';
import { RiBriefcaseLine, RiStarFill, RiNotification3Line } from 'react-icons/ri';

interface ActivityItem {
  id: string;
  type: 'assignment' | 'review' | 'notification' | 'payment';
  title: string;
  subtitle: string;
  time: string;
  status?: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  loading?: boolean;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, loading = false }) => {
  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex-shrink-0"></div>
            <div className="flex-1 space-y-1.5">
              <div className="w-3/5 h-3.5 bg-slate-100 rounded"></div>
              <div className="w-2/5 h-2.5 bg-slate-50 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 mb-3">
          <RiNotification3Line size={24} />
        </div>
        <h4 className="text-slate-700 font-bold text-sm mb-0.5">No activity yet</h4>
        <p className="text-slate-400 text-[11px] font-medium leading-relaxed">Your recent job updates will appear here</p>
      </div>
    );
  }

  const iconConfig: Record<string, { bg: string; text: string; Icon: React.ElementType }> = {
    assignment: { bg: 'bg-blue-50', text: 'text-blue-600', Icon: RiBriefcaseLine },
    review: { bg: 'bg-amber-50', text: 'text-amber-500', Icon: RiStarFill },
    notification: { bg: 'bg-emerald-50', text: 'text-emerald-600', Icon: RiNotification3Line },
    payment: { bg: 'bg-emerald-50', text: 'text-emerald-600', Icon: RiNotification3Line },
  };

  return (
    <div className="divide-y divide-slate-50">
      {activities.map((item) => {
        const { bg, text, Icon } = iconConfig[item.type] || iconConfig.notification;
        return (
          <div key={item.id} className="px-4 py-3 flex gap-3 hover:bg-slate-50/60 transition-colors group">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${bg} ${text}`}>
              <Icon size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex justify-between items-start gap-2">
                <h4 className="text-[13px] font-semibold text-slate-800 truncate leading-snug">{item.title}</h4>
                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5 whitespace-nowrap flex-shrink-0">{item.time}</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">{item.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityFeed;
