
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { RecentActivity } from "./RecentActivity";
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
    console.log(BASE_URL);
    const fetchStats = async () => {
      try {
        const res = await axios.get("https://crm-server-yd9a.onrender.com/dashboard_stats");
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
       const res = await axios.get("https://crm-server-yd9a.onrender.com/dashboard_stats");
       const data = res.data;

    }

    fetchdues();

    fetchStats();
  }, []);

  function formatIndianShortNumber(value: number): string {
  if (value >= 10000000) {
    // 1 Cr = 1,00,00,000
    return `₹${(value / 10000000).toFixed(2)}Cr`;
  } else if (value >= 100000) {
    // 1 Lakh = 1,00,000
    return `₹${(value / 100000).toFixed(2)}L`;
  } else if (value >= 1000) {
    // 1 Thousand = 1,000
    return `₹${(value / 1000).toFixed(2)}K`;
  } else {
    // Less than 1000
    return `₹${value.toFixed(2)}`;
  }
}

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Welcome back! Here's your business overview.
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={stat.title} {...stat} index={index} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ServiceStatus />
          {/* <RecentActivity /> */}
        </div>
        <div className="space-y-6">
          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {alerts.length > 0 ? (<AlertCircle className="h-5 w-5 text-red-500" />): (<CheckCircle  className="h-5 w-5"/>)}
                Urgent Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
<DueAlerts alerts={alerts}></DueAlerts>
            </CardContent>
          </Card>
          <UpcomingDeadlines />

        </div>
      </div>
    </div>
  );
};
