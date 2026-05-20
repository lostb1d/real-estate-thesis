import { useEffect, useState } from "react";
import {
  Users,
  Building2,
  UserCheck,
  Shield,
  KeyRound,
  Home,
  Clock,
  CheckCircle,
  Layers,
} from "lucide-react";

import { getSuperAdminDashboard } from "../../services/superAdminService";
import { getErrorMessage } from "../../utils/errorHandler";

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getSuperAdminDashboard();
        setStats(data);
      } catch (err) {
        setError(getErrorMessage(err));
      }
    };

    loadStats();
  }, []);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <p className="rounded-xl bg-red-100 p-4 text-sm text-red-700">
          {error}
        </p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        Loading superadmin dashboard...
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-100 text-slate-900">
      <header className="flex h-14 items-center justify-between border-b bg-white px-5">
        <div>
          <h1 className="text-base font-semibold">Superadmin Dashboard</h1>
          <p className="text-[11px] text-slate-500">
            Platform overview and system control
          </p>
        </div>
      </header>

      <main className="h-[calc(100vh-56px)] overflow-y-auto p-4">
        <div className="grid grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Users" value={stats.total_users} />
          <StatCard icon={UserCheck} label="Active Users" value={stats.active_users} />
          <StatCard icon={Building2} label="Agencies" value={stats.total_agencies} />
          <StatCard icon={CheckCircle} label="Verified Agencies" value={stats.verified_agencies} />
          <StatCard icon={Users} label="Agency Employees" value={stats.agency_employees} />
          <StatCard icon={Shield} label="Roles" value={stats.roles} />
          <StatCard icon={KeyRound} label="Permissions" value={stats.permissions} />
          <StatCard icon={Home} label="Properties" value={stats.total_properties} />
          <StatCard icon={Clock} label="Pending Properties" value={stats.pending_properties} />
          <StatCard icon={CheckCircle} label="Approved Properties" value={stats.approved_properties} />
          <StatCard icon={Layers} label="GIS Layers" value={stats.gis_layers} />
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <Icon size={24} className="text-slate-600" />
      <p className="mt-4 text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}