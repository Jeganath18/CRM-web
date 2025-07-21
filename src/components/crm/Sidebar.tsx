import { useState, useRef, useEffect } from "react";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  UserCheck, 
  TrendingUp, 
  MessageSquare,
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  SettingsIcon,
  LogOut,
  UserCircle2Icon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { CreditCardIcon } from "lucide-react";
import Logo from "../../assets/Wealth Empires.jpg"

interface SidebarProps {
  userName: string | null,
  userRole: string | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onLogout: () => void; 
}

const fullMenuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "clients", label: "Clients", icon: Users },
  { id: "services", label: "Services", icon: FileText },
  { id: "billing", label: "Billing and Invoice", icon: CreditCardIcon },
  { id: "team", label: "Team", icon: UserCheck },
  { id: "leads", label: "Leads", icon: TrendingUp },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

const getMenuItemsForRole = (role: string | null) => {
  switch (role) {
    case "admin":
      return fullMenuItems;
    case "account_manager":
      return fullMenuItems.filter((item) => 
        [ "clients", "services","settings","billing"].includes(item.id)
      );
    case "sales_staff":
      return fullMenuItems.filter((item) => 
        ["leads","settings"].includes(item.id)
      );
    case "filling_staff":
      return fullMenuItems.filter((item) => 
        ["services","clients","settings"].includes(item.id)
      );
    default:
      return [];
  }
};

export const Sidebar = ({ userName,userRole, activeTab, setActiveTab, isOpen, setIsOpen, onLogout }: SidebarProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
          setShowDropdown(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const menuItems = getMenuItemsForRole(userRole);

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-50 flex flex-col",
      isOpen ? "w-64" : "w-16"
    )}>
      <div className="flex items-center justify-between p-1 border-b border-gray-200">
    
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hover:bg-gray-100 rounded-lg transition-colors"
        >
       
  <img
  src={Logo}
  alt="Logo"
  className={`transition-all duration-300 ${isOpen ? "h-23 w-23" : "h-20 w-20"} object-contain`}
/>


        </button>
      </div>

      <nav className="flex-1 mt-6 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              title={!isOpen ? item.label : undefined} 
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center px-4 py-3 text-left hover:border-[#d6c8ea] transition-all duration-200",
                activeTab === item.id
                  ? "bg-[#e6dcf4] border-r-2 border-[#b5a2d2] text-[#5c2dbf]"
                  : "text-gray-600"
              )}
            >
              <Icon size={20} className="flex-shrink-0" />
              {isOpen && <span className="ml-3 animate-fade-in">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto p-2 border-t border-gray-200">
        <div className="relative w-full">
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full inline-flex items-center gap-x-2 p-2 text-start text-sm text-gray-800 rounded-md hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
            aria-haspopup="menu"
            aria-expanded={showDropdown}
            aria-label="Dropdown"
          >
            {/* <img
              className="shrink-0 size-5 rounded-full"
              src="https://images.unsplash.com/photo-1734122415415-88cb1d7d5dc0?q=80&w=320&h=320&auto=format&fit=facearea&facepad=3"
              alt="Avatar"
            /> */}
            <UserCircle2Icon />

            {isOpen && (
              <>
                <span className="truncate">{userName}</span>
                <svg
                  className="shrink-0 size-3.5 ms-auto"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m7 15 5 5 5-5" />
                  <path d="m7 9 5-5 5 5" />
                </svg>
              </>
            )}
          </button>

          {showDropdown && isOpen && (
            <div 
              ref={dropdownRef}
              className="absolute bottom-full mb-2 left-0 right-0 mx-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
            >
              <div className="p-1">
                <button
                  className="w-full flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100"
                  onClick={()=>setActiveTab("settings")}
                >
                  <SettingsIcon size={16} ></SettingsIcon>
                  Settings
                </button>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-x-3 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};