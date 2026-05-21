import GISCrudPage from "./GISCrudPage";
import {
  getFeatureAttributeValues,
  createFeatureAttributeValue,
  updateFeatureAttributeValue,
  deleteFeatureAttributeValue,
} from "../../../services/gisLayerService";

export default function FeatureAttributeValuesPage() {
  return (
    <GISCrudPage
      title="Feature Attribute Values"
      subtitle="Manage values for feature attributes"
      getItems={getFeatureAttributeValues}
      createItem={createFeatureAttributeValue}
      updateItem={updateFeatureAttributeValue}
      deleteItem={deleteFeatureAttributeValue}
      initialForm={{
        feature: "",
        attribute: "",
        value_text: "",
        value_integer: "",
        value_decimal: "",
        value_boolean: false,
      }}
      columns={[
        { key: "feature_name", label: "Feature" },
        { key: "attribute_name", label: "Attribute" },
        { key: "value_text", label: "Text Value" },
        { key: "value_integer", label: "Integer" },
        { key: "value_decimal", label: "Decimal" },
      ]}
      fields={[
        { name: "feature", label: "Feature ID", required: true },
        { name: "attribute", label: "Attribute ID", required: true },
        { name: "value_text", label: "Text Value" },
        { name: "value_integer", label: "Integer Value", type: "number" },
        { name: "value_decimal", label: "Decimal Value", type: "number" },
        { name: "value_boolean", label: "Boolean Value", type: "checkbox" },
      ]}
    />
  );
}