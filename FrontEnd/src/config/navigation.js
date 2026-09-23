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
      { name: "Become a Vendor", to: "/register?role=shopkeeper" },
      { name: "Careers", to: "/contact" },
    ],
  },
  {
    title: "Shop",
    links: [
      { name: "Marketplace", to: "/marketplace" },
      { name: "Categories", to: "/categories" },
      { name: "Grocery", to: "/marketplace/grocery" },
      { name: "Fruits & Veggies", to: "/marketplace/fruits-veggies" },
      { name: "Dairy & Bakery", to: "/marketplace/dairy-bakery" },
      { name: "Beverages", to: "/marketplace/beverages" },
      { name: "MB Collection", to: "/marketplace/fashion" },
      { name: "Fresh Basket", to: "/marketplace/grocery" },
      { name: "Kiryana Plus", to: "/marketplace/grocery" },
      { name: "Health Plus", to: "/marketplace/pharmacy" },
      { name: "Tech World", to: "/marketplace/electronics" },
    ],
  },
  {
    title: "More categories",
    links: [
      { name: "Fashion", to: "/marketplace/fashion" },
      { name: "Electronics", to: "/marketplace/electronics" },
      { name: "Pharmacy", to: "/marketplace/pharmacy" },
      { name: "Beauty", to: "/marketplace/beauty" },
      { name: "Daily essentials", to: "/marketplace/grocery" },
    ],
  },
  {
    title: "Partners & help",
    links: [
      { name: "Become a Vendor", to: "/register?role=shopkeeper" },
      { name: "Join as a Rider", to: "/register?role=delivery" },
      { name: "Help Center", to: "/contact" },
      { name: "Support", to: "/contact" },
    ],
  },
];

export default publicNav;
