import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "@/features/auth";
import { trainerReducer } from "@/features/trainer";
import  userReducer  from "@/features/user/store/user.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    trainer: trainerReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;