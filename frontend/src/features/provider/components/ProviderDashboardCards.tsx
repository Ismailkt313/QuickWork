import React from "react";
import { FaTasks, FaClock, FaCheckCircle, FaRupeeSign } from "react-icons/fa";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  color,
}) => (
  <div className="card border-0 shadow-sm h-100">
    <div className="card-body p-4">
      <div className="d-flex align-items-center mb-3">
        <div
          className={`p-3 rounded-3 bg-opacity-10 bg-${color} text-${color} me-3`}
        >
          {icon}
        </div>
        <div>
          <h6 className="card-subtitle text-secondary fw-medium mb-1">
            {title}
          </h6>
          <h3 className="card-title mb-0 fw-bold">{value}</h3>
        </div>
      </div>
    </div>
  </div>
);

const ProviderDashboardCards: React.FC = () => {
  const stats = [
    { title: "Total Jobs", value: 12, icon: <FaTasks />, color: "primary" },
    { title: "Active Jobs", value: 3, icon: <FaClock />, color: "info" },
    {
      title: "Completed Jobs",
      value: 8,
      icon: <FaCheckCircle />,
      color: "success",
    },
    {
      title: "Total Earnings",
      value: "₹12,500",
      icon: <FaRupeeSign />,
      color: "warning",
    },
  ];

  return (
    <div className="row g-4 mb-4">
      {stats.map((stat) => (
        <div key={stat.title} className="col-12 col-md-6 col-lg-3">
          <DashboardCard {...stat} />
        </div>
      ))}
    </div>
  );
};

export default ProviderDashboardCards;
