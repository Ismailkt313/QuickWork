import React, { useEffect, useState } from "react";
import {
  RiDownload2Line,
  RiExternalLinkLine,
  RiSearchLine,
  RiFilter3Line
} from "react-icons/ri";
import { financeService, type IInvoice } from "../services/finance.service";
import { toast } from "react-toastify";
import InvoiceDetailModal from "../components/InvoiceDetailModal";

const PaymentHistoryPage: React.FC = () => {
  const [invoices, setInvoices] = useState<IInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<{ total: number; page: number; pages: number } | null>(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<IInvoice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const res = await financeService.getInvoices({ page, limit: 10, role: "client" });
        setInvoices(res.data);
        setPagination(res.pagination);
      } catch (err) {
        console.error("Failed to fetch invoices", err);
        toast.error("Failed to load payment history");
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

  const filteredInvoices = invoices.filter(inv =>
    inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.jobId?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
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
            placeholder="Search by invoice # or job title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-wrapper">
          <button className="filter-btn">
            <RiFilter3Line />
            <span>Filter</span>
          </button>
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
                        <span className="job-title">{inv.jobId?.title || "Direct Service"}</span>
                        <span className="provider-name">Provider: {inv.provider?.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="amount-paid">₹{inv.total.toLocaleString()}</span>
                    </td>
                    <td>
                      <span className="date">{new Date(inv.paidAt).toLocaleDateString()}</span>
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

      {}
      <InvoiceDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        invoice={selectedInvoice}
        onDownload={handleDownload}
      />

      <style>{`
        .qw-payment-history-container {
          max-width: 1000px;
          margin: 40px auto;
          padding: 0 20px;
          font-family: 'Inter', sans-serif;
        }

        .qw-page-header h1 {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 32px;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .qw-page-header p {
          color: #64748b;
          font-size: 16px;
        }

        .qw-history-controls {
          display: flex;
          gap: 16px;
          margin: 32px 0 24px;
        }

        .search-wrapper {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          color: #94a3b8;
          font-size: 20px;
        }

        .search-wrapper input {
          width: 100%;
          padding: 14px 16px 14px 48px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          background: #fff;
          font-size: 14px;
          transition: all 0.2s;
        }

        .search-wrapper input:focus {
          outline: none;
          border-color: #0f172a;
          box-shadow: 0 0 0 4px rgba(15, 23, 42, 0.05);
        }

        .filter-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 24px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          background: #fff;
          color: #0f172a;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
        }

        .qw-history-card {
          background: #fff;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
        }

        .qw-table-container {
          overflow-x: auto;
        }

        .qw-history-table {
          width: 100%;
          border-collapse: collapse;
        }

        .qw-history-table th {
          text-align: left;
          padding: 20px 24px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          color: #94a3b8;
          background: #fcfcfd;
          border-bottom: 1px solid #f1f5f9;
        }

        .qw-history-table td {
          padding: 24px;
          border-bottom: 1px solid #f8fafc;
        }

        .history-row {
          transition: background 0.2s;
        }

        .history-row:hover {
          background: #f8fafc;
        }

        .invoice-num {
          font-weight: 700;
          color: #0f172a;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
        }

        .job-title {
          display: block;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .provider-name {
          font-size: 12px;
          color: #64748b;
        }

        .amount-paid {
          font-weight: 800;
          color: #0f172a;
          font-size: 16px;
        }

        .method-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 100px;
          text-transform: uppercase;
        }

        .method-badge.online { background: #eff6ff; color: #3b82f6; }
        .method-badge.cash { background: #f0fdf4; color: #16a34a; }

        .action-group {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .icon-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .icon-btn.view:hover { color: #3b82f6; border-color: #3b82f6; background: #f0f7ff; }
        .icon-btn.download:hover { color: #16a34a; border-color: #16a34a; background: #f0fdf4; }

        .qw-pagination {
          padding: 24px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          border-top: 1px solid #f1f5f9;
        }

        .qw-pagination button {
          padding: 8px 16px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: #fff;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
        }

        .qw-pagination button:disabled { opacity: 0.5; cursor: not-allowed; }

        .text-right { text-align: right; }
        .animate-fade-in { animation: fadeIn 0.6s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default PaymentHistoryPage;
