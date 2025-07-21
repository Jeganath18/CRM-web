
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { ServiceStatus } from "./ServiceStatus";
import { UpcomingDeadlines } from "./UpcomingDeadlines";
import { useState,useEffect} from "react";
import DueAlerts from "./DueAlerts"
import axios from "axios";
import { CheckCircle } from "lucide-react";


export const Dashboard = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const alerts = [
  {
    id: 1,
    title: "GST Filing Overdue",
    client: "ABC Corp",
    daysLeft: -2,
  },
  {
    id: 2,
    title: "ITR Deadline Approaching",
    client: "XYZ Ltd",
    daysLeft: 3,
  },
];
  
  const [stats, setStats] = useState([
    {
      title: "Total Clients",
      value: "Loading...",
      change: "",
      icon: Users,
      color: "blue",
    },
    {
      title: "Active Services",
      value: "Loading...",
      change: "",
      icon: FileText,
      color: "green",
    },
    {
      title: "Pending Tasks",
      value: "Loading...",
      change: "",
      icon: Clock,
      color: "yellow",
    },
    {
      title: "Revenue",
      value: "Loading...",
      change: "",
      icon: TrendingUp,
      color: "purple",
    },
  ]);

   useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:5000/dashboard_stats");
        const data = res.data;

        setStats([
          {
            title: "Total Clients",
            value: data.total_clients.toString(),
            change: "+12%", // You can make this dynamic if needed
            icon: Users,
            color: "blue",
          },
          {
            title: "Active Clients",
            value: data.active_services.toString(),
            change: "+8%",
            icon: FileText,
            color: "green",
          },
          {
            title: "Pending Tasks",
            value: data.pending_tasks.toString(),
            change: "-5%",
            icon: Clock,
            color: "yellow",
          },
          {
            title: "Revenue",
            value: `${formatIndianShortNumber(data.total_revenue)}`,
            change: "+15%",
            icon: TrendingUp,
            color: "purple",
          },
        ]);
      } catch (err) {
        console.error("❌ Failed to fetch dashboard stats:", err);
      }
    };

    const fetchdues = async () => {
       const res = await axios.get("http://localhost:5000/dashboard_stats");
       const data = res.data;

    }

    fetchdues();
    fetchStats();
  }, []);

function formatIndianShortNumber(value: any): string {
  const num = Number(value); // Ensure it's a number

  if (isNaN(num)) return "₹0"; // Fallback for invalid numbers

  const format = (n: number, suffix: string) =>
    `₹${n.toFixed(2).replace(/\.00$/, "")}${suffix}`;

  if (num >= 10000000) {
    return format(num / 10000000, "Cr");
  } else if (num >= 100000) {
    return format(num / 100000, "L");
  } else if (num >= 1000) {
    return format(num / 1000, "K");
  } else {
    return `₹${num.toFixed(2).replace(/\.00$/, "")}`;
  }
}

const data = [
  {
    name: "ITR",
    completed: 1,
    total: 5,
    status: "on-track",
    deadline: "2025-07-23"
  },
  {
    name: "IP",
    completed: 1,
    total: 2,
    status: "on-track",
    deadline: "2025-07-23"
  },
  {
    name: "ISO",
    completed: 0,
    total: 6,
    status: "on-track",
    deadline: "2025-07-24"
  },
  {
    name: "Incorporation",
    completed: 4,
    total: 15,
    status: "ahead",
    deadline: "2025-07-30"
  },
  {
    name: "FSSAI",
    completed: 0,
    total: 6,
    status: "ahead",
    deadline: "2025-07-30"
  },
  {
    name: "GST",
    completed: 0,
    total: 7,
    status: "ahead",
    deadline: "2025-08-21"
  },
  {
    name: "MCA",
    completed: 0,
    total: 3,
    status: "no-deadline",
    deadline: "N/A"
  }
];


  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="relative inline-block text-3xl font-bold text-gray-900 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-1 after:w-full after:bg-[#5c2dbf]">
  Dashboard
</h1>


      </div>  

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={stat.title} {...stat} index={index} />
        ))}
      </div>

<div className="">
  {/* Grid layout with 3 columns on large screens */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">

    {/* Full-width section for service status (spans all 3 columns on large screens) */}
    <div className="lg:col-span-3">
      <ServiceStatus />
    </div>

    {/* Graph section (takes 2 columns on large screens) */}
    <div className="lg:col-span-2 w-full h-[400px]">
      <UpcomingDeadlines />

    </div>

    {/* Alerts & Deadlines */}
    <div className="space-y-6">
      <Card className="animate-scale-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {alerts.length > 0 ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            Urgent Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DueAlerts alerts={alerts} />
        </CardContent>
      </Card>

    </div>
    
  </div>
</div>
</div>
  );
};
