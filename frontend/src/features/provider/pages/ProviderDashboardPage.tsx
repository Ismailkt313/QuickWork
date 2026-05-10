import React, { useEffect, useState } from "react";
import {
  RiMoneyDollarCircleLine,
  RiWallet3Line,
  RiBriefcaseLine,
  RiCheckboxCircleLine,
  RiStarLine,
  RiRefreshLine,
  RiSettings4Line,
  RiArrowRightLine,
  RiHistoryLine,
  RiStackLine,
  RiFlashlightLine,
  RiCalendarCheckLine,
  RiSearchLine,
  RiMessage3Line
} from "react-icons/ri";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import ProviderStatCard from "../components/ProviderStatCard";
import DashboardChartCard from "../components/DashboardChartCard";
import ActivityFeed from "../components/ActivityFeed";
import type { ActivityItem } from "../components/ActivityFeed";
import AvailabilitySummaryCard from "../components/AvailabilitySummaryCard";
import { providerDashboardService } from "../services/providerDashboard.service";
import { Link } from "react-router-dom";
import { safeCurrency, safePercentage, safeNumber, safeDecimal, clampedNumber } from "../utils/dashboardUtils";
import "./style/DashboardPage.css";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface DashboardOverview {
  totalEarnings: number;
  walletBalance: number;
  activeJobs: number;
  totalAssignments: number;
}

interface DashboardActivity {
  recentAssignments: {
    _id: string;
    jobId?: { title: string };
    workStatus?: string;
    createdAt: string;
  }[];
  recentReviews: {
    _id: string;
    reviewerId?: { name: string };
    rating: number;
    comment?: string;
    createdAt: string;
  }[];
}

interface DashboardCharts {
  monthlyEarnings: { month: string; amount: number }[];
  jobStatusDistribution: { status: string; count: number }[];
}

interface DashboardPerformance {
  completionRate: number;
  acceptanceRate: number;
  totalReviews: number;
  averageRating: number;
}

interface DashboardAvailability {
  availableToday: boolean;
  nextBlockedDate: string | null;
}

