import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// If you have it, uncomment:
// import DebitnoteViewPage from "./DebitnoteViewPage.jsx";

const SummaryCard = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-sm text-gray-600">{label}</span>
    <span className="text-lg font-semibold text-gray-800">{String(value)}</span>
  </div>
);

const SaleOrderform = ({ handleCancel }) => {
  // -------------------------
  // API endpoints
  // -------------------------
  const warehousesBaseUrl =
    "https://fms-qkmw.onrender.com/fms/api/v0/warehouses";
  const itemsBaseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/items";
  const siteBaseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/sites";
  const customersBaseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/customers";
  const salesOrderUrl = "https://fms-qkmw.onrender.com/fms/api/v0/salesorders";



  // -------------------------
  // UI/loaders
  // -------------------------
  const [loading, setLoading] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [loadingSites, setLoadingSites] = useState(false);
  const [loadingDebitNotes, setLoadingDebitNotes] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);

  // -------------------------
  // Top-level choices
  // -------------------------
  const [customers, setDebitNotes] = useState([]);
  const [sites, setSites] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [items, setItems] = useState([]);

  const [selectedDebitNote, setSelectedDebitNote] = useState("");
  const [selectedSite, setSelectedSite] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  // -------------------------
  // Derived labels/helpers
  // -------------------------
  const getSiteId = (s) =>
    String(s?._id ?? s?.id ?? s?.siteId ?? s?.code ?? "");
  const getSiteLabel = (s) =>
    s?.code && s?.name
      ? `${s.code} ${s.name}`
      : s?.name ?? s?.code ?? getSiteId(s);

  const getWhId = (w) =>
    String(w?._id ?? w?.id ?? w?.warehouseId ?? w?.code ?? "");
  const getWhLabel = (w) =>
    [w?.code, w?.name].filter(Boolean).join(" ").trim() || w?._id || "Unnamed";

  // -------------------------
  // Form state
  // -------------------------
  const [form, setForm] = useState({
    site: "",
    warehouse: "",
    orderDate: "",
    createdOn: new Date().toLocaleString(),
    saleAgreementNo: "",
    purchaseRef: "",
    paymentTerms: "",
    deliveryMode: "",
    orderId: "",
  });

  const [remarks, setRemarks] = useState("");
  const status = "Draft";
  const [docId, setDocId] = useState("");
  const [debitnote, setDebitnote] = useState(null);
  const [viewingSaleId, setViewingSaleId] = useState(null);

  // One line-item fields
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0); // %
  const [tax, setTax] = useState(0); // %
  const [tcs, setTcs] = useState(0); // %
  const [charges, setCharges] = useState(0);
  const [advance, setAdvance] = useState(0);
  const [lineAmt, setLineAmt] = useState("0.00");

  // DebitNote preview card
  const [selectedDebitNoteDetails, setSelectedDebitNoteDetails] = useState({
    name: "",
    contactNum: "",
    currency: "",
    address: "",
    email: "",
  });

  // -------------------------
  // Small utilities
  // -------------------------
  const listFromApi = (res) =>
    Array.isArray(res?.data?.data)
      ? res.data.data
      : Array.isArray(res?.data)
      ? res.data
      : [];

  const withToast = async (label, runner, { setLoading: setLoadFn } = {}) => {
    const id = toast.loading(`${label}: loading…`);
    try {
      if (setLoadFn) setLoadFn(true);
      const result = await runner();
      toast.update(id, {
        render: `${label}: loaded successfully`,
        type: "success",
        isLoading: false,
        autoClose: 1500,
        closeOnClick: true,
      });
      return result;
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Something went wrong.";
      toast.update(id, {
        render: `${label}: ${msg}`,
        type: "error",
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
      });
      throw err;
    } finally {
      if (setLoadFn) setLoadFn(false);
    }
  };

  // -------------------------
  // Initial fetches
  // -------------------------
  useEffect(() => {
    const fetchSites = () =>
      withToast(
        "Sites",
        async () => {
          const res = await axios.get(siteBaseUrl);
          const list = listFromApi(res);
          setSites(list);
          return list;
        },
        { setLoading: setLoadingSites }
      );

    const fetchItems = () =>
      withToast(
        "Items",
        async () => {
          const res = await axios.get(itemsBaseUrl);
          const list = listFromApi(res);
          setItems(list);
          return list;
        },
        { setLoading: setLoadingItems }
      );

    const fetchDebitNotes = () =>
      withToast(
        "DebitNotes",
        async () => {
          const res = await axios.get(customersBaseUrl);
          const list = listFromApi(res);
          setDebitNotes(list);
          return list;
        },
        { setLoading: setLoadingDebitNotes }
      );

    // run in parallel
    Promise.allSettled([fetchSites(), fetchItems(), fetchDebitNotes()]).catch(
      () => {}
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------
  // Warehouses (refetch on site)
  // -------------------------
  useEffect(() => {
    const fetchWarehouses = () =>
      withToast(
        "Warehouses",
        async () => {
          const res = await axios.get(warehousesBaseUrl);
          const all = listFromApi(res);
          const filtered = all.filter((w) => {
            const sid = w?.site?._id || w?.siteId || w?.site || "";
            return String(sid) === String(selectedSite);
          });
          const finalList = filtered.length ? filtered : all;
          setWarehouses(finalList);
          return finalList;
        },
        { setLoading: setLoadingWarehouses }
      );

    if (selectedSite) {
      fetchWarehouses().catch(() => {});
    } else {
      setWarehouses([]);
    }
  }, [selectedSite]);

  // -------------------------
  // DebitNote details preview
  // -------------------------
  useEffect(() => {
    if (!selectedDebitNote) {
      setSelectedDebitNoteDetails({
        name: "",
        contactNum: "",
        currency: "",
        address: "",
        email: "",
      });
      return;
    }
    const c = customers.find((x) => String(x._id) === String(selectedDebitNote));
    setSelectedDebitNoteDetails({
      name: c?.name || "",
      contactNum: c?.contactNum || "",
      currency: c?.currency || "",
      address: c?.address || "",
      email: c?.email || "",
    });
  }, [selectedDebitNote, customers]);

  // -------------------------
  // Item pick → default numbers
  // -------------------------
  useEffect(() => {
    if (!selectedItem) return;
    setPrice(
      Number(
        selectedItem?.price ??
          selectedItem?.sellingPrice ??
          selectedItem?.mrp ??
          0
      ) || 0
    );
    setDiscount(Number(selectedItem?.discount ?? 0) || 0);
    setTax(Number(selectedItem?.tax ?? selectedItem?.gst ?? 0) || 0);
    setTcs(Number(selectedItem?.tcs ?? selectedItem?.tds ?? 0) || 0);
    setQuantity(Number(selectedItem?.quantity ?? 1) || 1);
  }, [selectedItem]);

  // -------------------------
  // Amount calculations (single row)
  // -------------------------
  const discountAmount =
    (Number(discount) * Number(quantity) * Number(price)) / 100;
  const amountBeforeTax = Number(quantity) * Number(price) - discountAmount;

  useEffect(() => {
    const beforeTax = amountBeforeTax;
    const taxAmount = (beforeTax * Number(tax)) / 100;
    const tcsAmount = (beforeTax * Number(tcs)) / 100;
    const total =
      beforeTax +
      taxAmount +
      tcsAmount +
      Number(charges || 0) -
      Number(advance || 0);
    setLineAmt(isNaN(total) ? "0.00" : total.toFixed(2));
  }, [quantity, price, discount, tax, tcs, charges, advance, amountBeforeTax]);

  // -------------------------
  // Handlers
  // -------------------------
  const handleSimpleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSelectSite = (id) => {
    setSelectedSite(id);
    setForm((prev) => ({ ...prev, site: id }));
    const label = getSiteLabel(
      sites.find((s) => String(getSiteId(s)) === String(id)) || {}
    );
    toast.success(`Site selected: ${label || id}`);
  };

  const onSelectWarehouse = (id) => {
    setForm((prev) => ({ ...prev, warehouse: id }));
    const label = getWhLabel(
      warehouses.find((w) => String(getWhId(w)) === String(id)) || {}
    );
    toast.success(`Warehouse selected: ${label || id}`);
  };

  const onSelectItem = (id) => {
    const sel = items.find((it) => String(it._id) === String(id));
    setSelectedItem(sel || null);
    if (sel) {
      const inferred =
        Number(sel.price ?? sel.sellingPrice ?? sel.mrp ?? 0) || 0;
      setPrice(inferred);
      toast.success(`Item selected: ${sel?.name || sel?._id}`);
    }
  };

  const onSelectDebitNote = (id) => {
    setSelectedDebitNote(id);
    const c = customers.find((x) => String(x._id) === String(id));
    toast.success(`DebitNote selected: ${c?.name || id}`);
  };

  const clean = (obj) =>
    Object.fromEntries(
      Object.entries(obj).filter(
        ([, v]) =>
          v !== "" &&
          v !== null &&
          v !== undefined &&
          !(typeof v === "number" && Number.isNaN(v))
      )
    );

  const handleCreate = async (e) => {
    e.preventDefault();

    // Validations
    if (!selectedDebitNote) {
      toast.warn("⚠️ DebitNote selection is required.");
      return;
    }
    if (!selectedItem?._id) {
      toast.warn("⚠️ Item selection is required.");
      return;
    }

    const lineTotal = Number(lineAmt || 0);
    const payloadRaw = {
      customer: selectedDebitNote,
      item: selectedItem._id || selectedItem.id || "",
      quantity: Number(quantity) || 1,
      price: Number(price) || 0,
      discount: Number(discount) || 0,
      remarks: remarks,
      tax: Number(tax) || 0,
      withholdingTax: Number(tcs) || 0,
      charges: Number(charges) || 0,
      advance: Number(advance) || 0,
      // salesAddress: salesAddress,
    };

    const payload = clean(payloadRaw);

    try {
      setLoading(true);
      const id = toast.loading("Creating Sales Order…");
      const { data } = await axios.post(salesOrderUrl, payload, {
        headers: { "Content-Type": "application/json" },
      });
      const newNum = data?.data?.orderNum;
      setDebitnote(newNum || null);
      setDocId(data?.data?._id || "");
      toast.update(id, {
        render: `Sales Order Created Successfully! Order Number: ${
          newNum || "N/A"
        }`,
        type: "success",
        isLoading: false,
        autoClose: 2500,
        closeOnClick: true,
      });
    } catch (error) {
      const msg =
        error?.response?.data?.message || "Failed to create Sales Order";
      toast.error(`Error: ${msg}`);
      // keep state so user can correct and resubmit
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (!docId) {
      toast.info("No document to view yet.");
      return;
    }
    setViewingSaleId(docId);
  };

  // If you have DebitnoteViewPage, this allows instant view after create.
  if (viewingSaleId) {
    return (
      <div>
        {/* <DebitnoteViewPage
          saleId={viewingSaleId}
          onClose={() => setViewingSaleId(null)}
        /> */}
        <div className="p-6 border rounded-lg">
          <p className="mb-4 text-sm text-gray-600">
            Replace this with your <code>DebitnoteViewPage</code> component.
          </p>
          <button
            onClick={() => setViewingSaleId(null)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Safe accessors for item fields
  const itemCode =
    selectedItem?.code || selectedItem?.itemCode || selectedItem?.sku || "";
  const itemDesc =
    selectedItem?.description || selectedItem?.desc || selectedItem?.name || "";
  const itemUnit =
    selectedItem?.unit || selectedItem?.uom || selectedItem?.unitName || "";

  return (
    <div className="">
      <ToastContainer />
      {/* Header */}
      <div className="flex justify-between ">
        <div className="flex items-center space-x-2">
        
          <h3 className="text-xl font-semibold">            Debit Note Details</h3>
        </div>
      </div>

      <form
        onSubmit={handleCreate}
        className="bg-white shadow-none rounded-lg divide-y divide-gray-200"
      >
        {/* Maintain */}
        <section className="p-6">
          <div className="flex flex-wrap w-full gap-2">
            <div className="p-2 h-17 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-6">
                <div className="flex flex-nowrap gap-2">
                  {debitnote ? (
                    <>
                      <button
                        type="button"
                        disabled
                        className="px-3 py-2 w-36 text-xs font-medium border border-gray-300 rounded-md bg-gray-200 cursor-not-allowed"
                      >
                        Create
                      </button>
                      <button
                        onClick={handleEdit}
                        type="button"
                        className="px-3 py-2 w-36 text-xs font-medium border border-gray-300 rounded-md bg-white hover:bg-gray-100"
                      >
                        Edit
                      </button>
                    </>
                  ) : (
                    <button
                      type="submit"
                      className="px-3 py-2 w-36 text-xs font-medium border border-gray-300 rounded-md bg-white hover:bg-gray-100"
                      disabled={loading}
                    >
                      {loading ? "Creating..." : "Create"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-3 py-2 w-36 text-xs font-medium text-red-600 bg-white border border-red-400 rounded-md hover:bg-red-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sale details */}
          <h2 className="text-lg font-medium text-gray-700 mb-4">
                      Debit Note Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">
               Debit Note ID
              </label>
              <input
                type="text"
                name="saleOrder"
               
                placeholder="Sale Order"
                className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                readOnly
              />
            </div> <div>
              <label className="block text-sm font-medium text-gray-600">
                Reference Transaction ID
              </label>
              <input
                type="text"
                readOnly
                className="w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>     <div>
              <label className="block text-sm font-medium text-gray-600">
                Issue Date & Time
              </label>
              <input
                type="datetime-local"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                DebitNote Account
              </label>
              <select
                value={selectedDebitNote}
                onChange={(e) => onSelectDebitNote(e.target.value)}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option value="">
                  {loadingDebitNotes ? "Loading…" : "Select DebitNote"}
                </option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {`${c.code} ${c.name}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-4 h-full">
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    DebitNote Name
                  </label>
                  <input
                    type="text"
                    value={selectedDebitNoteDetails.name}
                    placeholder="DebitNote Name"
                    className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                    readOnly
                  />
                </div>
  <div>
              <label className="block text-sm font-medium text-gray-600">
                Currency
              </label>
              <input
                type="text"
                value={selectedDebitNoteDetails.currency}
                placeholder="Currency"
                readOnly
                className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
     
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  DebitNote Address
                </label>
                <textarea
                  rows="4"
                  value={selectedDebitNoteDetails.address}
                  readOnly
                  className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>    {selectedDebitNoteDetails && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Reason
                  </label>
                  <input type="text" className="w-full p-2 border rounded" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Debit Note Status
                  </label>
                  <input
                    type="text"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
              </>
            )}
            </div>
            {/* <div>
              <label className="block text-sm font-medium text-gray-600">
                Contact Details
              </label>
              <input
                type="text"
                value={selectedDebitNoteDetails.contactNum}
                placeholder="Contact Number"
                className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                readOnly
              />
            </div> */}
          
            {/* <div>
              <label className="block text-sm font-medium text-gray-600">
                Sale Order no
              </label>
              <input
                type="text"
                value={selectedDebitNoteDetails.currency}
                placeholder="Currency"
                readOnly
                className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div> */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
           Total Debit Amount
              </label>
              <input
                type="text"
                value={selectedDebitNoteDetails.currency}
                placeholder="Currency"
                readOnly
                className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Order Date{" "}
              </label>
              <input
                type="text"
                value={selectedDebitNoteDetails.currency}
                placeholder="Currency"
                readOnly
                className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
            {/* <div>
              <label className="block text-sm font-medium text-gray-600">
                Created on
              </label>
              <input
                type="text"
                value={form.createdOn}
                readOnly
                className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div> */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-600">
                Order Status
              </label>
              <input
                type="text"
                value={status}
                className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                readOnly
              />
            </div> */}
            {/* Optional entries */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-600">
                Sale Agreement No (if applicable)
              </label>
              <input
                type="text"
                name="saleAgreementNo"
                value={form.saleAgreementNo}
                onChange={handleSimpleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div> */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-600">
                Purchase Reference No
              </label>
              <input
                type="text"
                name="purchaseRef"
                value={form.purchaseRef}
                onChange={handleSimpleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div> */}
           
            {/* <div>
              <label className="block text-sm font-medium text-gray-600">
                Delivery Mode
              </label>
              <input
                type="text"
                name="deliveryMode"
                value={form.deliveryMode}
                onChange={handleSimpleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div> */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Order Id
              </label>
              <input
                type="text"
                name="orderId"
                value={form.orderId}
                onChange={handleSimpleChange}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>
            {/* <div>
              <label className="block text-sm font-medium text-gray-600">
                  Posted Ledger Account
              </label>
              <input
                type="number"
                name="advance"
                value={advance}
                onChange={(e) => setAdvance(Number(e.target.value) || 0)}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                min="0"
                step="0.01"
              />
            </div> */}
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={form.remarks}
                // onChange={handleChange}
                placeholder="e.g. Sector 98, Noida, Uttar Pradesh, 201301"
                rows={4}
                className="mt-1 m w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              />
            </div>{" "}
             
          </div>
        </section>

        {/* Items table */}
        <section className="p-6">
          <div className="max-h-96 overflow-y-auto mt-4 border rounded-lg bg-white">
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    {[
                      "S.N",
                      "Item Code",
                      "Item Name",
                      "Description",
                      "Site",
                      "Warehouse",
                      "Qty",
                      "Unit",
                      "Price",
                      "Discount %",
                      "Amount",
                      "Tax %",
                      "TCS/TDS %",
                      "Total Amount",
                    ].map((header, index) => (
                      <th
                        key={index}
                        className="border border-gray-300 px-2 py-1 text-center"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  <tr key="purchase-order-row" className="hover:bg-gray-50">
                    <td className="border text-center px-2 py-1">1</td>

                    <td className="border px-2 py-1 text-center">{itemCode}</td>

                    <td className="border px-2 py-1">
                      <select
                        value={selectedItem?._id || ""}
                        disabled={loadingItems}
                        onChange={(e) => onSelectItem(e.target.value)}
                        className="w-full border rounded px-2 py-1"
                      >
                        <option value="">
                          {loadingItems ? "Loading…" : "Select Item"}
                        </option>
                        {items.map((itemOption) => (
                          <option key={itemOption._id} value={itemOption._id}>
                            {itemOption.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="border px-2 py-1 text-center">
                      <input
                        type="text"
                        value={itemDesc}
                        readOnly
                        className="w-full border rounded text-center px-2 py-1 bg-gray-100"
                      />
                    </td>

                    <td className="border px-2 py-1">
                      <select
                        value={selectedSite}
                        onChange={(e) => onSelectSite(e.target.value)}
                        className="mt-1 m w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
                      >
                        <option value="">
                          {loadingSites
                            ? "Loading…"
                            : sites.length
                            ? "Select Site"
                            : "No sites found"}
                        </option>
                        {sites.map((site) => (
                          <option key={getSiteId(site)} value={getSiteId(site)}>
                            {getSiteLabel(site)}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="border px-2 py-1">
                      <select
                        name="warehouse"
                        value={String(form.warehouse || "")}
                        onChange={(e) =>
                          onSelectWarehouse(String(e.target.value))
                        }
                        className="w-full border rounded px-2 py-1"
                        disabled={loadingWarehouses || !warehouses.length}
                      >
                        <option value="">
                          {loadingWarehouses ? "Loading…" : "Select Warehouse"}
                        </option>
                        {warehouses.map((w) => {
                          const id = getWhId(w);
                          return (
                            <option key={id} value={id}>
                              {getWhLabel(w)}
                            </option>
                          );
                        })}
                      </select>
                    </td>

                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full border rounded text-center px-2 py-1"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(Number(e.target.value) || 0)
                        }
                      />
                    </td>

                    <td className="border px-2 py-1 text-center">
                      <input
                        type="text"
                        value={itemUnit}
                        readOnly
                        className="w-full border rounded text-center px-2 py-1 bg-gray-100"
                      />
                    </td>

                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full border rounded text-center px-2 py-1"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value) || 0)}
                      />
                    </td>

                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full border rounded text-center px-2 py-1"
                        value={discount}
                        onChange={(e) =>
                          setDiscount(Number(e.target.value) || 0)
                        }
                      />
                    </td>

                    <td className="border px-2 py-1 text-center">
                      {isNaN(amountBeforeTax)
                        ? "0.00"
                        : amountBeforeTax.toFixed(2)}
                    </td>

                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full border rounded text-center px-2 py-1"
                        value={tax}
                        onChange={(e) => setTax(Number(e.target.value) || 0)}
                      />
                    </td>

                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full border rounded text-center px-2 py-1"
                        value={tcs}
                        onChange={(e) => setTcs(Number(e.target.value) || 0)}
                      />
                    </td>

                    <td className="border px-2 py-1 text-center">{lineAmt}</td>
                  </tr>
                </tbody>
              </table>

              {/* Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
                <SummaryCard label="Advance" value={advance} />
                <SummaryCard
                  label="Subtotal / line amount"
                  value={
                    isNaN(amountBeforeTax) ? "0.00" : amountBeforeTax.toFixed(2)
                  }
                />
                <SummaryCard label="Discount (%)" value={discount} />
                <SummaryCard label="Total (incl tax)" value={lineAmt} />
              </div>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="py-6 flex items-center justify-between">
          <div>
            <button
              type="button"
              onClick={() => {
                setSelectedDebitNote("");
                setSelectedItem(null);
                setQuantity(1);
                setPrice(0);
                setDiscount(0);
                setTax(0);
                setTcs(0);
                setCharges(0);
                setAdvance(0);
                setRemarks("");
                setSelectedSite("");
                setWarehouses([]);
                setForm((f) => ({
                  ...f,
                  site: "",
                  warehouse: "",
                  orderDate: "",
                  paymentTerms: "",
                  deliveryMode: "",
                  orderId: "",
                  purchaseRef: "",
                  saleAgreementNo: "",
                }));
                toast.info("Form reset");
              }}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Reset
            </button>
          </div>
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
              disabled={loading}
            >
              {loading ? "Creating…" : "Create"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SaleOrderform;
