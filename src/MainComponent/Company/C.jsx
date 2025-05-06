import React, { useState, useEffect } from "react";
import axios from "axios";

const baseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/companies";

export default function CompanyLogoManager() {
  const [companies, setCompanies] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploading, setUploading] = useState({});

  // Fetch the list of companies
  const fetchCompanies = async () => {
    try {
      const { data } = await axios.get(baseUrl);
      setCompanies(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load companies");
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Handle file input change for a specific company
  const handleFileChange = (companyId, e) => {
    const file = e.target.files[0];
    setSelectedFiles((prev) => ({ ...prev, [companyId]: file }));
    setUploadProgress((prev) => ({ ...prev, [companyId]: 0 }));
  };

  // Upload logo for a specific company
  const handleUpload = async (companyId) => {
    const file = selectedFiles[companyId];
    if (!file) {
      return alert("Please select an image first.");
    }

    const formData = new FormData();
    formData.append("Logoimage", file);

    try {
      setUploading((prev) => ({ ...prev, [companyId]: true }));

      await axios.post(
        `${baseUrl}/${companyId}/upload-logo`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => {
            const percent = Math.round((e.loaded * 100) / e.total);
            setUploadProgress((prev) => ({ ...prev, [companyId]: percent }));
          },
        }
      );

      alert("Logo uploaded successfully!");
      // Refresh the list to show new logoUrl
      fetchCompanies();
      // clear selected file
      setSelectedFiles((prev) => ({ ...prev, [companyId]: null }));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading((prev) => ({ ...prev, [companyId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {companies.map((c) => (
        <div
          key={c._id}
          className="p-4 border rounded-md max-w-md mx-auto"
        >
          <h3 className="text-lg font-semibold mb-2">{c.name}</h3>

          {c.logoUrl && (
            <img
              src={c.logoUrl}
              alt={`${c.name} logo`}
              className="h-16 mb-4 object-contain"
            />
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(c._id, e)}
            className="block mb-2"
          />

          {selectedFiles[c._id] && (
            <p className="text-sm mb-2">
              Selected file: {selectedFiles[c._id].name}
            </p>
          )}

          <button
            onClick={() => handleUpload(c._id)}
            disabled={uploading[c._id]}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {uploading[c._id]
              ? `Uploading ${uploadProgress[c._id] || 0}%`
              : "Upload Logo"}
          </button>

          {uploading[c._id] && (
            <progress
              value={uploadProgress[c._id] || 0}
              max="100"
              className="w-full h-2 mt-2"
            />
          )}
        </div>
      ))}
    </div>
  );
}
