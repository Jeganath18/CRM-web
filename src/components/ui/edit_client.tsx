import React, { useEffect, useState } from "react";
import axios from "axios";

interface EditClientProps {
  onClose: () => void;
  clientId: number;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}

interface Client {
  id: number;
  business_type: string;
  company_name: string;
  company_email: string;
  phone?: string;
  status: string;
  services: string[];
  last_contact?: string;
  revenue: number;
  pan?: string;
  gstin?: string;
  owner_name?: string;
  address?: string;
  gstin_file?: string;
  pan_file?: string;
}

interface ClientHistoryEntry {
  client_id: number;
  company_name: string;
  business_type: string;
  last_contact: string;
  created_at: string;
  service_type: string;
  assignedTo: string;
}

interface ClientFile {
  name: string;
  url: string;
  type: string;
}

export default function EditClient({ onClose, clientId }: EditClientProps) {
  const inputClass =
    "w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  const [client, setClient] = useState<Client | null>(null);
  const [status, setStatus] = useState(true);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [GSTIN, setGSTIN] = useState<File | null>(null);
  const [PAN, setPAN] = useState<File | null>(null);
  const [clientFiles, setClientFiles] = useState<ClientFile[]>([]);
  const [existingImageUrl1, setExistingImageUrl1] = useState<string | null>(null);
  const [existingImageUrl2, setExistingImageUrl2] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState("");
  const [history, setHistory] = useState<ClientHistoryEntry[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await axios.get(`https://crm-server-yd9a.onrender.com/client/${clientId}`);
        const history_of_client = await axios.get(
          `https://crm-server-yd9a.onrender.com/get_client_history/${clientId}`
        );
        
        setHistory(history_of_client.data);
        const fetchedClient = res.data;
        setClient(fetchedClient);
        console.log(client);
        setStatus(fetchedClient.status === "active");
        setSelectedServices(fetchedClient.services || []);

        if (fetchedClient.gstin_file) {
          setExistingImageUrl1(`https://crm-server-yd9a.onrender.com/${fetchedClient.gstin_file}`);
        }
        if (fetchedClient.pan_file) {
          setExistingImageUrl2(`https://crm-server-yd9a.onrender.com/${fetchedClient.pan_file}`);
        }

        // Fetch all client files
        if (fetchedClient.company_name) {
          const filesRes = await axios.get(
            `https://crm-server-yd9a.onrender.com/client-files/${fetchedClient.company_name}`
          );
          setClientFiles(filesRes.data.map((file) => ({
            name: file.name,
            url: `https://crm-server-yd9a.onrender.com/${file.url}`,
            type: file.name.split('.').pop()?.toLowerCase() || 'file'
          })));
        }
      } catch (err) {
        console.error("❌ Failed to fetch client:", err);
      }
    };

    fetchClient();
  }, [clientId]);

  const handleChange = (field: keyof Client, value: string) => {
    if (!client) return;
    setClient({ ...client, [field]: value });
  };

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!client) return;

    const formData = new FormData();
    formData.append("company_name", client.company_name);
    formData.append("business_type", client.business_type);
    formData.append("pan", client.pan || "");
    formData.append("gstin", client.gstin || "");
    formData.append("owner_name", client.owner_name || "");
    formData.append("company_email", client.company_email);
    formData.append("phone", client.phone || "");
    formData.append("address", client.address || "");
    formData.append("status", status ? "active" : "inactive");
    formData.append("services", JSON.stringify(selectedServices));
    formData.append("revenue", client.revenue.toString());

    if (GSTIN) formData.append("gstin_file", GSTIN);
    if (PAN) formData.append("pan_file", PAN);
    
    // Append new files
    newFiles.forEach(file => {
      formData.append("files", file);
    });

    try {
      await axios.patch(
        `https://crm-server-yd9a.onrender.com/edit_client/${clientId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      onClose();
    } catch (error) {
      console.error("Failed to update client:", error);
    }
  };

  const getFileIcon = (type: string) => {
    switch(type) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      default:
        return '📁';
    }
  };

  if (!client) {
    return (
      <div className="p-6 text-center text-gray-700">
        Loading client data...
      </div>
    );
  }

  return (
    <div className="relative max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md animate-fade-down">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-600 hover:text-black text-2xl font-bold focus:outline-none transition-all duration-200 hover:shadow-lg active:shadow-inner rounded-full p-1"
      >
        <img
          src="https://img.icons8.com/ios7/512/cancel.png"
          alt="Close"
          style={{ height: 40 }}
        />
      </button>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Edit Client</h1>

        {/* Basic Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label>Company Name*</label>
            <input
              value={client.company_name}
              onChange={(e) => handleChange("company_name", e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label>Business Type*</label>
            <input
              value={client.business_type}
              onChange={(e) => handleChange("business_type", e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label>PAN</label>
            <input
              value={client.pan || ""}
              onChange={(e) => handleChange("pan", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label>GSTIN</label>
            <input
              value={client.gstin || ""}
              onChange={(e) => handleChange("gstin", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label>Owner Name</label>
            <input
              value={client.owner_name || ""}
              onChange={(e) => handleChange("owner_name", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label>Company Email*</label>
            <input
              type="email"
              value={client.company_email}
              onChange={(e) => handleChange("company_email", e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label>Phone</label>
            <input
              value={client.phone || ""}
              onChange={(e) => handleChange("phone", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label>Total Revenue (₹)</label>
            <input
              type="number"
              value={client.revenue ?? 0}
              onChange={(e) => handleChange("revenue", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="w-full">
          <label>Address</label>
          <textarea
            value={client.address || ""}
            onChange={(e) => handleChange("address", e.target.value)}
            className={inputClass}
            rows={3}
          />
        </div>

        {/* Status & Services */}
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={status}
                onChange={() => setStatus((prev) => !prev)}
              />
              <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-checked:bg-blue-600 after:absolute after:top-0.5 after:left-[2px] after:bg-white after:h-5 after:w-5 after:rounded-full after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
            <span className="text-sm font-medium text-gray-900">
              Status: {status ? "Active" : "Inactive"}
            </span>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-900">
              Services
            </label>
            <div className="flex flex-wrap gap-3">
              {["INCORP", "GST", "ITR", "MCA", "IP"].map((service) => (
                <button
                  key={service}
                  type="button"
                  onClick={() => toggleService(service)}
                  className={`rounded-md py-2 px-4 text-sm border transition-all ${
                    selectedServices.includes(service)
                      ? "bg-slate-800 text-white"
                      : "bg-white text-slate-600 border-gray-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {service}
                </button>
              ))}
            </div>
          </div>
         {client.services.includes("INCORP") && (
  <div className="bg-sky-900 p-5 rounded-xl text-white ">  
    <h2>Incorporation Details</h2>
    <ul>
      {client.shareholders.map((s, idx) => (
        <li key={idx}>
          {s.name} - {s.percent}%
        </li>
      ))}
    </ul>
    <p>ROC: {client.roc}</p>
  </div>
)}

        </div>


        {/* Document Upload Section */}
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Client Documents</h3>
          
          {/* GSTIN and PAN Upload */}
        
          {/* All Client Files */}
          <div className="mb-8">
            <h4 className="text-md font-medium mb-3">All Documents</h4>
            {clientFiles.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {clientFiles.map((file, index) => (
                  <div key={index} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                    <div className="flex flex-col items-center">
                      {file.type.match(/(jpg|jpeg|png|gif)$/) ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-32 object-contain mb-2 cursor-pointer"
                          onClick={() => {setModalImage(file.url) 
                            console.log(file.url)
                          console.log(clientFiles)}}
                        />
                      ) : (
                        <div className="w-full h-32 flex items-center justify-center text-4xl bg-gray-100 mb-2">
                          {getFileIcon(file.type)}
                        </div>
                      )}
                      <span className="text-sm font-medium truncate w-full text-center">{file.name}</span>
                      <a
                        href={file.url}
                        download
                        className="text-xs text-blue-600 hover:underline mt-1"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No documents found for this client.</p>
            )}
          </div>

          {/* Upload New Files */}
          <div>
            <h4 className="text-md font-medium mb-3">Upload Additional Documents</h4>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {newFiles.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium">Files to be uploaded:</p>
                <ul className="list-disc pl-5 text-sm text-gray-700">
                  {newFiles.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Client History */}
        {history.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Client History</h3>
            <div className="space-y-3">
              {history.map((entry, idx) => (
                <div
                  key={idx}
                  className="bg-gray-100 rounded-lg p-4 shadow-sm border border-gray-300"
                >
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-gray-900">Service:</span> {entry.service_type}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-gray-900">First Update On:</span> {entry.created_at.slice(0, 10)}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-gray-900">Updated Fields:</span> {entry.last_contact.slice(0, 10)}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-gray-900">Updated By:</span> {entry.assignedTo}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Update Client
          </button>
        </div>
      </form>

      {/* Image Preview Modal */}
      {modalImage && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="relative bg-white p-4 rounded-lg shadow-lg max-w-4xl max-h-[90vh] overflow-auto">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl"
              onClick={() => setModalImage("")}
            >
              ✕
            </button>
            {modalImage.match(/(jpg|jpeg|png|gif)$/i) ? (
              <img
                src={modalImage}
                alt="Document Preview"
                className="max-w-full max-h-[80vh] object-contain"
              />
            ) : (
              <div className="p-8 text-center">
                <div className="text-6xl mb-4">{getFileIcon(modalImage.split('.').pop() || '')}</div>
                <p className="text-lg font-medium">This file type cannot be previewed</p>
                <a
                  href={modalImage}
                  download
                  className="text-blue-600 hover:underline mt-2 inline-block"
                >
                  Download File
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}