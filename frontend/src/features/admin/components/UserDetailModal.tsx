import React from 'react';
import { ROLES } from '../../../constants/roles';

interface UserDetail {
    _id: string;
    id?: string;
    name: string;
    email: string;
    number?: string;
    role: ROLES;
    isBlocked: boolean;
    createdAt: string;
}

interface UserDetailModalProps {
    user: UserDetail;
    onClose: () => void;
    onToggleBlock: (userId: string) => Promise<void>;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose }) => {


    const getRoleBadgeClass = (role: ROLES) => {
        if (role === ROLES.PROVIDER) return "provider";
        if (role === ROLES.ADMIN) return "admin";
        return "user";
    };

    return (
        <div 
            className="confirm-modal-overlay" 
            style={{ zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={onClose}
        >
            <div 
                className="confirm-modal-card" 
                style={{ 
                    maxWidth: '500px', width: '95%', padding: '0', 
                    borderRadius: '24px', overflow: 'hidden',
                    display: 'flex', flexDirection: 'column'
                }} 
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Profile Section */}
                <div style={{
                    background: 'linear-gradient(135deg, #1e293b, #334155)',
                    padding: '32px', color: '#fff', position: 'relative', textAlign: 'center'
                }}>
                    <button 
                        onClick={onClose}
                        style={{
                            position: 'absolute', top: 20, right: 20,
                            background: 'rgba(255,255,255,0.1)', border: 'none',
                            borderRadius: '50%', width: 32, height: 32,
                            color: '#fff', cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>

                    <div style={{
                        width: 80, height: 80, borderRadius: '50%',
                        background: '#fff', color: '#1e293b', fontSize: 32,
                        fontWeight: 700, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', margin: '0 auto 16px',
                        border: '4px solid rgba(255,255,255,0.1)'
                    }}>
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    
                    <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px' }}>{user.name}</h2>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                            {user.role}
                        </span>
                        <span style={{ 
                            padding: '4px 12px', borderRadius: '20px', fontSize: 11,
                            fontWeight: 700, textTransform: 'uppercase',
                            background: user.isBlocked ? '#ef4444' : '#10b981', color: '#fff'
                        }}>
                            {user.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                    </div>
                </div>

                {/* Content Section */}
                <div style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <DetailRow icon="bi-envelope" label="Email" value={user.email} />
                        <DetailRow icon="bi-telephone" label="Phone" value={user.number || 'Not provided'} />
                        <DetailRow icon="bi-calendar-check" label="Joined On" value={new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
                    </div>
                </div>

               
            </div>
        </div>
    );
};

const DetailRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ 
            width: 40, height: 40, borderRadius: '12px', background: '#f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#64748b', fontSize: 18
        }}>
            <i className={`bi ${icon}`}></i>
        </div>
        <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>{label}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b' }}>{value}</div>
        </div>
    </div>
);

export default UserDetailModal;
