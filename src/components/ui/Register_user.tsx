import React, { useState } from "react";
import axios from "axios";

interface RegisterFormProps {
  onClose?: () => void;
}

export default function RegisterForm({ onClose }: RegisterFormProps) {
  const inputClass =
    "w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false); 

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); // 🔄 Start spinner

    try {
      const response = await axios.post("https://crm-server-three.vercel.app/register", {
        name,
        email,
        role,
      });

      if (response.data.success) {
        console.log("✅ User registered successfully!");
        if (onClose) onClose();
      } else {
        alert("❌ Registration failed.");
      }
    } catch (error) {
      console.error("❌ Error registering user:", error);
      alert("❌ Registration error occurred.");
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mt-10 space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
        User Registration
      </h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            name="name"
            type="text"
            required
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Role
          </label>
          <select
            name="role"
            className={inputClass}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={loading}
          >
            <option value="" disabled>
              Select Role
            </option>
            <option value="admin">Admin</option>
            <option value="account_manager">Account Manager</option>
            <option value="sales_staff">Sales Staff</option>
            <option value="filling_staff">Filling Staff</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full flex justify-center items-center gap-2 bg-[#7b49e7] hover:bg-[#5c2dbf] text-white font-semibold py-2 px-4 rounded-lg"
          disabled={loading}
        >
          {loading && (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
              ></path>
            </svg>
          )}
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      {onClose && (
        <button
          className="mt-4 w-full text-sm text-gray-800"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </button>
      )}
    </div>
  );
}
