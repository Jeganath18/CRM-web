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
  DialogFooter,
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
  CheckCircle2,
  Ban,
  UserPlus,
  PhoneCall,
  CircleOff,
} from "lucide-react";
import { toast } from "react-hot-toast";

// --- INTERFACES ---
interface LeadFromServer {
  id: number;
  company_name: string;
  owner_name: string;
  email: string;
  phone: string;
  services: string; // Comes as a JSON string from the server
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
  LastContact?: string;
  AssignedTo?: string;
}

interface LeadsState {
  new: Lead[];
  contact: Lead[];
  converted: Lead[];
  dropped: Lead[];
}

interface FormErrors {
  phone: string;
  // can add more fields here later
}

// --- COMPONENT ---
export const LeadManagement = () => {
  // --- STATE MANAGEMENT ---
  const [leads, setLeads] = useState<LeadsState>({
    new: [],
    contact: [],
    converted: [],
    dropped: [],
  });
  const [users, setUsers] = useState<any[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDropModal, setShowDropModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteleadId, setDeleteleadId] = useState<number | null>(null);
  const [dropleadId, setDropleadId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [emailError, setEmailError] = useState("");

  const [formData, setFormData] = useState({
    company: "",
    owner: "",
    email: "",
    phone: "",
    services: [] as string[],
    assignedTo: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    phone: "",
  });

  // --- CONSTANTS & DERIVED STATE ---
  const stageOrder = ["new", "contact", "converted", "dropped"];
  const serviceOptions = ["GST", "ITR", "IP", "MCA", "INCORP", "FSSAI", "ISO"];
  const userName = localStorage.getItem("userName");
  const userRole = localStorage.getItem("userRole");

  // --- DATA FETCHING & SIDE EFFECTS ---
  const getClients = async () => {
    try {
      const res = await axios.get("https://crm-server-three.vercel.app/get_client_leads");
      const userRes = await axios.get(
        "https://crm-server-three.vercel.app/users/team-groups"
      );
      setUsers(userRes.data);

      const mappedLeads = res.data.map((lead: LeadFromServer) => ({
        id: lead.id,
        name: lead.company_name,
        contact: lead.owner_name,
        email: lead.email,
        phone: lead.phone,
        // FIX: Safely parse services JSON, defaulting to an empty array
        services: JSON.parse(lead.services || "[]"),
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

      // Prioritize user-assigned leads at top for each stage
      if (userRole === "sales_staff") {
        Object.keys(grouped).forEach((stage) => {
          const leadsArray = grouped[stage as keyof LeadsState];
          grouped[stage as keyof LeadsState] = [
            ...leadsArray.filter((lead) => lead.assignedTo === userName),
            ...leadsArray.filter((lead) => lead.assignedTo !== userName),
          ];
        });
      }
      setLeads(grouped);
    } catch (err) {
      console.error("Error fetching client leads:", err);
      toast.error("Failed to fetch leads.");
    }
  };

  useEffect(() => {
    getClients();
  }, []);

  // --- FORM & MODAL HANDLERS ---

  // FIX: Added a dedicated handler with validation for the phone input
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhone = e.target.value.replace(/\D/g, ""); // Allow only digits
    if (newPhone.length <= 10) {
      setFormData({ ...formData, phone: newPhone });
      if (newPhone.length > 0 && newPhone.length < 10) {
        setErrors((prev) => ({
          ...prev,
          phone: "Phone number must be 10 digits.",
        }));
      } else {
        setErrors((prev) => ({ ...prev, phone: "" })); // Clear error if valid or empty
      }
    }
  };

  const handleServiceToggle = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const resetFormAndCloseModal = () => {
    setFormData({
      company: "",
      owner: "",
      email: "",
      phone: "",
      services: [],
      assignedTo: "",
    });
    setErrors({ phone: "" });
    setEditId(null);
    setShowAddModal(false);
  };

  const handleFormSubmit = async () => {
    // FIX: Added validation check before submitting the form
    if (formData.phone && formData.phone.length !== 10) {
      setErrors((prev) => ({
        ...prev,
        phone: "Please enter a valid 10-digit phone number.",
      }));
      toast.error("Please fix the errors before saving.");
      return;
    }

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

    const toastId = toast.loading(
      editId ? "Updating lead..." : "Adding lead..."
    );
    try {
      if (editId !== null) {
        await axios.put(`https://crm-server-three.vercel.app/edit_lead/${editId}`, payload);
        toast.success("Lead updated successfully!", { id: toastId });
      } else {
        await axios.post("https://crm-server-three.vercel.app/add-lead", payload);
        toast.success("Lead added successfully!", { id: toastId });
      }
      resetFormAndCloseModal();
      getClients();
    } catch (error) {
      toast.error("Failed to save lead. Please try again.", { id: toastId });
      console.error("Error saving lead:", error);
    }
  };

  const handleEdit = (lead: Lead) => {
    setFormData({
      company: lead.name,
      owner: lead.contact,
      email: lead.email,
      phone: lead.phone,
      services: lead.services,
      assignedTo: lead.assignedTo || "",
    });
    setErrors({ phone: "" }); // Clear previous errors
    setEditId(lead.id);
    setShowAddModal(true);
    setDropdownOpen(null);
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

      const toastId = toast.loading("Uploading leads...");
      try {
        for (const row of jsonData) {
          const payload = {
            company_name: row.Company || "",
            owner_name: row.Owner || "",
            email: row.Email || "",
            phone: String(row.Phone || ""), // Ensure phone is a string
            services: row.Services
              ? row.Services.split(",").map((s) => s.trim())
              : [],
            last_contact:
              row.LastContact || new Date().toISOString().slice(0, 10),
            assigned_to: row.AssignedTo || "",
            stage_status: "new",
          };
          await axios.post("https://crm-server-three.vercel.app/add-lead", payload);
        }
        toast.success("All leads uploaded successfully!", { id: toastId });
        getClients();
      } catch (err) {
        toast.error("Failed to upload some leads.", { id: toastId });
        console.error(err);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = ""; // Reset file input
  };

  // --- LEAD ACTION HANDLERS ---
  const moveToNextStage = async (leadId: number, currentStage: string) => {
    const nextStageIndex = stageOrder.indexOf(currentStage) + 1;
    if (nextStageIndex < stageOrder.length) {
      const nextStage = stageOrder[nextStageIndex];
      // FIX: Cleaned up date formatting
      const updatedDate = new Date().toISOString().slice(0, 10);

      try {
        await axios.patch(`https://crm-server-three.vercel.app/edit_lead/${leadId}`, {
          stage_status: nextStage,
          last_update: updatedDate,
        });

        // Update state locally for immediate feedback
        setLeads((prev) => {
          const updatedLeads = { ...prev };
          const currentStageKey = currentStage as keyof LeadsState;
          const nextStageKey = nextStage as keyof LeadsState;
          const leadToMove = updatedLeads[currentStageKey]?.find(
            (lead) => lead.id === leadId
          );

          if (!leadToMove) return prev;

          const updatedLead = {
            ...leadToMove,
            stage_status: nextStage,
            lastContact: updatedDate,
          };
          return {
            ...updatedLeads,
            [currentStageKey]: updatedLeads[currentStageKey].filter(
              (lead) => lead.id !== leadId
            ),
            [nextStageKey]: [
              updatedLead,
              ...(updatedLeads[nextStageKey] || []),
            ],
          };
        });
        toast.success(`Lead moved to ${nextStage}.`);
      } catch (err) {
        console.error("Error moving lead:", err);
        toast.error("Failed to move lead.");
      }
    }
  };

  const deletelead = async () => {
    if (!deleteleadId) return;
    setDeleting(true);
    try {
      await axios.delete(`https://crm-server-three.vercel.app/delete_lead/${deleteleadId}`);
      toast.success("Lead deleted successfully.");
      setShowDeleteModal(false);
      setDeleteleadId(null);
      setDropdownOpen(null);
      getClients();
    } catch (error) {
      toast.error("Failed to delete lead.");
    } finally {
      setDeleting(false);
    }
  };

  function validateEmail(email: string) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

  const droplead = async () => {
    if (!dropleadId) return;
    try {
      await axios.patch(`https://crm-server-three.vercel.app/drop_lead/${dropleadId}`);
      toast.success("Lead dropped successfully.");
      setShowDropModal(false);
      setDropleadId(null);
      setDropdownOpen(null);
      await getClients();
    } catch (error) {
      // FIX: Corrected error message
      toast.error("Failed to drop lead.");
      console.error("Error dropping lead:", error);
    }
  };

  const confirmDeleteClient = (id: number) => {
    setDeleteleadId(id);
    setShowDeleteModal(true);
  };

  const confirmDrop = (id: number) => {
    setDropleadId(id);
    setShowDropModal(true);
  };

  // --- HELPERS & UTILS ---
  const toggleDropdown = (id: number) =>
    setDropdownOpen(dropdownOpen === id ? null : id);
  const isFollowUpDue = (lastContact: string) => {
    const lastDate = new Date(lastContact);
    const today = new Date();
    return (today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24) > 3;
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

  const stageStats = {
    new: leads.new.length,
    contact: leads.contact.length,
    converted: leads.converted.length,
    dropped: leads.dropped.length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="relative inline-block text-3xl font-bold text-gray-900 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-1 after:w-full after:bg-[#5c2dbf]">
          Lead Management
        </h1>
        <div className="flex gap-2 sm:gap-4">
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-[#7b49e7] hover:bg-[#5c2dbf]"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Lead
          </Button>
          <Button asChild variant="outline">
            <label className="flex items-center gap-2 cursor-pointer">
              <Upload className="h-4 w-4" />
              <span>Upload</span>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "New Leads",
            count: stageStats.new,
            color: "#7b49e7",
            icon: <UserPlus className="h-8 w-8 text-[#5f4c8e]" />,
          },
          {
            label: "Contacted",
            count: stageStats.contact,
            color: "#7b49e7",
            icon: <PhoneCall className="h-8 w-8 text-[#5f4c8e]" />,
          },
          {
            label: "Converted",
            count: stageStats.converted,
            color: "#7b49e7",
            icon: <CheckCircle2 className="h-8 w-8 text-[#5f4c8e]" />,
          },
          {
            label: "Dropped",
            count: stageStats.dropped,
            color: "#7b49e7",
            icon: <Ban className="h-8 w-8 text-[#5f4c8e]" />,
          },
        ].map(({ label, count, color, icon }) => (
          <Card key={label} className="animate-scale-in bg-[#f0eafd]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{label}</p>
                  {/* FIX: Used inline style for dynamic color to prevent Tailwind class purging */}
                  <p className="text-3xl font-bold text-[#5f4c8e]">
                    {count}
                  </p>
                </div>
                {icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search by Company, Email, or Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* --- ADD/EDIT MODAL --- */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[500px]">
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
          <div className="grid gap-4 py-4">
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
  type="email"
  placeholder="Email"
  value={formData.email}
  onChange={(e) => {
    const email = e.target.value;
    setFormData({ ...formData, email });

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  }}
/>
{emailError && (
  <p className="text-red-500 text-sm mt-1">{emailError}</p>
)}
            <div>
              <Input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handlePhoneChange}
                maxLength={10}
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
              )}
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
                    className="text-xs h-8"
                  >
                    {service}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetFormAndCloseModal}>
              Cancel
            </Button>
            <Button
              onClick={handleFormSubmit}
              className="bg-[#7b49e7] hover:bg-[#5c2dbf]"
            >
              {editId !== null ? "Update Lead" : "Save Lead"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- LEADS TABS --- */}
      <Tabs defaultValue="new" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          {Object.keys(leads).map((stage) => (
            <TabsTrigger key={stage} value={stage}>
              {stage.charAt(0).toUpperCase() + stage.slice(1)} (
              {stageStats[stage as keyof typeof stageStats]})
            </TabsTrigger>
          ))}
        </TabsList>
        {Object.entries(filteredLeads).map(([stage, leadList]) => (
          <TabsContent key={stage} value={stage} className="mt-4 space-y-4">
            {leadList.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                <p>No leads in this stage.</p>
              </div>
            ) : (
              leadList.map((lead) => (
                <Card
                  key={lead.id}
                  className="hover:shadow-lg transition-all duration-300"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {lead.name
                              ?.split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {lead.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {lead.contact}
                          </p>
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
                          <div className="absolute right-0 mt-2 w-32 bg-white border rounded-md shadow-lg z-10">
                            <button
                              onClick={() => handleEdit(lead)}
                              className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center gap-2"
                            >
                              <Edit className="h-4 w-4" /> Edit
                            </button>
                            <button
                              onClick={() => confirmDrop(lead.id)}
                              className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center gap-2"
                            >
                              <CircleOff className="h-4 w-4" /> Drop
                            </button>
                            <button
                              onClick={() => confirmDeleteClient(lead.id)}
                              className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 text-red-600 flex items-center gap-2"
                            >
                              <Trash2 className="h-4 w-4" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mb-4 text-sm">
                      <div className="flex items-center space-x-2 text-gray-600 truncate">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <a
                          href={`mailto:${lead.email}`}
                          className="truncate hover:underline"
                        >
                          {lead.email}
                        </a>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <a
                          href={`tel:${lead.phone}`}
                          className="hover:underline"
                        >
                          {lead.phone}
                        </a>
                      </div>
                    </div>

                    {lead.services?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Interested Services:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {lead.services.map((service) => (
                            <Badge
                              key={service}
                              variant="secondary"
                              className="text-xs"
                            >
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}



                    <div className="border-t pt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Last Contact:{" "}
                          {new Date(lead.lastContact).toLocaleDateString()}
                        </span>
                        {isFollowUpDue(lead.lastContact) &&
                          stage !== "converted" &&
                          stage !== "dropped" && (
                            <Badge variant="destructive" className="ml-2">
                              Follow-up Due
                            </Badge>
                          )}
                      </div>
                      <div className="flex space-x-2 w-full md:w-auto">
                        <a href={`mailto:${lead.email}`} className="flex-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                          >
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
                              className="flex-1"
                            >
                              Move to Next
                            </Button>
                          )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* --- CONFIRMATION MODALS --- */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Delete Client Lead
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete this lead? This action cannot be
            undone.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deletelead}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FIX: Replaced custom modal with the consistent Dialog component */}
      <Dialog open={showDropModal} onOpenChange={setShowDropModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Drop Client Lead</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure? This will move the lead to the 'Dropped' stage.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDropModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={droplead}>
              Drop Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
