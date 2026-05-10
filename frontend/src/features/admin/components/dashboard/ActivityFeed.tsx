import { RiUserAddLine, RiCheckDoubleLine, RiHandCoinLine, RiFlagLine, RiSpam2Line } from 'react-icons/ri';
import type { RecentActivity } from '../../services/adminDashboard.service';
import { formatDistanceToNow } from 'date-fns';

interface ActivityFeedProps {
    activities: RecentActivity[];
    loading?: boolean;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, loading = false }) => {
    const getIcon = (type: string) => {
        switch (type) {
            case 'registration': return <RiUserAddLine className="text-blue-600" />;
            case 'approval': return <RiCheckDoubleLine className="text-emerald-600" />;
            case 'payment': return <RiHandCoinLine className="text-amber-600" />;
            case 'report': return <RiFlagLine className="text-rose-600" />;
            case 'moderation': return <RiSpam2Line className="text-purple-600" />;
            default: return <RiUserAddLine />;
        }
    };

    const getIconBg = (type: string) => {
        switch (type) {
            case 'registration': return 'bg-blue-50';
            case 'approval': return 'bg-emerald-50';
            case 'payment': return 'bg-amber-50';
            case 'report': return 'bg-rose-50';
            case 'moderation': return 'bg-purple-50';
            default: return 'bg-slate-50';
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex gap-4 animate-pulse">
                        <div className="w-10 h-10 bg-slate-100 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-slate-100 rounded w-3/4" />
                            <div className="h-3 bg-slate-50 rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {activities.length === 0 ? (
                <p className="text-center text-slate-400 py-10">No recent activity</p>
            ) : (
                activities.map((activity) => (
                    <div key={activity.id} className="flex gap-4 group cursor-default">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getIconBg(activity.type)} transition-transform group-hover:scale-110`}>
                            {getIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-0.5">
                                <div className="text-sm font-bold text-slate-800 truncate">{activity.title}</div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-1">{activity.description}</p>
                            {activity.user && (
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-slate-100 overflow-hidden border border-white">
                                        {activity.user.avatar ? (
                                            <img src={activity.user.avatar} alt={activity.user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-400">
                                                {activity.user.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[11px] font-medium text-slate-600">{activity.user.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default ActivityFeed;
