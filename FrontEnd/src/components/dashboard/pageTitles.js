const PAGE_TITLES = {
  "/admin/dashboard": "Dashboard",
  "/admin/users/customers": "Customers",
  "/admin/users/shopkeepers": "Shopkeepers",
  "/admin/users/delivery-partners": "Delivery Partners",
  "/admin/shops/requests": "Shop Type Requests",
  "/admin/shops": "Shops",
  "/admin/products": "Products",
  "/admin/approvals/shopkeepers": "Shopkeeper Approvals",
  "/admin/approvals/delivery-partners": "Delivery Approvals",
  "/admin/orders": "Orders",
  "/admin/deliveries": "Delivery Monitoring",
  "/admin/payments": "Payments",
  "/admin/offers": "Offers",
  "/admin/reports/sales": "Sales Reports",
  "/admin/reports/users": "User Reports",
  "/admin/reports/delivery": "Delivery Reports",
  "/admin/reports": "Reports",
  "/admin/notifications": "Notifications",
  "/admin/profile": "Profile",
  "/admin/settings": "Settings",

  "/shopkeeper/dashboard": "Dashboard",
  "/shopkeeper/shop/edit": "Edit Shop",
  "/shopkeeper/shop": "My Shop",
  "/shopkeeper/settings": "Shop Settings",
  "/shopkeeper/products/add": "Add Product",
  "/shopkeeper/products": "Products",
  "/shopkeeper/orders": "Orders",
  "/shopkeeper/ready-for-pickup": "Ready for Pickup",
  "/shopkeeper/offers/create": "Create Offer",
  "/shopkeeper/offers": "Offers",
  "/shopkeeper/earnings": "Earnings",
  "/shopkeeper/reviews": "Reviews",
  "/shopkeeper/profile": "Profile",

  "/customer/dashboard": "Dashboard",
  "/customer/cart": "Cart",
  "/customer/shops": "Shops",
  "/customer/products": "Products",
  "/customer/product": "Product Details",
  "/customer/categories": "Categories",
  "/customer/checkout": "Checkout",
  "/customer/orders": "My Orders",
  "/customer/wishlist": "Wishlist",
  "/customer/addresses": "Addresses",
  "/customer/profile": "Profile",
  "/customer/payments": "Payments",

  "/delivery/dashboard": "Dashboard",
  "/delivery/available": "Available Deliveries",
  "/delivery/details": "Delivery Details",
  "/delivery/active": "Active Delivery",
  "/delivery/pickup-confirmed": "Pickup Confirmed",
  "/delivery/pickup": "Pickup Verification",
  "/delivery/verify": "Delivery Verification",
  "/delivery/completed": "Delivery Completed",
  "/delivery/history": "Delivery History",
  "/delivery/order": "Order Details",
  "/delivery/earnings": "Earnings",
  "/delivery/notifications": "Notifications",
  "/delivery/profile/settings": "Profile Settings",
  "/delivery/profile": "Profile",
};

export function resolvePageTitle(pathname) {
  if (!pathname) return "Dashboard";
  if (pathname.includes("/track")) return "Track Order";
  if (pathname.endsWith("/edit")) {
    if (pathname.includes("/products/")) return "Edit Product";
    if (pathname.includes("/shop")) return "Edit Shop";
  }

  const exact = PAGE_TITLES[pathname];
  if (exact) return exact;

  const match = Object.keys(PAGE_TITLES)
    .filter((path) => pathname === path || pathname.startsWith(`${path}/`))
    .sort((a, b) => b.length - a.length)[0];

  return PAGE_TITLES[match] || "Dashboard";
}
