import GISCrudPage from "./GISCrudPage";
import {
  getLayerAttributes,
  createLayerAttribute,
  updateLayerAttribute,
  deleteLayerAttribute,
} from "../../../services/gisLayerService";

export default function LayerAttributesPage() {
  return (
    <GISCrudPage
      title="Layer Attributes"
      subtitle="Manage custom attributes for layers"
      getItems={getLayerAttributes}
      createItem={createLayerAttribute}
      updateItem={updateLayerAttribute}
      deleteItem={deleteLayerAttribute}
      initialForm={{
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
      }}
      columns={[
        { key: "layer_name", label: "Layer" },
        { key: "name", label: "Name" },
        { key: "code", label: "Code" },
        { key: "field_type", label: "Field Type" },
        { key: "is_required", label: "Required", render: (i) => i.is_required ? "Yes" : "No" },
      ]}
      fields={[
        { name: "layer", label: "Layer ID", required: true },
        { name: "name", label: "Name", required: true },
        { name: "code", label: "Code" },
        { name: "field_type", label: "Field Type" },
        { name: "unit", label: "Unit" },
        { name: "default_value", label: "Default Value" },
        { name: "ordering", label: "Ordering", type: "number" },
        { name: "is_required", label: "Required", type: "checkbox" },
        { name: "is_filterable", label: "Filterable", type: "checkbox" },
        { name: "is_visible", label: "Visible", type: "checkbox" },
      ]}
    />
  );
}