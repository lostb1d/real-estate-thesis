import { useState } from "react";
import {
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Edit,
  Heart,
  Home,
  Save,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const listedAds = [
  {
    id: 1,
    title: "House for Sale",
    location: "Ghorahi-15",
    price: "Rs. 1.2 Cr",
    status: "Approved",
  },
  {
    id: 2,
    title: "Commercial Land",
    location: "Ghorahi-16",
    price: "Rs. 75 Lakh",
    status: "Pending",
  },
];

const wishlists = [
  {
    id: 1,
    title: "Rental Apartment",
    location: "Ghorahi-17",
    price: "Rs. 25,000/mo",
  },
  {
    id: 2,
    title: "Land Near Main Road",
    location: "Tulsipur",
    price: "Rs. 45 Lakh",
  },
];

export default function Profile() {
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user")) || {};

  const [editMode, setEditMode] = useState(false);

  const [profile, setProfile] = useState({
    username: storedUser.username || "User",
    email: storedUser.email || "user@example.com",
    phone: storedUser.phone || "",
    address: "Ghorahi, Dang",
  });

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setEditMode(false);
    alert("Profile updated successfully.");
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
          <h1 className="text-base font-semibold">Profile</h1>
        </div>

        <button
          onClick={() => setEditMode(!editMode)}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs text-white"
        >
          <Edit size={15} />
          {editMode ? "Cancel" : "Edit Profile"}
        </button>
      </header>

      <main className="grid h-[calc(100vh-56px)] grid-cols-12 gap-4 overflow-hidden p-4">
        <section className="col-span-4 overflow-hidden rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <UserCircle size={90} className="text-slate-700" />

            <h2 className="mt-3 text-lg font-semibold">{profile.username}</h2>
            <p className="text-xs text-slate-500">Verified User</p>
          </div>

          <div className="mt-6 space-y-4">
            <ProfileInput
              icon={Mail}
              label="Email"
              name="email"
              value={profile.email}
              disabled={!editMode}
              onChange={handleChange}
            />

            <ProfileInput
              icon={Phone}
              label="Phone"
              name="phone"
              value={profile.phone}
              disabled={!editMode}
              onChange={handleChange}
            />

            <ProfileInput
              icon={MapPin}
              label="Address"
              name="address"
              value={profile.address}
              disabled={!editMode}
              onChange={handleChange}
            />

            {editMode && (
              <button
                onClick={handleSave}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2 text-sm text-white"
              >
                <Save size={16} />
                Save Changes
              </button>
            )}
          </div>
        </section>

        <section className="col-span-8 flex min-h-0 flex-col gap-4 overflow-hidden">
          <div className="min-h-0 flex-1 rounded-2xl bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Home size={18} />
              <h2 className="text-sm font-semibold">My Listed Ads</h2>
            </div>

            <div className="space-y-3 overflow-y-auto pr-1">
              {listedAds.map((ad) => (
                <PropertyCard key={ad.id} item={ad} showStatus />
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 rounded-2xl bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Heart size={18} />
              <h2 className="text-sm font-semibold">My Wishlists</h2>
            </div>

            <div className="space-y-3 overflow-y-auto pr-1">
              {wishlists.map((item) => (
                <PropertyCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function ProfileInput({ icon: Icon, label, name, value, disabled, onChange }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-500">{label}</label>
      <div className="mt-1 flex items-center gap-2 rounded-xl border px-3">
        <Icon size={16} className="text-slate-400" />
        <input
          name={name}
          value={value}
          disabled={disabled}
          onChange={onChange}
          className="w-full bg-transparent py-2 text-sm outline-none disabled:text-slate-600"
        />
      </div>
    </div>
  );
}

function PropertyCard({ item, showStatus }) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-slate-50 p-3">
      <div>
        <h3 className="text-sm font-semibold">{item.title}</h3>
        <p className="text-xs text-slate-500">{item.location}</p>
      </div>

      <div className="text-right">
        <p className="text-sm font-bold">{item.price}</p>
        {showStatus && (
          <span className="mt-1 inline-block rounded-full bg-slate-200 px-2 py-0.5 text-[10px]">
            {item.status}
          </span>
        )}
      </div>
    </div>
  );
}