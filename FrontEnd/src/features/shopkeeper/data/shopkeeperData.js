export const shopkeeperProfile = {
  id: "sk_001",
  name: "Ahmad Khan",
  email: "ahmad.khan@example.com",
  phone: "+91 98765 43210",
  image: null,
  joinedDate: "2025-06-15",
  role: "shopkeeper",
};

export const shopData = {
  id: "shop_001",
  name: "Fresh Basket",
  description: "Your one-stop shop for fresh groceries, fruits, vegetables, and daily essentials. We source directly from local farmers to ensure the freshest products.",
  type: "Grocery",
  typeId: 1,
  phone: "+91 98765 43210",
  email: "freshbasket@example.com",
  address: "123 Residency Road, Near Polo View",
  city: "Srinagar",
  state: "Jammu & Kashmir",
  pincode: "190001",
  latitude: 34.0837,
  longitude: 74.7973,
  openingTime: "08:00",
  closingTime: "22:00",
  isOpen: true,
  isApproved: true,
  rating: 4.6,
  totalReviews: 315,
  deliveryTime: "25–35 mins",
  minOrder: 100,
  shopImage: null,
  bannerImage: null,
  logoImage: null,
  createdAt: "2025-06-20",
};

export const shopProducts = [
  { id: "p1", name: "Fresh Tomatoes", category: "Vegetables", description: "Locally sourced fresh red tomatoes, farm to table.", price: 45, discount: 0, stock: 150, unit: "kg", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop", available: true, createdAt: "2025-07-01" },
  { id: "p2", name: "Amul Butter", category: "Dairy", description: "Fresh Amul butter 500g pack.", price: 199, discount: 20, stock: 45, unit: "500g", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop", available: true, createdAt: "2025-07-02" },
  { id: "p3", name: "Whole Wheat Bread", category: "Bakery", description: "Freshly baked whole wheat bread loaf.", price: 49, discount: 0, stock: 80, unit: "500g", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop", available: true, createdAt: "2025-07-03" },
  { id: "p4", name: "Honey - Raw", category: "Grocery", description: "Pure raw honey from local apiaries.", price: 199, discount: 10, stock: 60, unit: "500ml", image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop", available: true, createdAt: "2025-07-04" },
  { id: "p5", name: "Green Capsicum", category: "Vegetables", description: "Fresh green capsicum, crisp and flavourful.", price: 39, discount: 0, stock: 90, unit: "500g", image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=400&fit=crop", available: true, createdAt: "2025-07-05" },
  { id: "p6", name: "Banana (Yellow)", category: "Fruits", description: "Fresh yellow bananas, perfect for daily nutrition.", price: 59, discount: 0, stock: 200, unit: "Dozen", image: "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=400&h=400&fit=crop", available: true, createdAt: "2025-07-06" },
  { id: "p7", name: "Snack Combo Pack", category: "Snacks", description: "Assorted snack pack with 5 different items.", price: 99, discount: 34, stock: 30, unit: "Pack of 5", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=400&fit=crop", available: true, createdAt: "2025-07-07" },
  { id: "p8", name: "Cooking Oil", category: "Grocery", description: "Refined sunflower cooking oil.", price: 159, discount: 5, stock: 50, unit: "1L", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop", available: true, createdAt: "2025-07-08" },
  { id: "p9", name: "Rice - Basmati", category: "Grocery", description: "Premium long grain basmati rice.", price: 189, discount: 0, stock: 0, unit: "1kg", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop", available: false, createdAt: "2025-07-09" },
  { id: "p10", name: "Curd", category: "Dairy", description: "Fresh homemade style curd.", price: 35, discount: 0, stock: 70, unit: "400g", image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=400&fit=crop", available: true, createdAt: "2025-07-10" },
];

export const shopOrders = [
  { id: "ORD-7001", customer: "Aisha Bhat", phone: "+91 99012 34567", items: [{ name: "Fresh Tomatoes", quantity: 2, price: 45, image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=100&h=100&fit=crop" }, { name: "Amul Butter", quantity: 1, price: 199, image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&h=100&fit=crop" }], total: 289, status: "New", paymentStatus: "Paid", paymentMethod: "UPI", deliveryAddress: "45 Residency Road, Srinagar", createdAt: "2025-08-10T09:30:00", updatedAt: "2025-08-10T09:30:00" },
  { id: "ORD-7002", customer: "Imran Shah", phone: "+91 98123 45678", items: [{ name: "Whole Wheat Bread", quantity: 3, price: 49, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100&h=100&fit=crop" }, { name: "Curd", quantity: 2, price: 35, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=100&h=100&fit=crop" }], total: 217, status: "Accepted", paymentStatus: "Paid", paymentMethod: "Cash on Delivery", deliveryAddress: "12 Moul Azam, Srinagar", createdAt: "2025-08-10T10:15:00", updatedAt: "2025-08-10T10:20:00" },
  { id: "ORD-7003", customer: "Sofia Mir", phone: "+91 90876 54321", items: [{ name: "Honey - Raw", quantity: 1, price: 199, image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&h=100&fit=crop" }, { name: "Snack Combo Pack", quantity: 2, price: 99, image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=100&h=100&fit=crop" }], total: 397, status: "Preparing", paymentStatus: "Paid", paymentMethod: "UPI", deliveryAddress: "89 Gupkar Road, Srinagar", createdAt: "2025-08-10T11:00:00", updatedAt: "2025-08-10T11:05:00" },
  { id: "ORD-7004", customer: "Bilal Ahmad", phone: "+91 87654 32109", items: [{ name: "Rice - Basmati", quantity: 5, price: 189, image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&h=100&fit=crop" }, { name: "Cooking Oil", quantity: 3, price: 159, image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100&h=100&fit=crop" }], total: 1422, status: "Ready for Pickup", paymentStatus: "Paid", paymentMethod: "UPI", deliveryAddress: "23 Dalgate, Srinagar", createdAt: "2025-08-10T08:45:00", updatedAt: "2025-08-10T09:30:00" },
  { id: "ORD-7005", customer: "Zainab Khan", phone: "+91 98765 11111", items: [{ name: "Banana (Yellow)", quantity: 2, price: 59, image: "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=100&h=100&fit=crop" }, { name: "Green Capsicum", quantity: 1, price: 39, image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=100&h=100&fit=crop" }], total: 157, status: "Delivered", paymentStatus: "Paid", paymentMethod: "Cash on Delivery", deliveryAddress: "67 Rajbagh, Srinagar", createdAt: "2025-08-09T16:00:00", updatedAt: "2025-08-09T17:30:00" },
  { id: "ORD-7006", customer: "Omar Farooq", phone: "+91 91234 56789", items: [{ name: "Amul Butter", quantity: 2, price: 199, image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&h=100&fit=crop" }], total: 398, status: "Completed", paymentStatus: "Paid", paymentMethod: "UPI", deliveryAddress: "34 Nowhatta, Srinagar", createdAt: "2025-08-09T12:00:00", updatedAt: "2025-08-09T13:00:00" },
  { id: "ORD-7007", customer: "Nadia Jeelani", phone: "+91 92345 67890", items: [{ name: "Cooking Oil", quantity: 1, price: 159, image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100&h=100&fit=crop" }, { name: "Rice - Basmati", quantity: 2, price: 189, image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&h=100&fit=crop" }], total: 537, status: "New", paymentStatus: "Paid", paymentMethod: "Cash on Delivery", deliveryAddress: "15 Hawal, Srinagar", createdAt: "2025-08-10T12:00:00", updatedAt: "2025-08-10T12:00:00" },
  { id: "ORD-7008", customer: "Tariq Malik", phone: "+91 93456 78901", items: [{ name: "Fresh Tomatoes", quantity: 3, price: 45, image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=100&h=100&fit=crop" }, { name: "Curd", quantity: 1, price: 35, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=100&h=100&fit=crop" }], total: 170, status: "Cancelled", paymentStatus: "Refunded", paymentMethod: "UPI", deliveryAddress: "7 Lal Chowk, Srinagar", createdAt: "2025-08-09T14:30:00", updatedAt: "2025-08-09T15:00:00" },
];

export const shopOffers = [
  { id: "off1", title: "10% Off on Groceries", description: "Get 10% discount on all grocery items above ₹200.", type: "percentage", value: 10, minOrder: 200, maxDiscount: 50, productSpecific: false, products: [], validFrom: "2025-08-01", validTill: "2025-08-31", usageLimit: 100, usedCount: 34, active: true },
  { id: "off2", title: "Flat ₹50 Off", description: "Flat ₹50 off on orders above ₹500.", type: "fixed", value: 50, minOrder: 500, maxDiscount: 50, productSpecific: false, products: [], validFrom: "2025-08-05", validTill: "2025-09-05", usageLimit: 200, usedCount: 67, active: true },
  { id: "off3", title: "Fresh Fruits Deal", description: "15% off on all fruits. Limited time offer.", type: "percentage", value: 15, minOrder: 100, maxDiscount: 30, productSpecific: true, products: ["Banana (Yellow)"], validFrom: "2025-08-10", validTill: "2025-08-20", usageLimit: 50, usedCount: 12, active: true },
];

export const shopReviews = [
  { id: "r1", customer: "Aisha Bhat", rating: 5, comment: "Excellent service! Fresh vegetables delivered right on time. Will order again.", date: "2025-08-08", orderId: "ORD-6901" },
  { id: "r2", customer: "Imran Shah", rating: 4, comment: "Good quality products. Bread was very fresh. Delivery was a bit late though.", date: "2025-08-07", orderId: "ORD-6890" },
  { id: "r3", customer: "Sofia Mir", rating: 5, comment: "Best grocery store in Srinagar! Prices are reasonable and delivery is fast.", date: "2025-08-06", orderId: "ORD-6880" },
  { id: "r4", customer: "Bilal Ahmad", rating: 4, comment: "Rice quality was good but packing could be better.", date: "2025-08-05", orderId: "ORD-6870" },
  { id: "r5", customer: "Zainab Khan", rating: 3, comment: "Some items were missing from my order. Customer support was helpful though.", date: "2025-08-04", orderId: "ORD-6860" },
  { id: "r6", customer: "Omar Farooq", rating: 5, comment: "Amazing freshness guaranteed! The butter and curd were top-notch quality.", date: "2025-08-03", orderId: "ORD-6850" },
  { id: "r7", customer: "Nadia Jeelani", rating: 4, comment: "Great selection of products. Delivery partner was polite and professional.", date: "2025-08-02", orderId: "ORD-6840" },
];

export const shopEarnings = {
  total: 48750,
  today: 2850,
  thisMonth: 28750,
  lastMonth: 20000,
  pendingSettlement: 5200,
  completedOrders: 156,
  averageOrderValue: 312,
  transactions: [
    { id: "txn1", orderId: "ORD-7005", amount: 157, date: "2025-08-09", status: "Settled", method: "COD" },
    { id: "txn2", orderId: "ORD-7006", amount: 398, date: "2025-08-09", status: "Settled", method: "UPI" },
    { id: "txn3", orderId: "ORD-7004", amount: 1422, date: "2025-08-10", status: "Pending", method: "UPI" },
    { id: "txn4", orderId: "ORD-7002", amount: 217, date: "2025-08-10", status: "Pending", method: "COD" },
    { id: "txn5", orderId: "ORD-7003", amount: 397, date: "2025-08-10", status: "Pending", method: "UPI" },
    { id: "txn6", orderId: "ORD-6990", amount: 540, date: "2025-08-08", status: "Settled", method: "UPI" },
    { id: "txn7", orderId: "ORD-6985", amount: 189, date: "2025-08-08", status: "Settled", method: "COD" },
    { id: "txn8", orderId: "ORD-6980", amount: 720, date: "2025-08-07", status: "Settled", method: "UPI" },
    { id: "txn9", orderId: "ORD-6975", amount: 310, date: "2025-08-07", status: "Settled", method: "UPI" },
    { id: "txn10", orderId: "ORD-6970", amount: 99, date: "2025-08-06", status: "Settled", method: "COD" },
  ],
};

export const shopNotifications = [
  { id: "n1", text: "New order #ORD-7001 received from Aisha Bhat", time: "2m ago", read: false, type: "order" },
  { id: "n2", text: "New order #ORD-7007 received from Nadia Jeelani", time: "15m ago", read: false, type: "order" },
  { id: "n3", text: "Order #ORD-7005 delivered successfully", time: "1h ago", read: true, type: "delivery" },
  { id: "n4", text: "Customer left a 5-star review", time: "3h ago", read: true, type: "review" },
  { id: "n5", text: "Your offer '10% Off on Groceries' has been used 34 times", time: "1d ago", read: true, type: "offer" },
  { id: "n6", text: "Settlement of ₹540 has been credited to your account", time: "2d ago", read: true, type: "payment" },
];
