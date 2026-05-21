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
import LayerCategoriesPage from "./pages/superadmin/gis/LayerCategoriesPage";
import SpatialLayersPage from "./pages/superadmin/gis/SpatialLayersPage";
import LayerAttributesPage from "./pages/superadmin/gis/LayerAttributesPage";
import SpatialFeaturesPage from "./pages/superadmin/gis/SpatialFeaturesPage";
import FeatureAttributeValuesPage from "./pages/superadmin/gis/FeatureAttributeValuesPage";
import RasterLayersPage from "./pages/superadmin/gis/RasterLayersPage";
import LayerUploadsPage from "./pages/superadmin/gis/LayerUploadsPage";

import CategorySpatialLayersPage from "./pages/superadmin/gis/CategorySpatialLayersPage";
import LayerSpatialFeaturesPage from "./pages/superadmin/gis/LayerSpatialFeaturesPage";

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
  {/* <Route path="/superadmin" element={<SuperAdminLayout />}> */}
  <Route path="gis-layers/categories" element={<LayerCategoriesPage />} />
  <Route path="gis-layers/layers" element={<SpatialLayersPage />} />
  <Route path="gis-layers/attributes" element={<LayerAttributesPage />} />
  <Route path="gis-layers/features" element={<SpatialFeaturesPage />} />
  <Route path="gis-layers/attribute-values" element={<FeatureAttributeValuesPage />} />
  <Route path="gis-layers/rasters" element={<RasterLayersPage />} />
  <Route path="gis-layers/uploads" element={<LayerUploadsPage />} />
    <Route
  path="gis-layers/categories/:categoryId/spatial-layers"
  element={<CategorySpatialLayersPage />}
/>

<Route
  path="gis-layers/layers/:layerId/features"
  element={<LayerSpatialFeaturesPage />}
/>
<Route
  path="gis-layers/layers/:layerId/features"
  element={<LayerSpatialFeaturesPage />}
/>


</Route>
{/* </Route> */}
      </Routes>

    </BrowserRouter>
  );
}