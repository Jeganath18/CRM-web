import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import axios from "axios";
import { Input } from "@/components/ui/input";

interface clientprops {
  userRole: string | null;
  userName: string | null;
}

export const ServiceTracking = ({ userName, userRole }: clientprops) => {
  const [services, setServices] = useState({
    incorp: [],
    gst: [],
    itr: [],
    mca: [],
    ip: [],
    iso: [],
    fssai: [],
  });

  const [activeTab, setActiveTab] = useState("incorp");
  const [selectedService, setSelectedService] = useState(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showdeleteDialog, setShowdeleteDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteid, setdeleteid] = useState(0);
  const [deletekey, setdeletekey] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const isFillingStaff = localStorage.getItem("userRole") === "filling_staff";
  const username=localStorage.getItem("userName");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res =
          userRole === "account_manager"
            ? await axios.get(
                `http://localhost:5000/get_all_services/${username}`
              )
            : await axios.get("http://localhost:5000/get_all_services");

        let rows = res.data;
        console.log(rows);

        const userRes = await axios.get(
          "http://localhost:5000/users/team-groups"
        );
        const teamGroups = userRes.data; // ✅ Array of grouped users
        setUsers(teamGroups);
        console.log("✅ Team Groups:", teamGroups);

        console.log("🧑‍💼 Filling Staff:", fillingStaffMembers);

        // ✅ Restrict view if role is filling_staff
        if (userRole === "filling_staff" && userName) {
          rows = rows.filter((row) => row.assignedTo === userName);
        }

        const grouped = {
          incorp: [],
          gst: [],
          itr: [],
          mca: [],
          ip: [],
          iso: [],
          fssai: [],
        };

        for (const row of rows) {
          const entry = {
            id: row.service_id,
            client: row.client,
            period: row.period,
            status: row.status,
            progress: row.progress,
            assignedTo: row.assignedAccountManager,
            deadline: row.deadline
              ? new Date(row.deadline).toISOString().slice(0, 10)
              : "",
            priority: row.priority,
          };

          if (grouped[row.service_type]) {
            grouped[row.service_type].unshift(entry);
          } else {
            grouped[row.service_type] = [entry];
          }
        }

        setServices(grouped);
      } catch (error) {
        console.error("❌ Failed to fetch services:", error);
      }
    };

    fetchServices();
  }, []);

  const fillingStaffMembers = users
    .flatMap((group) => group.members)
    .filter((member) => member.role === "filling_staff");

  const getStatusColor = (status) => {
    switch (status) {
      case "approval":
        return "bg-green-100 text-green-800";
      case "filling":
        return "bg-blue-100 text-blue-800";
      case "documentation":
        return "bg-yellow-100 text-yellow-800";
      case "started":
        return "bg-gray-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approval":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "filling":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "documentation":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "started":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredServices = (serviceList) => {
    if (!searchTerm.trim()) return serviceList;
    const lower = searchTerm.toLowerCase();
    return serviceList.filter(
      (s) =>
        s.client?.toLowerCase().includes(lower) ||
        s.assignedTo?.toLowerCase().includes(lower) ||
        s.status?.toLowerCase().includes(lower)
    );
  };

  const delete_service = (client_id, service_type) => {
    setShowdeleteDialog(true);
    setdeleteid(client_id);
    setdeletekey(service_type);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="relative inline-block text-3xl font-bold text-gray-900 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-1 after:w-full after:bg-[#5c2dbf]">
          Service Tracking
        </h1>
      </div>

      {isFillingStaff && (
  <Card className="mt-4">
    <CardContent className="p-6">
      <h2 className="text-lg font-semibold mb-4">Your Service Summary</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(services).map(([type, list]) => {
          const userTasks = list.filter(
            (item) => item.assignedTo === userName
          );
          return (
            <div
              key={type}
              className="p-4 rounded-lg border shadow-sm bg-gray-50"
            >
              <p className="text-sm text-gray-600 capitalize">{type.toLocaleUpperCase()}</p>
              <p className="text-xl font-bold text-[#5c2dbf]">
                {userTasks.length}
              </p>
            </div>
          );
        })}
        <div className="p-4 rounded-lg border shadow-sm bg-gray-50 col-span-2 sm:col-span-1">
          <p className="text-sm text-gray-600">Total Assigned</p>
          <p className="text-xl font-bold text-green-600">
            {Object.values(services)
              .flat()
              .filter((item) => item.assignedTo === userName).length}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
)}


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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="incorp">Incorporation</TabsTrigger>
          <TabsTrigger value="gst">GST Filing</TabsTrigger>
          <TabsTrigger value="itr">ITR Processing</TabsTrigger>
          <TabsTrigger value="mca">MCA Compliance</TabsTrigger>
          <TabsTrigger value="ip">IP Services</TabsTrigger>
          <TabsTrigger value="iso">ISO</TabsTrigger>
          <TabsTrigger value="fssai">FSSAI</TabsTrigger>
        </TabsList>

        {Object.entries(services).map(([key, serviceList]) => (
          <TabsContent key={key} value={key} className="space-y-4">
            <div className="grid gap-4">
              {filteredServices(serviceList).map((service, index) => (
                <Card
                  key={service.id}
                  className="hover:shadow-lg transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(service.status)}
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {service.client}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {service.period}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(service.status)}>
                          {service.status}
                        </Badge>
                        {service.progress < 100 && (
                          <Badge className={getPriorityColor(service.priority)}>
                            {service.priority}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">
                            {service.progress}%
                          </span>
                        </div>
                        <Progress value={service.progress} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Assigned to:</span>
                          <p className="font-medium">{service.assignedTo}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Deadline:
                          </span>
                          <p className="font-medium">{service.deadline}</p>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => delete_service(service.id, key)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedService(service);
                            setShowViewDialog(true);
                          }}
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedService(service);
                            setShowUpdateDialog(true);
                          }}
                        >
                          Update Status
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* View Dialog */}
      <Dialog
        open={showViewDialog}
        onOpenChange={(open) => {
          setShowViewDialog(open);
          if (!open && selectedService) {
            axios
              .patch(
                `http://localhost:5000/update_service/${selectedService.id}`,
                {
                  assignedTo: selectedService.assignedTo,
                  deadline: selectedService.deadline,
                }
              )
              .then(() => {
                console.log("✅ Service updated successfully");
              })
              .catch((error) => {
                console.error("❌ Failed to update service:", error);
              });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Service Details</DialogTitle>
            <DialogDescription>
              Details for <strong>{selectedService?.client}</strong>
            </DialogDescription>
          </DialogHeader>
          {isFillingStaff && (
  <Card className="mt-4">
    <CardContent className="p-6">
      <h2 className="text-lg font-semibold mb-4">Your Service Summary</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(services).map(([type, list]) => {
          const userTasks = list.filter(
            (item) => item.assignedTo === userName
          );
          return (
            <div
              key={type}
              className="p-4 rounded-lg border shadow-sm bg-gray-50"
            >
              <p className="text-sm text-gray-600 capitalize">{type}</p>
              <p className="text-xl font-bold text-[#5c2dbf]">
                {userTasks.length}
              </p>
            </div>
          );
        })}
        <div className="p-4 rounded-lg border shadow-sm bg-gray-50 col-span-2 sm:col-span-1">
          <p className="text-sm text-gray-600">Total Assigned</p>
          <p className="text-xl font-bold text-green-600">
            {Object.values(services)
              .flat()
              .filter((item) => item.assignedTo === userName).length}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
)}


          <div className="space-y-4 text-sm">
            <div>
              <label className="block font-medium">Status:</label>
              <p>{selectedService?.status}</p>
            </div>

            <div>
              <label className="block font-medium">Progress:</label>
              <p>{selectedService?.progress}%</p>
            </div>

            <div>
              <label className="block font-medium mb-1">Assigned To:</label>
              <select
                className="w-full border rounded px-3 py-2"
                disabled={isFillingStaff}
                value={selectedService?.assignedTo || ""}
                onChange={(e) =>
                  setSelectedService((prev) => ({
                    ...prev,
                    assignedTo: e.target.value,
                  }))
                }
              >
                <option value="">Select a user</option>
                {fillingStaffMembers?.map((member) => (
                  <option key={member.id} value={member.name}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium">Deadline:</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                disabled={isFillingStaff}
                value={
                  selectedService?.deadline
                    ? new Date(selectedService.deadline)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setSelectedService((prev) => ({
                    ...prev,
                    deadline: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block font-medium">Priority:</label>
              <p>{selectedService?.priority}</p>
            </div>

            {!isFillingStaff && <Button
              className="w-full mt-4"
              onClick={async () => {
                try {
                  const deadlineDate = new Date(selectedService.deadline);
                  const today = new Date();
                  const timeDiff = deadlineDate - today;
                  const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

                  let priority = "low";
                  if (daysLeft < 5) priority = "high";
                  else if (daysLeft < 15) priority = "medium";

                  await axios.patch(
                    `http://localhost:5000/update_service/${selectedService.id}`,
                    {
                      assignedTo: selectedService.assignedTo,
                      deadline: selectedService.deadline,
                    }
                  );

                  setServices((prev) => {
                    const updated = { ...prev };
                    updated[activeTab] = updated[activeTab].map((s) =>
                      s.id === selectedService.id
                        ? { ...s, ...selectedService, priority }
                        : s
                    );
                    return updated;
                  });

                  setShowViewDialog(false);
                } catch (err) {
                  console.error("❌ Failed to update:", err);
                }
              }}
            >
              Save
            </Button>}
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Service Status</DialogTitle>
            <DialogDescription>
              Update status for <strong>{selectedService?.client}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <label className="block text-sm font-medium">Change Status</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={selectedService?.status || ""}
              onChange={(e) => {
                const newStatus = e.target.value;
                console.log(selectedService);
                const ipProgressMap = {
                  Filed: 15,
                  Inprocess: 33,
                  Objected: 67,
                  Registered: 100,
                };

                const defaultProgressMap = {
                  started: 10,
                  documentation: 33,
                  filling: 67,
                  approval: 100,
                };

                const progressMap =
                  activeTab === "ip" ? ipProgressMap : defaultProgressMap;

                setSelectedService((prev) => ({
                  ...prev,
                  status: newStatus,
                  progress: progressMap[newStatus] || 0,
                }));
              }}
            >
              {activeTab === "ip" ? (
                <>
                  <option value="Filed">Filed</option>
                  <option value="Inprocess">In process</option>
                  <option value="Objected">Objected</option>
                  <option value="Registered">Registered</option>
                </>
              ) : (
                <>
                  <option value="started">Started</option>
                  <option value="documentation">Documentation</option>
                  <option value="filling">Filling</option>
                  <option value="approval">Approval</option>
                </>
              )}
            </select>

            <Button
              className="w-full mt-2"
              onClick={async () => {
                const progressMap = {
                  started: 10,
                  documentation: 33,
                  filling: 67,
                  approval: 100,
                };
                try {
                  await axios.patch(
                    `http://localhost:5000/update_status/${selectedService.id}`,
                    {
                      id: selectedService.id,
                      status: selectedService.status,
                      progress: progressMap[selectedService.status],
                      service_type: activeTab,
                    }
                  );
                  setServices((prev) => {
                    const updated = { ...prev };
                    updated[activeTab] = updated[activeTab].filter(
                      (s) => s.id !== selectedService.id
                    );
                    updated[activeTab].unshift(selectedService);
                    return updated;
                  });
                  console.log(selectedService.id);
                  setShowUpdateDialog(false);
                } catch (err) {
                  console.log("Error Updating status", err);
                }
              }}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showdeleteDialog} onOpenChange={setShowdeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>This action cannot be undone!</DialogDescription>
          </DialogHeader>

          <Button
            className="w-full mt-2"
            onClick={async () => {
              try {
                await axios.delete("http://localhost:5000/delete_service", {
                  data: {
                    client_id: deleteid,
                    section: deletekey,
                  },
                });

                setServices((prev) => {
                  const updated = { ...prev };
                  updated[deletekey] = updated[deletekey].filter(
                    (service) => service.id !== deleteid // ✅ Use `id`, not `client_id`
                  );
                  return updated;
                });

                setShowdeleteDialog(false);
                setdeleteid(0);
                setdeletekey("");
              } catch (err) {
                console.log("Error deleting service", err);
              }
            }}
          >
            Delete Service
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};
