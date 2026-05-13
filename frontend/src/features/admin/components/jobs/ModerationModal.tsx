import React, { useState } from 'react';
import { RiErrorWarningLine, RiCloseLine } from 'react-icons/ri';

interface ModerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (action: 'cancel' | 'suspend', reason: string) => Promise<void>;
  jobTitle: string;
}

export const ModerationModal: React.FC<ModerationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  jobTitle
}) => {
  const [action, setAction] = useState<'cancel' | 'suspend'>('cancel');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    
    setIsLoading(true);
    try {
      await onConfirm(action, reason);
      onClose();
    } catch (error) {
      console.error('Moderation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between align-items-center">
          <h3 className="text-lg font-bold text-slate-900">Moderate Operation</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <RiCloseLine size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100 mb-6">
              <RiErrorWarningLine className="text-amber-500 mt-1" size={20} />
              <div>
                <p className="text-sm font-bold text-amber-900 mb-1">Administrative Action</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  You are moderating <strong>{jobTitle}</strong>. This will notify both the client and all assigned providers.
                </p>
              </div>
            </div>

            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Action Strategy
            </label>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setAction('cancel')}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  action === 'cancel' 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <p className={`text-sm font-bold ${action === 'cancel' ? 'text-red-700' : 'text-slate-700'}`}>Cancel Job</p>
                <p className="text-[10px] text-slate-500 mt-1">Full termination of job.</p>
              </button>
              <button
                type="button"
                onClick={() => setAction('suspend')}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  action === 'suspend' 
                    ? 'border-amber-500 bg-amber-50' 
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <p className={`text-sm font-bold ${action === 'suspend' ? 'text-amber-700' : 'text-slate-700'}`}>Suspend</p>
                <p className="text-[10px] text-slate-500 mt-1">Temporary hold for review.</p>
              </button>
            </div>

            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Official Reason
            </label>
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none min-h-[120px] transition-all"
              placeholder="Provide a detailed explanation for this moderation action. This will be sent to all parties."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition-all"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={isLoading || !reason.trim()}
              className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm text-white transition-all shadow-lg ${
                action === 'cancel' 
                  ? 'bg-red-600 hover:bg-red-700 shadow-red-200' 
                  : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'
              } disabled:opacity-50`}
            >
              {isLoading ? 'Processing...' : `Confirm ${action === 'cancel' ? 'Cancellation' : 'Suspension'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
