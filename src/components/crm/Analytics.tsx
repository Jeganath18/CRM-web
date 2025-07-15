import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, DollarSign, Users, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "../ui/button";
import jsPDF from "jspdf";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import autoTable from "jspdf-autotable";

export const Analytics = () => {
  const [serviceData, setServiceData] = useState<any[]>([]);
  const [dashData, setDashData] = useState<any>({});
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [teamPerformanceData, setTeamPerformanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [metrics, setMetrics] = useState<any>({});
  const [leadMetrics, setLeadMetrics] = useState<any>({
    total_leads: 0,
    converted_leads: 0,
    dropped_leads: 0,
    new_leads: 0,
  });
  const [taxData, setTaxData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [service, revenue, dashrevenue, teamperformance] = await Promise.all([
          axios.get("http://localhost:5000/get_analytics"),
          axios.get("http://localhost:5000/get_revenue_analytics"),
          axios.get("http://localhost:5000/get_dashboard_analytics"),
          axios.get("http://localhost:5000/team_performance"),
        ]);

        const dash = dashrevenue.data;
        setDashData(dash);

        // Extract and map lead & tax data
        const lead = dash.leadData || {};
        const totalLeads = (lead.converted_leads || 0) + (lead.dropped_leads || 0) + (lead.new_leads || 0);
        setLeadMetrics({
          total_leads: totalLeads,
          converted_leads: lead.converted_leads || 0,
          dropped_leads: lead.dropped_leads || 0,
          new_leads: lead.new_leads || 0,
        });

        setTaxData(dash.taxData || []);
        console.log(dash.taxData);
        setTeamPerformanceData([
          { team: "INCORP Team", target: teamperformance.data[4].total_services, completed: teamperformance.data[4].completed_services, efficiency: teamperformance.data[4].efficiency },
          { team: "GST Team", target: teamperformance.data[0].total_services, completed: teamperformance.data[0].completed_services, efficiency: teamperformance.data[0].efficiency },
          { team: "ITR Team", target: teamperformance.data[1].total_services, completed: teamperformance.data[1].completed_services, efficiency: teamperformance.data[1].efficiency },
          { team: "MCA Team", target: teamperformance.data[3].total_services, completed: teamperformance.data[3].completed_services, efficiency: teamperformance.data[3].efficiency },
          { team: "IP Team", target: teamperformance.data[2].total_services, completed: teamperformance.data[2].completed_services, efficiency: teamperformance.data[2].efficiency }
        ]);

        setRevenueData(revenue.data);
        setServiceData([
          { name: "Incorporation", value: service.data[0].count, color: "#8884d8" },
          { name: "GST Fillings", value: service.data[1].count, color: "#82ca9d" },
          { name: "Trademark/IP", value: service.data[2].count, color: "#ffc658" },
          { name: "ITR", value: service.data[3].count, color: "#ff7c7c" },
          { name: "MCA", value: service.data[4].count, color: "#ff7c1c" }
        ]);

        await fetchMetrics();
        setLoading(false);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const fetchMetrics = async () => {
    if (!startDate || !endDate) return;

    try {
      const res = await axios.get("http://localhost:5000/report_metrics", {
        params: {
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        },
      });
      setMetrics(res.data);
    } catch (err) {
      console.error("Failed to fetch metrics:", err);
    }
  };

  const generatePDFReport = async () => {
    await fetchMetrics();
    if (!metrics) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Analytics Report", 14, 20);

    if (startDate && endDate) {
      doc.setFontSize(10);
      doc.text(`Reporting Period: ${startDate.toISOString().split("T")[0]} - ${endDate.toISOString().split("T")[0]}`, 14, 28);
    }

    let y = 36;

    autoTable(doc, {
      startY: y,
      head: [["Metric", "Value"]],
      body: [
        ["Total Leads", leadMetrics.total_leads],
        ["Converted Leads", leadMetrics.converted_leads],
        ["Dropped Leads", leadMetrics.dropped_leads],
        ["New Leads", leadMetrics.new_leads],
      ]
    });

    doc.save(`Analytics_Report_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
        <div className="flex items-center gap-3">
          <DatePicker selected={startDate} onChange={setStartDate} placeholderText="Start Date" className="border px-2 py-1 rounded" />
          <DatePicker selected={endDate} onChange={setEndDate} placeholderText="End Date" className="border px-2 py-1 rounded" />
          <Button variant="outline" onClick={generatePDFReport}>Fetch Report</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p>Total Revenue</p>
                <p className="text-2xl text-green-600">₹{dashData.total_revenue}</p>
              </div>
              <DollarSign className="text-green-500 w-8 h-8" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p>Active Clients</p>
                <p className="text-2xl text-blue-600">{dashData.active_clients}</p>
              </div>
              <Users className="text-blue-500 w-8 h-8" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p>Services Completed</p>
                <p className="text-2xl text-purple-600">{dashData.services_completed}</p>
              </div>
              <FileText className="text-purple-500 w-8 h-8" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p>Efficiency Rate</p>
                <p className="text-2xl text-yellow-600">{dashData.efficiency_rate}%</p>
              </div>
              <TrendingUp className="text-yellow-500 w-8 h-8" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, "Revenue"]} />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Conversion Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Conversion Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                  data={[
                    { name: "Converted", value: leadMetrics.converted_leads }, 
                    { name: "Dropped", value: leadMetrics.dropped_leads }, 
                    { name: "New", value: leadMetrics.new_leads }
                  ]} 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={80} 
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} 
                  dataKey="value"
                >
                  <Cell fill="#28a745" />
                  <Cell fill="#dc3545" />
                  <Cell fill="#ffc107" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* GST/ITR Filing Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly GST/ITR Filing Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taxData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="gst" fill="#82ca9d" name="GST Filings" />
                <Bar dataKey="itr" fill="#8884d8" name="ITR Filings" />
              </BarChart>
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