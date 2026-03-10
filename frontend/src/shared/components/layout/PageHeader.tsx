import React from 'react';

interface PageHeaderProps {
    title: string;
    subtitle: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => {
    return (
        <div className="text-center mb-5 mt-4">
            <h1 className="fw-bolder mb-2 text-dark" style={{ letterSpacing: '-0.03em', fontSize: '2.5rem' }}>
                {title}
            </h1>
            <p className="text-secondary fs-5" style={{ color: '#64748b' }}>
                {subtitle}
            </p>
        </div>
    );
};
