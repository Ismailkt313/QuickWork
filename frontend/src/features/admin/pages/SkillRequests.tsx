import React, { useEffect, useState } from "react";
import {
    getPendingServiceRequests,
    approveServiceRequest,
    rejectServiceRequest
} from "../services/adminServiceRequest.service";
import type { ServiceRequest } from "../services/adminServiceRequest.service";
import { toast } from "react-toastify";

const SkillRequests: React.FC = () => {
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [selectedRejectId, setSelectedRejectId] = useState<string | null>(null);

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const data = await getPendingServiceRequests();
            setRequests(data);
        } catch (error) {
            console.error("Failed to fetch skills", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (id: string, skillName: string) => {
        if (!window.confirm(`Are you sure you want to approve "${skillName}"? This will add it to the global skills list.`)) return;

        setActionLoadingId(id);
        try {
            await approveServiceRequest(id);
            setRequests(prev => prev.filter(r => r._id !== id));
            toast.success(`Skill "${skillName}" approved successfully!`);
        } catch (error: any) {
            toast.error(error.message || "Failed to approve skill");
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleReject = async () => {
        if (!selectedRejectId || !rejectionReason.trim()) return;

        setActionLoadingId(selectedRejectId);
        try {
            await rejectServiceRequest(selectedRejectId, rejectionReason);
            setRequests(prev => prev.filter(r => r._id !== selectedRejectId));
            setSelectedRejectId(null);
            setRejectionReason("");
            toast.success("Skill request rejected.");
        } catch (error: any) {
            toast.error(error.message || "Failed to reject skill");
        } finally {
            setActionLoadingId(null);
        }
    };

    return (
        <div className="container-fluid py-4" style={{ maxWidth: "1200px" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold mb-1">Global Skill Requests</h3>
                    <p className="text-secondary small mb-0">Review new skill requests submitted by Service Providers.</p>
                </div>
                <button
                    className="btn btn-outline-primary btn-sm rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2"
                    onClick={fetchRequests}
                    disabled={isLoading}
                >
                    <i className={`bi bi-arrow-clockwise ${isLoading ? 'spin' : ''}`}></i>
                    Refresh List
                </button>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                {isLoading && requests.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="mt-3 text-muted">Loading pending requests...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center p-4 mb-3" style={{ width: "80px", height: "80px" }}>
                            <i className="bi bi-inbox fs-1 text-secondary"></i>
                        </div>
                        <h5 className="fw-bold">No Pending Requests</h5>
                        <p className="text-secondary small">All provider-submitted skill requests have been reviewed.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="py-3 px-4 text-secondary small fw-bold">REQUESTED SKILL</th>
                                    <th className="py-3 text-secondary small fw-bold">REQUESTED BY</th>
                                    <th className="py-3 text-secondary small fw-bold">DATE</th>
                                    <th className="py-3 text-secondary small fw-bold text-end pe-4">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                        {requests.map(request => (
                                    console.log(request),
                                    <tr key={request._id} className="border-bottom">
                                        <td className="px-4 py-3">
                                            <div className="d-flex align-items-center">
                                                <div
                                                    className="bg-primary bg-opacity-10 text-primary rounded d-flex align-items-center justify-content-center me-3"
                                                    style={{ width: "40px", height: "40px" }}
                                                >
                                                    <i className="bi bi-briefcase fw-bold fs-5"></i>
                                                </div>
                                                <div>
                                                    <h6 className="mb-0 fw-bold">{request.name}</h6>
                                                    <span className="badge bg-warning text-dark bg-opacity-25 rounded-pill border border-warning border-opacity-50 small mt-1">Pending Review</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center text-secondary fw-bold border" style={{ width: "52px", height: "32px", fontSize: "14px" }}>
                                                    {request.requestedBy?.name || "U"}
                                                </div>
                                                <div>
                                                    <p className="mb-0 small fw-medium text-dark">{request.userId?.firstName} {request.userId?.lastName}</p>
                                                    <p className="mb-0 file-text text-muted" style={{ fontSize: "12px" }}>{request.userId?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 text-secondary small">
                                            {new Date(request.createdAt).toLocaleDateString("en-IN", {
                                                day: 'numeric', month: 'short', year: 'numeric'
                                            })}
                                        </td>
                                        <td className="py-3 px-4 text-end">
                                            {actionLoadingId === request._id ? (
                                                <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                                            ) : (
                                                <div className="d-flex justify-content-end gap-2">
                                                    <button
                                                        className="btn btn-sm btn-outline-danger fw-bold rounded-pill px-3"
                                                        onClick={() => setSelectedRejectId(request._id)}
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#rejectModal"
                                                    >
                                                        Reject
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-primary fw-bold rounded-pill px-3"
                                                        onClick={() => handleApprove(request._id, request.name)}
                                                    >
                                                        Approve
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="modal fade" id="rejectModal" tabIndex={-1} aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content rounded-4 border-0 shadow">
                        <div className="modal-header border-bottom-0 pb-0">
                            <h5 className="modal-title fw-bold">Reject Skill Request</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" onClick={() => setSelectedRejectId(null)}></button>
                        </div>
                        <div className="modal-body">
                            <label className="form-label fw-bold small text-secondary">Reason for Rejection (Visible to Provider)</label>
                            <textarea
                                className="form-control bg-light border-0"
                                rows={3}
                                placeholder="E.g. Skill name is too generic, please be specific."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            ></textarea>
                        </div>
                        <div className="modal-footer border-top-0 pt-0">
                            <button
                                type="button"
                                className="btn btn-light rounded-pill px-4 fw-bold"
                                data-bs-dismiss="modal"
                                onClick={() => setSelectedRejectId(null)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger rounded-pill px-4 fw-bold"
                                data-bs-dismiss="modal"
                                onClick={handleReject}
                                disabled={!rejectionReason.trim()}
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}} />
        </div>
    );
};

export default SkillRequests;
