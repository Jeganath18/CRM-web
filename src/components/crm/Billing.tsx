import InvoicePreview from "@/components/crm/InvoiceGenerator"; 
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
  ReceiptIndianRupee
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

interface clientprops{
  userRole: string | null;
  userName: string | null;
}

export const Billing = ({userName,userRole}:clientprops) => {
  const [services, setServices] = useState({
     initial: [],
        partial: [],
        full: [],
        dues: [],
  });

  const [activeTab, setActiveTab] = useState("unpaid");
  const [selectedService, setSelectedService] = useState(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showdeleteDialog, setShowdeleteDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteid,setdeleteid]=useState(0);
  const [deletekey,setdeletekey]=useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

useEffect(() => {
  const fetchServices = async () => {
    try {
      const res = await axios.get("http://localhost:5000/billing_with_clients");
      const data = res.data;
      console.log(data);

      const grouped: Record<string, any[]> = {
        unpaid: [],
        partial: [],
        paid: [],
        dues: [],
      };

      for (const client of data) {
        console.log(data);
        const entry = {
          id: client.id,
          client: client.company_name,
          owner: client.owner_name,
          email: client.company_email,
          phone: client.phone,
          assignedTo: client.assignedTo,
          address: client.address,
          status: client.status,
          revenue: client.total_amount,
          progress: client.progress, // update if needed
          service_type: client.services,
          amount_paid: client.amount_paid,
          due:client.due_amount,
          due_date:client.due_date,
          client_id:client.client_id,
          gst:client.gstin,

        };

        const statusKey = client.status?.toLowerCase();
        if (grouped[statusKey]) {
          grouped[statusKey].push(entry);
        } else {
          grouped.dues.push(entry);
        }
      }

      setServices(grouped);
    } catch (error) {
      console.error("❌ Failed to fetch client services:", error);
    }
  };

  fetchServices();
}, []);



 
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

  const delete_service = (client_id,service_type)=>{
    setShowdeleteDialog(true);
    setdeleteid(client_id);
    setdeletekey(service_type);
  }

  return (
    <>

     {showInvoice ? (<InvoicePreview {...invoiceData} />) :(
       <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Billing and invoice</h1>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
          <TabsTrigger value="partial">Partially Paid</TabsTrigger>
          <TabsTrigger value="paid">Fully Paid</TabsTrigger>
          <TabsTrigger value="dues">Outstanding Dues</TabsTrigger>
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
                            {service.email}
                          </p>
                             <p className="text-sm text-gray-600">
                            {service.phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge>
                          Due Amount: {service.due}
                        </Badge>
                        <Badge>
                          Total amount: ₹{service.revenue}
                        </Badge>
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

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="flex gap-2">
                          <span className="text-gray-600">Services : </span>
                          <p className="font-medium">
  {Array.isArray(service.service_type)
    ? service.service_type.map(s => s.description).join(", ")
    : "N/A"}
</p>
                        </div>
   

                        <div className="flex gap-2">
                          <span className="text-gray-600">Assigned to:</span>
                          <p className="font-medium">{service.assignedTo}</p>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-gray-600 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Deadline:
                          </span>
                          <p className="font-medium">{service.due_date ? service.due_date.slice(0,10) : null}</p>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2">
                       <Button
  size="sm"
  variant="outline"
  className="text-black hover:text-red-700"
  onClick={() => {
  setInvoiceData({
    clientName: service.client,
    clientAddress: service.address,
    clientEmail: service.email,
    clientGST: service.gst || "N/A",
    services: Array.isArray(service.service_type) ? service.service_type.map(s => s.description).join(", ") : service.service_type,
    amount: parseFloat(service.revenue),
    invoiceId: `2025-${service.id}`,
    issueDate: new Date().toDateString(),
    dueDate: service.due_date ? new Date(service.due_date).toDateString() : new Date().toDateString(),
  });
  setShowInvoice(true);
}}

>
  Generate Invoice
  <ReceiptIndianRupee className="h-4 w-4 ml-2" />
</Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            console.log(service);
                            setSelectedService(service);
                            setShowViewDialog(true);
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
              .patch(`http://localhost:5000/update_payment/${selectedService.client_id}`, {
                total_payment: selectedService.revenue,
                assignedTo: selectedService.amount_paid,
                deadline: selectedService.deadline,
              })
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
            <DialogTitle>Client Details</DialogTitle>
            <DialogDescription>
              <strong>{selectedService?.client}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div className="flex gap-1">
              <label className="block font-medium">Status: </label>
              <p>{selectedService?.status}</p>
            </div>

            <div className="flex gap-1">
              <label className="block font-medium">Progress: </label>
              <p>{selectedService?.progress}%</p>
            </div>

            <div className="flex gap-1">
              <label className="block font-medium">Assigned To:</label>
             <p>{selectedService?.assignedTo}</p>
            </div>

            <div className="flex gap-1">
              <label className="block font-medium">Add amount:</label>
               <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={selectedService?.add_payment || ""}
                onChange={(e) =>
                  setSelectedService((prev) => ({
                    ...prev,
                    add_payment: e.target.value,
                  }))
                }
              />
            </div>

            <div className="flex gap-7">
              <div className="flex gap-2">
                <label className="block font-medium">Amount Paid:</label>
             <p>{selectedService?.amount_paid}</p>
              </div>
              <div className="flex gap-2">
                <label className="block font-medium">Due:</label>
                <p>{selectedService?.due}</p>
              </div>
           

            </div>



            <div>
              <label className="block font-medium">Deadline:</label>
             <input
  type="date"
  className="w-full border rounded px-3 py-2"
  value={
    selectedService && selectedService.due_date
      ? new Date(selectedService.due_date).toISOString().split("T")[0]
      : ""
  }
  onChange={(e) =>
    setSelectedService((prev) => ({
      ...prev,
      due_date: e.target.value,
    }))
  }
/>

  
            </div>

            <Button
              className="w-full mt-4"
              onClick={async () => {
                console.log(selectedService.revenue);
                try {
                  const total_Paid = parseFloat(selectedService.add_payment) + parseFloat(selectedService.amount_paid);


                  await axios.patch(
                    `http://localhost:5000/update_payment/${selectedService.client_id}`,
                    {
                      total_payment: selectedService.revenue,
                      payment: total_Paid ? total_Paid : 0,
                      deadline: selectedService.due_date ? selectedService.due_date.slice(0,10 ) : null,
                    }
                  );


function statustab(paid, total, deadline) {
  const today = new Date();
  const dueDate = new Date(deadline);

  if (paid === 0 && total === 0) return "unpaid";

  if (paid < total && paid > 0 && dueDate > today) return "partial";

  if (Math.abs(paid - total) < 0.01) return "paid";

  return "dues";
}



setServices((prev) => {
  const updated = { ...prev };
  const oldTab = activeTab;
  const total_Paid = parseFloat(selectedService.add_payment) + parseFloat(selectedService.amount_paid);
  const revenue = parseFloat(selectedService.revenue);
  const progress = Math.min(100, parseFloat(((total_Paid / revenue) * 100).toFixed(2)));

  const newStatusKey = statustab(total_Paid, revenue, selectedService.due_date);

  // Remove from old tab
  updated[oldTab] = updated[oldTab].filter((s) => s.id !== selectedService.id);

  const updatedEntry = {
    ...selectedService,
    amount_paid: total_Paid,
    status: newStatusKey,
    progress, // 💡 Update local progress
  };

  // Add to new tab
  if (updated[newStatusKey]) {
    updated[newStatusKey].push(updatedEntry);
    setActiveTab(newStatusKey); // switch tab
  } else {
    updated["dues"].push(updatedEntry);
    setActiveTab("dues");
  }

  return updated;
});



                  setShowViewDialog(false);
                } catch (err) {
                  console.error("❌ Failed to update:", err);
                }
              }}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

  

    </div>

     ) }
   
 </>
  );
};
