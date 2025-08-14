import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SummaryCard = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-sm text-gray-600">{label}</span>
    <span className="text-lg font-semibold text-gray-800">{String(value)}</span>
  </div>
);

export default function SaleOrderform({ handleCancel }) {
  // ===== API BASE URLS =====
  const warehousesBaseUrl =
    "https://fms-qkmw.onrender.com/fms/api/v0/warehouses";
  const itemsBaseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/items";
  const siteBaseUrl = "https://fms-qkmw.onrender.com/fms/api/v0/sites";
  // const ordersBaseUrl = "<YOUR_SALES_ORDERS_ENDPOINT>"; // TODO: replace when wiring submit

  // ===== UI/FORM STATE (kept from your structure; stubbed where needed) =====
  const [saleOrderNum, setSaleOrderNum] = useState("");
  const [loading, setLoading] = useState(false);

  // Customers (stubs so the file compiles — wire to your API when ready)
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState({
    name: "",
  });

  // Sites
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState("");
  const [loadingSites, setLoadingSites] = useState(false);

  // Warehouses
  const [warehouses, setWarehouses] = useState([]);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);

  // Items
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // One line-item fields
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0); // in %
  const [tax, setTax] = useState(0); // in %
  const [tcs, setTcs] = useState(0); // in %
  const [charges, setCharges] = useState(0);
  const [advance, setAdvance] = useState(0);

  // Generic form bag for misc fields
  const [form, setForm] = useState({
    site: "",
    warehouse: "",
    orderDate: "",
    paymentTerms: "",
    deliveryMode: "",
    orderId: "",
    purchaseRef: "",
    saleAgreementNo: "",
    remarks: "",
  });

  // ===== Helpers =====
  const getSiteId = (s) => s?._id || s?.id || String(s?.code || s?.name || "");
  const getSiteLabel = (s) =>
    [s?.code, s?.name].filter(Boolean).join(" ").trim() || s?._id || "Unnamed";

  const getWhId = (w) => w?._id || w?.id || String(w?.code || w?.name || "");
  const getWhLabel = (w) =>
    [w?.code, w?.name].filter(Boolean).join(" ").trim() || w?._id || "Unnamed";

  const itemCode = selectedItem?.code || selectedItem?.sku || "";
  const itemDesc = selectedItem?.description || selectedItem?.desc || "";
  const itemUnit = selectedItem?.unit || selectedItem?.uom || "";

  const gross = Number(quantity) * Number(price);
  const amountBeforeTax = Math.max(
    0,
    gross - gross * (Number(discount) / 100 || 0)
  );
  const taxAmt = amountBeforeTax * (Number(tax) / 100 || 0);
  const tcsAmt = amountBeforeTax * (Number(tcs) / 100 || 0);
  const lineAmtNum =
    amountBeforeTax +
    taxAmt +
    tcsAmt -
    Number(advance || 0) +
    Number(charges || 0);
  const lineAmt = isNaN(lineAmtNum) ? "0.00" : lineAmtNum.toFixed(2);

  // ===== Effects: fetch data =====
  useEffect(() => {
    // Sites
    const fetchSites = async () => {
      try {
        setLoadingSites(true);
        const res = await axios.get(siteBaseUrl);
        const list = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
          ? res.data
          : [];
        setSites(list);
        toast.success(`Sites loaded successfully (${list.length}).`);
      } catch (err) {
        console.error("Error loading sites:", err);
        toast.error(err?.response?.data?.message || "Failed to load sites");
      } finally {
        setLoadingSites(false);
      }
    };

    // Items
    const fetchItems = async () => {
      try {
        setLoadingItems(true);
        const res = await axios.get(itemsBaseUrl);
        const list = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
          ? res.data
          : [];
        setItems(list);
        toast.success(`Items loaded successfully (${list.length}).`);
      } catch (err) {
        console.error("Error loading items:", err);
        toast.error(err?.response?.data?.message || "Failed to load items");
      } finally {
        setLoadingItems(false);
      }
    };

    fetchSites();
    fetchItems();
  }, []);

  // Warehouses — refetch when site changes (try filter by site if possible)
  useEffect(() => {
    const fetchWarehouses = async () => {
      if (!selectedSite) {
        setWarehouses([]);
        return;
      }
      try {
        setLoadingWarehouses(true);
        const res = await axios.get(warehousesBaseUrl);
        const all = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
          ? res.data
          : [];

        // try to filter by site id if the schema carries it
        const filtered = all.filter((w) => {
          const sid = w?.site?._id || w?.siteId || w?.site || "";
          return String(sid) === String(selectedSite);
        });
        const finalList = filtered.length ? filtered : all; // fallback if API doesn't expose site link
        setWarehouses(finalList);
        toast.success(
          filtered.length
            ? `Warehouses for site loaded (${filtered.length}).`
            : `Warehouses loaded (${all.length}).`
        );
      } catch (err) {
        console.error("Error loading warehouses:", err);
        toast.error(
          err?.response?.data?.message || "Failed to load warehouses"
        );
      } finally {
        setLoadingWarehouses(false);
      }
    };

    fetchWarehouses();
  }, [selectedSite]);

  // ===== Handlers =====
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    toast.info("Edit mode toggled (demo)");
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Build a minimal payload (adjust to your backend contract)
      const payload = {
        customer: selectedCustomer || null,
        site: selectedSite || null,
        warehouse: form.warehouse || null,
        orderDate: form.orderDate || new Date().toISOString(),
        lines: [
          {
            item: selectedItem?._id || null,
            qty: quantity,
            price,
            discount,
            tax,
            tcs,
            charges,
            advance,
            amountBeforeTax,
            total: Number(lineAmtNum.toFixed(2)),
          },
        ],
        remarks: form.remarks || "",
      };

      // If you have a real endpoint, uncomment below and replace ordersBaseUrl
      // const res = await axios.post(ordersBaseUrl, payload);
      // const created = res?.data?.data || res?.data;

      // Demo success (remove when you wire real API)
      const fakeCode = `SO-${Date.now()}`;
      setSaleOrderNum(fakeCode);
      toast.success(`Order created successfully (${fakeCode}).`);
    } catch (err) {
      console.error("Create order failed:", err);
      toast.error(err?.response?.data?.message || "Create failed");
    } finally {
      setLoading(false);
    }
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

  // ===== Render =====
  return (
    <div className="">
      <ToastContainer />

      {/* Header */}
      <div className="flex justify-between ">
        <div className="flex items-center space-x-2">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
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
              </svg>
            </button>
          </div>
          <h3 className="text-xl font-semibold">Sale Order Form</h3>
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
                  {saleOrderNum ? (
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
            Sale Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Sale Order
              </label>
              <input
                type="text"
                name="saleOrder"
                value={saleOrderNum || ""}
                placeholder="Sale Order"
                className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Customer Account
              </label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
              >
                <option value="">
                  {loadingCustomers ? "Loading…" : "Select Customer"}
                </option>
                {customers.map((c) => (
                  <option key={c._id || c.id} value={c._id || c.id}>
                    {`${c.code || ""} ${c.name || c._id}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-4 h-full">
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={selectedCustomerDetails.name}
                    placeholder="Customer Name"
                    className="mt-1 w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Site
              </label>
              <select
                value={selectedSite}
                onChange={(e) => onSelectSite(e.target.value)}
                className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-200"
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Warehouse
              </label>
              <select
                name="warehouse"
                value={form.warehouse || ""}
                onChange={(e) => onSelectWarehouse(e.target.value)}
                className="mt-1 w-full p-2 border rounded"
                disabled={loadingWarehouses}
              >
                <option value="">
                  {loadingWarehouses
                    ? "Loading…"
                    : warehouses.length
                    ? "Select Warehouse"
                    : "No warehouses"}
                </option>
                {warehouses.map((w) => (
                  <option key={getWhId(w)} value={getWhId(w)}>
                    {getWhLabel(w)}
                  </option>
                ))}
              </select>
            </div>
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
                      "Item",
                      "Description",
                      "Qty",
                      "Unit",
                      "Price",
                      "Discount %",
                      "Amount",
                      "Tax %",
                      "TCS/TDS %",
                      "Total Amount",
                      "Site",
                      "Warehouse",
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

                    {/* Item select */}
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
                          <option
                            key={itemOption._id || itemOption.id}
                            value={itemOption._id || itemOption.id}
                          >
                            {itemOption.name ||
                              itemOption.code ||
                              itemOption._id}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Description */}
                    <td className="border px-2 py-1 text-center">
                      <input
                        type="text"
                        value={itemDesc}
                        readOnly
                        className="w-full border rounded text-center px-2 py-1 bg-gray-100"
                      />
                    </td>

                    {/* Qty */}
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        min="0"
                        className="w-full border rounded text-center px-2 py-1"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(Number(e.target.value) || 0)
                        }
                      />
                    </td>

                    {/* Unit */}
                    <td className="border px-2 py-1 text-center">
                      <input
                        type="text"
                        value={itemUnit}
                        readOnly
                        className="w-full border rounded text-center px-2 py-1 bg-gray-100"
                      />
                    </td>

                    {/* Price */}
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        min="0"
                        className="w-full border rounded text-center px-2 py-1"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value) || 0)}
                      />
                    </td>

                    {/* Discount % */}
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        min="0"
                        className="w-full border rounded text-center px-2 py-1"
                        value={discount}
                        onChange={(e) =>
                          setDiscount(Number(e.target.value) || 0)
                        }
                      />
                    </td>

                    {/* Amount before tax */}
                    <td className="border px-2 py-1 text-center">
                      {isNaN(amountBeforeTax)
                        ? "0.00"
                        : amountBeforeTax.toFixed(2)}
                    </td>

                    {/* Tax % */}
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        min="0"
                        className="w-full border rounded text-center px-2 py-1"
                        value={tax}
                        onChange={(e) => setTax(Number(e.target.value) || 0)}
                      />
                    </td>

                    {/* TCS/TDS % */}
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        min="0"
                        className="w-full border rounded text-center px-2 py-1"
                        value={tcs}
                        onChange={(e) => setTcs(Number(e.target.value) || 0)}
                      />
                    </td>

                    {/* Total */}
                    <td className="border px-2 py-1 text-center">{lineAmt}</td>

                    {/* Site */}
                    <td className="border px-2 py-1">
                      <select
                        value={String(selectedSite)}
                        onChange={(e) => onSelectSite(String(e.target.value))}
                        className="w-full border rounded px-2 py-1"
                        disabled={loadingSites || !sites.length}
                      >
                        <option value="">
                          {loadingSites
                            ? "Loading…"
                            : sites.length
                            ? "Select Site"
                            : "No sites"}
                        </option>
                        {sites.map((site) => (
                          <option key={getSiteId(site)} value={getSiteId(site)}>
                            {getSiteLabel(site)}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Warehouse */}
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
                          {loadingWarehouses
                            ? "Loading…"
                            : warehouses.length
                            ? "Select Warehouse"
                            : "No warehouses"}
                        </option>
                        {warehouses.map((w) => (
                          <option key={getWhId(w)} value={getWhId(w)}>
                            {getWhLabel(w)}
                          </option>
                        ))}
                      </select>
                    </td>
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
                setSelectedCustomer("");
                setSelectedItem(null);
                setQuantity(1);
                setPrice(0);
                setDiscount(0);
                setTax(0);
                setTcs(0);
                setCharges(0);
                setAdvance(0);
                setSelectedSite("");
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
                  remarks: "",
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
}
