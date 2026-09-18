import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, CheckCircle2, Clock, XCircle, RotateCcw, Search, ShieldCheck } from "lucide-react";
import CustomerShell from "../components/CustomerShell";
import orderService, { PAYMENTS_CHANGE_EVENT } from "../../../services/orderService";
import { RAZORPAY_CONFIG } from "../../../config/razorpay";

const statusStyles = {
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  captured: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  pending_verification: "bg-amber-50 text-amber-700 border-amber-200",
  created: "bg-emerald-50 text-[var(--color-primary-dark)] border-[var(--color-green-soft)]",
  failed: "bg-rose-50 text-rose-700 border-rose-200",
  cancelled: "bg-slate-50 text-slate-600 border-slate-200",
  refunded: "bg-teal-50 text-teal-700 border-teal-200",
};

const statusIcons = {
  paid: CheckCircle2,
  captured: CheckCircle2,
  pending: Clock,
  pending_verification: Clock,
  created: Clock,
  failed: XCircle,
  cancelled: XCircle,
  refunded: RotateCcw,
};

const Payments = () => {
  const [payments, setPayments] = useState(() => orderService.getPayments());
  const [query, setQuery] = useState("");

  useEffect(() => {
    const refresh = () => setPayments(orderService.getPayments());
    window.addEventListener(PAYMENTS_CHANGE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(PAYMENTS_CHANGE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return payments;
    return payments.filter((payment) =>
      [payment.id, payment.orderId, payment.method, payment.status, payment.razorpayPaymentId]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [payments, query]);

  const totals = useMemo(() => ({
    paid: payments.filter((p) => ["paid", "captured"].includes(p.status)).reduce((sum, p) => sum + Number(p.amount || 0), 0),
    pending: payments.filter((p) => ["pending", "pending_verification", "created"].includes(p.status)).length,
    failed: payments.filter((p) => ["failed", "cancelled"].includes(p.status)).length,
  }), [payments]);

  return (
    <CustomerShell>
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#14261f]">Payment History</h1>
          <p className="mt-1 text-sm text-gray-500">Razorpay transactions for your NearMart orders.</p>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: "Paid", value: `₹${totals.paid.toLocaleString("en-IN")}`, icon: CheckCircle2 },
            { label: "Pending", value: totals.pending, icon: Clock },
            { label: "Failed / Cancelled", value: totals.failed, icon: XCircle },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-green-bg)] text-[var(--color-primary)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="text-lg font-bold text-[#14261f]">{item.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by order, payment ID or method"
            className="w-full rounded-md border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-lg border border-gray-100 bg-white px-6 py-16 text-center">
            <CreditCard className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <h2 className="text-lg font-bold text-[#14261f]">No payments yet</h2>
            <p className="mt-1 text-sm text-gray-500">Pay for an order at checkout to see it here.</p>
            <Link to="/customer/products" className="mt-5 inline-flex rounded-md bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white">
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((payment) => {
              const Icon = statusIcons[payment.status] || CreditCard;
              return (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-[#14261f]">{payment.id}</p>
                      <p className="text-xs text-gray-500">Order {payment.orderId}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[payment.status] || statusStyles.pending}`}>
                      <Icon className="h-3.5 w-3.5" />
                      {String(payment.status || "pending").replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                    <div>
                      <p className="text-xs text-gray-400">Amount</p>
                      <p className="font-semibold text-[var(--color-primary)]">₹{Number(payment.amount || 0).toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Method</p>
                      <p className="font-medium capitalize">{payment.method || "Razorpay"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Gateway</p>
                      <p className="font-medium">{payment.verified ? "Verified" : RAZORPAY_CONFIG.companyName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Date</p>
                      <p className="font-medium">{payment.createdAt ? new Date(payment.createdAt).toLocaleString("en-IN") : "—"}</p>
                    </div>
                  </div>
                  {payment.razorpayPaymentId && (
                    <p className="mt-3 flex items-center gap-1 text-[11px] text-gray-400">
                      <ShieldCheck className="h-3 w-3" />
                      Razorpay ID {payment.razorpayPaymentId}
                    </p>
                  )}
                  {payment.orderId && (
                    <Link to={`/customer/orders/${payment.orderId}`} className="mt-3 inline-flex text-sm font-semibold text-[var(--color-primary)] hover:underline">
                      View order
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </CustomerShell>
  );
};

export default Payments;
