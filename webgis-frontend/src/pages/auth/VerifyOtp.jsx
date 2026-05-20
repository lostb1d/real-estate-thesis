import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { verifyOtp, resendOtp } from "../../services/authService";
import { getErrorMessage } from "../../utils/errorHandler";
export default function VerifyOtp() {
  const navigate = useNavigate();
  const email = localStorage.getItem("pending_email") || "";

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await verifyOtp({ email, otp });
      localStorage.removeItem("pending_email");
      navigate("/login");
    } catch (err) {
  setError(getErrorMessage(err));
} finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setMessage("");

    try {
      await resendOtp({ email });
      setMessage("OTP resent successfully.");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to resend OTP.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold">Verify Email</h1>
        <p className="mt-1 text-sm text-slate-500">OTP sent to {email}</p>

        {message && <p className="mt-3 rounded bg-green-100 p-2 text-sm text-green-700">{message}</p>}
        {error && <p className="mt-3 rounded bg-red-100 p-2 text-sm text-red-700">{error}</p>}

        <form onSubmit={handleVerify} className="mt-6 space-y-4">
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="w-full rounded-xl border p-3"
            required
          />

          <button disabled={loading} className="w-full rounded-xl bg-slate-900 py-3 text-white">
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <button onClick={handleResend} className="mt-4 w-full rounded-xl border py-3">
          Resend OTP
        </button>

        <p className="mt-5 text-center text-sm">
          Back to <Link to="/login" className="font-semibold">Login</Link>
        </p>
      </div>
    </div>
  );
}