import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authService } from "../services/auth.service";
import { User, RegisterInitPayload, RegisterCompletePayload, LoginPayload } from "../types/auth.types";
import { tokenStorage } from "@/lib/storage";

interface AuthState {
  user: User | null;
  creationToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const getPersistedUser = (): User | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("gym_auth_user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const initialUser = getPersistedUser();

const initialState: AuthState = {
  user: initialUser,
  creationToken: null,
  isAuthenticated: !!initialUser,
  isLoading: false,
  error: null,
};

const getErrorMessage = (err: unknown): string | undefined => {
  if (!err) return undefined;
  const e = err as { response?: { data?: { message?: string } }; message?: string };
  return e.response?.data?.message ?? e.message;
};

export const registerInitThunk = createAsyncThunk(
  "auth/registerInit",
  async (payload: RegisterInitPayload, { rejectWithValue }) => {
    try {
      const res = await authService.registerInit(payload);
      return res.data.creationToken;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err) || "Registration initialization failed");
    }
  }
);

export const registerCompleteThunk = createAsyncThunk(
  "auth/registerComplete",
  async (payload: RegisterCompletePayload, { rejectWithValue }) => {
    try {
      const res = await authService.registerComplete(payload);
      if (res.data.accessToken) {
        tokenStorage.setAccessToken(res.data.accessToken);
      }
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue("OTP verification failed");
    }
  }
);

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const res = await authService.login(payload);
      if (res.data.accessToken) {
        tokenStorage.setAccessToken(res.data.accessToken);
      }
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue("Login failed");
    }
  }
);

export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  try {
    await authService.logout();
  } finally {
    tokenStorage.clearTokens();
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("gym_auth_user", JSON.stringify(action.payload));
        } catch {}
      }
    },
    clearError: (state) => {
      state.error = null;
      state.creationToken = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.creationToken = null;
    },
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(registerCompleteThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerCompleteThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = true;
      })
      .addCase(registerCompleteThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.creationToken = null;
      });
  },
});

export const { setUser, clearError, logout } = authSlice.actions;
export default authSlice.reducer;