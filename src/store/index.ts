import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "@/features/auth";
import { trainerReducer } from "@/features/trainer";
import userReducer from "@/features/user/store/user.slice";
import programReducer from "@/features/trainer/store/program.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    trainer: trainerReducer,
    user: userReducer,
    trainerProgram: programReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;