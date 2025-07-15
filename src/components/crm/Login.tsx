import { useState } from "react";
import defaultLogo from "@/assets/Wealth Empires.jpg";
import illustration from "@/assets/4957136.jpg"
const Login = ({ onLogin }: { onLogin: (role: string, name: string) => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
      console.log(response);
      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem("token", "session-user");
        localStorage.setItem("userRole", data.user.role);
        localStorage.setItem("userName", data.user.name);

        onLogin(data.user.role,data.user.name);
      } else {
        alert(data.message || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="flex h-screen w-full">

      {/* Left Illustration Side */}
      <div className="hidden md:flex w-1/2 bg-white items-center justify-center relative overflow-hidden">
        <div className="absolute left-0 top-0 w-2 bg-blue-600 h-full"></div>
        <img
          src={illustration} // or any other SVG/illustration URL
          alt="Login Illustration"
          style={{height:"800px",width:"700px"}}
        />
      </div>

      {/* Right Login Form Side */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 bg-blue-50">
        
        <div className="w-full max-w-md bg-white p-8 shadow-lg rounded-xl space-y-6 animate-fade-in">
          <img src={defaultLogo}  className="h-[120px] mx-auto" alt="logo" />
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Welcome Back 👋
          </h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            Please login to access your dashboard
          </p>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded font-medium transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
