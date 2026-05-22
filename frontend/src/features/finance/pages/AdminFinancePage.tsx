import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../app/store";
import { fetchFinanceOverview, fetchTransactions, type AdminFinanceState, type Transaction } from "../../admin/store/adminFinanceSlice";
import {
  RiMoneyDollarCircleLine,
  RiExchangeLine,
  RiBankCardLine,
  RiCashLine,
  RiErrorWarningLine
} from "react-icons/ri";
import { CustomSelect } from "../../../shared/components/ui/CustomSelect";
import { AdminPageHeader, AdminFilterBar, DataTable, type Column } from "../../admin/components/table";
import useDebounce from "../../../hooks/useDebounce";

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

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);
  const [lastSearch, setLastSearch] = useState("");

  if (debouncedSearch !== lastSearch) {
    setLastSearch(debouncedSearch);
    setFilters(prev => ({ ...prev, search: debouncedSearch, page: 1 }));
  }

  useEffect(() => {
    dispatch(fetchFinanceOverview());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchTransactions(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value, page: 1 });
  };

  const columns: Column<Transaction>[] = [
    {
      key: "date",
      header: "Date",
      render: (tx) => (
        <div className="d-flex flex-column">
          <span className="fw-bold text-dark">{new Date(tx.createdAt).toLocaleDateString()}</span>
          <span className="text-muted small" style={{ fontSize: '11px' }}>{new Date(tx.createdAt).toLocaleTimeString()}</span>
        </div>
      ),
    },
    {
      key: "jobId",
      header: "Job ID",
      render: (tx) => (
        <div className="d-flex flex-column">
          <span className="badge bg-light text-dark font-monospace w-auto d-inline-block text-start mb-1" style={{ maxWidth: "max-content" }}>
            #{tx.jobId?.jobCode || (tx.jobId?._id ? tx.jobId._id.slice(-6).toUpperCase() : 'N/A')}
          </span>
          <span className="text-muted small text-truncate" style={{ maxWidth: "150px" }} title={tx.jobId?.title}>
            {tx.jobId?.title || "Unknown Job"}
          </span>
        </div>
      ),
    },
    {
      key: "providerId",
      header: "Provider",
      render: (tx) => <span className="text-dark fw-medium">{tx.providerId?.userId?.name || "Unknown"}</span>,
    },
    {
      key: "method",
      header: "Method",
      render: (tx) => (
        <span className={`badge rounded-pill ${tx.paymentMethod === 'ONLINE' ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning text-dark'}`}>
          {tx.paymentMethod}
        </span>
      ),
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      render: (tx) => <span className="fw-bold text-dark">₹{tx.totalAmount.toLocaleString()}</span>,
    },
    {
      key: "fee",
      header: "Fee",
      align: "right",
      render: (tx) => <span className="text-primary fw-medium">₹{tx.platformFee.toLocaleString()}</span>,
    },
    {
      key: "net",
      header: "Net Payout",
      align: "right",
      render: (tx) => <span className="text-muted">₹{tx.providerAmount.toLocaleString()}</span>,
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Financial Ledger"
        subtitle="Track platform earnings and transaction history"
        breadcrumb={
          <>Admin <span className="separator">›</span> <span>Finance</span></>
        }
      />

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

      <AdminFilterBar
        searchPlaceholder="Search by provider name, job code, or payment ID..."
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onReset={() => {
          setSearchInput("");
          setFilters({ page: 1, limit: 10, paymentMethod: "all", startDate: "", endDate: "", search: "" });
        }}
      >
        <CustomSelect
          value={filters.paymentMethod}
          onChange={(v) => setFilters({ ...filters, paymentMethod: v, page: 1 })}
          options={[
            { value: "all", label: "All Methods" },
            { value: "ONLINE", label: "Online (Razorpay)" },
            { value: "CASH", label: "Cash (Direct)" },
          ]}
          size="sm"
          className="admin-filter-select-override"
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="date"
            className="admin-search-input"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            style={{ width: "140px" }}
          />
          <span className="text-muted" style={{ fontSize: "0.85rem" }}>to</span>
          <input
            type="date"
            className="admin-search-input"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            style={{ width: "140px" }}
          />
        </div>
      </AdminFilterBar>

      <DataTable
        columns={columns}
        data={transactions}
        loading={loading}
        emptyMessage="No transactions found. Adjust your filters to refine the search."
        emptyIcon="bi bi-cash-stack"
        page={pagination?.page || 1}
        totalPages={pagination?.pages || 1}
        onPageChange={(p) => setFilters({ ...filters, page: p })}
        keyExtractor={(tx) => tx._id}
      />

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
