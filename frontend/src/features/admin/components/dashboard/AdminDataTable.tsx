import React from 'react';

interface Column<T> {
    header: string;
    render: (item: T) => React.ReactNode;
}

interface AdminDataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    title?: string;
}

function AdminDataTable<T>({ data, columns, loading = false, title }: AdminDataTableProps<T>) {
    return (
        <div className="admin-table-card">
            {title && (
                <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b" }}>{title}</div>
                </div>
            )}
            <div style={{ overflowX: "auto" }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            {columns.map((col, i) => (
                                <th key={i}>{col.header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <tr key={i} style={{ opacity: 0.5 }}>
                                    {columns.map((_, j) => (
                                        <td key={j}>
                                            <div className="h-4 bg-slate-100 rounded w-full" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} style={{ textAlign: "center", padding: "3rem 1rem", color: "#94a3b8" }}>
                                    No records found
                                </td>
                            </tr>
                        ) : (
                            data.map((item, i) => (
                                <tr key={i}>
                                    {columns.map((col, j) => (
                                        <td key={j}>
                                            {col.render(item)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminDataTable;
