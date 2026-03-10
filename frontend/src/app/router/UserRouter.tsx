import {Route, Routes} from "react-router-dom";
import { lazy, Suspense } from "react"
import FallbackScreen from "../../components/FallbackScreen"

const AllServicesPage = lazy(() => import("../../pages/AllServicesPage"))
const ProvidersPage = lazy(() => import("../../pages/ProvidersPage"))
const ProviderDetailPage = lazy(() => import("../../pages/ProviderDetailPage"))
const CreateJobPage = lazy(() => import("../../features/jobs/pages/CreateJobPage"))

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
                  <CreateJobPage />
              </Suspense>
            } />
        </Routes>
    )
}

export default UserRouter