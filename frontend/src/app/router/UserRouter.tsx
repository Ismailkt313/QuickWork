import {Route, Routes} from "react-router-dom";
import { lazy, Suspense } from "react"
import FallbackScreen from "../../components/ui/FallbackScreen"
import UserDashboardLayout from "../../features/user/layouts/UserDashboardLayout"

// Browsing Pages (Full Width)
const AllServicesPage = lazy(() => import("../../features/user/serviceProviders/pages/AllServicesPage"))
const ProvidersPage = lazy(() => import("../../features/user/serviceProviders/pages/ProvidersPage"))
const ProviderDetailPage = lazy(() => import("../../features/user/serviceProviders/pages/ProviderDetailPage"))

// Dashboard Pages (With Sidebar)
const UserJobsPage = lazy(() => import("../../features/user/pages/UserJobs.page"))
const UserJobDetailPage = lazy(() => import("../../features/user/pages/UserJobDetailPage"))

const UserRouter = () => {
    return (
        <Suspense fallback={<FallbackScreen />}>
            <Routes>
                {/* ── Browsing Routes (No Sidebar) ── */}
                <Route path="services" element={<AllServicesPage />} />
                <Route path="services/:skillId" element={<ProvidersPage />} />
                <Route path="services/provider/:providerId" element={<ProviderDetailPage />} />

                {/* ── Dashboard Routes (With Sidebar) ── */}
                <Route element={<UserDashboardLayout />}>
                    <Route path="jobs" element={<UserJobsPage />} />
                    <Route path="jobs/:jobId" element={<UserJobDetailPage />} />
                    
                    <Route path="profile" element={
                         /* Placeholder for Profile */
                        <div className="container py-5">
                            <h2 className="fw-bold h3 mb-4">My Profile</h2>
                            <p className="text-muted">Profile settings and personal information management.</p>
                        </div>
                    } />

                    <Route path="security" element={
                         /* Placeholder for Security */
                        <div className="container py-5">
                            <h2 className="fw-bold h3 mb-4">Security Settings</h2>
                            <p className="text-muted">Manage your password and security configurations.</p>
                        </div>
                    } />

                    <Route path="saved" element={
                         /* Placeholder for Saved Providers */
                        <div className="container py-5">
                            <h2 className="fw-bold h3 mb-4">Saved Providers</h2>
                            <p className="text-muted">Library of your favorite service providers.</p>
                        </div>
                    } />
                </Route>
            </Routes>
        </Suspense>
    )
}

export default UserRouter
