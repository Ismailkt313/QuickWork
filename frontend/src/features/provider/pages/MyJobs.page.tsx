import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiBriefcaseLine,
  RiLoader4Line,
  RiInboxLine,
  RiSearchLine,
  RiArrowRightLine,
  RiCheckDoubleLine,
  RiToolsLine,
  RiDoorOpenLine,
  RiProhibitedLine,
  RiHistoryLine,
} from "react-icons/ri";
import { toast } from "react-toastify";
import MyJobCard from "../components/MyJobCard";
import { getAssignments } from "../services/provider.service";
import { AxiosError } from "axios";

export interface IAssignment {
  id: string;
  job: {
    id: string;
    clientId: string;
    title: string;
    description: string;
    clientName: string;
    location: {
      address: string;
      lat: number;
      lng: number;
      districtId: string;
      districtName?: string;
    } | null;
    budget: string;
    durationType?: string;
    days?: number;
  } | null;
  workStatus: "assigned" | "in_progress" | "completed" | "cancelled" | "absent";
  schedule: {
    startDate: string;
    endDate: string;
  };
  assignedAt: string;
  isOutOfDistrict: boolean;
  type: "open" | "direct";
  payment?: {
    status: string;
    method?: string;
    amount: number;
    paidAt?: string;
    transactionId?: string;
  };
}

type TabType = "active" | "completed" | "cancelled" | "all";

const TABS = [
  { id: "active", label: "Active", icon: <RiToolsLine />, color: "#6366f1" },
  { id: "completed", label: "Completed", icon: <RiCheckDoubleLine />, color: "#16a34a" },
  { id: "cancelled", label: "Cancelled", icon: <RiProhibitedLine />, color: "#dc2626" },
  { id: "all", label: "All Jobs", icon: <RiHistoryLine />, color: "#64748b" },
] as const;

const MyJobsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<IAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<TabType>("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [limit] = useState(10);
  const [tabCounts, setTabCounts] = useState({ active: 0, completed: 0, cancelled: 0, all: 0 });
  const navigate = useNavigate();
  const fetchMyJobs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAssignments(currentPage, limit, searchQuery, filterTab);
      if (response.success) {
        setAssignments(response.data);
        setTotalJobs(response.total || response.data.length);
        if (response.counts) setTabCounts(response.counts);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || "Failed to fetch your jobs");
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, searchQuery, filterTab]);

  useEffect(() => {
    fetchMyJobs();
  }, [fetchMyJobs]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchMyJobs();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, currentPage, fetchMyJobs]);

  const totalPages = Math.ceil(totalJobs / limit);
  const activeTab = TABS.find(t => t.id === filterTab)!;

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", padding: "32px 32px 48px" }}>

      {}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: "linear-gradient(135deg, #6366f1, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 19 }}>
                <RiBriefcaseLine />
              </div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#0f172a", fontFamily: "Syne, sans-serif", letterSpacing: "-0.5px" }}>
                My Jobs
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: 14, color: "#64748b" }}>
              Managing <strong style={{ color: "#0f172a" }}>{tabCounts.all}</strong> total assignments across all statuses
            </p>
          </div>

          {}
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <RiSearchLine style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 16 }} />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: 38, paddingRight: 14, height: 40, borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 13.5, color: "#0f172a", outline: "none", width: 240, fontFamily: "Inter, sans-serif" }}
              />
            </div>
            <button
              onClick={() => navigate("/provider/available-jobs")}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "0 18px", height: 40, borderRadius: 10, border: "none", background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer", boxShadow: "0 4px 14px rgba(99,102,241,0.3)", whiteSpace: "nowrap" as const }}
            >
              Find Jobs <RiArrowRightLine />
            </button>
          </div>
        </div>
      </div>

      {}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {TABS.map(tab => (
          <div
            key={tab.id}
            onClick={() => { setFilterTab(tab.id as TabType); setCurrentPage(1); }}
            style={{ background: filterTab === tab.id ? tab.color : "#fff", borderRadius: 12, padding: "14px 16px", border: filterTab === tab.id ? `1px solid ${tab.color}` : "1px solid #e8edf4", cursor: "pointer", transition: "all 0.2s", boxShadow: filterTab === tab.id ? `0 4px 14px ${tab.color}33` : "0 1px 3px rgba(0,0,0,0.04)" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 22, color: filterTab === tab.id ? "#fff" : tab.color }}>{tab.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: filterTab === tab.id ? "#fff" : "#0f172a", fontFamily: "Syne, sans-serif" }}>
                {tabCounts[tab.id as keyof typeof tabCounts]}
              </div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: filterTab === tab.id ? "rgba(255,255,255,0.85)" : "#64748b", marginTop: 6 }}>{tab.label}</div>
          </div>
        ))}
      </div>

      {}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, background: "#fff", borderRadius: 10, padding: "4px", border: "1px solid #e8edf4", alignSelf: "flex-start", width: "fit-content" }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setFilterTab(tab.id as TabType); setCurrentPage(1); }}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "none", background: filterTab === tab.id ? tab.color : "transparent", color: filterTab === tab.id ? "#fff" : "#64748b", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" as const }}
          >
            {tab.icon} {tab.label}
            <span style={{ padding: "1px 6px", borderRadius: 10, fontSize: 10, fontWeight: 700, background: filterTab === tab.id ? "rgba(255,255,255,0.25)" : "#f1f5f9", color: filterTab === tab.id ? "#fff" : "#64748b" }}>
              {tabCounts[tab.id as keyof typeof tabCounts]}
            </span>
          </button>
        ))}
      </div>

      {}
      <div>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(0,0,0,0.08)" }}>
              <RiLoader4Line size={28} color="#6366f1" style={{ animation: "spin 1s linear infinite" }} />
            </div>
            <p style={{ margin: 0, fontSize: 14, color: "#64748b", fontWeight: 500 }}>Loading your assignments...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 16, border: "1.5px dashed #e2e8f0", padding: "56px 32px", textAlign: "center" }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#94a3b8" }}>
              {tabCounts.all === 0 ? <RiInboxLine size={36} /> : <RiDoorOpenLine size={36} />}
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800, color: "#0f172a", fontFamily: "Syne, sans-serif" }}>
              No {activeTab.label} Jobs
            </h3>
            <p style={{ margin: "0 0 20px", fontSize: 14, color: "#64748b", maxWidth: 360, marginLeft: "auto", marginRight: "auto" }}>
              {filterTab === "active"
                ? "You don't have any active jobs right now. Browse the marketplace to find new opportunities!"
                : filterTab === "completed"
                ? "No completed jobs yet — your finished work will appear here."
                : filterTab === "cancelled"
                ? "No cancelled jobs. Great track record!"
                : "No assignments found in your log yet."}
            </p>
            <button
              onClick={() => navigate("/provider/available-jobs")}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "11px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}
            >
              Browse Available Jobs <RiArrowRightLine />
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
            {assignments.map((as) => (
              <MyJobCard
                key={as.id}
                assignment={as}
                onViewDetails={(id) => navigate(`/provider/assignment/${id}`)}
                onMessage={(userId, name) => navigate(`/provider/messages?userId=${userId}&name=${encodeURIComponent(name)}`)}
              />
            ))}
          </div>
        )}

        {}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 32 }}>
            {[
              { label: "«", action: () => setCurrentPage(1), disabled: currentPage === 1 },
              { label: "‹", action: () => setCurrentPage(p => Math.max(1, p - 1)), disabled: currentPage === 1 },
            ].map((btn, i) => (
              <button key={i} onClick={btn.action} disabled={btn.disabled} style={{ width: 36, height: 36, borderRadius: 9, border: "1px solid #e2e8f0", background: "#fff", color: btn.disabled ? "#cbd5e1" : "#475569", fontWeight: 600, cursor: btn.disabled ? "not-allowed" : "pointer", fontSize: 14 }}>
                {btn.label}
              </button>
            ))}

            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;
              if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{ width: 36, height: 36, borderRadius: 9, border: page === currentPage ? "none" : "1px solid #e2e8f0", background: page === currentPage ? "#6366f1" : "#fff", color: page === currentPage ? "#fff" : "#475569", fontWeight: 700, cursor: "pointer", fontSize: 14, boxShadow: page === currentPage ? "0 4px 12px rgba(99,102,241,0.35)" : "none" }}
                  >
                    {page}
                  </button>
                );
              }
              if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} style={{ color: "#94a3b8", fontWeight: 700, width: 24, textAlign: "center" as const }}>…</span>;
              }
              return null;
            })}

            {[
              { label: "›", action: () => setCurrentPage(p => Math.min(totalPages, p + 1)), disabled: currentPage === totalPages },
              { label: "»", action: () => setCurrentPage(totalPages), disabled: currentPage === totalPages },
            ].map((btn, i) => (
              <button key={i} onClick={btn.action} disabled={btn.disabled} style={{ width: 36, height: 36, borderRadius: 9, border: "1px solid #e2e8f0", background: "#fff", color: btn.disabled ? "#cbd5e1" : "#475569", fontWeight: 600, cursor: btn.disabled ? "not-allowed" : "pointer", fontSize: 14 }}>
                {btn.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default MyJobsPage;
