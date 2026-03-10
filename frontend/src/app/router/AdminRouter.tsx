import { Routes, Route } from "react-router-dom"

import AdminGuestGuard from "../../admin/components/AdminGuestGuard"
import AdminAuthGuard from "../../admin/components/AdminAuthGuard"

import AdminLoginPage from "../../admin/pages/AdminLoginPage"

import AdminLayout from "../../admin/components/AdminLayout"
import AdminDashboard from "../../admin/pages/AdminDashboard"
import UserManagement from "../../admin/pages/UserManagement"
import SkillRequests from "../../admin/pages/SkillRequests"
import ProviderManagement from "../../admin/pages/ProviderManagement"

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