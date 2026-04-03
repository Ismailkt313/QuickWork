import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RiBriefcaseLine, 
  RiFilter3Line, 
  RiLoader4Line, 
  RiExternalLinkLine,
  RiInboxLine,
  RiSearchLine
} from 'react-icons/ri';
import { toast } from 'react-toastify';
import MyJobCard from '../components/MyJobCard';
import { getAssignments } from '../services/provider.service';

type TabType = 'active' | 'completed' | 'all';

const MyJobsPage: React.FC = () => {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterTab, setFilterTab] = useState<TabType>('active');
    const navigate = useNavigate();

    const fetchMyJobs = async () => {
        try {
            setLoading(true);
            const response = await getAssignments();
            if (response.success) {
                setAssignments(response.data);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch your jobs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyJobs();
    }, []);

    const filteredAssignments = assignments.filter(as => {
        if (filterTab === 'all') return true;
        if (filterTab === 'active') return as.workStatus === 'assigned' || as.workStatus === 'in_progress';
        if (filterTab === 'completed') return as.workStatus === 'completed';
        return true;
    });

    const activeCount = assignments.filter(as => as.workStatus === 'assigned' || as.workStatus === 'in_progress').length;
    const completedCount = assignments.filter(as => as.workStatus === 'completed').length;

    return (
        <div className="container-fluid py-4 px-lg-5" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
             <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
                <div>
                    <h1 className="display-6 fw-bold mb-2" style={{ color: '#0f172a', fontFamily: 'Syne, sans-serif', letterSpacing: '-1px' }}>
                        My Jobs
                    </h1>
                    <p className="text-muted mb-0 d-flex align-items-center gap-2" style={{ fontSize: '15px' }}>
                        <RiBriefcaseLine className="text-primary" /> 
                        Managing {assignments.length} assignments
                    </p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-white shadow-sm border rounded-3 px-3 py-2 d-flex align-items-center gap-2 bg-white" style={{ fontWeight: 600 }}>
                        <RiSearchLine /> Search
                    </button>
                    <button className="btn btn-primary rounded-3 px-4 py-2 shadow-lg d-flex align-items-center gap-2 fw-bold overflow-hidden transition-all hover-translate-x" style={{ letterSpacing: '0.02em' }}>
                        Available Marketplace <RiExternalLinkLine />
                    </button>
                </div>
            </div>

             <div className="row g-4 mb-5">
                <div className="col-12 col-xl-12">
                   <div className="bg-white p-2 rounded-4 shadow-sm border d-inline-flex gap-2 mb-4">
                        {[
                            { id: 'active', label: 'Active Jobs', count: activeCount },
                            { id: 'completed', label: 'Completed', count: completedCount },
                            { id: 'all', label: 'Full Log', count: assignments.length },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setFilterTab(tab.id as TabType)}
                                className={`px-4 py-2-5 rounded-3 fw-bold transition-all border-0 ${filterTab === tab.id ? 'bg-primary text-white shadow-md' : 'btn-light text-muted hover-bg-light'}`}
                                style={{ fontSize: '14px', whiteSpace: 'nowrap' }}
                            >
                                {tab.label} 
                                <span className={`ms-2 px-2 py-0-5 rounded-pill ${filterTab === tab.id ? 'bg-white text-primary' : 'bg-primary-subtle text-primary'}`} style={{ fontSize: '11px' }}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                   </div>

                    <div className="d-flex align-items-center justify-content-between text-muted mb-3 px-2">
                        <div className="d-flex align-items-center gap-2" style={{ fontSize: '13.5px' }}>
                            <RiFilter3Line /> Showing results for <span className="fw-bold text-dark">{filterTab.toUpperCase()}</span>
                        </div>
                   </div>

                    <div className="col-12 col-xl-10 mx-auto mt-4">
                        {loading ? (
                            <div className="d-flex flex-column align-items-center justify-content-center py-5">
                                <RiLoader4Line size={48} className="text-primary animate-spin mb-3" />
                                <p className="text-muted fw-semibold">Loading your assignments...</p>
                            </div>
                        ) : filteredAssignments.length === 0 ? (
                            <div className="text-center py-5 px-4 bg-white rounded-5 border border-dashed border-2 mt-4">
                                <div className="mb-4 d-inline-flex align-items-center justify-content-center" style={{ width: 80, height: 80, borderRadius: 24, background: '#f1f5f9', color: '#94a3b8' }}>
                                    <RiInboxLine size={40} />
                                </div>
                                <h3 className="fw-bold text-dark" style={{ fontFamily: 'Syne, sans-serif' }}>No jobs in this category</h3>
                                <p className="text-muted mx-auto mb-4" style={{ maxWidth: 360 }}>
                                    {filterTab === 'active' 
                                        ? "You don't have any active jobs at the moment. Try browsing the marketplace for new opportunities!" 
                                        : "You haven't completed any jobs yet. Your history will appear here once you finish your first assignment."
                                    }
                                </p>
                                <button className="btn btn-primary px-5 py-3 rounded-pill fw-bold shadow-lg" onClick={() => navigate('/provider/available-jobs')}>
                                    Find New Jobs <RiExternalLinkLine className="ms-1" />
                                </button>
                            </div>
                        ) : (
                            <div className="animate-in fade-in duration-700">
                                {filteredAssignments.map(as => (
                                    <MyJobCard 
                                        key={as.id} 
                                        assignment={as}
                                        onViewDetails={(id) => navigate(`/provider/assignment/${id}`)}
                                    />
                                ))}
                            </div>
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
            `}</style>
        </div>
    );
};

export default MyJobsPage;
