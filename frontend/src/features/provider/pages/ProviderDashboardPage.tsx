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
  RiStackLine
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
        {/* ─── Page Header ──────────────────────────────────── */}
        <div className="pdash-header">
          <div>
            <h1 className="pdash-title">
              Operational Workspace
              <span className="pdash-badge-live">Live</span>
            </h1>
            <p className="pdash-subtitle">Real-time performance tracking and assignment management.</p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchDashboardData}
              className="pdash-btn-icon"
              title="Refresh Data"
              aria-label="Refresh dashboard data"
            >
              <RiRefreshLine size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <Link to="/provider/profile" className="pdash-btn-primary">
              <RiSettings4Line size={16} />
              <span>Settings</span>
            </Link>
          </div>
        </div>

        {/* ─── Error Banner ─────────────────────────────────── */}
        {error && (
          <div className="mb-5 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center text-rose-500 flex-shrink-0">!</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-rose-800">{error}</p>
              <p className="text-xs text-rose-600 mt-0.5">Try refreshing or check your connection.</p>
            </div>
            <button onClick={fetchDashboardData} className="text-xs font-bold text-rose-600 hover:text-rose-700 uppercase tracking-wider">
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
            title="Total Assignments"
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
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
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
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      padding: '10px 14px',
                      fontSize: '12px'
                    }}
                    formatter={(value: any) => [`₹${safeNumber(value).toLocaleString()}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAmount)" />
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
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent Activity</h3>
                <p className="text-slate-400 text-[9px] font-semibold uppercase tracking-widest mt-0.5">Real-time updates</p>
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
            title="Task Portfolio"
            subtitle="Job status distribution"
            loading={loading}
            isEmpty={!charts?.jobStatusDistribution || charts.jobStatusDistribution.length === 0}
            emptyMessage="Complete jobs to see your portfolio breakdown"
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
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {(charts?.jobStatusDistribution || []).map((_entry: { status: string; count: number }, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {(charts?.jobStatusDistribution || []).length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {(charts?.jobStatusDistribution || []).map((entry: { status: string; count: number }, index: number) => (
                    <div key={entry.status || index} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide truncate">{entry.status || 'Unknown'}</span>
                        <span className="text-xs font-bold text-slate-700">{safeNumber(entry.count)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DashboardChartCard>

          {/* Performance Score */}
          <div className="provider-chart-card">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Performance Score</h3>
                <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mt-0.5">30-day reliability metrics</p>
              </div>
              <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-500">
                <RiCheckboxCircleLine size={16} />
              </div>
            </div>

            {loading ? (
              <div className="space-y-6 animate-pulse">
                <div><div className="w-full h-1.5 bg-slate-100 rounded-full"></div></div>
                <div><div className="w-full h-1.5 bg-slate-100 rounded-full"></div></div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="h-16 bg-slate-50 rounded-xl"></div>
                  <div className="h-16 bg-slate-50 rounded-xl"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-5 flex-1 flex flex-col">
                {/* Completion Rate */}
                <div>
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completion Rate</span>
                    <span className="text-base font-extrabold text-slate-800">{safePercentage(performance?.completionRate)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${clampedNumber(performance?.completionRate)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Acceptance Rate */}
                <div>
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Acceptance Rate</span>
                    <span className="text-base font-extrabold text-slate-800">{safePercentage(performance?.acceptanceRate)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${clampedNumber(performance?.acceptanceRate)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Summary Mini-Cards */}
                <div className="grid grid-cols-2 gap-3 pt-2 mt-auto">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Feedback</p>
                    <p className="text-sm font-extrabold text-slate-800">{safeNumber(performance?.totalReviews)} Reviews</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Star Rating</p>
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-extrabold text-slate-800">{safeDecimal(performance?.averageRating)}</p>
                      <RiStarLine className="text-amber-500" size={13} />
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
