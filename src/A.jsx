import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RotatingLines } from "react-loader-spinner";

const LoaderComponent = () => {
  const [loading, setLoading] = useState(false);

  const showLoader = () => {
    setLoading(true);
    toast.info(
      <div className="flex items-center gap-3">
        <RotatingLines strokeColor="green" strokeWidth="5" width="40" />
        <span className="text-green-600">Loading... Please wait</span>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        draggable: false,
        hideProgressBar: true,
        className: "custom-toast",
      }
    );

    setTimeout(() => {
      setLoading(false);
      toast.dismiss();
    }, 3000);
  };

  return (
    <div
      className={`relative h-screen flex items-center justify-center ${
        loading ? "backdrop-blur-md" : ""
      }`}
    >
      <button
        onClick={showLoader}
        className="px-6 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700"
      >
        Show Loader
      </button>

      <ToastContainer />
    </div>
  );
};

export default LoaderComponent;
