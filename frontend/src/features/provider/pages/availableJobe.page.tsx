import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
 import JobCard, { type Job } from '../components/jobcard';
import { availableJobs, fetchSkills, fetchLocations } from '../services/provider.service';
import '../pages/style/page.css';
 

 
const SORT_OPTS   = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'budget_hi',  label: 'Budget: High → Low' },
  { value: 'budget_lo',  label: 'Budget: Low → High' },
  { value: 'applicants', label: 'Fewest Applicants' },
];

 const IconSearch  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const IconRefresh = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>;
const IconFilter  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const IconClose   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconBag     = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>;
const IconZap     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;

 const SkeletonCard: React.FC<{ delay?: number }> = ({ delay = 0 }) => (
  <div className="ajp-skeleton-card" style={{ animationDelay: `${delay}ms` }}>
    <div className="ajp-skel-row">
      <div className="ajp-skel ajp-skel-circle" style={{ width: 42, height: 42, flexShrink: 0 }} />
      <div className="ajp-skel-lines">
        <div className="ajp-skel" style={{ height: 14, width: '65%' }} />
        <div className="ajp-skel" style={{ height: 11, width: '45%' }} />
      </div>
    </div>
    <div className="ajp-skel" style={{ height: 11, width: '100%', marginBottom: 6 }} />
    <div className="ajp-skel" style={{ height: 11, width: '80%', marginBottom: 16 }} />
    <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
      {[60, 80, 50].map((w, i) => (
        <div key={i} className="ajp-skel" style={{ height: 24, width: w, borderRadius: 20 }} />
      ))}
    </div>
    <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
      <div className="ajp-skel" style={{ height: 11, width: 90 }} />
      <div className="ajp-skel" style={{ height: 11, width: 70 }} />
    </div>
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 14, display: 'flex', gap: 8 }}>
      <div className="ajp-skel" style={{ height: 34, width: 36, borderRadius: 9 }} />
      <div className="ajp-skel" style={{ height: 34, flex: 1, borderRadius: 9 }} />
      <div className="ajp-skel" style={{ height: 34, flex: 1.2, borderRadius: 9 }} />
    </div>
  </div>
);

 const AvailableJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [jobs,         setJobs]         = useState<Job[]>([]);
  const [locations,    setLocations]    = useState<{_id: string, name: string}[]>([]);
  const [skills,       setSkills]       = useState<{_id: string, name: string}[]>([]);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [location,     setLocation]     = useState('All Locations');
  const [category,     setCategory]     = useState('All Categories');
  const [budget,       setBudget]       = useState('Any Budget');
  const [jobType,      setJobType]      = useState('All Types');
  const [sortBy,       setSortBy]       = useState('newest');
  const [showFilters,  setShowFilters]  = useState(true);
  const [currentPage,  setCurrentPage]  = useState(1);
  const [pagination,    setPagination]    = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const JOBS_PER_PAGE = 10;

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [locs, sks] = await Promise.all([fetchLocations(), fetchSkills()]);
        setLocations(locs);
        setSkills(sks);
      } catch (err) {
        console.error('Error loading filters:', err);
      }
    };
    loadFilters();
  }, []);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await availableJobs(
        page, 
        JOBS_PER_PAGE, 
        category === 'All Categories' ? undefined : (skills.find(s => s.name === category)?._id), 
        location === 'All Locations' ? undefined : (locations.find(l => l.name === location)?._id)
      );
      if (response.success) {
        setJobs(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(true); 
      setTimeout(() => setLoading(false), 300);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, location, category, fetchData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(1);
    setCurrentPage(1);
  }, [fetchData]);

   const activeChips = useMemo(() => {
    const chips: { key: string; label: string }[] = [];
    if (location  !== 'All Locations')  chips.push({ key: 'location',  label: location });
    if (category  !== 'All Categories') chips.push({ key: 'category',  label: category });
    if (budget    !== 'Any Budget')     chips.push({ key: 'budget',    label: budget });
    if (jobType   !== 'All Types')      chips.push({ key: 'jobType',   label: jobType });
    return chips;
  }, [location, category, budget, jobType]);

  const removeChip = (key: string) => {
    if (key === 'location') setLocation('All Locations');
    if (key === 'category') setCategory('All Categories');
    if (key === 'budget')   setBudget('Any Budget');
    if (key === 'jobType')  setJobType('All Types');
  };

  const clearAllFilters = () => {
    setLocation('All Locations');
    setCategory('All Categories');
    setBudget('Any Budget');
    setJobType('All Types');
    setSearchQuery('');
    setCurrentPage(1);
  };

   const filteredJobs = useMemo(() => {
    let result = jobs;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((job) => 
        job.title.toLowerCase().includes(q) ||
        job.description.toLowerCase().includes(q) ||
        (job.skills && job.skills.some((s:any) => s.toLowerCase().includes(q)))
      );
    }

    if (sortBy === 'applicants') result = [...result].sort((a, b) => a.applicants - b.applicants);
     
    return result;
  }, [jobs, searchQuery, sortBy]);

   const totalPages    = pagination.pages;
  const pagedJobs     = filteredJobs; 

  const urgentCount   = jobs.filter((j) => j.isUrgent).length;
  const savedCount    = jobs.filter((j) => j.isSaved).length;

  return (
    <div className="ajp-root">
      <div className="ajp-header">
        <div className="ajp-header-left">
          <h1 className="ajp-title">Available Jobs</h1>
          <p className="ajp-subtitle">
            Browse jobs posted by clients and apply to the ones that match your skills.
          </p>
        </div>
        <div className="ajp-header-actions">
          <button
            className={`ajp-icon-btn${refreshing ? ' spinning' : ''}`}
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
            {activeChips.length > 0 && <span className="ajp-filter-dot" aria-hidden="true" />}
            <IconFilter />
            Filters
            {activeChips.length > 0 && (
              <span style={{
                background: 'var(--qw-accent,#6c63ff)',
                color: '#fff',
                borderRadius: 20,
                fontSize: 10,
                fontWeight: 700,
                padding: '1px 6px',
                marginLeft: 2,
              }}>
                {activeChips.length}
              </span>
            )}
          </button>
        </div>
      </div>

       <div className="ajp-stats-row">
        <div className="ajp-stat-pill">
          <span className="ajp-dot" style={{ background: '#6c63ff' }} />
          <span className="ajp-stat-num">{jobs.length}</span>
          <span>jobs available</span>
        </div>
        <div className="ajp-stat-pill">
          <span className="ajp-dot" style={{ background: '#ff6b6b' }} />
          <span className="ajp-stat-num">{urgentCount}</span>
          <span>urgent</span>
        </div>
        <div className="ajp-stat-pill">
          <span className="ajp-dot" style={{ background: '#ffd166' }} />
          <span className="ajp-stat-num">{savedCount}</span>
          <span>saved</span>
        </div>
        <div className="ajp-stat-pill">
          <span className="ajp-dot" style={{ background: '#00d9b8' }} />
          <span className="ajp-stat-num">{jobs.filter(j => j.isRecommended).length}</span>
          <span>matching your skills</span>
        </div>
      </div>

       <div className={`ajp-filter-panel${showFilters ? '' : ' collapsed'}`} role="search" aria-label="Filter jobs">
        <div className="ajp-filter-group">
          <label className="ajp-filter-label" htmlFor="filter-location">Location</label>
          <select
            id="filter-location"
            className="ajp-filter-select"
            value={location}
            onChange={(e) => { setLocation(e.target.value); setCurrentPage(1); }}
          >
            <option>All Locations</option>
            {locations.map((l) => <option key={l._id}>{l.name}</option>)}
          </select>
        </div>

        <div className="ajp-filter-group">
          <label className="ajp-filter-label" htmlFor="filter-category">Category</label>
          <select
            id="filter-category"
            className="ajp-filter-select"
            value={category}
            onChange={(e) => { setCategory(e.target.value); setCurrentPage(1); }}
          >
            <option>All Categories</option>
            {skills.map((s) => <option key={s._id}>{s.name}</option>)}
          </select>
        </div>

        <div className="ajp-filter-group">
          <label className="ajp-filter-label" htmlFor="filter-budget">Budget</label>
          <select
            id="filter-budget"
            className="ajp-filter-select"
            value={budget}
            onChange={(e) => { setBudget(e.target.value); setCurrentPage(1); }}
          >
            {['Any Budget', '₹0 – ₹1,000', '₹1,000 – ₹5,000', '₹5,000 – ₹15,000', '₹15,000+'].map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>

        <div className="ajp-filter-group">
          <label className="ajp-filter-label" htmlFor="filter-type">Job Type</label>
          <select
            id="filter-type"
            className="ajp-filter-select"
            value={jobType}
            onChange={(e) => { setJobType(e.target.value); setCurrentPage(1); }}
          >
            {['All Types', 'Fixed', 'Hourly'].map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>

        {activeChips.length > 0 && (
          <div className="ajp-filter-group" style={{ justifyContent: 'flex-end' }}>
            <label className="ajp-filter-label">&nbsp;</label>
            <button className="ajp-filter-clear-btn" onClick={clearAllFilters} type="button">
              Clear All
            </button>
          </div>
        )}
      </div>

       <div className="ajp-search-row">
        <div className="ajp-search-wrap">
          <span className="ajp-search-icon" aria-hidden="true"><IconSearch /></span>
          <input
            className="ajp-search-input"
            type="search"
            placeholder="Search jobs by title, skill, or keyword..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
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
          Showing <strong>{filteredJobs.length}</strong> of <strong>{jobs.length}</strong> jobs
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
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

       <div className="ajp-grid" role="list" aria-label="Job listings">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} delay={i * 80} />
          ))
        ) : pagedJobs.length === 0 ? (
          <div className="ajp-empty" role="status">
            <div className="ajp-empty-icon" aria-hidden="true"><IconBag /></div>
            <div className="ajp-empty-title">No jobs found</div>
            <p className="ajp-empty-sub">
              Try adjusting your search or filters — there might be more jobs matching different criteria.
            </p>
            <button
              onClick={clearAllFilters}
              style={{
                marginTop: 18,
                padding: '9px 22px',
                borderRadius: 10,
                background: 'var(--qw-accent,#6c63ff)',
                border: 'none',
                color: '#fff',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 7,
                fontFamily: 'DM Sans, sans-serif',
              }}
              type="button"
            >
              <IconZap /> Clear Filters
            </button>
          </div>
        ) : (
          pagedJobs.map((job, i) => (
            <div key={job.id} role="listitem">
              <JobCard
                job={{ ...job, animationDelay: i * 60 }}
                onApply={(id) => console.log('Apply:', id)}
                onViewDetails={(id) => navigate(`/provider/jobs/${id}`)}
                onSave={(id, saved) => console.log('Save:', id, saved)}
              />
            </div>
          ))
        )}
      </div>

       {!loading && filteredJobs.length > JOBS_PER_PAGE && (
        <nav className="ajp-pagination" aria-label="Job listing pagination">
          <button
            className="ajp-page-btn"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            ‹
          </button>

          {Array.from({ length: totalPages }).map((_, i) => {
            const page = i + 1;
            if (
              page === 1 || page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
            ) {
              return (
                <button
                  key={page}
                  className={`ajp-page-btn${page === currentPage ? ' active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                  aria-label={`Page ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              );
            }
            if (page === currentPage - 2 || page === currentPage + 2) {
              return <span key={page} style={{ color: 'var(--qw-muted)', padding: '0 4px' }}>…</span>;
            }
            return null;
          })}

          <button
            className="ajp-page-btn"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            ›
          </button>
        </nav>
      )}
    </div>
  );
};

export default AvailableJobsPage;