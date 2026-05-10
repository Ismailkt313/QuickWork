import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  type Key,
} from "react";
import { useNavigate } from "react-router-dom";
import JobCard, { type Job } from "../components/jobcard";
import UniversalActionModal from "../components/UniversalActionModal";
import ActionErrorModal from "../components/ActionErrorModal";
import AcceptConfirmationModal from "../components/AcceptConfirmationModal";
import { RiMapPinUserLine, RiMapPinRangeLine } from "react-icons/ri";
import {
  availableJobs,
  fetchSkills,
  fetchLocations,
  acceptJob,
} from "../services/provider.service";
import { toast } from "react-toastify";
import "../pages/style/page.css";
import { useProviderLocation } from "../hooks/useProviderLocation";

const SORT_OPTS = [
  { value: "newest", label: "Newest First" },
  { value: "budget_hi", label: "Budget: High → Low" },
  { value: "budget_lo", label: "Budget: Low → High" },
  { value: "applicants", label: "Fewest Applicants" },
];

const IconSearch = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);
const IconRefresh = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
  </svg>
);
const IconFilter = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
const IconClose = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconBag = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
  </svg>
);
const IconZap = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const SkeletonCard: React.FC<{ delay?: number }> = ({ delay = 0 }) => (
  <div className="ajp-skeleton-card" style={{ animationDelay: `${delay}ms` }}>
    <div className="ajp-skel-row">
      <div
        className="ajp-skel ajp-skel-circle"
        style={{ width: 42, height: 42, flexShrink: 0 }}
      />
      <div className="ajp-skel-lines">
        <div className="ajp-skel" style={{ height: 14, width: "65%" }} />
        <div className="ajp-skel" style={{ height: 11, width: "45%" }} />
      </div>
    </div>
    <div
      className="ajp-skel"
      style={{ height: 11, width: "100%", marginBottom: 6 }}
    />
    <div
      className="ajp-skel"
      style={{ height: 11, width: "80%", marginBottom: 16 }}
    />
    <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
      {[60, 80, 50].map((w, i) => (
        <div
          key={i}
          className="ajp-skel"
          style={{ height: 24, width: w, borderRadius: 20 }}
        />
      ))}
    </div>
    <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
      <div className="ajp-skel" style={{ height: 11, width: 90 }} />
      <div className="ajp-skel" style={{ height: 11, width: 70 }} />
    </div>
    <div
      style={{
        borderTop: "1px solid rgba(255,255,255,0.05)",
        paddingTop: 14,
        display: "flex",
        gap: 8,
      }}
    >
      <div
        className="ajp-skel"
        style={{ height: 34, width: 36, borderRadius: 9 }}
      />
      <div
        className="ajp-skel"
        style={{ height: 34, flex: 1, borderRadius: 9 }}
      />
      <div
        className="ajp-skel"
        style={{ height: 34, flex: 1.2, borderRadius: 9 }}
      />
    </div>
  </div>
);

const AvailableJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetching, setIsFetching] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [locations, setLocations] = useState<
    {
      id: Key | null | undefined;
      _id: string;
      name: string;
    }[]
  >([]);
  const [skills, setSkills] = useState<
    {
      id: Key | null | undefined;
      _id: string;
      name: string;
    }[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [budget, setBudget] = useState("Any Budget");

  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const JOBS_PER_PAGE = 10;

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [actionError, setActionError] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });
  const [pendingJobId, setPendingJobId] = useState<string | null>(null);

  const providerLocation = useProviderLocation();

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [locs, sks] = await Promise.all([
          fetchLocations(),
          fetchSkills(),
        ]);
        setLocations(locs.data);

        setSkills(sks.data);
      } catch (err: unknown) {
        console.error("Error loading filters:", err);
        toast.error("Failed to load filter options");
      }
    };
    loadFilters();
  }, []);

  const parseBudgetRange = (label: string): { min?: number; max?: number } => {
    if (label === "Any Budget") return {};
    if (label === "₹0 – ₹1,000") return { min: 0, max: 1000 };
    if (label === "₹1,000 – ₹5,000") return { min: 1000, max: 5000 };
    if (label === "₹5,000 – ₹15,000") return { min: 5000, max: 15000 };
    if (label === "₹15,000+") return { min: 15000 };
    return {};
  };

  const fetchData = useCallback(
    async (page = 1) => {
      setIsFetching(true);
      setLoading(true);
      try {
        const budgetRange = parseBudgetRange(budget);

        const response = await availableJobs(
          page,
          JOBS_PER_PAGE,
          selectedCategory || undefined,
          selectedLocation || undefined,
          budgetRange.min,
          budgetRange.max,
          searchQuery || undefined,
        );

        if (response.success) {
          setJobs(response.data);
          setPagination(response.pagination);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch jobs";
        console.error(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setIsFetching(false);
      }
    },
    [selectedCategory, selectedLocation, budget, searchQuery],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedLocation, selectedCategory, budget, searchQuery]);

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, fetchData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(currentPage);
  }, [fetchData, currentPage]);

  const handleApply = (jobId: string) => {
    setPendingJobId(jobId);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmApply = (amount: number) => {
    setIsConfirmModalOpen(false);
    const jobId = pendingJobId;
    if (!jobId) return;

    const job = jobs.find((j) => j.id === jobId);
    if (job && job.location?.districtName !== providerLocation) {
      setIsLocationModalOpen(true);
    } else {
      confirmApply(jobId, amount);
    }
  };

  const confirmApply = async (jobId: string, amount?: number) => {
    if (isAccepting) return;
    setIsAccepting(true);

    try {
      const result = await acceptJob(jobId, amount);
      if (result.success) {
        toast.success(`Applied for job #${jobId.slice(-4)} successfully!`);
        fetchData(currentPage);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to apply for job";
      setActionError({
        isOpen: true,
        title: errorMessage.toLowerCase().includes("overlap")
          ? "Schedule Conflict"
          : "Action Failed",
        message: errorMessage,
      });
    } finally {
      setIsAccepting(false);
      setPendingJobId(null);
    }
  };

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string }[] = [];
    if (selectedLocation) {
      const loc = locations.find((l) => l._id === selectedLocation);
      if (loc) chips.push({ key: "location", label: loc.name });
    }
    if (selectedCategory) {
      const skill = skills.find((s) => s._id === selectedCategory);
      if (skill) chips.push({ key: "category", label: skill.name });
    }
    if (budget !== "Any Budget") chips.push({ key: "budget", label: budget });
    return chips;
  }, [selectedLocation, selectedCategory, budget, locations, skills]);

  const removeChip = (key: string) => {
    if (key === "location") setSelectedLocation("");
    if (key === "category") setSelectedCategory("");
    if (key === "budget") setBudget("Any Budget");
  };

  const clearAllFilters = () => {
    setSelectedLocation("");
    setSelectedCategory("");
    setBudget("Any Budget");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const totalPages = pagination.totalPages;

  const urgentCount = jobs.filter((j) => j.isUrgent).length;

  const displayedJobs = jobs;
  return (
    <div className="ajp-root">
      <div className="ajp-container">
        <div className="ajp-header">
          <div className="ajp-header-left">
            <h1 className="ajp-title">Available Jobs</h1>
            <p className="ajp-subtitle">
              Browse jobs posted by clients and apply to the ones that match
              your skills.
            </p>
          </div>
          <div className="ajp-header-actions">
            <button
              className={`ajp-icon-btn${refreshing ? " spinning" : ""}`}
              onClick={handleRefresh}
              aria-label="Refresh job listings"
              title="Refresh"
            >
              <IconRefresh />
            </button>
            <button
              className="ajp-filter-toggle-btn"
              onClick={() => setShowFilters((v) => !v)}
              aria-expanded={showFilters}
              aria-label="Toggle filters"
            >
              {activeChips.length > 0 && (
                <span className="ajp-filter-dot" aria-hidden="true" />
              )}
              <IconFilter />
              Filters
              {activeChips.length > 0 && (
                <span
                  style={{
                    background: "var(--qw-accent,#6c63ff)",
                    color: "#fff",
                    borderRadius: 20,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "1px 6px",
                    marginLeft: 2,
                  }}
                >
                  {activeChips.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="ajp-stats-row">
          <div className="ajp-stat-pill">
            <span className="ajp-dot" style={{ background: "#6c63ff" }} />
            <span className="ajp-stat-num">{pagination.total}</span>
            <span>total jobs available</span>
          </div>
          <div className="ajp-stat-pill">
            <span className="ajp-dot" style={{ background: "#ff6b6b" }} />
            <span className="ajp-stat-num">{urgentCount}</span>
            <span>urgent opportunities</span>
          </div>
        </div>

        <div
          className={`ajp-filter-panel${showFilters ? "" : " collapsed"}`}
          role="search"
          aria-label="Filter jobs"
        >
          <div className="ajp-filter-group">
            <label className="ajp-filter-label" htmlFor="filter-location">
              Location
            </label>
            <select
              id="filter-location"
              className="ajp-filter-select"
              value={selectedLocation}
              onChange={(e) => {
                setSelectedLocation(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Locations</option>
              {locations.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <div className="ajp-filter-group">
            <label className="ajp-filter-label" htmlFor="filter-category">
              Category
            </label>
            <select
              id="filter-category"
              className="ajp-filter-select"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Categories</option>
              {skills.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="ajp-filter-group">
            <label className="ajp-filter-label" htmlFor="filter-budget">
              Budget
            </label>
            <select
              id="filter-budget"
              className="ajp-filter-select"
              value={budget}
              onChange={(e) => {
                setBudget(e.target.value);
                setCurrentPage(1);
              }}
            >
              {[
                "Any Budget",
                "₹0 – ₹1,000",
                "₹1,000 – ₹5,000",
                "₹5,000 – ₹15,000",
                "₹15,000+",
              ].map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </div>

          {activeChips.length > 0 && (
            <div
              className="ajp-filter-group"
              style={{ justifyContent: "flex-end" }}
            >
              <label className="ajp-filter-label">&nbsp;</label>
              <button
                className="ajp-filter-clear-btn"
                onClick={clearAllFilters}
                type="button"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        <div className="ajp-search-row">
          <div className="ajp-search-wrap">
            <span className="ajp-search-icon" aria-hidden="true">
              <IconSearch />
            </span>
            <input
              className="ajp-search-input"
              type="search"
              placeholder="Search jobs by title, skill, or keyword..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Search jobs"
            />
          </div>

          {activeChips.length > 0 && (
            <div className="ajp-active-chips" aria-label="Active filters">
              {activeChips.map((chip) => (
                <span key={chip.key} className="ajp-chip">
                  {chip.label}
                  <button
                    className="ajp-chip-x"
                    onClick={() => removeChip(chip.key)}
                    aria-label={`Remove ${chip.label} filter`}
                    type="button"
                  >
                    <IconClose />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="ajp-sort-row">
          <p className="ajp-results-count">
            Showing <strong>{displayedJobs.length}</strong> of{" "}
            <strong>{pagination.total}</strong> jobs
          </p>
          <div className="ajp-sort-group">
            <span className="ajp-sort-label">Sort by:</span>
            <select
              className="ajp-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort jobs"
            >
              {SORT_OPTS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="ajp-grid" role="list" aria-label="Job listings">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} delay={i * 80} />
            ))
          ) : displayedJobs.length === 0 ? (
            <div className="ajp-empty" role="status">
              <div className="ajp-empty-icon" aria-hidden="true">
                <IconBag />
              </div>
              <div className="ajp-empty-title">No jobs found</div>
              <p className="ajp-empty-sub">
                Try adjusting your search or filters — there might be more jobs
                matching different criteria.
              </p>
              <button
                onClick={clearAllFilters}
                style={{
                  marginTop: 18,
                  padding: "9px 22px",
                  borderRadius: 10,
                  background: "var(--qw-accent,#6c63ff)",
                  border: "none",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  fontFamily: "DM Sans, sans-serif",
                }}
                type="button"
              >
                <IconZap /> Clear Filters
              </button>
              {fetching &&
                Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={`loading-${i}`} />
                ))}
            </div>
          ) : (
            displayedJobs.map((job, i) => (
              <div key={job.id} role="listitem">
                <JobCard
                  job={{ ...job, animationDelay: i * 60 }}
                  onApply={handleApply}
                  onViewDetails={(id) => navigate(`/provider/jobs/${id}`)}
                  onSave={(id, saved) => { console.log(id, saved); }}
                />
              </div>
            ))
          )}
        </div>

        <p className="qw-pagination-info">
          Page {currentPage} of {totalPages}
        </p>
        {!loading && totalPages > 1 && (
          <nav className="qw-pagination">
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
                    className={`qw-page-btn ${page === currentPage ? "active" : ""
                      }`}
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

      <UniversalActionModal
        isOpen={isLocationModalOpen}
        onClose={() => {
          setIsLocationModalOpen(false);
          setPendingJobId(null);
        }}
        onConfirm={() => pendingJobId && confirmApply(pendingJobId)}
        title="Location Mismatch"
        message="This opportunity is located outside your default work zone. Please confirm you can accommodate the travel requirements."
        iconType="location"
      >
        <div className="row g-3">
          <div className="col-6">
            <div className="p-3 bg-light rounded-4 border">
              <div className="d-flex align-items-center gap-2 mb-2 text-muted small fw-bold text-uppercase">
                <RiMapPinUserLine size={14} />
                Your Zone
              </div>
              <div className="fw-bold text-dark small">
                {providerLocation || "Not Set"}
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="p-3 bg-primary-subtle rounded-4 border border-primary-subtle">
              <div className="d-flex align-items-center gap-2 mb-2 text-primary small fw-bold text-uppercase">
                <RiMapPinRangeLine size={14} />
                Job Zone
              </div>
              <div className="fw-bold text-primary small">
                {jobs.find((j) => j.id === pendingJobId)?.location?.address ||
                  "Remote"}
              </div>
            </div>
          </div>
        </div>
      </UniversalActionModal>

      <ActionErrorModal
        isOpen={actionError.isOpen}
        onClose={() => setActionError((prev) => ({ ...prev, isOpen: false }))}
        title={actionError.title}
        message={actionError.message}
        primaryAction={
          actionError.title === "Schedule Conflict"
            ? {
              label: "View My Schedule",
              onClick: () => navigate("/provider/my-jobs"),
            }
            : undefined
        }
      />

      <AcceptConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setPendingJobId(null);
        }}
        onConfirm={handleConfirmApply}
        jobTitle={jobs.find((j) => j.id === pendingJobId)?.title}
        budget={jobs.find((j) => j.id === pendingJobId)?.budgetRange}
        isActionLoading={isAccepting}
      />
    </div>
  );
};

export default AvailableJobsPage;
