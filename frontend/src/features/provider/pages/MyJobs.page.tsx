import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiBriefcaseLine,
  RiFilter3Line,
  RiLoader4Line,
  RiExternalLinkLine,
  RiInboxLine,
  RiSearchLine,
} from "react-icons/ri";
import { toast } from "react-toastify";
import MyJobCard from "../components/MyJobCard";
import { getAssignments } from "../services/provider.service";

type TabType = "active" | "completed" | "cancelled" | "all";

const MyJobsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<TabType>("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [limit] = useState(10);
  const [tabCounts, setTabCounts] = useState({ active: 0, completed: 0, cancelled: 0, all: 0 });
  const navigate = useNavigate();

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      const response = await getAssignments(currentPage, limit, searchQuery, filterTab);
      if (response.success) {
        setAssignments(response.data);
        setTotalJobs(response.total || response.data.length);
        if (response.counts) {
          setTabCounts(response.counts);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch your jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, [currentPage, filterTab]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchMyJobs();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const totalPages = Math.ceil(totalJobs / limit);

  return (
    <div
      className="container-fluid py-4 px-lg-5"
      style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
        <div>
          <h1
            className="display-6 fw-bold mb-2"
            style={{
              color: "#0f172a",
              fontFamily: "Syne, sans-serif",
              letterSpacing: "-1px",
            }}
          >
            My Jobs
          </h1>
          <p
            className="text-muted mb-0 d-flex align-items-center gap-2"
            style={{ fontSize: "15px" }}
          >
            <RiBriefcaseLine className="text-primary" />
            Managing {totalJobs} assignments
          </p>
        </div>
        <div className="d-flex gap-2">
          <div className="position-relative">
            <RiSearchLine
              className="position-absolute top-50 translate-middle-y ms-3 text-muted"
              size={18}
            />
            <input
              type="text"
              className="form-control shadow-sm border rounded-3 ps-5 py-2-5 bg-white"
              style={{ fontWeight: 500, width: "300px" }}
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary rounded-3 px-4 py-2 shadow-lg d-flex align-items-center gap-2 fw-bold overflow-hidden transition-all hover-translate-x"
            style={{ letterSpacing: "0.02em" }}
            onClick={() => navigate("/provider/available-jobs")}
          >
            Available Marketplace <RiExternalLinkLine />
          </button>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-12 col-xl-12">
          <div className="bg-white p-2 rounded-4 shadow-sm border d-inline-flex gap-2 mb-4">
            {[
              { id: "active", label: "Active Jobs", count: tabCounts.active },
              {
                id: "completed",
                label: "Completed",
                count: tabCounts.completed,
              },
              {
                id: "cancelled",
                label: "Cancelled",
                count: tabCounts.cancelled,
              },
              { id: "all", label: "Full Log", count: tabCounts.all },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setFilterTab(tab.id as TabType);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2-5 rounded-3 fw-bold transition-all border-0 ${filterTab === tab.id ? "bg-primary text-white shadow-md" : "btn-light text-muted hover-bg-light"}`}
                style={{ fontSize: "14px", whiteSpace: "nowrap" }}
              >
                {tab.label}
                <span
                  className={`ms-2 px-2 py-0-5 rounded-pill ${filterTab === tab.id ? "bg-white text-primary" : "bg-primary-subtle text-primary"}`}
                  style={{ fontSize: "11px" }}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="d-flex align-items-center justify-content-between text-muted mb-3 px-2">
            <div
              className="d-flex align-items-center gap-2"
              style={{ fontSize: "13.5px" }}
            >
              <RiFilter3Line /> Showing results for{" "}
              <span className="fw-bold text-dark">
                {filterTab.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="col-12 col-xl-10 mx-auto mt-4">
            {loading ? (
              <div className="d-flex flex-column align-items-center justify-content-center py-5">
                <RiLoader4Line
                  size={48}
                  className="text-primary animate-spin mb-3"
                />
                <p className="text-muted fw-semibold">
                  Loading your assignments...
                </p>
              </div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-5 px-4 bg-white rounded-5 border border-dashed border-2 mt-4">
                <div
                  className="mb-4 d-inline-flex align-items-center justify-content-center"
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 24,
                    background: "#f1f5f9",
                    color: "#94a3b8",
                  }}
                >
                  <RiInboxLine size={40} />
                </div>
                <h3
                  className="fw-bold text-dark"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  No jobs in this category
                </h3>
                <p
                  className="text-muted mx-auto mb-4"
                  style={{ maxWidth: 360 }}
                >
                  {filterTab === "active"
                    ? "You don't have any active jobs at the moment. Try browsing the marketplace for new opportunities!"
                    : filterTab === "completed"
                      ? "You haven't completed any jobs yet. Your history will appear here once you finish your first assignment."
                      : filterTab === "cancelled"
                        ? "You don't have any cancelled jobs."
                        : "No assignments found matching your criteria."}
                </p>
                <button
                  className="btn btn-primary px-5 py-3 rounded-pill fw-bold shadow-lg"
                  onClick={() => navigate("/provider/available-jobs")}
                >
                  Find New Jobs <RiExternalLinkLine className="ms-1" />
                </button>
              </div>
            ) : (
              <div className="animate-in fade-in duration-700">
                {assignments.map((as) => (
                  <MyJobCard
                    key={as.id}
                    assignment={as}
                    onViewDetails={(id) =>
                      navigate(`/provider/assignment/${id}`)
                    }
                    onMessage={(userId, name) =>
                      navigate(
                        `/provider/messages?userId=${userId}&name=${encodeURIComponent(name)}`,
                      )
                    }
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <nav
                className="d-flex justify-content-center align-items-center gap-2 mt-5"
                aria-label="Job pagination"
              >
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="qw-page-btn"
                >
                  «
                </button>

                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="qw-page-btn"
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`qw-page-btn ${page === currentPage ? "active" : ""}`}
                      >
                        {page}
                      </button>
                    );
                  }
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="qw-dots">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="qw-page-btn"
                >
                  ›
                </button>

                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="qw-page-btn"
                >
                  »
                </button>
              </nav>
            )}
          </div>
        </div>
      </div>

      <style>{`
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .py-2-5 { padding-top: 0.625rem; padding-bottom: 0.625rem; }
                .shadow-md { box-shadow: 0 4px 6px -1px rgba(108, 99, 255, 0.4), 0 2px 4px -2px rgba(108, 99, 255, 0.3); }
                .animate-in { animation: fadeIn 0.5s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .hover-translate-x:hover { transform: translateX(5px); }

                .qw-page-btn {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 12px;
                    background: white;
                    border: 1px solid #e2e8f0;
                    color: #64748b;
                    font-weight: 600;
                    transition: all 0.2s;
                    cursor: pointer;
                }
                .qw-page-btn:hover:not(:disabled) {
                    border-color: #3b82f6;
                    color: #3b82f6;
                    background: #eff6ff;
                }
                .qw-page-btn.active {
                    background: #3b82f6;
                    border-color: #3b82f6;
                    color: white;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                }
                .qw-page-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    background: #f8fafc;
                }
                .qw-dots {
                    color: #94a3b8;
                    font-weight: bold;
                    width: 30px;
                    text-align: center;
                }
            `}</style>
    </div>
  );
};

export default MyJobsPage;
