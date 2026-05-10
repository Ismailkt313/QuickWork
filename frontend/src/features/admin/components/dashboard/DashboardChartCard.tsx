import React from 'react';

interface DashboardChartCardProps {
    title: string;
    children: React.ReactNode;
    subtitle?: string;
    loading?: boolean;
}

const DashboardChartCard: React.FC<DashboardChartCardProps> = ({
    title,
    children,
    subtitle,
    loading = false
}) => {
    return (
        <div className="admin-table-card" style={{ padding: "1.5rem" }}>
            <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "#1e293b" }}>{title}</div>
                {subtitle && <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.25rem" }}>{subtitle}</p>}
            </div>
            <div style={{ height: "300px", width: "100%", minWidth: 0, position: "relative" }}>
                {loading ? (
                    <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl" />
                ) : (
                    children
                )}
            </div>
        </div>
    );
};

export default DashboardChartCard;
