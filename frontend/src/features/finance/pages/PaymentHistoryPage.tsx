import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  RiDownload2Line,
  RiExternalLinkLine,
  RiSearchLine,
  RiBillLine,
  RiMoneyDollarCircleLine,
  RiTimeLine
} from "react-icons/ri";
import { financeService, type IInvoice } from "../services/finance.service";
import { fetchWallet } from "../store/walletSlice";
import type { AppDispatch, RootState } from "../../../app/store";
import { toast } from "react-toastify";
import InvoiceDetailModal from "../components/InvoiceDetailModal";
import "./UserWallet.css";
import { CustomSelect } from "../../../shared/components/ui/CustomSelect";

const PaymentHistoryPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { wallet } = useSelector((state: RootState) => state.wallet);
  
  const [invoices, setInvoices] = useState<IInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<{ total: number; page: number; pages: number } | null>(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMethod, setFilterMethod] = useState<"all" | "online" | "cash">("all");
  const [selectedInvoice, setSelectedInvoice] = useState<IInvoice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    dispatch(fetchWallet());
  }, [dispatch]);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const res = await financeService.getInvoices({ page, limit: 10, role: "client" });
        setInvoices(res.data);
        setPagination(res.pagination);
      } catch (err) {
        console.error("Failed to fetch invoices", err);
        // toast.error("Failed to load payment history");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [page]);

  const handleDownload = async (id: string, invoiceNumber: string) => {
    try {
      const blob = await financeService.downloadInvoicePdf(id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error("Download failed", err);
      toast.error("Failed to download invoice");
    }
  };

  const openInvoiceDetails = async (id: string) => {
    try {
      const res = await financeService.getInvoiceById(id);
      setSelectedInvoice(res.data);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch invoice details", err);
      toast.error("Could not load invoice details");
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.jobId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.jobId?.jobCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.jobId?._id?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterMethod === "all" || inv.paymentMethod.toLowerCase() === filterMethod;
      
      return matchesSearch && matchesFilter;
    });
  }, [invoices, searchTerm, filterMethod]);

  // Derive stats for wallet card
  const stats = useMemo(() => {
    const totalSpent = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const onlineCount = invoices.filter(inv => inv.paymentMethod.toLowerCase() === "online").length;
    return { totalSpent, onlineCount };
  }, [invoices]);

  const renderMobileLayout = () => (
    <div className="qw-payment-history-container animate-fade-in mobile-view">
      <div className="qw-page-header">
        <div className="header-info">
          <h1>My Wallet</h1>
          <p>Balance, transactions, and invoice history</p>
        </div>
      </div>

      <div className="qw-wallet-section">
        <div className="qw-wallet-balance-card">
          <span className="qw-balance-label">Available Balance</span>
          <h2 className="qw-balance-value">₹{(wallet?.balance || 0).toLocaleString()}</h2>
          
          <div className="qw-balance-stats">
            <div className="qw-stat-item">
              <span className="qw-stat-label">Total Spent</span>
              <span className="qw-stat-value">₹{stats.totalSpent.toLocaleString()}</span>
            </div>
            <div className="qw-stat-item">
              <span className="qw-stat-label">Refunds</span>
              <span className="qw-stat-value">₹0</span>
            </div>
            <div className="qw-stat-item">
              <span className="qw-stat-label">Methods</span>
              <span className="qw-stat-value">{stats.onlineCount} Active</span>
            </div>
          </div>

          <div className="qw-wallet-actions">
            <button className="qw-btn-action-primary">Add Money</button>
            <button className="qw-btn-action-secondary">Withdraw</button>
          </div>
        </div>
      </div>

      <div className="qw-history-controls">
        <div className="search-wrapper">
          <RiSearchLine className="search-icon" />
          <input
            type="text"
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-wrapper">
          <div className="qw-mobile-filter-chips">
            <button 
              className={`qw-filter-chip ${filterMethod === "all" ? "active" : ""}`}
              onClick={() => setFilterMethod("all")}
            >All</button>
            <button 
              className={`qw-filter-chip ${filterMethod === "online" ? "active" : ""}`}
              onClick={() => setFilterMethod("online")}
            >Online</button>
            <button 
              className={`qw-filter-chip ${filterMethod === "cash" ? "active" : ""}`}
              onClick={() => setFilterMethod("cash")}
            >Cash</button>
          </div>
        </div>
      </div>

      <div className="qw-history-card">
        {loading ? (
          <div className="p-5 text-center text-muted">
            <RiTimeLine size={32} className="mb-2 opacity-50" />
            <p>Loading transactions...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="qw-empty-state">
            <RiBillLine className="qw-empty-icon" />
            <h3>No payments found</h3>
            <p>Your transaction history will appear here once you complete a job payment.</p>
          </div>
        ) : (
          <div className="qw-mobile-transaction-list">
            {filteredInvoices.map((inv) => (
              <div 
                key={inv._id} 
                className="qw-mobile-tx-card"
                onClick={() => openInvoiceDetails(inv._id)}
              >
                <div className="qw-tx-left">
                  <div className={`qw-tx-icon ${inv.paymentMethod.toLowerCase()}`}>
                    {inv.paymentMethod.toLowerCase() === "online" ? <RiMoneyDollarCircleLine /> : <RiBillLine />}
                  </div>
                  <div className="qw-tx-info">
                    <span className="qw-tx-title">{inv.jobId?.title || "Quick Service"}</span>
                    <div className="qw-tx-meta">
                      <span>{new Date(inv.paidAt || inv.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{inv.paymentMethod}</span>
                    </div>
                  </div>
                </div>
                <div className="qw-tx-right">
                  <div className="qw-tx-amount">₹{inv.total.toLocaleString()}</div>
                  <span className={`qw-tx-status ${inv.paymentStatus.toLowerCase() === "paid" ? "paid" : "pending"}`}>
                    {inv.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination && pagination.pages > 1 && (
          <div className="qw-pagination">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >Prev</button>
            <span className="page-info">{page} / {pagination.pages}</span>
            <button
              disabled={page === pagination.pages}
              onClick={() => setPage(p => p + 1)}
            >Next</button>
          </div>
        )}
      </div>
    </div>
  );

  const renderDesktopLayout = () => (
    <div className="qw-payment-history-container animate-fade-in">
      <div className="qw-page-header">
        <div className="header-info">
          <h1>Payment History</h1>
          <p>View and download invoices for your completed jobs</p>
        </div>
      </div>

      <div className="qw-history-controls">
        <div className="search-wrapper">
          <RiSearchLine className="search-icon" />
          <input
            type="text"
            placeholder="Search by invoice #, job title, or job ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-wrapper">
          <CustomSelect
            value={filterMethod}
            onChange={(v) => setFilterMethod(v as "all" | "online" | "cash")}
            options={[
              { value: "all", label: "All Methods" },
              { value: "online", label: "Online Payment" },
              { value: "cash", label: "Cash Payment" },
            ]}
            size="md"
          />
        </div>
      </div>

      <div className="qw-history-card">
        <div className="qw-table-container">
          <table className="qw-history-table">
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>Job Name</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Method</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-5">Loading history...</td></tr>
              ) : filteredInvoices.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-5">No payments found</td></tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv._id} className="history-row">
                    <td>
                      <span className="invoice-num">{inv.invoiceNumber}</span>
                    </td>
                    <td>
                      <div className="job-info">
                        <span className="job-title">
                          {inv.jobId?.title || "Direct Service"}
                          {inv.jobId?.jobCode && <span className="job-code-badge" style={{ marginLeft: 6, fontSize: 10, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, color: '#64748b' }}>{inv.jobId.jobCode}</span>}
                        </span>
                        <span className="provider-name">Provider: {inv.provider?.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="amount-paid">₹{inv.total.toLocaleString()}</span>
                    </td>
                    <td>
                      <span className="date">{new Date(inv.paidAt || inv.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td>
                      <span className={`method-badge ${inv.paymentMethod.toLowerCase()}`}>
                        {inv.paymentMethod}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="action-group">
                        <button
                          className="icon-btn view"
                          title="View Details"
                          onClick={() => openInvoiceDetails(inv._id)}
                        >
                          <RiExternalLinkLine />
                        </button>
                        <button
                          className="icon-btn download"
                          title="Download PDF"
                          onClick={() => handleDownload(inv._id, inv.invoiceNumber)}
                        >
                          <RiDownload2Line />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.pages > 1 && (
          <div className="qw-pagination">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >Previous</button>
            <span className="page-info">Page {page} of {pagination.pages}</span>
            <button
              disabled={page === pagination.pages}
              onClick={() => setPage(p => p + 1)}
            >Next</button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {isMobile ? renderMobileLayout() : renderDesktopLayout()}

      <InvoiceDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        invoice={selectedInvoice}
        onDownload={handleDownload}
      />
    </>
  );
};

export default PaymentHistoryPage;
