import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "@/features/auth";
import { trainerReducer } from "@/features/trainer";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    trainer: trainerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;