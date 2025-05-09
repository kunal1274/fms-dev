import React from 'react'

const Item1 = () => {
     const [form, setForm] = useState({
    itemNum: "",
    name: "",
    type: "",
    price: "",
    unit: "",
    description: "",
    active: false,
  });
  const [items, setItems] = useState([]);
  const apiBase = "https://fms-qkmw.onrender.com/fms/api/v0/items";

  // Generate a new account number based on existing items
  const generateAccountNo = useCallback((list) => {
    const lastIndex = list
      .map((c) => parseInt(c.itemNum?.split("_")[1], 10))
      .filter((n) => !isNaN(n))
      .reduce((max, n) => Math.max(max, n), 0);
    return `ITEM_${String(lastIndex + 1).padStart(3, "0")}`;
  }, []);

  // Load existing items and set initial account number
  useEffect(() => {
    async function load() {
      try {
        const { data } = await axios.get(apiBase);
        const existing = data.data || [];
        setItems(existing);
        setForm((prev) => ({
          ...prev,
          itemNum: generateAccountNo(existing),
        }));
      } catch (error) {
        console.error(error);
        toast.error("Couldn’t fetch items");
      }
    }
    load();
  }, [apiBase, generateAccountNo]);

  // Generic change handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === "checkbox" ? checked : value;

    if (name === "name") {
      // Capitalize first letter
      val = val ? val.charAt(0).toUpperCase() + val.slice(1) : "";
    }

    if (name === "itemNum") {
      // Force uppercase
      val = val.toUpperCase();
    }

    if (name === "price") {
      // Allow only numeric and decimal
      if (!/^\d*\.?\d*$/.test(val)) return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  // Submit form
  const createItem = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(apiBase, form, {
        headers: { "Content-Type": "application/json" },
      });
      const newItem = data.data;
      toast.success("Item saved", {
        autoClose: 1200,
        onClose: handleCancel,
      });
      setItems((prev) => [...prev, newItem]);
      onSaved?.(newItem);
    } catch (err) {
      console.error("Error creating item:", err.response || err);
      const msg = err.response?.data?.message || "Couldn’t save item";
      toast.error(msg, { autoClose: 2000 });
    }
  };

  // Reset form (keeping new account no)
  const handleReset = () => {
    const newCode = generateAccountNo(items);
    setForm({
      itemNum: "",
      name: "",
      type: "",
      price: "",
      unit: "",
      description: "",
      active: false,
    });
  };

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
             <h3 className="text-xl font-semibold">Item Form</h3>
           </div>
         </div>
   
         <form
           onSubmit={createItem}
           className="bg-white shadow-none rounded-lg divide-y divide-gray-200"
         >
           {/* Business Details */}
           <section className="p-6">
             <h2 className="text-lg font-medium text-gray-700 mb-4">
               Items Details
             </h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div>
                 <label className="block text-sm font-medium text-gray-600"> 
                 Item Code
                 </label>
                 <input
                   name="itemcode"
                   
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
                   name="name"
                   value={form.name}
                   onChange={handleChange}
                   placeholder="eg-Item Name"
                   required
                   className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-600">
                   Item Number
                 </label>
                 <input
                   name="itemNum"
                   type="text"
                   placeholder="eg-Item Number"
                   value={form.itemNum}
                   onChange={handleChange}
                   required
                   className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-600">
                   Type
                 </label>
                 <select
                   name="type"
                   value={form.type}
                   onChange={handleChange}
                   className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                 >
                   <option value="">Select type</option>
                   <option value="Goods">Goods</option>
                   <option value="Services">Services</option>
                 </select>
               </div>{" "}
               <div>
                 <label className="block text-sm font-medium text-gray-600">
                   Price
                 </label>
                 <input
                   name="contactNum"
                   value={form.contactNum}
                   onChange={handleChange}
                   placeholder="eg- 99 "
                   required
                   className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                 />
               </div>{" "}
               <div>
                 <label className="block text-sm font-medium text-gray-600">
                   Unit
                 </label>
                 <select
                   name="unit"
                   value={form.unit}
                   onChange={handleChange}
                   className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                 >
                   <option value="">Select unit</option>
   
                   <option value="kgs">KG - Kilogram</option>
   
                   <option value="mt">Metric tonnes</option>
                   <option value="ea">Ea - Each</option>
                   <option value="lbs"> lbs - pounds</option>
   
                   <option value="hr">Hour</option>
                   <option value="min">Minutes</option>
                   <option value="qty">Quantity</option>
                 </select>
               </div>{" "}
               <div>
                 <label className="block text-sm font-medium text-gray-600">
                   Description
                 </label>
                 <textarea
                   name="address"
                   value={form.address}
                   onChange={handleChange}
                   placeholder="e.g. this is the item 560001"
                   rows={4}
                   required
                   className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                 />
               </div>{" "}
               <div className="flex items-center gap-2 ml-1">
                 <label className="text-blue-600 font-medium">Active</label>
                 <input
                   name="active"
                   checked={form.active}
                   onChange={handleChange}
                   type="checkbox"
                   className="w-4 h-4"
                 />
               </div>
             </div>
           </section>
   
           {/* Action Buttons */}
           <div className="py-6 flex items-center justify-between">
             {/* Left side - Reset Button */}
             <div>
               <button
                 type="button"
                 onClick={handleReset}
                 className="text-gray-500 hover:text-gray-700 text-sm"
               >
                 Reset
               </button>
             </div>
   
             {/* Right side - Go Back and Create Buttons */}
             <div className="flex gap-4">
               <button
                 type="button"
                 onClick={handleCancel}
                 className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
               >
                 Go Back
               </button>
               <button
                 type="submit"
                 className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
               >
                 Create
               </button>
             </div>
           </div>
         </form>
       </div>
  )
}

export default Item1