import { useState } from "react";
import {
  Search,
  MapPin,
  Layers,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Trash2,
  UserCircle,
  Home,
  Hospital,
  School,
  ShoppingCart,
} from "lucide-react";

const properties = [
  { id: 1, title: "House for Sale", price: "Rs. 1.2 Cr", location: "Ghorahi-15", type: "House" },
  { id: 2, title: "Commercial Land", price: "Rs. 75 Lakh", location: "Ghorahi-16", type: "Land" },
  { id: 3, title: "Rental Apartment", price: "Rs. 25,000/mo", location: "Ghorahi-17", type: "Apartment" },
];

const initialLayers = [
  { id: 1, name: "Property Parcels", visible: true },
  { id: 2, name: "Road Network", visible: true },
  { id: 3, name: "Flood Risk Zone", visible: false },
  { id: 4, name: "Land Use Zone", visible: true },
];

const amenities = [
  { icon: Hospital, name: "Nearest Hospital", value: "1.2 km" },
  { icon: School, name: "Nearest School", value: "650 m" },
  { icon: ShoppingCart, name: "Market", value: "900 m" },
  { icon: MapPin, name: "Main Road", value: "120 m" },
];

export default function Dashboard() {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [bottomOpen, setBottomOpen] = useState(true);
  const [layers, setLayers] = useState(initialLayers);

  const toggleLayer = (id) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
      )
    );
  };

  const removeLayer = (id) => {
    setLayers((prev) => prev.filter((layer) => layer.id !== id));
  };

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-slate-100 text-slate-900">
      <TopNavbar />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className={`relative shrink-0 border-r bg-white transition-all duration-300 ${leftOpen ? "w-72" : "w-10"}`}>
          {leftOpen && <LeftPropertyPanel />}
          <button
            onClick={() => setLeftOpen(!leftOpen)}
            className="absolute right-2 top-5 z-30 rounded-full border bg-white p-1 shadow hover:bg-slate-100"
          >
            {leftOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </aside>

        <main className="relative min-w-0 flex-1 overflow-hidden">
          <MapPanel />

          <section className={`absolute bottom-0 left-0 right-0 z-20 border-t bg-white transition-all duration-300 ${bottomOpen ? "h-44" : "h-10"}`}>
            <div className="flex h-10 items-center justify-between border-b px-4">
              <h3 className="text-sm font-semibold">Amenities & Nearby Details</h3>
              <button onClick={() => setBottomOpen(!bottomOpen)}>
                {bottomOpen ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
              </button>
            </div>

            {bottomOpen && <BottomAmenities />}
          </section>
        </main>

        <aside className={`relative shrink-0 border-l bg-white transition-all duration-300 ${rightOpen ? "w-72" : "w-10"}`}>
          {rightOpen && (
            <RightLayerPanel
              layers={layers}
              toggleLayer={toggleLayer}
              removeLayer={removeLayer}
            />
          )}

          <button
            onClick={() => setRightOpen(!rightOpen)}
            className="absolute left-2 top-5 z-30 rounded-full border bg-white p-1 shadow hover:bg-slate-100"
          >
            {rightOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </aside>
      </div>
    </div>
  );
}

function TopNavbar() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
          <Home size={22} />
        </div>
        <div>
          <h1 className="text-base font-semibold">WebGIS Real Estate</h1>
          <p className="text-[10px] text-slate-500">Spatial Decision Support System</p>
        </div>
      </div>

      <button
        onClick={() => (window.location.href = "/profile")}
        className="flex items-center gap-2 rounded-full border px-3 py-2 hover:bg-slate-50"
      >
        <UserCircle size={28} />
        <span className="hidden text-sm font-medium md:block">Profile</span>
      </button>
    </header>
  );
}

function LeftPropertyPanel() {
  return (
    <div className="flex h-full flex-col overflow-hidden p-4 pr-10">
      <h2 className="text-base font-semibold">Properties</h2>

      <div className="mt-3 flex items-center rounded-lg border px-2">
        <Search size={18} className="text-slate-400" />
        <input
          placeholder="Search property..."
          className="w-full p-2 text-xs outline-none"
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <select className="rounded-lg border p-2 text-xs">
          <option>All Types</option>
          <option>House</option>
          <option>Land</option>
          <option>Apartment</option>
        </select>

        <select className="rounded-lg border p-2 text-xs">
          <option>Any Price</option>
          <option>Below 50L</option>
          <option>50L - 1Cr</option>
          <option>Above 1Cr</option>
        </select>
      </div>

      <button className="mt-3 rounded-lg bg-slate-900 py-2 text-xs text-white">
        Query Properties
      </button>

      <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {properties.map((property) => (
          <div key={property.id} className="rounded-xl border bg-slate-50 p-2.5 hover:bg-slate-100">
            <div className="text-sm font-semibold">{property.title}</div>
            <div className="mt-1 text-xs text-slate-500">{property.location}</div>
            <div className="mt-2 flex items-center justify-between">
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px]">{property.type}</span>
              <span className="text-xs font-bold">{property.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MapPanel() {
  return (
    <div className="absolute inset-0 bg-slate-200">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="absolute left-1/2 top-[42%] z-10 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white px-8 py-5 text-center shadow">
        <MapPin className="mx-auto mb-2 text-slate-700" size={32} />
        <h2 className="text-sm text-slate-500">Map Panel</h2>
        <p className="text-[11px] text-slate-500">Leaflet / Cesium map will render here</p>
      </div>

      {properties.map((property, index) => (
        <div
          key={property.id}
          className="absolute z-20 rounded-full bg-red-600 p-2 text-white shadow"
          style={{ left: `${35 + index * 12}%`, top: `${35 + index * 9}%` }}
          title={property.title}
        >
          <MapPin size={18} />
        </div>
      ))}
    </div>
  );
}

function RightLayerPanel({ layers, toggleLayer, removeLayer }) {
  return (
    <div className="flex h-full flex-col overflow-hidden p-4 pl-10">
      <div className="flex items-center gap-2">
        <Layers size={22} />
        <h2 className="text-base font-semibold">Spatial Layers</h2>
      </div>

      <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {layers.map((layer) => (
          <div key={layer.id} className="flex items-center justify-between rounded-xl border bg-slate-50 p-2.5">
            <div>
              <p className="text-sm font-medium">{layer.name}</p>
              <p className="text-[10px] text-slate-500">{layer.visible ? "Visible" : "Hidden"}</p>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => toggleLayer(layer.id)} className="rounded-lg border bg-white p-2">
                {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>

              <button onClick={() => removeLayer(layer.id)} className="rounded-lg border bg-white p-2 text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BottomAmenities() {
  return (
    <div className="grid h-[calc(100%-40px)] grid-cols-2 gap-3 overflow-hidden p-4 md:grid-cols-4">
      {amenities.map((item) => {
        const Icon = item.icon;

        return (
          <div key={item.name} className="flex items-center gap-2 rounded-xl border bg-slate-50 p-2.5">
            <div className="rounded-xl bg-white p-2">
              <Icon size={22} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500">{item.name}</p>
              <p className="text-sm font-semibold">{item.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}