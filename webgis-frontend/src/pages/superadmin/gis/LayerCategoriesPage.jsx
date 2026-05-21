import { useEffect, useState } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";

import {
  getLayerCategories,
  createLayerCategory,
  updateLayerCategory,
  deleteLayerCategory,
} from "../../../services/gisLayerService";

import { getErrorMessage } from "../../../utils/errorHandler";
import { getSpatialLayersByCategory } from "../../../services/gisLayerService";
import { useNavigate } from "react-router-dom";

export default function LayerCategoriesPage() {
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    is_active: true,
  });

  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const [selectedCategory, setSelectedCategory] = useState(null);

  const [spatialLayers, setSpatialLayers] = useState([]);

  const totalPages = Math.ceil(count / pageSize);

  const loadData = async () => {
    try {
      const data = await getLayerCategories({ page, pageSize, search });
      setItems(data.results || []);
      setCount(data.count || 0);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [page, pageSize]);

  const submit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateLayerCategory(editingId, form);
      } else {
        await createLayerCategory(form);
      }

      setForm({ name: "", code: "", description: "", is_active: true });
      setEditingId(null);
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const editItem = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name || "",
      code: item.code || "",
      description: item.description || "",
      is_active: item.is_active,
    });
  };

  const removeItem = async (id) => {
    if (!confirm("Delete this category?")) return;

    try {
      await deleteLayerCategory(id);
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const handleCategoryClick = (category) => {
  navigate(`/superadmin/gis-layers/categories/${category.id}/spatial-layers`);
};

  return (
    <div className="h-full overflow-hidden p-4">
      <div className="grid h-full grid-cols-12 gap-4">
        <section className="col-span-8 flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-base font-semibold">Layer Categories</h1>
              <p className="text-[11px] text-slate-500">Manage GIS layer categories</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPage(1);
                loadData();
              }}
              className="flex items-center gap-2"
            >
              <div className="flex items-center gap-2 rounded-xl border px-3">
                <Search size={14} className="text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
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
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-slate-50">
                <tr className="border-b text-left text-[11px] uppercase text-slate-500">
                  <th className="w-14 px-4 py-3">SN</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

             <tbody>
  {items.map((item, index) => (
    <tr
      key={item.id}
      onClick={() => handleCategoryClick(item)}
      className="cursor-pointer border-b hover:bg-slate-50"
    >
                    <td className="px-4 py-3">{(page - 1) * pageSize + index + 1}</td>
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3">{item.code}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-[10px] ${
                        item.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      }`}>
                        {item.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => editItem(item)} className="rounded-lg border p-1.5">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => removeItem(item.id)} className="rounded-lg border p-1.5 text-red-600">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t px-4 py-3 text-xs">
            <span>Showing {items.length} of {count}</span>

            <div className="flex items-center gap-2">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-lg border px-2 py-1"
              >
                {[10, 20, 30, 50, 100, 200].map((size) => (
                  <option key={size}>{size}</option>
                ))}
              </select>

              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border px-3 py-1 disabled:opacity-40">
                Prev
              </button>

              <span>Page {page} of {totalPages || 1}</span>

              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="rounded-lg border px-3 py-1 disabled:opacity-40">
                Next
              </button>
            </div>
          </div>
        </section>

        <section className="col-span-4 rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold">
            {editingId ? "Edit Category" : "Create Category"}
          </h2>

          <form onSubmit={submit} className="space-y-3">
            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm({
                  ...form,
                  name,
                  code: slugify(name),
                });
              }}
              className="w-full rounded-xl border p-3 text-sm outline-none"
              required
            />

            <input
              placeholder="Code"
              value={form.code}
              readOnly
              className="w-full rounded-xl border bg-slate-100 p-3 text-sm outline-none"
            />

            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-xl border p-3 text-sm outline-none"
            />

            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              Active
            </label>

            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2 text-sm text-white">
              <Plus size={15} />
              {editingId ? "Update" : "Create"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}