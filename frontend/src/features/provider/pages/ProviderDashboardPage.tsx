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
  RiCalendarCheckLine,
  RiSearchLine,
  RiMessage3Line,
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiFlashlightLine,
  RiAlertLine,
} from "react-icons/ri";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import ActivityFeed from "../components/ActivityFeed";
import type { ActivityItem } from "../components/ActivityFeed";
import AvailabilitySummaryCard from "../components/AvailabilitySummaryCard";
import { providerDashboardService } from "../services/providerDashboard.service";
import { Link } from "react-router-dom";
import { safeCurrency, safePercentage, safeNumber, safeDecimal, clampedNumber } from "../utils/dashboardUtils";
import "./style/DashboardPage.css";
import DashboardChartCard from "../components/DashboardChartCard";

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

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

/* ─── Skeleton block helper ──────────────────────────────────── */
const Skel = ({ w = "100%", h = 14, r = 8 }: { w?: string | number; h?: number; r?: number }) => (
  <div className="pd-skeleton" style={{ width: w, height: h, borderRadius: r }} />
);

/* ─── Stat Card ──────────────────────────────────────────────── */
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconClass: string;
  colorVariant: "blue" | "green" | "amber" | "indigo";
  trend?: { val: string; up: boolean };
  foot?: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, iconClass, colorVariant, trend, foot, loading }) => {
  if (loading) return (
    <div className={`pd-stat-card ${colorVariant}`}>
      <div className="pd-stat-top">
        <Skel w={40} h={40} r={10} />
        <Skel w={56} h={22} r={100} />
      </div>
      <div>
        <Skel w="55%" h={32} r={8} />
        <div style={{ marginTop: 6 }}><Skel w="40%" h={11} r={6} /></div>
      </div>
      <div style={{ paddingTop: 10, borderTop: "1px solid rgba(15,23,42,0.06)" }}>
        <Skel w="70%" h={11} r={6} />
      </div>
    </div>
  );

  return (
    <div className={`pd-stat-card ${colorVariant}`}>
      <div className="pd-stat-top">
        <div className={`pd-stat-icon ${iconClass}`}>{icon}</div>
        {trend && (
          <div className={`pd-stat-trend ${trend.up ? "up" : "down"}`}>
            {trend.up ? <RiArrowUpSLine size={13} /> : <RiArrowDownSLine size={13} />}
            {trend.val}
          </div>
        )}
        {!trend && <div className="pd-stat-trend neu">—</div>}
      </div>
      <div>
        <div className="pd-stat-value">{value}</div>
        <div className="pd-stat-label">{label}</div>
      </div>
      {foot && <div className="pd-stat-foot">{foot}</div>}
    </div>
  );
};

