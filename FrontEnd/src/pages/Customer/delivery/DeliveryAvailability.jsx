import React from "react";

const DeliveryAvailability = ({ available }) => {
  if (typeof available !== "boolean") {
    return null;
  }

  return (
    <div
      className={`flex items-center gap-2 text-sm font-medium ${
        available ? "text-emerald-700" : "text-red-600"
      }`}
    >
      <span className="text-base">
        {available ? "✓" : "✕"}
      </span>

      <span>
        {available
          ? "Delivery available in your area"
          : "Delivery not available in your area"}
      </span>
    </div>
  );
};

export default DeliveryAvailability;