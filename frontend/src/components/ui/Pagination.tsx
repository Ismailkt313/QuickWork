import React from 'react';
import type { PaginationInfo } from '../../features/user/serviceProviders/services/providersService';

interface PaginationProps {
    pagination: PaginationInfo;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange }) => {
    const { page, totalPages, hasPrev, hasNext } = pagination;

    if (totalPages <= 1) return null;

    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    const btnBase: React.CSSProperties = {
        minWidth: 38, height: 38, borderRadius: 10, border: '1.5px solid #e2e8f0',
        background: '#fff', color: '#1e293b', fontSize: 13, fontWeight: 600,
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
    };

    const activeStyle: React.CSSProperties = {
        ...btnBase,
        background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', border: 'none',
    };

    return (
        <div className="d-flex justify-content-center align-items-center gap-2 mt-5">
            <button
                style={{ ...btnBase, opacity: hasPrev ? 1 : 0.4 }}
                disabled={!hasPrev}
                onClick={() => onPageChange(page - 1)}
            >
                ‹
            </button>

            {start > 1 && (
                <>
                    <button style={btnBase} onClick={() => onPageChange(1)}>1</button>
                    {start > 2 && <span style={{ color: '#94a3b8', fontSize: 13 }}>…</span>}
                </>
            )}

            {pages.map(p => (
                <button
                    key={p}
                    style={p === page ? activeStyle : btnBase}
                    onClick={() => onPageChange(p)}
                >
                    {p}
                </button>
            ))}

            {end < totalPages && (
                <>
                    {end < totalPages - 1 && <span style={{ color: '#94a3b8', fontSize: 13 }}>…</span>}
                    <button style={btnBase} onClick={() => onPageChange(totalPages)}>{totalPages}</button>
                </>
            )}

            <button
                style={{ ...btnBase, opacity: hasNext ? 1 : 0.4 }}
                disabled={!hasNext}
                onClick={() => onPageChange(page + 1)}
            >
                ›
            </button>
        </div>
    );
};

export default Pagination;
