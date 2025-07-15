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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/register", {
        name,
        email,
        role
      });

      if (response.data.success) {
        alert("✅ User registered successfully!");
        if (onClose) onClose();
      } else {
        alert("❌ Registration failed.");
      }
    } catch (error) {
      console.error("❌ Error registering user:", error);
      alert("❌ Registration error occurred.");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mt-10 space-y-6 animate-fade-in" >
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">User Registration</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Name</label>
          <input
            name="name"
            type="text"
            required
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
          <input
            name="email"
            type="email"
            required
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Role</label>
          <select
            name="role"
            className={inputClass}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="" disabled>Select Role</option>
            <option value="admin">Admin</option>
            <option value="account_manager">Account Manager</option>
            <option value="sales_staff">Sales Staff</option>
            <option value="filling_staff">Filling Staff</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
        >
          Register
        </button>
      </form>

      {onClose && (
        <button
          className="mt-4 w-full text-sm text-gray-800"
          onClick={onClose}
        >
          Cancel
        </button>
      )}
    </div>
  );
}
