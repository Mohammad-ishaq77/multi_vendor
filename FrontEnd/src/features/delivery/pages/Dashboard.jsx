import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  IndianRupee,
  Truck,
  Star,
  ArrowRight,
  MapPin,
  Clock,
  Wifi,
  WifiOff,
  Store,
  User,
  Shield,
  FileText,
  CreditCard,
  Bike,
  TrendingUp,
  ChevronRight,
  CheckCircle,
  Banknote,
  BarChart3,
} from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";
import PageTransition from "../components/PageTransition";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

const useReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mql.matches);
    const handler = (e) => setReduced(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return reduced;
};

const SectionHeader = ({ title, subtitle, actionLabel, onAction }) => (
  <div className="mb-2 flex items-end justify-between sm:mb-5 md:mb-6">
    <div className="min-w-0">
      <h2 className="text-sm font-bold text-[#14261f] sm:text-lg md:text-xl lg:text-2xl">{title}</h2>
      {subtitle && <p className="mt-0.5 text-[10px] text-gray-500 sm:mt-1 sm:text-xs md:text-sm">{subtitle}</p>}
    </div>
    {actionLabel && (
      <button
        onClick={onAction}
        className="flex-shrink-0 inline-flex items-center gap-1 rounded-full bg-[#155c43]/5 px-2 py-1 text-[9px] font-semibold text-[#155c43] transition-colors hover:bg-[#155c43]/10 sm:px-3 sm:py-2 sm:text-xs md:px-4 md:text-sm"
      >
        {actionLabel}
        <span>→</span>
      </button>
    )}
  </div>
);

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const toggle = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", toggle);
    return () => window.removeEventListener("scroll", toggle);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-14 lg:bottom-6 right-5 z-50 flex h-9 w-9 items-center justify-center rounded-full bg-[#155c43] text-white shadow-lg shadow-[#155c43]/25 sm:bottom-6 sm:right-6 sm:h-11 sm:w-11"
          aria-label="Scroll to top"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

// ─── HERO BANNER ───
const HeroBanner = ({ greeting, name, isOnline, toggleAvailability }) => (
  <motion.section
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    className="relative mb-6 overflow-hidden rounded-md shadow-lg shadow-[#155c43]/10 sm:mb-10 sm:rounded-lg lg:mb-12"
  >
    <div className={`relative p-3 min-h-[140px] flex flex-col justify-center text-white sm:p-8 sm:min-h-[220px] lg:p-10 md:min-h-[240px] ${isOnline ? "bg-gradient-to-br from-[#155c43] via-[#1a6b4e] to-[#0d4a32]" : "bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800"}`}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border border-white/[0.06] sm:h-64 sm:w-64 md:h-80 md:w-80" />
        <div className="absolute -bottom-12 -right-12 h-36 w-36 rounded-full border border-white/[0.04] sm:h-48 sm:w-48 md:h-64 md:w-64" />
      </div>

      <div className="relative z-10 flex flex-col gap-3 sm:gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <div className="mb-2 flex flex-wrap items-center gap-1.5 sm:mb-3 sm:gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[9px] font-medium tracking-wide uppercase backdrop-blur-sm sm:gap-2 sm:px-3 sm:py-1 sm:text-[10px] md:text-xs ${
              isOnline ? "bg-white/10 border-white/10 text-green-100/90" : "bg-white/10 border-white/10 text-gray-200/90"
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? "bg-green-300 animate-pulse" : "bg-gray-400"}`} />
              {isOnline ? "Online & Delivering" : "You're Offline"}
            </span>
          </div>
          <h2 className="text-base font-bold leading-tight sm:text-xl md:text-2xl lg:text-[2rem]">
            {greeting}, {name.split(" ")[0]} 👋
          </h2>
          <p className="mt-1.5 max-w-md text-[10px] leading-relaxed opacity-80 sm:mt-3 sm:text-sm md:text-base">
            {isOnline
              ? "Great time to deliver! New orders are coming in."
              : "Go online to start receiving delivery requests from nearby shops."}
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={toggleAvailability}
          className={`relative z-10 inline-flex items-center gap-1 self-start rounded-md px-3 py-1.5 text-[10px] font-semibold shadow-md transition-colors sm:gap-2 sm:self-center sm:rounded-md sm:px-6 sm:py-3.5 sm:text-sm ${
            isOnline
              ? "bg-white text-[#155c43] hover:bg-green-50"
              : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/30"
          }`}
        >
          {isOnline ? <WifiOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Wifi className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          {isOnline ? "Go Offline" : "Go Online"}
        </motion.button>
      </div>
    </div>
  </motion.section>
);

// ─── STAT CARD ───
const StatCard = ({ icon: Icon, label, value, accent = "emerald", delay = 0 }) => {
  const colors = {
    emerald: "from-emerald-500 to-teal-500 shadow-emerald-200",
    blue: "from-blue-500 to-indigo-500 shadow-blue-200",
    amber: "from-amber-500 to-orange-500 shadow-amber-200",
    violet: "from-violet-500 to-purple-500 shadow-violet-200",
    rose: "from-rose-500 to-pink-500 shadow-rose-200",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-lg border border-gray-100 p-2 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 hover:border-gray-200/80 transition-all duration-300 sm:rounded-lg sm:p-5"
    >
      <div className="flex items-center gap-1.5 sm:gap-3">
        <div className={`h-6 w-6 rounded-md bg-gradient-to-br ${colors[accent]} flex items-center justify-center text-white shadow-md sm:h-11 sm:w-11 sm:rounded-md sm:shadow-lg`}>
          <Icon className="h-3 w-3 sm:h-5 sm:w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 leading-tight sm:text-2xl">{value}</p>
          <p className="text-[8px] text-gray-500 font-medium leading-tight sm:text-xs">{label}</p>
        </div>
      </div>
    </motion.div>
  );
};

// ─── ACTIVE DELIVERY CARD ───
const ActiveDeliveryCard = ({ delivery }) => {
  const navigate = useNavigate();
  if (!delivery) return null;

  const progressSteps = ["accepted", "pickup_verified", "picked_up", "out_for_delivery", "otp_verified", "completed"];
  const currentStepIndex = progressSteps.indexOf(delivery.status);
  const progress = currentStepIndex >= 0 ? ((currentStepIndex + 1) / progressSteps.length) * 100 : 0;

  const actionLabels = {
    accepted: { label: "Go to Pickup", path: "/delivery/pickup" },
    pickup_verified: { label: "Confirm Pickup", path: "/delivery/pickup-confirmed" },
    picked_up: { label: "Start Delivery", path: "/delivery/pickup-confirmed" },
    out_for_delivery: { label: "Verify OTP", path: "/delivery/verify" },
    otp_verified: { label: "Complete Delivery", path: "/delivery/completed" },
  };

  const action = actionLabels[delivery.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-md border border-gray-100 p-2.5 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 sm:rounded-lg sm:p-5"
    >
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div>
          <p className="text-[10px] font-bold text-gray-900 sm:text-sm">{delivery.id}</p>
          <span className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded-full text-[0.55rem] font-semibold bg-amber-50 text-amber-700 border border-amber-200 sm:mt-1 sm:px-2 sm:text-[0.65rem]">
            Active Delivery
          </span>
        </div>
        <p className="text-sm font-bold text-[#155c43] sm:text-lg">₹{delivery.partnerEarning}</p>
      </div>

      <div className="mb-4">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-[#155c43] to-emerald-500 rounded-full"
          />
        </div>
        <p className="text-[0.65rem] text-gray-400 mt-1">
          {delivery.status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
        </p>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Store className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="font-medium">{delivery.shopName}</span>
          <span className="text-gray-400 text-xs">{delivery.shopAddress}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="font-medium">{delivery.customerName}</span>
          <span className="text-gray-400 text-xs">{delivery.customerAddress}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
        <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /><span>{delivery.distance} km</span></div>
        <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /><span>{delivery.estimatedTime}</span></div>
        <div className="flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5" /><span>₹{delivery.orderAmount}</span></div>
      </div>

      {action && (
        <button
          onClick={() => navigate(action.path)}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold text-white bg-[#155c43] hover:bg-[#104b36] shadow-md shadow-[#155c43]/20 transition-all sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
        >
          {action.label}
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
};

// ─── EARNINGS WEEKLY CHART ───
const EarningsChart = ({ weeklyBreakdown }) => {
  const maxAmount = Math.max(...weeklyBreakdown.map((d) => d.amount));
  return (
    <div className="flex items-end gap-2 h-32 mt-4">
      {weeklyBreakdown.map((day, idx) => (
        <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: `${(day.amount / maxAmount) * 100}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="w-full bg-gradient-to-t from-[#155c43] to-emerald-400 rounded-t-lg min-h-[4px]"
          />
          <span className="text-[0.6rem] text-gray-400 font-medium">{day.day}</span>
        </div>
      ))}
    </div>
  );
};

