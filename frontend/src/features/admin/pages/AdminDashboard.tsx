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
import { adminDashboardService } from '../services/adminDashboard.service';
import type { DashboardOverview, RecentActivity, ChartData } from '../services/adminDashboard.service';
import DashboardStatCard from '../components/dashboard/DashboardStatCard';
import DashboardChartCard from '../components/dashboard/DashboardChartCard';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import QuickActionPanel from '../components/dashboard/QuickActionPanel';
import RevenueChart from '../components/dashboard/RevenueChart';
import JobStatusChart from '../components/dashboard/JobStatusChart';
import GrowthChart from '../components/dashboard/GrowthChart';
import AdminDataTable from '../components/dashboard/AdminDataTable';
import { toast } from 'react-toastify';

const AdminDashboard: React.FC = () => {
    const [overview, setOverview] = useState<DashboardOverview | null>(null);
    const [activities, setActivities] = useState<RecentActivity[]>([]);
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [loading, setLoading] = useState(true);

    const loadDashboardData = async () => {
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

    useEffect(() => {
        loadDashboardData();
    }, []);

    return (
        <div>
            <div className="admin-breadcrumb">
                Admin <span className="separator">›</span> <span>Dashboard</span>
            </div>
            {/* Header */}
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">System Overview</h1>
                    <p className="admin-page-subtitle">Welcome back, Admin. Here's what's happening today.</p>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center gap-2 me-3">
                        <button className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-center text-secondary border-0 shadow-none hover-blue">
                            <RiNotification3Line size={20} />
                        </button>
                        <button className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-center text-secondary border-0 shadow-none hover-blue">
                            <RiSettings4Line size={20} />
                        </button>
                    </div>
                    <button 
                        className="btn btn-invite"
                        onClick={loadDashboardData}
                    >
                        <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`}></i>
                        Refresh Dashboard
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6" style={{ marginBottom: "1.5rem" }}>
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6" style={{ marginBottom: "2rem" }}>
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
            </div>

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

                        <DashboardChartCard 
                            title="User & Provider Growth" 
                            subtitle="New registrations and provider applications"
                            loading={loading}
                        >
                            {chartData && <GrowthChart data={chartData.userProviderGrowth} />}
                        </DashboardChartCard>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DashboardChartCard 
                                title="Job Distribution" 
                                subtitle="Current status of all jobs"
                                loading={loading}
                            >
                                {chartData && <JobStatusChart data={chartData.jobStatusDistribution} />}
                            </DashboardChartCard>
                            
                            <div className="admin-table-card" style={{ padding: "1.5rem" }}>
                                <div style={{ marginBottom: "1.5rem", fontSize: "1.125rem", fontWeight: 700, color: "#1e293b" }}>Quick Actions</div>
                                <QuickActionPanel />
                            </div>
                        </div>

                        {/* Recent Transactions Table */}
                        <AdminDataTable 
                            title="Operational Records"
                            data={activities.filter(a => a.type === 'payment' || a.type === 'report').slice(0, 5)}
                            columns={[
                                { header: 'Action', render: (a: any) => <span className="font-bold text-slate-800">{a.title}</span> },
                                { header: 'Description', render: (a: any) => <span className="text-slate-500">{a.description}</span> },
                                { header: 'User', render: (a: any) => <span className="text-xs font-medium bg-slate-100 px-2 py-1 rounded">{a.user?.name || 'System'}</span> },
                                { header: 'Time', render: (a: any) => <span className="text-xs text-slate-400">{new Date(a.timestamp).toLocaleDateString()}</span> }
                            ]}
                            loading={loading}
                        />
                    </div>

                    {/* Sidebar Column */}
                    <div className="lg:col-span-4 space-y-6 lg:space-y-8">
                        <div className="admin-table-card" style={{ padding: "1.5rem", height: "100%" }}>
                            <div style={{ marginBottom: "1.5rem" }}>
                                <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "#1e293b" }}>Recent Activity</div>
                            </div>
                            <ActivityFeed activities={activities} loading={loading} />
                        </div>
                    </div>
                </div>
        </div>
    );
};

export default AdminDashboard;
