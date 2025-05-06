import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./c.css";

const baseUrl = "https://fms-qkmw.onrender.com";
const apiPath = "/fms/api/v0/customers";
const mergedUrl = `${baseUrl}${apiPath}`;

const businessTypes = [
  "Individual",
  "Manufacturing",
  "ServiceProviderr",
  "Trading",
  "Distributor",
  "Retailer",
  "Wholesaler",
  "Others",
];
const bankTypes = ["BankAndUpi", "Cash", "Bank", "Crypto", "Barter", "UPI"];

export default function CustomerViewPage({ customerId, goBack }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ bankDetails: [], panNum: '', registrationNum: '' });
  const bankDetailsBackup = useRef({});
  const { id } = useParams();

  console.log("[INIT] Mounted. customerId:", customerId, "url id:", id);

  const sanitizeBankField = (field, raw) => {
    console.log(`[SANITIZE] ${field}:`, raw);
    let v = raw || '';
    switch (field) {
      case "bankAccNum": return v.replace(/[^0-9]/g, "").slice(0, 20);
      case "bankName": return v.toUpperCase().slice(0, 60);
      case "accountHolderName": return v ? v.charAt(0).toUpperCase() + v.slice(1) : '';
      case "ifsc": return v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11);
      case "swift": return v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20);
      case "qrDetails": return v.toUpperCase().replace(/[^A-Z0-9@._]/g, "").slice(0, 25);
      default: return raw;
    }
  };

  const handleBankDetailChange = (index, field, rawValue) => {
    console.log("[BANK_CHANGE] idx, field, raw:", index, field, rawValue);
    const clean = sanitizeBankField(field, rawValue);
    setFormData(prev => {
      const copy = [...(prev.bankDetails || [])];
      let row = { ...copy[index] };
      if (field === 'type') {
        const detailTypes = ["Bank", "UPI", "BankAndUpi"];
        const isDetail = detailTypes.includes(clean);
        if (!isDetail) {
          bankDetailsBackup.current[index] = { ...row };
          row = { type: clean, bankName: '', bankAccNum: '', accountHolderName: '', ifsc: '', swift: '', qrDetails: '' };
        } else {
          const backed = bankDetailsBackup.current[index];
          if (backed) { row = { ...backed, type: clean }; delete bankDetailsBackup.current[index]; }
          else row.type = clean;
        }
      } else {
        row[field] = clean;
      }
      copy[index] = row;
      return { ...prev, bankDetails: copy };
    });
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    console.log("[FIELD_CHANGE]", name, type, value, checked);
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleUpdate = async () => {
    console.log("[UPDATE] Sending:", formData);
    if (!window.confirm('Confirm update?')) return;
    setLoading(true);
    const toastId = toast.loading('Updating...');
    try {
      const res = await axios.put(
        `${mergedUrl}/${customerId || id}`,
        formData
      );
      console.log("[UPDATE] Response:", res);
      if (res.status === 200) toast.update(toastId, { render: 'Updated!', type: 'success', isLoading: false, autoClose: 2000 });
      else toast.update(toastId, { render: 'Failed', type: 'error', isLoading: false, autoClose: 2000 });
      setIsEditing(false);
    } catch (err) {
      console.error("[UPDATE] Error", err);
      toast.update(toastId, { render: err.response?.data?.message || 'Error', type: 'error', isLoading: false, autoClose: 3000 });
    } finally { setLoading(false); }
  };

  useEffect(() => {
    console.log("[FETCH] id:", customerId || id);
    const fetchCustomer = async () => {
      try {
        const resp = await axios.get(`${mergedUrl}/${customerId || id}`);
        console.log("[FETCH]", resp);
        if (resp.status === 200) setFormData({ ...resp.data.data });
      } catch (e) { console.error("[FETCH]", e); }
      finally { setLoading(false); }
    };
    fetchCustomer();
  }, [customerId, id]);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;

  console.log("[RENDER] formData:", formData);
  return (
    <div className="p-6">
      <ToastContainer />
      <h3 className="text-xl font-semibold mb-4">Customer View Page</h3>
      <form className="space-y-6 bg-white p-6 rounded">
        {/* Business Details */}
        <section>
          <h4 className="font-medium mb-2">Business Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm">Customer Code</label>
              <input name="code" value={formData.code||''} readOnly className="w-full p-2 border rounded bg-gray-100"/>
            </div>
            <div>
              <label className="block text-sm">Name</label>
              <input name="name" value={formData.name||''} onChange={handleChange} disabled={!isEditing} className="w-full p-2 border rounded"/>
            </div>
            <div>
              <label className="block text-sm">Global Party ID</label>
              <input name="globalPartyId" value={formData.globalPartyId?.code||''} readOnly className="w-full p-2 border rounded bg-gray-100"/>
            </div>
            <div>
              <label className="block text-sm">Contact No</label>
              <input name="contactNum" maxLength={10} value={formData.contactNum||''} onChange={handleChange} disabled={!isEditing} className="w-full p-2 border rounded"/>
            </div>
            <div>
              <label className="block text-sm">Email</label>
              <input name="email" type="email" value={formData.email||''} onChange={handleChange} disabled={!isEditing} className="w-full p-2 border rounded"/>
            </div>
            <div>
              <label className="block text-sm">Business Type</label>
              <select name="businessType" value={formData.businessType||''} onChange={handleChange} disabled={!isEditing} className="w-full p-2 border rounded">
                {businessTypes.map(bt => <option key={bt} value={bt}>{bt}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm">Address</label>
              <textarea name="address" rows={3} value={formData.address||''} onChange={handleChange} disabled={!isEditing} className="w-full p-2 border rounded"></textarea>
            </div>
            <div>
              <label className="block text-sm">PAN No</label>
              <input name="panNum" maxLength={10} value={formData.panNum||''} onChange={handleChange} disabled={!isEditing} className="w-full p-2 border rounded"/>
            </div>
            <div>
              <label className="block text-sm">Registration No</label>
              <input name="registrationNum" maxLength={15} value={formData.registrationNum||''} onChange={handleChange} disabled={!isEditing} className="w-full p-2 border rounded"/>
            </div>
            <div className="sm:col-span-2 flex items-center">
              <input name="active" type="checkbox" checked={formData.active||false} onChange={handleChange} disabled={!isEditing} className="mr-2"/>
              <label className="text-sm">Active</label>
            </div>
          </div>
        </section>

        {/* Bank Details */}
        <section>
          <h4 className="font-medium mb-2">Bank Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {formData.bankDetails.map((b, i) => {
              const detailTypes = ["Bank", "UPI", "BankAndUpi"];
              const isDetail = detailTypes.includes(b.type);
              return (
                <div key={i} className="p-4 border rounded space-y-2">
                  <label className="block text-sm">Bank Type</label>
                  <select className="w-full p-2 border rounded" value={b.type} disabled={!isEditing} onChange={e => handleBankDetailChange(i, 'type', e.target.value)}>
                    {bankTypes.map(type => <option key={type} value={type}>{type === 'BankAndUpi' ? 'Bank and UPI' : type}</option>)}
                  </select>
                  <label className="block text-sm">Bank Name</label>
                  <input className={`w-full p-2 border rounded ${(!isEditing || !isDetail) ? 'bg-gray-100 cursor-not-allowed' : ''}`} value={b.bankName||''} readOnly={!isEditing || !isDetail} onChange={e => handleBankDetailChange(i, 'bankName', e.target.value)} />
                  <label className="block text-sm">Account Number</label>
                  <input className={`w-full p-2 border rounded ${(!isEditing || !isDetail) ? 'bg-gray-100 cursor-not-allowed' : ''}`} value={b.bankAccNum||''} readOnly={!isEditing || !isDetail} onChange={e => handleBankDetailChange(i, 'bankAccNum', e.target.value)} />
                  <label className="block text-sm">Account Holder</label>
                  <input className={`w-full p-2 border rounded ${(!isEditing || !isDetail) ? 'bg-gray-100 cursor-not-allowed' : ''}`} value={b.accountHolderName||''} readOnly={!isEditing || !isDetail} onChange={e => handleBankDetailChange(i, 'accountHolderName', e.target.value)} />
                  <label className="block text-sm">IFSC</label>
                  <input className={`w-full p-2 border rounded ${(!isEditing || !isDetail) ? 'bg-gray-100 cursor-not-allowed' : ''}`} value={b.ifsc||''} maxLength={11} readOnly={!isEditing || !isDetail} onChange={e => handleBankDetailChange(i, 'ifsc', e.target.value)} />
                  <label className="block text-sm">SWIFT</label>
                  <input className={`w-full p-2 border rounded ${(!isEditing || !isDetail) ? 'bg-gray-100 cursor-not-allowed' : ''}`} value={b.swift||''} maxLength={20} readOnly={!isEditing || !isDetail} onChange={e => handleBankDetailChange(i, 'swift', e.target.value)} />
                  <label className="block text-sm">UPI ID</label>
                  <input className={`w-full p-2 border rounded ${(!isEditing || !isDetail) ? 'bg-gray-100 cursor-not-allowed' : ''}`} value={b.qrDetails||''} maxLength={25} readOnly={!isEditing || !isDetail} onChange={e => handleBankDetailChange(i, 'qrDetails', e.target.value)} />
                </div>
              );
            })}
          </div>
        </section>

        {/* Actions */}
        <div className="flex justify-end space-x-4 mt-4">
          <button type="button" onClick={() => setIsEditing(true)} className="px-4 py-2 bg-green-500 text-white rounded">Edit</button>
          <button type="button" onClick={handleUpdate} className="px-4 py-2 bg-blue-600 text-white rounded">Update</button>
          <button type="button" onClick={goBack} className="px-4 py-2 bg-gray-300 rounded">Go Back</button>
        </div>
      </form>
    </div>
  );
}
