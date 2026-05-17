import React from 'react';
import { JOB_STATUS } from '../../../../constants/jobStatus';

interface AdminJobStatusBadgeProps {
  status: string;
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string; text: string; border: string }> = {
  [JOB_STATUS.OPEN]: {
    label: 'Open',
    dot: '#22c55e',
    bg: '#f0fdf4',
    text: '#15803d',
    border: '#bbf7d0',
  },
  [JOB_STATUS.PARTIALLY_ASSIGNED]: {
    label: 'Partial',
    dot: '#3b82f6',
    bg: '#eff6ff',
    text: '#1d4ed8',
    border: '#bfdbfe',
  },
  [JOB_STATUS.FULLY_ASSIGNED]: {
    label: 'Assigned',
    dot: '#6366f1',
    bg: '#eef2ff',
    text: '#4338ca',
    border: '#c7d2fe',
  },
  [JOB_STATUS.IN_PROGRESS]: {
    label: 'In Progress',
    dot: '#f59e0b',
    bg: '#fffbeb',
    text: '#b45309',
    border: '#fde68a',
  },
  [JOB_STATUS.COMPLETED]: {
    label: 'Completed',
    dot: '#64748b',
    bg: '#f8fafc',
    text: '#475569',
    border: '#e2e8f0',
  },
  [JOB_STATUS.CANCELLED]: {
    label: 'Cancelled',
    dot: '#ef4444',
    bg: '#fef2f2',
    text: '#b91c1c',
    border: '#fecaca',
  },
  [JOB_STATUS.REJECTED]: {
    label: 'Rejected',
    dot: '#f97316',
    bg: '#fff7ed',
    text: '#c2410c',
    border: '#fed7aa',
  },
  [JOB_STATUS.EXPIRED]: {
    label: 'Expired',
    dot: '#6b7280',
    bg: '#f3f4f6',
    text: '#374151',
    border: '#d1d5db',
  },
};

export const AdminJobStatusBadge: React.FC<AdminJobStatusBadgeProps> = ({ status }) => {
  const config = STATUS_CONFIG[status] || {
    label: status,
    dot: '#94a3b8',
    bg: '#f8fafc',
    text: '#64748b',
    border: '#e2e8f0',
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 20,
        background: config.bg,
        border: `1.5px solid ${config.border}`,
        fontSize: 11,
        fontWeight: 700,
        color: config.text,
        fontFamily: "'Outfit', sans-serif",
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: config.dot,
          flexShrink: 0,
          display: 'inline-block',
        }}
      />
      {config.label}
    </span>
  );
};
