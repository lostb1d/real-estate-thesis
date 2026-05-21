import { useEffect, useState } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { getErrorMessage } from "../../../utils/errorHandler";

export default function GISCrudPage({
  title,
  subtitle,
  columns,
  fields,
  getItems,
  createItem,
  updateItem,
  deleteItem,
  initialForm,
}) {
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const totalPages = Math.ceil(count / pageSize);

  const loadData = async () => {
    try {
      setError("");
      const data = await getItems({ page, pageSize, search });
      setItems(data.results || []);
      setCount(data.count || 0);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    loadData();
  }, [page, pageSize]);

  const submit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) await updateItem(editingId, form);
      else await createItem(form);

      setForm(initialForm);
      setEditingId(null);
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const editItem = (item) => {
    setEditingId(item.id);
    setForm({ ...initialForm, ...item });
  };

  const removeItem = async (id) => {
    if (!confirm("Delete this item?")) return;
    await deleteItem(id);
    loadData();
  };

  return (
    <div className="h-full overflow-hidden p-4">
      <div className="grid h-full grid-cols-12 gap-4">
        <section className="col-span-8 flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-base font-semibold">{title}</h1>
              <p className="text-[11px] text-slate-500">{subtitle}</p>
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
                  {columns.map((col) => (
                    <th key={col.key} className="px-4 py-3">{col.label}</th>
                  ))}
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3">
                      {(page - 1) * pageSize + index + 1}
                    </td>

                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        {typeof col.render === "function"
                          ? col.render(item)
                          : String(item[col.key] ?? "-")}
                      </td>
                    ))}

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
                {[10, 20, 30, 40, 50, 100, 200].map((size) => (
                  <option key={size} value={size}>{size}</option>
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
            {editingId ? `Edit ${title}` : `Create ${title}`}
          </h2>

          <form onSubmit={submit} className="space-y-3">
            {fields.map((field) => (
              <InputField
                key={field.name}
                field={field}
                value={form[field.name]}
                onChange={(value) =>
                  setForm({ ...form, [field.name]: value })
                }
              />
            ))}

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

function InputField({ field, value, onChange }) {
  if (field.type === "textarea") {
    return (
      <textarea
        placeholder={field.label}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border p-3 text-sm outline-none"
      />
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
        {field.label}
      </label>
    );
  }

  return (
    <input
      type={field.type || "text"}
      placeholder={field.label}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border p-3 text-sm outline-none"
      required={field.required}
    />
  );
}