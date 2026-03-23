import React from 'react';
import { CreateJobForm } from '../components/CreateJobForm';
import { PageHeader } from '../../../../shared/components/layout/PageHeader';
import { Breadcrumb } from '../../../../shared/components/layout/Breadcrumb';
import type { BreadcrumbItem } from '../../../../shared/components/layout/Breadcrumb';
import { BackButton } from '../../../../shared/components/ui/BackButton';
import { Link } from 'react-router-dom';

export const CreateJobPage: React.FC = () => {
    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Home', path: '/' },
        { label: 'Client Dashboard', path: '/dashboard' },
        { label: 'Create Job' }
    ];

    return (
        <div className="bg-light min-vh-100" style={{ backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
            <nav className="navbar navbar-light bg-white border-bottom py-3 sticky-top">
                <div className="container" style={{ maxWidth: '850px' }}>
                    <Link to="/" className="navbar-brand fw-bolder fs-4 text-primary" style={{ letterSpacing: '-0.03em' }}>
                        QuickWork
                    </Link>
                </div>
            </nav>

            <div className="container py-4" style={{ maxWidth: '850px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <Breadcrumb items={breadcrumbItems} />
                    <BackButton />
                </div>

                <PageHeader
                    title="Create a New Job"
                    subtitle="Describe the work you need and connect with skilled freelancers."
                />

                <CreateJobForm />
            </div>
        </div>
    );
};

export default CreateJobPage;
