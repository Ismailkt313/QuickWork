import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  RiFilter3Line,
  RiSearchLine,
  RiLoader4Line,
  RiSmartphoneLine,
  RiAddLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiSkipBackLine,
  RiSkipForwardLine,
  RiArrowUpDownLine, 
  RiSearch2Line
} from "react-icons/ri";
import { getUserJobs, cancelJob, type UserJob } from "../services/userJob.service";
import UserJobCard from "../components/UserJobCard";
import CompactUserJobCard from "../components/CompactUserJobCard";
import { CreateJobModal } from "../jobs/components/CreateJobModal";
import { CancelJobModal } from "../components/CancelJobModal";
import { toast } from "react-toastify";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AxiosError } from "axios";

const JOBS_PER_PAGE = 8;

const UserJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialTab = searchParams.get("status") || "all";
  const initialSearch = searchParams.get("search") || "";

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [jobToCancelId, setJobToCancelId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [jobs, setJobs] = useState<UserJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: JOBS_PER_PAGE,
    totalPages: 1,
  });
  const [counts, setCounts] = useState({
    all: 0,
    direct: 0,
    pending: 0,
    ongoing: 0,
    completed: 0,
    cancelled: 0,
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);
  const isSearchInitial = useRef(true);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (currentPage > 1) params.page = currentPage.toString();
    if (filterTab !== "all") params.status = filterTab;
    if (debouncedSearch) params.search = debouncedSearch;

    setSearchParams(params, { replace: true });
  }, [currentPage, filterTab, debouncedSearch, setSearchParams]);

  useEffect(() => {
    if (isSearchInitial.current) {
      isSearchInitial.current = false;
      return;
    }

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchTerm]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setCurrentPage(1);
  }, [filterTab]);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUserJobs(
        currentPage,
        JOBS_PER_PAGE,
        filterTab,
        debouncedSearch || undefined,
      );
      if (response.success) {
        setJobs(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
        if (response.counts) {
          setCounts(response.counts);
        }
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || (error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterTab, debouncedSearch]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const triggerCancelJob = (jobId: string) => {
    setJobToCancelId(jobId);
    setIsCancelModalOpen(true);
  };

  const confirmCancelJob = async () => {
    if (!jobToCancelId) return;
    setIsCancelling(true);
    try {
      const response = await cancelJob(jobToCancelId);
      if (response.success) {
        toast.success("Job cancelled successfully");
        setIsCancelModalOpen(false);
        setJobToCancelId(null);
        fetchJobs();
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || (error as Error).message);
    } finally {
      setIsCancelling(false);
    }
  };

  const totalPages = pagination.totalPages;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  // ─── Sub-Components ───

  const MobilePageToolbar = () => (
    <div className="m-page-toolbar">
      <div className="m-toolbar-content">
        <h1 className="m-page-title">My Jobs</h1>
        <button onClick={() => setIsCreateModalOpen(true)} className="m-toolbar-add-btn">
          <RiAddLine size={18} /> New Job
        </button>
      </div>
    </div>
  );

  const MobileJobTabs = () => (
    <div className="m-tabs-container">
      <div className="m-tabs-scroll">
        {[
          { id: "all", label: "All", count: counts.all },
          { id: "direct", label: "Direct", count: counts.direct },
          { id: "pending", label: "Pending", count: counts.pending },
          { id: "ongoing", label: "Ongoing", count: counts.ongoing },
          { id: "completed", label: "Completed", count: counts.completed },
          { id: "cancelled", label: "Cancelled", count: counts.cancelled },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`m-tab-chip ${filterTab === tab.id ? "active" : ""}`}
            onClick={() => setFilterTab(tab.id)}
          >
            {tab.label}
            {tab.count > 0 && <span className="m-chip-count">{tab.count}</span>}
          </button>
        ))}
      </div>
    </div>
  );

  const MobileJobFilterBar = () => (
    <div className="m-filter-bar">
      <div className="m-search-box">
        <RiSearch2Line size={16} className="m-search-icon" />
        <input
          type="text"
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <button className="m-sort-btn">
        <RiArrowUpDownLine size={16} />
      </button>
    </div>
  );

  return (
    <div className={`qw-page-container ${isMobile ? "m-page" : ""}`}>
      {isMobile ? (
        <div className="m-content-wrapper">
          <MobilePageToolbar />
          <MobileJobTabs />
          <MobileJobFilterBar />
          
          <div className="m-results-info">
             <span className="m-results-count">{pagination.total} Results</span>
             {filterTab !== 'all' && <span className="m-filter-tag">{filterTab}</span>}
          </div>

          <div className="m-grid-container">
            {loading ? (
              <div className="m-loading-state">
                <RiLoader4Line size={32} className="qw-spin" />
                <p>Scanning marketplace...</p>
              </div>
            ) : jobs.length > 0 ? (
              <div className="m-grid">
                {jobs.map((job) => (
                  <CompactUserJobCard
                    key={job.id}
                    job={job}
                    onView={(id) => navigate(`/user/jobs/${id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="m-empty-state">
                <RiSmartphoneLine size={48} />
                <h3>No jobs found</h3>
                <p>Adjust your filters to see more results.</p>
              </div>
            )}
          </div>
          
          {totalPages > 1 && (
            <div className="m-pagination">
               <button className="m-pag-btn" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}>Prev</button>
               <span className="m-pag-info">{currentPage} / {totalPages}</span>
               <button className="m-pag-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages}>Next</button>
            </div>
          )}
          
          {/* MobileBottomNav is already rendered in Header.tsx based on my audit, so I should remove it from here if it's duplicated. */}
          {/* Re-checking Header.tsx... line 644: <MobileBottomNav /> */}
          {/* So I will NOT render it here to avoid duplication. */}
        </div>
      ) : (
        <>
          <div className="qw-page-header mb-5">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-4">
              <div>
                <nav aria-label="breadcrumb" className="mb-2">
                  <ol className="breadcrumb mb-0" style={{ fontSize: "12px" }}>
                    <li className="breadcrumb-item">
                      <Link to="/user" className="text-decoration-none text-muted">
                        Dashboard
                      </Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      My Jobs
                    </li>
                  </ol>
                </nav>
                <h1 className="qw-display-title mb-2">My Job Postings</h1>
                <p className="qw-subtitle">
                  Manage and track your active service requests in real-time.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="qw-btn-primary"
                style={{ border: "none", cursor: "pointer" }}
              >
                <RiAddLine size={22} /> Create New Job
              </button>
            </div>
          </div>

          <div className="qw-action-bar mb-4">
            <div className="qw-tabs-wrapper">
              {[
                { id: "all", label: "All Jobs", count: counts.all },
                { id: "direct", label: "Direct Hires", count: counts.direct },
                { id: "pending", label: "Pending", count: counts.pending },
                { id: "ongoing", label: "Ongoing", count: counts.ongoing },
                { id: "completed", label: "Completed", count: counts.completed },
                { id: "cancelled", label: "Cancelled", count: counts.cancelled },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`qw-tab-btn ${filterTab === tab.id ? "active" : ""}`}
                  onClick={() => setFilterTab(tab.id)}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="qw-tab-count">{tab.count}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="qw-search-wrapper">
              <RiSearchLine className="qw-search-icon" />
              <input
                type="text"
                className="qw-search-input"
                placeholder="Search your jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div
            className="d-flex align-items-center justify-content-between gap-2 mb-4 px-1"
            style={{ fontSize: "13px", color: "#64748b" }}
          >
            <div className="d-flex align-items-center gap-2">
              <RiFilter3Line size={16} />
              <span>
                Showing <span className="fw-bold text-dark">{jobs.length}</span> of{" "}
                <span className="fw-bold text-dark">{pagination.total}</span>{" "}
                results for{" "}
                <span className="fw-bold text-primary">
                  {filterTab.toUpperCase()}
                </span>
              </span>
            </div>
            {totalPages > 1 && (
              <span className="qw-page-indicator">
                Page <span className="fw-bold text-dark">{currentPage}</span> of{" "}
                <span className="fw-bold text-dark">{totalPages}</span>
              </span>
            )}
          </div>

          <div className="row g-4">
            {loading ? (
              <div className="col-12 d-flex flex-column align-items-center justify-content-center py-5">
                <RiLoader4Line size={48} className="text-primary qw-spin mb-3" />
                <p className="text-muted fw-medium fs-5">Fetching your data...</p>
              </div>
            ) : jobs.length > 0 ? (
              jobs.map((job) => (
                <div key={job.id} className="col-12 col-md-6 col-xl-4 col-xxl-3">
                  <UserJobCard
                    job={job}
                    onCancel={triggerCancelJob}
                    onView={(id) => navigate(`/user/jobs/${id}`)}
                    onRefresh={fetchJobs}
                  />
                </div>
              ))
            ) : (
              <div className="col-12">
                <div className="qw-empty-state">
                  <RiSmartphoneLine size={64} className="qw-empty-icon mb-4" />
                  <h3 className="fw-bold text-dark mb-2">No jobs to display</h3>
                  <p
                    className="text-muted mb-4 mx-auto"
                    style={{ maxWidth: "400px" }}
                  >
                    {searchTerm
                      ? `We couldn't find any jobs matching "${searchTerm}" in the ${filterTab} category.`
                      : `You haven't posted any jobs under ${filterTab} yet.`}
                  </p>
                  {!searchTerm && filterTab === "all" && (
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="btn btn-primary btn-lg rounded-pill px-5 fw-bold shadow-sm"
                    >
                      Start Posting
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {!loading && totalPages > 1 && (
            <nav className="qw-pagination-wrapper" aria-label="Jobs pagination">
              <div className="qw-pagination">
                <button
                  className="qw-page-btn qw-page-nav"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  aria-label="First page"
                  title="First page"
                >
                  <RiSkipBackLine size={16} />
                </button>

                <button
                  className="qw-page-btn qw-page-nav"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                  title="Previous page"
                >
                  <RiArrowLeftSLine size={18} />
                </button>

                <div className="qw-page-numbers">
                  {getPageNumbers().map((page, idx) =>
                    typeof page === "string" ? (
                      <span key={`dots-${idx}`} className="qw-page-dots">
                        •••
                      </span>
                    ) : (
                      <button
                        key={page}
                        className={`qw-page-btn qw-page-num ${currentPage === page ? "active" : ""}`}
                        onClick={() => setCurrentPage(page as number)}
                        aria-label={`Page ${page}`}
                        aria-current={currentPage === page ? "page" : undefined}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>

                <button
                  className="qw-page-btn qw-page-nav"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                  title="Next page"
                >
                  <RiArrowRightSLine size={18} />
                </button>

                <button
                  className="qw-page-btn qw-page-nav"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  aria-label="Last page"
                  title="Last page"
                >
                  <RiSkipForwardLine size={16} />
                </button>
              </div>
            </nav>
          )}
        </>
      )}

      <CreateJobModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          fetchJobs();
        }}
      />

      <CancelJobModal
        isOpen={isCancelModalOpen}
        isCancelling={isCancelling}
        onClose={() => {
          setIsCancelModalOpen(false);
          setJobToCancelId(null);
        }}
        onConfirm={confirmCancelJob}
      />

      <style>{`
                .qw-page-container {
                    padding: 40px;
                    max-width: 1600px;
                    margin: 0 auto;
                }

                .qw-display-title {
                    font-family: 'Syne', sans-serif;
                    font-weight: 800;
                    font-size: 2.5rem;
                    color: #0f172a;
                    letter-spacing: -0.02em;
                }

                .qw-subtitle {
                    color: #64748b;
                    font-size: 1.1rem;
                    margin: 0;
                    max-width: 600px;
                }

                .qw-btn-primary {
                    background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
                    color: white;
                    padding: 12px 24px;
                    border-radius: 14px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
                }

                .qw-btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 16px rgba(79, 70, 229, 0.3);
                }

                .qw-action-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 20px;
                    background: white;
                    padding: 12px;
                    border-radius: 20px;
                    box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.05);
                    border: 1px solid rgba(15, 23, 42, 0.05);
                    flex-wrap: wrap;
                }

                .qw-tabs-wrapper {
                    display: flex;
                    gap: 8px;
                    overflow-x: auto;
                    padding-bottom: 4px;
                    scrollbar-width: none;
                }

                .qw-tabs-wrapper::-webkit-scrollbar {
                    display: none;
                }

                .qw-tab-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: transparent;
                    border: none;
                    padding: 10px 16px;
                    border-radius: 12px;
                    font-weight: 600;
                    color: #64748b;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.2s ease;
                }

                .qw-tab-btn:hover {
                    background: #f8fafc;
                    color: #0f172a;
                }

                .qw-tab-btn.active {
                    background: #0f172a;
                    color: white;
                }

                .qw-tab-count {
                    background: rgba(255, 255, 255, 0.2);
                    padding: 2px 8px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 700;
                }

                .qw-tab-btn:not(.active) .qw-tab-count {
                    background: #f1f5f9;
                    color: #475569;
                }

                .qw-search-wrapper {
                    position: relative;
                    min-width: 280px;
                    flex-grow: 1;
                    max-width: 400px;
                }

                .qw-search-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                    font-size: 20px;
                }

                .qw-search-input {
                    width: 100%;
                    padding: 12px 16px 12px 48px;
                    border-radius: 14px;
                    border: 2px solid #f1f5f9;
                    background: #f8fafc;
                    outline: none;
                    font-weight: 500;
                    color: #0f172a;
                    transition: all 0.2s ease;
                }

                .qw-search-input:focus {
                    background: white;
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.08);
                }

                /* ─── Mobile Premium Styles (Operational Marketplace) ─── */
                .m-page {
                    padding: 0;
                    background: #f8fafc;
                    min-height: 100vh;
                    padding-bottom: env(safe-area-inset-bottom, 20px);
                }

                .m-content-wrapper {
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                }

                .m-page-toolbar {
                    background: white;
                    padding: 14px 20px 10px;
                    border-bottom: 1px solid rgba(15, 23, 42, 0.04);
                }

                .m-toolbar-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .m-page-title {
                    font-family: 'Syne', sans-serif;
                    font-size: 20px;
                    font-weight: 800;
                    margin: 0;
                    color: #0f172a;
                    letter-spacing: -0.02em;
                }

                .m-toolbar-add-btn {
                    background: #0f172a;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 10px;
                    font-size: 12px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1);
                }

                .m-tabs-container {
                    background: white;
                    padding: 10px 0;
                    border-bottom: 1px solid rgba(15, 23, 42, 0.04);
                }

                .m-tabs-scroll {
                    display: flex;
                    gap: 6px;
                    overflow-x: auto;
                    padding: 0 20px;
                    scrollbar-width: none;
                }

                .m-tabs-scroll::-webkit-scrollbar { display: none; }

                .m-tab-chip {
                    padding: 6px 14px;
                    border-radius: 10px;
                    background: #f1f5f9;
                    color: #64748b;
                    border: 1px solid transparent;
                    font-size: 12px;
                    font-weight: 700;
                    white-space: nowrap;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .m-tab-chip.active {
                    background: white;
                    color: #3b82f6;
                    border-color: #3b82f6;
                    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.12);
                }

                .m-chip-count {
                    background: rgba(100, 116, 139, 0.1);
                    padding: 1px 5px;
                    border-radius: 6px;
                    font-size: 10px;
                }

                .m-tab-chip.active .m-chip-count {
                    background: #3b82f6;
                    color: white;
                }

                .m-filter-bar {
                    background: white;
                    padding: 10px 20px;
                    display: flex;
                    gap: 10px;
                    border-bottom: 1px solid rgba(15, 23, 42, 0.04);
                    position: sticky;
                    top: 60px; /* Adjust based on global header height */
                    z-index: 90;
                }

                .m-search-box {
                    flex: 1;
                    position: relative;
                }

                .m-search-icon {
                    position: absolute;
                    left: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                }

                .m-search-box input {
                    width: 100%;
                    background: #f8fafc;
                    border: 1px solid #f1f5f9;
                    padding: 8px 12px 8px 34px;
                    border-radius: 10px;
                    font-size: 13px;
                    font-weight: 500;
                    outline: none;
                    transition: border-color 0.2s;
                }

                .m-search-box input:focus {
                    border-color: #3b82f6;
                }

                .m-sort-btn {
                    width: 38px;
                    height: 38px;
                    background: #f8fafc;
                    border: 1px solid #f1f5f9;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #64748b;
                    flex-shrink: 0;
                }

                .m-results-info {
                    padding: 10px 20px 4px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .m-results-count {
                    font-size: 11px;
                    font-weight: 800;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .m-filter-tag {
                    background: #eff6ff;
                    color: #3b82f6;
                    padding: 2px 8px;
                    border-radius: 6px;
                    text-transform: uppercase;
                    font-size: 9px;
                    font-weight: 800;
                }

                .m-grid-container {
                    padding: 8px 16px;
                }

                .m-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                }

                .m-loading-state, .m-empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 20px;
                    text-align: center;
                    color: #64748b;
                    background: white;
                    border-radius: 20px;
                    margin: 10px 0;
                }

                .m-empty-state h3 {
                    color: #0f172a;
                    font-weight: 800;
                    font-size: 16px;
                    margin: 12px 0 6px;
                }

                .m-empty-state p {
                    font-size: 13px;
                    margin: 0;
                }

                .m-pagination {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 16px;
                    padding: 20px;
                }

                .m-pag-btn {
                    background: white;
                    border: 1px solid #f1f5f9;
                    padding: 6px 14px;
                    border-radius: 10px;
                    font-size: 12px;
                    font-weight: 700;
                    color: #0f172a;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.03);
                }

                .m-pag-btn:disabled {
                    opacity: 0.5;
                    background: #f8fafc;
                }

                .m-pag-info {
                    font-size: 12px;
                    font-weight: 800;
                    color: #64748b;
                    font-family: 'Syne', sans-serif;
                }

                @media (max-width: 991px) {
                    .qw-page-container:not(.m-page) { padding: 24px; }
                }
            `}</style>
    </div>
  );
};

export default UserJobsPage;
