import React from 'react';
import { 
    RiCloseLine, 
    RiUserLine, 
    RiMailLine, 
    RiPhoneLine, 
    RiFileCopyLine,
    RiVerifiedBadgeFill
} from 'react-icons/ri';
import { toast } from 'react-toastify';

interface ClientProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: {
        name: string;
        email?: string;
        phone?: string;
        initials: string;
        avatarUrl?: string;
        isVerified?: boolean;
    };
}

export const ClientProfileModal: React.FC<ClientProfileModalProps> = ({ isOpen, onClose, client }) => {
    if (!isOpen) return null;

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.info(`${label} copied to clipboard!`, { autoClose: 2000 });
    };

    return (
        <div className="modal-backdrop d-flex align-items-center justify-content-center p-3" style={{ position: 'fixed', inset: 0, zIndex: 1200, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.2s ease' }}>
            <div className="modal-content bg-white rounded-5 shadow-2xl overflow-hidden" style={{ maxWidth: 450, width: '100%', border: '1px solid #f1f5f9', animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                {/* Header/Banner */}
                <div className="p-4 pt-5 pb-5 text-center position-relative" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
                    <button 
                        onClick={onClose}
                        className="btn btn-link text-muted p-2 position-absolute" 
                        style={{ top: 16, right: 16, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}
                    >
                        <RiCloseLine size={20} />
                    </button>

                    <div className="d-inline-block position-relative mb-3">
                        {client.avatarUrl ? (
                            <img src={client.avatarUrl} alt={client.name} className="rounded-circle shadow-lg" style={{ width: 100, height: 100, objectFit: 'cover', border: '4px solid #fff' }} />
                        ) : (
                            <div className="rounded-circle shadow-lg d-flex align-items-center justify-content-center fw-bold text-white bg-primary" style={{ width: 100, height: 100, fontSize: '32px', border: '4px solid #fff' }}>
                                {client.initials}
                            </div>
                        )}
                        {client.isVerified && (
                            <div className="position-absolute bottom-0 end-0 bg-white rounded-circle p-0" style={{ transform: 'translate(10%, 10%)', color: '#3b82f6' }}>
                                <RiVerifiedBadgeFill size={28} />
                            </div>
                        )}
                    </div>
                    <h3 className="fw-800 mb-1" style={{ color: '#0f172a', fontFamily: 'Syne, sans-serif' }}>{client.name}</h3>
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle fw-bold rounded-pill px-3 py-2" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>JOB POSTER</span>
                </div>

                {/* Content */}
                <div className="p-4 p-lg-5">
                    <div className="mb-4">
                        <label className="text-muted small fw-bold text-uppercase mb-2 d-block" style={{ letterSpacing: '1px' }}>Contact Information</label>
                        
                        {/* Email */}
                        <div className="d-flex align-items-center gap-3 p-3 rounded-4 mb-2 border hover-bg-light transition-all cursor-pointer" onClick={() => client.email && copyToClipboard(client.email, 'Email')}>
                            <div className="bg-blue-50 text-blue-600 p-2 rounded-3">
                                <RiMailLine size={20} />
                            </div>
                            <div className="flex-grow-1 overflow-hidden">
                                <div className="text-muted" style={{ fontSize: '11px', fontWeight: 600 }}>Email Address</div>
                                <div className="fw-bold text-dark text-truncate small">{client.email || 'Not Provided'}</div>
                            </div>
                            {client.email && <RiFileCopyLine className="text-muted" size={16} />}
                        </div>

                        {/* Phone */}
                        <div className="d-flex align-items-center gap-3 p-3 rounded-4 border hover-bg-light transition-all cursor-pointer" onClick={() => client.phone && copyToClipboard(client.phone, 'Phone number')}>
                            <div className="bg-green-50 text-green-600 p-2 rounded-3">
                                <RiPhoneLine size={20} />
                            </div>
                            <div className="flex-grow-1">
                                <div className="text-muted" style={{ fontSize: '11px', fontWeight: 600 }}>Phone Number</div>
                                <div className="fw-bold text-dark small">{client.phone || 'Not Provided'}</div>
                            </div>
                            {client.phone && <RiFileCopyLine className="text-muted" size={16} />}
                        </div>
                    </div>

                    <p className="text-muted text-center italic small mb-0 px-4">
                        You can reach out to the client directly via the provided details or use the chat for coordination.
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .hover-bg-light:hover { background-color: #f8fafc; border-color: #cbd5e1 !important; }
                .bg-blue-50 { background-color: #eff6ff; }
                .text-blue-600 { color: #2563eb; }
                .bg-green-50 { background-color: #f0fdf4; }
                .text-green-600 { color: #16a34a; }
                .fw-800 { font-weight: 800; }
                .cursor-pointer { cursor: pointer; }
                .transition-all { transition: all 0.2s ease; }
            `}</style>
        </div>
    );
};
