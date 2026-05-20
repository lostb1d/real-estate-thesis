import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../services/authService";
import { getErrorMessage } from "../../utils/errorHandler";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await registerUser(form);
      localStorage.setItem("pending_email", form.email);
      navigate("/verify-otp");
    } catch (err) {
  setError(getErrorMessage(err));
} finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold">Create Account</h1>

        {error && <p className="mt-3 rounded bg-red-100 p-2 text-sm text-red-700">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input name="username" placeholder="Username" onChange={handleChange} className="w-full rounded-xl border p-3" required />
          <input name="email" type="email" placeholder="Email" onChange={handleChange} className="w-full rounded-xl border p-3" required />
          <input name="phone" placeholder="Phone" onChange={handleChange} className="w-full rounded-xl border p-3" />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full rounded-xl border p-3" required />

          <button disabled={loading} className="w-full rounded-xl bg-slate-900 py-3 text-white">
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm">
          Already have account? <Link to="/login" className="font-semibold">Login</Link>
        </p>
      </div>
    </div>
  );
}