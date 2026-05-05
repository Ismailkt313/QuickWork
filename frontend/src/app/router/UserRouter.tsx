import { Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import FallbackScreen from "../../components/ui/FallbackScreen";
import UserDashboardLayout from "../../features/user/layouts/UserDashboardLayout";
import AuthGuard from "../../guards/AuthGurad";

const AllServicesPage = lazy(
  () => import("../../features/user/serviceProviders/pages/AllServicesPage"),
);
const ProvidersPage = lazy(
  () => import("../../features/user/serviceProviders/pages/ProvidersPage"),
);
const ProviderDetailPage = lazy(
  () => import("../../features/user/serviceProviders/pages/ProviderDetailPage"),
);

const UserJobsPage = lazy(
  () => import("../../features/user/pages/UserJobs.page"),
);
const UserJobDetailPage = lazy(
  () => import("../../features/user/pages/UserJobDetailPage"),
);
const UserProfilePage = lazy(
  () => import("../../features/user/pages/UserProfilePage"),
);
const MessagesPage = lazy(
  () => import("../../features/message/pages/messagePage"),
);
const PaymentHistoryPage = lazy(
  () => import("../../features/finance/pages/PaymentHistoryPage"),
);

const UserRouter = () => {
  return (
    <Suspense fallback={<FallbackScreen />}>
      <AuthGuard>
        <Routes>
          <Route path="services" element={<AllServicesPage />} />
          <Route path="services/:skillId" element={<ProvidersPage />} />
          <Route
            path="services/provider/:providerId"
            element={<ProviderDetailPage />}
          />
          <Route element={<UserDashboardLayout />}>
            <Route path="jobs" element={<UserJobsPage />} />
            <Route path="jobs/:jobId" element={<UserJobDetailPage />} />
            <Route path="profile" element={<UserProfilePage />} />
            <Route path="security" element={<UserProfilePage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="payment-history" element={<PaymentHistoryPage />} />
            <Route
              path="saved"
              element={
                <div className="container py-5">
                  <h2 className="fw-bold h3 mb-4">Saved Providers</h2>
                  <p className="text-muted">
                    Library of your favorite service providers.
                  </p>
                </div>
              }
            />
          </Route>
        </Routes>
      </AuthGuard>
    </Suspense>
  );
};

export default UserRouter;
