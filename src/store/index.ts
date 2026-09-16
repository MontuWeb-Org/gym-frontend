import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "@/features/auth";
import { trainerReducer } from "@/features/trainer";
import programReducer from "@/features/trainer/store/program.slice"; // Import your program slice reducer

export const store = configureStore({
  reducer: {
    auth: authReducer,
    trainer: trainerReducer,
    trainerProgram: programReducer, 
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== "production", // Explicitly enable Redux DevTools for debugging
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;