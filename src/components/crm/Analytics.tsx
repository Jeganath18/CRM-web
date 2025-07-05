
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, DollarSign, Users, FileText } from "lucide-react";

export const Analytics = () => {
  const revenueData = [
    { month: "Jan", revenue: 450000, clients: 45 },
    { month: "Feb", revenue: 520000, clients: 52 },
    { month: "Mar", revenue: 480000, clients: 48 },
    { month: "Apr", revenue: 620000, clients: 62 },
    { month: "May", revenue: 580000, clients: 58 },
    { month: "Jun", revenue: 750000, clients: 75 }
  ];

  const serviceData = [
    { name: "GST Filing", value: 40, color: "#8884d8" },
    { name: "ITR Processing", value: 30, color: "#82ca9d" },
    { name: "MCA Compliance", value: 20, color: "#ffc658" },
    { name: "IP Services", value: 10, color: "#ff7c7c" }
  ];

  const teamPerformanceData = [
    { team: "GST Team", completed: 45, target: 50, efficiency: 90 },
    { team: "ITR Team", completed: 38, target: 40, efficiency: 95 },
    { team: "MCA Team", completed: 22, target: 25, efficiency: 88 },
    { team: "IP Team", completed: 15, target: 15, efficiency: 100 }
  ];

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
                <p className="text-2xl font-bold text-green-600">₹38.5L</p>
                <p className="text-xs text-green-600">+15% from last month</p>
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
                <p className="text-2xl font-bold text-blue-600">340</p>
                <p className="text-xs text-blue-600">+8% from last month</p>
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
                <p className="text-2xl font-bold text-purple-600">120</p>
                <p className="text-xs text-purple-600">+12% from last month</p>
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
                <p className="text-2xl font-bold text-yellow-600">93%</p>
                <p className="text-xs text-yellow-600">+3% from last month</p>
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
              <Bar dataKey="target" fill="#82ca9d" name="Target" />
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
                  <span className="text-gray-600">Completed:</span>
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
