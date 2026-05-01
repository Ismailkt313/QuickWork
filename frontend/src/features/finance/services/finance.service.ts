import { api } from "../../../services/api";

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
    const response = await api.post(`/payments/cash/${workHistoryId}`);
    return response.data;
  },

  confirmPayment: async (workHistoryId: string) => {
    const response = await api.post(`/payments/confirm/${workHistoryId}`);
    return response.data;
  },
  
  rejectPayment: async (workHistoryId: string) => {
    const response = await api.post(`/payments/reject/${workHistoryId}`);
    return response.data;
  },

  getWallet: async () => {
    const response = await api.get("/wallet/me");
    return response.data;
  },

  getTransactions: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get("/wallet/transactions", { params });
    return response.data;
  },

  getAdminOverview: async () => {
    const response = await api.get("/wallet/admin/overview");
    return response.data;
  },

  getPlatformEarnings: async () => {
    const response = await api.get("/payments/admin/earnings");
    return response.data;
  },

  getWorkHistoryByAssignmentId: async (assignmentId: string) => {
    const response = await api.get(`/payments/history/assignment/${assignmentId}`);
    return response.data;
  },

  getProviderHistory: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await api.get("/payments/history/provider", { params });
    return response.data;
  },

  createRazorpayOrder: async (workHistoryId: string) => {
    const response = await api.post("/payments/create-order", { workHistoryId });
    return response.data;
  },

  verifyRazorpayPayment: async (data: {
    workHistoryId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    const response = await api.post("/payments/verify", data);
    return response.data;
  },

  createJobRazorpayOrder: async (jobId: string) => {
    const response = await api.post("/payments/job/create-order", { jobId });
    return response.data;
  },

  verifyJobRazorpayPayment: async (data: {
    jobId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    const response = await api.post("/payments/job/verify", data);
    return response.data;
  },
};
