import React from 'react';
import { RiBriefcase4Line, RiFlashlightLine, RiPulseLine } from 'react-icons/ri';

interface AdminJobHeaderProps {
  stats: {
    total: number;
    active: number;
  };
}

export const AdminJobHeader: React.FC<AdminJobHeaderProps> = ({ stats }) => {
  return (
    <div className="mb-8 font-['Outfit']">
      {/* Page title row */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 18,
                boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                flexShrink: 0,
              }}
            >
              <RiBriefcase4Line size={20} />
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 26,
                fontWeight: 900,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}
            >
              Jobs Management
            </h1>
          </div>
          <p
            style={{
              margin: 0,
              paddingLeft: 52,
              fontSize: 13,
              color: '#64748b',
              fontWeight: 500,
            }}
          >
            Monitor, review, and moderate all platform jobs
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Jobs */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              flexShrink: 0,
            }}
          >
            <RiBriefcase4Line size={18} />
          </div>
          <div>
            <div
              style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}
            >
              {stats.total.toLocaleString()}
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginTop: 3,
              }}
            >
              Total Jobs
            </div>
          </div>
        </div>

        {/* Active Jobs */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
            border: '1px solid #bbf7d0',
            borderRadius: 16,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: '#dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#16a34a',
              flexShrink: 0,
            }}
          >
            <RiFlashlightLine size={18} />
          </div>
          <div>
            <div
              style={{ fontSize: 22, fontWeight: 900, color: '#15803d', lineHeight: 1 }}
            >
              {stats.active.toLocaleString()}
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#4ade80',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginTop: 3,
              }}
            >
              Active Now
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div
          style={{
            background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
            border: '1px solid #bfdbfe',
            borderRadius: 16,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: '#dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb',
              flexShrink: 0,
            }}
          >
            <RiPulseLine size={18} />
          </div>
          <div>
            <div
              style={{ fontSize: 22, fontWeight: 900, color: '#1d4ed8', lineHeight: 1 }}
            >
              {stats.total > 0
                ? `${Math.round((stats.active / stats.total) * 100)}%`
                : '0%'}
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#93c5fd',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginTop: 3,
              }}
            >
              Active Rate
            </div>
          </div>
        </div>

        {/* Inactive */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: '#fef9c3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ca8a04',
              flexShrink: 0,
            }}
          >
            <RiBriefcase4Line size={18} />
          </div>
          <div>
            <div
              style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}
            >
              {Math.max(0, stats.total - stats.active).toLocaleString()}
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginTop: 3,
              }}
            >
              Inactive
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
