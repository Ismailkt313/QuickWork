import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../app/store";
import { fetchFinanceOverview, fetchTransactions, type AdminFinanceState, type Transaction } from "../../admin/store/adminFinanceSlice";
import {
  RiMoneyDollarCircleLine,
  RiExchangeLine,
  RiBankCardLine,
  RiCashLine,
  RiErrorWarningLine,
  RiFilter3Line,
  RiCalendarLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiLoader4Line,
  RiHistoryLine,
  RiSearchLine
} from "react-icons/ri";

const AdminFinancePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { overview, transactions, pagination, loading } = useSelector(
    (state: RootState) => state.adminFinance as AdminFinanceState
  );

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    paymentMethod: "all",
    startDate: "",
    endDate: "",
    search: "",
  });

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchFinanceOverview());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    dispatch(fetchTransactions(filters));
  }, [dispatch, filters]);

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value, page: 1 });
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-dark p-3 rounded-4 text-white shadow-sm">
            <RiHistoryLine size={32} />
          </div>
          <div>
            <h2 className="fw-bold text-dark mb-1">Financial Ledger</h2>
            <p className="text-muted mb-0">Track platform earnings and transaction history</p>
          </div>
        </div>
      </div>

      {}
      <div className="row g-4 mb-5">
        <div className="col-12 col-md-4 col-xl">
          <div className="qw-summary-card">
            <div className="qw-summary-icon bg-indigo-soft text-indigo">
              <RiMoneyDollarCircleLine size={24} />
            </div>
            <div className="qw-summary-content">
              <span className="qw-summary-label">Platform Earnings</span>
              <h3 className="qw-summary-value text-indigo">₹{overview?.totalPlatformEarnings || 0}</h3>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4 col-xl">
          <div className="qw-summary-card">
            <div className="qw-summary-icon bg-blue-soft text-blue">
              <RiExchangeLine size={24} />
            </div>
            <div className="qw-summary-content">
              <span className="qw-summary-label">Transactions</span>
              <h3 className="qw-summary-value text-blue">{overview?.totalTransactions || 0}</h3>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4 col-xl">
          <div className="qw-summary-card">
            <div className="qw-summary-icon bg-green-soft text-green">
              <RiBankCardLine size={24} />
            </div>
            <div className="qw-summary-content">
              <span className="qw-summary-label">Online Payments</span>
              <h3 className="qw-summary-value text-green">{overview?.totalOnlinePayments || 0}</h3>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4 col-xl">
          <div className="qw-summary-card">
            <div className="qw-summary-icon bg-orange-soft text-orange">
              <RiCashLine size={24} />
            </div>
            <div className="qw-summary-content">
              <span className="qw-summary-label">Cash Payments</span>
              <h3 className="qw-summary-value text-orange">{overview?.totalCashPayments || 0}</h3>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4 col-xl">
          <div className="qw-summary-card border-danger-subtle bg-danger-subtle bg-opacity-10">
            <div className="qw-summary-icon bg-red-soft text-red">
              <RiErrorWarningLine size={24} />
            </div>
            <div className="qw-summary-content">
              <span className="qw-summary-label">Pending Dues</span>
              <h3 className="qw-summary-value text-red">₹{overview?.totalPendingDues || 0}</h3>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-header bg-white p-4 border-bottom">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-3">
              <label className="form-label fw-bold small text-muted text-uppercase mb-2">
                <RiFilter3Line size={14} className="me-1" /> Payment Method
              </label>
              <select
                className="form-select border rounded-3 py-2"
                name="paymentMethod"
                value={filters.paymentMethod}
                onChange={handleFilterChange}
              >
                <option value="all">All Methods</option>
                <option value="ONLINE">Online (Razorpay)</option>
                <option value="CASH">Cash (Direct)</option>
              </select>
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label fw-bold small text-muted text-uppercase mb-2">
                <RiCalendarLine size={14} className="me-1" /> Start Date
              </label>
              <input
                type="date"
                className="form-control border rounded-3 py-2"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label fw-bold small text-muted text-uppercase mb-2">
                <RiCalendarLine size={14} className="me-1" /> End Date
              </label>
              <input
                type="date"
                className="form-control border rounded-3 py-2"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label fw-bold small text-muted text-uppercase mb-2">
                <RiSearchLine size={14} className="me-1" /> Search
              </label>
              <div className="position-relative">
                <RiSearchLine className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                <input
                  type="text"
                  className="form-control border rounded-3 py-2 ps-5"
                  placeholder="Search by ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light text-muted small text-uppercase">
              <tr>
                <th className="py-3 px-4 border-0">Date</th>
                <th className="py-3 px-4 border-0">Job ID</th>
                <th className="py-3 px-4 border-0">Provider ID</th>
                <th className="py-3 px-4 border-0">Method</th>
                <th className="py-3 px-4 border-0 text-end">Total</th>
                <th className="py-3 px-4 border-0 text-end">Fee</th>
                <th className="py-3 px-4 border-0 text-end">Net Payout</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <RiLoader4Line size={40} className="qw-spin text-primary mb-2" />
                    <p className="text-muted mb-0">Loading transactions...</p>
                  </td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map((tx: Transaction) => (
                  <tr key={tx._id}>
                    <td className="py-3 px-4">
                      <div className="d-flex flex-column">
                        <span className="fw-bold text-dark">{new Date(tx.createdAt).toLocaleDateString()}</span>
                        <span className="text-muted small" style={{ fontSize: '11px' }}>{new Date(tx.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="d-flex flex-column">
                        <span className="badge bg-light text-dark font-monospace w-auto d-inline-block text-start mb-1" style={{ maxWidth: "max-content" }}>
                          #{tx.jobId?.jobCode || (tx.jobId?._id ? tx.jobId._id.slice(-6).toUpperCase() : 'N/A')}
                        </span>
                        <span className="text-muted small text-truncate" style={{ maxWidth: "150px" }} title={tx.jobId?.title}>
                          {tx.jobId?.title || "Unknown Job"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-muted small font-monospace">{tx.providerId}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge rounded-pill ${tx.paymentMethod === 'ONLINE' ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning text-dark'}`}>
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-end fw-bold text-dark">₹{tx.totalAmount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-end text-primary fw-medium">₹{tx.platformFee.toLocaleString()}</td>
                    <td className="py-3 px-4 text-end text-muted">₹{tx.providerAmount.toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <RiExchangeLine size={48} className="text-muted mb-3 opacity-25" />
                    <p className="text-muted fw-medium fs-5">No transactions found</p>
                    <p className="text-muted small">Adjust your filters to refine the search</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {}
        {pagination && pagination.pages > 1 && (
          <div className="card-footer bg-white p-4 border-top d-flex justify-content-between align-items-center">
            <span className="text-muted small">
              Page <span className="fw-bold">{pagination.page}</span> of <span className="fw-bold">{pagination.pages}</span>
            </span>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary btn-sm rounded-3 px-3 d-flex align-items-center"
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                <RiArrowLeftSLine size={18} /> Previous
              </button>
              <button
                className="btn btn-outline-secondary btn-sm rounded-3 px-3 d-flex align-items-center"
                disabled={pagination.page === pagination.pages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Next <RiArrowRightSLine size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .bg-indigo-soft { background-color: #eef2ff; }
        .text-indigo { color: #4f46e5; }
        .bg-blue-soft { background-color: #eff6ff; }
        .text-blue { color: #3b82f6; }
        .bg-green-soft { background-color: #f0fdf4; }
        .text-green { color: #22c55e; }
        .bg-orange-soft { background-color: #fff7ed; }
        .text-orange { color: #f97316; }
        .bg-red-soft { background-color: #fef2f2; }
        .text-red { color: #ef4444; }

        .qw-summary-card {
          background: white;
          padding: 24px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          border: 1px solid rgba(15, 23, 42, 0.05);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
          height: 100%;
        }

        .qw-summary-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .qw-summary-label {
          display: block;
          color: #64748b;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          margin-bottom: 4px;
        }

        .qw-summary-value {
          margin: 0;
          font-weight: 800;
          font-size: 24px;
        }

        .qw-spin {
          animation: qw-spin 1s linear infinite;
        }

        @keyframes qw-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminFinancePage;
