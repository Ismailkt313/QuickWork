import React, { useState } from 'react';
import { RiAlertFill, RiCloseLine, RiErrorWarningLine, RiInformationLine, RiCheckboxCircleLine } from 'react-icons/ri';

interface AdminCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  jobTitle: string;
}

const TERMINATION_REASONS = [
  "Policy Violation",
  "Safety Risk",
  "Fraud Detected",
  "Client Requested",
  "Duplicate Post",
  "Other"
];

export const AdminCancelModal: React.FC<AdminCancelModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  jobTitle
}) => {
  const [selectedReason, setSelectedReason] = useState(TERMINATION_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = selectedReason === "Other" ? customReason : selectedReason;
    if (!finalReason.trim()) return;
    
    setIsLoading(true);
    try {
      await onConfirm(finalReason);
      onClose();
    } catch (error) {
      console.error('Termination failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[420px] overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600 border border-red-100">
              <RiAlertFill size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Terminate Mission</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Operational Governance Action</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-all">
            <RiCloseLine size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Warning Section */}
          <div className="mb-6 p-4 bg-red-50/50 rounded-xl border border-red-100/50">
            <div className="flex gap-3">
              <RiErrorWarningLine className="text-red-500 mt-0.5 shrink-0" size={18} />
              <div className="min-w-0">
                <p className="text-[11px] font-black text-red-900 uppercase tracking-widest mb-1">Irreversible Action</p>
                <p className="text-[12px] text-red-700/80 leading-snug font-medium">
                  Termination of <span className="font-black">"{jobTitle}"</span> will immediately notify all stakeholders and release escrow.
                </p>
              </div>
            </div>
          </div>

          {/* Reason Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                Primary Violation Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TERMINATION_REASONS.map(reason => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setSelectedReason(reason)}
                    className={`px-3 py-2.5 rounded-xl border text-left transition-all relative overflow-hidden group ${
                      selectedReason === reason 
                        ? 'border-slate-900 bg-slate-900 text-white ring-4 ring-slate-900/5' 
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-[11px] font-black relative z-10">{reason}</span>
                    {selectedReason === reason && (
                      <RiCheckboxCircleLine className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Reason */}
            <div className={`transition-all duration-300 ${selectedReason === "Other" ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none h-0'}`}>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                Detailed Audit Log Entry
              </label>
              <textarea
                required={selectedReason === "Other"}
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-1 focus:ring-slate-900 focus:bg-white outline-none min-h-[100px] transition-all resize-none placeholder:text-slate-300"
                placeholder="Describe the specific reason for this governance action..."
              />
            </div>
          </div>

          {/* Guidelines */}
          <div className="mt-6 flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <RiInformationLine className="text-slate-400 mt-0.5" size={16} />
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              This action will be recorded in the system audit logs with your administrator ID.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all border border-slate-200"
            >
              Abort Action
            </button>
            <button
              type="submit"
              disabled={isLoading || (selectedReason === "Other" && !customReason.trim())}
              className="flex-[1.5] h-11 rounded-xl font-black text-[10px] uppercase tracking-widest text-white bg-red-600 hover:bg-red-700 transition-all shadow-xl shadow-red-200 disabled:opacity-50 disabled:shadow-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : 'Finalize Termination'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
