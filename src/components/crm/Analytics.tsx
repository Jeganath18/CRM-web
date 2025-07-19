import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, DollarSign, Users, FileText,IndianRupee } from "lucide-react";
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
  const [showFetch,setShowfetch]=useState(false);
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
        console.log(teamperformance);
        setTeamPerformanceData([
          { team: "INCORP Team", target: teamperformance.data[4].total_services, completed: teamperformance.data[4].completed_services, efficiency: teamperformance.data[4].efficiency },
          { team: "GST Team", target: teamperformance.data[0].total_services, completed: teamperformance.data[0].completed_services, efficiency: teamperformance.data[0].efficiency },
          { team: "ITR Team", target: teamperformance.data[1].total_services, completed: teamperformance.data[1].completed_services, efficiency: teamperformance.data[1].efficiency },
          { team: "MCA Team", target: teamperformance.data[3].total_services, completed: teamperformance.data[3].completed_services, efficiency: teamperformance.data[3].efficiency },
          { team: "IP Team", target: teamperformance.data[2].total_services, completed: teamperformance.data[2].completed_services, efficiency: teamperformance.data[2].efficiency },
          { team: "ISO Team", target: teamperformance.data[5].total_services, completed: teamperformance.data[5].completed_services, efficiency: teamperformance.data[5].efficiency },
          { team: "FSSAI Team", target: teamperformance.data[6].total_services, completed: teamperformance.data[6].completed_services, efficiency: teamperformance.data[6].efficiency }
        ]);

        setRevenueData(revenue.data);
        setServiceData([
          { name: "Incorporation", value: service.data[0].count, color: "#c5a3e1" },
          { name: "GST Fillings", value: service.data[1].count, color: "#a874d2" },
          { name: "Trademark/IP", value: service.data[2].count, color: "#9556c8" },
          { name: "ITR", value: service.data[3].count, color: "#7938ad" },
          { name: "MCA", value: service.data[4].count, color: "#652f90" },
          { name: "ISO", value: service.data[4].count, color: "#502574" },
          { name: "FSSAI", value: service.data[4].count, color: "#28133a" }
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
      const res = await axios.get("http://localhost:5000/report_metrics", {
        params: {
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        },
      });
      setMetrics(res.data);
      console.log(res.data);
    } catch (err) {
      console.error("Failed to fetch metrics:", err);
    }
  };



  async function generatePDFReport() {
  await fetchMetrics();

  if (!metrics) {
    alert("Please fetch the report data first.");
    return;
  }

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

  // 🟢 Lead Metrics Section
  doc.setFontSize(13);
  doc.setTextColor(40, 40, 100);
  doc.text("Lead Metrics", 14, y);

  autoTable(doc, {
    startY: y + 4,
    styles: { fontSize: 11 },
    headStyles: { fillColor: [41, 128, 185] },
    columnStyles: { 1: { halign: 'right' } },
    bodyStyles: { textColor: 50 },
    head: [["Metric", "Value"]],
    body: [
      ["Total Leads", metrics.leadMetrics.total_leads],
      ["Requested Services", metrics.leadMetrics.total_requested_services],
      ["Dropped Leads", metrics.leadMetrics.dropped_leads],
      ["Converted Leads", metrics.leadMetrics.converted_leads],
    ],
  });

  y = (doc).lastAutoTable.finalY + 10;

  // 💰 Billing Metrics Section
  doc.setFontSize(13);
  doc.setTextColor(40, 40, 100);
  doc.text("Billing Metrics", 14, y);

  autoTable(doc, {
    startY: y + 4,
    styles: { fontSize: 11 },
    headStyles: { fillColor: [46, 204, 113] },
    columnStyles: { 1: { halign: 'right' } },
    bodyStyles: { textColor: 50 },
    head: [["Metric", "Value"]],
    body: [
      ["Total Invoices", metrics.billingMetrics.total_invoices],
      ["Total Billed", `${Number(metrics.billingMetrics.total_billed)}`],
      ["Total Received", `${Number(metrics.billingMetrics.total_received)}`],
      ["Total Due", `${Number(metrics.billingMetrics.total_due)}`],
    ],
  });

  y = (doc).lastAutoTable.finalY + 10;

  // 📊 Service Metrics Section
  doc.setFontSize(13);
  doc.setTextColor(40, 40, 100);
  doc.text("Service Metrics", 14, y);

  autoTable(doc, {
    startY: y + 4,
    styles: { fontSize: 11 },
    headStyles: { fillColor: [241, 196, 15] },
    columnStyles: { 1: { halign: 'right' } },
    bodyStyles: { textColor: 50 },
    head: [["Metric", "Value"]],
    body: [
      ["Total Services", metrics.serviceMetrics.total_services],
      ["Completed Services", metrics.serviceMetrics.completed_services],
      ["Average Progress", `${parseFloat(metrics.serviceMetrics.avg_progress).toFixed(2)}%`],
    ],
  });

  y = (doc).lastAutoTable.finalY + 10;

  // 🧲 Customer Acquisition Section
  doc.setFontSize(13);
  doc.setTextColor(40, 40, 100);
  doc.text("Customer Acquisition", 14, y);

  autoTable(doc, {
    startY: y + 4,
    styles: { fontSize: 11 },
    headStyles: { fillColor: [155, 89, 182] },
    columnStyles: { 1: { halign: 'right' } },
    bodyStyles: { textColor: 50 },
    head: [["Metric", "Value"]],
    body: [["New Customers", metrics.customerMetrics.total_customers]],
  });

  const today = new Date().toISOString().split("T")[0];
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.text("© Wealth Empires", pageWidth - 14, 285, { align: "right" });
  doc.save(`Analytics_Report_${today}.pdf`);
  setShowfetch(false);
}

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
        <div className="flex items-center gap-3">
          <Button onClick={()=>setShowfetch(true)} className="hover:bg-[#5c2dbf] bg-[#7b49e7]">Fetch Report</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 bg-[#f0eafd] rounded-2xl">
            <div className="flex justify-between">
              <div>
                <p className="text-[#5f4c8e]">Total Revenue</p>
                <p className="text-2xl text-[#5f4c8e]">{formatIndianShortNumber(Number(dashData.total_revenue))}</p>
              </div>
              <IndianRupee className="text-[#5f4c8e] w-8 h-8"  />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 bg-[#f0eafd] rounded-2xl">
            <div className="flex justify-between bg-[#f0eafd]">
              <div>
                <p>Active Clients</p>
                <p className="text-2xl text-[#5f4c8e]">{dashData.active_clients}</p>
              </div>
              <Users className="text-[#5f4c8e] w-8 h-8" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 bg-[#f0eafd] rounded-2xl">
            <div className="flex justify-between bg-[#f0eafd]">
              <div>
                <p>Services Completed</p>
                <p className="text-2xl text-[#5f4c8e]">{dashData.services_completed}</p>
              </div>
              <FileText className="text-[#5f4c8e] w-8 h-8" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 bg-[#f0eafd] rounded-2xl">
            <div className="flex justify-between ">
              <div>
                <p>Efficiency Rate</p>
                <p className="text-2xl text-[#5f4c8e]">{dashData.efficiency_rate}%</p>
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
                  <Cell fill="#c5a3e1" />
                  <Cell fill="#a874d2" />
                  <Cell fill="#9556c8" />
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
                    {team.efficiency}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
         <Dialog open={showFetch} onOpenChange={setShowfetch}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fetch Report</DialogTitle>
            <DialogDescription>Select the date for to fetch the data</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
          <DatePicker selected={startDate} onChange={setStartDate} placeholderText="Start Date" className="border px-2 py-1 rounded" />
          <DatePicker selected={endDate} onChange={setEndDate} placeholderText="End Date" className="border px-2 py-1 rounded" />
          </div>
          <div className="flex w-full gap-2">
                <Button variant="outline" onClick={generatePDFReport}>Download Report</Button>
                <Button variant="outline" onClick={()=>setShowfetch(false)}>Cancel</Button>  
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};