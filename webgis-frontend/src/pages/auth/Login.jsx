import { useState } from "react";
// import { Link } from "react-router-dom";
import { loginUser } from "../../services/authService";
import { getErrorMessage } from "../../utils/errorHandler";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  setError("");
  setLoading(true);

  try {
    await loginUser(form);
    navigate("/dashboard");
  } catch (err) {
  console.log("LOGIN ERROR:", err);
  console.log("LOGIN ERROR RESPONSE:", err.response);
  setError(getErrorMessage(err));
} finally {
    setLoading(false);
  }
};

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold">Login</h1>

        {error && <p className="mt-3 rounded bg-red-100 p-2 text-sm text-red-700">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input name="email" type="email" placeholder="Email" onChange={handleChange} className="w-full rounded-xl border p-3" required />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full rounded-xl border p-3" required />

          <button disabled={loading} className="w-full rounded-xl bg-slate-900 py-3 text-white">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
<p className="mt-3 text-center text-sm">
  <Link to="/forgot-password" className="font-semibold">
    Forgot password?
  </Link>
</p>
        <p className="mt-5 text-center text-sm">
          No account? <Link to="/register" className="font-semibold">Register</Link>
        </p>
      </div>
    </div>
  );
}