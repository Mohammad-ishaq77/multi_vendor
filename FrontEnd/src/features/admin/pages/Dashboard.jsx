import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Store,
  Truck,
  ShoppingBag,
  CalendarCheck,
  IndianRupee,
  ClipboardCheck,
  Navigation,
  ArrowUpRight,
  ShoppingCart,
  CreditCard,
  FileText,
  UserCheck,
} from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import StatCard from "../components/StatCard";
import ActivityCard from "../components/ActivityCard";
import ApprovalCard from "../components/ApprovalCard";
import OrderStatusCard from "../components/OrderStatusCard";
import RevenueCard from "../components/RevenueCard";
import PageTransition from "../components/PageTransition";

const statusBadge = {
  pending: "bg-[var(--color-green-bg)] text-[var(--color-primary-dark)] border border-[var(--color-green-soft)]",
  confirmed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  preparing: "bg-teal-50 text-teal-700 border border-teal-200",
  ready_for_pickup: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  out_for_delivery: "bg-[var(--color-green-bg)] text-[var(--color-primary)] border border-[var(--color-green-soft)]",
  delivered: "bg-green-50 text-green-700 border border-green-200",
  completed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  cancelled: "bg-slate-50 text-slate-600 border border-slate-200",
};

const quickActions = [
  { label: "Review Shop Approvals", icon: Store, route: "/admin/approvals/shopkeepers", color: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" },
  { label: "Review Delivery Partners", icon: Truck, route: "/admin/approvals/delivery-partners", color: "bg-teal-50 text-teal-600 hover:bg-teal-100" },
  { label: "View Orders", icon: ShoppingCart, route: "/admin/orders", color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
  { label: "Monitor Deliveries", icon: Navigation, route: "/admin/deliveries", color: "bg-[var(--color-green-bg)] text-[var(--color-primary)] hover:bg-[var(--color-green-soft)]" },
  { label: "View Payments", icon: CreditCard, route: "/admin/payments", color: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" },
  { label: "View Reports", icon: FileText, route: "/admin/reports", color: "bg-teal-50 text-teal-700 hover:bg-teal-100" },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function formatCurrency(amount) {
  if (amount == null) return "₹0";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

function getWeekDates() {
  const dates = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(d);
  }
  return dates;
}

function isSameDay(d1, d2) {
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const {
    customers,
    shopkeepers,
    deliveryPartners,
    shops,
    orders,
    recentActivities,
    approvals,
  } = useAdmin();

  const todayOrders = useMemo(
    () => orders.filter((o) => isToday(o.createdAt)),
    [orders]
  );

  const todayRevenue = useMemo(
    () =>
      todayOrders.reduce(
        (sum, o) => sum + (o.paymentStatus === "paid" ? o.totalAmount : 0),
        0
      ),
    [todayOrders]
  );

  const activeDeliveries = useMemo(
    () => orders.filter((o) => o.status === "out_for_delivery").length,
    [orders]
  );

  const pendingShopApprovals = useMemo(
    () => approvals.filter((a) => a.type === "shopkeeper" && a.status === "pending"),
    [approvals]
  );

  const pendingDeliveryApprovals = useMemo(
    () => approvals.filter((a) => a.type === "delivery_partner" && a.status === "pending"),
    [approvals]
  );

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 8),
    [orders]
  );

  const revenueData = useMemo(() => {
    const weekDates = getWeekDates();
    const weeklyBreakdown = weekDates.map((date) => {
      const dayTotal = orders
        .filter(
          (o) =>
            o.paymentStatus === "paid" &&
            o.createdAt &&
            isSameDay(new Date(o.createdAt), date)
        )
        .reduce((sum, o) => sum + o.totalAmount, 0);
      return {
        label: date.toLocaleDateString("en-IN", { weekday: "short" }),
        amount: dayTotal,
      };
    });

    const todayTotal = todayRevenue;

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const thisWeek = orders
      .filter(
        (o) =>
          o.paymentStatus === "paid" &&
          o.createdAt &&
          new Date(o.createdAt) >= weekStart
      )
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const thisMonth = orders
      .filter(
        (o) =>
          o.paymentStatus === "paid" &&
          o.createdAt &&
          new Date(o.createdAt) >= monthStart
      )
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return { today: todayTotal, thisWeek, thisMonth, weeklyBreakdown };
  }, [orders, todayRevenue]);

  const formattedActivities = useMemo(
    () =>
      recentActivities.slice(0, 8).map((a) => ({
        id: a.id,
        type: a.type,
        text: a.message,
        time: a.timestamp,
      })),
    [recentActivities]
  );

  const shopkeeperApprovalItems = useMemo(
    () =>
      pendingShopApprovals.slice(0, 3).map((a) => ({
        id: a.id,
        name: a.applicantName,
        email: a.email,
        date: a.appliedAt,
      })),
    [pendingShopApprovals]
  );

  const deliveryApprovalItems = useMemo(
    () =>
      pendingDeliveryApprovals.slice(0, 3).map((a) => ({
        id: a.id,
        name: a.applicantName,
        email: a.email,
        date: a.appliedAt,
      })),
    [pendingDeliveryApprovals]
  );

  return (
    <PageTransition>
      <div className="space-y-10 sm:space-y-12">
        {/* ── Greeting Header ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "#14261f" }}>
            {getGreeting()}, Admin
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Here's what's happening across your marketplace today.
          </p>
        </motion.div>

        {/* ── Primary Statistics Row ──────────────────────────────────────── */}
        <section>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <StatCard
              icon={<Users size={22} />}
              label="Total Customers"
              value={customers.length}
              accent="emerald"
              trend="+12%"
              delay={0}
            />
            <StatCard
              icon={<Store size={22} />}
              label="Total Shopkeepers"
              value={shopkeepers.length}
              accent="blue"
              trend="+5%"
              delay={1}
            />
            <StatCard
              icon={<Truck size={22} />}
              label="Delivery Partners"
              value={deliveryPartners.length}
              accent="amber"
              trend="+8%"
              delay={2}
            />
            <StatCard
              icon={<ShoppingBag size={22} />}
              label="Total Shops"
              value={shops.length}
              accent="violet"
              delay={3}
            />
            <StatCard
              icon={<CalendarCheck size={22} />}
              label="Today's Orders"
              value={todayOrders.length}
              accent="emerald"
              delay={4}
            />
            <StatCard
              icon={<IndianRupee size={22} />}
              label="Today's Revenue"
              value={formatCurrency(todayRevenue)}
              accent="blue"
              delay={5}
            />
            <StatCard
              icon={<ClipboardCheck size={22} />}
              label="Pending Shop Approvals"
              value={pendingShopApprovals.length}
              accent="amber"
              delay={6}
            />
            <StatCard
              icon={<UserCheck size={22} />}
              label="Pending Delivery Approvals"
              value={pendingDeliveryApprovals.length}
              accent="violet"
              delay={7}
            />
            <StatCard
              icon={<Navigation size={22} />}
              label="Active Deliveries"
              value={activeDeliveries}
              accent="rose"
              delay={8}
            />
          </div>
        </section>

        {/* ── Revenue + Order Status ──────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <RevenueCard revenue={revenueData} />
          <OrderStatusCard orders={orders} />
        </section>

        {/* ── Approval Queue ──────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ApprovalCard
            title="Shopkeeper Approvals"
            count={pendingShopApprovals.length}
            items={shopkeeperApprovalItems}
            type="shopkeeper"
          />
          <ApprovalCard
            title="Delivery Partner Approvals"
            count={pendingDeliveryApprovals.length}
            items={deliveryApprovalItems}
            type="delivery"
          />
        </section>

        {/* ── Recent Orders ───────────────────────────────────────────────── */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 pb-0">
              <h3 className="text-lg font-bold" style={{ color: "#14261f" }}>
                Recent Orders
              </h3>
              <button
                onClick={() => navigate("/admin/orders")}
                className="text-xs font-semibold text-[#155c43] hover:underline flex items-center gap-1"
              >
                View All <ArrowUpRight size={12} />
              </button>
            </div>

            <div className="overflow-x-auto mt-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Shop
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-gray-400">
                        No orders found
                      </td>
                    </tr>
                  )}
                  {recentOrders.map((order, idx) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.25, delay: idx * 0.03 }}
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs font-semibold text-[#155c43]">
                          {order.id}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-medium" style={{ color: "#14261f" }}>
                          {order.customerName}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className="text-gray-500">{order.shopName}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="font-semibold" style={{ color: "#14261f" }}>
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize ${
                            statusBadge[order.status] || "bg-gray-50 text-gray-600 border border-gray-200"
                          }`}
                        >
                          {order.status?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right hidden sm:table-cell">
                        <span className="text-xs text-gray-400">
                          {formatDate(order.createdAt)}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </section>

        {/* ── Recent Activity + Quick Actions ─────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ActivityCard activities={formattedActivities} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
          >
            <h3 className="text-lg font-bold mb-5" style={{ color: "#14261f" }}>
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    whileHover={{ scale: 1.03, transition: { duration: 0.15 } }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate(action.route)}
                    className={`flex flex-col items-center gap-2.5 p-4 rounded-xl transition-colors ${action.color}`}
                  >
                    <Icon size={22} />
                    <span className="text-xs font-semibold text-center leading-tight">
                      {action.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </section>
      </div>
    </PageTransition>
  );
}
