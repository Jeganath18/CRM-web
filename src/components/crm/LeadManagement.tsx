import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Phone,
  Mail,
  Calendar,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Search,
  Upload,
  TrendingUp,
  TrendingDown,
  Contact,
  PhoneCall,
  CheckCircle2,
  Ban,
  UserPlus,
  CircleOff,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface LeadFromServer {
  id: number;
  company_name: string;
  owner_name: string;
  email: string;
  phone: string;
  services: string[];
  last_contact: string;
  assigned_to: string | null;
  stage_status: string | null;
}

interface Lead {
  id: number;
  name: string;
  contact: string;
  email: string;
  phone: string;
  services: string[];
  lastContact: string;
  assignedTo: string;
  stage_status: string;
}

interface ExcelLeadRow {
  Company?: string;
  Owner?: string;
  Email?: string;
  Phone?: string;
  Services?: string;
  Value?: string;
  Source?: string;
  LastContact?: string;
  AssignedTo?: string;
}

interface LeadsState {
  new: Lead[];
  contact: Lead[];
  converted: Lead[];
  dropped: Lead[];
}

const stageOrder = ["new", "contact", "converted", "dropped"];

export const LeadManagement = () => {
  const [leads, setLeads] = useState<LeadsState>({
    new: [],
    contact: [],
    converted: [],
    dropped: [],
  });
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteleadId, setDeleteleadId] = useState<number | null>(null);
  const [dropleadId, setDropleadId] = useState<number | null>(null);
  const [showDropModal, setShowDropModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const userName = localStorage.getItem("userName");
  const userRole = localStorage.getItem("userRole");

  const SalesStaffMembers = users
    .flatMap((group) => group.members)
    .filter((member) => member.role === "sales_staff");

  const [formData, setFormData] = useState({
    company: "",
    owner: "",
    email: "",
    phone: "",
    services: [] as string[],
    assignedTo: "",
  });

  const serviceOptions = ["GST", "ITR", "IP", "MCA", "INCORP", "FSSAI", "ISO"];

  const getClients = async () => {
    try {
      const res = await axios.get("http://localhost:5000/get_client_leads");
      console.log(res.data);
      const userRes = await axios.get(
        "http://localhost:5000/users/team-groups"
      );
      const teamGroups = userRes.data;
      setUsers(teamGroups);
      const mappedLeads = res.data.map((lead: LeadFromServer) => ({
        id: lead.id,
        name: lead.company_name,
        contact: lead.owner_name,
        email: lead.email,
        phone: lead.phone,
        services: JSON.parse(lead.services || []),
        value: "",
        source: "Manual",
        lastContact: lead.last_contact,
        assignedTo: lead.assigned_to || "",
        stage_status: lead.stage_status?.toLowerCase() || "new",
      }));

      const grouped: LeadsState = {
        new: [],
        contact: [],
        converted: [],
        dropped: [],
      };
      mappedLeads.forEach((lead: Lead) => {
        const stage = lead.stage_status as keyof LeadsState;
        if (grouped[stage]) {
          grouped[stage].push(lead);
        }
      });
      // 🟢 Prioritize user-assigned leads at top for each stage

      const userRole = localStorage.getItem("userRole");
      if (userRole === "sales_staff") {
        Object.keys(grouped).forEach((stage) => {
          const leadsArray = grouped[stage as keyof LeadsState];
          grouped[stage as keyof LeadsState] = [
            // Assigned to this user
            ...leadsArray.filter((lead) => lead.assignedTo === userName),
            // All other leads
            ...leadsArray.filter((lead) => lead.assignedTo !== userName),
          ];
        });
      }
      setLeads(grouped);
    } catch (err) {
      console.error("Error fetching client leads:", err);
    }
  };

  useEffect(() => {
    getClients();
  }, []);

  const handleServiceToggle = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const handleFormSubmit = async () => {
    const payload = {
      company_name: formData.company,
      owner_name: formData.owner,
      email: formData.email,
      phone: formData.phone,
      services: formData.services,
      last_contact: new Date().toISOString().slice(0, 10),
      assigned_to: formData.assignedTo,
      stage_status: "new",
    };

    try {
      if (editId !== null) {
        await axios.put(`http://localhost:5000/edit_lead/${editId}`, payload);
      } else {
        await axios.post("http://localhost:5000/add-lead", payload);
      }
      setFormData({
        company: "",
        owner: "",
        email: "",
        phone: "",
        services: [],
        assignedTo: "",
      });
      setEditId(null);
      setShowAddModal(false);
      getClients();
    } catch (error) {
      console.error("Error saving lead:", error);
      alert("Failed to save lead. Please try again.");
    }
  };

  const moveToNextStage = async (leadId: number, currentStage: string) => {
    const nextStageIndex = stageOrder.indexOf(currentStage) + 1;

    if (nextStageIndex < stageOrder.length) {
      const nextStage = stageOrder[nextStageIndex];

      try {
        console.log("URL:", `http://localhost:5000/edit_lead/${leadId}`);
        console.log("Payload:", { stage_status: nextStage });
         const formattedDate = new Date().toLocaleDateString("en-CA"); 
        const formattDate = formattedDate.slice(0, 10);
        const res = await axios.patch(
          `http://localhost:5000/edit_lead/${leadId}`,
          { stage_status: nextStage,last_update: formattDate },
        );

        console.log("PATCH completed successfully!");
        console.log("Response:", res.data);
        console.log("Response status:", res.status);

        // Update state locally
        setLeads((prev) => {
          console.log("Inside setLeads");
          console.log("Previous state:", prev);
          console.log("Looking for lead in stage:", currentStage);
          console.log("Lead ID to move:", leadId, typeof leadId);

          const updatedLeads = { ...prev };
          const currentStageKey = currentStage as keyof LeadsState;
          const nextStageKey = nextStage as keyof LeadsState;

          const leadToMove = updatedLeads[currentStageKey]?.find(
            (lead) => lead.id === leadId
          );

          if (!leadToMove) {
            console.warn("Lead not found in:", currentStage);
            console.log("Available leads:", updatedLeads[currentStageKey]);
            return prev;
          }

          console.log("Found lead to move:", leadToMove);
          const updatedLead = { ...leadToMove, stage_status: nextStage,lastContact: formattedDate };

          const newState = {
            ...updatedLeads,
            [currentStageKey]: updatedLeads[currentStageKey].filter(
              (lead) => lead.id !== leadId
            ),
            [nextStageKey]: [
              updatedLead,
              ...(updatedLeads[nextStageKey] || []),
            ],
          };

          console.log("New state:", newState);
          return newState;
        });
      } catch (err) {
        console.error("PATCH failed:", err);
        console.error("Error details:", err.response?.data);
        console.error("Error status:", err.response?.status);
        alert("Failed to move lead to next stage.");
      }
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (showDeleteModal) {
      scrollToTop();
    }
  }, [showDeleteModal]);

  const handleEdit = (lead: Lead) => {
    setFormData({
      company: lead.name,
      owner: lead.contact,
      email: lead.email,
      phone: lead.phone,
      services: lead.services,
      assignedTo: lead.assignedTo || "",
    });
    setEditId(lead.id);
    setShowAddModal(true);
    setDropdownOpen(null);
  };

  const deletelead = async () => {
    if (!deleteleadId) return;
    setDeleting(true);
    try {
      await axios.delete(`http://localhost:5000/delete_lead/${deleteleadId}`);
      setShowDeleteModal(false);
      setDeleteleadId(null);
      setDropdownOpen(null);
      await getClients();
    } catch (error) {
      alert("❌ Failed to delete client.");
    } finally {
      setDeleting(false);
    }
  };

  const droplead = async () => {
    if (!dropleadId) return;
    try {
      await axios.patch(`http://localhost:5000/drop_lead/${dropleadId}`);
      setShowDropModal(false);
      setDropleadId(null);
      setDropdownOpen(null);
      await getClients();
      console.log(dropleadId);
    } catch (error) {
      alert("❌ Failed to delete client.");
    }
  };

  const isFollowUpDue = (lastContact: string) => {
    const lastDate = new Date(lastContact);
    const today = new Date();
    return (today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24) > 3;
  };

  const toggleDropdown = (id: number) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: ExcelLeadRow[] = XLSX.utils.sheet_to_json(worksheet);

      // Optional: show a toast message
      const toastId = toast.loading("Uploading leads...");

      try {
        for (const row of jsonData) {
          const payload = {
            company_name: row.Company || "",
            owner_name: row.Owner || "",
            email: row.Email || "",
            phone: row.Phone || "",
            services: row.Services ? row.Services.split(",") : [],
            last_contact:
              row.LastContact || new Date().toISOString().slice(0, 10),
            assigned_to: row.AssignedTo || "",
            stage_status: "new",
          };

          await axios.post("http://localhost:5000/add-lead", payload);
        }

        toast.success("✅ All leads uploaded successfully!", { id: toastId });
        getClients(); // Refresh list after upload
      } catch (err) {
        toast.error("❌ Failed to upload some leads.", { id: toastId });
        console.error(err);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const filteredLeads = Object.fromEntries(
    Object.entries(leads).map(([stage, list]) => [
      stage,
      list.filter(
        (lead) =>
          lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.phone.includes(searchTerm)
      ),
    ])
  ) as LeadsState;

  const confirmDeleteClient = (id: number) => {
    setDeleteleadId(id);
    setShowDeleteModal(true);
  };

  const confirmDrop = (id: number) => {
    setDropleadId(id);
    setShowDropModal(true);
  };

  const stageStats = {
    new: leads.new.length,
    contact: leads.contact.length,
    converted: leads.converted.length,
    dropped: leads.dropped.length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="relative inline-block text-3xl font-bold text-gray-900 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-1 after:w-full after:bg-[#5c2dbf]">
          Lead Management
        </h1>
        <div className="flex gap-4">
          <Button
            onClick={() => setShowAddModal(true)}
            className="hover:bg-[#5c2dbf] bg-[#7b49e7]"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Lead
          </Button>
          <Button asChild variant="outline">
            <label className="flex items-center gap-1 cursor-pointer">
              <Upload className="h-4 w-4" /> Upload Excel
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleExcelUpload}
                className="hidden"
              />
            </label>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "New Leads",
            count: stageStats.new,
            color: "#7b49e7",
            icon: <UserPlus className="h-8 w-8 text-[#7b49e7]" />,
          },
          {
            label: "Contacted",
            count: stageStats.contact,
            color: "#7b49e7",
            icon: <PhoneCall className="h-8 w-8 text-[#7b49e7]" />,
          },
          {
            label: "Converted",
            count: stageStats.converted,
            color: "#7b49e7",
            icon: <CheckCircle2 className="h-8 w-8 text-[#7b49e7]" />,
          },
          {
            label: "Dropped",
            count: stageStats.dropped,
            color: "#7b49e7",
            icon: <Ban className="h-8 w-8 text-[#7b49e7]" />,
          },
        ].map(({ label, count, color, icon }) => (
          <Card key={label} className="animate-scale-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{label}</p>
                  <p className={`text-2xl font-bold text-${color}-600`}>
                    {count}
                  </p>
                </div>
                {/* 👇 Renders the icon */}
                {icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search Company / Email / Phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editId !== null ? "Edit Lead" : "Add New Lead"}
            </DialogTitle>
            <DialogDescription>
              {editId !== null
                ? "Update the lead information below."
                : "Add a new lead to the system."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Company Name"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
            />
            <Input
              placeholder="Owner Name"
              value={formData.owner}
              onChange={(e) =>
                setFormData({ ...formData, owner: e.target.value })
              }
            />
            <Input
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <Input
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
            <div>
              <label className="block font-medium mb-1">Assigned To:</label>
              <select
                className="w-full border rounded px-3 py-2"
                disabled={localStorage.getItem("userRole") === "sales_staff"}
                value={formData.assignedTo}
                onChange={(e) =>
                  setFormData({ ...formData, assignedTo: e.target.value })
                }
              >
                <option value="">Select a user</option>
                {SalesStaffMembers?.map((member) => (
                  <option key={member.id} value={member.name}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Select Services:
              </p>
              <div className="flex gap-2 flex-wrap">
                {serviceOptions.map((service) => (
                  <Button
                    key={service}
                    type="button"
                    variant={
                      formData.services.includes(service)
                        ? "default"
                        : "outline"
                    }
                    onClick={() => handleServiceToggle(service)}
                    className="text-sm"
                  >
                    {service}
                  </Button>
                ))}
              </div>
            </div>
            <Button
              onClick={handleFormSubmit}
              className="w-full mt-4 hover:bg-[#5c2dbf] bg-[#7b49e7]"
            >
              {editId !== null ? "Update Lead" : "Save Lead"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="new" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {Object.keys(leads).map((stage) => (
            <TabsTrigger key={stage} value={stage}>
              {stage.charAt(0).toUpperCase() + stage.slice(1)} (
              {stageStats[stage as keyof typeof stageStats]})
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(filteredLeads).map(([stage, leadList]) => (
          <TabsContent key={stage} value={stage} className="space-y-4">
            {leadList.map((lead) => (
              <Card
                key={lead.id}
                className="hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {lead.name
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {lead.name}
                        </h3>
                        <p className="text-sm text-gray-600">{lead.contact}</p>
                      </div>
                    </div>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleDropdown(lead.id)}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                      {dropdownOpen === lead.id && (
                        <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-md z-10">
                          <button
                            onClick={() => handleEdit(lead)}
                            className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Edit className="h-4 w-4" /> Edit
                          </button>
                          <button
                            onClick={() => confirmDeleteClient(lead.id)}
                            className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 text-red-600 flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                          <button
                            onClick={() => confirmDrop(lead.id)}
                            className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 text-red-600 flex items-center gap-2"
                          >
                            <CircleOff className="h-4 w-4" /> Drop
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{lead.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{lead.phone}</span>
                    </div>
                  </div>

                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-700">
                      Assigned To:
                    </p>
                    <p className="text-sm text-gray-800">
                      {lead.assignedTo || "Unassigned"}
                    </p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Interested Services:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {lead.services?.map((service: string) => (
                        <Badge
                          key={service}
                          variant="secondary"
                          className="text-xs"
                        >
                          {service}
                        </Badge>
                      )) || null}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Last Contact: {lead.lastContact.slice(0, 10)}</span>
                      {isFollowUpDue(lead.lastContact) &&
                        stage !== "converted" &&
                        stage !== "dropped" && (
                          <Badge className="bg-yellow-100 text-yellow-800 ml-2">
                            Follow-up Due
                          </Badge>
                        )}
                    </div>
                    <div className="flex space-x-2 mt-4 md:mt-0 md:ml-auto">
                      <a href={`mailto:${lead.email}`}>
                        <Button size="sm" variant="outline">
                          <Mail className="h-4 w-4 mr-1" /> Email
                        </Button>
                      </a>
                      {lead.stage_status !== "dropped" &&
                        lead.stage_status !== "converted" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              moveToNextStage(lead.id, lead.stage_status)
                            }
                          >
                            Move to Next Stage
                          </Button>
                        )}
                    </div>
                  </div>
                  {lead.assignedTo === userName &&
                    userRole === "sales_staff" && (
                      <Badge className="ml-2 bg-green-100 text-green-800">
                        Assigned to You
                      </Badge>
                    )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Delete Client Lead
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to delete this client lead? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center gap-4 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              className="w-full"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              onClick={deletelead}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {showDropModal && (
        <div className="fixed inset-0 flex justify-center z-50">
          <div className="h-60 bg-white p-7 rounded-lg shadow-lg w-full max-w-sm text-center border-2 border-red-500">
            <h2 className="text-xl font-semibold text-red-600 mb-4">
              Are you sure you want to drop this client lead?
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDropModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={droplead}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                Drop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
