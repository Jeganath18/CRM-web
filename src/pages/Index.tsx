import { useState } from "react";
import { Sidebar } from "@/components/crm/Sidebar";
import { Dashboard } from "@/components/crm/Dashboard";
import { ClientManagement } from "@/components/crm/ClientManagement";
import { ServiceTracking } from "@/components/crm/ServiceTracking";
import { TeamCollaboration } from "@/components/crm/TeamCollaboration";
import { LeadManagement } from "@/components/crm/LeadManagement";
import { Analytics } from "@/components/crm/Analytics";
import { Billing } from "@/components/crm/Billing";
import Settings from "@/components/crm/Settings";

interface IndexProps {
  userRole: string | null;
  userName: string | null;
  onLogout: () => void;
}

const Index = ({ userName,userRole, onLogout }: IndexProps) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "clients":
        return <ClientManagement userName={userName} userRole={userRole} />;
      case "services":
        return <ServiceTracking userName={userName} userRole={userRole} />;
      case "billing":
        return <Billing userName={userName} userRole={userRole} />;  
      case "team":
        return <TeamCollaboration />;
      case "leads":
        return <LeadManagement />;
      case "analytics":
        return <Analytics />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      <Sidebar
        userName={userName}
        userRole={userRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onLogout={onLogout}
      />
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Index;
