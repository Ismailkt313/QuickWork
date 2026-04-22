import React from "react";

const CompletedJobsPage: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="fw-bold mb-4">Completed Jobs</h2>
      <div className="card border-0 shadow-sm">
        <div className="card-body p-5 text-center text-secondary">
          <p className="mb-0">
            A history of your completed jobs will be listed here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompletedJobsPage;
