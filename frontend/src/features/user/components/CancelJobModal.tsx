import React, { useEffect, useRef } from 'react';
import { FiAlertOctagon } from 'react-icons/fi';

interface CancelJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isCancelling?: boolean;
}

export const CancelJobModal: React.FC<CancelJobModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    isCancelling = false
}) => {
    const backdropRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            ref={backdropRef}
            onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
            style={{
                position: 'fixed', inset: 0, zIndex: 1200,
                background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'qwFadeIn 0.2s ease',
            }}
        >
            <div
                style={{
                    background: '#fff', borderRadius: 24, width: '100%', maxWidth: 420,
                    overflow: 'hidden', display: 'flex', flexDirection: 'column',
                    boxShadow: '0 25px 70px rgba(0,0,0,0.25)',
                    animation: 'qwSlideUp 0.3s cubic-bezier(.34,1.56,.64,1)',
                    margin: '20px',
                    position: 'relative'
                }}
            >
                <div style={{ padding: '32px 32px 24px', textAlign: 'center' }}>
                    <div style={{ 
                        width: 64, height: 64, borderRadius: '50%', 
                        background: '#fee2e2', color: '#ef4444', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        fontSize: 32, margin: '0 auto 20px',
                        boxShadow: '0 0 0 8px rgba(239, 68, 68, 0.1)'
                    }}>
                        <FiAlertOctagon />
                    </div>
                    
                    <h4 style={{ margin: '0 0 8px', fontWeight: 800, fontSize: 22, color: '#0f172a', fontFamily: 'Syne, sans-serif', letterSpacing: '-0.5px' }}>
                        Cancel this job?
                    </h4>
                    <p style={{ margin: 0, fontSize: 14.5, color: '#64748b', lineHeight: 1.5 }}>
                        Are you sure you want to cancel this job? This action cannot be undone. If any provider was already assigned, they will be notified and the assignment will be removed.
                    </p>
                </div>

                <div style={{ padding: '24px 32px', background: '#f8fafc', display: 'flex', gap: 12, borderTop: '1px solid #f1f5f9' }}>
                    <button 
                        onClick={onClose} 
                        disabled={isCancelling}
                        style={{ 
                            flex: 1, padding: '12px', borderRadius: 14, 
                            background: '#fff', color: '#475569', fontWeight: 600, 
                            border: '1px solid #e2e8f0', transition: 'all 0.2s',
                            cursor: isCancelling ? 'not-allowed' : 'pointer',
                            opacity: isCancelling ? 0.7 : 1
                        }}
                    >
                        Keep Job
                    </button>
                    <button 
                        onClick={onConfirm} 
                        disabled={isCancelling}
                        style={{ 
                            flex: 1, padding: '12px', borderRadius: 14, 
                            background: '#ef4444', color: '#fff', fontWeight: 600, 
                            border: 'none', transition: 'all 0.2s',
                            boxShadow: '0 4px 12px rgba(239,68,68,0.25)',
                            cursor: isCancelling ? 'not-allowed' : 'pointer',
                            opacity: isCancelling ? 0.7 : 1
                        }}
                    >
                        {isCancelling ? 'Cancelling...' : 'Yes, Cancel Job'}
                    </button>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes qwFadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes qwSlideUp { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
            `}} />
        </div>
    );
};
