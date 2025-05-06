import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Textarea } from "flowbite-react";

const baseUrl = "https://befr8n.vercel.app";
const secondUrl = "/fms/api/v0";
const thirdUrl = "/companies";
const mergedUrl = `${baseUrl}${secondUrl}${thirdUrl}`;

const CampanyViewPage = ({ CampanyId, Campany, goBack, toggleView }) => {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const [formData, setFormData] = useState({ ...Campany });
  const [campanyDetail, setCampanyDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [completedFiles, setCompletedFiles] = useState([]);
  const [showBankDetails, setShowBankDetails] = useState(false);

  // New state for bank details; if the fetched data has bankDetails, use them.
  const [bankDetails, setBankDetails] = useState([
    {
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      Swiftcode: "",
      qrDetails: "",
      upiDetails: "",
    },
  ]);

  // For general form fields (e.g. companyName, email)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setIsEdited(true);
  };

  // For GST addresses and GST number fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setIsEdited(true);
  };

  // File Upload Handlers (unchanged)
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFiles((prev) => [...prev, selectedFile]);
      setUploadProgress((prev) => ({ ...prev, [selectedFile.name]: 0 }));
    }
  };

  const handleUpload = () => {
    if (files.length === 0) return;

    const fileToUpload = files.find(
      (file) =>
        !uploadedFiles.includes(file) && !completedFiles.includes(file.name)
    );

    if (fileToUpload) {
      // Simulate file upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          const progress = prev[fileToUpload.name] || 0;
          if (progress >= 100) {
            clearInterval(interval);
            setUploadedFiles((prevUploaded) => [...prevUploaded, fileToUpload]);
            // Hide loader after 3 seconds
            setTimeout(() => {
              setCompletedFiles((prev) => [...prev, fileToUpload.name]);
            }, 3000);
            return { ...prev, [fileToUpload.name]: 100 };
          }
          return { ...prev, [fileToUpload.name]: progress + 10 };
        });
      }, 200);
    }
  };

  const handleDelete = (fileName) => {
    setFiles((prev) => prev.filter((file) => file.name !== fileName));
    setUploadProgress((prev) => {
      const { [fileName]: _, ...remaining } = prev;
      return remaining;
    });
    setUploadedFiles((prev) => prev.filter((file) => file.name !== fileName));
    setCompletedFiles((prev) => prev.filter((name) => name !== fileName));
  };

  // Bank Details handlers
  const handleBankDetailChange = (index, event) => {
    const { name, value } = event.target;
    const updatedBankDetails = [...bankDetails];
    updatedBankDetails[index][name] = value;
    setBankDetails(updatedBankDetails);
    setIsEdited(true);
  };

  const removeBankDetail = (index) => {
    const updatedBankDetails = bankDetails.filter((_, i) => i !== index);
    setBankDetails(updatedBankDetails);
    setIsEdited(true);
  };

  const addBankDetail = () => {
    setBankDetails([
      ...bankDetails,
      {
        bankName: "",
        accountNumber: "",
        ifscCode: "",
        Swiftcode: "",
        qrDetails: "",
        upiDetails: "",
      },
    ]);
    setIsEdited(true);
  };

  // Fetch company details from API
  useEffect(() => {
    async function fetchCampanyDetail() {
      try {
        const response = await axios.get(
          `${baseUrl}${secondUrl}${thirdUrl}/${CampanyId || id}`
        );
        if (response.status === 200) {
          const data = response.data.data;
          setCampanyDetail(data);
          setFormData(data); // sync form data with fetched data

          // If the data has bankDetails, use them; otherwise keep the default.
          if (data.bankDetails) {
            setBankDetails(data.bankDetails);
          }
        } else {
          setError(`Unexpected response status: ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching Campany details", error);
        const errorMessage =
          error.response?.data?.message ||
          "An unexpected error occurred. Please try again.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchCampanyDetail();
  }, [CampanyId, id]);

  // When updating, merge bank details into the form data.
  const handleUpdate = async () => {
    if (window.confirm("Are you sure you want to update this Campany?")) {
      setLoading(true);
      // Merge bank details into the updated data
      const updatedData = { ...formData, bankDetails };
      try {
        const response = await axios.put(
          `${mergedUrl}/${CampanyId || id}`,
          updatedData,
          {
            withCredentials: false,
          }
        );
        setCampanyDetail(response.data.data || response.data);
        toast.success("Campany updated successfully!");
        setIsEditing(false);
        setIsEdited(false);
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "An unexpected error occurred.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
    toggleView && toggleView();
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsEdited(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl bg-black-400 font-bold mb-4 text-center">
        {formData.code || ""} {formData.companyName || ""}
      </h1>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white shadow-lg rounded-lg w-full max-w-2xl p-8">
          {/* Company Photo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 11c1.656 0 3-1.344 3-3s-1.344-3-3-3-3 1.344-3 3 1.344 3 3 3zm0 2c-2.761 0-5 2.239-5 5v3h10v-3c0-2.761-2.239-5-5-5z"
                />
              </svg>
            </div>
            <button
              type="button"
              className="text-blue-600 mt-2 text-sm hover:underline"
            >
              Company Photo
            </button>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block text-gray-600 mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300"
                disabled={!isEditing}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-gray-600 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300"
                disabled={!isEditing}
              />
            </div>

            {/* Primary GST Address */}
            <div>
              <label
                htmlFor="primaryGstAddress"
                className="block text-gray-600 mb-2"
              >
                Primary GST Address <span className="text-red-500">*</span>
              </label>
              <textarea
                rows="4"
                id="primaryGstAddress"
                name="primaryGstAddress"
                type="text"
                placeholder="Primary GST Address"
                value={formData.primaryGSTAddress || ""}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300"
                required
                disabled={!isEditing}
              />
            </div>

            {/* Secondary Office Address */}
            <div>
              <label
                htmlFor="secondaryOfficeAddress"
                className="block text-gray-600 mb-2"
              >
                Secondary Office Address <span className="text-red-500">*</span>
              </label>
              <textarea
                rows="4"
                id="secondaryOfficeAddress"
                name="secondaryOfficeAddress"
                type="text"
                placeholder="Secondary Office Address"
                value={formData.secondaryOfficeAddress || ""}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300"
                required
                disabled={!isEditing}
              />
            </div>

            {/* Tertiary Shipping Address */}
            <div>
              <label
                htmlFor="tertiaryShippingAddress"
                className="block text-gray-600 mb-2"
              >
                Tertiary Shipping Address{" "}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                rows="4"
                id="tertiaryShippingAddress"
                name="tertiaryShippingAddress"
                type="text"
                placeholder="Tertiary Shipping Address"
                value={formData.tertiaryShippingAddress || ""}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300"
                required
                disabled={!isEditing}
              />
            </div>

            {/* GST Number */}
            <div>
              <label htmlFor="taxInfo" className="block text-gray-600 mb-2">
                GST Number <span className="text-red-500">*</span>
              </label>
              <input
                id="taxInfo"
                name="taxInfo"
                type="text"
                placeholder="GST Number"
                value={formData.taxInfo.gstNumber || ""}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300"
                required
                disabled={!isEditing}
              />
            </div>

            {/* Toggle Bank Details */}
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={() => setShowBankDetails((prev) => !prev)}
                className="bg-gray-300 text-black py-2 px-6 rounded-lg hover:bg-gray-400"
              >
                {showBankDetails ? "Hide Bank Details" : "Show Bank Details"}
              </button>
            </div>

            {/* Bank Details Table */}
            {showBankDetails && (
              <div className="md:col-span-2 mt-4">
                <table className="min-w-full divide-y divide-gray-200 border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bank Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Account Number
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IFSC Code
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Swift Code
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        QR Details
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        UPI Details
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bankDetails.map((bank, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <input
                            type="text"
                            name="bankName"
                            value={bank.bankName}
                            onChange={(e) => handleBankDetailChange(index, e)}
                            placeholder="Bank Name"
                            className="w-full border border-gray-300 rounded-lg p-2"
                            disabled={!isEditing}
                            required
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <input
                            type="text"
                            name="accountNumber"
                            value={bank.accountNumber}
                            onChange={(e) => handleBankDetailChange(index, e)}
                            placeholder="Account Number"
                            className="w-full border border-gray-300 rounded-lg p-2"
                            disabled={!isEditing}
                            required
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <input
                            type="text"
                            name="ifscCode"
                            value={bank.ifscCode}
                            onChange={(e) => handleBankDetailChange(index, e)}
                            placeholder="IFSC Code"
                            className="w-full border border-gray-300 rounded-lg p-2"
                            disabled={!isEditing}
                            required
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <input
                            type="text"
                            name="Swiftcode"
                            value={bank.Swiftcode}
                            onChange={(e) => handleBankDetailChange(index, e)}
                            placeholder="Swift Code"
                            className="w-full border border-gray-300 rounded-lg p-2"
                            disabled={!isEditing}
                            required
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <input
                            type="text"
                            name="qrDetails"
                            value={bank.qrDetails}
                            onChange={(e) => handleBankDetailChange(index, e)}
                            placeholder="QR Details"
                            className="w-full border border-gray-300 rounded-lg p-2"
                            disabled={!isEditing}
                            required
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <input
                            type="text"
                            name="upiDetails"
                            value={bank.upiDetails}
                            onChange={(e) => handleBankDetailChange(index, e)}
                            placeholder="UPI Details"
                            className="w-full border border-gray-300 rounded-lg p-2"
                            disabled={!isEditing}
                            required
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {bankDetails.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeBankDetail(index)}
                              className="text-red-600 hover:underline"
                              disabled={!isEditing}
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  type="button"
                  onClick={addBankDetail}
                  className="mt-2 bg-green-500 text-white py-1 px-4 rounded-lg hover:bg-green-600"
                  disabled={!isEditing}
                >
                  Add Bank Detail
                </button>
              </div>
            )}
          </div>

          {/* File Upload Section */}
          <div className="mt-6">
            <div className="mb-4">
              <input
                type="file"
                onChange={handleFileChange}
                className="border p-2"
              />
              <button
                onClick={handleUpload}
                className="ml-4 bg-blue-500 text-white px-4 py-2 rounded"
                disabled={
                  files.length === 0 ||
                  files.every((file) => completedFiles.includes(file.name))
                }
              >
                Upload
              </button>
            </div>
            {files.map((file, index) => (
              <div key={file.name} className="mb-4">
                <div className="flex items-center justify-between">
                  <p className="text-gray-700 text-sm">{`File ${index + 1}: ${
                    file.name
                  }`}</p>
                  <button
                    onClick={() => handleDelete(file.name)}
                    className="text-red-500 font-bold text-sm"
                  >
                    Delete
                  </button>
                </div>
                {!completedFiles.includes(file.name) && (
                  <div>
                    <div className="relative h-6 bg-gray-200 rounded">
                      <div
                        className="absolute top-0 left-0 h-full bg-green-500 rounded"
                        style={{ width: `${uploadProgress[file.name] || 0}%` }}
                      ></div>
                    </div>
                    <p className="text-sm mt-1">
                      {uploadProgress[file.name] || 0}% uploaded
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 text-center">
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="bg-zinc-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
              >
                Edit
              </button>
            )}
            <button
              type="button"
              onClick={goBack}
              className="bg-red-400 text-white px-6 py-3 m-5 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
            >
              Back
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={handleUpdate}
                disabled={!isEdited}
                className={`px-6 py-3 rounded-lg text-white focus:outline-none focus:ring focus:ring-blue-300 ${
                  isEdited
                    ? "bg-zinc-500 hover:bg-blue-600"
                    : "bg-gray-300 cursor-not-allowed opacity-50"
                }`}
              >
                Save
              </button>
            )}
          </div>
          {error && (
            <div className="mt-4 text-red-500 text-center">
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CampanyViewPage;
