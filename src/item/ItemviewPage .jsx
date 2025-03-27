import React, { useState, useEffect } from "react";
import axios from "axios";

import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const baseUrl = "https://befr8n.vercel.app";
const secondUrl = "/fms/api/v0";
const thirdUrl = "/items";
const mergedUrl = `${baseUrl}${secondUrl}${thirdUrl}`;

const ItemviewPage = ({ item, itemId, goBack, handleSaveItem, toggleView }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [itemDetail, setItemDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const { id } = useParams(); // Use id from URL if needed
  const [file, setFile] = useState(null);

  const [isUploaded, setIsUploaded] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [completedFiles, setCompletedFiles] = useState([]);

  useEffect(() => {
    async function fetchitemDetail() {
      try {
        const response = await axios.get(
          `https://fms-qkmw.onrender.com/fms/api/v0/items/${itemId}`
        );
        if (response.status === 200) {
          console.log("itemview page line 39", response.data.data);
          setItemDetail(response.data.data);
          // console.log("line 41",itemDetail)
          setFormData(response.data.data); // Sync form data
          // console.log("line 43",formData)
        } else {
          setError(`Unexpected response status: ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching item details", error);
        const errorMessage =
          error.response?.data?.message ||
          "An unexpected error occurred. Please try again.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchitemDetail();
  }, [itemId, id]);

  const handleUpdate = async () => {
    if (window.confirm("Are you sure you want to update this item?")) {
      setLoading(true);
      toast.success("item updated successfully!");
      console.log("item update");
      try {
        const response = await axios.put(`${mergedUrl}/${itemId}`, formData, {
          withCredentials: false,
        });

        setItemDetail(response.data); // Update item details with response
        setIsEditing(false); // Exit edit mode
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "An unexpected error occurred.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    toggleView();
  };

  const handleEdit = () => {
    setIsEdited(true);
    setIsEditing(true);
  };

  const handleSave = () => {
    handleSaveItem(formData); // Save item data
    setIsEditing(false); // Exit edit mode

    // Save logic here
    console.log("Data saved!");
    setIsEdited(false); // Reset state after saving
  };
  const back = () => {
    if (toggleView) {
      console.log("toggle function working");
      toggleView(); // Execute the toggleView function
      setView("form");
    } else {
      console.log("error in running function");
    }
  };
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

  const handleDelete = (fileName) => {
    setFiles((prev) => prev.filter((file) => file.name !== fileName));
    setUploadProgress((prev) => {
      const { [fileName]: _, ...remaining } = prev;
      return remaining;
    });
    setUploadedFiles((prev) => prev.filter((file) => file.name !== fileName));
    setCompletedFiles((prev) => prev.filter((name) => name !== fileName));
  };

  console.log("line 155", formData);
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-black-500 border-t-transparent border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-zinc-500 text-lg font-medium">Item View Page</p>
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
          {/* item Photo */}
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
              item Photo
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
                name="itemName"
                value={formData?.name}
                className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300"
                disabled={!isEditing}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="itemName" className="block text-gray-600 mb-2">
                Price <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="price "
                value={formData?.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300"
                disabled={!isEditing}
              />
            </div>

            {/* Currency */}
            <div>
              <label htmlFor="type" className="block text-gray-600 mb-2">
                Type
              </label>
              <select
                name="type"
                value={formData?.type || ""}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300"
                disabled={!isEditing}
              >
                <option value="goods">Goods</option>
                <option value="service">Service</option>
              </select>
            </div>
            <div>
              <label htmlFor="  Unit" className="block text-gray-600 mb-2">
                Unit
              </label>
              <select
                name="unit"
                value={formData?.unit || ""}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300"
                disabled={!isEditing}
              >
                <option value="kgs">KG - Kilogram</option>

                <option value="mt ">Metric tonnes</option>
                <option value="ea">Ea - Each</option>
                <option value="lbs"> lbs - pounds</option>

                <option value="hr">Hour</option>
                <option value="min">Minutes</option>
                <option value="qty">Quantity</option>
                {/* <option value="Carton ">Carton - Carton Box</option> */}
              </select>
            </div>
            {/* PAN Number */}
            <div>
              <label htmlFor="Price" className="block text-gray-600 mb-2">
                Description
              </label>
              <textarea
                type="text"
                name="description"
                value={formData?.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows="4"
                disabled={!isEditing}
                className="border border-gray-300 rounded-lg p-1 w-full focus:outline-none focus:ring focus:ring-blue-300"
              ></textarea>
            </div>
          </div>

          <div className="p-4">
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

export default ItemviewPage;
