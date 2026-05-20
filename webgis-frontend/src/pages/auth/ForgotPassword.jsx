import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgotPassword } from "../../services/authService";
import { getErrorMessage } from "../../utils/errorHandler";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await forgotPassword({ email });
      localStorage.setItem("reset_email", email);
      navigate("/reset-password");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold">Forgot Password</h1>

        {error && <p className="mt-3 rounded bg-red-100 p-3 text-sm text-red-700">{error}</p>}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full rounded-xl border p-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button className="w-full rounded-xl bg-slate-900 py-3 text-white">
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm">
          Back to <Link to="/login" className="font-semibold">Login</Link>
        </p>
      </div>
    </div>
  );
}