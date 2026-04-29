import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  getAssignments,
  cancelAssignmentByProvider,
} from "../services/provider.service";

interface Assignment {
  id: string;
  jobId: string;
  workStatus: "assigned" | "in_progress" | "completed" | "cancelled" | "absent";
  schedule: {
    startDate: string;
    endDate: string;
  };
}

interface AssignmentState {
  assignments: Assignment[];
  loading: boolean;
  error: string | null;
}

const initialState: AssignmentState = {
  assignments: [],
  loading: false,
  error: null,
};

export const fetchAssignments = createAsyncThunk(
  "assignments/fetchAssignments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAssignments();
      return response.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch assignments";
      return rejectWithValue(message);
    }
  },
);

export const cancelByProvider = createAsyncThunk(
  "assignments/cancelByProvider",
  async (
    { id, notes }: { id: string; notes?: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await cancelAssignmentByProvider(id, notes);
      return response.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to cancel assignment";
      return rejectWithValue(message);
    }
  },
);

const assignmentSlice = createSlice({
  name: "assignments",
  initialState,
  reducers: {
    updateAssignmentStatus: (
      state,
      action: PayloadAction<{ id: string; status: Assignment["workStatus"] }>,
    ) => {
      const assignment = state.assignments.find(
        (a) => a.id === action.payload.id,
      );
      if (assignment) {
        assignment.workStatus = action.payload.status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssignments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments = action.payload;
      })
      .addCase(fetchAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(cancelByProvider.fulfilled, (state, action) => {
        const index = state.assignments.findIndex(
          (a) => a.id === action.payload.id,
        );
        if (index !== -1) {
          state.assignments[index] = action.payload;
        }
      });
  },
});

export const { updateAssignmentStatus } = assignmentSlice.actions;
export default assignmentSlice.reducer;
