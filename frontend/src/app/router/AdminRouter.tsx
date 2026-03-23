import { Routes, Route } from "react-router-dom"

import AdminGuestGuard from "../../guards/AdminGuestGuard"
import AdminAuthGuard from "../../guards/AdminAuthGuard"

import AdminLoginPage from "../../features/admin/pages/AdminLoginPage"

import AdminLayout from "../../features/admin/components/AdminLayout"
import AdminDashboard from "../../features/admin/pages/AdminDashboard"
import UserManagement from "../../features/admin/pages/UserManagement"
import SkillRequests from "../../features/admin/pages/SkillRequests"
import ProviderManagement from "../../features/admin/pages/ProviderManagement"

const AdminRouter = () => {
  return (
    <Routes>

      <Route path="login" element={
        <AdminGuestGuard>
          <AdminLoginPage />
        </AdminGuestGuard>
      } />

      <Route path="/" element={
        <AdminAuthGuard>
          <AdminLayout />
        </AdminAuthGuard>
      }>

        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="skill-requests" element={<SkillRequests />} />
        <Route path="providers" element={<ProviderManagement />} />

      </Route>

    </Routes>
  )
}

export default AdminRouter