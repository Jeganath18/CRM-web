import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

// Define a type for a single service object for better TypeScript support
interface Service {
  name: string;
  completed: number;
  total: number;
  status: string;
  deadline: string;
}

export const ServiceStatus = () => {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchServiceStats = async () => {
      try {
        const res = await axios.get("https://crm-server-three.vercel.app/get_service_stats");
        const data = res.data;

        // 💡 Dynamically map the API response instead of hardcoding indexes
        const formattedServices = data.map((service: any) => ({
          name: service.name || "Unknown",
          completed: parseInt(service.completed, 10) || 0,
          total: parseInt(service.total, 10) || 1, // Default to 1 to avoid division by zero
          status: service.status || "unknown",
          deadline: service.deadline || ""
        }));

        setServices(formattedServices);
        console.log("Fetched and formatted services:", formattedServices);
        
      } catch (e) {
        console.error("Error fetching service status:", e);
      }
    };

    fetchServiceStats();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ahead": return "bg-green-500";
      case "on-track": return "bg-blue-500";
      case "behind": return "bg-red-500";
      case "complete": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ahead": return "Ahead of Schedule";
      case "on-track": return "On Track";
      case "behind": return "Behind Schedule";
      case "complete": return "Completed";
      default: return "Unknown";
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* Left: Chart Card */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Monthly Service Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={services}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={0} textAnchor="middle" interval={0} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#5c2dbf"
                  strokeWidth={3}
                  name="Completed"
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#8884d8"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  name="Total"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Right: List Card */}
      <Card className="w-full lg:w-[400px] animate-scale-in">
        <CardHeader>
          <CardTitle>Detailed Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {services.map((service, index) => (
              <div key={service.name} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{service.name.toUpperCase()}</h3>
                  <Badge className={getStatusColor(service.status)}>
                    {getStatusText(service.status)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>{service.completed} of {service.total} completed</span>
                  <span>Due: {service.deadline?.slice(0, 10) || 'Not set'}</span>
                </div>
                <Progress
                  value={(service.completed / service.total) * 100}
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};