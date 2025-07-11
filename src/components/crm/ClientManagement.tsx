import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Edit, Trash2, Search, Plus } from "lucide-react";
import RegisterForm from "../ui/Register_client";
import EditClient from "../ui/edit_client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Client {
  id: number;
  business_type: string;
  company_name: string;
  company_email: string;
  phone?: string;
  status: string;
  services: string[];
  last_contact: string;
  revenue: string;
}

interface clientprops{
  userRole: string | null;
  userName: string | null;
}

export const ClientManagement = ({userName,userRole}:clientprops) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [deleteClientId, setDeleteClientId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getClients = async () => {
    try {
      setLoading(true);
      setError(null);
const res = userRole === "account_manager"
  ? await axios.get(`https://crm-server-yd9a.onrender.com/clients/${userName}`) 
  : await axios.get("https://crm-server-yd9a.onrender.com/clients");
      
      // Handle services parsing - they might be stored as JSON strings
      const processedClients = res.data.map((client) => ({
        ...client,
        services: typeof client.services === 'string' 
          ? JSON.parse(client.services) 
          : client.services || []
      }));
      
      setClients(processedClients);
    } catch (err) {
      console.error("Error fetching clients:", err);
      setError("Failed to fetch clients. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getClients();
  }, []);

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.business_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.phone && client.phone.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter =
      selectedFilter === "all" || client.status === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  const confirmDeleteClient = (id: number) => {
    setDeleteClientId(id);
    setShowDeleteModal(true);
  };

  const deleteClient = async () => {
    if (!deleteClientId) return;
    setDeleting(true);
    try {
      await axios.delete(`https://crm-server-yd9a.onrender.com/delete_client/${deleteClientId}`);
      setClients((prev) => prev.filter((client) => client.id !== deleteClientId));
      setShowDeleteModal(false);
      setDeleteClientId(null);
    } catch (error) {
      console.error("Delete error:", error);
      alert("❌ Failed to delete client.");
    } finally {
      setDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    if (!deleting) {
      setShowDeleteModal(false);
      setDeleteClientId(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg">Loading clients...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-red-600">{error}</div>
        <Button onClick={getClients} className="ml-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-4">
      {showForm ? (
        <RegisterForm
          onClose={() => {
            setShowForm(false);
            getClients();
          }}
          onSubmit={(e) => {
            e.preventDefault();
            alert("Form submitted!");
            setShowForm(false);
          }}
        />
      ) : showEdit && currentClient ? (
        <EditClient
          clientId={currentClient.id}
          onClose={() => {
            setShowEdit(false);
            setCurrentClient(null);
            getClients();
          }}
          onSubmit={(e) => {
            e.preventDefault();
            alert("Client updated!");
            setShowEdit(false);
            setCurrentClient(null);
          }}
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search Clients Company Name / Business Type / Email / Contact Number"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  {["all", "active", "inactive"].map((filter) => (
                    <Button
                      key={filter}
                      variant={selectedFilter === filter ? "default" : "outline"}
                      onClick={() => setSelectedFilter(filter)}
                      size="sm"
                    >
                      {filter[0].toUpperCase() + filter.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">No clients found</div>
              <div className="text-gray-400 text-sm">
                {searchTerm || selectedFilter !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "Add your first client to get started"}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClients.map((client, index) => (
                <Card
                  key={client.id}
                  className="hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {client.company_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            {client.company_name}
                          </CardTitle>
                          <Badge className={getStatusColor(client.status)}>
                            {client.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">{client.company_email}</p>
                        <p className="text-sm text-gray-600">{client.phone || "N/A"}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Services:</p>
                        <div className="flex flex-wrap gap-1">
                          {client.services && client.services.length > 0 ? (
                            client.services.map((service, serviceIndex) => (
                              <Badge
                                key={`${service}-${serviceIndex}`}
                                variant="secondary"
                                className="text-xs"
                              >
                                {service}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">No services</span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-1 text-sm">
                        <span className="text-gray-600">Industry:</span>
                        <span className="font-medium">{client.business_type}</span>
                      </div>
                      
                      <div className="flex justify-between pt-3 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCurrentClient(client);
                            setShowEdit(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => confirmDeleteClient(client.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
  <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
  <DialogContent>
              <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
             This action cannot be undone!
            </DialogDescription>
          </DialogHeader>
              <Button
                variant="destructive"
                onClick={deleteClient}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>


  </DialogContent>
</Dialog>
    </div>
  );

};

