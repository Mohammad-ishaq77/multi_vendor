export const publicNav = [
  { label: "Home", to: "/" },
  { label: "Categories", to: "/categories" },
  { label: "Marketplace", to: "/marketplace" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export const footerColumns = [
  {
    title: "Company",
    links: [
      { name: "About Us", to: "/about" },
      { name: "Contact Us", to: "/contact" },
      { name: "Become a Vendor", to: "/register" },
      { name: "Careers", to: "/contact" },
    ],
  },
  {
    title: "Shop",
    links: [
      { name: "Marketplace", to: "/marketplace" },
      { name: "Categories", to: "/categories" },
      { name: "Grocery", to: "/marketplace/grocery" },
      { name: "Fashion", to: "/marketplace/fashion" },
    ],
  },
  {
    title: "Partners",
    links: [
      { name: "Electronics", to: "/marketplace/electronics" },
      { name: "Beauty", to: "/marketplace/beauty" },
      { name: "Help Center", to: "/contact" },
      { name: "Support", to: "/contact" },
    ],
  },
];

export default publicNav;
