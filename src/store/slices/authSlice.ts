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
  user: {
    id: "usr_1",
    name: "Alex Johnson",
    email: "alex@example.com",
    role: "admin", // Easily testable across all routes
  },
  isAuthenticated: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setRole: (state, action: PayloadAction<UserRole>) => {
      if (state.user) {
        state.user.role = action.payload;
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, setRole, logout } = authSlice.actions;
export default authSlice.reducer;