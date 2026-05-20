import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { resetPassword, forgotPassword } from "../../services/authService";
import { getErrorMessage } from "../../utils/errorHandler";

export default function ResetPassword() {
  const navigate = useNavigate();
  const email = localStorage.getItem("reset_email") || "";

  const [form, setForm] = useState({
    otp: "",
    new_password: "",
    confirm_password: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const change = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await resetPassword({ email, ...form });
      localStorage.removeItem("reset_email");
      navigate("/login");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const resend = async () => {
    setError("");
    setMessage("");

    try {
      await forgotPassword({ email });
      setMessage("OTP resent successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold">Reset Password</h1>
        <p className="text-sm text-slate-500">OTP sent to {email}</p>

        {message && <p className="mt-3 rounded bg-green-100 p-3 text-sm text-green-700">{message}</p>}
        {error && <p className="mt-3 rounded bg-red-100 p-3 text-sm text-red-700">{error}</p>}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <input name="otp" placeholder="OTP" onChange={change} className="w-full rounded-xl border p-3" required />
          <input name="new_password" type="password" placeholder="New Password" onChange={change} className="w-full rounded-xl border p-3" required />
          <input name="confirm_password" type="password" placeholder="Confirm Password" onChange={change} className="w-full rounded-xl border p-3" required />

          <button className="w-full rounded-xl bg-slate-900 py-3 text-white">
            Reset Password
          </button>
        </form>

        <button onClick={resend} className="mt-4 w-full rounded-xl border py-3">
          Resend OTP
        </button>

        <p className="mt-5 text-center text-sm">
          Back to <Link to="/login" className="font-semibold">Login</Link>
        </p>
      </div>
    </div>
  );
}