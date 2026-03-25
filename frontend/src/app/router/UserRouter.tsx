import {Route, Routes} from "react-router-dom";
import { lazy, Suspense } from "react"
import AuthGuard from "../../guards/AuthGurad";
import FallbackScreen from "../../components/ui/FallbackScreen"

const AllServicesPage = lazy(() => import("../../features/user/serviceProviders/pages/AllServicesPage"))
const ProvidersPage = lazy(() => import("../../features/user/serviceProviders/pages/ProvidersPage"))
const ProviderDetailPage = lazy(() => import("../../features/user/serviceProviders/pages/ProviderDetailPage"))
const CreateJobPage = lazy(() => import("../../features/user/jobs/pages/CreateJobPage"))

const UserRouter = () => {
  return (
      <Routes>
          <Route path="services" element={
              <Suspense fallback={<FallbackScreen />}>
                  <AllServicesPage />
              </Suspense>
            } />
          <Route path="services/:skillId" element={
              <Suspense fallback={<FallbackScreen />}>
                  <ProvidersPage />
              </Suspense>
            } />
          <Route path="services/provider/:providerId" element={
              <Suspense fallback={<FallbackScreen />}>
                  <ProviderDetailPage />
              </Suspense>
            } />
          <Route path="create-job" element={
              <Suspense fallback={<FallbackScreen />}>
                  <AuthGuard>
                      <CreateJobPage />
                  </AuthGuard> 
              </Suspense>
            } />
        </Routes>
    )
}

export default UserRouter