import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { financeService } from "../services/finance.service";
import { toast } from "react-toastify";

export const markAsPaidCash = createAsyncThunk(
  "payment/markAsPaidCash",
  async (workHistoryId: string, { rejectWithValue }) => {
    try {
      return await financeService.markAsPaidCash(workHistoryId);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to mark as paid");
      return rejectWithValue(err.response?.data);
    }
  }
);

export const confirmPayment = createAsyncThunk(
  "payment/confirmPayment",
  async (workHistoryId: string, { rejectWithValue }) => {
    try {
      return await financeService.confirmPayment(workHistoryId);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to confirm payment");
      return rejectWithValue(err.response?.data);
    }
  }
);

export const rejectPayment = createAsyncThunk(
  "payment/rejectPayment",
  async (workHistoryId: string, { rejectWithValue }) => {
    try {
      return await financeService.rejectPayment(workHistoryId);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to reject payment");
      return rejectWithValue(err.response?.data);
    }
  }
);

export const verifyRazorpayPayment = createAsyncThunk(
  "payment/verifyRazorpayPayment",
  async (data: {
    workHistoryId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }, { rejectWithValue }) => {
    try {
      return await financeService.verifyRazorpayPayment(data);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Payment verification failed");
      return rejectWithValue(err.response?.data);
    }
  }
);

interface PaymentState {
  loading: boolean;
  error: string | null;
  paymentStatus: "idle" | "pending" | "verifying" | "success" | "failed";
}

const initialState: PaymentState = {
  loading: false,
  error: null,
  paymentStatus: "idle",
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    resetPaymentStatus: (state) => {
      state.paymentStatus = "idle";
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(markAsPaidCash.pending, (state) => {
        state.loading = true;
      })
      .addCase(markAsPaidCash.fulfilled, (state) => {
        state.loading = false;
        toast.success("Payment marked as paid!");
      })
      .addCase(markAsPaidCash.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as { message?: string })?.message || "Error";
      })
      .addCase(confirmPayment.pending, (state) => {
        state.loading = true;
      })
      .addCase(confirmPayment.fulfilled, (state) => {
        state.loading = false;
        toast.success("Payment confirmed!");
      })
      .addCase(confirmPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as { message?: string })?.message || "Error";
      })
      .addCase(rejectPayment.pending, (state) => {
        state.loading = true;
      })
      .addCase(rejectPayment.fulfilled, (state) => {
        state.loading = false;
        toast.success("Payment rejection confirmed. Reverting status.");
      })
      .addCase(rejectPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as { message?: string })?.message || "Error";
      })
      .addCase(verifyRazorpayPayment.pending, (state) => {
        state.loading = true;
        state.paymentStatus = "verifying";
      })
      .addCase(verifyRazorpayPayment.fulfilled, (state) => {
        state.loading = false;
        state.paymentStatus = "success";
        toast.success("Payment verified successfully!");
      })
      .addCase(verifyRazorpayPayment.rejected, (state, action) => {
        state.loading = false;
        state.paymentStatus = "failed";
        state.error = (action.payload as { message?: string })?.message || "Error";
      });
  },
});

export const { resetPaymentStatus } = paymentSlice.actions;
export default paymentSlice.reducer;
