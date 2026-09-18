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
    { label: "Create Offer", icon: Tag, color: "from-emerald-600 to-emerald-500", path: "/shopkeeper/offers/create" },
    { label: "View Orders", icon: ClipboardList, color: "from-teal-600 to-emerald-600", path: "/shopkeeper/orders" },
    { label: "Earnings", icon: IndianRupee, color: "from-emerald-700 to-emerald-500", path: "/shopkeeper/earnings" },
  ];

  return (
    <ShopkeeperShell>
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-md p-3 text-white shadow-xl shadow-emerald-600/20 mb-3 sm:rounded-lg sm:p-6 sm:mb-6 lg:p-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div>
            <h1 className="text-base font-bold tracking-tight sm:text-xl lg:text-2xl">
              Welcome back, {shop.name}
            </h1>
            <p className="text-emerald-100 text-[10px] mt-0.5 sm:text-sm">
              Here's what's happening with your shop today.
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/shopkeeper/orders")}
              className="flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white px-2.5 py-1.5 rounded-md text-[10px] font-semibold hover:bg-white/30 transition-colors sm:gap-2 sm:px-4 sm:py-2.5 sm:rounded-md sm:text-sm"
            >
              <ClipboardList className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              View Orders
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 mb-3 sm:gap-4 sm:mb-6">
        <StatCard icon={IndianRupee} label="Today's Revenue" value={`₹${earnings.today.toLocaleString()}`} trend={12} trendUp color="emerald" />
        <StatCard icon={ClipboardList} label="Total Orders" value={orders.length} trend={8} trendUp color="emerald" />
        <StatCard icon={Package} label="Products" value={totalProducts} trend={5} trendUp color="emerald" />
        <StatCard icon={Star} label="Rating" value={shop.rating} trend={2} trendUp color="emerald" />
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-3 sm:gap-6">
        {/* Main Content */}
        <div className="space-y-3 sm:space-y-6">
          {/* Quick Actions */}
          <div>
            <h2 className="text-[10px] font-bold text-gray-900 mb-1.5 sm:text-sm sm:mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-3">
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
                    className="bg-white rounded-md border border-gray-100 p-2 flex flex-col items-center gap-1.5 shadow-sm hover:shadow-md transition-all sm:rounded-lg sm:p-4 sm:gap-2.5"
                  >
                    <div className={`h-8 w-8 rounded-md bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-md sm:h-11 sm:w-11 sm:rounded-md`}>
                      <Icon className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                    </div>
                    <span className="text-[9px] font-semibold text-gray-700 sm:text-xs">{action.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Recent Orders */}
          <div>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h2 className="text-xs font-bold text-gray-900 sm:text-sm">Recent Orders</h2>
              <button
                onClick={() => navigate("/shopkeeper/orders")}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-3">
              {recentOrders.length === 0 ? (
                <div className="bg-white rounded-md border border-gray-100 p-5 text-center shadow-sm sm:rounded-lg sm:p-8">
                  <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-2 sm:w-10 sm:h-10 sm:mb-3" />
                  <p className="text-xs text-gray-500 sm:text-sm">No orders yet</p>
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
          <div className="bg-white rounded-md border border-gray-100 p-2.5 shadow-sm sm:rounded-lg sm:p-5">
            <h2 className="text-[10px] font-bold text-gray-900 mb-2 sm:text-sm sm:mb-4">Sales Summary</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
              <div>
                <p className="text-[9px] text-gray-500 sm:text-xs">This Month</p>
                <p className="text-xs font-bold text-gray-900 sm:text-lg">₹{earnings.thisMonth.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 sm:text-xs">Last Month</p>
                <p className="text-xs font-bold text-gray-900 sm:text-lg">₹{earnings.lastMonth.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 sm:text-xs">Avg. Order</p>
                <p className="text-xs font-bold text-gray-900 sm:text-lg">₹{earnings.averageOrderValue}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 sm:text-xs">Completed</p>
                <p className="text-xs font-bold text-emerald-600 sm:text-lg">{earnings.completedOrders}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 sm:text-xs">Pending Settlement</p>
                <p className="text-xs font-bold text-amber-600 sm:text-lg">₹{earnings.pendingSettlement.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 sm:text-xs">In Stock</p>
                <p className="text-xs font-bold text-blue-600 sm:text-lg">{inStockProducts}/{totalProducts}</p>
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
                  className="bg-white rounded-md border border-gray-100 p-3 shadow-sm sm:rounded-lg sm:p-4"
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
        <div className="space-y-3 sm:space-y-6">
          <ShopStatus />

          {/* Notifications */}
          <div className="bg-white rounded-md border border-gray-100 p-2.5 shadow-sm sm:rounded-lg sm:p-5">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <h3 className="font-bold text-gray-900 text-[10px] sm:text-sm">Notifications</h3>
              <Zap className="w-3.5 h-3.5 text-amber-500 sm:w-4 sm:h-4" />
            </div>
            <div className="space-y-2">
              {[
                { text: "New order received", time: "2m ago", color: "bg-blue-500" },
                { text: "Order delivered successfully", time: "1h ago", color: "bg-emerald-500" },
                { text: "5-star review received", time: "3h ago", color: "bg-amber-500" },
              ].map((notif, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-md hover:bg-gray-50 transition-colors">
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
          <div className="bg-white rounded-md border border-gray-100 p-2.5 shadow-sm sm:rounded-lg sm:p-5">
            <h3 className="font-bold text-gray-900 text-[10px] mb-2 sm:text-sm sm:mb-4">Top Products</h3>
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
