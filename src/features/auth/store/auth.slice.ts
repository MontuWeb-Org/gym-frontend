import { createSlice, createAsyncThunk, type ThunkDispatch, type UnknownAction } from "@reduxjs/toolkit";
import { authService } from "../services/auth.service";
import {
  RegisterInitPayload,
  RegisterCompletePayload,
  LoginPayload,
  ForgotPasswordInitPayload,
  ForgotPasswordCompletePayload,
  InviteAcceptPayload,
  InviteSetupPayload,
  InviteVerifyData,
} from "../types/auth.types";
import { tokenStorage } from "@/lib/storage";
import { clearUser, getCurrentUserThunk } from "@/features/user/store/user.slice";
import { User } from "@/features/user/types/user.types";

interface AuthState {
  creationToken: string | null;
  verificationToken: string | null;
  inviteDetails: InviteVerifyData | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  creationToken: null,
  verificationToken: null,
  inviteDetails: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: false,
  error: null,
};

type AppAsyncDispatch = ThunkDispatch<unknown, unknown, UnknownAction>;

const getErrorMessage = (err: unknown): string => {
  if (!err) return "An unexpected error occurred.";
  const e = err as { response?: { data?: { message?: string } }; message?: string };
  return e.response?.data?.message || e.message || "An unexpected error occurred.";
};

const completeAuthentication = async (
  accessToken: string,
  dispatch: AppAsyncDispatch
): Promise<User> => {
  tokenStorage.setAccessToken(accessToken);
  return dispatch(getCurrentUserThunk()).unwrap();
};

export const refreshTokenThunk = createAsyncThunk(
  "auth/refreshToken",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await authService.refreshToken();
      const user = await completeAuthentication(res.data.accessToken, dispatch);
      return user;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

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

export const registerCompleteThunk = createAsyncThunk(
  "auth/registerComplete",
  async (payload: RegisterCompletePayload, { dispatch, rejectWithValue }) => {
    try {
      const res = await authService.registerComplete(payload);
      const user = await completeAuthentication(res.data.accessToken, dispatch);
      return user;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err) || "OTP verification failed.");
    }
  }
);

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (payload: LoginPayload, { dispatch, rejectWithValue }) => {
    try {
      const res = await authService.login(payload);
      const user = await completeAuthentication(res.data.accessToken, dispatch);
      return user;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err) || "Login failed.");
    }
  }
);

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

export const forgotPasswordCompleteThunk = createAsyncThunk(
  "auth/forgotPasswordComplete",
  async (payload: ForgotPasswordCompletePayload, { dispatch, rejectWithValue }) => {
    try {
      const res = await authService.forgotPasswordComplete(payload);
      const user = await completeAuthentication(res.data.accessToken, dispatch);
      return user;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err) || "Password reset failed.");
    }
  }
);

export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    try {
      await authService.logout();
    } finally {
      tokenStorage.clearTokens();
      dispatch(clearUser());
    }
  }
);

export const inviteTraineeThunk = createAsyncThunk(
  "auth/inviteTrainee",
  async (email: string, { rejectWithValue }) => {
    try {
      await authService.inviteTrainee(email);
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err) || "Failed to send invite.");
    }
  }
);

export const inviteVerifyThunk = createAsyncThunk(
  "auth/inviteVerify",
  async (token: string, { rejectWithValue }) => {
    try {
      const res = await authService.inviteVerify(token);
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err) || "Invite verification failed.");
    }
  }
);

export const inviteAcceptThunk = createAsyncThunk(
  "auth/inviteAccept",
  async (payload: InviteAcceptPayload, { dispatch, rejectWithValue }) => {
    try {
      const res = await authService.inviteAccept(payload);
      if (res.data?.accessToken) {
        return await completeAuthentication(res.data.accessToken, dispatch);
      }
      return null;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err) || "Failed to accept invite.");
    }
  }
);

export const inviteSetupThunk = createAsyncThunk(
  "auth/inviteSetup",
  async (payload: InviteSetupPayload, { dispatch, rejectWithValue }) => {
    try {
      const res = await authService.inviteSetup(payload);
      return await completeAuthentication(res.data.accessToken, dispatch);
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err) || "Failed to set up account.");
    }
  }
);

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
      state.inviteDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Refresh Token
      .addCase(refreshTokenThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshTokenThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.isInitialized = true;
      })
      .addCase(refreshTokenThunk.rejected, (state) => {
        state.isLoading = false;
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
      .addCase(registerCompleteThunk.fulfilled, (state) => {
        state.isLoading = false;
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
      .addCase(loginThunk.fulfilled, (state) => {
        state.isLoading = false;
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
      .addCase(forgotPasswordCompleteThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.verificationToken = null;
      })
      .addCase(forgotPasswordCompleteThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Logout
      .addCase(logoutThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutThunk.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
      })

      // Invite Trainee
      .addCase(inviteTraineeThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(inviteTraineeThunk.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(inviteTraineeThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Invite Verify
      .addCase(inviteVerifyThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(inviteVerifyThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.creationToken = action.payload.creationToken;
        state.inviteDetails = action.payload;
      })
      .addCase(inviteVerifyThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Invite Accept
      .addCase(inviteAcceptThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(inviteAcceptThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.creationToken = null;
        state.inviteDetails = null;
      })
      .addCase(inviteAcceptThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Invite Setup
      .addCase(inviteSetupThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(inviteSetupThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.creationToken = null;
        state.inviteDetails = null;
      })
      .addCase(inviteSetupThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetFlowTokens } = authSlice.actions;
export default authSlice.reducer;