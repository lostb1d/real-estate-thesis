import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";

import {
  getSpatialLayersByCategory,
  createSpatialLayer,
  updateSpatialLayer,
  deleteSpatialLayer,
  getSpatialFeaturesByLayer,
  getLayerAttributesByLayer,
  createLayerAttribute,
  updateLayerAttribute,
  deleteLayerAttribute,
} from "../../../services/gisLayerService";

import { getErrorMessage } from "../../../utils/errorHandler";

const slugify = (text) =>
  text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export default function CategorySpatialLayersPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [layers, setLayers] = useState([]);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [features, setFeatures] = useState([]);
  const [attributes, setAttributes] = useState([]);

  const [error, setError] = useState("");
  const [editingLayerId, setEditingLayerId] = useState(null);
  const [editingAttributeId, setEditingAttributeId] = useState(null);

  const [layerForm, setLayerForm] = useState({
    name: "",
    code: "",
    category: categoryId,
    layer_type: "vector",
    geometry_type: "point",
    source_type: "manual",
    description: "",
    is_visible: true,
    is_queryable: true,
    is_editable: true,
    is_active: true,
  });

  const [attributeForm, setAttributeForm] = useState({
    layer: "",
    name: "",
    code: "",
    field_type: "text",
    unit: "",
    default_value: "",
    is_required: false,
    is_filterable: true,
    is_visible: true,
    ordering: 0,
  });

  const loadLayers = async () => {
    try {
      const data = await getSpatialLayersByCategory(categoryId);
      setLayers(data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    loadLayers();
  }, [categoryId]);

  const handleLayerClick = async (layer) => {
    setSelectedLayer(layer);
    setAttributeForm((prev) => ({ ...prev, layer: layer.id }));

    const featureData = await getSpatialFeaturesByLayer(layer.id);
    const attributeData = await getLayerAttributesByLayer(layer.id);

    setFeatures(featureData || []);
    setAttributes(attributeData || []);
  };

  const submitLayer = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...layerForm,
        category: Number(categoryId),
      };

      if (editingLayerId) {
        await updateSpatialLayer(editingLayerId, payload);
      } else {
        await createSpatialLayer(payload);
      }

      setLayerForm({
        name: "",
        code: "",
        category: categoryId,
        layer_type: "vector",
        geometry_type: "point",
        source_type: "manual",
        description: "",
        is_visible: true,
        is_queryable: true,
        is_editable: true,
        is_active: true,
      });

      setEditingLayerId(null);
      loadLayers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const editLayer = (layer) => {
    setEditingLayerId(layer.id);
    setLayerForm({
      name: layer.name || "",
      code: layer.code || "",
      category: categoryId,
      layer_type: layer.layer_type || "vector",
      geometry_type: layer.geometry_type || "point",
      source_type: layer.source_type || "manual",
      description: layer.description || "",
      is_visible: layer.is_visible,
      is_queryable: layer.is_queryable,
      is_editable: layer.is_editable,
      is_active: layer.is_active,
    });
  };

  const removeLayer = async (id) => {
    if (!confirm("Delete this spatial layer?")) return;
    await deleteSpatialLayer(id);
    setSelectedLayer(null);
    setFeatures([]);
    setAttributes([]);
    loadLayers();
  };

  const submitAttribute = async (e) => {
    e.preventDefault();

    if (!selectedLayer) {
      alert("Select a spatial layer first.");
      return;
    }

    try {
      const payload = {
        ...attributeForm,
        layer: selectedLayer.id,
        ordering: Number(attributeForm.ordering || 0),
      };

      if (editingAttributeId) {
        await updateLayerAttribute(editingAttributeId, payload);
      } else {
        await createLayerAttribute(payload);
      }

      setAttributeForm({
        layer: selectedLayer.id,
        name: "",
        code: "",
        field_type: "text",
        unit: "",
        default_value: "",
        is_required: false,
        is_filterable: true,
        is_visible: true,
        ordering: 0,
      });

      setEditingAttributeId(null);
      const attributeData = await getLayerAttributesByLayer(selectedLayer.id);
      setAttributes(attributeData || []);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const editAttribute = (attr) => {
    setEditingAttributeId(attr.id);
    setAttributeForm({
      layer: attr.layer,
      name: attr.name || "",
      code: attr.code || "",
      field_type: attr.field_type || "text",
      unit: attr.unit || "",
      default_value: attr.default_value || "",
      is_required: attr.is_required,
      is_filterable: attr.is_filterable,
      is_visible: attr.is_visible,
      ordering: attr.ordering || 0,
    });
  };

  const removeAttribute = async (id) => {
    if (!confirm("Delete this attribute?")) return;
    await deleteLayerAttribute(id);

    if (selectedLayer) {
      const data = await getLayerAttributesByLayer(selectedLayer.id);
      setAttributes(data || []);
    }
  };

  return (
    <div className="h-full overflow-hidden p-4">
      <div className="grid h-full grid-cols-8 gap-4">
        <section className="col-span-5 flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
          <Header
            title="Spatial Layers"
            subtitle="Add, edit, delete layers under selected category"
            back={() => navigate("/superadmin/gis-layers/categories")}
          />

          {error && <p className="m-3 rounded-xl bg-red-100 p-3 text-xs text-red-700">{error}</p>}

          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-slate-50">
                <tr className="border-b text-left text-[11px] uppercase text-slate-500"
                 onClick={() =>
                    navigate(`/superadmin/gis-layers/layers/${layer.id}/features`)
                    }
                >
                  <th className="px-3 py-2">SN</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Geometry</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>

              <tbody>
                {layers.map((layer, index) => (
                  <tr
                    key={layer.id}
                    onClick={() =>
                        navigate(`/superadmin/gis-layers/layers/${layer.id}/features`)
                        }
                    className={`cursor-pointer border-b hover:bg-slate-50 ${
                      selectedLayer?.id === layer.id ? "bg-slate-100" : ""
                    }`}
                  >
                    <td className="px-3 py-2">{index + 1}</td>
                    <td className="px-3 py-2 font-medium">{layer.name}</td>
                    <td className="px-3 py-2">{layer.layer_type}</td>
                    <td className="px-3 py-2">{layer.geometry_type}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <IconButton
                          icon={Pencil}
                          onClick={(e) => {
                            e.stopPropagation();
                            editLayer(layer);
                          }}
                        />
                        <IconButton
                          icon={Trash2}
                          danger
                          onClick={(e) => {
                            e.stopPropagation();
                            removeLayer(layer.id);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}

                {!layers.length && (
                  <tr>
                    <td colSpan="5" className="px-3 py-8 text-center text-slate-500">
                      No spatial layers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <form onSubmit={submitLayer} className="border-t p-3">
            <h3 className="mb-2 text-xs font-semibold">
              {editingLayerId ? "Edit Spatial Layer" : "Add Spatial Layer"}
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder="Name"
                value={layerForm.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setLayerForm({ ...layerForm, name, code: slugify(name) });
                }}
                className="rounded-lg border p-2 text-xs"
                required
              />

              <input
                placeholder="Code"
                value={layerForm.code}
                readOnly
                className="rounded-lg border bg-slate-100 p-2 text-xs"
              />

              <select
                value={layerForm.layer_type}
                onChange={(e) => setLayerForm({ ...layerForm, layer_type: e.target.value })}
                className="rounded-lg border p-2 text-xs"
              >
                <option value="vector">Vector</option>
                <option value="raster">Raster</option>
              </select>

              <select
                value={layerForm.geometry_type}
                onChange={(e) => setLayerForm({ ...layerForm, geometry_type: e.target.value })}
                className="rounded-lg border p-2 text-xs"
              >
                <option value="point">Point</option>
                <option value="linestring">LineString</option>
                <option value="polygon">Polygon</option>
                <option value="multipolygon">MultiPolygon</option>
                <option value="none">None/Raster</option>
              </select>
            </div>

            <textarea
              placeholder="Description"
              value={layerForm.description}
              onChange={(e) => setLayerForm({ ...layerForm, description: e.target.value })}
              className="mt-2 w-full rounded-lg border p-2 text-xs"
            />

            <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-2 text-xs text-white">
              <Plus size={14} />
              {editingLayerId ? "Update Layer" : "Add Layer"}
            </button>
          </form>
        </section>

        {/* <section className="col-span-4 flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
          <PanelTitle
            title="Spatial Features"
            subtitle={selectedLayer ? `Features of ${selectedLayer.name}` : "Select a layer"}
          />

          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-slate-50">
                <tr className="border-b text-left text-[11px] uppercase text-slate-500">
                  <th className="px-3 py-2">SN</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Active</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr key={feature.id} className="border-b">
                    <td className="px-3 py-2">{index + 1}</td>
                    <td className="px-3 py-2 font-medium">{feature.name || "-"}</td>
                    <td className="px-3 py-2">{feature.is_active ? "Yes" : "No"}</td>
                  </tr>
                ))}

                {!features.length && (
                  <tr>
                    <td colSpan="3" className="px-3 py-8 text-center text-slate-500">
                      No features found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section> */}

        <section className="col-span-3 flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
          <PanelTitle
            title="Layer Attributes"
            subtitle={selectedLayer ? `Attributes of ${selectedLayer.name}` : "Select a layer"}
          />

          <div className="min-h-0 flex-1 overflow-auto">
            {attributes.map((attr) => (
              <div key={attr.id} className="flex items-center justify-between border-b px-3 py-2 text-xs">
                <div>
                  <p className="font-medium">{attr.name}</p>
                  <p className="text-[10px] text-slate-500">{attr.field_type}</p>
                </div>
                <div className="flex gap-1">
                  <IconButton icon={Pencil} onClick={() => editAttribute(attr)} />
                  <IconButton icon={Trash2} danger onClick={() => removeAttribute(attr.id)} />
                </div>
              </div>
            ))}

            {!attributes.length && (
              <p className="p-4 text-center text-xs text-slate-500">
                No attributes found.
              </p>
            )}
          </div>

          <form onSubmit={submitAttribute} className="border-t p-3">
            <h3 className="mb-2 text-xs font-semibold">
              {editingAttributeId ? "Edit Attribute" : "Add Attribute"}
            </h3>

            <input
              placeholder="Attribute Name"
              value={attributeForm.name}
              onChange={(e) => {
                const name = e.target.value;
                setAttributeForm({ ...attributeForm, name, code: slugify(name) });
              }}
              className="mb-2 w-full rounded-lg border p-2 text-xs"
              required
            />

            <input
              placeholder="Code"
              value={attributeForm.code}
              readOnly
              className="mb-2 w-full rounded-lg border bg-slate-100 p-2 text-xs"
            />

            <select
              value={attributeForm.field_type}
              onChange={(e) => setAttributeForm({ ...attributeForm, field_type: e.target.value })}
              className="mb-2 w-full rounded-lg border p-2 text-xs"
            >
              <option value="text">Text</option>
              <option value="integer">Integer</option>
              <option value="decimal">Decimal</option>
              <option value="boolean">Boolean</option>
              <option value="date">Date</option>
              <option value="datetime">DateTime</option>
              <option value="choice">Choice</option>
            </select>

            <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-2 text-xs text-white">
              <Plus size={14} />
              {editingAttributeId ? "Update Attribute" : "Add Attribute"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

function Header({ title, subtitle, back }) {
  return (
    <div className="flex items-center gap-3 border-b px-4 py-3">
      <button onClick={back} className="rounded-lg border p-2 hover:bg-slate-50">
        <ArrowLeft size={14} />
      </button>
      <div>
        <h1 className="text-sm font-semibold">{title}</h1>
        <p className="text-[11px] text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function PanelTitle({ title, subtitle }) {
  return (
    <div className="border-b px-4 py-3">
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="text-[11px] text-slate-500">{subtitle}</p>
    </div>
  );
}

function IconButton({ icon: Icon, onClick, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border p-1.5 ${
        danger ? "text-red-600 hover:bg-red-50" : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      <Icon size={13} />
    </button>
  );
}