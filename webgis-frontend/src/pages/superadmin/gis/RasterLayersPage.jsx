import GISCrudPage from "./GISCrudPage";
import {
  getRasterLayers,
  createRasterLayer,
  updateRasterLayer,
  deleteRasterLayer,
} from "../../../services/gisLayerService";

export default function RasterLayersPage() {
  return (
    <GISCrudPage
      title="Raster Layers"
      subtitle="Manage GeoTIFF and raster datasets"
      getItems={getRasterLayers}
      createItem={createRasterLayer}
      updateItem={updateRasterLayer}
      deleteItem={deleteRasterLayer}
      initialForm={{
        layer: "",
        min_value: "",
        max_value: "",
        pixel_size: "",
        no_data_value: "",
        srid: 4326,
      }}
      columns={[
        { key: "layer_name", label: "Layer" },
        { key: "min_value", label: "Min" },
        { key: "max_value", label: "Max" },
        { key: "pixel_size", label: "Pixel Size" },
        { key: "srid", label: "SRID" },
      ]}
      fields={[
        { name: "layer", label: "Layer ID", required: true },
        { name: "min_value", label: "Min Value", type: "number" },
        { name: "max_value", label: "Max Value", type: "number" },
        { name: "pixel_size", label: "Pixel Size", type: "number" },
        { name: "no_data_value", label: "No Data Value" },
        { name: "srid", label: "SRID", type: "number" },
      ]}
    />
  );
}