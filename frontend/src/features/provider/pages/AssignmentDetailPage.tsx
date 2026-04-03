import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  RiArrowLeftLine, 
  RiTimeLine, 
  RiMapPinLine, 
  RiMoneyDollarCircleLine,
  RiCheckboxCircleLine,
  RiPlayCircleLine,
  RiHistoryLine,
  RiMessage2Line,
  RiLoader4Line,
  RiInformationLine,
  RiAttachmentLine,
  RiCloseLine
} from 'react-icons/ri';
import { toast } from 'react-toastify';
import { getAssignmentById, updateAssignmentStatus, submitAssignmentProof } from '../services/provider.service';
import SubmitProofModal from '../components/SubmitProofModal';
import JobLogModal from '../components/JobLogModal';

const AssignmentDetailPage: React.FC = () => {
    const { assignmentId } = useParams() as { assignmentId: string };
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isProofModalOpen, setIsProofModalOpen] = useState(false);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchAssignment = async () => {
        try {
            setLoading(true);
            const response = await getAssignmentById(assignmentId);
            if (response.success) {
                setAssignment(response.data);
            }
        } catch (error: any) {
            console.error('Full Error Object:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch assignment details';
            const errorData = error.response?.data ? JSON.stringify(error.response.data, null, 2) : 'No extra data';
            toast.error(
                <div>
                    <strong>{errorMsg}</strong>
                    <pre style={{ fontSize: '10px', marginTop: '10px', maxHeight: '100px', overflow: 'auto' }}>
                        {errorData}
                    </pre>
                </div>, 
                { autoClose: 8000 }
            );
            navigate('/provider/my-jobs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignment();
    }, [assignmentId]);

    const handleStatusUpdate = async (newStatus: string) => {
        try {
            setActionLoading(true);
            const response = await updateAssignmentStatus(assignmentId, newStatus);
            if (response.success) {
                toast.success(`Job marked as ${newStatus.replace('_', ' ')}`);
                fetchAssignment();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSubmitProof = async (data: { images: string[], description: string }) => {
        try {
            setActionLoading(true);
            const response = await submitAssignmentProof(assignmentId, data);
            if (response.success) {
                toast.success('Work proof submitted and job marked as completed!');
                fetchAssignment();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to submit proof');
        } finally {
            setActionLoading(false);
        }
    };

    const handleMessage = () => {
        navigate(`/provider/messages?clientId=${assignment?.job?.clientName}`);
    };

    if (loading) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '70vh' }}>
                <RiLoader4Line size={48} className="text-primary animate-spin" />
            </div>
        );
    }

    if (!assignment) return null;

    const { job, workStatus, schedule } = assignment;
    
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'assigned': return { color: '#6366f1', bg: '#eef2ff', text: 'Confirmed', icon: <RiCheckboxCircleLine /> };
            case 'in_progress': return { color: '#f59e0b', bg: '#fffbeb', text: 'In Progress', icon: <RiPlayCircleLine /> };
            case 'completed': return { color: '#10b981', bg: '#ecfdf5', text: 'Completed', icon: <RiCheckboxCircleLine /> };
            case 'cancelled': return { color: '#ef4444', bg: '#fef2f2', text: 'Cancelled', icon: <RiCloseLine /> };
            default: return { color: '#94a3b8', bg: '#f8fafc', text: status, icon: <RiInformationLine /> };
        }
    };

    const statusConfig = getStatusConfig(workStatus);

    return (
        <div className="py-4 px-3 px-lg-5 animate-in">
            {/* Header / Breadcrumb */}
            <div className="d-flex align-items-center justify-content-between mb-4">
                <button 
                  className="btn btn-link text-decoration-none p-0 d-flex align-items-center gap-2 text-muted fw-bold hover-translate-x"
                  onClick={() => navigate('/provider/my-jobs')}
                  style={{ transition: 'all 0.2s' }}
                >
                    <RiArrowLeftLine size={20} /> Back to My Jobs
                </button>
                <div 
                  className="px-3 py-1-5 rounded-pill d-flex align-items-center gap-2"
                  style={{ backgroundColor: statusConfig.bg, color: statusConfig.color, fontWeight: 700, fontSize: '13px' }}
                >
                    {statusConfig.icon} {statusConfig.text.toUpperCase()}
                </div>
            </div>

            <div className="row g-4">
                {/* Main Content Column */}
                <div className="col-12 col-xl-8">
                    {/* Job Card Detail Pages Header Body Title  */}
                   <div className="bg-white p-5 rounded-5 shadow-sm border border-f1f5f9 mb-4 overflow-hidden position-relative">
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: statusConfig.color }} />
                        
                        <div className="d-flex flex-wrap gap-2 mb-3">
                            {job.isUrgent && <span className="badge bg-danger-subtle text-danger px-3 py-2 rounded-2 fw-bold">Urgent</span>}
                            <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-2 fw-bold">{job.durationType.replace('_', ' ')}</span>
                        </div>

                        <h1 className="fw-bold mb-4" style={{ fontFamily: 'Syne, sans-serif', fontSize: '2.5rem', letterSpacing: '-1px', color: '#0f172a' }}>
                            {job.title}
                        </h1>

                        <div className="d-flex flex-wrap gap-4 mb-5">
                            <div className="d-flex align-items-center gap-2 text-muted">
                                <div className="p-2 bg-light rounded-3 text-primary"><RiMapPinLine size={20} /></div>
                                <span className="fw-bold">{job.location}</span>
                            </div>
                            <div className="d-flex align-items-center gap-2 text-muted">
                                <div className="p-2 bg-light rounded-3 text-success"><RiMoneyDollarCircleLine size={20} /></div>
                                <span className="fw-bold">{job.budget}</span>
                            </div>
                            <div className="d-flex align-items-center gap-2 text-muted">
                                <div className="p-2 bg-light rounded-3 text-warning"><RiTimeLine size={20} /></div>
                                <span className="fw-bold text-dark">{new Date(schedule.startDate).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="mb-5">
                            <h5 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2">
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }} />
                                Description
                            </h5>
                            <p className="text-muted" style={{ lineHeight: 1.8, fontSize: '16px' }}>
                                {job.description}
                            </p>
                        </div>

                        {/* Proof Section (If Completed) */}
                        {workStatus === 'completed' && assignment.proof && (
                            <div className="p-4 bg-muted-light rounded-4 border border-f1f5f9">
                                <h5 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2">
                                    <RiAttachmentLine className="text-primary" /> Completion Proof
                                </h5>
                                <p className="text-muted mb-3 italic">"{assignment.proofDescription || 'No description provided.'}"</p>
                                <div className="d-flex flex-wrap gap-3">
                                    {assignment.proof.map((img: string, i: number) => (
                                        <div key={i} className="rounded-3 overflow-hidden border" style={{ width: 120, height: 120 }}>
                                            <img src={img} alt="Proof" className="w-100 h-100 object-fit-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Co-workers Section */}
                    {assignment.coWorkers && assignment.coWorkers.length > 0 && (
                        <div className="bg-white p-5 rounded-5 shadow-sm border border-f1f5f9 mb-4">
                            <h5 className="fw-bold mb-4 text-dark d-flex align-items-center gap-2">
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                                Co-workers
                            </h5>
                            <div className="row g-3">
                                {assignment.coWorkers.map((worker: any) => (
                                    <div key={worker.id} className="col-12 col-md-6">
                                        <div className="p-3 rounded-4 border bg-light d-flex align-items-center gap-3">
                                            <div className="position-relative">
                                                <img 
                                                    src={worker.profileImage || 'https://via.placeholder.com/150'} 
                                                    alt={worker.name} 
                                                    className="rounded-circle object-fit-cover shadow-sm border border-2 border-white"
                                                    style={{ width: 48, height: 48 }}
                                                />
                                                <div 
                                                    className="position-absolute bottom-0 end-0 rounded-circle border border-2 border-white"
                                                    style={{ 
                                                        width: 12, 
                                                        height: 12, 
                                                        background: worker.workStatus === 'completed' ? '#10b981' : 
                                                                    worker.workStatus === 'in_progress' ? '#f59e0b' : '#6366f1' 
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-grow-1 overflow-hidden">
                                                <h6 className="mb-0 fw-bold text-dark text-truncate">{worker.name}</h6>
                                                <p className="mb-0 text-muted small text-truncate">{worker.headline || 'Provider'}</p>
                                            </div>
                                            <div 
                                                className="small fw-bold text-uppercase px-2 py-1 rounded"
                                                style={{ 
                                                    fontSize: '9px',
                                                    backgroundColor: worker.workStatus === 'completed' ? '#ecfdf5' : 
                                                                    worker.workStatus === 'in_progress' ? '#fffbeb' : '#eef2ff',
                                                    color: worker.workStatus === 'completed' ? '#10b981' : 
                                                            worker.workStatus === 'in_progress' ? '#f59e0b' : '#6366f1'
                                                }}
                                            >
                                                {worker.workStatus.replace('_', ' ')}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Action Column */}
                <div className="col-12 col-xl-4">
                    {/* Client & Actions Card */}
                    <div className="bg-white p-4 rounded-5 shadow-sm border border-f1f5f9 mb-4 sticky-top" style={{ top: 20 }}>
                        <h5 className="fw-bold mb-4 text-dark" style={{ fontFamily: 'Syne, sans-serif' }}>Project Dashboard</h5>
                        
                        {/* Client Info */}
                        <div className="p-4 bg-light rounded-4 mb-4 d-flex align-items-center gap-3">
                            <div 
                              className="d-flex align-items-center justify-content-center fw-bold bg-primary text-white" 
                              style={{ width: 56, height: 56, borderRadius: 18, fontSize: '1.25rem' }}
                            >
                                {job.clientInitials || '??'}
                            </div>
                            <div>
                                <p className="mb-0 text-muted small fw-bold text-uppercase">Client</p>
                                <p className="mb-0 fw-bold text-dark">{job.clientName || 'Anonymous'}</p>
                            </div>
                            <button className="btn btn-primary-subtle ms-auto rounded-3 p-2 text-primary border-0" onClick={handleMessage}>
                                <RiMessage2Line size={24} />
                            </button>
                        </div>

                        <hr className="my-4 opacity-50" />

                        {/* Workflow Actions */}
                        <div className="d-grid gap-3">
                            {workStatus === 'assigned' && (
                                <>
                                    <div className="p-3 bg-blue-50 rounded-4 border border-blue-100 mb-2">
                                        <div className="d-flex align-items-center gap-2 mb-2 text-primary fw-bold small">
                                            <RiInformationLine /> NEXT STEP
                                        </div>
                                        <p className="small text-muted mb-0">Commence the work to let the client know you've started.</p>
                                    </div>
                                    <button 
                                      className="btn btn-primary py-3 rounded-4 fw-bold shadow-lg d-flex align-items-center justify-content-center gap-2"
                                      onClick={() => handleStatusUpdate('in_progress')}
                                      disabled={actionLoading}
                                    >
                                        {actionLoading ? <RiLoader4Line className="animate-spin" /> : <RiPlayCircleLine size={20} />}
                                        Commence Job
                                    </button>
                                </>
                            )}

                            {workStatus === 'in_progress' && (
                                <>
                                    <div className="p-3 bg-orange-50 rounded-4 border border-orange-100 mb-2">
                                        <div className="d-flex align-items-center gap-2 mb-2 text-warning fw-bold small">
                                            <RiHistoryLine /> CURRENTLY ACTIVE
                                        </div>
                                        <p className="small text-muted mb-0">Provide proof of work after finishing the tasks to complete the job.</p>
                                    </div>
                                    <button 
                                      className="btn btn-success py-3 rounded-4 fw-bold shadow-lg d-flex align-items-center justify-content-center gap-2"
                                      onClick={() => setIsProofModalOpen(true)}
                                      disabled={actionLoading}
                                    >
                                        {actionLoading ? <RiLoader4Line className="animate-spin" /> : <RiCheckboxCircleLine size={20} />}
                                        Submit Proof & Finish
                                    </button>
                                </>
                            )}

                            {workStatus === 'completed' && (
                                <div className="p-4 bg-green-50 rounded-4 border border-green-100 text-center">
                                    <div className="mb-3 text-success d-inline-flex p-3 bg-white rounded-circle shadow-sm">
                                        <RiCheckboxCircleLine size={32} />
                                    </div>
                                    <h6 className="fw-bold text-success mb-2">Job Successfully Completed</h6>
                                    <p className="small text-muted mb-0">Payment verification is pending from the client side.</p>
                                </div>
                            )}

                            <button 
                                className="btn btn-light py-3 rounded-4 fw-bold text-muted border-0 hover-opacity d-flex align-items-center justify-content-center gap-2"
                                onClick={() => setIsLogModalOpen(true)}
                            >
                                <RiHistoryLine size={20} /> View Log
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <SubmitProofModal 
              isOpen={isProofModalOpen} 
              onClose={() => setIsProofModalOpen(false)} 
              onSubmit={handleSubmitProof}
              jobTitle={job.title}
            />

            <JobLogModal 
              isOpen={isLogModalOpen} 
              onClose={() => setIsLogModalOpen(false)} 
              assignment={assignment} 
            />

            <style>{`
                .animate-in { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .bg-blue-50 { background-color: #eff6ff; }
                .border-blue-100 { border-color: #dbeafe; }
                .bg-orange-50 { background-color: #fffbeb; }
                .border-orange-100 { border-color: #fef3c7; }
                .bg-green-50 { background-color: #f0fdf4; }
                .border-green-100 { border-color: #dcfce7; }
                .hover-translate-x:hover { transform: translateX(-4px); }
                .italic { font-style: italic; }
            `}</style>
        </div>
    );
};

export default AssignmentDetailPage;
