import { Routes, Route, useNavigate } from "react-router-dom";
import { logout } from "../../features/auth/services/authApi";
import { lazy, Suspense } from "react";
import FallbackScreen from "../../components/ui/FallbackScreen";
import ProviderGuard from "../../guards/ProviderGuard";
import ProviderDashboardLayout from "../../features/provider/layout/ProviderDashboardLayout";

import AuthGuard from "../../guards/AuthGurad";

const BecomeProviderPage = lazy(
  () => import("../../features/provider/pages/BecomeProviderPage"),
);
const ProviderSuccessPage = lazy(
  () =>
    import("../../features/provider/providerOnboarding/components/ProviderSuccessPage"),
);
const ProviderDashboardPage = lazy(
  () => import("../../features/provider/pages/ProviderDashboardPage"),
);
const AvailableJobsPage = lazy(
  () => import("../../features/provider/pages/availableJobs.page"),
);
const MessagesPage = lazy(
  () => import("../../features/provider/pages/MessagesPage"),
);
const JobDetailPage = lazy(
  () => import("../../features/provider/pages/JobDetailPage"),
);
const RequestsPage = lazy(
  () => import("../../features/provider/pages/RequestsPage"),
);
const MyJobsPage = lazy(
  () => import("../../features/provider/pages/MyJobs.page"),
);
const AssignmentDetailPage = lazy(
  () => import("../../features/provider/pages/AssignmentDetailPage"),
);
const ProviderProfilePage = lazy(
  () => import("../../features/provider/pages/ProviderProfilePage"),
);
const ProviderEarningsPage = lazy(
  () => import("../../features/finance/pages/ProviderEarningsPage"),
);
const ProviderReviewsPage = lazy(
  () => import("../../features/review/pages/ProviderReviewsPage"),
);

const ProviderRouter = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth/login");
  };

  return (
    <Suspense fallback={<FallbackScreen />}>
      <Routes>
        <Route
          path="become-provider"
          element={
            <AuthGuard>
              <ProviderGuard>
                <BecomeProviderPage />
              </ProviderGuard>
            </AuthGuard>
          }
        />

        <Route
          path="success"
          element={
            <AuthGuard>
              <ProviderGuard>
                <ProviderSuccessPage />
              </ProviderGuard>
            </AuthGuard>
          }
        />

        <Route
          element={
            <AuthGuard>
              <ProviderGuard>
                <ProviderDashboardLayout onLogout={handleLogout} />
              </ProviderGuard>
            </AuthGuard>
          }
        >
          <Route path="dashboard" element={<ProviderDashboardPage />} />
          <Route path="available-jobs" element={<AvailableJobsPage />} />
          <Route path="jobs/:jobId" element={<JobDetailPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="my-jobs" element={<MyJobsPage />} />
          <Route
            path="assignment/:assignmentId"
            element={<AssignmentDetailPage />}
          />
          <Route path="profile" element={<ProviderProfilePage />} />
          <Route path="wallet" element={<ProviderEarningsPage />} />
          <Route path="reviews" element={<ProviderReviewsPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default ProviderRouter;
