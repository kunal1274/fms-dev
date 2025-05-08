import React, { useState, useEffect } from "react";
import axios from "axios";

import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const baseUrl = "https://fms-qkmw.onrender.com";
const secondUrl = "/fms/api/v0";
const thirdUrl = "/items";
const mergedUrl = `${baseUrl}${secondUrl}${thirdUrl}`;

const ItemviewPage = ({ item, itemId, goBack, handleSaveItem, toggleView }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  // --- validation rules ---
  const rules = {
    name: {
      regex: /^[A-Z][A-Za-z0-9 ]*$/,
      message:
        "Must start with uppercase letter; may contain letters, numbers, spaces.",
    },
    itemNum: {
      regex: /^[A-Z0-9]+$/,
      message: "Only uppercase letters and digits are allowed.",
    },
    price: {
      regex: /^\d+(\.\d{1,2})?$/,
      message: "Must be a number (optionally with up to two decimals).",
    },
  };

  const validateField = (field, value) => {
    const rule = rules[field];
    if (!rule) return null;
    if (!rule.regex.test(value ?? "")) return rule.message;
    return null;
  };

  const [error, setError] = useState(null);
  const [itemDetail, setItemDetail] = useState(null);

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
  const handleChange = (e) => {
    let { name, value, type, checked } = e.target;
    let val = type === "checkbox" ? checked : value;

    // Format the value based on field name
    if (name === "name") {
      val = val.length > 0 ? val.charAt(0).toUpperCase() + val.slice(1) : val;
    }

    if (name === "itemNum") {
      val = val.toUpperCase().replace(/[^A-Z0-9]/g, "");
    }

    // Update form data
    setFormData((prev) => ({ ...prev, [name]: val }));

    // Validate the updated field
    const errorMsg = validateField(name, val);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
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
    <div className="">
      <ToastContainer />
      {/* Header Buttons */}
      <div className="flex justify-between ">
        <div className="flex items-center space-x-2">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            {" "}
            <button
              type="button"
              className="text-blue-600 mt-2 text-sm hover:underline"
            >
              Upload Photo
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
              </svg>{" "}
            </button>
          </div>
          <h3 className="text-xl font-semibold">Customer View Page</h3>
        </div>
      </div>

      <form className="bg-white shadow-none rounded-lg divide-y divide-gray-200">
        {/* Business Details */}
        <section className="p-6">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Item Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Item Code
              </label>
              <input
                name="customercode"
                value={formData.code || ""}
                readOnly
                placeholder="Auto-generated"
                className="mt-1 w-full cursor-not-allowed  p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Item Name
              </label>
              <input
                type="text"
                name="itemName"
                value={formData?.name}
                onChange={handleChange}
                disabled={!isEditing}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Item Number
              </label>
              <input
                type="text"
                name="itemNum"
                placeholder="eg-ITEM001"
                value={formData.itemNum || ""}
                onChange={handleChange} // ← add this
                disabled={!isEditing}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Price
              </label>
              <input
                type="text"
                name="price" // ← no trailing space
                value={formData.price || ""} // ← controlled to the right key
                onChange={handleChange} // ← so handleChange runs
                disabled={!isEditing} // ← consistent with your other fields
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Type
              </label>
              <select
                name="type"
                value={formData?.type || ""}
                disabled={!isEditing}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option value="goods">Goods</option>
                <option value="service">Service</option>
              </select>
            </div>{" "}
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
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
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
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Description
              </label>
              <textarea
                name="description"
                placeholder=" eg - This is a ... "
                value={formData?.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                disabled={!isEditing}
                rows="4"
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex gap-3 ml-1">
              <label className="block h-5  mt-1  font-large text-blue-600">
                Active
              </label>
              <input
                name="active"
                checked={formData.active}
                disabled={!isEditing}
                onChange={handleChange}
                type="checkbox"
                className=" w-4 h-4 mt-2 gap-2"
              />
            </div>
          </div>{" "}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="space-y-4"></div>
          </div>{" "}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6"></div>
        </section>

        {/* Action Buttons */}
        <div className="py-6 flex justify-end gap-4">
          {" "}
          <button
            type="button"
            onClick={handleEdit}
            className="px-6 py-2 bg-green-200 rounded hover:bg-gray-300 transition"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={goBack}
            className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
          >
            Go Back
          </button>
          <button
            onClick={handleUpdate}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  );
};

export default ItemviewPage;
