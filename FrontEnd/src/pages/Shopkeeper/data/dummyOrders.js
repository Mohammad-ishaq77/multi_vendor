export const dummyOrders = [
  { id: "ORD-7001", customer: "Aisha Bhat", phone: "+91 99012 34567", items: [{ name: "Fresh Tomatoes", quantity: 2, price: 45 }, { name: "Amul Butter", quantity: 1, price: 199 }], total: 289, status: "New", paymentStatus: "Paid", paymentMethod: "UPI", deliveryAddress: "45 Residency Road, Srinagar", createdAt: "2025-08-10T09:30:00" },
  { id: "ORD-7002", customer: "Imran Shah", phone: "+91 98123 45678", items: [{ name: "Whole Wheat Bread", quantity: 3, price: 49 }, { name: "Curd", quantity: 2, price: 35 }], total: 217, status: "Accepted", paymentStatus: "Paid", paymentMethod: "Cash on Delivery", deliveryAddress: "12 Moul Azam, Srinagar", createdAt: "2025-08-10T10:15:00" },
  { id: "ORD-7003", customer: "Sofia Mir", phone: "+91 90876 54321", items: [{ name: "Honey - Raw", quantity: 1, price: 199 }, { name: "Snack Combo Pack", quantity: 2, price: 99 }], total: 397, status: "Preparing", paymentStatus: "Paid", paymentMethod: "UPI", deliveryAddress: "89 Gupkar Road, Srinagar", createdAt: "2025-08-10T11:00:00" },
  { id: "ORD-7004", customer: "Bilal Ahmad", phone: "+91 87654 32109", items: [{ name: "Rice - Basmati", quantity: 5, price: 189 }, { name: "Cooking Oil", quantity: 3, price: 159 }], total: 1422, status: "Ready for Pickup", paymentStatus: "Paid", paymentMethod: "UPI", deliveryAddress: "23 Dalgate, Srinagar", createdAt: "2025-08-10T08:45:00" },
  { id: "ORD-7005", customer: "Zainab Khan", phone: "+91 98765 11111", items: [{ name: "Banana (Yellow)", quantity: 2, price: 59 }, { name: "Green Capsicum", quantity: 1, price: 39 }], total: 157, status: "Delivered", paymentStatus: "Paid", paymentMethod: "Cash on Delivery", deliveryAddress: "67 Rajbagh, Srinagar", createdAt: "2025-08-09T16:00:00" },
  { id: "ORD-7006", customer: "Omar Farooq", phone: "+91 91234 56789", items: [{ name: "Amul Butter", quantity: 2, price: 199 }], total: 398, status: "Completed", paymentStatus: "Paid", paymentMethod: "UPI", deliveryAddress: "34 Nowhatta, Srinagar", createdAt: "2025-08-09T12:00:00" },
  { id: "ORD-7007", customer: "Nadia Jeelani", phone: "+91 92345 67890", items: [{ name: "Cooking Oil", quantity: 1, price: 159 }, { name: "Rice - Basmati", quantity: 2, price: 189 }], total: 537, status: "New", paymentStatus: "Paid", paymentMethod: "Cash on Delivery", deliveryAddress: "15 Hawal, Srinagar", createdAt: "2025-08-10T12:00:00" },
  { id: "ORD-7008", customer: "Tariq Malik", phone: "+91 93456 78901", items: [{ name: "Fresh Tomatoes", quantity: 3, price: 45 }, { name: "Curd", quantity: 1, price: 35 }], total: 170, status: "Cancelled", paymentStatus: "Refunded", paymentMethod: "UPI", deliveryAddress: "7 Lal Chowk, Srinagar", createdAt: "2025-08-09T14:30:00" },
];

export const orderStatusFlow = ["New", "Accepted", "Preparing", "Ready for Pickup", "Picked Up", "Delivered", "Completed"];

export const orderStatusConfig = {
  New: { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", dot: "bg-blue-500" },
  Accepted: { color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", dot: "bg-indigo-500" },
  Preparing: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500" },
  "Ready for Pickup": { color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200", dot: "bg-violet-500" },
  "Picked Up": { color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-200", dot: "bg-cyan-500" },
  Delivered: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500" },
  Completed: { color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-600" },
  Cancelled: { color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", dot: "bg-rose-500" },
};

export const paymentStatusConfig = {
  Paid: { color: "text-emerald-600", bg: "bg-emerald-50" },
  Pending: { color: "text-amber-600", bg: "bg-amber-50" },
  Refunded: { color: "text-gray-600", bg: "bg-gray-50" },
  Failed: { color: "text-rose-600", bg: "bg-rose-50" },
};
