import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Clock, IndianRupee, Store, User, Phone, Package, MessageSquare, Loader2, RefreshCw, CheckCircle, PackageCheck } from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";
import { useToast } from "../components/Toast";
import { deliveryService } from "../../../services/orderService";

export default function DeliveryDetails() {
  const { deliveryId: routeDeliveryId } = useParams();
  const navigate = useNavigate();
  const {
    availableDeliveries,
    activeDelivery,
    acceptDelivery,
    verifyPickup,
    completeDelivery,
    isOnline,
  } = useDeliveryPartner();
  const deliveryId = String(routeDeliveryId || activeDelivery?.id || "");
  const { addToast } = useToast();

  const listedDelivery =
    availableDeliveries.find((item) => String(item.id) === deliveryId) ||
    (String(activeDelivery?.id) === deliveryId ? activeDelivery : null);
  const [delivery, setDelivery] = useState(listedDelivery || null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [otp, setOtp] = useState("");

  const loadDelivery = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    if (!deliveryId) {
      setDelivery(null);
      setLoading(false);
      return;
    }

    try {
      const order = await deliveryService.order(deliveryId);
      const address = order.address || {};
      const shop = order.shop || {};
      const customer = order.customer || {};
      setDelivery({
        ...order,
        id: order.id,
        orderId: order.id,
        status: order.status || "ready_for_pickup",
        shopName: shop.name || "Shop details unavailable",
        shopAddress: [shop.address, shop.city, shop.state].filter(Boolean).join(", "),
        shopPhone: shop.phone || "",
        customerName: address.fullName || customer.name || "Customer",
        customerPhone: address.phone || customer.phone || "",
        customerAddress: [
          address.line1,
          address.line2,
          address.city,
          address.state,
          address.pincode,
        ].filter(Boolean).join(", "),
        customerInstructions: order.notes || "",
        items: (order.items || []).map((item, index) => ({
          id: item.id || `${order.id}-item-${index}`,
          name: item.name || "Item",
          quantity: Number(item.quantity) || 1,
          price: Number(item.price || 0),
        })),
        orderAmount: Number(order.totalAmount ?? order.subtotal ?? 0),
        deliveryFee: Number(order.deliveryFee || 0),
        partnerEarning: Number(
          order.assignment?.partnerEarning ??
            order.deliveryPartnerShare ??
            (Number(order.deliveryFee || 0) * 0.8)
        ),
        adminShare: Number(order.nearMartShare ?? (Number(order.deliveryFee || 0) * 0.2)),
        distance: order.deliveryDistance == null
          ? (order.distanceKm == null ? null : Number(order.distanceKm))
          : Number(order.deliveryDistance),
        estimatedTime: "25-30 mins",
      });
    } catch (error) {
      setLoadError(error?.message || "Could not load delivery details.");
      setDelivery(listedDelivery || null);
    } finally {
      setLoading(false);
    }
  }, [deliveryId, listedDelivery]);

  useEffect(() => {
    loadDelivery();
  }, [loadDelivery]);

  if (!delivery && loading) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-8 text-center">
        <Loader2 className="mb-3 h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-sm font-semibold text-gray-700">Loading delivery details...</p>
      </div>
    );
  }

  if (!delivery && loadError) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-8 text-center">
        <Package className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-sm font-semibold text-gray-700">Could not load this delivery</p>
        <p role="alert" className="mt-2 max-w-md text-sm text-rose-600">{loadError}</p>
        <div className="mt-5 flex gap-3">
          <button onClick={loadDelivery} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
          <button onClick={() => navigate("/delivery/available")} className="rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600">
            Back to Available
          </button>
        </div>
      </div>
    );
  }

  if (!delivery && !deliveryId) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-8 text-center">
        <Package className="mb-3 h-12 w-12 text-gray-300" />
        <p className="text-sm font-semibold text-gray-700">No delivery selected</p>
        <p className="mt-2 text-sm text-gray-500">Choose a delivery to view its pickup and delivery actions.</p>
        <button onClick={() => navigate("/delivery/available")} className="mt-5 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
          View Available Deliveries
        </button>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-8 text-center">
        <Package className="mb-3 h-12 w-12 text-gray-300" />
        <p className="text-sm font-semibold text-gray-700">Delivery not found</p>
        <p className="mt-2 text-sm text-gray-500">This delivery may have been accepted by another partner or removed.</p>
        <button onClick={() => navigate("/delivery/available")} className="mt-5 rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600">
          Back to Available
        </button>
      </div>
    );
  }

  const handleAccept = async () => {
    if (!isOnline) { addToast("You must be online to accept deliveries.", "error"); return; }
    if (activeDelivery) { addToast("You already have an active delivery.", "error"); return; }
    setAccepting(true);
    try {
      const result = await acceptDelivery(delivery.id);
      if (result.success) {
        setDelivery((current) => ({ ...current, status: "assigned" }));
        addToast(result.message, "success");
        navigate(`/delivery/details/${delivery.id}`);
      } else {
        addToast(result.message, "error");
      }
    } finally {
      setAccepting(false);
    }
  };

  const handlePickup = async () => {
    setUpdatingStatus(true);
    try {
      const result = await verifyPickup();
      addToast(result.message, result.success ? "success" : "error");
      if (result.success) {
        setDelivery((current) => ({ ...current, status: "out_for_delivery" }));
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCompleteDelivery = async () => {
    if (otp !== "1234") {
      addToast("Enter the valid 4-digit demo OTP: 1234.", "error");
      return;
    }

    setUpdatingStatus(true);
    try {
      const result = await completeDelivery();
      addToast(result.message, result.success ? "success" : "error");
      if (result.success) {
        setDelivery((current) => ({ ...current, status: "delivered" }));
        setOtp("");
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  const canAccept = isOnline && !activeDelivery && delivery.status === "ready_for_pickup";
  const isAssignedDelivery = String(activeDelivery?.id) === deliveryId;
  const assignmentStatus = activeDelivery?.assignment?.status;
  const canConfirmPickup = isAssignedDelivery && assignmentStatus === "assigned";
  const canConfirmDelivery =
    isAssignedDelivery && ["picked_up", "out_for_delivery"].includes(assignmentStatus);
  const earning = Number(delivery.partnerEarning ?? delivery.assignment?.partnerEarning ?? 0);
  const estimatedTime = delivery.estimatedTime || "25-30 mins";

  return (
    <div className="w-full space-y-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">{delivery.id}</h1>
            <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[0.65rem] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {delivery.status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </span>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-600">₹{delivery.partnerEarning}</p>
            <p className="text-xs text-gray-400">Your earning (80%)</p>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Route Visualization */}
          <div className="bg-gray-50 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <div className="flex-1 border-l-2 border-dashed border-gray-300 ml-1">
                <p className="text-xs text-gray-400 pl-3">{delivery.distance} km · {delivery.estimatedTime}</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-rose-500" />
            </div>
            <div className="flex justify-between mt-2 text-xs">
              <span className="text-emerald-600 font-medium">{delivery.shopName || "Pickup"}</span>
              <span className="text-rose-600 font-medium">{delivery.customerName || "Drop-off"}</span>
            </div>
          </div>

          {/* Shop Info */}
          <div>
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">Shop Information</h2>
            <div className="bg-gray-50 rounded-md p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700"><Store className="w-4 h-4 text-gray-400" /><span className="font-medium">{delivery.shopName}</span></div>
              <div className="flex items-center gap-2 text-sm text-gray-600"><MapPin className="w-4 h-4 text-gray-400" /><span>{delivery.shopAddress || "Shop address not provided"}</span></div>
              {delivery.shopPhone && <a href={`tel:${delivery.shopPhone}`} className="flex items-center gap-2 text-sm text-emerald-700 hover:underline"><Phone className="w-4 h-4 text-gray-400" />{delivery.shopPhone}</a>}
            </div>
          </div>

          {/* Customer Info */}
          <div>
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">Customer Information</h2>
            <div className="bg-gray-50 rounded-md p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700"><User className="w-4 h-4 text-gray-400" /><span className="font-medium">{delivery.customerName}</span></div>
              <div className="flex items-center gap-2 text-sm text-gray-600"><MapPin className="w-4 h-4 text-gray-400" /><span>{delivery.customerAddress || "Delivery address not provided"}</span></div>
              {delivery.customerPhone && <a href={`tel:${delivery.customerPhone}`} className="flex items-center gap-2 text-sm text-emerald-700 hover:underline"><Phone className="w-4 h-4 text-gray-400" />{delivery.customerPhone}</a>}
              {delivery.customerInstructions && (
                <div className="flex items-start gap-2 text-sm text-gray-600"><MessageSquare className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" /><span className="italic">"{delivery.customerInstructions}"</span></div>
              )}
            </div>
          </div>

          {/* Order Info */}
          <div>
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">Order Information</h2>
            <div className="bg-gray-50 rounded-md p-4">
              <div className="space-y-2 mb-3">
                {delivery.items.length ? delivery.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{item.name} × {item.quantity}</span>
                    <span className="text-gray-500">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                )) : <p className="text-sm text-gray-500">Order items unavailable.</p>}
              </div>
              <div className="border-t border-gray-200 pt-2 space-y-1">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Order Total</span><span className="font-medium text-gray-700">₹{delivery.orderAmount}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Delivery charge</span><span className="font-medium text-gray-700">₹{delivery.deliveryFee}</span></div>
                <div className="flex justify-between text-sm"><span className="text-emerald-600 font-semibold">Your earning (80%)</span><span className="font-bold text-emerald-600">₹{earning.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Admin/platform share (20%)</span><span className="font-medium text-gray-700">₹{Number(delivery.adminShare ?? 0).toFixed(2)}</span></div>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-md p-3 text-center">
              <MapPin className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-gray-900">{delivery.distance} km</p>
              <p className="text-[0.6rem] text-gray-400">Shop to customer</p>
            </div>
            <div className="bg-gray-50 rounded-md p-3 text-center">
              <Clock className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-gray-900">{estimatedTime}</p>
              <p className="text-[0.6rem] text-gray-400">Est. Time</p>
            </div>
            <div className="bg-gray-50 rounded-md p-3 text-center">
              <IndianRupee className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-gray-900">₹{delivery.deliveryFee}</p>
              <p className="text-[0.6rem] text-gray-400">Fee</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        {loadError && (
          <p role="alert" className="mx-5 mb-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Showing saved delivery information; latest details could not be refreshed: {loadError}
          </p>
        )}
        {(canConfirmPickup || canConfirmDelivery) && (
          <div className="border-t border-gray-100 p-5">
            {canConfirmPickup ? (
              <button
                onClick={handlePickup}
                disabled={updatingStatus}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60"
              >
                {updatingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackageCheck className="h-4 w-4" />}
                {updatingStatus ? "Updating..." : "Mark as Picked Up"}
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
                  <CheckCircle className="h-4 w-4" />
                  Picked up. Enter the customer&apos;s demo OTP to confirm delivery.
                </div>
                <label htmlFor="details-delivery-otp" className="block text-xs font-semibold uppercase tracking-wide text-gray-700">
                  Delivery OTP
                </label>
                <input
                  id="details-delivery-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={4}
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="Demo OTP: 1234"
                  className="w-full rounded-md border border-gray-200 px-4 py-3 text-center text-xl font-semibold tracking-[0.5em] text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  onClick={handleCompleteDelivery}
                  disabled={updatingStatus || otp.length !== 4}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60"
                >
                  {updatingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  {updatingStatus ? "Verifying..." : "Verify OTP and Mark Delivered"}
                </button>
              </div>
            )}
          </div>
        )}
        <div className="p-5 border-t border-gray-100 flex gap-3">
          <button onClick={() => navigate(-1)} className="flex-1 px-4 py-2.5 rounded-md text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all">
            Go Back
          </button>
          {canAccept && (
            <button onClick={handleAccept} disabled={accepting} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all disabled:cursor-wait disabled:opacity-60">
              {accepting ? <><Loader2 className="h-4 w-4 animate-spin" /> Accepting...</> : "Accept Delivery"}
            </button>
          )}
          {!isOnline && (
            <button disabled className="flex-1 px-4 py-2.5 rounded-md text-sm font-semibold text-gray-400 bg-gray-100 cursor-not-allowed">
              Go Online to Accept
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
