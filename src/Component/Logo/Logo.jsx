import React, { useRef, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LogoUpload() {
  const inputRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);

  const apiBase = "https://fms-qkmw.onrender.com/fms/api/v0/customers";

  // open file picker
  const handleButtonClick = () => {
    if (inputRef.current) inputRef.current.click();
  };

  // when file is selected
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setShowProgress(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("logoImage", file);

    try {
      await axios.post(`${apiBase}/upload-logo`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          const pct = Math.round((evt.loaded * 100) / evt.total);
          setUploadProgress(pct);
        },
      });
      toast.success("Upload successful");
    } catch (err) {
      console.error(err);
      toast.error("Upload not successful");
    } finally {
      // hide bar a couple seconds after finishing
      setTimeout(() => {
        setShowProgress(false);
        setUploadProgress(0);
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* hidden file input */}
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* SVG as the only button */}
      <button
        type="button"
        onClick={handleButtonClick}
        className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition"
      >
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
      </button>

      {/* optional text link if you still want it */}
      <button
        type="button"
        onClick={handleButtonClick}
        className="text-blue-600 mt-2 text-sm hover:underline"
      >
        Upload Photo
      </button>

      {/* progress bar + percentage */}
      {showProgress && (
        <div className="w-full max-w-xs mt-3">
          <div className="relative w-full bg-gray-200 rounded h-2">
            <div
              className="absolute top-0 left-0 h-full bg-green-500 rounded"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm mt-1">{uploadProgress}% uploaded</p>
        </div>
      )}

      {/* Toast container */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
