import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  IndianRupee,
  ClipboardList,
  Package,
  ArrowRight,
  ShoppingBag,
  Star,
  Zap,
  Plus,
  Tag,
} from "lucide-react";
import ShopkeeperShell from "../components/ShopkeeperShell";
import StatCard from "../components/StatCard";
import OrderCard from "../components/OrderCard";
import ShopStatus from "../components/ShopStatus";
import { useShopkeeper } from "../context/ShopkeeperContext";

const ShopkeeperDashboard = () => {
  const navigate = useNavigate();
  const { shop, orders, products, earnings, reviews, updateOrderStatus, getNextStatus, onboardingStep } = useShopkeeper();

  if (onboardingStep !== "approved") {
    navigate("/shopkeeper/onboarding");
    return null;
  }

  const recentOrders = orders.slice(0, 5);
  const totalProducts = products.length;
  const inStockProducts = products.filter((p) => p.available && p.stock > 0).length;

  const quickActions = [
    { label: "Add Product", icon: Plus, color: "from-emerald-500 to-teal-500", path: "/shopkeeper/products/add" },
    { label: "Create Offer", icon: Tag, color: "from-rose-500 to-pink-500", path: "/shopkeeper/offers/create" },
    { label: "View Orders", icon: ClipboardList, color: "from-blue-500 to-indigo-500", path: "/shopkeeper/orders" },
    { label: "Earnings", icon: IndianRupee, color: "from-violet-500 to-purple-500", path: "/shopkeeper/earnings" },
  ];

  return (
    <ShopkeeperShell>
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-600/20 mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Welcome back, {shop.name} 👋
            </h1>
            <p className="text-emerald-100 text-sm mt-1">
              Here's what's happening with your shop today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/shopkeeper/orders")}
              className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/30 transition-colors"
            >
              <ClipboardList className="w-4 h-4" />
              View Orders
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={IndianRupee} label="Today's Revenue" value={`₹${earnings.today.toLocaleString()}`} trend={12} trendUp color="emerald" />
        <StatCard icon={ClipboardList} label="Total Orders" value={orders.length} trend={8} trendUp color="blue" />
        <StatCard icon={Package} label="Products" value={totalProducts} trend={5} trendUp color="violet" />
        <StatCard icon={Star} label="Rating" value={shop.rating} trend={2} trendUp color="amber" />
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(action.path)}
                    className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center gap-2.5 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-gray-700">{action.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Recent Orders */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-900">Recent Orders</h2>
              <button
                onClick={() => navigate("/shopkeeper/orders")}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-3">
              {recentOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
                  <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No orders yet</p>
                </div>
              ) : (
                recentOrders.map((order, i) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    index={i}
                    onStatusUpdate={updateOrderStatus}
                    nextStatus={getNextStatus(order.status)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Sales Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-4">Sales Summary</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">This Month</p>
                <p className="text-lg font-bold text-gray-900">₹{earnings.thisMonth.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Last Month</p>
                <p className="text-lg font-bold text-gray-900">₹{earnings.lastMonth.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Avg. Order</p>
                <p className="text-lg font-bold text-gray-900">₹{earnings.averageOrderValue}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Completed</p>
                <p className="text-lg font-bold text-emerald-600">{earnings.completedOrders}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Pending Settlement</p>
                <p className="text-lg font-bold text-amber-600">₹{earnings.pendingSettlement.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">In Stock</p>
                <p className="text-lg font-bold text-blue-600">{inStockProducts}/{totalProducts}</p>
              </div>
            </div>
          </div>

          {/* Recent Reviews */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-900">Recent Reviews</h2>
              <button
                onClick={() => navigate("/shopkeeper/reviews")}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-3">
              {reviews.slice(0, 3).map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, j) => (
                        <Star
                          key={j}
                          className={`w-3.5 h-3.5 ${j < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-gray-900">{review.customer}</span>
                    <span className="text-xs text-gray-400 ml-auto">{review.date}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{review.comment}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ShopStatus />

          {/* Notifications */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div className="space-y-2">
              {[
                { text: "New order received", time: "2m ago", color: "bg-blue-500" },
                { text: "Order delivered successfully", time: "1h ago", color: "bg-emerald-500" },
                { text: "5-star review received", time: "3h ago", color: "bg-amber-500" },
              ].map((notif, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notif.color}`} />
                  <div>
                    <p className="text-xs font-medium text-gray-700">{notif.text}</p>
                    <p className="text-[0.6rem] text-gray-400 mt-0.5">{notif.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Top Products</h3>
            <div className="space-y-3">
              {products.slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                    {p.image ? (
                      <img src={p.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-gray-300" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{p.name}</p>
                    <p className="text-[0.6rem] text-gray-500">₹{p.price} &middot; {p.stock} in stock</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ShopkeeperShell>
  );
};

export default ShopkeeperDashboard;
