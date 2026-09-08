import React from "react";

const DeliveryDistance = ({ distanceKm }) => {
  if (
    distanceKm === null ||
    typeof distanceKm === "undefined" ||
    !Number.isFinite(Number(distanceKm))
  ) {
    return null;
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">
        Delivery distance
      </span>

      <span className="text-sm font-semibold text-gray-900">
        {Number(distanceKm).toFixed(1)} KM
      </span>
    </div>
  );
};

export default DeliveryDistance;