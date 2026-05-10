import React, { useEffect, useState } from 'react';
import { 
    RiUserLine, 
    RiShieldUserLine, 
    RiBriefcaseLine, 
    RiCheckboxCircleLine, 
    RiTimeLine, 
    RiMoneyDollarCircleLine, 
    RiFlagLine,
    RiExchangeLine,
    RiNotification3Line,
    RiSettings4Line
} from 'react-icons/ri';
import { adminDashboardService, type DashboardOverview, type RecentActivity, type ChartData } from '../services/adminDashboard.service';
import DashboardStatCard from '../components/dashboard/DashboardStatCard';
import DashboardChartCard from '../components/dashboard/DashboardChartCard';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import QuickActionPanel from '../components/dashboard/QuickActionPanel';
import RevenueChart from '../components/dashboard/RevenueChart';
import JobStatusChart from '../components/dashboard/JobStatusChart';
import { toast } from 'react-toastify';

const AdminDashboardPage: React.FC = () => {
    const [overview, setOverview] = useState<DashboardOverview | null>(null);
    const [activities, setActivities] = useState<RecentActivity[]>([]);
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [overviewRes, activityRes, chartRes] = await Promise.all([
                    adminDashboardService.getOverview(),
                    adminDashboardService.getRecentActivity(),
                    adminDashboardService.getChartData()
                ]);

                if (overviewRes.success) setOverview(overviewRes.data);
                if (activityRes.success) setActivities(activityRes.data);
                if (chartRes.success) setChartData(chartRes.data);
            } catch (error) {
                console.error("Dashboard data fetch error:", error);
                toast.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 lg:p-8">
            <div className="max-w-[1600px] mx-auto">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <div className="text-2xl font-black text-slate-800 tracking-tight mb-1">System Overview</div>
                        <p className="text-slate-500 text-sm font-medium">Welcome back, Admin. Here's what's happening today.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-100 transition-all">
                            <RiNotification3Line size={20} />
                        </button>
                        <button className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-100 transition-all">
                            <RiSettings4Line size={20} />
                        </button>
                        <div className="h-10 w-[1px] bg-slate-200 mx-1 hidden md:block" />
                        <div className="flex items-center gap-3 bg-white pl-3 pr-4 py-1.5 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs">A</div>
                            <div className="hidden sm:block">
                                <p className="text-xs font-black text-slate-800 leading-none mb-1">Admin</p>
                                <p className="text-[10px] font-bold text-slate-400 leading-none">Super Admin</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Stats Grid */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                    <DashboardStatCard 
                        title="Total Users" 
                        value={overview?.totalUsers ?? 0} 
                        icon={RiUserLine} 
                        color="blue"
                        loading={loading}
                    />
                    <DashboardStatCard 
                        title="Total Providers" 
                        value={overview?.totalProviders ?? 0} 
                        icon={RiShieldUserLine} 
                        color="purple"
                        loading={loading}
                    />
                    <DashboardStatCard 
                        title="Active Jobs" 
                        value={overview?.activeJobs ?? 0} 
                        icon={RiBriefcaseLine} 
                        color="orange"
                        loading={loading}
                    />
                    <DashboardStatCard 
                        title="Platform Earnings" 
                        value={`₹${(overview?.totalPlatformEarnings ?? 0).toLocaleString()}`} 
                        icon={RiMoneyDollarCircleLine} 
                        color="green"
                        loading={loading}
                    />
                </section>

                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                    <DashboardStatCard 
                        title="Completed Jobs" 
                        value={overview?.completedJobs ?? 0} 
                        icon={RiCheckboxCircleLine} 
                        color="indigo"
                        loading={loading}
                    />
                    <DashboardStatCard 
                        title="Pending Approvals" 
                        value={overview?.pendingProviderApprovals ?? 0} 
                        icon={RiTimeLine} 
                        color="rose"
                        loading={loading}
                    />
                    <DashboardStatCard 
                        title="Active Reports" 
                        value={overview?.pendingReports ?? 0} 
                        icon={RiFlagLine} 
                        color="red"
                        loading={loading}
                    />
                    <DashboardStatCard 
                        title="Total Transactions" 
                        value={overview?.totalTransactions ?? 0} 
                        icon={RiExchangeLine} 
                        color="blue"
                        loading={loading}
                    />
                </section>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                    {/* Charts Column */}
                    <div className="lg:col-span-8 space-y-6 lg:space-y-8 min-w-0">
                        <DashboardChartCard 
                            title="Monthly Revenue" 
                            subtitle="Platform earnings from fees over time"
                            loading={loading}
                        >
                            {chartData && <RevenueChart data={chartData.monthlyRevenue} />}
                        </DashboardChartCard>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DashboardChartCard 
                                title="Job Distribution" 
                                subtitle="Current status of all jobs"
                                loading={loading}
                            >
                                {chartData && <JobStatusChart data={chartData.jobStatusDistribution} />}
                            </DashboardChartCard>
                            
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <div className="text-lg font-bold text-slate-800 mb-6">Quick Actions</div>
                                <QuickActionPanel />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="lg:col-span-4 space-y-6 lg:space-y-8">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-full">
                            <div className="flex items-center justify-between mb-8">
                                <div className="text-lg font-bold text-slate-800">Recent Activity</div>
                                <button className="text-xs font-bold text-blue-600 hover:underline">View All</button>
                            </div>
                            <ActivityFeed activities={activities} loading={loading} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
