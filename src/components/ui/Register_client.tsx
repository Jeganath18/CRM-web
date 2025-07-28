import React, { useState } from "react";
import axios from "axios";

interface RegisterFormProps {
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  onClose?: () => void;
}

export default function RegisterForm({ onSubmit, onClose }: RegisterFormProps) {
  const inputClass =
    "w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  const [status, setStatus] = useState(true);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [gstinFile, setGstinFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [revenue, setrevenue] = useState(0);

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget as typeof e.currentTarget & {
      name: { value: string };
      businessType: { value: string };
      pan: { value: string };
      gstin: { value: string };
      ownerName: { value: string };
      companyEmail: { value: string };
      phone: { value: string };
      address: { value: string };
      revenue: { value: string };
    };

    const formData = new FormData();
    formData.append("company_name", form.name.value);
    formData.append("business_type", form.businessType.value);
    formData.append("pan", form.pan.value);
    formData.append("gstin", form.gstin.value);
    formData.append("owner_name", form.ownerName.value);
    formData.append("company_email", form.companyEmail.value);
    formData.append("phone", form.phone.value);
    formData.append("address", form.address.value);
    formData.append("status", status ? "active" : "inactive");
    formData.append("services", JSON.stringify(selectedServices));
    formData.append("revenue", form.revenue.value);

    if (gstinFile) formData.append("gstin_file", gstinFile);
    if (panFile) formData.append("pan_file", panFile);

    try {
      await axios.post("https://crm-server-three.vercel.app/create_client", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("✅ Client registered successfully!");
      if (onClose) onClose();
    } catch (error) {
      console.error("❌ Error creating client:", error);
      alert("❌ Failed to register client.");
    }
  };

  return (
    <div
      className="relative max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md animate-fade-down animate-scale-in"
      style={{ animationDelay: `${1 * 100}ms` }}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-600 hover:text-black text-2xl font-bold focus:outline-none transition-all duration-200 hover:shadow-[0_4px_20px_rgba(59,130,246,0.4)] active:shadow-inner rounded-full p-1"
      >
        <img
          src="https://img.icons8.com/ios7/512/cancel.png"
          alt="Close"
          style={{ height: 40 }}
          className="pointer-events-none"
        />
      </button>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <h1 className="text-3xl font-bold mb-4 text-gray-900">
          Client Registration
        </h1>

        {/* Company Details */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full">
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Company Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className={inputClass}
              required
            />
          </div>
          <div className="w-full">
            <label
              htmlFor="businessType"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Business Type
            </label>
            <input
              id="businessType"
              name="businessType"
              type="text"
              className={inputClass}
              required
            />
          </div>
        </div>

        {/* PAN & GSTIN */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full">
            <label
              htmlFor="pan"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              PAN
            </label>
            <input id="pan" name="pan" type="text" className={inputClass} />
          </div>
          <div className="w-full">
            <label
              htmlFor="gstin"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              GSTIN
            </label>
            <input id="gstin" name="gstin" type="text" className={inputClass} />
          </div>
        </div>

        {/* Owner & Email */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full">
            <label
              htmlFor="ownerName"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Owner Name
            </label>
            <input
              id="ownerName"
              name="ownerName"
              type="text"
              className={inputClass}
              required
            />
          </div>
          <div className="w-full">
            <label
              htmlFor="companyEmail"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Company Email
            </label>
            <input
              id="companyEmail"
              name="companyEmail"
              type="email"
              className={inputClass}
              required
            />
          </div>
        </div>

        {/* Phone & Address */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full">
            <label
              htmlFor="phone"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className={inputClass}
              required
            />
          </div>
          <div className="w-full">
            <label
              htmlFor="address"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Address
            </label>
            <textarea
              id="address"
              name="address"
              className={inputClass}
              required
            />
          </div>
        </div>

        {/* Status & Services */}
        <div style={{ display: "flex", gap: 100 }}>
          {/* Status */}
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-gray-900">
              Status
            </label>
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
              <span
                className="text-sm font-medium text-gray-900"
                style={{ display: "inline-block", minWidth: "60px" }}
              >
                {status ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {/* Services */}
          <div className="pt-2">
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Services
            </label>
            <div className="flex flex-wrap gap-3">
              {["INCORP", "GST", "ITR", "MCA", "IP"].map((service) => (
                <button
                  key={service}
                  type="button"
                  className={`rounded-md py-2 px-4 text-sm transition-all border border-slate-300 ${
                    selectedServices.includes(service)
                      ? "text-white bg-slate-800"
                      : "text-slate-600 hover:text-white hover:bg-slate-800"
                  }`}
                  onClick={() => toggleService(service)}
                >
                  {service}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/*Total Revenue*/}
        <div className="w-80">
          <label className="block text-sm font-medium">Total Revenue (₹)</label>
          <input
            name="revenue"
            type="number"
            className="w-full border rounded px-3 py-2"
            value={revenue}
            onChange={(e) => setrevenue(Number(e.target.value))}
          />
        </div>

        {/* File Uploads */}
        <div className="flex">
          <div>
            <label className="block mb-1 font-medium text-gray-900">
              UPLOAD GSTIN
            </label>
            {/* {existingImageUrl1 && !GSTIN && (
              <img
                src={existingImageUrl1}
                alt="Client"
                className="mb-2 rounded w-32 h-32 object-cover border"
                onClick={() => setModalImage(existingImageUrl1)}
              />
            )} */}
            {gstinFile && (
              <img
                src={URL.createObjectURL(gstinFile)}
                alt="Preview"
                className="mb-2 rounded w-32 h-32 object-cover border"
                // onClick={() => setModalImage(existingImageUrl1)}
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setGstinFile(file);
              }}
              className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-900">
              UPLOAD PAN
            </label>
            {/* {existingImageUrl2 && !PAN && (
              <img
                src={existingImageUrl2}
                alt="Client"
                className="mb-2 rounded w-32 h-32 object-cover border"
                onClick={() => setModalImage(existingImageUrl2)}
              />
            )} */}
            {panFile && (
              <img
                src={URL.createObjectURL(panFile)}
                alt="Preview"
                className="mb-2 rounded w-32 h-32 object-cover border"
                // onClick={() => setModalImage(existingImageUrl2)}
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setPanFile(file);
              }}
              className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-6">
          <button
            type="submit"
            className="w-150 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
