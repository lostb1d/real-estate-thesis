import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { ArrowLeft, Plus, Pencil, Trash2, RotateCcw } from "lucide-react";

import {
  getSpatialLayerDetail,
  getSpatialFeaturesByLayer,
  getLayerAttributesByLayer,
  createSpatialFeature,
  updateSpatialFeature,
  deleteSpatialFeature,
} from "../../../services/gisLayerService";

import { getErrorMessage } from "../../../utils/errorHandler";

export default function LayerSpatialFeaturesPage() {
  const { layerId } = useParams();
  const navigate = useNavigate();

  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const [layer, setLayer] = useState(null);
  const [features, setFeatures] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [coords, setCoords] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    is_active: true,
  });

  const [attributeValues, setAttributeValues] = useState({});

  const loadData = async () => {
    try {
      setError("");

      const layerData = await getSpatialLayerDetail(layerId);
      const featureData = await getSpatialFeaturesByLayer(layerId);
      const attributeData = await getLayerAttributesByLayer(layerId);

      setLayer(layerData);
      setFeatures(featureData || []);
      setAttributes(attributeData || []);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    loadData();
  }, [layerId]);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      },
      center: [84.124, 28.3949],
      zoom: 6.5,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      setTimeout(() => map.resize(), 200);
    });

    map.on("click", (e) => {
      const lng = Number(e.lngLat.lng.toFixed(6));
      const lat = Number(e.lngLat.lat.toFixed(6));

      setCoords((prev) => {
        if (layer?.geometry_type === "point") {
          clearMarkers();
          addMarker(map, [lng, lat]);
          return [[lng, lat]];
        }

        addMarker(map, [lng, lat]);
        return [...prev, [lng, lat]];
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [layer]);

  const addMarker = (map, coordinate) => {
    const marker = new maplibregl.Marker({ color: "#dc2626" })
      .setLngLat(coordinate)
      .addTo(map);

    markersRef.current.push(marker);
  };

  const clearMarkers = () => {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
  };

  const resetGeometry = () => {
    setCoords([]);
    clearMarkers();
  };

  const buildGeometryPayload = () => {
    const type = layer?.geometry_type;

    if (type === "none") {
      throw new Error("This layer has no geometry type.");
    }

    if (type === "point") {
      if (coords.length < 1) {
        throw new Error("Please click one point on the map.");
      }

      const [lng, lat] = coords[0];
      return { point: `POINT(${lng} ${lat})` };
    }

    if (type === "linestring") {
      if (coords.length < 2) {
        throw new Error("LineString requires at least 2 points.");
      }

      return {
        line: `LINESTRING(${coords.map((c) => `${c[0]} ${c[1]}`).join(", ")})`,
      };
    }

    if (type === "polygon" || type === "multipolygon") {
      if (coords.length < 3) {
        throw new Error("Polygon requires at least 3 points.");
      }

      const closed = [...coords, coords[0]];
      const ring = closed.map((c) => `${c[0]} ${c[1]}`).join(", ");

      if (type === "polygon") {
        return { polygon: `POLYGON((${ring}))` };
      }

      return { multipolygon: `MULTIPOLYGON(((${ring})))` };
    }

    return {};
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        layer: Number(layerId),
        name: form.name,
        properties: attributeValues,
        is_active: form.is_active,
        ...buildGeometryPayload(),
      };

      if (editingId) {
        await updateSpatialFeature(editingId, payload);
      } else {
        await createSpatialFeature(payload);
      }

      setForm({ name: "", is_active: true });
      setAttributeValues({});
      setEditingId(null);
      resetGeometry();
      loadData();
    } catch (err) {
      setError(err.message || getErrorMessage(err));
    }
  };

  const editItem = (feature) => {
    setEditingId(feature.id);

    setForm({
      name: feature.name || "",
      is_active: feature.is_active,
    });

    setAttributeValues(feature.properties || {});
  };

  const removeItem = async (id) => {
    if (!confirm("Delete this feature?")) return;

    await deleteSpatialFeature(id);
    loadData();
  };

  return (
    <div className="h-full overflow-hidden p-3">
      <div className="grid h-full grid-cols-12 gap-3">
        <section className="col-span-5 flex flex-col overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b px-3 py-2">
            <button
              onClick={() => navigate(-1)}
              className="rounded-lg border p-1.5 hover:bg-slate-50"
            >
              <ArrowLeft size={13} />
            </button>

            <div>
              <h1 className="text-sm font-semibold">Spatial Features</h1>
              <p className="text-[10px] text-slate-500">
                Layer: {layer?.name || "-"} | Geometry: {layer?.geometry_type || "-"}
              </p>
            </div>
          </div>

          {error && (
            <p className="m-3 rounded-lg bg-red-100 p-2 text-xs text-red-700">
              {error}
            </p>
          )}

          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-slate-50">
                <tr className="border-b text-left text-[10px] uppercase text-slate-500">
                  <th className="px-3 py-2">SN</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Attr.</th>
                  <th className="px-3 py-2">Active</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>

              <tbody>
                {features.map((feature, index) => (
                  <tr key={feature.id} className="border-b hover:bg-slate-50">
                    <td className="px-3 py-2">{index + 1}</td>
                    <td className="px-3 py-2 font-medium">{feature.name || "-"}</td>
                    <td className="px-3 py-2">
                      {feature.properties ? Object.keys(feature.properties).length : 0}
                    </td>
                    <td className="px-3 py-2">{feature.is_active ? "Yes" : "No"}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <button
                          onClick={() => editItem(feature)}
                          className="rounded-md border p-1"
                        >
                          <Pencil size={12} />
                        </button>

                        <button
                          onClick={() => removeItem(feature.id)}
                          className="rounded-md border p-1 text-red-600"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!features.length && (
                  <tr>
                    <td colSpan="5" className="px-3 py-8 text-center text-slate-500">
                      No spatial features found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="col-span-7 flex h-full min-h-0 flex-col overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="border-b px-3 py-2">
            <h2 className="text-sm font-semibold">
              {editingId ? "Edit Feature" : "Create Feature"}
            </h2>

            <p className="text-[10px] text-slate-500">
              {layer?.geometry_type === "point" && "Click once on map to create point."}
              {layer?.geometry_type === "linestring" && "Click multiple points to create line."}
              {(layer?.geometry_type === "polygon" ||
                layer?.geometry_type === "multipolygon") &&
                "Click at least 3 points to create polygon."}
              {layer?.geometry_type === "none" && "This layer does not support geometry."}
            </p>
          </div>

          <div
            ref={mapContainer}
            className="h-[220px] max-h-[220px] min-h-[220px] w-full shrink-0 border-b"
          />

          <form
            onSubmit={submit}
            className="grid min-h-0 flex-1 grid-cols-2 gap-2 overflow-y-auto p-3"
          >
            <input
              placeholder="Feature Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg border p-2 text-xs outline-none"
              required
            />

            <div className="flex items-center justify-between rounded-lg border px-2 text-xs">
              <span>{coords.length} point(s)</span>

              <button
                type="button"
                onClick={resetGeometry}
                className="flex items-center gap-1 rounded-md border px-2 py-1"
              >
                <RotateCcw size={11} />
                Reset
              </button>
            </div>

            <div className="col-span-2 grid grid-cols-2 gap-2">
              {attributes.map((attr) => (
                <AttributeInput
                  key={attr.id}
                  attribute={attr}
                  value={attributeValues[attr.code] || ""}
                  onChange={(value) =>
                    setAttributeValues({
                      ...attributeValues,
                      [attr.code]: value,
                    })
                  }
                />
              ))}
            </div>

            <label className="col-span-2 flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm({ ...form, is_active: e.target.checked })
                }
              />
              Active
            </label>

            <button className="col-span-2 flex items-center justify-center gap-2 rounded-lg bg-slate-900 py-2 text-xs text-white">
              <Plus size={13} />
              {editingId ? "Update Feature" : "Create Feature"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

function AttributeInput({ attribute, value, onChange }) {
  if (attribute.field_type === "boolean") {
    return (
      <label className="flex items-center gap-2 rounded-lg border p-2 text-xs">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
        {attribute.name}
      </label>
    );
  }

  return (
    <input
      type={
        attribute.field_type === "integer" || attribute.field_type === "decimal"
          ? "number"
          : "text"
      }
      placeholder={attribute.name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border p-2 text-xs outline-none"
      required={attribute.is_required}
    />
  );
}