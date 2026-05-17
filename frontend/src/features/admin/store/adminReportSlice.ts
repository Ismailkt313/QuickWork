import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { adminReportService } from '../services/adminReport.service';

interface ReportUser {
    _id: string;
    name: string;
    email: string;
    isBlocked?: boolean;
    warningCount?: number;
}

interface Report {
    _id: string;
    assignmentId: string;
    reporterId: ReportUser;
    reportedUserId: ReportUser;
    role: string;
    reason: string;
    description?: string;
    images?: string[];
    status: string;
    createdAt: string;
}

interface ModerationLog {
    _id: string;
    userId: string;
    reportId: string;
    action: string;
    reason: string;
    adminId: { _id: string; name: string; email: string };
    createdAt: string;
}

interface AdminReportState {
    reports: Report[];
    selectedReport: Report | null;
    moderationLogs: ModerationLog[];
    pagination: {
        total: number;
        page: number;
        pages: number;
    } | null;
    loading: boolean;
    actionLoading: boolean;
    error: string | null;
}

const initialState: AdminReportState = {
    reports: [],
    selectedReport: null,
    moderationLogs: [],
    pagination: null,
    loading: false,
    actionLoading: false,
    error: null,
};

export const fetchAdminReports = createAsyncThunk(
    'adminReport/fetchReports',
    async (params: { status?: string; search?: string; page?: number; limit?: number }, { rejectWithValue }) => {
        try {
            const response = await adminReportService.getReports(params);
            if (response.success) {
                return { reports: response.data, pagination: response.pagination };
            }
            return rejectWithValue(response.message);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch reports');
        }
    }
);

export const fetchReportDetail = createAsyncThunk(
    'adminReport/fetchDetail',
    async (reportId: string, { rejectWithValue }) => {
        try {
            const response = await adminReportService.getReportDetail(reportId);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch report detail');
        }
    }
);

export const takeReportAction = createAsyncThunk(
    'adminReport/takeAction',
    async ({ reportId, action, reason }: { reportId: string; action: string; reason: string }, { rejectWithValue }) => {
        try {
            const response = await adminReportService.takeAction(reportId, { action, reason });
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to take action');
        }
    }
);

const adminReportSlice = createSlice({
    name: 'adminReport',
    initialState,
    reducers: {
        clearReportError: (state) => { state.error = null; },
        clearSelectedReport: (state) => {
            state.selectedReport = null;
            state.moderationLogs = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminReports.pending, (state) => {
                state.loading = true; state.error = null;
            })
            .addCase(fetchAdminReports.fulfilled, (state, action: PayloadAction<{ reports: Report[]; pagination: { total: number; page: number; pages: number } }>) => {
                state.loading = false;
                state.reports = action.payload.reports;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchAdminReports.rejected, (state, action: PayloadAction<unknown>) => {
                state.loading = false; state.error = action.payload as string;
            })
            .addCase(fetchReportDetail.pending, (state) => {
                state.loading = true; state.error = null;
            })
            .addCase(fetchReportDetail.fulfilled, (state, action: PayloadAction<{ report: Report; moderationLogs: ModerationLog[] }>) => {
                state.loading = false;
                state.selectedReport = action.payload.report;
                state.moderationLogs = action.payload.moderationLogs || [];
            })
            .addCase(fetchReportDetail.rejected, (state, action: PayloadAction<unknown>) => {
                state.loading = false; state.error = action.payload as string;
            })
            .addCase(takeReportAction.pending, (state) => {
                state.actionLoading = true; state.error = null;
            })
            .addCase(takeReportAction.fulfilled, (state, action: PayloadAction<{ report: Report; moderationLogs: ModerationLog[] }>) => {
                state.actionLoading = false;
                state.selectedReport = action.payload.report;
                state.moderationLogs = action.payload.moderationLogs || [];
            })
            .addCase(takeReportAction.rejected, (state, action: PayloadAction<unknown>) => {
                state.actionLoading = false; state.error = action.payload as string;
            });
    },
});

export const { clearReportError, clearSelectedReport } = adminReportSlice.actions;
export default adminReportSlice.reducer;
