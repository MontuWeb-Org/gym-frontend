import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../services/auth.service";
import {
  RegisterInitPayload,
  RegisterCompletePayload,
  LoginPayload,
  ForgotPasswordInitPayload,
  ForgotPasswordCompletePayload,
} from "../types/auth.types";
import { User } from "@/types/user.types";
import { tokenStorage } from "@/lib/storage";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  creationToken: string | null;
  verificationToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  creationToken: null,
  verificationToken: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: false,
  error: null,
};

const getErrorMessage = (err: unknown): string => {
  if (!err) return "An unexpected error occurred.";
  const e = err as { response?: { data?: { message?: string } }; message?: string };
  return e.response?.data?.message || e.message || "An unexpected error occurred.";
};

// --- Thunks ---

// 1. Refresh Token + Profile Fetch
export const refreshTokenThunk = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const res = await authService.refreshToken();
      const userRes = await authService.getCurrentUser(res.data.accessToken);
      return { accessToken: res.data.accessToken, user: userRes.data };
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

// 2. Register Init
export const registerInitThunk = createAsyncThunk(
  "auth/registerInit",
  async (payload: RegisterInitPayload, { rejectWithValue }) => {
    try {
      const res = await authService.registerInit(payload);
      return res.data.creationToken;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err) || "Registration initialization failed.");
    }
  }
);

// 3. Register Complete + Profile Fetch
export const registerCompleteThunk = createAsyncThunk(
  "auth/registerComplete",
  async (payload: RegisterCompletePayload, { rejectWithValue }) => {
    try {
      const res = await authService.registerComplete(payload);
      const userRes = await authService.getCurrentUser(res.data.accessToken);
      return { accessToken: res.data.accessToken, user: userRes.data };
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err) || "OTP verification failed.");
    }
  }
);

// 4. Login + Profile Fetch
export const loginThunk = createAsyncThunk(
  "auth/login",
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const res = await authService.login(payload);
      const userRes = await authService.getCurrentUser(res.data.accessToken);
      return { accessToken: res.data.accessToken, user: userRes.data };
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err) || "Login failed.");
    }
  }
);

// 5. Forgot Password Init
export const forgotPasswordInitThunk = createAsyncThunk(
  "auth/forgotPasswordInit",
  async (payload: ForgotPasswordInitPayload, { rejectWithValue }) => {
    try {
      const res = await authService.forgotPasswordInit(payload);
      return res.data.verificationToken;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err) || "Forgot password initialization failed.");
    }
  }
);

// 6. Forgot Password Complete + Profile Fetch
export const forgotPasswordCompleteThunk = createAsyncThunk(
  "auth/forgotPasswordComplete",
  async (payload: ForgotPasswordCompletePayload, { rejectWithValue }) => {
    try {
      const res = await authService.forgotPasswordComplete(payload);
      const userRes = await authService.getCurrentUser(res.data.accessToken);
      return { accessToken: res.data.accessToken, user: userRes.data };
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err) || "Password reset failed.");
    }
  }
);

// 7. Get Current User Direct Call
export const getCurrentUserThunk = createAsyncThunk(
  "auth/getCurrentUser",
  async (token: string, { rejectWithValue }) => {
    try {
      const res = await authService.getCurrentUser(token);
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err) || "Failed to fetch user profile.");
    }
  }
);

// 8. Logout
export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  try {
    await authService.logout();
  } finally {
    tokenStorage.clearTokens();
  }
});

// --- Slice ---

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetFlowTokens: (state) => {
      state.creationToken = null;
      state.verificationToken = null;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.creationToken = null;
      state.verificationToken = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Refresh Token
      .addCase(refreshTokenThunk.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isInitialized = true;
      })
      .addCase(refreshTokenThunk.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
      })

      // Register Init
      .addCase(registerInitThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerInitThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.creationToken = action.payload;
      })
      .addCase(registerInitThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Register Complete
      .addCase(registerCompleteThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerCompleteThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.creationToken = null;
      })
      .addCase(registerCompleteThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Login
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Forgot Password Init
      .addCase(forgotPasswordInitThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPasswordInitThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.verificationToken = action.payload;
      })
      .addCase(forgotPasswordInitThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Forgot Password Complete
      .addCase(forgotPasswordCompleteThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.verificationToken = null;
      })
      .addCase(forgotPasswordCompleteThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get Current User
      .addCase(getCurrentUserThunk.pending, (state) => {
        state.isLoading = true;
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

      // Logout
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.creationToken = null;
        state.verificationToken = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError, resetFlowTokens, logout } = authSlice.actions;
export default authSlice.reducer;