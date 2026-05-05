import React from "react";
import {
  RiCloseLine,
  RiDownload2Line,
  RiBillLine,
  RiMapPin2Line,
  RiCheckFill
} from "react-icons/ri";
import type { IInvoice } from "../services/finance.service";

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: IInvoice | null;
  onDownload: (id: string, number: string) => void;
}

const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onDownload
}) => {
  if (!isOpen || !invoice) return null;

  return (
    <div className="qw-modal-overlay" onClick={onClose}>
      <div className="qw-modal-content animate-pop-in" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="qw-modal-header mb-4">
          <div className="d-flex align-items-center gap-3">
            <div className="qw-header-icon-box invoice">
              <RiBillLine size={24} />
            </div>
            <div className="flex-grow-1">
              <h4 className="qw-modal-title">Official Invoice</h4>
              <p className="qw-modal-subtitle">Invoice #{invoice.invoiceNumber}</p>
            </div>
            <button className="qw-modal-close-btn" onClick={onClose}>
              <RiCloseLine size={24} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="qw-modal-body-scroll">
          {/* Status Banner */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="status-badge-paid">
              <RiCheckFill />
              <span>PAID</span>
            </div>
            <div className="text-end">
              <span className="qw-label-tiny">Paid On</span>
              <p className="fw-bold m-0">{new Date(invoice.paidAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Billing Info */}
          <div className="qw-billing-info-grid mb-4">
            <div className="billing-col">
              <label className="qw-field-label">Billed To</label>
              <p className="party-name">{invoice.client.name}</p>
              <p className="party-email">{invoice.client.email}</p>
            </div>
            <div className="billing-col text-end">
              <label className="qw-field-label">Issued By</label>
              <p className="party-name">{invoice.provider.name}</p>
              <p className="party-email">{invoice.provider.email}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="qw-invoice-items-card mb-4">
            <table className="qw-items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th className="text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(invoice as any).items?.length > 0 ? (
                  (invoice as any).items.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td>{item.description}</td>
                      <td className="text-end">₹{item.amount.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td>Service: {invoice.jobId?.title}</td>
                    <td className="text-end">₹{invoice.total.toLocaleString()}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Summary Section */}
          <div className="qw-invoice-summary-card">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{invoice.total.toLocaleString()}</span>
            </div>
            <div className="summary-row total">
              <span>Total Paid</span>
              <span className="total-amount">₹{invoice.total.toLocaleString()}</span>
            </div>
            <p className="payment-method-text">Paid via {invoice.paymentMethod}</p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-4">
          <button
            className="qw-modal-submit-btn primary"
            onClick={() => onDownload(invoice._id, invoice.invoiceNumber)}
          >
            <RiDownload2Line size={20} />
            <span>Download PDF Invoice</span>
          </button>
        </div>
      </div>

      <style>{`
        .qw-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          z-index: 10000;
          overflow-y: auto;
        }

        .qw-modal-content {
          background: #fff;
          width: 100%;
          max-width: 520px;
          padding: 40px;
          border-radius: 32px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
          position: relative;
          margin: auto;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
        }

        .qw-modal-body-scroll {
            overflow-y: auto;
            padding-right: 8px;
            scrollbar-width: thin;
            scrollbar-color: #cbd5e1 transparent;
        }

        .qw-modal-body-scroll::-webkit-scrollbar { width: 6px; }
        .qw-modal-body-scroll::-webkit-scrollbar-track { background: transparent; }
        .qw-modal-body-scroll::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }

        .qw-modal-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 22px;
          margin: 0;
          color: #0f172a;
        }

        .qw-modal-subtitle {
          color: #64748b;
          font-size: 13px;
          margin: 2px 0 0;
        }

        .qw-header-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .qw-header-icon-box.invoice { background: #f0f9ff; color: #0ea5e9; }

        .qw-modal-close-btn {
          border: none;
          background: #f8fafc;
          width: 36px;
          height: 36px;
          border-radius: 12px;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .qw-modal-close-btn:hover { background: #f1f5f9; color: #0f172a; }

        .status-badge-paid {
          background: #f0fdf4;
          color: #16a34a;
          padding: 6px 12px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 800;
          font-size: 12px;
          border: 1px solid #dcfce7;
        }

        .qw-label-tiny {
          display: block;
          font-size: 10px;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .qw-billing-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 18px;
          border: 1px solid #f1f5f9;
        }

        .qw-field-label {
          display: block;
          font-size: 10px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 8px;
          letter-spacing: 0.05em;
        }

        .party-name { margin: 0; font-weight: 800; color: #0f172a; font-size: 14px; }
        .party-email { margin: 2px 0 0; font-size: 12px; color: #64748b; word-break: break-all; }

        .qw-items-table {
          width: 100%;
          border-collapse: collapse;
        }

        .qw-items-table th {
          text-align: left;
          font-size: 11px;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          padding-bottom: 12px;
          border-bottom: 2px solid #f1f5f9;
        }

        .qw-items-table td {
          padding: 14px 0;
          font-weight: 700;
          color: #1e293b;
          border-bottom: 1px solid #f1f5f9;
          font-size: 14px;
        }

        .qw-invoice-summary-card {
          margin-left: auto;
          max-width: 260px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          color: #64748b;
          font-weight: 700;
          font-size: 14px;
        }

        .summary-row.total {
          margin-top: 14px;
          padding-top: 14px;
          border-top: 2px dashed #e2e8f0;
          color: #0f172a;
        }

        .total-amount {
          font-size: 24px;
          font-weight: 900;
          font-family: 'Syne', sans-serif;
        }

        .payment-method-text {
          margin: 6px 0 0;
          text-align: right;
          font-size: 10px;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
        }

        .qw-modal-submit-btn {
          width: 100%;
          height: 56px;
          border-radius: 16px;
          border: none;
          font-weight: 700;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all 0.2s;
          cursor: pointer;
        }

        .qw-modal-submit-btn.primary {
          background: #0f172a;
          color: #fff;
          box-shadow: 0 10px 20px rgba(15, 23, 42, 0.15);
        }

        .qw-modal-submit-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
          box-shadow: 0 15px 30px rgba(15, 23, 42, 0.2);
        }

        .animate-pop-in { animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .text-end { text-align: right; }
      `}</style>
    </div>
  );
};

export default InvoiceDetailModal;
