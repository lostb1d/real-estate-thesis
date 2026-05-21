import GISCrudPage from "./GISCrudPage";
import {
  getLayerUploads,
  createLayerUpload,
  updateLayerUpload,
  deleteLayerUpload,
} from "../../../services/gisLayerService";

export default function LayerUploadsPage() {
  return (
    <GISCrudPage
      title="Layer Uploads"
      subtitle="Manage uploaded GIS files"
      getItems={getLayerUploads}
      createItem={createLayerUpload}
      updateItem={updateLayerUpload}
      deleteItem={deleteLayerUpload}
      initialForm={{
        layer: "",
        upload_type: "geojson",
        name_field: "",
      }}
      columns={[
        { key: "layer_name", label: "Layer" },
        { key: "upload_type", label: "Upload Type" },
        { key: "processed", label: "Processed", render: (i) => i.processed ? "Yes" : "No" },
        { key: "uploaded_at", label: "Uploaded At" },
      ]}
      fields={[
        { name: "layer", label: "Layer ID", required: true },
        { name: "upload_type", label: "Upload Type" },
        { name: "name_field", label: "Name Field" },
      ]}
    />
  );
}