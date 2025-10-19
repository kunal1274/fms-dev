import React from "react";

export default function PageFrame({ title, children }) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-gray-900">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
