import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Update these URLs as needed.
const baseUrl = "https://befr8n.vercel.app";
const secondUrl = "/fms/api/v0";
const thirdUrl = "/companies";
const mergedUrl = `${baseUrl}${secondUrl}${thirdUrl}`;

function CompanyForm({ handleCancel }) {
  console.log("CompanyForm component rendering...");

  // State for list of companies fetched from the API
  const [companyList, setCompanyList] = useState([]);

  // Toggle bank details visibility
  const [showBankDetails, setShowBankDetails] = useState(false);

  // Form data state (matches CompanySchema)
  const [formData, setFormData] = useState({
    companyCode: "",
    companyName: "",
    primaryGSTAddress: "",
    secondaryOfficeAddress: "",
    tertiaryShippingAddress: "",
    logoImage: "",
    email: "",
    contactNumber: "",
    website: "",
    taxInfo: {
      gstNumber: "",
    },
  });

  // State for bank details (matches BankDetailsSchema)
  const [bankDetails, setBankDetails] = useState([
    {
      accountNumber: "",
      bankName: "",
      bankAddress: "",
      ifscCode: "",
      swiftCode: "",
      qrDetails: "",
      upiDetails: "",
    },
  ]);

  /**
   * Generate a new company code (e.g., "CMP_001") based on the highest
   * numeric suffix among already-created companies.
   */
  const generateCompanyCode = (companies) => {
    console.log("Generating company code from companies:", companies);
    const lastCode = companies
      .map((company) => {
        // Expecting a format like "CMP_001"
        const parts = company.companyCode?.split("_");
        const num = parts && parts[1] ? parseInt(parts[1], 10) : 0;
        return num;
      })
      .reduce((max, num) => Math.max(max, num), 0);
    const newCode = `CMP_${String(lastCode + 1).padStart(3, "0")}`;
    console.log("Generated company code:", newCode);
    return newCode;
  };

  // Fetch companies when the component mounts
  useEffect(() => {
    toast.info("Company form opened!");
    async function loadCompanies() {
      try {
        const response = await axios.get(mergedUrl, {
          headers: {
            // Authorization: `Bearer ${tokenCookie}`, // Uncomment if token is required
          },
          withCredentials: false,
        });
        const companies = response.data.data;
        setCompanyList(companies);
        // Auto-generate companyCode based on existing companies.
        const code = generateCompanyCode(companies);
        setFormData((prev) => ({ ...prev, companyCode: code }));
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    }
    loadCompanies();
  }, []);

  // Handle changes for main form inputs
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    // If the field is gstNumber, update the nested taxInfo object.
    if (name === "gstNumber") {
      setFormData((prev) => ({
        ...prev,
        taxInfo: {
          ...prev.taxInfo,
          gstNumber: value,
        },
      }));
    } else {
      // Otherwise, update top-level properties.
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // Handle changes for bank details inputs
  const handleBankDetailChange = (index, e) => {
    const { name, value } = e.target;
    const updatedBankDetails = bankDetails.map((detail, i) =>
      i === index ? { ...detail, [name]: value } : detail
    );
    setBankDetails(updatedBankDetails);
  };

  // Add a new blank bank detail entry
  const addBankDetail = () => {
    setBankDetails([
      ...bankDetails,
      {
        accountNumber: "",
        bankName: "",
        bankAddress: "",
        ifscCode: "",
        swiftCode: "",
        qrDetails: "",
        upiDetails: "",
      },
    ]);
  };

  // Remove a bank detail entry
  const removeBankDetail = (index) => {
    const updatedBankDetails = bankDetails.filter((_, i) => i !== index);
    setBankDetails(updatedBankDetails);
  };

  // Create a new company by posting data to the API
  const createCompany = async (e) => {
    e.preventDefault();
    console.log("Submitting company with data:", formData, bankDetails);
    try {
      // Prepare payload that matches your CompanySchema.
      const payload = {
        ...formData,
        bankDetails,
      };
      const response = await axios.post(mergedUrl, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      toast.success("Company created successfully!", {
        position: "top-right",
        autoClose: 1000,
      });
      // Update the local list of companies
      setCompanyList((prev) => [...prev, response.data.data]);
      // Optionally, reset the form with a newly generated company code.
      const newCode = generateCompanyCode([...companyList, response.data.data]);
      const resetData = {
        companyCode: newCode,
        companyName: "",
        primaryGSTAddress: "",
        secondaryOfficeAddress: "",
        tertiaryShippingAddress: "",
        logoImage: "",
        email: "",
        contactNumber: "",
        website: "",
        gstNumber: "",
      };
      setFormData(resetData);
      setBankDetails([
        {
          accountNumber: "",
          bankName: "",
          bankAddress: "",
          ifscCode: "",
          swiftCode: "",
          qrDetails: "",
          upiDetails: "",
        },
      ]);
      setTimeout(() => {
        handleCancel();
      }, 3000);
    } catch (error) {
      console.error("Error creating company:", error);
      toast.error("Company save error! Please try again.", {
        position: "top-right",
        autoClose: 1000,
      });
    }
  };

  // Reset the form fields
  const handleReset = () => {
    const newCode = generateCompanyCode(companyList);
    const resetData = {
      companyCode: newCode,
      companyName: "",
      primaryGSTAddress: "",
      secondaryOfficeAddress: "",
      tertiaryShippingAddress: "",
      logoImage: "",
      email: "",
      contactNumber: "",
      website: "",
      gstNumber: "",
    };
    setFormData(resetData);
    setBankDetails([
      {
        accountNumber: "",
        bankName: "",
        bankAddress: "",
        ifscCode: "",
        swiftCode: "",
        qrDetails: "",
        upiDetails: "",
      },
    ]);
  };

  return (
    <>
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4 text-center">Add New Company</h1>
      <form onSubmit={createCompany}>
        <div className="min-h-screen  flex items-center justify-center p-6">
          <div className="bg-white shadow-lg rounded-lg w-full max-w-2xl p-8">
            {/* Logo Upload (for logoImage) */}
            <div className="flex flex-col items-center mb-8">
              <div
                className="w-24 h-24  rounded-full flex items-center justify-center cursor-pointer"
                onClick={() => {
                  console.log("Logo upload clicked");
                  // Here you can integrate your file upload logic.
                }}
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
              </div>
              <button
                type="button"
                className="text-blue-600 mt-2 text-sm hover:underline"
                onClick={() => console.log("Upload Logo button clicked")}
              >
                Upload Logo
              </button>
            </div>
            {/* Company Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Code */}
              <div>
                <label
                  htmlFor="companyCode"
                  className="block text-gray-600 mb-2"
                >
                  Company Code<span className="text-red-500">*</span>
                </label>
                <input
                  id="companyCode"
                  name="companyCode"
                  type="text"
                  placeholder="Company Code"
                  value={formData.companyCode}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300"
                  required
                />
              </div>
              {/* Company Name */}
              <div>
                <label
                  htmlFor="companyName"
                  className="block text-gray-600 mb-2"
                >
                  Company Name<span className="text-red-500">*</span>
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  placeholder="Company Name"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300"
                  required
                />
              </div>
              {/* Primary GST Address */}
              <div className="md:col-span-2">
                <label
                  htmlFor="primaryGSTAddress"
                  className="block text-gray-600 mb-2"
                >
                  Primary GST Address<span className="text-red-500">*</span>
                </label>
                <textarea
                  id="primaryGSTAddress"
                  name="primaryGSTAddress"
                  rows="4"
                  placeholder="Enter Primary GST Address"
                  value={formData.primaryGSTAddress}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-1 resize-y focus:outline-none focus:ring focus:ring-blue-300"
                  required
                />
              </div>
              {/* Secondary Office Address */}
              <div className="md:col-span-2">
                <label
                  htmlFor="secondaryOfficeAddress"
                  className="block text-gray-600 mb-2"
                >
                  Secondary Office Address
                </label>
                <textarea
                  id="secondaryOfficeAddress"
                  name="secondaryOfficeAddress"
                  rows="4"
                  placeholder="Enter Secondary Office Address"
                  value={formData.secondaryOfficeAddress}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-1 resize-y focus:outline-none focus:ring focus:ring-blue-300"
                />
              </div>
              {/* Tertiary Shipping Address */}
              <div className="md:col-span-2">
                <label
                  htmlFor="tertiaryShippingAddress"
                  className="block text-gray-600 mb-2"
                >
                  Tertiary Shipping Address
                </label>
                <textarea
                  id="tertiaryShippingAddress"
                  name="tertiaryShippingAddress"
                  rows="4"
                  placeholder="Enter Tertiary Shipping Address"
                  value={formData.tertiaryShippingAddress}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-1 resize-y focus:outline-none focus:ring focus:ring-blue-300"
                />
              </div>
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-gray-600 mb-2">
                  Email<span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300"
                  required
                />
              </div>
              {/* Contact Number */}
              <div>
                <label
                  htmlFor="contactNumber"
                  className="block text-gray-600 mb-2"
                >
                  Contact Number
                </label>
                <input
                  id="contactNumber"
                  name="contactNumber"
                  type="text"
                  placeholder="Contact Number"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-gray-600 mb-2">
                  Gst Number
                </label>
                <input
                  id="gstNumber"
                  name="gstNumber"
                  type="text"
                  placeholder="Gst Number"
                  value={formData.taxInfo.gstNumber}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300"
                />
              </div>
              {/* Website */}

              <div>
                <label htmlFor="website" className="block text-gray-600 mb-2">
                  Website
                </label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  placeholder="Website URL"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring focus:ring-blue-300"
                />
              </div>
              {/* Toggle Bank Details */}
              {/* Toggle Bank Details */}
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={() => setShowBankDetails((prev) => !prev)}
                  className="bg-gray-200 text-black py-2 px-6 rounded-lg hover:bg-gray-300 transition duration-150"
                >
                  {showBankDetails ? "Hide Bank Details" : "Show Bank Details"}
                </button>
              </div>

              {/* Bank Details Section */}
              {showBankDetails && (
                <div className="md:col-span-2 mt-4">
                  {bankDetails.map((bank, index) => (
                    <div
                      key={index}
                      className="bg-white shadow-md rounded-lg border border-gray-200 p-6 mb-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Bank Name */}
                        <div>
                          <label className="text-gray-600 text-sm block mb-1">
                            Bank Name
                          </label>
                          <input
                            type="text"
                            name="bankName"
                            value={bank.bankName}
                            onChange={(e) => handleBankDetailChange(index, e)}
                            placeholder="Bank Name"
                            className="w-full border border-gray-300 rounded-lg p-1 focus:ring-blue-300"
                            required
                          />
                        </div>

                        {/* Account Number */}
                        <div>
                          <label className="text-gray-600 text-sm block mb-1">
                            Account Number
                          </label>
                          <input
                            type="text"
                            name="accountNumber"
                            value={bank.accountNumber}
                            onChange={(e) => handleBankDetailChange(index, e)}
                            placeholder="Account Number"
                            className="w-full border border-gray-300 rounded-lg p-1 focus:ring-blue-300"
                            required
                          />
                        </div>

                        {/* IFSC Code */}
                        <div>
                          <label className="text-gray-600 text-sm block mb-1">
                            IFSC Code
                          </label>
                          <input
                            type="text"
                            name="ifscCode"
                            value={bank.ifscCode}
                            onChange={(e) => handleBankDetailChange(index, e)}
                            placeholder="IFSC Code"
                            className="w-full border border-gray-300 rounded-lg p-1 focus:ring-blue-300"
                            required
                          />
                        </div>

                        {/* Bank Address */}
                        <div>
                          <label className="text-gray-600 text-sm block mb-1">
                            Bank Address
                          </label>
                          <input
                            type="text"
                            name="bankAddress"
                            value={bank.bankAddress}
                            onChange={(e) => handleBankDetailChange(index, e)}
                            placeholder="Bank Address"
                            className="w-full border border-gray-300 rounded-lg p-1 focus:ring-blue-300"
                          />
                        </div>

                        {/* Swift Code */}
                        <div>
                          <label className="text-gray-600 text-sm block mb-1">
                            Swift Code
                          </label>
                          <input
                            type="text"
                            name="swiftCode"
                            value={bank.swiftCode}
                            onChange={(e) => handleBankDetailChange(index, e)}
                            placeholder="Swift Code"
                            className="w-full border border-gray-300 rounded-lg p-1 focus:ring-blue-300"
                          />
                        </div>

                        {/* QR Details */}
                        <div>
                          <label className="text-gray-600 text-sm block mb-1">
                            QR Details
                          </label>
                          <input
                            type="text"
                            name="qrDetails"
                            value={bank.qrDetails}
                            onChange={(e) => handleBankDetailChange(index, e)}
                            placeholder="QR Details"
                            className="w-full border border-gray-300 rounded-lg p-1 focus:ring-blue-300"
                          />
                        </div>

                        {/* UPI Details */}
                        <div>
                          <label className="text-gray-600 text-sm block mb-1">
                            UPI Details
                          </label>
                          <input
                            type="text"
                            name="upiDetails"
                            value={bank.upiDetails}
                            onChange={(e) => handleBankDetailChange(index, e)}
                            placeholder="UPI Details"
                            className="w-full border border-gray-300 rounded-lg p-1 focus:ring-blue-300"
                          />
                        </div>
                      </div>

                      {/* Remove Button */}
                      {bankDetails.length > 1 && (
                        <div className="flex justify-end mt-4">
                          <button
                            type="button"
                            onClick={() => removeBankDetail(index)}
                            className="text-red-600 hover:text-red-800 font-semibold"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add Bank Detail Button */}
                  <button
                    type="button"
                    onClick={addBankDetail}
                    className="mt-4 bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600 transition duration-150"
                  >
                    Add Bank Detail
                  </button>
                </div>
              )}

              {/* Bank Details Table */}
            </div>
            {/* Submit and Reset Buttons */}
            <div className="mt-6 flex justify-between md:col-span-2">
              <button
                type="button"
                onClick={handleReset}
                className="text-gray-500 hover:text-gray-700"
              >
                Reset
              </button>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}

export default CompanyForm;
