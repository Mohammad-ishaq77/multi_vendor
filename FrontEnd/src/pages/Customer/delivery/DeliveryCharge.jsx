import React from "react";

const DeliveryCharge = ({ deliveryCharge, available }) => {
  if (!available) {
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Delivery charge
        </span>

        <span className="text-sm font-semibold text-red-600">
          Not available
        </span>
      </div>
    );
  }

  if (
    deliveryCharge === null ||
    typeof deliveryCharge === "undefined" ||
    !Number.isFinite(Number(deliveryCharge))
  ) {
    return null;
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">
        Delivery charge
      </span>

      <span className="text-base font-semibold text-gray-900">
        ₹{Number(deliveryCharge).toFixed(0)}
      </span>
    </div>
  );
};

export default DeliveryCharge;