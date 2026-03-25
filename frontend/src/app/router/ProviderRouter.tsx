import { Routes, Route } from "react-router-dom"
import { lazy, Suspense } from "react"
import FallbackScreen from "../../components/ui/FallbackScreen"
import ProviderGuard from "../../guards/ProviderGuard"
import ProviderDashboardLayout from "../../features/provider/layout/ProviderDashboardLayout"

import AuthGuard from "../../guards/AuthGurad"

const BecomeProviderPage = lazy(() => import("../../features/provider/pages/BecomeProviderPage"))
const ProviderSuccessPage = lazy(() => import("../../features/provider/providerOnboarding/components/ProviderSuccessPage"))
const ProviderDashboardPage = lazy(() => import("../../features/provider/pages/ProviderDashboardPage"))
const AvailableJobsPage = lazy(() => import("../../features/provider/pages/availableJobe.page"))
const MessagesPage = lazy(() => import("../../features/provider/pages/MessagesPage"))
const CompletedJobsPage = lazy(() => import("../../features/provider/pages/CompletedJobsPage"))
const JobDetailPage = lazy(() => import("../../features/provider/pages/JobDetailPage"))

const ProviderRouter = () => {
  return (
    <Routes>
      <Route path="become-provider" element={
        <Suspense fallback={<FallbackScreen />}>
          <AuthGuard>
            <ProviderGuard>
              <BecomeProviderPage />
            </ProviderGuard>
          </AuthGuard>
        </Suspense>
      } />

      <Route path="success" element={
        <AuthGuard>
          <Suspense fallback={<FallbackScreen />}>
            <ProviderGuard>
              <ProviderSuccessPage />
            </ProviderGuard>
          </Suspense>
        </AuthGuard>
      } />

      <Route
        element={
          <AuthGuard>
            <ProviderGuard>
              <ProviderDashboardLayout />
            </ProviderGuard>
          </AuthGuard>
        }
      >
        <Route path="dashboard" element={<ProviderDashboardPage />} />
        <Route path="available-jobs" element={<AvailableJobsPage />} />
        <Route path="jobs/:jobId" element={<JobDetailPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="completed-jobs" element={<CompletedJobsPage />} />
      </Route>
    </Routes>
  )
}

export default ProviderRouter