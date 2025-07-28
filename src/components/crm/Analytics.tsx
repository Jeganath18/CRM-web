import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, DollarSign, Users, FileText, IndianRupee } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "../ui/button";
import jsPDF from "jspdf";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import autoTable from "jspdf-autotable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Analytics = () => {
  const [serviceData, setServiceData] = useState<any[]>([]);
  const [dashData, setDashData] = useState<any>({});
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [teamPerformanceData, setTeamPerformanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [metrics, setMetrics] = useState<any>({});
  const [showFetch, setShowfetch] = useState(false);
  const [loadingspinner, setLoadingspinner] = useState(false);
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
          axios.get("https://crm-server-three.vercel.app/get_analytics"),
          axios.get("https://crm-server-three.vercel.app/get_revenue_analytics"),
          axios.get("https://crm-server-three.vercel.app/get_dashboard_analytics"),
          axios.get("https://crm-server-three.vercel.app/team_performance"),
        ]);

        const dash = dashrevenue.data;
        setDashData(dash);

        // Extract and map lead data correctly
        const leadData = dash?.leadData || {};
        const totalLeads =
          (leadData?.converted_leads || 0) +
          (leadData?.dropped_leads || 0) +
          (leadData?.new_leads || 0);

        setLeadMetrics({
          total_leads: totalLeads,
          converted_leads: leadData?.converted_leads || 0,
          dropped_leads: leadData?.dropped_leads || 0,
          new_leads: leadData?.new_leads || 0,
        });

        // Set tax data
        setTaxData(dash.taxData || []);
        console.log("Tax data:", dash.taxData);
        console.log("Team performance:", teamperformance.data);

        // Create team performance data mapping - fix the team name mapping
        const teamMap = {};
        teamperformance.data.forEach((item) => {
          teamMap[item.team.toLowerCase()] = item; // Use 'team' instead of 'service_type'
        });

        // Create final team data using correct mapping
        setTeamPerformanceData([
          {
            team: "INCORP Team",
            target: teamMap["incorp"]?.total_services || 0,
            completed: parseInt(teamMap["incorp"]?.completed_services) || 0,
            efficiency: parseFloat(teamMap["incorp"]?.efficiency) || 0,
          },
          {
            team: "GST Team",
            target: teamMap["gst"]?.total_services || 0,
            completed: parseInt(teamMap["gst"]?.completed_services) || 0,
            efficiency: parseFloat(teamMap["gst"]?.efficiency) || 0,
          },
          {
            team: "ITR Team",
            target: teamMap["itr"]?.total_services || 0,
            completed: parseInt(teamMap["itr"]?.completed_services) || 0,
            efficiency: parseFloat(teamMap["itr"]?.efficiency) || 0,
          },
          {
            team: "MCA Team",
            target: teamMap["mca"]?.total_services || 0,
            completed: parseInt(teamMap["mca"]?.completed_services) || 0,
            efficiency: parseFloat(teamMap["mca"]?.efficiency) || 0,
          },
          {
            team: "IP Team",
            target: teamMap["ip"]?.total_services || 0,
            completed: parseInt(teamMap["ip"]?.completed_services) || 0,
            efficiency: parseFloat(teamMap["ip"]?.efficiency) || 0,
          },
          {
            team: "ISO Team",
            target: teamMap["iso"]?.total_services || 0,
            completed: parseInt(teamMap["iso"]?.completed_services) || 0,
            efficiency: parseFloat(teamMap["iso"]?.efficiency) || 0,
          },
          {
            team: "FSSAI Team",
            target: teamMap["fssai"]?.total_services || 0,
            completed: parseInt(teamMap["fssai"]?.completed_services) || 0,
            efficiency: parseFloat(teamMap["fssai"]?.efficiency) || 0,
          },
        ]);

        // Set revenue data with proper number conversion
        const processedRevenueData = revenue.data.map(item => ({
          ...item,
          revenue: parseFloat(item.revenue) || 0
        }));
        setRevenueData(processedRevenueData);
        
        console.log("Service data:", service.data);
        
        // Create service count mapping
        const serviceCountMap = {};
        service.data.forEach(({ service_type, count }) => {
          serviceCountMap[service_type] = count;
        });

        setServiceData([
          { name: "Incorporation", value: serviceCountMap["incorp"] || 0, color: "#c5a3e1" },
          { name: "GST Fillings", value: serviceCountMap["gst"] || 0, color: "#a874d2" },
          { name: "Trademark/IP", value: serviceCountMap["ip"] || 0, color: "#9556c8" },
          { name: "ITR", value: serviceCountMap["itr"] || 0, color: "#7938ad" },
          { name: "MCA", value: serviceCountMap["mca"] || 0, color: "#652f90" },
          { name: "ISO", value: serviceCountMap["iso"] || 0, color: "#502574" },
          { name: "FSSAI", value: serviceCountMap["fssai"] || 0, color: "#28133a" }
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

  function formatIndianShortNumber(value: number): string {
    const format = (num: number, suffix: string) =>
      `${num.toFixed(2).replace(/\.00$/, "")}${suffix}`;

    if (value >= 10000000) {
      return format(value / 10000000, "Cr");
    } else if (value >= 100000) {
      return format(value / 100000, "L");
    } else if (value >= 1000) {
      return format(value / 1000, "K");
    } else {
      return `${value.toFixed(2).replace(/\.00$/, "")}`;
    }
  }

  const fetchMetrics = async () => {
    if (!startDate || !endDate) return;

    try {
      const res = await axios.get("https://crm-server-three.vercel.app/report_metrics", {
        params: {
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        },
      });
      setMetrics(res.data);
      console.log("Metrics:", res.data);
    } catch (err) {
      console.error("Failed to fetch metrics:", err);
    }
  };

  async function generatePDFReport() {
    setLoadingspinner(true);
    await fetchMetrics();

    // if (!metrics || Object.keys(metrics).length === 0) {
    //   alert("Please fetch the report data first.");
    //   return;
    // }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(33, 37, 41);
    doc.text("Analytics Report", 14, 20);

    if (startDate && endDate) {
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(
        `Reporting Period: ${startDate.toISOString().split("T")[0]} - ${endDate.toISOString().split("T")[0]}`,
        14,
        28
      );
    }

    let y = 36;

    // Lead Metrics Section
    if (metrics.leadMetrics) {
      doc.setFontSize(13);
      doc.setTextColor(40, 40, 100);
      doc.text("Lead Metrics", 14, y);

      autoTable(doc, {
        startY: y + 4,
        styles: { fontSize: 11 },
        headStyles: { fillColor: "#7C4585" },
        columnStyles: { 1: { halign: 'right' } },
        bodyStyles: { textColor: 50 },
        head: [["Metric", "Value"]],
        body: [
          ["Total Leads", metrics.leadMetrics.total_leads || 0],
          ["Requested Services", metrics.leadMetrics.total_requested_services || 0],
          ["Dropped Leads", metrics.leadMetrics.dropped_leads || 0],
          ["Converted Leads", metrics.leadMetrics.converted_leads || 0],
        ],
      });

      y = (doc as any).lastAutoTable.finalY + 10;
    }

    // Billing Metrics Section
    if (metrics.billingMetrics) {
      doc.setFontSize(13);
      doc.setTextColor(40, 40, 100);
      doc.text("Billing Metrics", 14, y);

      autoTable(doc, {
        startY: y + 4,
        styles: { fontSize: 11 },
        headStyles: { fillColor: "#7C4585" },
        columnStyles: { 1: { halign: 'right' } },
        bodyStyles: { textColor: 50 },
        head: [["Metric", "Value"]],
        body: [
          ["Total Invoices", metrics.billingMetrics.total_invoices || 0],
          ["Total Billed", `${Number(metrics.billingMetrics.total_billed || 0)}`],
          ["Total Received", `${Number(metrics.billingMetrics.total_received || 0)}`],
          ["Total Due", `${Number(metrics.billingMetrics.total_due || 0)}`],
        ],
      });

      y = (doc as any).lastAutoTable.finalY + 10;
    }

    // Service Metrics Section
    if (metrics.serviceMetrics) {
      doc.setFontSize(13);
      doc.setTextColor(40, 40, 100);
      doc.text("Service Metrics", 14, y);

      autoTable(doc, {
        startY: y + 4,
        styles: { fontSize: 11 },
        headStyles: { fillColor: "#7C4585" },
        columnStyles: { 1: { halign: 'right' } },
        bodyStyles: { textColor: 50 },
        head: [["Metric", "Value"]],
        body: [
          ["Total Services", metrics.serviceMetrics.total_services || 0],
          ["Completed Services", metrics.serviceMetrics.completed_services || 0],
          ["Average Progress", `${parseFloat(metrics.serviceMetrics.avg_progress || 0).toFixed(2)}%`],
        ],
      });

      y = (doc as any).lastAutoTable.finalY + 10;
    }

    // Customer Acquisition Section
    if (metrics.customerMetrics) {
      doc.setFontSize(13);
      doc.setTextColor(40, 40, 100);
      doc.text("Customer Acquisition", 14, y);

      autoTable(doc, {
        startY: y + 4,
        styles: { fontSize: 11 },
        headStyles: { fillColor: "#7C4585" },
        columnStyles: { 1: { halign: 'right' } },
        bodyStyles: { textColor: 50 },
        head: [["Metric", "Value"]],
        body: [["New Customers", metrics.customerMetrics.total_customers || 0]],
      });
    }

    const today = new Date().toISOString().split("T")[0];
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text("© Wealth Empires", pageWidth - 14, 285, { align: "right" });
    doc.save(`Analytics_Report_${today}.pdf`);
    setShowfetch(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowfetch(true)} className="hover:bg-[#5c2dbf] bg-[#7b49e7]">Fetch Report</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 bg-[#f0eafd] rounded-2xl">
            <div className="flex justify-between">
              <div>
                <p className="text-[#5f4c8e]">Total Revenue</p>
                <p className="text-2xl text-[#5f4c8e]">₹{formatIndianShortNumber(Number(dashData.total_revenue || 0))}</p>
              </div>
              <IndianRupee className="text-[#5f4c8e] w-8 h-8" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 bg-[#f0eafd] rounded-2xl">
            <div className="flex justify-between bg-[#f0eafd]">
              <div>
                <p className="text-[#5f4c8e]">Active Clients</p>
                <p className="text-2xl text-[#5f4c8e]">{dashData.active_clients || 0}</p>
              </div>
              <Users className="text-[#5f4c8e] w-8 h-8" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 bg-[#f0eafd] rounded-2xl">
            <div className="flex justify-between bg-[#f0eafd]">
              <div>
                <p className="text-[#5f4c8e]">Services Completed</p>
                <p className="text-2xl text-[#5f4c8e]">{dashData.services_completed || 0}</p>
              </div>
              <FileText className="text-[#5f4c8e] w-8 h-8" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 bg-[#f0eafd] rounded-2xl">
            <div className="flex justify-between">
              <div>
                <p className="text-[#5f4c8e]">Efficiency Rate</p>
                <p className="text-2xl text-[#5f4c8e]">{dashData.efficiency_rate || 0}%</p>
              </div>
              <TrendingUp className="text-[#5f4c8e] w-8 h-8" />
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
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
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
                  <Cell fill="#c5a3e1" />
                  <Cell fill="#a874d2" />
                  <Cell fill="#9556c8" />
                </Pie>
                <Tooltip />
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
                <Bar dataKey="gst" fill="#532b88" name="GST Filings" />
                <Bar dataKey="itr" fill="#c8b1e4" name="ITR Filings" />
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
                  data={serviceData.filter(item => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {serviceData.filter(item => item.value > 0).map((entry, index) => (
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
              <Bar dataKey="completed" fill="#532b88" name="Completed" />
              <Bar dataKey="target" fill="#c8b1e4" name="Total" />
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
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium">{team.target}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Efficiency:</span>
                  <span className={`font-medium ${team.efficiency >= 80 ? 'text-green-600' : team.efficiency >= 65 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {team.efficiency.toFixed(2)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog for Report Generation */}
      <Dialog open={showFetch} onOpenChange={setShowfetch}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fetch Report</DialogTitle>
            <DialogDescription>Select the date range to fetch the data</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <DatePicker 
              selected={startDate} 
              onChange={setStartDate} 
              placeholderText="Start Date" 
              className="border px-2 py-1 rounded w-full" 
            />
            <DatePicker 
              selected={endDate} 
              onChange={setEndDate} 
              placeholderText="End Date" 
              className="border px-2 py-1 rounded w-full" 
            />
          </div>
          <div className="flex w-full gap-2">
          <Button
  variant="outline"
  onClick={generatePDFReport}
  disabled={!startDate || !endDate || loading}
  className="flex items-center gap-2"
>
  {loading && (
    <svg
      className="animate-spin h-4 w-4 text-gray-600"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
      ></path>
    </svg>
  )}
  {loading ? "Generating..." : "Download Report"}
</Button>
            <Button variant="outline" onClick={() => setShowfetch(false)}>Cancel</Button>  
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};