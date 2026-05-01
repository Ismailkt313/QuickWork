import { configureStore } from "@reduxjs/toolkit";
import onboardingReducer from "../features/provider/providerOnboarding/store/onboardingSlice";
import paymentReducer from "../features/finance/store/paymentSlice";
import walletReducer from "../features/finance/store/walletSlice";
import adminFinanceReducer from "../features/admin/store/adminFinanceSlice";
import adminReportReducer from "../features/admin/store/adminReportSlice";

export const store = configureStore({
  reducer: {
    onboarding: onboardingReducer,
    payment: paymentReducer,
    wallet: walletReducer,
    adminFinance: adminFinanceReducer,
    adminReport: adminReportReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
