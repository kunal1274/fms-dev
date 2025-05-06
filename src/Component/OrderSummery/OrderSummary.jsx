import React, { useState, useEffect } from "react";
import axios from "axios";

const OrderSummary = ({
  fetchUrl, // e.g. "/api/orders/summary"
  fetchSummary, // or async ({ startDate, endDate }) => [...]
  initialFilters = {}, // here you could seed startDate/endDate
}) => {
  // Date filter state
  const [startDate, setStartDate] = useState(initialFilters.startDate || "");
  const [endDate, setEndDate] = useState(initialFilters.endDate || "");

  // The summary data
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Central loader
  const loadData = async () => {
    setLoading(true);
    try {
      let data;
      if (fetchSummary) {
        // use custom loader
        data = await fetchSummary({ startDate, endDate });
      } else if (fetchUrl) {
        // hit the provided URL with date params
        const resp = await axios.get(fetchUrl, {
          params: { startDate, endDate },
        });
        data = resp.data.data;
      } else {
        console.warn("OrderSummary: no fetchUrl or fetchSummary provided");
        data = [];
      }
      setSummaryData(data);
    } catch (err) {
      console.error("Error loading order summary:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="bg-white rounded-md space-y-4">
      {/* Date range picker */}
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
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50"
        >
          {loading ? "Loading…" : "Apply"}
        </button>
      </div>

      {/* Summary cards + Refresh */}
      <div className="flex flex-wrap items-center justify-between text-sm space-y-3 md:space-y-0 md:space-x-4">
        {/* Status cards */}
        <div className="flex flex-wrap items-center space-x-4">
          {summaryData.map((item) => (
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
          ))}
          {summaryData.length === 0 && !loading && (
            <p className="text-gray-500 text-xs">No data to display.</p>
          )}
        </div>

        {/* Refresh */}
        <button
          onClick={loadData}
          disabled={loading}
          className="text-red-500 hover:text-red-600 font-medium text-sm disabled:opacity-50"
        >
          {loading ? "…" : "Refresh"}
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;
