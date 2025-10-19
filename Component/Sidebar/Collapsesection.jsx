import React, { useState } from "react";

export default function CollapsibleSection({ id, title, children }) {
  const [hidden, setHidden] = useState(false);
  const sectionId = `section-${id}`;
  return (
    <div className="bg-white rounded-lg shadow p-3 border border-gray-200">
      <button
        onClick={() => setHidden((v) => !v)}
        className="w-full flex items-center justify-between text-left"
        aria-controls={sectionId}
        aria-expanded={!hidden}
        title={hidden ? "Expand section" : "Collapse section"}
      >
        <span className="font-semibold text-gray-800">{title}</span>
        <span className="text-gray-600">{hidden ? "▸" : "▾"}</span>
      </button>
      {!hidden && (
        <div id={sectionId} className="mt-3">
          {children}
        </div>
      )}
    </div>
  );
}
