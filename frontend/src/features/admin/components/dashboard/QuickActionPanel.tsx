import React from 'react';
import { Link } from 'react-router-dom';
import { RiCheckDoubleLine, RiFlagLine, RiUserSettingsLine, RiMoneyDollarBoxLine, RiTimerLine, RiBriefcaseLine } from 'react-icons/ri';

const ACTIONS = [
    { label: 'Approve Providers', icon: RiCheckDoubleLine, href: '/admin/providers/pending', color: 'bg-emerald-50 text-emerald-600' },
    { label: 'View Reports', icon: RiFlagLine, href: '/admin/reports', color: 'bg-rose-50 text-rose-600' },
    { label: 'Manage Users', icon: RiUserSettingsLine, href: '/admin/users', color: 'bg-blue-50 text-blue-600' },
    { label: 'Finance Overview', icon: RiMoneyDollarBoxLine, href: '/admin/finance', color: 'bg-amber-50 text-amber-600' },
    { label: 'Withdrawals', icon: RiTimerLine, href: '/admin/finance/withdrawals', color: 'bg-purple-50 text-purple-600' },
    { label: 'Active Jobs', icon: RiBriefcaseLine, href: '/admin/jobs', color: 'bg-indigo-50 text-indigo-600' },
];

const QuickActionPanel: React.FC = () => {
    return (
        <div className="grid grid-cols-2 gap-3">
            {ACTIONS.map((action, i) => (
                <Link
                    key={i}
                    to={action.href}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-md hover:shadow-slate-200/50 transition-all duration-300 text-center"
                >
                    <div className={`p-3 rounded-xl mb-3 ${action.color}`}>
                        <action.icon size={20} />
                    </div>
                    <span className="text-xs font-bold text-slate-700">{action.label}</span>
                </Link>
            ))}
        </div>
    );
};

export default QuickActionPanel;
