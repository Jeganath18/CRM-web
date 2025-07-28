import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import Login from "@/components/crm/Login";
import SetPassword from "@/components/ui/Set_password";
import ClientOnboard from "@/components/ui/Client-onboard";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Token generator
  function generateRandomToken() {
    const header = {
      alg: "HS256",
      typ: "JWT",
    };

    const payload = {
      sub: Math.random().toString(36).substring(2),
      iat: Math.floor(Date.now() / 1000),
    };

    function base64url(source: object) {
      return btoa(JSON.stringify(source))
        .replace(/=+$/, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
    }

    const encodedHeader = base64url(header);
    const encodedPayload = base64url(payload);
    const signature = Math.random().toString(36).substring(2, 22); // dummy

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    const name = localStorage.getItem("userName");
    if (token && role) {
      setIsAuthenticated(true);
      setUserRole(role);
      if (name) setUserName(name);
      setLoading(false);
    }
    setLoading(false);
  }, []);

  const handleLogin = (role: string, name: string) => {
    const token = generateRandomToken();
    localStorage.setItem("token", token);
    localStorage.setItem("userRole", role);
    localStorage.setItem("userName", name);
    setIsAuthenticated(true);
    setUserRole(role);
    setUserName(name);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    setIsAuthenticated(false);
    setUserRole(null);
    setUserName("");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* All routes must be direct children of <Routes> */}
            <Route path="/set-password" element={<SetPassword />} />
            <Route
              path="/client-onboarding"
              element={<ClientOnboard></ClientOnboard>}
            />

            {/* Main route */}
            <Route
              path="/*"
              element={
                loading ? (
                  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7b49e7] mx-auto"></div>
                      <p className="mt-4 text-gray-600">Loading...</p>
                    </div>
                  </div>
                ) : isAuthenticated ? (
                  <Index
                    userName={userName}
                    userRole={userRole}
                    onLogout={handleLogout}
                  />
                ) : (
                  <Login onLogin={handleLogin} />
                )
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