/* ─── Main Dashboard Page ────────────────────────────────────── */
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
      const msg = err instanceof Error ? err.message : "Failed to load dashboard";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

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

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="dashboard-shell">
      <div className="dashboard-container">

        {/* ─── Error Banner ─────────────────────────────────────── */}
        {error && (
          <div className="pd-error-banner" role="alert">
            <div style={{ width: 36, height: 36, borderRadius: 9, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", color: "#dc2626", flexShrink: 0 }}>
              <RiAlertLine size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#991b1b", margin: 0 }}>{error}</p>
              <p style={{ fontSize: 12, color: "#b91c1c", margin: "2px 0 0", opacity: 0.8 }}>Check your connection and try again.</p>
            </div>
            <button
              onClick={fetchDashboardData}
              style={{ padding: "7px 16px", background: "#fecaca", color: "#991b1b", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "pointer" }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ─── Command Header ───────────────────────────────────── */}
        <div className="pd-command">
          <div className="pd-command-top">
            <div className="pd-greeting-area">
              <div className="pd-status-chip">
                <RiFlashlightLine size={10} /> Operational
              </div>
              <div className="pd-greeting-title">{greeting}, let's get to work 👋</div>
              <div className="pd-greeting-sub">
                {loading
                  ? "Loading your workspace…"
                  : `You have ${safeNumber(overview?.activeJobs)} active job${safeNumber(overview?.activeJobs) !== 1 ? "s" : ""} and ${safeNumber(overview?.totalAssignments)} total assignments.`
                }
              </div>
            </div>
            <div className="pd-command-actions">
              <button
                onClick={fetchDashboardData}
                className="pd-btn-ghost"
                title="Refresh Data"
                aria-label="Refresh dashboard"
              >
                <RiRefreshLine size={17} className={loading ? "animate-spin" : ""} />
              </button>
              <Link to="/provider/profile" className="pd-btn-primary">
                <RiSettings4Line size={16} />
                Settings
              </Link>
            </div>
          </div>

          {/* Quick Action Rail */}
          <div className="pd-action-rail">
            <Link to="/provider/available-jobs" className="pd-action-item">
              <div className="pd-action-icon pd-icon-blue"><RiSearchLine size={18} /></div>
              <div className="pd-action-info">
                <span className="pd-action-label">Find Jobs</span>
                <span className="pd-action-desc">Browse opportunities</span>
              </div>
            </Link>
            <Link to="/provider/my-jobs" className="pd-action-item">
              <div className="pd-action-icon pd-icon-violet"><RiCalendarCheckLine size={18} /></div>
              <div className="pd-action-info">
                <span className="pd-action-label">My Schedule</span>
                <span className="pd-action-desc">Active assignments</span>
              </div>
              {!loading && safeNumber(overview?.activeJobs) > 0 && (
                <span className="pd-action-badge pd-badge-blue">{safeNumber(overview?.activeJobs)}</span>
              )}
            </Link>
            <Link to="/provider/messages" className="pd-action-item">
              <div className="pd-action-icon pd-icon-green"><RiMessage3Line size={18} /></div>
              <div className="pd-action-info">
                <span className="pd-action-label">Messages</span>
                <span className="pd-action-desc">Client chats</span>
              </div>
            </Link>
            <Link to="/provider/wallet" className="pd-action-item">
              <div className="pd-action-icon pd-icon-amber"><RiWallet3Line size={18} /></div>
              <div className="pd-action-info">
                <span className="pd-action-label">Earnings</span>
                <span className="pd-action-desc">{loading ? "…" : safeCurrency(overview?.walletBalance)}</span>
              </div>
            </Link>
          </div>
        </div>

        {/* ─── Stats Grid ───────────────────────────────────────── */}
        <div className="pd-stats-grid">
          <StatCard
            label="Total Revenue"
            value={safeCurrency(overview?.totalEarnings)}
            icon={<RiMoneyDollarCircleLine size={20} />}
            iconClass="pd-icon-blue"
            colorVariant="blue"
            trend={undefined}
            foot="Lifetime platform earnings"
            loading={loading}
          />
          <StatCard
            label="Wallet Balance"
            value={safeCurrency(overview?.walletBalance)}
            icon={<RiWallet3Line size={20} />}
            iconClass="pd-icon-green"
            colorVariant="green"
            trend={undefined}
            foot="Available for withdrawal"
            loading={loading}
          />
          <StatCard
            label="Active Jobs"
            value={safeNumber(overview?.activeJobs)}
            icon={<RiBriefcaseLine size={20} />}
            iconClass="pd-icon-amber"
            colorVariant="amber"
            trend={undefined}
            foot="Currently in progress"
            loading={loading}
          />
          <StatCard
            label="Assignments"
            value={safeNumber(overview?.totalAssignments)}
            icon={<RiStackLine size={20} />}
            iconClass="pd-icon-indigo"
            colorVariant="indigo"
            trend={undefined}
            foot="All-time completed work"
            loading={loading}
          />
        </div>

        {/* ─── Charts + Availability ────────────────────────────── */}
        <div className="pd-row-2col">
          <DashboardChartCard
            title="Revenue Analytics"
            subtitle="Monthly earning trends"
            loading={loading}
            isEmpty={!charts?.monthlyEarnings || charts.monthlyEarnings.length === 0}
            emptyMessage="Complete jobs to see your revenue trends"
          >
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={charts?.monthlyEarnings || []}>
                <defs>
                  <linearGradient id="pdRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} dx={-8} tickFormatter={(v) => `₹${safeNumber(v)}`} />
                <Tooltip
                  contentStyle={{ borderRadius: 14, border: '1px solid rgba(15,23,42,0.06)', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', padding: '10px 16px', fontSize: 12 }}
                  formatter={(v: unknown) => [`₹${safeNumber(v).toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#pdRevGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </DashboardChartCard>

          <AvailabilitySummaryCard
            availableToday={availability?.availableToday ?? false}
            nextBlockedDate={availability?.nextBlockedDate ?? null}
            loading={loading}
          />
        </div>

        {/* ─── Bottom Row ───────────────────────────────────────── */}
        <div className="pd-row-3col">

          {/* Activity Feed */}
          <div className="pd-activity-card">
            <div className="pd-card-head">
              <div>
                <div className="pd-card-title">Recent Activity</div>
                <div className="pd-card-subtitle">Real-time updates</div>
              </div>
              <RiHistoryLine size={17} style={{ color: "#cbd5e1" }} />
            </div>
            <div className="pd-activity-scroll">
              <ActivityFeed activities={formatActivity()} loading={loading} />
            </div>
            <div className="pd-card-foot">
              <Link to="/provider/my-jobs" className="pd-link-action">
                View All Assignments <RiArrowRightLine size={13} />
              </Link>
            </div>
          </div>

          {/* Portfolio Donut */}
          <DashboardChartCard
            title="Portfolio"
            subtitle="Job distribution"
            loading={loading}
            isEmpty={!charts?.jobStatusDistribution || charts.jobStatusDistribution.length === 0}
            emptyMessage="No portfolio data yet"
          >
            <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "center" }}>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={charts?.jobStatusDistribution || []} cx="50%" cy="50%" innerRadius={46} outerRadius={68} paddingAngle={5} dataKey="count" stroke="none">
                    {(charts?.jobStatusDistribution || []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(15,23,42,0.06)', boxShadow: '0 8px 20px rgba(0,0,0,0.06)', fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              {(charts?.jobStatusDistribution || []).length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
                  {(charts?.jobStatusDistribution || []).map((entry, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "#f8fafc", borderRadius: 10, border: "1px solid rgba(15,23,42,0.05)" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.status || "Unknown"}</div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>{safeNumber(entry.count)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DashboardChartCard>

          {/* Performance */}
          <div className="pd-card">
            <div className="pd-card-head">
              <div>
                <div className="pd-card-title">Performance</div>
                <div className="pd-card-subtitle">Reliability metrics</div>
              </div>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#7c3aed" }}>
                <RiCheckboxCircleLine size={16} />
              </div>
            </div>
            <div className="pd-card-body">
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div><Skel h={10} /><div style={{ marginTop: 6 }}><Skel h={6} w="90%" /></div></div>
                  <div><Skel h={10} /><div style={{ marginTop: 6 }}><Skel h={6} w="75%" /></div></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
                    <Skel h={72} r={12} />
                    <Skel h={72} r={12} />
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 18, height: "100%" }}>
                  {/* Completion */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Completion</span>
                      <span style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>{safePercentage(performance?.completionRate)}</span>
                    </div>
                    <div style={{ width: "100%", height: 6, background: "#f1f5f9", borderRadius: 100, overflow: "hidden" }}>
                      <div style={{ width: `${clampedNumber(performance?.completionRate)}%`, height: "100%", background: "linear-gradient(90deg, #10b981, #06b6d4)", borderRadius: 100, transition: "width 1s ease" }} />
                    </div>
                  </div>

                  {/* Acceptance */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Acceptance</span>
                      <span style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>{safePercentage(performance?.acceptanceRate)}</span>
                    </div>
                    <div style={{ width: "100%", height: 6, background: "#f1f5f9", borderRadius: 100, overflow: "hidden" }}>
                      <div style={{ width: `${clampedNumber(performance?.acceptanceRate)}%`, height: "100%", background: "linear-gradient(90deg, #6366f1, #a855f7)", borderRadius: 100, transition: "width 1s ease" }} />
                    </div>
                  </div>

                  {/* Mini stats */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: "auto" }}>
                    <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(15,23,42,0.05)" }}>
                      <p style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>Feedback</p>
                      <p style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", margin: 0 }}>{safeNumber(performance?.totalReviews)} reviews</p>
                    </div>
                    <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(15,23,42,0.05)" }}>
                      <p style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>Rating</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <p style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", margin: 0 }}>{safeDecimal(performance?.averageRating)}</p>
                        <RiStarLine size={13} style={{ color: "#f59e0b" }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProviderDashboardPage;
