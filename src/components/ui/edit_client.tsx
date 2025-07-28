import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2 } from "lucide-react";

interface EditClientProps {
  onClose: () => void;
  clientId: number;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}

interface Shareholder {
  name: string;
  percent: number;
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
  shareholders?: Shareholder[];
  roc?: string;
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
  const [existingImageUrl1, setExistingImageUrl1] = useState<string | null>(
    null
  );
  const [existingImageUrl2, setExistingImageUrl2] = useState<string | null>(
    null
  );
  const [modalImage, setModalImage] = useState("");
  const [history, setHistory] = useState<ClientHistoryEntry[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [servicePrices, setServicePrices] = useState({});
  const [expiryDates, setExpiryDates] = useState<Record<string, string>>({});
  const isFillingStaff = localStorage.getItem("userRole") === "filling_staff";
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await axios.get(`https://crm-server-three.vercel.app/client/${clientId}`);
        const history_of_client = await axios.get(
          `https://crm-server-three.vercel.app/get_client_history/${clientId}`
        );
        const fetchedClient = res.data;
        console.log("✅ Fetched client:", fetchedClient);

        setClient(fetchedClient);
        setStatus(fetchedClient.status === "active");

        if (fetchedClient.services) {
          let parsedServices = [];
          try {
            parsedServices =
              typeof fetchedClient.services.data === "string"
                ? JSON.parse(fetchedClient.services.data)
                : fetchedClient.services.data;
            setSelectedServices(parsedServices);
          } catch (e) {
            console.error("Error parsing services.data:", e);
          }

          const priceMap = {};
          fetchedClient.services.price_data?.forEach((item) => {
            priceMap[item.service] = item.price;
          });
          setServicePrices(priceMap);
        }

        if (fetchedClient.gstin_file) {
          setExistingImageUrl1(
            `https://crm-server-three.vercel.app/${fetchedClient.gstin_file}`
          );
        }
        if (fetchedClient.pan_file) {
          setExistingImageUrl2(
            `https://crm-server-three.vercel.app/${fetchedClient.pan_file}`
          );
        }

        // === CLOUDINARY FILE FETCHING LOGIC STARTS HERE ===
        // This block triggers fetching the client's documents from your backend.
        if (fetchedClient.company_name) {
          const fetchFiles = async () => {
            try {
              // This endpoint on your server should fetch file URLs from Cloudinary.
              const res = await axios.get(
                `https://crm-server-three.vercel.app/get_client_files/${fetchedClient.company_name}`
              );
              console.log("Fetched Cloudinary Files:", res.data);

              
              setClientFiles(
                res.data.map((file) => ({
                  name: file.name,
                  url: file.url, 
                  type: file.type?.toLowerCase() || "file", 
                }))
              );
            } catch (error) {
              console.error("Error fetching client files from backend:", error);
            }
          };

          fetchFiles();
        }

        setHistory(history_of_client.data);
        const expiryMap = {};
        fetchedClient.services.expiry_data?.forEach((item) => {
          expiryMap[item.service] = item.expiry;
        });
        setExpiryDates(expiryMap);
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

  const handleGSTINUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setGSTIN(e.target.files[0]);
      setExistingImageUrl1(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handlePANUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPAN(e.target.files[0]);
      setExistingImageUrl2(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewFiles(Array.from(e.target.files));
    }
  };

  const total = Object.entries(servicePrices)
    .filter(([service]) => selectedServices.includes(service))
    .reduce((sum, [_, price]) => sum + (parseFloat(price) || 0), 0);

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (!client) return;

  // 1. Set loading to true to show the spinner
  setLoading(true); 

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
  formData.append("revenue", total.toString());
  formData.append("service_prices", JSON.stringify(servicePrices));
  formData.append("expiry_dates", JSON.stringify(expiryDates));

  if (GSTIN) formData.append("gstin_file", GSTIN);
  if (PAN) formData.append("pan_file", PAN);

  newFiles.forEach((file) => {
    formData.append("files", file);
  });

  try {
    await axios.patch(
      `https://crm-server-three.vercel.app/edit_client/${clientId}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    onClose();
  } catch (error) {
    console.error("Failed to update client:", error);
  } finally {
    // 2. Set loading to false after the request is complete
    setLoading(false);
  }
};

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return "📄";
      case "doc":
      case "docx":
        return "📝";
      case "xls":
      case "xlsx":
        return "📊";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "🖼️";
      default:
        return "📁";
    }
  };

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7b49e7] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
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
        {!isFillingStaff ? (
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Edit Client</h1>
        ) : (
          <h1 className="text-3xl font-bold mb-4 text-gray-900">View Client</h1>
        )}

        {/* Basic Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label>Company Name</label>
            <input
              value={client.company_name}
              onChange={(e) => handleChange("company_name", e.target.value)}
              className={inputClass}
              required
              disabled={isFillingStaff}
            />
          </div>
          <div>
            <label>Business Type</label>
            <input
              value={client.business_type}
              onChange={(e) => handleChange("business_type", e.target.value)}
              className={inputClass}
              required
              disabled={isFillingStaff}
            />
          </div>

          <div>
            <label>PAN</label>
            <input
              value={client.pan || ""}
              onChange={(e) => handleChange("pan", e.target.value)}
              className={inputClass}
              disabled={isFillingStaff}
            />
          </div>
          <div>
            <label>GSTIN</label>
            <input
              value={client.gstin || ""}
              onChange={(e) => handleChange("gstin", e.target.value)}
              className={inputClass}
              disabled={isFillingStaff}
            />
          </div>
          <div>
            <label>Owner Name</label>
            <input
              value={client.owner_name || ""}
              onChange={(e) => handleChange("owner_name", e.target.value)}
              className={inputClass}
              disabled={isFillingStaff}
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
              disabled={isFillingStaff}
            />
          </div>
          <div>
            <label>Phone</label>
            <input
              value={client.phone || ""}
              onChange={(e) => handleChange("phone", e.target.value)}
              className={inputClass}
              disabled={isFillingStaff}
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={status}
                onChange={() => setStatus((prev) => !prev)}
                disabled={isFillingStaff}
              />
              <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-checked:bg-blue-600 after:absolute after:top-0.5 after:left-[2px] after:bg-white after:h-5 after:w-5 after:rounded-full after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
            <span className="text-sm font-medium text-gray-900">
              Status: {status ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        <div className="w-full">
          <label>Address</label>
          <textarea
            value={client.address || ""}
            onChange={(e) => handleChange("address", e.target.value)}
            className={inputClass}
            rows={3}
            disabled={isFillingStaff}
          />
        </div>

        {/* Services Section */}
        <div>
          <h3 className="text-lg font-medium mb-3">Services</h3>
          <div className="flex flex-wrap gap-4 mb-6">
            {["INCORP", "GST", "ITR", "MCA", "IP", "ISO", "FSSAI"].map(
              (service) => {
                const lowerService = service.toLowerCase();
                return (
                  <div key={service} className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => toggleService(lowerService)}
                      disabled={isFillingStaff}
                      className={`rounded-md py-2 px-4 text-sm border transition-all ${
                        selectedServices.includes(lowerService)
                          ? "bg-[#7b49e7] text-white"
                          : "bg-white text-slate-600 border-gray-300 hover:bg-[#7b49e7] hover:text-white"
                      }`}
                    >
                      {service}
                    </button>

                    {["ip", "iso", "fssai"].includes(lowerService) &&
                      selectedServices.includes(lowerService) && (
                        <div className="mt-1">
                          <label className="text-xs text-gray-700">
                            Expiry Date
                          </label>
                          <input
                            type="date"
                            className="border rounded px-2 py-1 text-sm"
                            value={expiryDates?.[lowerService] || ""}
                            onChange={(e) =>
                              setExpiryDates((prev) => ({
                                ...prev,
                                [lowerService]: e.target.value,
                              }))
                            }
                            disabled={isFillingStaff}
                          />
                        </div>
                      )}
                  </div>
                );
              }
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Service Prices (₹)</h3>
            <div className="space-y-2">
              {selectedServices.map((service) => (
                <div key={service} className="flex items-center gap-2">
                  <span className="w-20 text-sm font-medium">
                    {service.toUpperCase()}:
                  </span>
                  <input
                    type="number"
                    step="1"
                    value={servicePrices[service] ?? ""}
                    onChange={(e) =>
                      setServicePrices((prev) => ({
                        ...prev,
                        [service]: e.target.value,
                      }))
                    }
                    disabled={isFillingStaff}
                    onBlur={(e) =>
                      setServicePrices((prev) => ({
                        ...prev,
                        [service]: parseFloat(e.target.value || "0").toFixed(
                          2
                        ),
                      }))
                    }
                    placeholder="Price"
                    className="border rounded px-3 py-1 w-40"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Total Revenue (₹)
              </label>
              <input
                type="number"
                value={total}
                readOnly
                className={inputClass}
                disabled={isFillingStaff}
              />
            </div>
          </div>
        </div>

        {/* Shareholders Section */}
        {(() => {
          let shareholders = [];
          try {
            shareholders = JSON.parse(client.shareholders);
          } catch (e) {
            console.error("Invalid JSON in client.shareholders", e);
          }

          return Array.isArray(shareholders) && shareholders.length > 0 ? (
            <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-sky-900 mb-4 border-b pb-2">
                Incorporation Details
              </h2>
              <div className="mb-4">
                <h3 className="text-md font-medium text-gray-700 mb-2">
                  Shareholders
                </h3>
                <ul className="space-y-2">
                  {shareholders.map((s, idx) => (
                    <li
                      key={idx}
                      className="flex justify-between items-center px-4 py-2 bg-[#e6dcf4] rounded-lg text-[#5c2dbf] shadow-sm"
                    >
                      <span className="font-semibold">{s.name}</span>
                      <span className="text-sm font-medium">{s.percent}%</span>
                    </li>
                  ))}
                </ul>
              </div>

              {client.roc && (
                <div className="mt-4">
                  <h3 className="text-md font-medium text-gray-700 mb-1">
                    ROC Number
                  </h3>
                  <p className="text-sm text-gray-800 bg-gray-100 rounded-lg px-3 py-2 inline-block">
                    {client.roc}
                  </p>
                </div>
              )}
            </div>
          ) : null;
        })()}

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Client Documents</h3>

          {/* This part maps over the clientFiles state to display Cloudinary files */}
          <div className="mb-8">
            <h4 className="text-md font-medium mb-3">All Documents</h4>
            {clientFiles.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {clientFiles.map((file, index) => (
  <div
    key={index}
    className="relative border rounded-lg p-3 hover:shadow-md transition-shadow"
  >
    <button
    type="button"
      onClick={async () => {
        try {
          console.log(file.url);
          await axios.post("https://crm-server-three.vercel.app/delete_file_by_url", { file_url: file.url });
          console.log(file.url);
          // Optionally refresh list
          setClientFiles(prev => prev.filter(f => f.url !== file.url));
        } catch (error) {
          console.error("Error deleting file:", error);
        }
      }}
      className="absolute top-2 right-2 p-1 rounded-full bg-red-100 hover:bg-red-200"
    >
      <Trash2 size={16} className="text-red-500" />
    </button>

    <div className="flex flex-col items-center">
      {file.type.match(/(jpg|jpeg|png|gif)$/) ? (
        <img
          src={file.url}
          alt={file.name}
          className="w-full h-32 object-contain mb-2 cursor-pointer"
          onClick={() => setModalImage(file.url)}
        />
      ) : (
        <div className="w-full h-32 flex items-center justify-center text-4xl bg-gray-100 mb-2">
          {getFileIcon(file.type)}
        </div>
      )}
<a
  href={file.url.replace("/upload/", "/upload/fl_attachment:WE-UploadedFile/")}
  className="text-xs text-[#7b49e7] hover:underline mt-1"
>
  Download
</a>



    </div>
  </div>
))}

              </div>
            ) : (
              <p className="text-gray-500">
                No documents found for this client.
              </p>
            )}
          </div>
          {/* Upload New Files */}
          <div>
            <h4 className="text-md font-medium mb-3">
              Upload Additional Documents
            </h4>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              disabled={isFillingStaff}
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
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Client History
            </h3>
            <div className="space-y-4">
              {history.map((entry, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 transition-all hover:shadow-md"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-md font-medium text-blue-600 capitalize">
                      {entry.service_type} Service
                    </h4>
                    <span className="text-xs text-gray-400">
                      Created: {entry.created_at.slice(0, 10)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 grid gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold w-28 text-gray-800">
                        Last update on:
                      </span>
                      <span className="text-gray-600">
                        {entry.last_contact
                          ? entry.last_contact.slice(0, 10)
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold w-28 text-gray-800">
                        Staff By:
                      </span>
                      <span className="text-gray-600">{entry.assignedTo}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
       <div className="pt-6">
  {!isFillingStaff && (
    <button
      type="submit"
      className="w-full flex justify-center items-center gap-2 hover:bg-[#5c2dbf] bg-[#7b49e7] text-white font-semibold py-2 px-6 rounded-lg transition-colors"
      disabled={loading}
    >
      {loading && (
        <svg
          className="animate-spin h-5 w-5 text-white"
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
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {loading ? "Updating..." : "Update Client"}
    </button>
  )}
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
                <div className="text-6xl mb-4">
                  {getFileIcon(modalImage.split(".").pop() || "")}
                </div>
                <p className="text-lg font-medium">
                  This file type cannot be previewed
                </p>
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