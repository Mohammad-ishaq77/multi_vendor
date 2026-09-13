export const adminProfile = {
  id: "ADM-001",
  name: "Farooq Ahmad Rather",
  email: "farooq.rather@nearmart.com",
  phone: "+91 7006123456",
  role: "Super Admin",
  avatar: "",
  joinedDate: "2024-01-15",
  lastLogin: "2026-09-08T10:23:00",
  status: "active",
};

export const dashboardStats = {
  totalUsers: 52,
  totalShops: 12,
  totalOrders: 847,
  totalRevenue: 1243680,
  monthlyRevenue: 186540,
  pendingOrders: 14,
  activeDeliveryPartners: 10,
  averageOrderValue: 472,
  totalCustomers: 25,
  totalShopkeepers: 12,
  totalDeliveryPartners: 12,
  platformEarnings: 248736,
  partnerEarnings: 994944,
  shopkeeperEarnings: 892440,
 本月Orders: 112,
  cancelledOrders: 31,
  deliveredOrders: 802,
  averageDeliveryTime: 38,
  customerSatisfaction: 4.3,
  repeatCustomers: 18,
  topPerformingCategory: "Groceries",
  peakOrderHour: "6:00 PM - 8:00 PM",
};

export const revenueBreakdown = {
  months: [
    { month: "Jan", revenue: 89200, orders: 67 },
    { month: "Feb", revenue: 95400, orders: 72 },
    { month: "Mar", revenue: 112800, orders: 85 },
    { month: "Apr", revenue: 104500, orders: 79 },
    { month: "May", revenue: 136200, orders: 103 },
    { month: "Jun", revenue: 128900, orders: 97 },
    { month: "Jul", revenue: 152300, orders: 115 },
    { month: "Aug", revenue: 164800, orders: 124 },
    { month: "Sep", revenue: 149580, orders: 112 },
  ],
};

export const deliveryFeeRules = {
  distanceSlabs: [
    { minDistance: 0, maxDistance: 5, minOrder: 100, baseFee: 15, perKmAfterFirst: 5 },
    { minDistance: 5, maxDistance: 10, minOrder: 150, baseFee: 15, perKmAfterFirst: 5 },
    { minDistance: 10, maxDistance: 15, minOrder: 250, baseFee: 15, perKmAfterFirst: 5 },
    { minDistance: 15, maxDistance: 20, minOrder: 350, baseFee: 15, perKmAfterFirst: 5 },
  ],
  firstKmFee: 15,
  additionalKmFee: 5,
  maxDeliveryFee: 110,
  partnerShare: 0.8,
  platformShare: 0.2,
};

export const recentActivity = [
  { id: 1, type: "order", message: "New order ORD-1031 placed by Aamir Shah", time: "2 min ago" },
  { id: 2, type: "delivery", message: "Order ORD-1028 delivered by Tariq Ahmad", time: "8 min ago" },
  { id: 3, type: "shop", message: "Kashmir Spices updated menu", time: "15 min ago" },
  { id: 4, type: "user", message: "New customer registration: Nasreen Bano", time: "22 min ago" },
  { id: 5, type: "report", message: "Complaint #RPT-108: Late delivery reported", time: "35 min ago" },
  { id: 6, type: "order", message: "Order ORD-1030 cancelled by customer", time: "41 min ago" },
  { id: 7, type: "delivery", message: "New delivery partner joined: Imran Lone", time: "1 hour ago" },
  { id: 8, type: "shop", message: "Dal Lake Fresh received 5-star review", time: "1.5 hours ago" },
];
