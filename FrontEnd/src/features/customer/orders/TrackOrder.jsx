import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  Home,
  X,
} from "lucide-react";
import CustomerShell from "../components/CustomerShell";
import { useToast } from "../../../components/common/Toast";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { orderService } from "../../../services/orderService";
import { normalizeOrderStatus, orderStatusLabel } from "../../../utils/normalize";

const steps = [
  { key: "pending", label: "Order Placed", desc: "We received your order" },
  { key: "confirmed", label: "Confirmed by Shop", desc: "The shop confirmed your order" },
  { key: "preparing", label: "Preparing Order", desc: "Your items are being prepared" },
  { key: "ready_for_pickup", label: "Ready for Pickup", desc: "Your order is packed and ready" },
  { key: "out_for_delivery", label: "Picked Up / Out for Delivery", desc: "On the way to you" },
  { key: "delivered", label: "Delivered", desc: "Package received" },
];

const stepIcons = {
  pending: Package,
  confirmed: CheckCircle2,
  preparing: Clock,
  ready_for_pickup: Package,
  out_for_delivery: Truck,
  delivered: Home,
};

const statusConfig = {
  Delivered: "bg-emerald-500",
  Cancelled: "bg-rose-500",
  Processing: "bg-amber-500",
  "Ready for pickup": "bg-emerald-500",
  Shipped: "bg-emerald-500",
  "Out for Delivery": "bg-teal-600",
  Placed: "bg-gray-400",
};

const cancellationReasons = [
  "Ordered by mistake",
  "Found a better price",
  "Delivery is taking too long",
  "Want to change the delivery address",
  "Want to change the order or products",
  "Payment-related issue",
  "Ordered the wrong product",
  "Other",
];

