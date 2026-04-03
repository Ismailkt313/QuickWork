import React, { useState, useEffect } from 'react';
import { 
  RiFilter3Line, 
  RiSearchLine, 
  RiLoader4Line, 
  RiSmartphoneLine, 
  RiAddLine 
} from 'react-icons/ri';
import { getUserJobs, cancelJob } from '../services/userJob.service';
import UserJobCard from '../components/UserJobCard';
import { CreateJobModal } from '../jobs/components/CreateJobModal';
import { CancelJobModal } from '../components/CancelJobModal';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const UserJobsPage: React.FC = () => {
    const navigate = useNavigate();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [jobToCancelId, setJobToCancelId] = useState<string | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterTab, setFilterTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const response = await getUserJobs();
            if (response.success) {
                setJobs(response.data);
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

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
                toast.success('Job cancelled successfully');
                setIsCancelModalOpen(false);
                setJobToCancelId(null);
                fetchJobs(); // Refresh list
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsCancelling(false);
        }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
        
        switch (filterTab) {
            case 'direct':
                return matchesSearch && job.visibility === 'private';
            case 'pending':
                return matchesSearch && (job.status === 'open' || job.status === 'partially_assigned');
            case 'ongoing':
                return matchesSearch && (job.status === 'fully_assigned' || job.status === 'in_progress');
            case 'cancelled':
                return matchesSearch && job.status === 'cancelled';
            case 'completed':
                return matchesSearch && job.status === 'completed';
            default:
                return matchesSearch;
        }
    });

    const counts = {
        all: jobs.length,
        direct: jobs.filter(j => j.visibility === 'private').length,
        pending: jobs.filter(j => j.status === 'open' || j.status === 'partially_assigned').length,
        ongoing: jobs.filter(j => j.status === 'fully_assigned' || j.status === 'in_progress').length,
    };

    return (
        <div className="qw-page-container">
            {/* Page Header */}
            <div className="qw-page-header mb-5">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-4">
                    <div>
                        <nav aria-label="breadcrumb" className="mb-2">
                           <ol className="breadcrumb mb-0" style={{ fontSize: '12px' }}>
                             <li className="breadcrumb-item"><Link to="/user" className="text-decoration-none text-muted">Dashboard</Link></li>
                             <li className="breadcrumb-item active" aria-current="page">My Jobs</li>
                           </ol>
                        </nav>
                        <h1 className="qw-display-title mb-2">My Job Postings</h1>
                        <p className="qw-subtitle">
                          Manage and track your active service requests in real-time.
                        </p>
                    </div>
                    <button onClick={() => setIsCreateModalOpen(true)} className="qw-btn-primary" style={{ border: 'none', cursor: 'pointer' }}>
                        <RiAddLine size={22} /> Create New Job
                    </button>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="qw-action-bar mb-4">
                <div className="qw-tabs-wrapper">
                    {[
                        { id: 'all', label: 'All Jobs', count: counts.all },
                        { id: 'direct', label: 'Direct Hires', count: counts.direct },
                        { id: 'pending', label: 'Pending', count: counts.pending },
                        { id: 'ongoing', label: 'Ongoing', count: counts.ongoing },
                        { id: 'completed', label: 'Completed' },
                        { id: 'cancelled', label: 'Cancelled' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            className={`qw-tab-btn ${filterTab === tab.id ? 'active' : ''}`}
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

            {/* Results Summary */}
            <div className="d-flex align-items-center gap-2 mb-4 px-1" style={{ fontSize: '13px', color: '#64748b' }}>
                <RiFilter3Line size={16} /> 
                <span>Showing <span className="fw-bold text-dark">{filteredJobs.length}</span> results for <span className="fw-bold text-primary">{filterTab.toUpperCase()}</span></span>
            </div>

            {/* Jobs Grid */}
            <div className="row g-4">
                {loading ? (
                    <div className="col-12 d-flex flex-column align-items-center justify-content-center py-5">
                        <RiLoader4Line size={48} className="text-primary qw-spin mb-3" />
                        <p className="text-muted fw-medium fs-5">Fetching your data...</p>
                    </div>
                ) : filteredJobs.length > 0 ? (
                    filteredJobs.map(job => (
                        <div key={job.id} className="col-12 col-md-6 col-xl-4 col-xxl-3">
                            <UserJobCard 
                              job={job} 
                              onCancel={triggerCancelJob}
                              onView={(id) => navigate(`/user/jobs/${id}`)} 
                            />
                        </div>
                    ))
                ) : (
                    <div className="col-12">
                        <div className="qw-empty-state">
                            <RiSmartphoneLine size={64} className="qw-empty-icon mb-4" />
                            <h3 className="fw-bold text-dark mb-2">No jobs to display</h3>
                            <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '400px' }}>
                                {searchTerm ? `We couldn't find any jobs matching "${searchTerm}" in the ${filterTab} category.` : `You haven't posted any jobs under ${filterTab} yet.`}
                            </p>
                            {!searchTerm && filterTab === 'all' && (
                                <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary btn-lg rounded-pill px-5 fw-bold shadow-sm">
                                    Start Posting
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

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
                    letter-spacing: -0.04em;
                }

                .qw-subtitle {
                    color: #64748b;
                    font-size: 1.1rem;
                    max-width: 500px;
                }

                .qw-btn-primary {
                    background: #0f172a;
                    color: white;
                    padding: 14px 28px;
                    border-radius: 18px;
                    font-weight: 700;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    box-shadow: 0 10px 20px -10px rgba(15, 23, 42, 0.3);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .qw-btn-primary:hover {
                    background: #1e293b;
                    transform: translateY(-2px);
                    color: white;
                }

                .qw-action-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: white;
                    padding: 8px;
                    border-radius: 24px;
                    border: 1px solid rgba(15, 23, 42, 0.05);
                    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .qw-tabs-wrapper {
                    display: flex;
                    gap: 4px;
                    overflow-x: auto;
                    padding: 4px;
                    scrollbar-width: none;
                }

                .qw-tab-btn {
                    padding: 10px 20px;
                    border-radius: 16px;
                    border: none;
                    background: transparent;
                    color: #64748b;
                    font-weight: 700;
                    font-size: 13.5px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s;
                    white-space: nowrap;
                }

                .qw-tab-btn.active {
                    background: #f1f5f9;
                    color: #0f172a;
                }

                .qw-tab-count {
                    background: #ffffff;
                    color: #64748b;
                    font-size: 10px;
                    padding: 2px 8px;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                }

                .qw-tab-btn.active .qw-tab-count {
                    background: #0f172a;
                    color: white;
                    border-color: #0f172a;
                }

                .qw-search-wrapper {
                    position: relative;
                    flex: 1;
                    min-width: 250px;
                    max-width: 400px;
                    margin-left: auto;
                }

                .qw-search-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                }

                .qw-search-input {
                    width: 100%;
                    padding: 12px 16px 12px 48px;
                    border-radius: 16px;
                    border: 1px solid #f1f5f9;
                    background: #f8fafc;
                    font-size: 14px;
                    font-family: inherit;
                    transition: all 0.2s;
                }

                .qw-search-input:focus {
                    outline: none;
                    border-color: #6366f1;
                    background: white;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.08);
                }

                .qw-empty-state {
                    text-align: center;
                    padding: 80px 20px;
                    background: white;
                    border-radius: 40px;
                    border: 2px dashed #e2e8f0;
                }

                .qw-empty-icon { color: #e2e8f0; }

                .qw-spin { animation: qwSpin 1.2s linear infinite; }

                @keyframes qwSpin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @media (max-width: 991px) {
                    .qw-page-container { padding: 24px; }
                    .qw-display-title { font-size: 2rem; }
                    .qw-search-wrapper { max-width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default UserJobsPage;
