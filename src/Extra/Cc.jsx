import React from 'react'

const Cc = ({ onAddNew, onView }) => { const [customerList, setCustomerList] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [sortBy, setSortBy] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  onst [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [summaryData, setSummaryData] = useState([]);

  // ——— Tabs state ———
  const tabs = ["Overview", "Orders", "Invoices"];
  const [activeTab, setActiveTab] = useState(tabs[0]);

  // Fetch metrics from your /api/customers/metrics endpoint
  const fetchMySummary = async ({ startDate, endDate }) => {
    try {
      const resp = await axios.get("/api/customers/metrics", {
        params: { from: startDate, to: endDate },
      });
      return resp.data.metrics || [];
    } catch (err) {
      console.error("Error fetching summary:", err);
      return [];
    }
  };

  // Called when user clicks “Apply” or “Refresh”
  const loadData = async () => {
    setLoading(true);
    const metrics = await fetchMySummary({ startDate, endDate });
    setSummaryData(metrics);
    setLoading(false);
  };

  // ——— Initial load: customers + optionally initial summary ———
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(baseUrl);
        const list = data.data || [];
        setCustomerList(list);
        setFilteredCustomers(list);
        // if you want a default summary on mount, you could call loadData() here
      } catch (err) {
        console.error(err);
        setMessage("Unable to load customers. Please try again later.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ——— Re-apply filters & sorting whenever inputs change ———
  useEffect(() => {
    let list = [...customerList];
    if (statusFilter) {
      list = list.filter((c) =>
        statusFilter === "active" ? c.active : !c.active
      );
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.customerAccountNo.toLowerCase().includes(term)
      );
    }
    if (sortBy) {
      if (sortBy === "name") list.sort((a, b) => a.name.localeCompare(b.name));
      if (sortBy === "accountAsc")
        list.sort((a, b) =>
          a.customerAccountNo.localeCompare(b.customerAccountNo)
        );
      if (sortBy === "accountDesc")
        list.sort((a, b) =>
          b.customerAccountNo.localeCompare(a.customerAccountNo)
        );
    }
    setFilteredCustomers(list);
  }, [customerList, sortBy, statusFilter, searchTerm]);

  // ——— Selection helpers ———
  const toggleSelectAll = (e) =>
    setSelectedCustomers(
      e.target.checked ? filteredCustomers.map((c) => c.customerAccountNo) : []
    );
  const handleCheckboxChange = (accountNo) =>
    setSelectedCustomers((prev) =>
      prev.includes(accountNo)
        ? prev.filter((x) => x !== accountNo)
        : [...prev, accountNo]
    );
  const resetFilters = () => {
    setSortBy("");
    setStatusFilter("");
    setSearchTerm("");
  };

  // ——— Loading / Error states ———
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Loading customers…
      </div>
    );
  }
 
  return (
    <div className="space-y-6">
         {/* — Header actions (e.g. Add new customer) — */}
         <div className="flex items-center justify-between">
           <h2 className="text-xl font-semibold">Customers</h2>
           <button
             onClick={onAddNew}
             className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
           >
             <FaPlus className="mr-2" /> Add New
           </button>
         </div>
   
         {/* — Summary Cards with Date Picker — */}
         <div className="bg-white rounded-md space-y-4 p-4">
           <div className="flex flex-col md:flex-row items-center md:space-x-4 space-y-2 md:space-y-0">
             <div className="flex items-center space-x-2">
               <label htmlFor="start" className="text-gray-700 text-sm">
                 From:
               </label>
               <input
                 id="start"
                 type="date"
                 value={startDate}
                 onChange={(e) => setStartDate(e.target.value)}
                 className="border rounded px-2 py-1 text-sm"
               />
             </div>
             <div className="flex items-center space-x-2">
               <label htmlFor="end" className="text-gray-700 text-sm">
                 To:
               </label>
               <input
                 id="end"
                 type="date"
                 value={endDate}
                 onChange={(e) => setEndDate(e.target.value)}
                 className="border rounded px-2 py-1 text-sm"
               />
             </div>
             <button
               onClick={loadData}
               disabled={loading}
               className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
             >
               {loading ? "Loading…" : "Apply"}
             </button>
           </div>
   
           <div className="flex flex-wrap items-center justify-between text-sm space-y-3 md:space-y-0 md:space-x-4">
             <div className="flex flex-wrap items-center space-x-4">
               {summaryData.length ? (
                 summaryData.map((item) => (
                   <div
                     key={item.label}
                     className="flex flex-col items-center justify-center w-36 p-3 bg-gray-50 rounded"
                   >
                     <span className="text-xl font-semibold">
                       {item.count ?? item.value}
                     </span>
                     <span className="mt-1 text-gray-600 text-xs text-center">
                       {item.label}
                     </span>
                   </div>
                 ))
               ) : (
                 <p className="text-gray-500 text-xs">No data to display.</p>
               )}
             </div>
             <button
               onClick={loadData}
               disabled={loading}
               className="text-red-500 hover:text-red-600 font-medium text-sm disabled:opacity-50"
             >
               {loading ? "…" : "Refresh"}
             </button>
           </div>
         </div>
   
         {/* — Filters / Sort Controls — */}
         <div className="bg-white rounded-lg p-4">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <div className="relative">
               <FaSortAmountDown className="absolute left-3 top-3 text-gray-400" />
               <select
                 value={sortBy}
                 onChange={(e) => setSortBy(e.target.value)}
                 className="w-full pl-10 pr-4 py-2 border rounded focus:ring-indigo-500"
               >
                 <option value="">Sort By</option>
                 <option value="name">Name</option>
                 <option value="accountAsc">Account ↑</option>
                 <option value="accountDesc">Account ↓</option>
               </select>
             </div>
             <div className="relative">
               <FaFilter className="absolute left-3 top-3 text-gray-400" />
               <select
                 value={statusFilter}
                 onChange={(e) => setStatusFilter(e.target.value)}
                 className="w-full pl-10 pr-4 py-2 border rounded focus:ring-indigo-500"
               >
                 <option value="">All Statuses</option>
                 <option value="active">Active</option>
                 <option value="inactive">Inactive</option>
               </select>
             </div>
             <div className="relative md:col-span-2">
               <input
                 type="text"
                 placeholder="Search by name or account…"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-4 pr-10 py-2 border rounded focus:ring-indigo-500"
               />
               <FaSearch className="absolute right-3 top-3 text-gray-400" />
             </div>
           </div>
           <div className="mt-4 text-right">
             <button
               onClick={resetFilters}
               className="text-gray-600 hover:text-gray-800 font-medium"
             >
               Reset Filters
             </button>
           </div>
         </div>
   
         {/* — Tabs — */}
         {/* Option A: use your NavTabs component if you modify it to accept dynamic tabs */}
         {false && (
           <NavTabs tabs={tabs} activeTab={activeTab} onTabClick={setActiveTab} />
         )}
   
         {/* Option B: inline */}
         <nav className="w-full bg-white p-4 border-b">
           <ul className="flex space-x-6">
             {tabs.map((tab) => (
               <li
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`cursor-pointer pb-2 ${
                   activeTab === tab
                     ? "text-green-600 border-b-2 border-green-600"
                     : "text-gray-600 hover:text-gray-800"
                 }`}
               >
                 {tab}
               </li>
             ))}
           </ul>
         </nav>
   
         {/* — Overview Table — */}
         {activeTab === "Overview" && (
           <div className="bg-white rounded-2xl overflow-hidden">
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200">
                 <caption className="sr-only">Customer List</caption>
                 <thead className="bg-gray-100 sticky top-0">
                   <tr>
                     <th className="px-6 py-3">
                       <input
                         type="checkbox"
                         aria-label="Select all customers"
                         onChange={toggleSelectAll}
                         checked={
                           filteredCustomers.length > 0 &&
                           selectedCustomers.length === filteredCustomers.length
                         }
                         className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                       />
                     </th>
                     {[
                       "Account No.",
                       "Name",
                       "Address",
                       "Contact",
                       "Currency",
                       "Registration No.",
                       "PAN",
                       "Active",
                     ].map((heading) => (
                       <th
                         key={heading}
                         className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                       >
                         {heading}
                       </th>
                     ))}
                   </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                   {filteredCustomers.length ? (
                     filteredCustomers.map((customer, idx) => (
                       <tr
                         key={customer.customerAccountNo}
                         className={`cursor-pointer hover:bg-gray-50 ${
                           idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                         }`}
                       >
                         <td className="px-6 py-4 text-center">
                           <input
                             type="checkbox"
                             checked={selectedCustomers.includes(
                               customer.customerAccountNo
                             )}
                             onChange={() =>
                               handleCheckboxChange(customer.customerAccountNo)
                             }
                           />
                         </td>
                         <td
                           className="px-6 py-4 text-indigo-600 font-medium"
                           onClick={() => onView(customer.customerAccountNo)}
                         >
                           {customer.customerAccountNo}
                         </td>
                         <td className="px-6 py-4 text-sm">{customer.name}</td>
                         <td className="px-6 py-4 text-sm break-words">
                           {customer.customerAddress}
                         </td>
                         <td className="px-6 py-4 text-sm">
                           {customer.contactNo}
                         </td>
                         <td className="px-6 py-4 text-sm">{customer.currency}</td>
                         <td className="px-6 py-4 text-sm">
                           {customer.registrationNo}
                         </td>
                         <td className="px-6 py-4 text-sm">{customer.pan}</td>
                         <td className="px-6 py-4 text-sm">
                           <span
                             className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${
                               customer.active
                                 ? "bg-green-100 text-green-800"
                                 : "bg-red-100 text-red-800"
                             }`}
                           >
                             {customer.active ? "Yes" : "No"}
                           </span>
                         </td>
                       </tr>
                     ))
                   ) : (
                     <tr>
                       <td
                         colSpan={9}
                         className="px-6 py-8 text-center text-sm text-gray-500"
                       >
                         No customers found
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
           </div>
         )}
   
         {/* — Placeholder tabs — */}
         {activeTab === "Orders" && (
           <div className="p-6 text-gray-600">Orders view coming soon.</div>
         )}
         {activeTab === "Invoices" && (
           <div className="p-6 text-gray-600">Invoices view coming soon.</div>
         )}
       </div>
  )
}

export default Cc