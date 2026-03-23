import React from 'react';
import ProviderDashboardLayout from '../layout/ProviderDashboardLayout';
import ProviderDashboardHeader from '../components/ProviderDashboardHeader';
import ProviderDashboardCards from '../components/ProviderDashboardCards';

const ProviderDashboardPage: React.FC = () => {
  return (
    <>
      <ProviderDashboardHeader />
      <ProviderDashboardCards />
      
       <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom py-3">
          <h5 className="m-0 fw-bold">Recent Activity</h5>
        </div>
        <div className="card-body p-4 text-center text-secondary">
          <p className="mb-0">Recent activities will appear here once you start receiving jobs and applications.</p>
        </div>
      </div>
    </>
  );
};

export default ProviderDashboardPage;
