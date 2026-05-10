import React from 'react';
import type { IconType } from 'react-icons';

interface DashboardStatCardProps {
    title: string;
    value: string | number;
    icon: IconType;
    color?: string;
    loading?: boolean;
}

const DashboardStatCard: React.FC<DashboardStatCardProps> = ({
    title,
    value,
    icon: Icon,
    color = 'blue',
    loading = false
}) => {
    if (loading) {
        return (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 animate-pulse">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl" />
                    <div className="w-16 h-6 bg-slate-50 rounded-lg" />
                </div>
                <div className="w-24 h-4 bg-slate-100 rounded mb-2" />
                <div className="w-16 h-8 bg-slate-200 rounded" />
            </div>
        );
    }

    return (
        <div className="admin-stat-card">
            <div className="admin-stat-label">
                {title}
            </div>
            <div className={`admin-stat-value ${color} d-flex align-items-center gap-2`}>
                <Icon size={24} />
                <span>{value}</span>
            </div>
        </div>
    );
};

export default DashboardStatCard;
