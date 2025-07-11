import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface CompanySuggestion {
  name: string;
  cin?: string;
  status?: string;
}

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  category: string;
  description?: string;
  uploadProgress?: number;
}

const OnboardingForm: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  // Form state
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState('');
  const [roc, setRoc] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pan, setPan] = useState('');
  const [gstin, setGstin] = useState('');
  const [status, setStatus] = useState(true);
  const [revenue, setRevenue] = useState(0);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [shareholderCount, setShareholderCount] = useState<number>(0);
  const [shareholders, setShareholders] = useState<
    { name: string; percent: number }[]
  >([]);

  // Company search
  const [companySearch, setCompanySearch] = useState('');
  const [companyROC, setCompanyROC] = useState('');
  const [ROCsuggestions, setROCSuggestions] = useState<CompanySuggestion[]>([]);
  const [suggestions, setSuggestions] = useState<CompanySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showROCSuggestions, setShowROCSuggestions] = useState(false);

  // File uploads
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentFileCategory, setCurrentFileCategory] = useState('');

  // UI state
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(36).substring(2, 9),
        file,
        preview: URL.createObjectURL(file),
        category: currentFileCategory,
        description: '',
        uploadProgress: 0
      }));

      setUploadedFiles(prev => [...prev, ...newFiles]);
      setCurrentFileCategory('');
    }
  };

  // Trigger file input
  const triggerFileInput = (category: string) => {
    setCurrentFileCategory(category);
    fileInputRef.current?.click();
  };

  // Remove file
  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  // Update file description
  const updateFileDescription = (id: string, description: string) => {
    setUploadedFiles(prev =>
      prev.map(file =>
        file.id === id ? { ...file, description } : file
      )
    );
  };

  // Company search
  const handleCompanySearch = async (query: string) => {
    setCompanySearch(query);
    if (query.length > 2) {
      try {
        const mockResponse = [
          { name: `${query} Private Limited` },
          { name: `${query} LLP` },
          { name: `${query} OPC` },
          { name: `${query} NGO` },
        ].filter(company =>
          company.name.toLowerCase().includes(query.toLowerCase())
        );

        setSuggestions(mockResponse);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Search failed:", error);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleROCSearch = async (query: string) => {
    setCompanyROC(query);
    if (query.length > 2) {
      try {
        const mockResponse = [
          { name: "ROC Ahemedabad" },
          { name: "ROC Bangalore" },
          { name: "ROC Bhubaneswar" },
          { name: "ROC Chandigarh" },
          { name: "ROC Chennai" },
          { name: "ROC Delhi" },
          { name: "ROC Erunakulam" },
          { name: "ROC Goa" },
          { name: "ROC Guwahati" },
          { name: "ROC Gwalior" },
          { name: "ROC Hyderabad" },
          { name: "ROC Jammu" },
          { name: "ROC Jaipur" },
          { name: "ROC Kanpur" },
          { name: "ROC Kolkata" },
          { name: "ROC Mumbai" },
          { name: "ROC Patna" },
          { name: "ROC Pune" },
          { name: "ROC Shilong" },
          { name: "ROC Uttarakhand" },
          { name: "ROC Vijayawada" },
        ].filter(company =>
          company.name.toLowerCase().includes(query.toLowerCase())
        );

        setROCSuggestions(mockResponse);
        setShowROCSuggestions(true);
      } catch (error) {
        console.error("Search failed:", error);
      }
    } else {
      setROCSuggestions([]);
      setShowROCSuggestions(false);
    }
  };

  const handleSelectCompany = (company: CompanySuggestion) => {
    setCompanyName(company.name);
    setCompanySearch(company.name);
    setShowSuggestions(false);
  };

  const handleSelectROC = (company: CompanySuggestion) => {
    setRoc(company.name);
    setCompanyROC(company.name);
    setShowROCSuggestions(false);
  };

  const toggleService = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setSubmitError('');
    setSubmitSuccess(false);

    const formData = new FormData();
    formData.append('company_name', companyName);
    formData.append('roc', roc);
    formData.append('business_type', businessType);
    formData.append('owner_name', ownerName);
    formData.append('company_email', email);
    formData.append('phone', phone);
    formData.append('address', address);
    formData.append('pan', pan);
    formData.append('gstin', gstin);
    formData.append('status', status ? 'active' : 'inactive');
    formData.append('revenue', revenue.toString());
    formData.append('services', JSON.stringify(selectedServices));
    formData.append('shareholders', JSON.stringify(shareholders));

    uploadedFiles.forEach((file) => {
      formData.append(`files`, file.file);
      formData.append(`file_categories`, file.category);
      if (file.description) {
        formData.append(`file_descriptions`, file.description);
      }
    });
    

    try {
      const response = await axios.post('https://crm-server-yd9a.onrender.com/add_client', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadProgress(percentCompleted);
        }
      });

      setSubmitSuccess(true);
      setTimeout(() => onClose?.(), 2000);
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError('Failed to submit form. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      uploadedFiles.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, [uploadedFiles]);

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {submitSuccess ? (
            <div className="p-4 mt-4 bg-green-50 text-green-700 rounded-lg">
              ✅ Client registered successfully!
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Client Onboarding - Step {step} of 3
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>

              <form onSubmit={handleSubmit}>
                {/* Step 1: Personal Details */}
                {step === 1 && (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="text-xl font-semibold text-gray-800">Personal Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Owner Name*
                        </label>
                        <input
                          type="text"
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Email*
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Phone Number*
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Address*
                        </label>
                        <textarea
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end pt-4">
                      <button
                        type="button"
                        onClick={nextStep}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        disabled={!ownerName || !email || !phone || !address}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Services */}
                {step === 2 && (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="text-xl font-semibold text-gray-800">Services Required</h3>
                    
                    <div>
                      <label className="block mb-4 text-sm font-medium text-gray-700">
                        Select services needed:
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {['INCORP', 'GST', 'ITR', 'MCA', 'IP'].map((service) => (
                          <button
                            key={service}
                            type="button"
                            onClick={() => toggleService(service)}
                            className={`px-4 py-2 rounded-md text-sm border transition-colors ${
                              selectedServices.includes(service)
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {service}
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedServices.includes('INCORP') && (
                      <div className="mt-6 space-y-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Company Name Search
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={companySearch}
                            onChange={(e) => handleCompanySearch(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Search company name..."
                          />
                          {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                              {suggestions.map((company, index) => (
                                <div
                                  key={index}
                                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                  onClick={() => handleSelectCompany(company)}
                                >
                                  <div className="font-medium">{company.name}</div>
                                  {company.cin && (
                                    <div className="text-sm text-gray-500">CIN: {company.cin}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="relative">
                          <input
                            type="text"
                            value={companyROC}
                            onChange={(e) => handleROCSearch(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Search ROC (ex: ROC Chennai)"
                          />
                          {showROCSuggestions && ROCsuggestions.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                              {ROCsuggestions.map((company, index) => (
                                <div
                                  key={index}
                                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                  onClick={() => handleSelectROC(company)}
                                >
                                  <div className="font-medium">{company.name}</div>
                                  {company.cin && (
                                    <div className="text-sm text-gray-500">CIN: {company.cin}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between pt-6">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={nextStep}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        disabled={selectedServices.length === 0}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Company Details */}
                {step === 3 && (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="text-xl font-semibold text-gray-800">Company Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Company Name*
                        </label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          ROC
                        </label>
                        <input
                          type="text"
                          value={roc}
                          onChange={(e) => setRoc(e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Business Type*
                        </label>
                        <input
                          type="text"
                          value={businessType}
                          onChange={(e) => setBusinessType(e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          PAN Number
                        </label>
                        <input
                          type="text"
                          value={pan}
                          onChange={(e) => setPan(e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          GSTIN
                        </label>
                        <input
                          type="text"
                          value={gstin}
                          onChange={(e) => setGstin(e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Number of Shareholders
                      </label>
                      <select
                        className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={shareholderCount}
                        onChange={(e) => {
                          const count = Number(e.target.value);
                          setShareholderCount(count);
                          setShareholders(Array(count).fill(null).map(() => ({ name: '', percent: 0 })));
                        }}
                      >
                        <option value={0}>Select count</option>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {shareholders.map((sh, index) => (
                      <div key={index} className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Shareholder Name {index + 1}
                          </label>
                          <input
                            type="text"
                            value={sh.name}
                            onChange={(e) => {
                              const newShareholders = [...shareholders];
                              newShareholders[index].name = e.target.value;
                              setShareholders(newShareholders);
                            }}
                            className="w-full px-3 py-2 border rounded"
                            placeholder="Enter name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Share %</label>
                          <input
                            type="number"
                            value={sh.percent}
                            onChange={(e) => {
                              const newShareholders = [...shareholders];
                              newShareholders[index].percent = Number(e.target.value);
                              setShareholders(newShareholders);
                            }}
                            className="w-full px-3 py-2 border rounded"
                            placeholder="Enter %"
                          />
                        </div>
                      </div>
                    ))}

                    {/* Document Upload Section */}
                    <div className="pt-4">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Document Uploads</h3>
                      
                      {/* Hidden file input */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        multiple
                      />
                      
                      {/* Document type buttons */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                        {(selectedServices.includes('INCORP')
                          ? ['PAN Card', 'Aadhaar', 'Identity Proof', 'Address Proof', 'Photo']
                          : ['GST Certificate', 'PAN Card', 'Aadhaar', 'MOA', 'AOA', 'Bank Statement']
                        ).map((docType) => (
                          <button
                            key={docType}
                            type="button"
                            onClick={() => triggerFileInput(docType)}
                            className="flex items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
                          >
                            <span className="text-sm">+ {docType}</span>
                          </button>
                        ))}
                        
                        {!selectedServices.includes('INCORP') && (
                          <button
                            type="button"
                            onClick={() => {
                              const customType = prompt("Enter document type:");
                              if (customType) triggerFileInput(customType);
                            }}
                            className="flex items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
                          >
                            <span className="text-sm">+ Other Document</span>
                          </button>
                        )}
                      </div>
                      
                      {/* Uploaded files list */}
                      {uploadedFiles.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-700">Uploaded Documents</h4>
                          <div className="space-y-2">
                            {uploadedFiles.map((file) => (
                              <div key={file.id} className="flex items-start p-3 border rounded-lg bg-gray-50">
                                <div className="flex-shrink-0 mr-3">
                                  {file.file.type.startsWith('image/') ? (
                                    <img 
                                      src={file.preview} 
                                      alt="Preview" 
                                      className="h-12 w-12 object-cover rounded border"
                                    />
                                  ) : (
                                    <div className="h-12 w-12 flex items-center justify-center bg-white rounded border">
                                      <span className="text-xs font-medium uppercase">
                                        {file.file.name.split('.').pop()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-grow">
                                  <div className="font-medium text-sm truncate">{file.file.name}</div>
                                  <div className="text-xs text-gray-500 mb-1">{file.category}</div>
                                  <input
                                    type="text"
                                    placeholder="Add description (optional)"
                                    value={file.description || ''}
                                    onChange={(e) => updateFileDescription(file.id, e.target.value)}
                                    className="w-full px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFile(file.id)}
                                  className="ml-2 text-red-500 hover:text-red-700 p-1"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Progress and status */}
                    {isUploading && (
                      <div className="pt-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-blue-700">
                            Uploading files...
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            {uploadProgress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {submitError && (
                      <div className="p-4 mt-4 bg-red-50 text-red-700 rounded-lg">
                        ❌ {submitError}
                      </div>
                    )}

                    <div className="flex justify-between pt-6">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        disabled={isUploading || !companyName || !businessType}
                      >
                        {isUploading ? 'Submitting...' : 'Submit'}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingForm;