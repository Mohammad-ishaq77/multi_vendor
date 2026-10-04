export const ROLES = {
  ADMIN: "admin",
  SHOPKEEPER: "shopkeeper",
  CUSTOMER: "customer",
  DELIVERY: "delivery",
};

/**
 * Roles that can be picked on the public sign-in / sign-up screens.
 * `admin` is intentionally excluded: administrator accounts are created out of
 * band and authenticate through the dedicated `/admin` portal.
 */
export const PUBLIC_ROLE_META = [
  {
    id: ROLES.SHOPKEEPER,
    label: "Vendor",
    description: "Sell from your local shop",
    dashboard: "/shopkeeper/dashboard",
    icon: "Store",
  },
  {
    id: ROLES.CUSTOMER,
    label: "Customer",
    description: "Shop from nearby stores",
    dashboard: "/customer/dashboard",
    icon: "ShoppingBag",
  },
  {
    id: ROLES.DELIVERY,
    label: "Delivery",
    description: "Deliver orders nearby",
    dashboard: "/delivery/dashboard",
    icon: "Truck",
  },
];

export const ROLE_META = [
  {
    id: ROLES.ADMIN,
    label: "Admin",
    description: "Manage the marketplace",
    dashboard: "/admin/dashboard",
    icon: "LayoutDashboard",
  },
  ...PUBLIC_ROLE_META,
];

export const getRoleMeta = (role) =>
  ROLE_META.find((item) => item.id === role) || ROLE_META[2];

export const getDashboardPath = (role) => getRoleMeta(role).dashboard;

export const isValidRole = (role) => ROLE_META.some((item) => item.id === role);

export default ROLES;
