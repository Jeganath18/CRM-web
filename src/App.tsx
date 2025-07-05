import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import Login from "@/components/crm/Login";
import SetPassword from "@/components/ui/Set_password";
import ClientOnboard from "@/components/ui/Client-onboard"


const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    const name = localStorage.getItem("userName");
    if (token && role) {
      setIsAuthenticated(true);
      setUserRole(role);
      if (name) setUserName(name);
    }
  }, []);

  const handleLogin = (role: string, name: string) => {
    localStorage.setItem("token", "session-token");
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
            <Route path="/client-onboarding" element={<ClientOnboard></ClientOnboard>} />
            
            {/* Main route */}
            <Route 
              path="/*" 
              element={
                isAuthenticated ? (
                  <Index userName={userName} userRole={userRole} onLogout={handleLogout} />
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