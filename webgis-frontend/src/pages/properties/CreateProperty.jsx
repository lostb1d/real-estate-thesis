import { useEffect, useState } from "react";
import { ArrowLeft, Save, MapPin, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  createProperty,
  getPropertyTypes,
  getPropertyFeatures,
} from "../../services/propertyService";

import { getErrorMessage } from "../../utils/errorHandler";

export default function CreateProperty() {
  const navigate = useNavigate();

  const [propertyTypes, setPropertyTypes] = useState([]);
  const [features, setFeatures] = useState([]);
  const [featureValues, setFeatureValues] = useState({});

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    property_type: "",
    listing_type: "sale",
    price: "",
    negotiable: false,
    land_area: "",
    land_area_unit: "sqft",
    address: "",
    ward_no: "",
    municipality: "",
    district: "",
    province: "",
    road_access_width: "",
    road_access_unit: "meter",
    description: "",
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const types = await getPropertyTypes();
        const feats = await getPropertyFeatures();

        setPropertyTypes(types);
        setFeatures(feats);
      } catch (err) {
        setError(getErrorMessage(err));
      }
    };

    loadInitialData();
  }, []);

  const selectedFeatures = features.filter(
    (feature) => Number(feature.property_type) === Number(form.property_type)
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFeatureChange = (featureId, value) => {
    setFeatureValues({
      ...featureValues,
      [featureId]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...form,
        property_type: Number(form.property_type),
        price: Number(form.price),
        land_area: Number(form.land_area),
        road_access_width: form.road_access_width
          ? Number(form.road_access_width)
          : null,

        // Temporary default location.
        // Later replace with map picker coordinates.
        location: "POINT(82.49 28.04)",
      };

      const property = await createProperty(payload);

      console.log("Created property:", property);
      console.log("Feature values:", featureValues);

      alert("Property ad created successfully.");
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-100 text-slate-900">
      <header className="flex h-14 items-center justify-between border-b bg-white px-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="rounded-xl border p-2 hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-base font-semibold">Create Property Ad</h1>
            <p className="text-[11px] text-slate-500">
              Add property details for listing
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs text-white disabled:opacity-60"
        >
          <Save size={15} />
          {loading ? "Submitting..." : "Submit Ad"}
        </button>
      </header>

      <main className="h-[calc(100vh-56px)] overflow-y-auto p-4">
        <form
          onSubmit={handleSubmit}
          className="mx-auto grid max-w-6xl grid-cols-12 gap-4"
        >
          <section className="col-span-8 rounded-2xl bg-white p-5 shadow-sm">
            {error && (
              <p className="mb-4 rounded-xl bg-red-100 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <h2 className="mb-4 text-sm font-semibold">Basic Information</h2>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Title"
                name="title"
                value={form.title}
                onChange={handleChange}
              />

              <Select
                label="Property Type"
                name="property_type"
                value={form.property_type}
                onChange={handleChange}
              >
                <option value="">Select Type</option>
                {propertyTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </Select>

              <Select
                label="Listing Type"
                name="listing_type"
                value={form.listing_type}
                onChange={handleChange}
              >
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
                <option value="lease">For Lease</option>
              </Select>

              <Input
                label="Price"
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
              />

              <Input
                label="Land Area"
                name="land_area"
                type="number"
                value={form.land_area}
                onChange={handleChange}
              />

              <Select
                label="Area Unit"
                name="land_area_unit"
                value={form.land_area_unit}
                onChange={handleChange}
              >
                <option value="sqft">Sq. Ft.</option>
                <option value="sqm">Sq. Meter</option>
                <option value="kattha">Kattha</option>
                <option value="ropani">Ropani</option>
              </Select>

              <Input
                label="Road Access Width"
                name="road_access_width"
                type="number"
                value={form.road_access_width}
                onChange={handleChange}
                required={false}
              />

              <Select
                label="Road Unit"
                name="road_access_unit"
                value={form.road_access_unit}
                onChange={handleChange}
              >
                <option value="meter">Meter</option>
                <option value="feet">Feet</option>
              </Select>
            </div>

            <label className="mt-4 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="negotiable"
                checked={form.negotiable}
                onChange={handleChange}
              />
              Price is negotiable
            </label>

            <h2 className="mb-4 mt-6 text-sm font-semibold">
              Address Information
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Address"
                name="address"
                value={form.address}
                onChange={handleChange}
              />

              <Input
                label="Ward No"
                name="ward_no"
                value={form.ward_no}
                onChange={handleChange}
                required={false}
              />

              <Input
                label="Municipality"
                name="municipality"
                value={form.municipality}
                onChange={handleChange}
                required={false}
              />

              <Input
                label="District"
                name="district"
                value={form.district}
                onChange={handleChange}
                required={false}
              />

              <Input
                label="Province"
                name="province"
                value={form.province}
                onChange={handleChange}
                required={false}
              />
            </div>

            <section className="mt-6 rounded-2xl border bg-slate-50 p-4">
              <h2 className="mb-3 text-sm font-semibold">Property Features</h2>

              {selectedFeatures.length === 0 && (
                <p className="text-xs text-slate-500">
                  Select property type to load features.
                </p>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedFeatures.map((feature) => (
                  <DynamicFeatureInput
                    key={feature.id}
                    feature={feature}
                    value={featureValues[feature.id] || ""}
                    onChange={(value) =>
                      handleFeatureChange(feature.id, value)
                    }
                  />
                ))}
              </div>
            </section>

            <h2 className="mb-4 mt-6 text-sm font-semibold">Description</h2>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="5"
              placeholder="Write property description..."
              className="w-full rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
            />
          </section>

          <aside className="col-span-4 space-y-4">
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold">Property Location</h2>

              <div className="flex h-56 items-center justify-center rounded-2xl border bg-slate-100 text-center">
                <div>
                  <MapPin className="mx-auto mb-2 text-slate-600" />
                  <p className="text-sm font-medium">Select Location on Map</p>
                  <p className="text-xs text-slate-500">
                    Default location is used for now
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold">Upload Images</h2>

              <label className="flex h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed bg-slate-50 hover:bg-slate-100">
                <Upload className="mb-2 text-slate-500" />
                <span className="text-sm font-medium">
                  Upload property images
                </span>
                <span className="text-xs text-slate-500">
                  PNG, JPG, JPEG
                </span>
                <input type="file" multiple className="hidden" />
              </label>
            </section>
          </aside>
        </form>
      </main>
    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = true,
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500">
        {label}
      </label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
      />
    </div>
  );
}

function Select({ label, name, value, onChange, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        required
        className="w-full rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
      >
        {children}
      </select>
    </div>
  );
}

function DynamicFeatureInput({ feature, value, onChange }) {
  if (feature.field_type === "boolean") {
    return (
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
        {feature.name}
      </label>
    );
  }

  if (feature.field_type === "choice" && Array.isArray(feature.choices)) {
    return (
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">
          {feature.name}
        </label>

        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border p-3 text-sm outline-none"
        >
          <option value="">Select</option>
          {feature.choices.map((choice) => (
            <option key={choice} value={choice}>
              {choice}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500">
        {feature.name} {feature.unit ? `(${feature.unit})` : ""}
      </label>

      <input
        type={
          feature.field_type === "number" ||
          feature.field_type === "decimal"
            ? "number"
            : "text"
        }
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border p-3 text-sm outline-none"
      />
    </div>
  );
}