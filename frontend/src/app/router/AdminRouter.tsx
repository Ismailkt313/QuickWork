import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import AdminGuestGuard from "../../guards/AdminGuestGuard";
import AdminAuthGuard from "../../guards/AdminAuthGuard";
import AdminLayout from "../../features/admin/components/AdminLayout";
import FallbackScreen from "../../components/ui/FallbackScreen";

const AdminLoginPage = lazy(() => import("../../features/admin/pages/AdminLoginPage"));
const AdminDashboard = lazy(() => import("../../features/admin/pages/AdminDashboard"));
const UserManagement = lazy(() => import("../../features/admin/pages/UserManagement"));
const SkillRequests = lazy(() => import("../../features/admin/pages/SkillRequests"));
const ProviderManagement = lazy(() => import("../../features/admin/pages/ProviderManagement"));
const AdminFinancePage = lazy(() => import("../../features/finance/pages/AdminFinancePage"));
const AdminReportsPage = lazy(() => import("../../features/admin/pages/AdminReportsPage"));
const AdminReportDetailPage = lazy(() => import("../../features/admin/pages/AdminReportDetailPage"));
const AdminSettingsPage = lazy(() => import("../../features/admin/pages/AdminSettingsPage"));

const AdminRouter = () => {
  return (
    <Suspense fallback={<FallbackScreen />}>
      <Routes>
        <Route
          path="login"
          element={
            <AdminGuestGuard>
              <AdminLoginPage />
            </AdminGuestGuard>
          }
        />

        <Route
          path="/"
          element={
            <AdminAuthGuard>
              <AdminLayout />
            </AdminAuthGuard>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="skill-requests" element={<SkillRequests />} />
          <Route path="providers" element={<ProviderManagement />} />
          <Route path="transactions" element={<AdminFinancePage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="reports/:id" element={<AdminReportDetailPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AdminRouter;
