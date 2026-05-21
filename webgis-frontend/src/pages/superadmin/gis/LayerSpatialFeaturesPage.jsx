import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import maplibregl from "maplibre-gl";

import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  MapPin,
} from "lucide-react";

import {
  getSpatialFeaturesByLayer,
  createSpatialFeature,
  updateSpatialFeature,
  deleteSpatialFeature,
} from "../../../services/gisLayerService";

import { getErrorMessage } from "../../../utils/errorHandler";

import "maplibre-gl/dist/maplibre-gl.css";

export default function LayerSpatialFeaturesPage() {
  const { layerId } = useParams();
  const navigate = useNavigate();

  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const [features, setFeatures] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    longitude: "",
    latitude: "",
    properties: "{}",
    is_active: true,
  });

  const loadFeatures = async () => {
    try {
      const data = await getSpatialFeaturesByLayer(layerId);
      setFeatures(data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    loadFeatures();
  }, [layerId]);

  useEffect(() => {
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [84.124, 28.3949],
      zoom: 6,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("click", (e) => {
      const lng = e.lngLat.lng.toFixed(6);
      const lat = e.lngLat.lat.toFixed(6);

      setForm((prev) => ({
        ...prev,
        longitude: lng,
        latitude: lat,
      }));

      if (markerRef.current) {
        markerRef.current.remove();
      }

      markerRef.current = new maplibregl.Marker({
        color: "#0f172a",
      })
        .setLngLat([lng, lat])
        .addTo(map);
    });

    mapRef.current = map;

    return () => map.remove();
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        layer: Number(layerId),
        name: form.name,
        properties: form.properties
          ? JSON.parse(form.properties)
          : {},
        is_active: form.is_active,

        point:
          form.longitude && form.latitude
            ? `POINT(${form.longitude} ${form.latitude})`
            : null,
      };

      if (editingId) {
        await updateSpatialFeature(editingId, payload);
      } else {
        await createSpatialFeature(payload);
      }

      resetForm();
      loadFeatures();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const resetForm = () => {
    setEditingId(null);

    setForm({
      name: "",
      longitude: "",
      latitude: "",
      properties: "{}",
      is_active: true,
    });

    if (markerRef.current) {
      markerRef.current.remove();
    }
  };

  const editItem = (feature) => {
    setEditingId(feature.id);

    setForm({
      name: feature.name || "",
      longitude: "",
      latitude: "",
      properties: JSON.stringify(
        feature.properties || {},
        null,
        2
      ),
      is_active: feature.is_active,
    });
  };

  const removeItem = async (id) => {
    if (!confirm("Delete this feature?")) return;

    await deleteSpatialFeature(id);
    loadFeatures();
  };

  return (
    <div className="h-full overflow-hidden p-4">
      <div className="grid h-full grid-cols-12 gap-4">

        <section className="col-span-5 flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm">

          <div className="flex items-center gap-3 border-b px-4 py-3">
            <button
              onClick={() => navigate(-1)}
              className="rounded-lg border p-2 hover:bg-slate-50"
            >
              <ArrowLeft size={14} />
            </button>

            <div>
              <h1 className="text-sm font-semibold">
                Spatial Features
              </h1>

              <p className="text-[11px] text-slate-500">
                Manage spatial features
              </p>
            </div>
          </div>

          {error && (
            <p className="m-3 rounded-xl bg-red-100 p-3 text-xs text-red-700">
              {error}
            </p>
          )}

          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-slate-50">
                <tr className="border-b text-left text-[11px] uppercase text-slate-500">
                  <th className="px-3 py-2">SN</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Active</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>

              <tbody>
                {features.map((feature, index) => (
                  <tr
                    key={feature.id}
                    className="border-b hover:bg-slate-50"
                  >
                    <td className="px-3 py-2">
                      {index + 1}
                    </td>

                    <td className="px-3 py-2 font-medium">
                      {feature.name || "-"}
                    </td>

                    <td className="px-3 py-2">
                      {feature.is_active ? "Yes" : "No"}
                    </td>

                    <td className="px-3 py-2">
                      <div className="flex gap-1">

                        <button
                          onClick={() => editItem(feature)}
                          className="rounded-lg border p-1.5"
                        >
                          <Pencil size={13} />
                        </button>

                        <button
                          onClick={() => removeItem(feature.id)}
                          className="rounded-lg border p-1.5 text-red-600"
                        >
                          <Trash2 size={13} />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}

                {!features.length && (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-3 py-8 text-center text-slate-500"
                    >
                      No spatial features found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="col-span-7 flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm">

          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">
              {editingId
                ? "Edit Spatial Feature"
                : "Add Spatial Feature"}
            </h2>

            <p className="text-[11px] text-slate-500">
              Click map to select coordinates
            </p>
          </div>

          <div
            ref={mapContainer}
            className="h-[55%] w-full border-b"
          />

          <form
            onSubmit={submit}
            className="grid flex-1 grid-cols-2 gap-3 overflow-auto p-4"
          >

            <input
              placeholder="Feature Name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              className="rounded-xl border p-3 text-sm outline-none"
            />

            <div className="flex items-center gap-2 rounded-xl border px-3">
              <MapPin size={14} className="text-slate-500" />

              <span className="text-xs text-slate-500">
                {form.longitude && form.latitude
                  ? `${form.longitude}, ${form.latitude}`
                  : "Click map"}
              </span>
            </div>

            <textarea
              rows="8"
              placeholder="Properties JSON"
              value={form.properties}
              onChange={(e) =>
                setForm({
                  ...form,
                  properties: e.target.value,
                })
              }
              className="col-span-2 rounded-xl border p-3 text-sm outline-none"
            />

            <label className="col-span-2 flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm({
                    ...form,
                    is_active: e.target.checked,
                  })
                }
              />
              Active
            </label>

            <button className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm text-white">
              <Plus size={15} />

              {editingId
                ? "Update Feature"
                : "Create Feature"}
            </button>

          </form>
        </section>
      </div>
    </div>
  );
}