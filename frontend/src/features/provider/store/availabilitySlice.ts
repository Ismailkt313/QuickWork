import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { providerService } from "../services/provider.service";
import { toast } from "react-toastify";

export interface Availability {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface BlockedDate {
  _id?: string;
  startDate: string;
  endDate: string;
  reason: string;
}

interface AvailabilityState {
  availability: Availability[];
  blockedDates: BlockedDate[];
  loading: boolean;
  error: string | null;
}

const initialState: AvailabilityState = {
  availability: [],
  blockedDates: [],
  loading: false,
  error: null,
};

export const fetchMyAvailability = createAsyncThunk(
  "availability/fetchMy",
  async (_, { rejectWithValue }) => {
    try {
      const response = await providerService.getMyProfile<{ availability: Availability[]; blockedDates: BlockedDate[] }>();
      return {
        availability: response.data?.availability || [],
        blockedDates: response.data?.blockedDates || [],
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || "Failed to fetch availability");
    }
  }
);

export const updateAvailability = createAsyncThunk(
  "availability/update",
  async (availability: Availability[], { rejectWithValue }) => {
    try {
      const response = await providerService.updateAvailability(availability);
      toast.success("Weekly availability updated");
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const msg = err.response?.data?.message || "Update failed";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const addBlockedDate = createAsyncThunk(
  "availability/addBlocked",
  async (data: Omit<BlockedDate, "_id">, { rejectWithValue }) => {
    try {
      const response = await providerService.addBlockedDate(data);
      toast.success("Blocked date added");
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const msg = err.response?.data?.message || "Failed to add blocked date";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const deleteBlockedDate = createAsyncThunk(
  "availability/deleteBlocked",
  async (id: string, { rejectWithValue }) => {
    try {
      await providerService.deleteBlockedDate(id);
      toast.success("Blocked date removed");
      return id;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const msg = err.response?.data?.message || "Deletion failed";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

const availabilitySlice = createSlice({
  name: "availability",
  initialState,
  reducers: {
    clearAvailabilityError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchMyAvailability.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyAvailability.fulfilled, (state, action) => {
        state.loading = false;
        state.availability = action.payload.availability;
        state.blockedDates = action.payload.blockedDates;
      })
      .addCase(fetchMyAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateAvailability.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAvailability.fulfilled, (state, action) => {
        state.loading = false;
        state.availability = action.payload.data || [];
      })
      .addCase(updateAvailability.rejected, (state) => {
        state.loading = false;
      })

      .addCase(addBlockedDate.fulfilled, (state, action) => {
        state.blockedDates = action.payload.data || [];
      })

      .addCase(deleteBlockedDate.fulfilled, (state, action) => {
        state.blockedDates = state.blockedDates.filter((d) => d._id !== action.payload);
      });
  },
});

export const { clearAvailabilityError } = availabilitySlice.actions;
export default availabilitySlice.reducer;
