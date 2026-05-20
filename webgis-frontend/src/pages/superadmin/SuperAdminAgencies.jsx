import { useEffect, useState } from "react";
import {
  Eye,
  Pencil,
  Trash2,
  ShieldCheck,
  Search,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { getSuperAdminAgencies } from "../../services/superAdminService";
import { getErrorMessage } from "../../utils/errorHandler";

export default function SuperAdminAgencies() {
  const [agencies, setAgencies] = useState([]);
  const [count, setCount] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const totalPages = Math.ceil(count / pageSize);

  const loadAgencies = async () => {
    try {
      setError("");

      const data = await getSuperAdminAgencies({
        page,
        pageSize,
        search,
      });

      setAgencies(data.results || []);
      setCount(data.count || 0);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    loadAgencies();
  }, [page, pageSize]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadAgencies();
  };

  return (
    <div className="h-full overflow-hidden p-4">
      <div className="flex h-full flex-col rounded-2xl bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h1 className="text-base font-semibold">Agencies Management</h1>
            <p className="text-[11px] text-slate-500">
              Verify and manage real estate agencies
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border px-3">
              <Search size={14} className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search agencies..."
                className="py-2 text-xs outline-none"
              />
            </div>

            <button className="rounded-xl bg-slate-900 px-4 py-2 text-xs text-white">
              Search
            </button>
          </form>
        </div>

        {error && (
          <p className="m-4 rounded-xl bg-red-100 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full border-collapse text-xs">
            <thead className="sticky top-0 bg-slate-50">
              <tr className="border-b text-left text-[11px] font-medium uppercase tracking-wide text-slate-500">
                <th className="w-14 px-4 py-3">SN</th>
                <th className="px-4 py-3">Agency</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Employees</th>
                <th className="px-4 py-3">Properties</th>
                <th className="px-4 py-3">Verified</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {agencies.map((agency, index) => (
                <tr key={agency.id} className="border-b hover:bg-slate-50">
                  <td className="px-4 py-3">
                    {(page - 1) * pageSize + index + 1}
                  </td>

                  <td className="px-4 py-3">
                    <p className="font-medium">{agency.name}</p>
                    <p className="text-[11px] text-slate-500">
                      Reg: {agency.registration_no || "-"} | PAN:{" "}
                      {agency.pan_no || "-"}
                    </p>
                  </td>

                  <td className="px-4 py-3">
                    <p className="font-medium">{agency.owner_name || "-"}</p>
                    <p className="text-[11px] text-slate-500">
                      {agency.owner_email || "-"}
                    </p>
                  </td>

                  <td className="px-4 py-3">
                    <p>{agency.email || "-"}</p>
                    <p className="text-[11px] text-slate-500">
                      {agency.phone || "-"}
                    </p>
                  </td>

                  <td className="px-4 py-3">
                    {agency.total_employees ?? 0}
                  </td>

                  <td className="px-4 py-3">
                    {agency.total_properties ?? 0}
                  </td>

                  <td className="px-4 py-3">
                    {agency.is_verified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[10px] text-emerald-700">
                        <CheckCircle size={11} />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[10px] text-amber-700">
                        <XCircle size={11} />
                        Pending
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] ${
                        agency.is_active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {agency.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <ActionButton icon={Eye} label="View" />
                      <ActionButton icon={Pencil} label="Edit" />
                      <ActionButton icon={ShieldCheck} label="Verify/Status" />
                      <ActionButton icon={Trash2} label="Delete" danger />
                    </div>
                  </td>
                </tr>
              ))}

              {agencies.length === 0 && (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-slate-500">
                    No agencies found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t px-4 py-3 text-xs">
          <div>
            Showing {agencies.length} of {count}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-lg border px-2 py-1"
            >
              {[10, 20, 30, 40, 50, 100, 200].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>

            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="rounded-lg border px-3 py-1 disabled:opacity-40"
            >
              Prev
            </button>

            <span>
              Page {page} of {totalPages || 1}
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="rounded-lg border px-3 py-1 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, danger = false }) {
  return (
    <button
      title={label}
      className={`rounded-lg border p-1.5 ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      <Icon size={13} />
    </button>
  );
}