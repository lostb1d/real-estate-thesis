import GISCrudPage from "./GISCrudPage";
import {
  getSpatialFeatures,
  createSpatialFeature,
  updateSpatialFeature,
  deleteSpatialFeature,
} from "../../../services/gisLayerService";

export default function SpatialFeaturesPage() {
  return (
    <GISCrudPage
      title="Spatial Features"
      subtitle="Manage individual spatial objects"
      getItems={getSpatialFeatures}
      createItem={createSpatialFeature}
      updateItem={updateSpatialFeature}
      deleteItem={deleteSpatialFeature}
      initialForm={{
        layer: "",
        name: "",
        properties: "{}",
        is_active: true,
      }}
      columns={[
        { key: "layer_name", label: "Layer" },
        { key: "name", label: "Name" },
        { key: "is_active", label: "Status", render: (i) => i.is_active ? "Active" : "Inactive" },
      ]}
      fields={[
        { name: "layer", label: "Layer ID", required: true },
        { name: "name", label: "Name" },
        { name: "properties", label: "Properties JSON", type: "textarea" },
        { name: "is_active", label: "Active", type: "checkbox" },
      ]}
    />
  );
}