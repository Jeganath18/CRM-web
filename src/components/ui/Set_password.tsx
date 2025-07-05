import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function SetPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  useEffect(() => {
    if (!email || !token) {                                                                     
      setError("Invalid link. Missing token or email.");
      setStatus("error");
    }
  }, [email, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setStatus("loading");
      const res = await axios.post("http://localhost:5000/set-password", {
        email,
        token,
        password,
      });

      if (res.data.success) {
        setStatus("success");
        setTimeout(() => navigate("/"), 2000);
      } else {
        setError(res.data.message || "Failed to set password.");
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Something went wrong.");
      setStatus("error");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Set Your Password</h2>

      {status === "success" ? (
        <p className="text-green-600 text-center">✅ Password set! Redirecting to login...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">New Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Setting..." : "Set Password"}
          </button>
        </form>
      )}
    </div>
  );
}
