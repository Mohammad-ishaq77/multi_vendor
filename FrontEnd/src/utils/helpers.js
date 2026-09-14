export const formatCurrency = (amount) => {
  if (amount == null || Number.isNaN(Number(amount))) return "₹0";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
};

export const cn = (...classes) => classes.filter(Boolean).join(" ");

export const normalizeEmail = (value = "") => value.trim().toLowerCase();
