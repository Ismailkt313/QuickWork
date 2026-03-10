import { Routes, Route } from "react-router-dom"
import { lazy, Suspense } from "react"
import FallbackScreen from "../../components/FallbackScreen"

import AuthGuard from "../../components/AuthGuard"

const BecomeProviderPage = lazy(() => import("../../pages/BecomeProviderPage"))
const ProviderSuccessPage = lazy(() => import("../../features/providerOnboarding/components/ProviderSuccessPage"))
const ProviderRouter = () => {
  return (
    <Routes>

      <Route path="become-provider" element={
        <Suspense fallback={<FallbackScreen />}>
        <AuthGuard>
          <BecomeProviderPage />
          </AuthGuard>
          </Suspense>
      } />

      <Route path="status" element={
        <AuthGuard>
          <ProviderSuccessPage />
        </AuthGuard>
      } />

    </Routes>
  )
}

export default ProviderRouter