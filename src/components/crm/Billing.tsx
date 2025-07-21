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
  ReceiptIndianRupee,
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

export const Billing = ({ userName, userRole }: clientprops) => {
  const [services, setServices] = useState({
    unpaid: [],
    partial: [],
    paid: [],
    dues: [],
  });

  const [activeTab, setActiveTab] = useState("unpaid");
  const [selectedService, setSelectedService] = useState(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const storedUserName =
    typeof window !== "undefined" ? localStorage.getItem("userName") : null;

  useState(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/billing_with_clients"
        );
        let data = res.data;
        console.log(data);

        const storedUserName =
          typeof window !== "undefined"
            ? localStorage.getItem("userName")
            : null;

        // 🔒 Filter if role is account_manager
        if (userRole === "account_manager") {
          data = data.filter((client) => client.assignedTo === storedUserName);
          console.log(data);
        }

        const grouped: Record<string, any[]> = {
          unpaid: [],
          partial: [],
          paid: [],
          dues: [],
        };

        for (const client of data) {
          const entry = {
            invoice_number: client.invoice_number,
            client: client.company_name,
            owner: client.owner_name,
            email: client.company_email,
            phone: client.phone,
            assignedTo: client.assignedTo,
            address: client.address,
            status: client.status,
            revenue: client.total_amount,
            progress: client.progress,
            service_type: JSON.parse(client.services),
            amount_paid: client.amount_paid || 0,
            due: client.due_amount,
            due_date: new Date(client.due_date).toISOString().split("T")[0],
            client_id: client.client_id,
            gst: client.gstin,
            payment_method: client.payment_mode || "",
          };

          const statusKey = client.status?.toLowerCase();
          if (grouped[statusKey]) {
            grouped[statusKey].push(entry);
          } else {
            grouped.dues.push(entry);
          }
        }

        setServices(grouped);
        console.log(services);
      } catch (error) {
        console.error("❌ Failed to fetch client services:", error);
      }
    };
    fetchServices();
  }, []);

  const onClose = () => {
    setShowInvoice(false);
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
  const togglePaymentMethod = (method: string) => {
    setPaymentMethod(method);
    setSelectedService((prev) => ({
      ...prev,
      payment_method: method,
    }));
  };

  return (
    <>
      {showInvoice ? (
        <InvoicePreview {...invoiceData} onClose={onClose} />
      ) : (
        <div className="space-y-6 animate-fade-in">
          <h1 className="relative inline-block text-3xl font-bold text-gray-900 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-1 after:w-full after:bg-[#5c2dbf]">
            Billing and Invoice
          </h1>

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

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
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
                            {/* <Badge>Payment mode: {service.payment_mode}</Badge> */}
                            <Badge>
                              Latest Payment mode: {service.payment_method || "N/A"}
                            </Badge>
                            <Badge>Due Amount: {service.due}</Badge>
                            <Badge>Total amount: ₹{service.revenue}</Badge>
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
                            <Progress
                              value={service.progress}
                              className="h-2"
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="flex gap-2">
                              <span className="text-gray-600">Services:</span>
                              <p className="font-medium">
                                {Array.isArray(service.service_type)
                                  ? service.service_type
                                      .map((s) => s.description.toUpperCase())
                                      .join(", ")
                                  : "N/A"}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-gray-600">
                                Assigned to:
                              </span>
                              <p className="font-medium">
                                {service.assignedTo}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-gray-600 flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> Deadline:
                              </span>
                              <p className="font-medium">
                                {service.due_date
                                  ? service.due_date.slice(0, 10)
                                  : null}
                              </p>
                            </div>
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-black hover:text-red-700"
                              onClick={() => {
                                const parsedServices =
                                  typeof service.service_type === "string"
                                    ? JSON.parse(service.service_type)
                                    : service.service_type || [];
                                console.log(service);
                                setInvoiceData({
                                  clientName: service.client,
                                  clientAddress: service.address,
                                  clientEmail: service.email,
                                  clientGST: service.gst || "N/A",
                                  services: parsedServices.map(
                                    (s) => s.description
                                  ),
                                  amount: parsedServices.map(
                                    (s) => s.unit_price
                                  ),
                                  invoiceId: `2025-${service.invoice_number}`,
                                  issueDate: new Date().toDateString(),
                                  dueDate: service.due_date
                                    ? new Date(service.due_date).toDateString()
                                    : null,
                                });
                                setShowInvoice(true);
                              }}
                            >
                              Generate Invoice{" "}
                              <ReceiptIndianRupee className="h-4 w-4 ml-2" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedService({
                                  ...service,
                                  payment_method: service.payment_method || "",
                                });
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

          <Dialog
            open={showViewDialog}
            onOpenChange={(open) => setShowViewDialog(open)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Payment</DialogTitle>
                <DialogDescription>
                  <strong>{selectedService?.client}</strong>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 text-sm">
                <div className="flex gap-1">
                  <label className="block font-medium">Add amount:</label>
                  <input
                    type="number"
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
                  <label className="block mb-4 text-sm font-medium text-gray-700">
                    Select payment method:
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {["NET BANKING", "UPI", "CASH"].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => togglePaymentMethod(method)}
                        className={`px-4 py-2 rounded-md text-sm border transition-colors ${
                          paymentMethod === method
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-medium">Deadline:</label>
                  <input
                    type="date"
                    className="w-full border rounded px-3 py-2"
                    value={
                      selectedService && selectedService.due_date
                        ? new Date(selectedService.due_date)
                            .toISOString()
                            .split("T")[0]
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
                    try {
                      const total_Paid =
                        parseFloat(selectedService.add_payment || 0) +
                        parseFloat(selectedService.amount_paid || 0);

                      const statusKey = (paid, total, deadline) => {
                        const today = new Date();
                        const due = new Date(deadline);
                        if (paid === 0 && total === 0) return "unpaid";
                        if (paid < total && paid > 0 && due > today)
                          return "partial";
                        if (Math.abs(paid - total) < 0.01) return "paid";
                        return "dues";
                      };

                      await axios.patch(
                        `http://localhost:5000/update_payment/${selectedService.client_id}`,
                        {
                          total_payment: selectedService.revenue,
                          payment: total_Paid,
                          deadline: selectedService.due_date,
                          payment_method: selectedService.payment_method,
                        }
                      );

                      const newStatus = statusKey(
                        total_Paid,
                        parseFloat(selectedService.revenue),
                        selectedService.due_date
                      );

                      setServices((prev) => {
                        const updated = { ...prev };
                        updated[activeTab] = updated[activeTab].filter(
                          (s) => s.id !== selectedService.id
                        );
                        const updatedEntry = {
                          ...selectedService,
                          amount_paid: total_Paid,
                          due: parseFloat(
                            (
                              parseFloat(selectedService.revenue) - total_Paid
                            ).toFixed(2)
                          ),
                          status: newStatus,
                          progress: Math.min(
                            100,
                            parseFloat(
                              (
                                (total_Paid /
                                  parseFloat(selectedService.revenue)) *
                                100
                              ).toFixed(2)
                            )
                          ),
                          payment_method: selectedService.payment_method,
                        };

                        if (updated[newStatus]) {
                          updated[newStatus].unshift(updatedEntry);
                          setActiveTab(newStatus);
                        } else {
                          updated["dues"].unshift(updatedEntry);
                          setActiveTab("dues");
                        }

                        return updated;
                      });

                      // ✅ FIX HERE: Update local selectedService UI state
                      setSelectedService((prev) => ({
                        ...prev,
                        amount_paid: total_Paid,
                        due: parseFloat(
                          (
                            parseFloat(selectedService.revenue) - total_Paid
                          ).toFixed(2)
                        ),
                      }));

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
      )}
    </>
  );
};
