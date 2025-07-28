import { useState } from "react";
import { Eye, EyeOff } from "lucide-react"; // Import icons for the toggle
import Logo from "../../assets/Wealth_Empires-removebg-preview.png";

const Login = ({ onLogin }: { onLogin: (role: string, name: string) => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  // This function now handles the form's submit event
  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent the default form submission behavior
    setError(""); // Clear previous errors

    try {
      const response = await fetch("https://crm-server-three.vercel.app/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem("token", "session-user");
        localStorage.setItem("userRole", data.user.role);
        localStorage.setItem("userName", data.user.name);
        onLogin(data.user.role, data.user.name);
      } else {
        setError(data.message || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-[#b5a2d2] to-white overflow-auto">
      <div className="flex-grow flex items-center justify-center">
        <div className="max-w-6xl w-full px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="w-full md:w-1/2 text-center md:text-left mb-8 md:mb-0">
            <img src={Logo} alt="Wealthempires_logo" className="h-40 mx-auto md:mx-0" />
            <h3 className="text-[36px]">#We CRM</h3>
            <h5 className="text-[20px]">The #One App for Everyone!</h5>
            <p className="text-gray-600 mt-2 font-poppins">Simple. Secure. Seamless.</p>
          </div>

          <div className="w-full md:w-1/2 max-w-md bg-white shadow-md rounded-xl p-8">
            <h2 className="text-xl font-semibold text-center mb-6">SIGN IN</h2>
            {/* The onSubmit event is now handled by the form */}
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="block mb-1 font-medium text-sm text-gray-700">Email ID</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-sm text-gray-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} // Dynamically set the input type
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    // Add padding-right to make space for the icon
                    className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
                  />
                  <button
                    type="button" // Important: set type to "button" to prevent form submission
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" /> 
                    ) : (
                      <Eye className="h-5 w-5" /> 
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full text-white py-2 rounded-md hover:bg-[#5c2dbf] bg-[#7b49e7] transition"
              >
                Login
              </button>
              {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded text-sm text-center">
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 py-4">
        &copy; {new Date().getFullYear()} Wealth Empires
      </div>
    </div>
  );
};

export default Login;