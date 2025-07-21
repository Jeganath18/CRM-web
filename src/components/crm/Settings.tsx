import { useState, useEffect } from "react";
import { User, Cog } from "lucide-react";
import axios from "axios";

export default function Settings() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    newPassword: "",
  });

  const [changePassword, setChangePassword] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching user data
    const fetchUser = async () => {
      try {
        setLoading(true);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
         const user = localStorage.getItem("userName");
      try {
        const res = await axios.get(`http://localhost:5000/get_user/${user}`);
        console.log(res.data);
       if (res.data && res.data.length > 0) {
  const userData = res.data[0];
  setFormData((prev) => ({
    ...prev,
    name: userData.name || "",
    email: userData.email || "",
  }));
}
      } catch (err) {
        console.error("Error fetching user:", err);
      }   
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value || "",
    }));
  };

  const handleSubmit = async () => {
    try {
      const body = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        ...(changePassword && { newPassword: formData.newPassword }),
      };

      console.log("Submitting:", body);
      // Replace with actual API call
      const response = await axios.post("http://localhost:5000/update_profile", body);
      localStorage.setItem("user", formData.name);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error updating profile. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7b49e7] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-2">
      <div className="max-w-8xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              Settings
            </h1>
          
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </h2>
          </div>

          <div onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="change-password"
                type="checkbox"
                checked={changePassword}
                onChange={(e) => setChangePassword(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="change-password" className="text-sm font-medium text-gray-700">
                Change Password
              </label>
            </div>

            {changePassword && (
              <div className="space-y-2 animate-fadeIn">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required={changePassword}
                />
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full hover:bg-[#5c2dbf] bg-[#7b49e7] text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
              >
                Save Changes
              </button> 
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}