import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userService } from "@/features/user/services/user.service";
import { UpdateProfilePayload, User } from "@/features/user/types/user.types";

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  isLoading: false,
  error: null,
};

const getErrorMessage = (err: unknown): string => {
  if (!err) return "An unexpected error occurred.";
  const e = err as { response?: { data?: { message?: string } }; message?: string };
  return e.response?.data?.message || e.message || "An unexpected error occurred.";
};

export const getCurrentUserThunk = createAsyncThunk(
  "user/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await userService.getCurrentUser();
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err) || "Failed to fetch user profile.");
    }
  }
);

export const updateUserThunk = createAsyncThunk(
  "user/updateProfile",
  async (payload: UpdateProfilePayload, { dispatch, rejectWithValue }) => {
    try {
      await userService.updateProfile(payload);
      return await dispatch(getCurrentUserThunk()).unwrap();
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err) || "Failed to update profile.");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUser: (state) => {
      state.user = null;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCurrentUserThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentUserThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(getCurrentUserThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.error = action.payload as string;
      })
      .addCase(updateUserThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateUserThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearUser } = userSlice.actions;
export default userSlice.reducer;

export const selectCurrentUser = (state: { user: UserState }) => state.user.user;