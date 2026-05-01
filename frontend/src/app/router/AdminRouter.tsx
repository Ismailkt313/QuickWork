import { Routes, Route } from "react-router-dom";

import AdminGuestGuard from "../../guards/AdminGuestGuard";
import AdminAuthGuard from "../../guards/AdminAuthGuard";

import AdminLoginPage from "../../features/admin/pages/AdminLoginPage";

import AdminLayout from "../../features/admin/components/AdminLayout";
import AdminDashboard from "../../features/admin/pages/AdminDashboard";
import UserManagement from "../../features/admin/pages/UserManagement";
import SkillRequests from "../../features/admin/pages/SkillRequests";
import ProviderManagement from "../../features/admin/pages/ProviderManagement";
import AdminFinancePage from "../../features/finance/pages/AdminFinancePage";
import AdminReportsPage from "../../features/admin/pages/AdminReportsPage";
import AdminReportDetailPage from "../../features/admin/pages/AdminReportDetailPage";
import AdminSettingsPage from "../../features/admin/pages/AdminSettingsPage";

const AdminRouter = () => {
  return (
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
  );
};

export default AdminRouter;
