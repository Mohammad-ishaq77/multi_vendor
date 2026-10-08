import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  PackageCheck,
  RefreshCw,
  Search,
  ShoppingBag,
} from "lucide-react";
import ShopkeeperShell from "../components/ShopkeeperShell";
import OrderCard from "../components/OrderCard";
import { useShopkeeper } from "../context/ShopkeeperContext";

const statusTabs = [
  "All",
  "New",
  "Accepted",
  "Preparing",
  "Ready for Pickup",
  "Picked Up",
  "Delivered",
  "Completed",
  "Cancelled",
];

const Orders = () => {
  const {
    orders,
    ordersLoading,
    ordersError,
    refreshOrders,
    actionError,
    updatingOrderId,
    updateOrderStatus,
    getNextStatus,
  } = useShopkeeper();
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const statusCounts = useMemo(
    () =>
      Object.fromEntries(
        statusTabs.map((tab) => [
          tab,
          tab === "All" ? orders.length : orders.filter((order) => order.status === tab).length,
        ])
      ),
    [orders]
  );

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesTab = activeTab === "All" || order.status === activeTab;
      const searchable = [
        order.id,
        order.customer,
        order.phone,
        order.paymentMethod,
        order.deliveryAddress,
        ...(order.items || []).map((item) => item.name),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesTab && (!query || searchable.includes(query));
    });
  }, [activeTab, orders, searchQuery]);

  const newOrders = statusCounts.New;
  const preparingOrders = statusCounts.Accepted + statusCounts.Preparing;
  const readyOrders = statusCounts["Ready for Pickup"] + statusCounts["Picked Up"];

  return (
    <ShopkeeperShell>
      <div className="w-full space-y-5 sm:space-y-6">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Shop management
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Orders
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Review customer purchases and keep every order moving.
            </p>
          </div>
          <button
            type="button"
            onClick={refreshOrders}
            disabled={ordersLoading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-wait disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw className={`h-4 w-4 ${ordersLoading ? "animate-spin" : ""}`} />
            {ordersLoading ? "Refreshing…" : "Refresh orders"}
          </button>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Order summary">
          <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-blue-700">
              <ShoppingBag className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-medium text-gray-500">All orders</p>
              <p className="text-xl font-bold text-gray-900">{orders.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-50 text-amber-700">
              <ClipboardList className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-medium text-gray-500">Needs attention</p>
              <p className="text-xl font-bold text-gray-900">{newOrders}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
              <PackageCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-medium text-gray-500">In progress / fulfillment</p>
              <p className="text-xl font-bold text-gray-900">{preparingOrders + readyOrders}</p>
            </div>
          </div>
        </section>

        {(ordersError || actionError) && (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {ordersError || actionError}
            </span>
            {ordersError && (
              <button
                type="button"
                onClick={refreshOrders}
                disabled={ordersLoading}
                className="shrink-0 font-semibold underline underline-offset-2 disabled:opacity-60"
              >
                Try again
              </button>
            )}
          </div>
        )}

        <section className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <label htmlFor="shopkeeper-order-search" className="sr-only">
            Search orders
          </label>
          <div className="relative max-w-xl">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="shopkeeper-order-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search order ID, customer, phone, product..."
              className="w-full rounded-md border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-50"
            />
          </div>

          <div
            className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
            role="tablist"
            aria-label="Filter orders by status"
          >
            {statusTabs.map((tab) => {
              const selected = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveTab(tab)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-md px-3.5 py-2 text-sm font-semibold transition ${
                    selected
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "border border-gray-200 bg-white text-gray-600 hover:border-emerald-200 hover:text-emerald-700"
                  }`}
                >
                  {tab}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[11px] ${
                      selected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {statusCounts[tab]}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section aria-live="polite" aria-busy={ordersLoading}>
          {ordersLoading && orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-gray-100 bg-white py-16 text-center shadow-sm">
              <RefreshCw className="mb-3 h-7 w-7 animate-spin text-emerald-600" />
              <p className="text-sm font-semibold text-gray-700">Loading your orders…</p>
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center rounded-lg border border-gray-100 bg-white px-5 py-16 text-center shadow-sm sm:py-20"
            >
              <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                {orders.length === 0 ? (
                  <ShoppingBag className="h-7 w-7" />
                ) : (
                  <CheckCircle2 className="h-7 w-7" />
                )}
              </span>
              <h2 className="text-lg font-bold text-gray-900">
                {orders.length === 0
                  ? "No orders yet"
                  : searchQuery || activeTab !== "All"
                    ? "No matching orders"
                    : "You’re all caught up"}
              </h2>
              <p className="mt-2 max-w-md text-sm text-gray-500">
                {orders.length === 0
                  ? "New customer orders will appear here as soon as they are placed."
                  : searchQuery || activeTab !== "All"
                    ? "Try another search or choose a different order status."
                    : "There are no orders to display right now."}
              </p>
              {orders.length > 0 && (searchQuery || activeTab !== "All") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveTab("All");
                  }}
                  className="mt-4 text-sm font-semibold text-emerald-700 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </motion.div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1 text-xs text-gray-500">
                <span>
                  Showing {filtered.length} of {orders.length} orders
                </span>
                {ordersLoading && <span>Updating…</span>}
              </div>
              <AnimatePresence mode="popLayout">
                {filtered.map((order, index) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    index={index}
                    onStatusUpdate={updateOrderStatus}
                    nextStatus={getNextStatus(order.status)}
                    isUpdating={updatingOrderId === order.id}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </div>
    </ShopkeeperShell>
  );
};

export default Orders;