const TrackOrder = () => {
  const { orderId } = useParams();
  const { showToast } = useToast();
  const [cancelling, setCancelling] = useState(false);
  const [showCancellationDialog, setShowCancellationDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancellationDetails, setCancellationDetails] = useState("");
  const [cancellationError, setCancellationError] = useState("");
  const { data: order, loading, error, reload } = useAsyncData(
    () => orderService.track(orderId),
    [orderId]
  );

  useEffect(() => {
    if (!order || ["delivered", "completed", "cancelled"].includes(normalizeOrderStatus(order.status))) {
      return undefined;
    }
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") reload();
    }, 8000);
    return () => window.clearInterval(intervalId);
  }, [order, reload]);

  if (loading) {
    return (
      <CustomerShell>
        <div className="max-w-2xl mx-auto px-6 py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-[#1B4332] border-t-transparent rounded-full animate-spin" />
        </div>
      </CustomerShell>
    );
  }

  if (!order || error) {
    return (
      <CustomerShell>
        <div className="max-w-2xl mx-auto px-6 py-12 text-center">
          <h2 className="text-xl font-bold text-[#0F172A] mb-2">
            Order Not Found
          </h2>
          <Link
            to="/customer/orders"
            className="text-[#1B4332] font-medium hover:underline"
          >
            ← Back to Orders
          </Link>
        </div>
      </CustomerShell>
    );
  }

  const displayStatus = orderStatusLabel(order.status);
  const normalizedStatus = normalizeOrderStatus(order.status);
  const statusForStep = normalizedStatus === "completed" ? "delivered" : normalizedStatus;
  const currentIndex = steps.findIndex((step) => step.key === statusForStep);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;
  const isCancelled = normalizedStatus === "cancelled";
  const canCancel = ["pending", "confirmed", "preparing"].includes(normalizedStatus);

  const cancelOrder = async (event) => {
    event.preventDefault();
    if (!cancellationReason || (cancellationReason === "Other" && !cancellationDetails.trim())) {
      setCancellationError(
        cancellationReason === "Other"
          ? "Please explain why you want to cancel this order."
          : "Select a reason to continue."
      );
      return;
    }
    setCancelling(true);
    setCancellationError("");
    try {
      await orderService.cancel(orderId, {
        reason: cancellationReason,
        details: cancellationDetails.trim(),
      });
      setShowCancellationDialog(false);
      showToast("Your order was cancelled successfully.");
      await reload();
    } catch (cancelError) {
      const message = cancelError?.message || "We could not cancel this order.";
      setCancellationError(message);
      showToast(message, "error");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <CustomerShell>
      <div className="w-full">
        {/* Back */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link
            to={`/customer/orders/${orderId}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#1B4332] hover:text-[#143728] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Order Details
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm mb-8 text-center"
        >
          <div
            className={`w-14 h-14 rounded-full ${
              statusConfig[displayStatus] || "bg-gray-400"
            } flex items-center justify-center mx-auto mb-4`}
          >
            <Truck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] mb-1">
            {displayStatus}
          </h1>
          <p className="text-sm text-[#64748B]">
            {order.orderId || order.id}
            {order.estimatedDelivery
              ? ` · Estimated: ${new Date(order.estimatedDelivery).toLocaleString()}`
              : " · Status updates automatically"}
          </p>
        </motion.div>

        {canCancel && (
          <div className="mb-6 flex justify-center">
            <button
              type="button"
              onClick={() => {
                setCancellationReason("");
                setCancellationDetails("");
                setCancellationError("");
                setShowCancellationDialog(true);
              }}
              disabled={cancelling}
              className="rounded-md border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel Order
            </button>
          </div>
        )}

        <AnimatePresence>
          {showCancellationDialog && (
            <motion.div
              className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onMouseDown={(event) => {
                if (event.target === event.currentTarget && !cancelling) {
                  setShowCancellationDialog(false);
                }
              }}
            >
              <motion.form
                role="dialog"
                aria-modal="true"
                aria-labelledby="cancel-order-title"
                onSubmit={cancelOrder}
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.18 }}
                className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-[#155c43]">
                      Order cancellation
                    </span>
                    <h2 id="cancel-order-title" className="mt-3 text-xl font-bold text-[#155c43]">
                      Why do you want to cancel this order?
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Your order will only be cancelled after you confirm.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCancellationDialog(false)}
                    disabled={cancelling}
                    className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
                    aria-label="Close cancellation dialog"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <fieldset className="mt-5">
                  <legend className="mb-2 text-sm font-semibold text-slate-800">
                    Select a reason
                  </legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {cancellationReasons.map((reason) => (
                      <label
                        key={reason}
                        className={`flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition ${
                          cancellationReason === reason
                            ? "border-emerald-600 bg-emerald-50 text-[#155c43]"
                            : "border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="cancellationReason"
                          value={reason}
                          checked={cancellationReason === reason}
                          onChange={() => {
                            setCancellationReason(reason);
                            setCancellationError("");
                          }}
                          className="h-4 w-4 accent-emerald-700"
                        />
                        <span>{reason}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <label htmlFor="cancellation-details" className="mt-4 block text-sm font-semibold text-slate-800">
                  Additional details <span className="font-normal text-slate-500">(optional)</span>
                </label>
                <textarea
                  id="cancellation-details"
                  value={cancellationDetails}
                  onChange={(event) => {
                    setCancellationDetails(event.target.value);
                    setCancellationError("");
                  }}
                  maxLength={1000}
                  rows={3}
                  required={cancellationReason === "Other"}
                  placeholder={cancellationReason === "Other" ? "Please explain your reason" : "Share anything else that may help us"}
                  className="mt-2 w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
                <div className="mt-1 flex justify-between gap-3 text-xs text-slate-500">
                  {cancellationReason === "Other" ? (
                    <span>An explanation is required.</span>
                  ) : (
                    <span>Up to 1,000 characters.</span>
                  )}
                  <span>{cancellationDetails.length}/1000</span>
                </div>

                {cancellationError && (
                  <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
                    {cancellationError}
                  </p>
                )}

                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCancellationDialog(false)}
                    disabled={cancelling}
                    className="rounded-lg border border-emerald-200 px-4 py-2.5 text-sm font-semibold text-[#155c43] transition hover:bg-emerald-50 disabled:opacity-60"
                  >
                    Keep My Order
                  </button>
                  <button
                    type="submit"
                    disabled={cancelling || !cancellationReason || (cancellationReason === "Other" && !cancellationDetails.trim())}
                    className="rounded-lg bg-[#155c43] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#104b36] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {cancelling ? "Cancelling..." : "Confirm Cancellation"}
                  </button>
                </div>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timeline */}
        {isCancelled ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-800">
            This order was cancelled and will not be delivered.
            {order.cancelReason && <p className="mt-2 font-semibold">Reason: {order.cancelReason}</p>}
            {order.cancelDetails && <p className="mt-1">{order.cancelDetails}</p>}
          </div>
        ) : <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-gray-100 rounded-lg p-6 sm:p-8 shadow-sm"
        >
          <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-8">
            Tracking History
          </h3>

          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-100" />

            {steps.map((step, index) => {
              const Icon = stepIcons[step.key];
              const isActive = index <= activeIndex;
              const isCurrent = index === activeIndex;

              return (
                <div key={step.key} className="relative flex gap-4 mb-8 last:mb-0">
                  {/* Icon */}
                  <div
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                      isActive
                        ? "bg-[#1B4332] border-[#1B4332] text-white"
                        : "bg-white border-gray-200 text-gray-300"
                    } ${isCurrent ? "ring-4 ring-[#1B4332]/10" : ""}`}
                  >
                    {isActive && !isCurrent ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>

                  {/* Text */}
                  <div className="pt-1">
                    <h4
                      className={`text-sm font-bold ${
                        isActive ? "text-[#0F172A]" : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </h4>
                    <p
                      className={`text-xs mt-0.5 ${
                        isActive ? "text-[#64748B]" : "text-gray-300"
                      }`}
                    >
                      {isCurrent
                        ? displayStatus === "Delivered" ? "Delivered" : "In progress..."
                        : isActive
                        ? "Completed"
                        : "Pending"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>}
      </div>
    </CustomerShell>
  );
};

export default TrackOrder;