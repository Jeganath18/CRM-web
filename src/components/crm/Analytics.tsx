
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, DollarSign, Users, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

export const Analytics = () => {
    const [serviceData,setserviceData] = useState([]);
    const [dashData,setdashData] = useState([]);
  const [revenueData,setrevenueData] = useState([]);
  const [loading, setLoading] = useState(true);


 
useEffect(() => {
  async function fetchData() {
    try {
      const [service, revenue, dashrevenue, teamperformance] = await Promise.all([
        axios.get("https://crm-server-yd9a.onrender.com/get_analytics"),
        axios.get("https://crm-server-yd9a.onrender.com/get_revenue_analytics"),
        axios.get("https://crm-server-yd9a.onrender.com/get_dashboard_analytics"),
        axios.get("https://crm-server-yd9a.onrender.com/team_performance"),
      ]);

      setteamPerformanceData([
        { team: "INCORP Team", target: teamperformance.data[4].total_services, completed: teamperformance.data[4].completed_services, efficiency: teamperformance.data[4].efficiency },
        { team: "GST Team", target: teamperformance.data[0].total_services, completed: teamperformance.data[0].completed_services, efficiency: teamperformance.data[0].efficiency },
        { team: "ITR Team", target: teamperformance.data[1].total_services, completed: teamperformance.data[1].completed_services, efficiency: teamperformance.data[1].efficiency },
        { team: "MCA Team", target: teamperformance.data[3].total_services, completed: teamperformance.data[3].completed_services, efficiency: teamperformance.data[3].efficiency },
        { team: "IP Team", target: teamperformance.data[2].total_services, completed: teamperformance.data[2].completed_services, efficiency: teamperformance.data[2].efficiency }
      ]);

      setrevenueData(revenue.data);
      setdashData(dashrevenue.data);
      setserviceData([
        { name: "Incorporation", value: service.data[0].count, color: "#8884d8" },
        { name: "GST Fillings", value: service.data[1].count, color: "#82ca9d" },
        { name: "Trademark/IP", value: service.data[2].count, color: "#ffc658" },
        { name: "ITR", value: service.data[3].count, color: "#ff7c7c" },
        { name: "MCA", value: service.data[4].count, color: "#ff7c1c" }
      ]);

      setLoading(false); // all done
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setLoading(false);
    }
  }

  fetchData();
}, []);




  const [teamPerformanceData,setteamPerformanceData] = useState([]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
        <div className="text-sm text-gray-500">
          Performance insights for your business
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="animate-scale-in">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">₹{dashData[0]?.total_revenue}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="animate-scale-in" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Clients</p>
                <p className="text-2xl font-bold text-blue-600">{dashData[0]?.active_clients}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="animate-scale-in" style={{ animationDelay: '200ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Services Completed</p>
                <p className="text-2xl font-bold text-purple-600">{dashData[0]?.services_completed}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="animate-scale-in" style={{ animationDelay: '300ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Efficiency Rate</p>
                <p className="text-2xl font-bold text-yellow-600">{dashData[0]?.efficiency_rate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Service Distribution */}
        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle>Service Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance */}
      <Card className="animate-scale-in">
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={teamPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="team" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" fill="#8884d8" name="Completed" />
              <Bar dataKey="target" fill="#82ca9d" name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {teamPerformanceData.map((team, index) => (
          <Card key={team.team} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{team.team}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">target:</span>
                  <span className="font-medium">{team.completed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Target:</span>
                  <span className="font-medium">{team.target}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Efficiency:</span>
                  <span className={`font-medium ${team.efficiency >= 95 ? 'text-green-600' : team.efficiency >= 90 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {team.efficiency}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
