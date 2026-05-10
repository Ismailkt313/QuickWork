import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { adminFinanceService } from '../services/adminFinance.service';

interface FinanceOverview {
    totalPlatformEarnings: number;
    totalTransactions: number;
    totalOnlinePayments: number;
    totalCashPayments: number;
    totalPendingDues: number;
}

export interface Transaction {
    _id: string;
    jobId: { _id: string; title: string; jobCode?: string };
    workHistoryId: string;
    providerId: string;
    type: string;
    paymentMethod: 'CASH' | 'ONLINE';
    totalAmount: number;
    platformFee: number;
    providerAmount: number;
    createdAt: string;
}

export interface AdminFinanceState {
    overview: FinanceOverview | null;
    transactions: Transaction[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    } | null;
    loading: boolean;
    error: string | null;
}

const initialState: AdminFinanceState = {
    overview: null,
    transactions: [],
    pagination: null,
    loading: false,
    error: null,
};

export const fetchFinanceOverview = createAsyncThunk(
    'adminFinance/fetchOverview',
    async (_, { rejectWithValue }) => {
        try {
            const response = await adminFinanceService.getOverview();
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch overview');
        }
    }
);

export const fetchTransactions = createAsyncThunk(
    'adminFinance/fetchTransactions',
    async (params: { page?: number; limit?: number; status?: string }, { rejectWithValue }) => {
        try {
            const response = await adminFinanceService.getTransactions(params);
            if (response.success) {
                return {
                    transactions: response.data,
                    pagination: response.pagination
                };
            }
            return rejectWithValue(response.message);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch transactions');
        }
    }
);

const adminFinanceSlice = createSlice({
    name: 'adminFinance',
    initialState,
    reducers: {
        clearFinanceError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder

            .addCase(fetchFinanceOverview.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFinanceOverview.fulfilled, (state, action: PayloadAction<FinanceOverview>) => {
                state.loading = false;
                state.overview = action.payload;
            })
            .addCase(fetchFinanceOverview.rejected, (state, action: PayloadAction<unknown>) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(fetchTransactions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTransactions.fulfilled, (state, action: PayloadAction<{ transactions: Transaction[]; pagination: { total: number; page: number; limit: number; pages: number } }>) => {
                state.loading = false;
                state.transactions = action.payload.transactions;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchTransactions.rejected, (state, action: PayloadAction<unknown>) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearFinanceError } = adminFinanceSlice.actions;
export default adminFinanceSlice.reducer;