const ProviderDashboardPage: React.FC = () => {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [activity, setActivity] = useState<DashboardActivity | null>(null);
  const [charts, setCharts] = useState<DashboardCharts | null>(null);
  const [performance, setPerformance] = useState<DashboardPerformance | null>(null);
  const [availability, setAvailability] = useState<DashboardAvailability | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, act, ch, perf, avail] = await Promise.all([
        providerDashboardService.getOverview(),
        providerDashboardService.getActivity(),
        providerDashboardService.getCharts(),
        providerDashboardService.getPerformance(),
        providerDashboardService.getAvailabilitySummary()
      ]);

      setOverview(ov.data);
      setActivity(act.data);
      setCharts(ch.data);
      setPerformance(perf.data);
      setAvailability(avail.data);
    } catch (err: unknown) {
      console.error("Error fetching dashboard data:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load dashboard data";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatActivity = () => {
    if (!activity) return [];
    const items: ActivityItem[] = [];

    activity.recentAssignments?.forEach((a) => items.push({
      id: a._id,
      type: 'assignment',
      title: a.jobId?.title || 'Job Assignment',
      subtitle: `Status: ${a.workStatus || 'Unknown'}`,
      time: new Date(a.createdAt).toLocaleDateString()
    }));

    activity.recentReviews?.forEach((r) => items.push({
      id: r._id,
      type: 'review',
      title: `Review from ${r.reviewerId?.name || 'Client'}`,
      subtitle: `${safeNumber(r.rating)} Stars${r.comment ? ` — ${r.comment.slice(0, 40)}` : ''}`,
      time: new Date(r.createdAt).toLocaleDateString()
    }));

    return items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);
  };

  return (
    <div className="dashboard-shell">
      <div className="dashboard-container">
        {/* ─── Premium Hero Section ─────────────────────────── */}
        <div className="pdash-hero">
          <div className="pdash-header">
            <div>
              <div className="pdash-badge-live mb-2">Operational</div>
              <h1 className="pdash-title">
                Workspace
              </h1>
              <p className="pdash-subtitle">Track your real-time performance and manage your service assignments effectively.</p>
            </div>
            <div className="pdash-header-actions">
              <button
                onClick={fetchDashboardData}
                className="pdash-btn-icon"
                title="Refresh Data"
                aria-label="Refresh dashboard data"
              >
                <RiRefreshLine size={18} className={loading ? 'animate-spin' : ''} />
              </button>
              <Link to="/provider/profile" className="pdash-btn-primary">
                <RiSettings4Line size={18} />
                <span>Settings</span>
              </Link>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="pdash-quick-actions">
            <Link to="/provider/available-jobs" className="pdash-qa-item">
              <div className="pdash-qa-icon"><RiSearchLine /></div>
              <span className="pdash-qa-label">Find Jobs</span>
            </Link>
            <Link to="/provider/my-jobs" className="pdash-qa-item">
              <div className="pdash-qa-icon"><RiCalendarCheckLine /></div>
              <span className="pdash-qa-label">Schedule</span>
            </Link>
            <Link to="/provider/messages" className="pdash-qa-item">
              <div className="pdash-qa-icon"><RiMessage3Line /></div>
              <span className="pdash-qa-label">Chats</span>
            </Link>
            <Link to="/provider/wallet" className="pdash-qa-item">
              <div className="pdash-qa-icon"><RiWallet3Line /></div>
              <span className="pdash-qa-label">Earnings</span>
            </Link>
          </div>
        </div>

        {/* ─── Error Banner ─────────────────────────────────── */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-sm flex-shrink-0">!</div>
            <div className="flex-1">
              <p className="text-sm font-bold text-rose-900">{error}</p>
              <p className="text-xs text-rose-700 opacity-80">Please check your connection and retry.</p>
            </div>
            <button onClick={fetchDashboardData} className="px-4 py-2 bg-rose-100 text-rose-700 text-xs font-extrabold rounded-lg hover:bg-rose-200 transition-colors">
              Retry
            </button>
          </div>
        )}

        {/* ─── Stat Cards Grid ──────────────────────────────── */}
        <div className="pdash-stats-grid">
          <ProviderStatCard
            title="Total Revenue"
            value={safeCurrency(overview?.totalEarnings)}
            icon={RiMoneyDollarCircleLine}
            colorClass="bg-blue-600"
            loading={loading}
          />
          <ProviderStatCard
            title="Wallet Balance"
            value={safeCurrency(overview?.walletBalance)}
            icon={RiWallet3Line}
            colorClass="bg-emerald-600"
            loading={loading}
          />
          <ProviderStatCard
            title="Active Jobs"
            value={safeNumber(overview?.activeJobs)}
            icon={RiBriefcaseLine}
            colorClass="bg-amber-600"
            loading={loading}
          />
          <ProviderStatCard
            title="Assignments"
            value={safeNumber(overview?.totalAssignments)}
            icon={RiStackLine}
            colorClass="bg-indigo-600"
            loading={loading}
          />
        </div>

        {/* ─── Charts + Schedule Row ───────────────────────── */}
        <div className="pdash-row-2col">
          <div className="pdash-col-main">
            <DashboardChartCard
              title="Revenue Analytics"
              subtitle="Monthly earning trends"
              loading={loading}
              isEmpty={!charts?.monthlyEarnings || charts.monthlyEarnings.length === 0}
              emptyMessage="Start completing jobs to see your revenue trends"
            >
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={charts?.monthlyEarnings || []}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                    dx={-8}
                    tickFormatter={(value) => `₹${safeNumber(value)}`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '14px',
                      border: '1px solid rgba(15, 23, 42, 0.05)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
                      padding: '12px 16px',
                      fontSize: '12px'
                    }}
                    formatter={(value: any) => [`₹${safeNumber(value).toLocaleString()}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            </DashboardChartCard>
          </div>
          <div className="pdash-col-side">
            <AvailabilitySummaryCard
              availableToday={availability?.availableToday ?? false}
              nextBlockedDate={availability?.nextBlockedDate ?? null}
              loading={loading}
            />
          </div>
        </div>

        {/* ─── Bottom Row: Activity + Charts + Performance ── */}
        <div className="pdash-row-3col">
          {/* Activity Feed */}
          <div className="pdash-activity-card">
            <div className="pdash-card-header">
              <div>
                <h3 className="pdash-card-title">Recent Activity</h3>
                <p className="pdash-card-subtitle">Real-time updates</p>
              </div>
              <RiHistoryLine className="text-slate-300" size={18} />
            </div>
            <div className="pdash-activity-scroll">
              <ActivityFeed activities={formatActivity()} loading={loading} />
            </div>
            <div className="pdash-card-footer">
              <Link to="/provider/my-jobs" className="pdash-link-action">
                <span>View All Assignments</span>
                <RiArrowRightLine size={13} />
              </Link>
            </div>
          </div>

          {/* Task Portfolio Donut */}
          <DashboardChartCard
            title="Portfolio"
            subtitle="Job distribution"
            loading={loading}
            isEmpty={!charts?.jobStatusDistribution || charts.jobStatusDistribution.length === 0}
            emptyMessage="No portfolio data yet"
          >
            <div className="flex flex-col h-full justify-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={charts?.jobStatusDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={72}
                    paddingAngle={6}
                    dataKey="count"
                    stroke="none"
                  >
                    {(charts?.jobStatusDistribution || []).map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid rgba(15, 23, 42, 0.05)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.05)',
                      fontSize: '11px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {(charts?.jobStatusDistribution || []).length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {(charts?.jobStatusDistribution || []).map((entry: any, index: number) => (
                    <div key={entry.status || index} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/50">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight truncate">{entry.status || 'Unknown'}</span>
                        <span className="text-xs font-extrabold text-slate-800">{safeNumber(entry.count)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DashboardChartCard>

          {/* Performance Score */}
          <div className="provider-chart-card">
            <div className="pdash-card-header !px-0 !py-0 !bg-transparent border-none mb-6">
              <div>
                <h3 className="pdash-card-title">Performance</h3>
                <p className="pdash-card-subtitle">Reliability metrics</p>
              </div>
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                <RiCheckboxCircleLine size={18} />
              </div>
            </div>

            {loading ? (
              <div className="space-y-6 animate-pulse">
                <div><div className="w-full h-2 bg-slate-100 rounded-full"></div></div>
                <div><div className="w-full h-2 bg-slate-100 rounded-full"></div></div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="h-20 bg-slate-50 rounded-2xl"></div>
                  <div className="h-20 bg-slate-50 rounded-2xl"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 flex-1 flex flex-col">
                {/* Completion Rate */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completion</span>
                    <span className="text-base font-extrabold text-slate-900">{safePercentage(performance?.completionRate)}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                      style={{ width: `${clampedNumber(performance?.completionRate)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Acceptance Rate */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Acceptance</span>
                    <span className="text-base font-extrabold text-slate-900">{safePercentage(performance?.acceptanceRate)}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                      style={{ width: `${clampedNumber(performance?.acceptanceRate)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Summary Mini-Cards */}
                <div className="grid grid-cols-2 gap-3 pt-2 mt-auto">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100/50">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Feedback</p>
                    <p className="text-sm font-extrabold text-slate-900">{safeNumber(performance?.totalReviews)} reviews</p>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100/50">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rating</p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-extrabold text-slate-900">{safeDecimal(performance?.averageRating)}</p>
                      <RiStarLine className="text-amber-500" size={14} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboardPage;
