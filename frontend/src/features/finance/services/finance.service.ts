import { api } from "../../../services/api";
import { ENDPOINTS } from "../../../constants/endpoints";

export interface Wallet {
  balance: number;
  providerId: string;
}

export interface Transaction {
  _id: string;
  type: "credit" | "debit";
  source: "cash_fee" | "online_payment" | "withdrawal";
  amount: number;
  balanceAfter: number;
  createdAt: string;
}

export interface WorkHistory {
  _id: string;
  jobId: { _id: string; title: string };
  clientId: string;
  providerId: string;
  finalStatus: string;
  payment: {
    method: "CASH" | "ONLINE";
    totalAmount: number;
    platformFee: number;
    providerAmount: number;
    status: "pending" | "awaiting_confirmation" | "completed";
    confirmedAt?: string;
  };
  endedAt: string;
}

export const financeService = {
  markAsPaidCash: async (workHistoryId: string) => {
    const response = await api.post(ENDPOINTS.FINANCE.PAYMENTS_CASH(workHistoryId));
    return response.data;
  },

  confirmPayment: async (workHistoryId: string) => {
    const response = await api.post(ENDPOINTS.FINANCE.PAYMENTS_CONFIRM(workHistoryId));
    return response.data;
  },
  
  rejectPayment: async (workHistoryId: string) => {
    const response = await api.post(ENDPOINTS.FINANCE.PAYMENTS_REJECT(workHistoryId));
    return response.data;
  },

  getWallet: async () => {
    const response = await api.get(ENDPOINTS.FINANCE.WALLET_ME);
    return response.data;
  },

  getTransactions: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get(ENDPOINTS.FINANCE.WALLET_TRANSACTIONS, { params });
    return response.data;
  },

  getAdminOverview: async () => {
    const response = await api.get(ENDPOINTS.FINANCE.WALLET_ADMIN_OVERVIEW);
    return response.data;
  },

  getPlatformEarnings: async () => {
    const response = await api.get(ENDPOINTS.FINANCE.PAYMENTS_ADMIN_EARNINGS);
    return response.data;
  },

  getWorkHistoryByAssignmentId: async (assignmentId: string) => {
    const response = await api.get(ENDPOINTS.FINANCE.PAYMENTS_HISTORY_ASSIGNMENT(assignmentId));
    return response.data;
  },

  getProviderHistory: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await api.get(ENDPOINTS.FINANCE.PAYMENTS_HISTORY_PROVIDER, { params });
    return response.data;
  },

  createRazorpayOrder: async (workHistoryId: string) => {
    const response = await api.post(ENDPOINTS.FINANCE.PAYMENTS_CREATE_ORDER, { workHistoryId });
    return response.data;
  },

  verifyRazorpayPayment: async (data: {
    workHistoryId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    const response = await api.post(ENDPOINTS.FINANCE.PAYMENTS_VERIFY, data);
    return response.data;
  },

  createJobRazorpayOrder: async (jobId: string) => {
    const response = await api.post(ENDPOINTS.FINANCE.PAYMENTS_JOB_CREATE_ORDER, { jobId });
    return response.data;
  },

  verifyJobRazorpayPayment: async (data: {
    jobId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    const response = await api.post(ENDPOINTS.FINANCE.PAYMENTS_JOB_VERIFY, data);
    return response.data;
  },
};
