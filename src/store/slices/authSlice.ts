import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserRole } from "@/data/routes";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

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
        } catch {
          // Ignore localStorage errors in private mode
        }
      }
    },
    setRole: (state, action: PayloadAction<UserRole>) => {
      if (state.user) {
        state.user.role = action.payload;
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("gym_auth_user", JSON.stringify(state.user));
          } catch {
            // Ignore
          }
        }
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("gym_auth_user");
        } catch {
          // Ignore
        }
      }
    },
  },
});

export const { setUser, setRole, logout } = authSlice.actions;
export default authSlice.reducer;