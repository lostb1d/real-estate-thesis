import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyOtp from "./pages/auth/VerifyOtp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ChangePassword from "./pages/auth/ChangePassword";
import Dashboard from "./pages/dashboard/Dashboard";
import Profile from "./pages/profile/Profile";
import CreateProperty from "./pages/properties/CreateProperty";
// import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";

import SuperAdminLayout from "./pages/superadmin/SuperAdminLayout";
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import SuperAdminUsers from "./pages/superadmin/SuperAdminUsers";
import SuperAdminAgencies from "./pages/superadmin/SuperAdminAgencies";
import SuperAdminProperties from "./pages/superadmin/SuperAdminProperties";
import SuperAdminGISLayers from "./pages/superadmin/SuperAdminGISLayers";
function Dashboard1() {
  return <div className="p-6 text-2xl font-bold">Dashboard</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/properties/create" element={<CreateProperty />} />
      <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
      <Route path="/superadmin" element={<SuperAdminLayout />}>
  {/* <Route path="dashboard" element={<SuperAdminDashboard />} /> */}
  <Route path="users" element={<SuperAdminUsers />} />
  <Route path="agencies" element={<SuperAdminAgencies />} />
  <Route path="properties" element={<SuperAdminProperties />} />
  <Route path="gis-layers" element={<SuperAdminGISLayers />} />
</Route>
      </Routes>

    </BrowserRouter>
  );
}