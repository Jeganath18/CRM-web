import { useState } from "react";
import Logo from "../../assets/Wealth_Empires-removebg-preview.png";

const Login = ({ onLogin }: { onLogin: (role: string, name: string) => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, seterror] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:5000/login", {
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
        seterror("Invalid email or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      seterror(`Login error: ${err}`);
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
            <form className="space-y-4" onSubmit={() => event.preventDefault()}>
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
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <button
                type="submit"
                className="w-full text-white py-2 rounded-md hover:bg-[#5c2dbf] bg-[#7b49e7] transition"
                onClick={handleLogin}
              >
                Login
              </button>
              {error && (
                <div className="bg-red-100 text-red-700 p-2 mb-4 rounded text-sm">
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* 👇 Footer centered always */}
      <div className="text-center text-sm text-gray-500 py-4">
        &copy; Wealth Empires
      </div>
    </div>
  );
};

export default Login;
