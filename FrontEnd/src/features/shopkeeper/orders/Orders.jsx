import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ClipboardList } from "lucide-react";
import ShopkeeperShell from "../components/ShopkeeperShell";
import OrderCard from "../components/OrderCard";
import { useShopkeeper } from "../context/ShopkeeperContext";

const statusTabs = ["All", "New", "Accepted", "Preparing", "Ready for Pickup", "Delivered", "Completed", "Cancelled"];

const Orders = () => {
  const { orders, updateOrderStatus, getNextStatus } = useShopkeeper();
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = orders.filter((o) => {
    const matchesTab = activeTab === "All" || o.status === activeTab;
    const matchesSearch = !searchQuery || o.id.toLowerCase().includes(searchQuery.toLowerCase()) || o.customer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const statusCounts = {};
  statusTabs.forEach((tab) => {
    statusCounts[tab] = tab === "All" ? orders.length : orders.filter((o) => o.status === tab).length;
  });

  return (
    <ShopkeeperShell>
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Orders</h1>
            <p className="text-xs text-gray-500 mt-0.5">{orders.length} total orders</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order ID or customer..."
              className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-3 mb-5 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {statusTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {tab}
              {statusCounts[tab] > 0 && (
                <span className={`ml-1.5 text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  {statusCounts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-16 sm:py-24">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mb-6 border border-gray-100">
              <ClipboardList className="w-11 h-11 text-gray-300" />
            </motion.div>
            <h2 className="text-xl font-bold text-gray-900">No orders found</h2>
            <p className="text-sm text-gray-500 mt-2 max-w-xs text-center">
              {searchQuery ? "Try adjusting your search." : "Orders will appear here when customers place them."}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((order, i) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  index={i}
                  onStatusUpdate={updateOrderStatus}
                  nextStatus={getNextStatus(order.status)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </ShopkeeperShell>
  );
};

export default Orders;