// ─── RECENT DELIVERY ROW ───
const RecentDeliveryRow = ({ delivery }) => (
  <div className="bg-white rounded-md border border-gray-100 p-3 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow sm:rounded-md sm:p-4">
    <div className="flex items-center gap-2.5 sm:gap-3">
      <div className="w-8 h-8 rounded-lg bg-[#155c43]/10 flex items-center justify-center text-[#155c43] sm:w-10 sm:h-10 sm:rounded-md">
        <Package className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-900 sm:text-sm">{delivery.id}</p>
        <p className="text-[10px] text-gray-400 sm:text-xs">{delivery.shopName} → {delivery.customerName}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-xs font-bold text-[#155c43] sm:text-sm">₹{delivery.partnerEarning}</p>
      <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
        <MapPin className="w-3 h-3" />{delivery.distance} km
      </p>
    </div>
  </div>
);

// ─── IDENTITY INFO CARD ───
const IdentityCard = ({ profile }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className="bg-white rounded-md border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 overflow-hidden sm:rounded-lg"
  >
    <div className="bg-gradient-to-r from-[#155c43] to-emerald-600 px-3.5 py-2.5 sm:px-5 sm:py-3">
      <div className="flex items-center gap-2 text-white">
        <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="text-[10px] font-semibold uppercase tracking-wider sm:text-xs">Identity Verification</span>
      </div>
    </div>
    <div className="p-3.5 space-y-2.5 sm:p-5 sm:space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-gray-500 sm:text-xs">Full Name</span>
        <span className="text-xs font-semibold text-gray-900 sm:text-sm">{profile.identity?.fullName || profile.name}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-gray-500 sm:text-xs">Aadhaar Number</span>
        <span className="text-xs font-semibold text-gray-900 font-mono sm:text-sm">{profile.identity?.aadhaar || "XXXX XXXX XXXX"}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-gray-500 sm:text-xs">Date of Birth</span>
        <span className="text-xs font-semibold text-gray-900 sm:text-sm">{profile.identity?.dob ? new Date(profile.identity.dob).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-gray-500 sm:text-xs">Status</span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle className="w-3 h-3" />
          Verified
        </span>
      </div>
    </div>
  </motion.div>
);

// ─── VEHICLE INFO CARD ───
const VehicleCard = ({ profile }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
    className="bg-white rounded-md border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 overflow-hidden sm:rounded-lg"
  >
    <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-3.5 py-2.5 sm:px-5 sm:py-3">
      <div className="flex items-center gap-2 text-white">
        <Bike className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="text-[10px] font-semibold uppercase tracking-wider sm:text-xs">Vehicle Details</span>
      </div>
    </div>
    <div className="p-3.5 space-y-2.5 sm:p-5 sm:space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-gray-500 sm:text-xs">Vehicle Type</span>
        <span className="text-xs font-semibold text-gray-900 sm:text-sm">{profile.vehicleType || "—"}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-gray-500 sm:text-xs">Registration No.</span>
        <span className="text-xs font-semibold text-gray-900 font-mono sm:text-sm">{profile.vehicleNumber || "—"}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-gray-500 sm:text-xs">Phone</span>
        <span className="text-xs font-semibold text-gray-900 sm:text-sm">{profile.phone || "—"}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-gray-500 sm:text-xs">Email</span>
        <span className="text-xs font-semibold text-gray-900 truncate max-w-[140px] sm:text-sm sm:max-w-[160px]">{profile.email || "—"}</span>
      </div>
    </div>
  </motion.div>
);

// ─── GUIDELINES CARD ───
const GuidelinesCard = ({ navigate }) => {
  const guidelines = [
    { icon: Package, text: "Always verify the pickup code before leaving the shop", color: "text-blue-500 bg-blue-50" },
    { icon: MapPin, text: "Follow the shortest route for faster delivery", color: "text-emerald-500 bg-emerald-50" },
    { icon: Shield, text: "Never share customer OTP with anyone", color: "text-rose-500 bg-rose-50" },
    { icon: Clock, text: "Maintain 95%+ on-time delivery rate", color: "text-amber-500 bg-amber-50" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-md border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 overflow-hidden sm:rounded-lg"
    >
      <div className="bg-gradient-to-r from-[#155c43] to-emerald-600 px-3.5 py-2.5 sm:px-5 sm:py-3">
        <div className="flex items-center gap-2 text-white">
          <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="text-[10px] font-semibold uppercase tracking-wider sm:text-xs">Delivery Guidelines</span>
        </div>
      </div>
      <div className="p-3.5 space-y-2.5 sm:p-5 sm:space-y-3">
        {guidelines.map((g, i) => (
          <div key={i} className="flex items-start gap-2.5 sm:gap-3">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 sm:w-8 sm:h-8 ${g.color}`}>
              <g.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <p className="text-xs text-gray-600 leading-relaxed pt-0.5 sm:text-sm sm:pt-1">{g.text}</p>
          </div>
        ))}
        <button
          onClick={() => navigate("/delivery/onboarding/guidelines")}
          className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-[#155c43] hover:underline sm:mt-2 sm:text-xs"
        >
          Read full guidelines <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
};

// ─── QUICK ACTIONS ───
const QuickActions = ({ navigate, isOnline }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className="bg-white rounded-md border border-gray-100 p-3.5 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 sm:rounded-lg sm:p-5"
  >
    <h3 className="text-xs font-bold text-gray-900 mb-2.5 sm:text-sm sm:mb-3">Quick Actions</h3>
    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={() => navigate("/delivery/available")}
        disabled={!isOnline}
        className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg bg-[#155c43]/5 hover:bg-[#155c43]/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed sm:gap-2 sm:p-3 sm:rounded-md"
      >
        <Package className="w-4 h-4 text-[#155c43] sm:w-5 sm:h-5" />
        <span className="text-[10px] font-semibold text-gray-700 sm:text-xs">New Deliveries</span>
      </button>
      <button
        onClick={() => navigate("/delivery/active")}
        className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors sm:gap-2 sm:p-3 sm:rounded-md"
      >
        <Truck className="w-4 h-4 text-amber-600 sm:w-5 sm:h-5" />
        <span className="text-[10px] font-semibold text-gray-700 sm:text-xs">Active Delivery</span>
      </button>
      <button
        onClick={() => navigate("/delivery/earnings")}
        className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors sm:gap-2 sm:p-3 sm:rounded-md"
      >
        <Banknote className="w-4 h-4 text-emerald-600 sm:w-5 sm:h-5" />
        <span className="text-[10px] font-semibold text-gray-700 sm:text-xs">Earnings</span>
      </button>
      <button
        onClick={() => navigate("/delivery/history")}
        className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg bg-violet-50 hover:bg-violet-100 transition-colors sm:gap-2 sm:p-3 sm:rounded-md"
      >
        <BarChart3 className="w-4 h-4 text-violet-600 sm:w-5 sm:h-5" />
        <span className="text-[10px] font-semibold text-gray-700 sm:text-xs">History</span>
      </button>
    </div>
  </motion.div>
);

// ─── PERFORMANCE CARD ───
const PerformanceCard = ({ profile }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className="bg-white rounded-md border border-gray-100 p-3.5 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 sm:rounded-lg sm:p-5"
  >
    <div className="flex items-center gap-2 mb-3 sm:mb-4">
      <TrendingUp className="w-3.5 h-3.5 text-[#155c43] sm:w-4 sm:h-4" />
      <h3 className="text-xs font-bold text-gray-900 sm:text-sm">Your Performance</h3>
    </div>
    <div className="space-y-2.5 sm:space-y-3">
      <div>
        <div className="flex items-center justify-between text-[10px] mb-1 sm:text-xs">
          <span className="text-gray-500">Completion Rate</span>
          <span className="font-semibold text-gray-900">
            {profile.completedDeliveries && profile.totalDeliveries
              ? Math.round((profile.completedDeliveries / profile.totalDeliveries) * 100)
              : 0}%
          </span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden sm:h-2">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{
              width: `${profile.completedDeliveries && profile.totalDeliveries
                ? Math.round((profile.completedDeliveries / profile.totalDeliveries) * 100)
                : 0}%`,
            }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-[#155c43] to-emerald-400 rounded-full"
          />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between text-[10px] mb-1 sm:text-xs">
          <span className="text-gray-500">Rating</span>
          <span className="font-semibold text-gray-900">{profile.rating} / 5.0</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden sm:h-2">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${((profile.rating || 0) / 5) * 100}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 pt-1.5 sm:gap-3 sm:pt-2">
        <div className="text-center p-2 bg-gray-50 rounded-lg sm:p-3 sm:rounded-md">
          <p className="text-sm font-bold text-gray-900 sm:text-lg">{profile.completedDeliveries || 0}</p>
          <p className="text-[0.6rem] text-gray-500 sm:text-[0.65rem]">Completed</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg sm:p-3 sm:rounded-md">
          <p className="text-sm font-bold text-gray-900 sm:text-lg">{profile.cancelledDeliveries || 0}</p>
          <p className="text-[0.6rem] text-gray-500 sm:text-[0.65rem]">Cancelled</p>
        </div>
      </div>
    </div>
  </motion.div>
);

// ─── MAIN DASHBOARD ───
export default function DeliveryPartnerDashboard() {
  const navigate = useNavigate();
  const { profile, isOnline, toggleAvailability, activeDelivery, availableDeliveries, earnings, deliveryHistory } = useDeliveryPartner();
  const reducedMotion = useReducedMotion();
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  const recentDeliveries = deliveryHistory.slice(0, 4);

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: reducedMotion ? 0 : 0.05, delayChildren: 0.05 } },
  };

  const fadeUpItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: reducedMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <PageTransition>
      <div className="space-y-3 sm:space-y-10 lg:space-y-12">
        {/* Hero Banner */}
        <HeroBanner greeting={greeting} name={profile.name} isOnline={isOnline} toggleAvailability={toggleAvailability} />

        {/* Stats */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={staggerContainer}>
          <motion.div variants={staggerContainer} className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-4">
            <motion.div variants={fadeUpItem}>
              <StatCard icon={Truck} label="Today's Deliveries" value={profile.todayDeliveries} accent="emerald" delay={0} />
            </motion.div>
            <motion.div variants={fadeUpItem}>
              <StatCard icon={IndianRupee} label="Today's Earnings" value={`₹${profile.todayEarnings}`} accent="teal" delay={0.05} />
            </motion.div>
            <motion.div variants={fadeUpItem}>
              <StatCard icon={Package} label="Total Completed" value={profile.completedDeliveries} accent="blue" delay={0.1} />
            </motion.div>
            <motion.div variants={fadeUpItem}>
              <StatCard icon={Star} label="Rating" value={`${profile.rating} ★`} accent="amber" delay={0.15} />
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Active Delivery */}
        {activeDelivery && (
          <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
            <SectionHeader title="Active Delivery" subtitle="Your current delivery in progress." actionLabel="View Details" onAction={() => navigate("/delivery/active")} />
            <ActiveDeliveryCard delivery={activeDelivery} />
          </motion.section>
        )}

        {/* Available Deliveries */}
        {isOnline && availableDeliveries.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
            <SectionHeader title="Available Deliveries" subtitle={`${availableDeliveries.length} new orders nearby.`} actionLabel="View All" onAction={() => navigate("/delivery/available")} />
            <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-2">
              {availableDeliveries.slice(0, 4).map((d) => (
                <DeliveryCardMini key={d.id} delivery={d} />
              ))}
            </div>
          </motion.section>
        )}

        {/* Earnings Summary + Weekly Chart */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          <SectionHeader title="Earnings Overview" subtitle="Your earnings breakdown." actionLabel="View Details" onAction={() => navigate("/delivery/earnings")} />
          <div className="bg-white rounded-md border border-gray-100 p-3.5 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 sm:rounded-lg sm:p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 sm:gap-3 sm:mb-4">
              <div className="text-center p-2 bg-[#155c43]/5 rounded-lg sm:p-3 sm:rounded-md">
                <p className="text-base font-bold text-[#155c43] sm:text-lg">₹{earnings.today}</p>
                <p className="text-[0.6rem] text-gray-500 mt-0.5 sm:text-[0.65rem]">Today</p>
              </div>
              <div className="text-center p-2 bg-emerald-50 rounded-lg sm:p-3 sm:rounded-md">
                <p className="text-base font-bold text-emerald-600 sm:text-lg">₹{earnings.thisWeek}</p>
                <p className="text-[0.6rem] text-gray-500 mt-0.5 sm:text-[0.65rem]">This Week</p>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded-lg sm:p-3 sm:rounded-md">
                <p className="text-base font-bold text-blue-600 sm:text-lg">₹{earnings.thisMonth}</p>
                <p className="text-[0.6rem] text-gray-500 mt-0.5 sm:text-[0.65rem]">This Month</p>
              </div>
              <div className="text-center p-2 bg-amber-50 rounded-lg sm:p-3 sm:rounded-md">
                <p className="text-base font-bold text-amber-600 sm:text-lg">₹{earnings.total}</p>
                <p className="text-[0.65rem] text-gray-500 mt-0.5">All Time</p>
              </div>
            </div>
            {earnings.weeklyBreakdown && (
              <>
                <p className="text-xs font-semibold text-gray-700 mb-1">This Week</p>
                <EarningsChart weeklyBreakdown={earnings.weeklyBreakdown} />
              </>
            )}
          </div>
        </motion.section>

        {/* Bottom Grid: Quick Actions + Performance + Identity/Vehicle/Guidelines */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Left Column: Quick Actions + Performance */}
          <div className="space-y-4 sm:space-y-5">
            <QuickActions navigate={navigate} isOnline={isOnline} />
            <PerformanceCard profile={profile} />
          </div>

          {/* Middle Column: Identity + Vehicle */}
          <div className="space-y-4 sm:space-y-5">
            <IdentityCard profile={profile} />
            <VehicleCard profile={profile} />
          </div>

          {/* Right Column: Guidelines */}
          <GuidelinesCard navigate={navigate} />
        </div>

        {/* Recent Deliveries */}
        {recentDeliveries.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
            <SectionHeader title="Recent Deliveries" subtitle="Your latest completed deliveries." actionLabel="View All" onAction={() => navigate("/delivery/history")} />
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-2 gap-2 md:grid-cols-2 md:gap-3">
              {recentDeliveries.map((d) => (
                <motion.div key={d.id} variants={fadeUpItem}>
                  <RecentDeliveryRow delivery={d} />
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        )}

        <div className="h-6 sm:h-8" />
      </div>

      <ScrollToTop />
    </PageTransition>
  );
}

// ─── MINI DELIVERY CARD (for available deliveries) ───
const DeliveryCardMini = ({ delivery }) => {
  const navigate = useNavigate();

  return (
    <motion.div whileHover={{ y: -4 }} className="bg-white rounded-md border border-gray-100 p-3 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 sm:rounded-lg sm:p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-xs font-bold text-gray-900 sm:text-sm">{delivery.id}</p>
          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[0.65rem] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Ready for Pickup
          </span>
        </div>
        <div className="text-right">
          <p className="text-base font-bold text-[#155c43] sm:text-lg">₹{delivery.partnerEarning}</p>
          <p className="text-[0.65rem] text-gray-400">Your earning</p>
        </div>
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Store className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="font-medium text-xs">{delivery.shopName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="font-medium text-xs">{delivery.customerName}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-3 text-[0.65rem] text-gray-500">
        <div className="flex items-center gap-1"><MapPin className="w-3 h-3" />{delivery.distance} km</div>
        <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{delivery.estimatedTime}</div>
      </div>

      <button
        onClick={() => navigate(`/delivery/details/${delivery.id}`)}
        className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold text-[#155c43] bg-[#155c43]/5 hover:bg-[#155c43]/10 transition-all"
      >
        View Details <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
};
