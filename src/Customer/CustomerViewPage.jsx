import React, { useState, useEffect } from "react";
import axios from "axios";
import Checkbox_with_words from "../components/layout/Checkbox_with_words/Checkbox_with_words";
import { useParams } from "react-router-dom";
import Label from "../components/common/Common/Label/Label";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./c.css";
const baseUrl = "https://fms-qkmw.onrender.com";
const secondUrl = "/fms/api/v0";
const thirdUrl = "/customers";
const mergedUrl = `${baseUrl}${secondUrl}${thirdUrl}`;

const CustomerViewPage = ({
  customerId,
  customer,
  goBack,
  handleSaveCustomer,
  toggleView,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const [formData, setFormData] = useState({ ...customer });
  const [error, setError] = useState(null);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const { id } = useParams(); // Use id from URL if needed
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploaded, setIsUploaded] = useState(false);

  const [files, setFiles] = useState([]);

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [completedFiles, setCompletedFiles] = useState([]);

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
        !(uploadedFiles.includes(file) || completedFiles.includes(file.name))
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
      }, 200); // Simulate progress increment every 200ms
    }
  };
  const handleUpdate = async () => {
    if (window.confirm("Are you sure you want to update this customer?")) {
      setLoading(true);

      // Create a custom green spinner icon for the toast
      const loaderIcon = (
        <div
          style={{
            display: "inline-block",
            width: "20px",
            height: "20px",
            border: "3px solid #4CAF50",
            borderTop: "3px solid transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>
      );

      // Show a loading toast with our custom icon
      const toastId = toast.loading("Updating...", {
        icon: loaderIcon,
        position: "top-right",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
      });

      try {
        const response = await axios.put(
          `${mergedUrl}/${customerId}`,
          formData,
          { withCredentials: false }
        );

        if (response.status === 200) {
          setCustomerDetail(response.data);
          setIsEditing(false);
          toast.update(toastId, {
            render: "Customer updated successfully!",
            type: "success",
            isLoading: false,
            autoClose: 3000,
            progress: undefined,
          });
        } else {
          console.error(`Unexpected response status: ${response.status}`);
          toast.update(toastId, {
            render: "Failed to update customer. Please try again.",
            type: "error",
            isLoading: false,
            autoClose: 3000,
            progress: undefined,
          });
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "An unexpected error occurred.";
        console.error("Error updating customer:", err);
        toast.update(toastId, {
          render: errorMessage,
          type: "error",
          isLoading: false,
          autoClose: 3000,
          progress: undefined,
        });
      } finally {
        setLoading(false);
        toggleView();
      }
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

  useEffect(() => {
    async function fetchCustomerDetail() {
      try {
        const response = await axios.get(
          `https://befr8n.vercel.app/fms/api/v0/customers/${customerId || id}`
        );
        if (response.status === 200) {
          setCustomerDetail(response.data.data);
          setFormData(response.data.data); // Sync form data
        } else {
          setError(`Unexpected response status: ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching customer details", error);
        const errorMessage =
          error.response?.data?.message ||
          "An unexpected error occurred. Please try again.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomerDetail();
  }, [customerId, id]);

  const handleEdit = () => {
    setIsEdited(true);
    setIsEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-black-500 border-t-transparent border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-zinc-500 text-lg font-medium">
          Customer view page
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl  bg-black-400 font-bold mb-4 text-center">
        {" "}
        {formData.code || ""} {formData.name || ""}
      </h1>
      <h1 className="text-2xl bg-black-400 font-bold mb-4 text-center"></h1>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white shadow-lg rounded-lg w-full max-w-2xl p-8">
          {/* Customer Photo */}
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
              Customer Photo
            </button>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-gray-600 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300"
                disabled={!isEditing}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="contactNum" className="block text-gray-600 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="contactNum"
                value={formData.contactNum || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300"
                disabled={!isEditing}
                maxLength={10}
              />
            </div>

            {/* Currency */}
            <div>
              <label htmlFor="currency" className="block text-gray-600 mb-2">
                Currency
              </label>
              <select
                name="currency"
                value={formData.currency || ""}
                onChange={handleChange}
                className="border border-green-600 w-full p-2 rounded-lg"
                disabled={!isEditing}
              >
                <option value="">Select Currency</option>
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>

            {/* PAN Number */}
            <div>
              <label htmlFor="panNum" className="block text-gray-600 mb-2">
                PAN Number
              </label>
              <input
                type="text"
                name="panNum"
                value={formData.panNum || ""}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase(); // Convert to uppercase
                  if (value.length <= 10) {
                    // Correctly update the formData state
                    setFormData({ ...formData, panNum: value }); // Ensure the correct key is being updated
                  }
                }}
                className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300"
                disabled={!isEditing}
              />
            </div>

            {/* Registration Number */}
            <div>
              <label
                htmlFor="registrationNum"
                className="block text-gray-600 mb-2"
              >
                Registration Number
              </label>
              <input
                type="text"
                name="registrationNum"
                value={formData.registrationNum || ""}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase(); // Convert to uppercase
                  if (value.length <= 16) {
                    // Correctly update the formData state
                    setFormData({ ...formData, registrationNum: value }); // Ensure the correct key is being updated
                  }
                }}
                className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300"
                disabled={!isEditing} // Disable input if not editing
              />
            </div>

            {/* Billing Address */}
            <div className="md:col-span-2">
              <label
                htmlFor="billingAddress"
                className="block text-gray-600 mb-2"
              >
                Address
              </label>
              <textarea
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
                disabled={!isEditing}
                rows="4"
                className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring focus:ring-blue-300"
              ></textarea>
            </div>
          </div>

          <div className="flex items-center">
            <label className="font-semibold text-blue-600">Active</label>
            <Checkbox_with_words
              name="active"
              value={formData?.active || ""}
              className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300"
              checked={formData.active}
              onChange={(e) => {
                if (isEditing) {
                  setFormData({ ...formData, active: e.target.checked });
                }
              }}
              disabled={!isEditing}
            />
          </div>

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

            {/* Display File List with TODO Numbers */}
            {files.map((file, index) => (
              <div key={file.name} className="mb-4">
                <div className="flex items-center justify-between">
                  <p className="text-gray-700 text-sm">
                    {`TODO ${index + 1}: ${file.name}`}
                  </p>
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

          {/* Submit Button */}
          <div className="mt-8 text-center">
            <button
              onClick={handleEdit}
              className="bg-zinc-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={goBack}
              className="bg-red-400 text-white px-6 py-3  m-5 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleUpdate}
              disabled={!isEdited}
              className={`px-6 py-3 rounded-lg text-white focus:outline-none focus:ring focus:ring-blue-300 ${
                isEdited
                  ? "bg-zinc-500 hover:bg-blue-600" // Normal active state
                  : "bg-gray-300 cursor-not-allowed opacity-50" // Disabled state
              }`}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerViewPage;
