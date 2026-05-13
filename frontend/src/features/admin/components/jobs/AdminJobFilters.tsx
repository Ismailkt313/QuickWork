import React from 'react';
import { RiSearchLine, RiFilterLine, RiCloseLine } from 'react-icons/ri';
import type { AdminJobFilters as FilterType } from '../../services/adminJobApi';

interface AdminJobFiltersProps {
  filters: FilterType;
  setFilters: (filters: FilterType) => void;
  onClear: () => void;
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'partially_assigned', label: 'Partially Assigned' },
  { value: 'fully_assigned', label: 'Fully Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const AdminJobFilters: React.FC<AdminJobFiltersProps> = ({
  filters,
  setFilters,
  onClear,
}) => {
  const hasActiveFilters = !!(filters.search || filters.status);

  return (
    <div
      className="font-['Outfit']"
      style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 10,
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 0 }}>
          <RiSearchLine
            size={16}
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Search by job ID, title, or client name…"
            value={filters.search || ''}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value, page: 1 })
            }
            style={{
              width: '100%',
              height: 40,
              paddingLeft: 40,
              paddingRight: 14,
              border: '1.5px solid #e2e8f0',
              borderRadius: 10,
              fontSize: 13,
              fontFamily: 'inherit',
              fontWeight: 500,
              color: '#0f172a',
              background: '#fff',
              outline: 'none',
              transition: 'border-color 0.15s, box-shadow 0.15s',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#6366f1';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Status filter */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <RiFilterLine
            size={14}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              pointerEvents: 'none',
            }}
          />
          <select
            value={filters.status || ''}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value, page: 1 })
            }
            style={{
              height: 40,
              paddingLeft: 34,
              paddingRight: 32,
              border: '1.5px solid #e2e8f0',
              borderRadius: 10,
              fontSize: 13,
              fontFamily: 'inherit',
              fontWeight: 600,
              color: '#334155',
              background: '#fff',
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none',
              WebkitAppearance: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#6366f1';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {/* Chevron */}
          <svg
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: '#94a3b8',
            }}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {/* Clear button — only when filters are active */}
        {hasActiveFilters && (
          <button
            onClick={onClear}
            style={{
              height: 40,
              paddingLeft: 14,
              paddingRight: 14,
              border: '1.5px solid #fecaca',
              borderRadius: 10,
              background: '#fff5f5',
              color: '#dc2626',
              fontSize: 12,
              fontFamily: 'inherit',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              transition: 'all 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fee2e2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fff5f5';
            }}
          >
            <RiCloseLine size={15} />
            Clear
          </button>
        )}
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {filters.search && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                paddingLeft: 10,
                paddingRight: 8,
                height: 26,
                background: '#f1f5f9',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700,
                color: '#475569',
              }}
            >
              Search: "{filters.search}"
              <button
                onClick={() => setFilters({ ...filters, search: '', page: 1 })}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <RiCloseLine size={13} />
              </button>
            </span>
          )}
          {filters.status && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                paddingLeft: 10,
                paddingRight: 8,
                height: 26,
                background: '#ede9fe',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700,
                color: '#5b21b6',
              }}
            >
              Status: {STATUS_OPTIONS.find((o) => o.value === filters.status)?.label}
              <button
                onClick={() => setFilters({ ...filters, status: '', page: 1 })}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#8b5cf6',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <RiCloseLine size={13} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
