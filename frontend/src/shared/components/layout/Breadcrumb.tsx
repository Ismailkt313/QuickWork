import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

export interface BreadcrumbItem {
    label: string;
    path?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
    return (
        <nav aria-label="breadcrumb">
            <ul className="list-inline mb-0 d-flex align-items-center p-0 m-0">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return (
                        <li
                            key={index}
                            className={`list-inline-item d-flex align-items-center m-0`}
                            aria-current={isLast ? 'page' : undefined}
                        >
                            {!isLast && item.path ? (
                                <Link to={item.path} className="text-decoration-none text-secondary">
                                    {item.label}
                                </Link>
                            ) : (
                                <span className={isLast ? 'text-dark fw-semibold' : 'text-secondary'}>
                                    {item.label}
                                </span>
                            )}
                            {!isLast && <FiChevronRight className="mx-2 text-muted" size={14} />}
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};
