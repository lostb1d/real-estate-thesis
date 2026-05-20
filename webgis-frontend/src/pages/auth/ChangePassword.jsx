import { useState } from "react";
import { changePassword } from "../../services/authService";
import { getErrorMessage } from "../../utils/errorHandler";

export default function ChangePassword() {
  const [form, setForm] = useState({
    old_password: "",
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
    setMessage("");

    try {
      const res = await changePassword(form);
      setMessage(res.message);
      setForm({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold">Change Password</h1>

        {message && <p className="mt-3 rounded bg-green-100 p-3 text-sm text-green-700">{message}</p>}
        {error && <p className="mt-3 rounded bg-red-100 p-3 text-sm text-red-700">{error}</p>}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <input name="old_password" type="password" placeholder="Old Password" value={form.old_password} onChange={change} className="w-full rounded-xl border p-3" required />
          <input name="new_password" type="password" placeholder="New Password" value={form.new_password} onChange={change} className="w-full rounded-xl border p-3" required />
          <input name="confirm_password" type="password" placeholder="Confirm Password" value={form.confirm_password} onChange={change} className="w-full rounded-xl border p-3" required />

          <button className="w-full rounded-xl bg-slate-900 py-3 text-white">
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}