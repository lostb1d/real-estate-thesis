import GISCrudPage from "./GISCrudPage";
import {
  getSpatialLayers,
  createSpatialLayer,
  updateSpatialLayer,
  deleteSpatialLayer,
} from "../../../services/gisLayerService";

export default function SpatialLayersPage() {
  return (
    <GISCrudPage
      title="Spatial Layers"
      subtitle="Manage vector and raster spatial layers"
      getItems={getSpatialLayers}
      createItem={createSpatialLayer}
      updateItem={updateSpatialLayer}
      deleteItem={deleteSpatialLayer}
      initialForm={{
        name: "",
        code: "",
        layer_type: "vector",
        geometry_type: "point",
        source_type: "manual",
        description: "",
        is_visible: true,
        is_active: true,
      }}
      columns={[
        { key: "name", label: "Name" },
        { key: "layer_type", label: "Type" },
        { key: "geometry_type", label: "Geometry" },
        { key: "source_type", label: "Source" },
        { key: "is_active", label: "Status", render: (i) => i.is_active ? "Active" : "Inactive" },
      ]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "code", label: "Code" },
        { name: "layer_type", label: "Layer Type" },
        { name: "geometry_type", label: "Geometry Type" },
        { name: "source_type", label: "Source Type" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "is_visible", label: "Visible", type: "checkbox" },
        { name: "is_active", label: "Active", type: "checkbox" },
      ]}
    />
  );
}