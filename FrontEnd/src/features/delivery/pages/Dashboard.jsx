import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Banknote,
  Bike,
  CheckCircle2,
  Clock,
  FileText,
  IndianRupee,
  MapPin,
  Package,
  Shield,
  Star,
  Store,
  TrendingUp,
  Truck,
  User,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useDeliveryPartner } from "../context/DeliveryPartnerContext";

const formatINR = (value) =>
  `₹${Math.round(Number(value || 0)).toLocaleString("en-IN")}`;
const num = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

function statusLabel(status = "") {
  return status.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const StatCard = ({ icon: Icon, label, value, hint, tone = "emerald", onClick }) => {
  const tones = {
    emerald: "bg-[var(--color-green-bg)] text-[var(--color-primary)]",
    teal: "bg-teal-50 text-teal-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      className="flex h-full flex-col items-start gap-3 rounded-[16px] border border-[#edf3ef] bg-white p-4 text-left shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-hover)] sm:p-5"
    >
      <span className={`flex h-11 w-11 items-center justify-center rounded-[12px] ${tones[tone]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-2xl font-bold tracking-tight text-[var(--color-text)]">{value}</p>
        <p className="mt-0.5 text-xs font-medium text-[var(--color-text-muted)]">{label}</p>
        {hint && <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">{hint}</p>}
      </div>
    </motion.button>
  );
};

const EarningsChart = ({ data = [] }) => {
  const [hovered, setHovered] = useState(null);
  const maxAmount = Math.max(1, ...data.map((day) => num(day.amount)));

  return (
    <div className="flex h-44 items-end gap-2.5 sm:h-48 sm:gap-3">
      {data.map((day, index) => {
        const height = Math.max(8, (num(day.amount) / maxAmount) * 100);
        const active = hovered === index;
        return (
          <button
            key={day.day}
            type="button"
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(index)}
            onBlur={() => setHovered(null)}
            className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
          >
            <span className={`text-[10px] font-semibold ${active ? "text-[var(--color-primary)]" : "text-transparent"}`}>
              {formatINR(day.amount)}
            </span>
            <motion.span
              initial={{ height: 8 }}
              animate={{ height: `${height}%` }}
              transition={{ duration: 0.45, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
              className={`w-full max-w-10 rounded-t-lg ${
                active ? "bg-[var(--color-primary)]" : "bg-gradient-to-t from-[var(--color-primary)] to-emerald-400"
              }`}
            />
            <span className="text-[11px] font-medium text-[var(--color-text-muted)]">{day.day}</span>
          </button>
        );
      })}
    </div>
  );
};

export default function DeliveryPartnerDashboard() {
  const navigate = useNavigate();
  const {
    profile,
    isOnline,
    toggleAvailability,
    activeDelivery,
    availableDeliveries,
    earnings,
    deliveryHistory,
  } = useDeliveryPartner();

  const [greeting, setGreeting] = useState("Good morning");
  useEffect(() => setGreeting(getGreeting()), []);

  const firstName = profile.name?.split(" ")[0] || "Partner";
  const todayDeliveries = num(profile.todayDeliveries);
  const todayEarnings = num(profile.todayEarnings ?? earnings.today);
  const completed = num(profile.completedDeliveries);
  const rating = num(profile.rating);
  const weekly = earnings.weeklyBreakdown || [];
  const nearby = availableDeliveries.slice(0, 3);
  const recent = deliveryHistory.slice(0, 4);
  const completionRate = profile.totalDeliveries
    ? Math.round((completed / num(profile.totalDeliveries)) * 100)
    : 0;

  const quickActions = useMemo(
    () => [
      { label: "Available", desc: "Nearby pickups", icon: Package, path: "/delivery/available", tone: "bg-[var(--color-green-bg)] text-[var(--color-primary)]" },
      { label: "Active", desc: "Current drop", icon: Truck, path: "/delivery/active", tone: "bg-amber-50 text-amber-600" },
      { label: "Earnings", desc: "Payouts", icon: Banknote, path: "/delivery/earnings", tone: "bg-teal-50 text-teal-600" },
      { label: "History", desc: "Past trips", icon: Clock, path: "/delivery/history", tone: "bg-blue-50 text-blue-600" },
    ],
    []
  );

  return (
    <div className="space-y-5 sm:space-y-6">
        <section className={`overflow-hidden rounded-[20px] p-5 text-white shadow-[var(--shadow-hover)] sm:p-6 lg:p-7 ${
          isOnline
            ? "bg-gradient-to-br from-[var(--color-primary-dark)] via-[var(--color-primary)] to-[var(--color-green)]"
            : "bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800"
        }`}>
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
                <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? "animate-pulse bg-emerald-300" : "bg-white/50"}`} />
                {isOnline ? "Online & receiving requests" : "You're offline"}
              </span>
              <h1 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                {greeting}, {firstName}
              </h1>
              <p className="mt-1.5 text-sm text-white/80">
                {isOnline
                  ? `${nearby.length} pickup${nearby.length === 1 ? "" : "s"} waiting nearby. Stay online to keep them coming.`
                  : "Go online to start receiving delivery requests from nearby shops."}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleAvailability}
              className={`inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-[12px] px-5 text-sm font-semibold shadow-lg transition ${
                isOnline
                  ? "bg-white text-[var(--color-primary-dark)] hover:bg-emerald-50"
                  : "bg-emerald-500 text-white hover:bg-emerald-400"
              }`}
            >
              {isOnline ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
              {isOnline ? "Go offline" : "Go online"}
            </button>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            icon={Truck}
            label="Today's deliveries"
            value={todayDeliveries}
            hint="Completed today"
            tone="emerald"
            onClick={() => navigate("/delivery/history")}
          />
          <StatCard
            icon={IndianRupee}
            label="Today's earnings"
            value={formatINR(todayEarnings)}
            hint="Before payout"
            tone="teal"
            onClick={() => navigate("/delivery/earnings")}
          />
          <StatCard
            icon={Package}
            label="Total completed"
            value={completed}
            hint={`${num(profile.cancelledDeliveries)} cancelled`}
            tone="blue"
            onClick={() => navigate("/delivery/history")}
          />
          <StatCard
            icon={Star}
            label="Rating"
            value={rating ? rating.toFixed(1) : "—"}
            hint="Out of 5.0"
            tone="amber"
            onClick={() => navigate("/delivery/profile")}
          />
        </section>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map((action) => (
            <motion.button
              key={action.label}
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(action.path)}
              className="flex items-center gap-3 rounded-[16px] border border-[#edf3ef] bg-white p-3.5 text-left shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] sm:p-4"
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${action.tone}`}>
                <action.icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-[var(--color-text)]">{action.label}</span>
                <span className="block text-[11px] text-[var(--color-text-muted)]">{action.desc}</span>
              </span>
            </motion.button>
          ))}
        </section>

        {activeDelivery && (
          <section className="rounded-[20px] border border-amber-100 bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-600">Active delivery</p>
                <h2 className="mt-1 text-lg font-bold">{activeDelivery.id}</h2>
              </div>
              <p className="text-lg font-bold text-[var(--color-primary)]">{formatINR(activeDelivery.partnerEarning)}</p>
            </div>
            <p className="mb-4 text-sm text-[var(--color-text-muted)]">{statusLabel(activeDelivery.status)}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-2 text-sm">
                <Store className="mt-0.5 h-4 w-4 text-[var(--color-primary)]" />
                <span>
                  <span className="block font-semibold">{activeDelivery.shopName}</span>
                  <span className="text-xs text-[var(--color-text-muted)]">{activeDelivery.shopAddress}</span>
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <User className="mt-0.5 h-4 w-4 text-[var(--color-primary)]" />
                <span>
                  <span className="block font-semibold">{activeDelivery.customerName}</span>
                  <span className="text-xs text-[var(--color-text-muted)]">{activeDelivery.customerAddress}</span>
                </span>
              </div>
            </div>
            <button type="button" onClick={() => navigate("/delivery/active")} className="btn-primary mt-5">
              Continue delivery
              <ArrowRight className="h-4 w-4" />
            </button>
          </section>
        )}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.85fr)]">
          <section className="rounded-[20px] border border-[#edf3ef] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Earnings overview</h2>
                <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">This week's payout trend</p>
              </div>
              <button type="button" onClick={() => navigate("/delivery/earnings")} className="text-sm font-semibold text-[var(--color-primary)]">
                View details
              </button>
            </div>
            <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "Today", value: earnings.today, tone: "bg-[var(--color-green-bg)] text-[var(--color-primary-dark)]" },
                { label: "This week", value: earnings.thisWeek, tone: "bg-emerald-50 text-emerald-700" },
                { label: "This month", value: earnings.thisMonth, tone: "bg-blue-50 text-blue-700" },
                { label: "All time", value: earnings.total, tone: "bg-amber-50 text-amber-700" },
              ].map((item) => (
                <div key={item.label} className={`rounded-[12px] px-3 py-3 ${item.tone}`}>
                  <p className="text-base font-bold sm:text-lg">{formatINR(item.value)}</p>
                  <p className="mt-0.5 text-[11px] opacity-80">{item.label}</p>
                </div>
              ))}
            </div>
            <EarningsChart data={weekly} />
          </section>

          <section className="rounded-[20px] border border-[#edf3ef] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[var(--color-primary)]" />
              <h2 className="text-lg font-bold">Performance</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">Completion rate</span>
                  <span className="font-semibold">{completionRate}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#eef4f0]">
                  <div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${completionRate}%` }} />
                </div>
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">Rating</span>
                  <span className="font-semibold">{rating ? `${rating.toFixed(1)} / 5` : "—"}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#eef4f0]">
                  <div className="h-full rounded-full bg-amber-400" style={{ width: `${(rating / 5) * 100}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-[12px] bg-[#f8fbf9] p-3 text-center">
                  <p className="text-lg font-bold">{completed}</p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">Completed</p>
                </div>
                <div className="rounded-[12px] bg-[#f8fbf9] p-3 text-center">
                  <p className="text-lg font-bold">{num(profile.cancelledDeliveries)}</p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">Cancelled</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {nearby.length > 0 && (
          <section>
            <div className="mb-3 flex items-end justify-between">
              <div>
                <h2 className="text-lg font-bold">Nearby pickups</h2>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {isOnline ? `${availableDeliveries.length} ready for pickup` : "Go online to accept these requests"}
                </p>
              </div>
              <button type="button" onClick={() => navigate("/delivery/available")} className="text-sm font-semibold text-[var(--color-primary)]">
                View all
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {nearby.map((delivery) => (
                <button
                  key={delivery.id}
                  type="button"
                  onClick={() => navigate(`/delivery/details/${delivery.id}`)}
                  className="rounded-[16px] border border-[#edf3ef] bg-white p-4 text-left shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold">{delivery.id}</p>
                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">{delivery.shopName}</p>
                    </div>
                    <p className="text-base font-bold text-[var(--color-primary)]">{formatINR(delivery.partnerEarning)}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{delivery.distance} km</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{delivery.estimatedTime}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="grid gap-5 lg:grid-cols-3">
          <section className="rounded-[20px] border border-[#edf3ef] bg-white p-5 shadow-[var(--shadow-card)] lg:col-span-2">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h2 className="text-lg font-bold">Recent deliveries</h2>
                <p className="text-sm text-[var(--color-text-muted)]">Latest completed trips</p>
              </div>
              <button type="button" onClick={() => navigate("/delivery/history")} className="text-sm font-semibold text-[var(--color-primary)]">
                View all
              </button>
            </div>
            <div className="divide-y divide-[#edf3ef]">
              {recent.length === 0 && (
                <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">No completed deliveries yet.</p>
              )}
              {recent.map((delivery) => (
                <button
                  key={delivery.id}
                  type="button"
                  onClick={() => navigate(`/delivery/order/${delivery.id}`)}
                  className="flex w-full items-center justify-between gap-3 py-3.5 text-left first:pt-0 last:pb-0 hover:text-[var(--color-primary)]"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[var(--color-green-bg)] text-[var(--color-primary)]">
                      <Package className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{delivery.id}</span>
                      <span className="block truncate text-xs text-[var(--color-text-muted)]">
                        {delivery.shopName} → {delivery.customerName}
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-sm font-bold text-[var(--color-primary)]">{formatINR(delivery.partnerEarning)}</span>
                    <span className="text-[11px] text-[var(--color-text-muted)]">{delivery.distance} km</span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <div className="space-y-5">
            <section className="rounded-[20px] border border-[#edf3ef] bg-white p-5 shadow-[var(--shadow-card)]">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[var(--color-primary)]">
                  <Bike className="h-4 w-4" />
                  <h2 className="text-sm font-bold uppercase tracking-wider">Partner details</h2>
                </div>
                <button type="button" onClick={() => navigate("/delivery/profile")} className="text-xs font-semibold text-[var(--color-primary)]">
                  Edit
                </button>
              </div>
              <dl className="space-y-2.5 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--color-text-muted)]">Name</dt>
                  <dd className="font-semibold">{profile.name || "—"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--color-text-muted)]">Vehicle</dt>
                  <dd className="font-semibold">{profile.vehicleType || "—"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--color-text-muted)]">Number</dt>
                  <dd className="font-mono font-semibold">{profile.vehicleNumber || "—"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--color-text-muted)]">Phone</dt>
                  <dd className="font-semibold">{profile.phone || "—"}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-[20px] border border-[#edf3ef] bg-white p-5 shadow-[var(--shadow-card)]">
              <div className="mb-3 flex items-center gap-2 text-[var(--color-primary)]">
                <Shield className="h-4 w-4" />
                <h2 className="text-sm font-bold uppercase tracking-wider">On the road</h2>
              </div>
              <ul className="space-y-2.5">
                {[
                  { icon: Package, text: "Verify pickup codes before you leave" },
                  { icon: FileText, text: "Never share the customer OTP" },
                  { icon: CheckCircle2, text: "Keep sealed packages unopened" },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-2 text-sm text-[var(--color-text-muted)]">
                    <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary)]" />
                    {item.text}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
  );
}
