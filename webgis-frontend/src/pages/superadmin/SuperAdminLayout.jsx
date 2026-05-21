import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  Home,
  Layers,
  LogOut,
  ChevronDown,
  ChevronRight,
  FolderTree,
  Map,
  Upload,
  ListTree,
  MapPin,
  Database,
  Image,
} from "lucide-react";

export default function SuperAdminLayout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="fixed inset-0 flex h-screen w-screen overflow-hidden bg-slate-100 text-slate-900">
      <aside className="flex h-full w-64 shrink-0 flex-col border-r bg-white">
        <div className="border-b px-4 py-3">
          <h1 className="text-base font-semibold">Superadmin</h1>
          <p className="text-[11px] text-slate-500">WebGIS Real Estate</p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3 text-sm">
          <MenuItem to="/superadmin/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <MenuItem to="/superadmin/users" icon={Users} label="Users" />
          <MenuItem to="/superadmin/agencies" icon={Building2} label="Agencies" />
          <MenuItem to="/superadmin/properties" icon={Home} label="Properties" />

          <ExpandableMenu
  icon={Layers}
  label="GIS Layers"
  items={[
    { to: "/superadmin/gis-layers/categories", icon: FolderTree, label: "Layer Categories" },
    { to: "/superadmin/gis-layers/layers", icon: Map, label: "Spatial Layers" },
    { to: "/superadmin/gis-layers/attributes", icon: ListTree, label: "Layer Attributes" },
    { to: "/superadmin/gis-layers/features", icon: MapPin, label: "Spatial Features" },
    { to: "/superadmin/gis-layers/attribute-values", icon: Database, label: "Feature Values" },
    { to: "/superadmin/gis-layers/rasters", icon: Image, label: "Raster Layers" },
    { to: "/superadmin/gis-layers/uploads", icon: Upload, label: "Layer Uploads" },
  ]}
/>
        </nav>

        <div className="border-t p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <main className="h-full min-w-0 flex-1 overflow-y-auto bg-slate-100">
        <Outlet />
      </main>
    </div>
  );
}

function MenuItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 rounded-xl px-3 py-2 ${
          isActive
            ? "bg-slate-900 text-white"
            : "text-slate-600 hover:bg-slate-100"
        }`
      }
    >
      <Icon size={16} />
      {label}
    </NavLink>
  );
}

function ExpandableMenu({ icon: Icon, label, items }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-slate-600 hover:bg-slate-100"
      >
        <span className="flex items-center gap-2">
          <Icon size={16} />
          {label}
        </span>

        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>

      {open && (
        <div className="ml-4 mt-1 space-y-1 border-l pl-2">
          {items.map((item) => (
            <MenuItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
            />
          ))}
        </div>
      )}
    </div>
  );
}