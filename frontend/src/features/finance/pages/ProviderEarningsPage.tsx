import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWallet, fetchTransactions } from "../store/walletSlice";
import type { AppDispatch, RootState } from "../../../app/store";
import {
  RiWallet3Line,
  RiArrowUpCircleLine,
  RiArrowDownCircleLine,
  RiTimeLine,
  RiInformationLine,
  RiSearchLine,
  RiMoneyDollarCircleLine,
  RiBankCardLine,
  RiAlertLine,
  RiBillLine,
  RiDownload2Line,
  RiExternalLinkLine
} from "react-icons/ri";
import useDebounce from "../../../hooks/useDebounce";
import { financeService, type WorkHistory, type IInvoice } from "../services/finance.service";
import { confirmPayment, rejectPayment } from "../store/paymentSlice";
import { toast } from "react-toastify";
import InvoiceDetailModal from "../components/InvoiceDetailModal";
import WithdrawalModal from "../components/WithdrawalModal";

const ProviderEarningsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { wallet, transactions, pagination: transactionPagination, loading: walletLoading } = useSelector((state: RootState) => state.wallet);

  const [pendingHistory, setPendingHistory] = useState<WorkHistory[]>([]);
  const [pendingPagination, setPendingPagination] = useState<{ total: number; page: number; pages: number } | null>(null);
  const [pendingLoading, setPendingLoading] = useState(true);

  const [allHistory, setAllHistory] = useState<WorkHistory[]>([]);
  const [invoices, setInvoices] = useState<IInvoice[]>([]);
  const [invoicePagination, setInvoicePagination] = useState<{ total: number; page: number; pages: number } | null>(null);
  const [invoicePage, setInvoicePage] = useState(1);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<IInvoice | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const [pendingPage, setPendingPage] = useState(1);
  const [transactionPage, setTransactionPage] = useState(1);

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const [filter, setFilter] = useState<"all" | "completed" | "pending" | "withdrawal" | "charge" | "invoices">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    dispatch(fetchWallet());
  }, [dispatch]);

  useEffect(() => {
    const getParams = () => {
      const params: Record<string, string | number | undefined> = { page: transactionPage, limit: 6, search: debouncedSearch || undefined };
      if (filter === "completed") params.type = "credit";
      else if (filter === "withdrawal") params.source = "withdrawal";
      else if (filter === "charge") params.source = "cash_fee";
      return params;
    };
    dispatch(fetchTransactions(getParams()));
  }, [dispatch, transactionPage, debouncedSearch, filter]);

  useEffect(() => {
    setTransactionPage(1);
  }, [debouncedSearch, filter]);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        setPendingLoading(true);
        const res = await financeService.getProviderHistory({ status: "pending", page: pendingPage, limit: 6 });
        setPendingHistory(res.data);
        setPendingPagination(res.pagination);
      } catch (err) {
        console.error("Failed to fetch pending history", err);
        toast.error("Failed to load pending payments");
      } finally {
        setPendingLoading(false);
      }
    };
    fetchPending();
  }, [pendingPage]);
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await financeService.getProviderHistory({ limit: 1000 });
        setAllHistory(res.data);
      } catch (err) {
        console.error("Failed to fetch history for stats", err);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setInvoiceLoading(true);
        const res = await financeService.getInvoices({ page: invoicePage, limit: 6, role: "provider" });
        setInvoices(res.data);
        setInvoicePagination(res.pagination);
      } catch (err) {
        console.error("Failed to fetch invoices", err);
      } finally {
        setInvoiceLoading(false);
      }
    };
    fetchInvoices();
  }, [invoicePage]);

  const stats = useMemo(() => {
    const totalEarned = allHistory
      .filter(h => h.payment.status === "completed")
      .reduce((sum, h) => sum + h.payment.providerAmount, 0);

    const totalPending = pendingHistory.reduce((sum, h) => sum + h.payment.providerAmount, 0);

    const totalWithdrawn = transactions
      .filter(t => t.source === "withdrawal")
      .reduce((sum, t) => sum + t.amount, 0);

    return { totalEarned, totalPending, totalWithdrawn };
  }, [allHistory, pendingHistory, transactions]);

  const refreshData = async () => {
    dispatch(fetchWallet());
    dispatch(fetchTransactions({ page: transactionPage, limit: 6 }));

    const fetchPendingData = async () => {
        const res = await financeService.getProviderHistory({ status: "pending", page: pendingPage, limit: 6 });
        setPendingHistory(res.data);
        setPendingPagination(res.pagination);
    };
    const fetchHistoryData = async () => {
        const res = await financeService.getProviderHistory({ page: 1, limit: 100 });
        setAllHistory(res.data);
    };
    const fetchInvoicesData = async () => {
        const res = await financeService.getInvoices({ page: invoicePage, limit: 6 });
        setInvoices(res.data);
        setInvoicePagination(res.pagination);
    };
    fetchPendingData();
    fetchHistoryData();
    fetchInvoicesData();
  };

  const handleDownloadInvoice = async (id: string, invoiceNumber: string) => {
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
      setIsInvoiceModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch invoice details", err);
      toast.error("Could not load invoice details");
    }
  };

  const handleConfirm = async (id: string) => {
    await dispatch(confirmPayment(id));
    refreshData();
  };

  const handleReject = async (id: string) => {
    await dispatch(rejectPayment(id));
    refreshData();
  };

  const handleWithdraw = async (amount: number) => {
    try {
      setWithdrawLoading(true);
      await financeService.withdraw(amount);
      toast.success(`Successfully withdrawn ₹${amount.toLocaleString()}`);
      setIsWithdrawModalOpen(false);
      refreshData();
    } catch (err: unknown) {
      console.error("Withdrawal failed", err);
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to process withdrawal";
      toast.error(errorMessage);
    } finally {
      setWithdrawLoading(false);
    }
  };

  return (
    <div className="qw-earnings-container animate-fade-in">
      <div className="qw-earnings-header">
        <div className="qw-header-content">
          <h1>Financial Overview</h1>
          <p>Track your earnings, pending payments and wallet balance</p>
        </div>
        <button
          className="qw-btn-withdraw"
          disabled={(wallet?.balance || 0) <= 0}
          title={(wallet?.balance || 0) <= 0 ? "Insufficient balance to withdraw" : ""}
          onClick={() => setIsWithdrawModalOpen(true)}
        >
          <RiBankCardLine size={18} />
          <span>Withdraw Funds</span>
        </button>
      </div>

      {}
      {(wallet?.balance || 0) < 0 && (
        <div className="qw-debt-banner animate-pop-in">
          <div className="qw-debt-icon"><RiAlertLine size={24} /></div>
          <div className="qw-debt-content">
            <h6>Action Required: Platform Dues</h6>
            <p>You have an outstanding balance of <strong>₹{Math.abs(wallet?.balance || 0)}</strong>. Future earnings will be automatically adjusted until this is cleared. Keep your dues below ₹1,000 to avoid account suspension.</p>
          </div>
        </div>
      )}

      {}
      <div className="qw-stats-grid">
        <div className={`qw-stat-card ${(wallet?.balance || 0) < 0 ? 'danger-intense' : 'primary'}`}>
          <div className="qw-stat-icon">{(wallet?.balance || 0) < 0 ? <RiAlertLine /> : <RiWallet3Line />}</div>
          <div className="qw-stat-info">
            <span className="label">{(wallet?.balance || 0) < 0 ? "You owe platform" : "Wallet Balance"}</span>
            <h2 className="value">₹{Math.abs(wallet?.balance || 0).toLocaleString()}</h2>
          </div>
          <div className="qw-stat-badge">{(wallet?.balance || 0) < 0 ? "Dues" : "Available"}</div>
        </div>
        <div className="qw-stat-card success">
          <div className="qw-stat-icon"><RiMoneyDollarCircleLine /></div>
          <div className="qw-stat-info">
            <span className="label">Total Earned</span>
            <h2 className="value">₹{stats.totalEarned.toLocaleString()}</h2>
          </div>
          <div className="qw-stat-badge">Lifetime</div>
        </div>
        <div className="qw-stat-card warning">
          <div className="qw-stat-icon"><RiTimeLine /></div>
          <div className="qw-stat-info">
            <span className="label">Pending Clearance</span>
            <h2 className="value">₹{stats.totalPending.toLocaleString()}</h2>
          </div>
          <div className="qw-stat-badge">In Progress</div>
        </div>
        <div className="qw-stat-card danger">
          <div className="qw-stat-icon"><RiArrowUpCircleLine /></div>
          <div className="qw-stat-info">
            <span className="label">Total Withdrawn</span>
            <h2 className="value">₹{stats.totalWithdrawn.toLocaleString()}</h2>
          </div>
          <div className="qw-stat-badge">Sent to Bank</div>
        </div>
      </div>

      <div className="qw-earnings-content">
        <div className="qw-main-column">
          {}
          {(pendingHistory.length > 0 || pendingLoading) && (
            <div className="qw-section pending-section">
              <div className="qw-section-header">
                <div className="d-flex align-items-center gap-2">
                  <RiInformationLine className="text-warning" size={20} />
                  <h3>Pending Confirmations</h3>
                </div>
                <span className="qw-badge-count">{pendingPagination?.total || pendingHistory.length}</span>
              </div>
              <div className="qw-pending-list">
                {pendingLoading ? (
                    <div className="text-center py-4">Loading...</div>
                ) : (
                    pendingHistory.map((p, index) => (
                        <div key={p._id || (p as any).id || index} className="qw-pending-item">
                          <div className="qw-pending-info">
                            <h6>
                              {p.jobId?.title || "Assignment"}
                              {p.jobId?.jobCode && <span style={{ marginLeft: 8, fontSize: 11, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, color: '#64748b', fontWeight: 600 }}>#{p.jobId.jobCode}</span>}
                            </h6>
                            <p>Completed on {new Date(p.endedAt).toLocaleDateString()}</p>
                          </div>
                          <div className="qw-pending-amount">
                            <span>You receive:</span>
                            <strong>₹{p.payment.providerAmount}</strong>
                          </div>
                          <div className="qw-pending-actions">
                            {p.payment.status === "awaiting_confirmation" ? (
                              <>
                                <button className="qw-btn-action success" onClick={() => handleConfirm(p._id)}>Confirm Receipt</button>
                                <button className="qw-btn-action reject" onClick={() => handleReject(p._id)}>Not Paid</button>
                              </>
                            ) : (
                              <div className="qw-waiting-tag">
                                <RiTimeLine />
                                <span>Waiting for client to mark as paid</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                )}
              </div>
              {pendingPagination && pendingPagination.pages > 1 && (
                <div className="qw-pagination">
                    <button
                        disabled={pendingPage === 1}
                        onClick={() => setPendingPage(p => p - 1)}
                    >Previous</button>
                    <span>Page {pendingPage} of {pendingPagination.pages}</span>
                    <button
                        disabled={pendingPage === pendingPagination.pages}
                        onClick={() => setPendingPage(p => p + 1)}
                    >Next</button>
                </div>
              )}
            </div>
          )}

          {}
          <div className="qw-section">
            <div className="qw-section-header flex-column align-items-start gap-3">
              <div className="d-flex justify-content-between w-100 align-items-center">
                <h3>Transaction History</h3>
                <div className="qw-table-controls">
                  <div className="qw-search-box">
                    <RiSearchLine />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="qw-filter-tabs">
                <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All</button>
                <button className={filter === "completed" ? "active" : ""} onClick={() => setFilter("completed")}>Earnings</button>
                <button className={filter === "invoices" ? "active" : ""} onClick={() => setFilter("invoices")}>Invoices</button>
                <button className={filter === "withdrawal" ? "active" : ""} onClick={() => setFilter("withdrawal")}>Withdrawals</button>
                <button className={filter === "charge" ? "active" : ""} onClick={() => setFilter("charge")}>Platform Fees</button>
              </div>
            </div>

            <div className="qw-table-wrapper">
              {filter === "invoices" ? (
                <>
                <table className="qw-earnings-table">
                  <thead>
                    <tr>
                      <th>Invoice Info</th>
                      <th>Client</th>
                      <th>Total Amount</th>
                      <th>Date</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceLoading ? (
                      <tr><td colSpan={5} className="text-center py-5">Loading...</td></tr>
                    ) : invoices.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-5">No invoices found</td></tr>
                    ) : (
                      invoices.map((inv, index) => (
                        <tr key={inv._id || (inv as any).id || index}>
                          <td>
                            <div className="qw-td-info">
                              <div className="qw-td-icon credit"><RiBillLine /></div>
                              <div>
                                <span className="qw-td-title">{inv.invoiceNumber}</span>
                                <span className="qw-td-sub">
                                  {inv.jobId?.jobCode && <span style={{ marginRight: 6, fontWeight: 600 }}>#{inv.jobId.jobCode}</span>}
                                  {inv.jobId?.title}
                                </span>

                                
                              </div>
                            </div>
                          </td>
                          <td>{inv.client.name}</td>
                          <td><span className="qw-td-amount credit">₹{inv.total.toLocaleString()}</span></td>
                          <td>{new Date(inv.paidAt).toLocaleDateString()}</td>
                          <td className="text-right">
                            <div className="action-group" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button className="qw-icon-btn" onClick={() => openInvoiceDetails(inv._id)} title="View Detail"><RiExternalLinkLine /></button>
                              <button className="qw-icon-btn" onClick={() => handleDownloadInvoice(inv._id, inv.invoiceNumber)} title="Download PDF"><RiDownload2Line /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {invoicePagination && invoicePagination.pages > 1 && (
                  <div className="qw-pagination mt-4">
                      <button disabled={invoicePage === 1} onClick={() => setInvoicePage(p => p - 1)}>Previous</button>
                      <span>Page {invoicePage} of {invoicePagination.pages}</span>
                      <button disabled={invoicePage === invoicePagination.pages} onClick={() => setInvoicePage(p => p + 1)}>Next</button>
                  </div>
                )}
                </>
              ) : (
                <table className="qw-earnings-table">

                <thead>
                  <tr>
                    <th>Transaction Details</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {walletLoading ? (
                    <tr><td colSpan={5} className="text-center py-5">Loading...</td></tr>
                  ) : transactions.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-5">No transactions found</td></tr>
                  ) : (
                    transactions.map((t, index) => (
                      <tr key={t._id || (t as any).id || index}>
                        <td>
                          <div className="qw-td-info">
                            <div className={`qw-td-icon ${t.type}`}>
                              {t.type === "credit" ? <RiArrowDownCircleLine /> : <RiArrowUpCircleLine />}
                            </div>
                            <div>
                              <span className="qw-td-title">{t.source?.replace("_", " ") || "Transaction"}</span>
                              <span className="qw-td-sub">ID: {(t._id || (t as any).id || "").slice(-8).toUpperCase()}</span>
                            </div>
                          </div>
                        </td>
                        <td><span className={`qw-type-tag ${t.type}`}>{t.type}</span></td>
                        <td>
                          <span className={`qw-td-amount ${t.type}`}>
                            {t.type === "credit" ? "+" : "-"}₹{(t.amount || 0).toLocaleString()}
                          </span>
                        </td>
                        <td>{new Date(t.createdAt || Date.now()).toLocaleDateString()}</td>
                        <td><span className="qw-status-pill success">Successful</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              )}
            </div>

            {transactionPagination && transactionPagination.pages > 1 && (
                <div className="qw-pagination mt-4">
                    <button
                        disabled={transactionPage === 1}
                        onClick={() => setTransactionPage(p => p - 1)}
                    >Previous</button>
                    <span>Page {transactionPage} of {transactionPagination.pages}</span>
                    <button
                        disabled={transactionPage === transactionPagination.pages}
                        onClick={() => setTransactionPage(p => p + 1)}
                    >Next</button>
                </div>
            )}
          </div>
        </div>
      </div>

      {}
      <InvoiceDetailModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        invoice={selectedInvoice}
        onDownload={handleDownloadInvoice}
      />

      <WithdrawalModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        balance={wallet?.balance || 0}
        onWithdraw={handleWithdraw}
        loading={withdrawLoading}
      />

      <style>{`
        .qw-earnings-container {
          max-width: 1200px;
          margin: 40px auto;
          padding: 0 24px;
          font-family: 'Inter', sans-serif;
        }

        .qw-earnings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .qw-header-content h1 {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 32px;
          color: #0f172a;
          margin: 0;
        }

        .qw-header-content p {
          color: #64748b;
          margin: 4px 0 0;
        }

        .qw-btn-withdraw {
          background: #0f172a;
          color: #fff;
          border: none;
          padding: 12px 24px;
          border-radius: 14px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.2s;
          cursor: pointer;
        }

        .qw-btn-withdraw:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(15, 23, 42, 0.15);
        }

        /* Stats Grid */
        .qw-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .qw-stat-card {
          background: #fff;
          padding: 24px;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
        }

        .qw-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);
        }

        .qw-stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          margin-bottom: 16px;
        }

        .qw-stat-card.primary .qw-stat-icon { background: #eff6ff; color: #3b82f6; }
        .qw-stat-card.success .qw-stat-icon { background: #f0fdf4; color: #16a34a; }
        .qw-stat-card.warning .qw-stat-icon { background: #fffbeb; color: #f59e0b; }
        .qw-stat-card.danger .qw-stat-icon { background: #fef2f2; color: #ef4444; }
        .qw-stat-card.danger-intense { background: #fff1f2; border-color: #fecdd3; }
        .qw-stat-card.danger-intense .qw-stat-icon { background: #e11d48; color: #fff; }
        .qw-stat-card.danger-intense .value { color: #be123c; }

        .qw-debt-banner {
          display: flex;
          gap: 20px;
          background: #fff7ed;
          border: 1px solid #ffedd5;
          padding: 24px;
          border-radius: 20px;
          margin-bottom: 32px;
          align-items: center;
        }

        .qw-debt-icon {
          width: 50px;
          height: 50px;
          background: #f59e0b;
          color: #fff;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .qw-debt-content h6 {
          margin: 0;
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 16px;
          color: #9a3412;
        }

        .qw-debt-content p {
          margin: 4px 0 0;
          font-size: 14px;
          color: #c2410c;
          line-height: 1.5;
        }

        .qw-btn-withdraw:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          filter: grayscale(1);
        }

        .qw-stat-info .label {
          font-size: 13px;
          color: #64748b;
          font-weight: 600;
        }

        .qw-stat-info .value {
          font-size: 28px;
          font-weight: 800;
          color: #0f172a;
          margin: 4px 0;
        }

        .qw-stat-badge {
          position: absolute;
          top: 24px;
          right: 24px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          color: #94a3b8;
          background: #f8fafc;
          padding: 4px 10px;
          border-radius: 100px;
        }

        /* Sections */
        .qw-section {
          background: #fff;
          border-radius: 28px;
          border: 1px solid #e2e8f0;
          padding: 32px;
          margin-bottom: 32px;
        }

        .qw-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .qw-section-header h3 {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 20px;
          margin: 0;
          color: #0f172a;
        }

        .qw-badge-count {
          background: #fee2e2;
          color: #ef4444;
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 700;
        }

        /* Pending List */
        .qw-pending-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .qw-pending-item {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1.5fr;
          align-items: center;
          padding: 20px;
          background: #f8fafc;
          border-radius: 20px;
          border: 1px solid #eff6ff;
        }

        .qw-pending-info h6 {
          margin: 0;
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
        }

        .qw-pending-info p {
          margin: 2px 0 0;
          font-size: 12px;
          color: #64748b;
        }

        .qw-pending-amount span {
          display: block;
          font-size: 11px;
          color: #94a3b8;
          text-transform: uppercase;
          font-weight: 700;
        }

        .qw-pending-amount strong {
          font-size: 18px;
          color: #16a34a;
          font-weight: 800;
        }

        .qw-pending-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }

        .qw-btn-action {
          padding: 8px 16px;
          border-radius: 10px;
          border: none;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .qw-btn-action.success { background: #16a34a; color: #fff; }
        .qw-btn-action.reject { background: #fff; border: 1.5px solid #fee2e2; color: #ef4444; }

        .qw-waiting-tag {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #f59e0b;
          font-size: 12px;
          font-weight: 600;
          background: #fffbeb;
          padding: 8px 16px;
          border-radius: 10px;
        }

        /* Table */
        .qw-table-wrapper {
          overflow-x: auto;
        }

        .qw-earnings-table {
          width: 100%;
          border-collapse: collapse;
        }

        .qw-earnings-table th {
          text-align: left;
          padding: 16px;
          font-size: 12px;
          color: #94a3b8;
          font-weight: 700;
          text-transform: uppercase;
          border-bottom: 1px solid #f1f5f9;
        }

        .qw-earnings-table td {
          padding: 20px 16px;
          border-bottom: 1px solid #f8fafc;
          font-size: 14px;
        }

        .qw-td-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .qw-td-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .qw-td-icon.credit { background: #f0fdf4; color: #16a34a; }
        .qw-td-icon.debit { background: #fef2f2; color: #ef4444; }

        .qw-td-title {
          display: block;
          font-weight: 700;
          color: #0f172a;
          text-transform: capitalize;
        }

        .qw-td-sub {
          font-size: 11px;
          color: #94a3b8;
        }

        .qw-type-tag {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .qw-type-tag.credit { background: #f0fdf4; color: #16a34a; }
        .qw-type-tag.debit { background: #fef2f2; color: #ef4444; }

        .qw-td-amount {
          font-weight: 800;
        }

        .qw-td-amount.credit { color: #16a34a; }
        .qw-td-amount.debit { color: #ef4444; }

        .qw-status-pill {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 100px;
        }

        .qw-status-pill.success { background: #f0fdf4; color: #16a34a; }

        /* Controls */
        .qw-filter-tabs {
          display: flex;
          gap: 8px;
          background: #f1f5f9;
          padding: 4px;
          border-radius: 12px;
        }

        .qw-filter-tabs button {
          border: none;
          background: transparent;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .qw-filter-tabs button.active {
          background: #fff;
          color: #0f172a;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .qw-search-box {
          position: relative;
          display: flex;
          align-items: center;
        }

        .qw-search-box svg {
          position: absolute;
          left: 12px;
          color: #94a3b8;
        }

        .qw-search-box input {
          padding: 10px 16px 10px 36px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          font-size: 13px;
          width: 240px;
        }

        .qw-search-box input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .qw-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #f1f5f9;
        }

        .qw-pagination button {
          padding: 8px 16px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: #fff;
          color: #64748b;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .qw-pagination button:hover:not(:disabled) {
          border-color: #3b82f6;
          color: #3b82f6;
          background: #f0f7ff;
        }

        .qw-pagination button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .qw-pagination span {
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
        }

        .qw-icon-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          color: #64748b;
        }

        .qw-icon-btn:hover { border-color: #3b82f6; color: #3b82f6; background: #f0f7ff; }

        .text-right { text-align: right; }

        .animate-fade-in { animation: fadeIn 0.6s ease-out; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default ProviderEarningsPage;
