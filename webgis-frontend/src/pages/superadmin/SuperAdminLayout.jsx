import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  Home,
  Layers,
  LogOut,
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
          <MenuItem to="/superadmin/gis-layers" icon={Layers} label="GIS Layers" />
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