export const HD = (id, extra = "w=1600&q=85") =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&${extra}`;

export const pageHeroes = {
  categories: {
    variant: "split",
    eyebrow: "Eight local aisles",
    title: "Shop",
    highlight: "neighborhood",
    titleMid: "every",
    titleLine: ["Your local", "marketplace,"],
    rotating: ["Delivered", "Nearby", "Fresh", "In minutes"],
    description:
      "Skip the mixed feed. Open grocery, fashion, electronics, beauty and more — each aisle has its own shops, products and a same-day delivery story.",
    image: HD("photo-1534723452862-4c874018d66d"),
    mosaic: [
      HD("photo-1542838132-92c53300491e", "w=800&q=85"),
      HD("photo-1441984904996-e0b6ba687e04", "w=800&q=85"),
      HD("photo-1519389950473-47ba0277781c", "w=800&q=85"),
    ],
    primaryTo: "/marketplace",
    primaryLabel: "Open marketplace",
    secondaryTo: "/register",
    secondaryLabel: "Become a seller",
  },
  marketplace: {
    variant: "overlay",
    eyebrow: "All shops, one map",
    title: "Shop the local marketplace",
    highlight: "in motion",
    description:
      "Search nearby stores, compare products and checkout from the same neighborhood shops you already trust — groceries to gadgets, delivered in minutes.",
    image: HD("photo-1488459716781-31db52582fe9"),
    liveLabel: "12 shops packing now",
    searchPlaceholder: "Search tomatoes, sneakers, pharmacies…",
    chips: [
      { label: "Grocery", to: "/marketplace/grocery" },
      { label: "Fruits & veggies", to: "/marketplace/fruits-veggies" },
      { label: "Fashion", to: "/marketplace/fashion" },
      { label: "Electronics", to: "/marketplace/electronics" },
      { label: "Pharmacy", to: "/marketplace/pharmacy" },
      { label: "Beauty", to: "/marketplace/beauty" },
      { label: "Dairy & bakery", to: "/marketplace/dairy-bakery" },
      { label: "Beverages", to: "/marketplace/beverages" },
    ],
    primaryTo: "/categories",
    primaryLabel: "Browse aisles",
    secondaryTo: "/register",
    secondaryLabel: "Sell with us",
  },
  search: {
    variant: "ribbon",
    eyebrow: "Search results",
    title: "Matching your neighborhood",
    highlight: "search",
    description: "Products, shops and categories filtered from live NearMart listings.",
    image: HD("photo-1604719312566-8912e9227c6a"),
    primaryTo: "/categories",
    primaryLabel: "Browse aisles",
  },
  about: {
    variant: "mosaic",
    eyebrow: "Our story",
    title: "Empowering local.",
    highlight: "Delivering joy.",
    description:
      "NearMart connects customers with trusted shopkeepers and delivery partners in their neighborhood — simple, reliable and built for the street around you.",
    image: HD("photo-1526367790999-0150786686a2"),
    mosaic: [
      HD("photo-1542838132-92c53300491e", "w=800&q=85"),
      HD("photo-1556740749-887f6717d7e4", "w=800&q=85"),
      HD("photo-1578916171728-46686eac8d58", "w=800&q=85"),
    ],
    primaryTo: "/marketplace",
    primaryLabel: "Start shopping",
    secondaryTo: "/contact",
    secondaryLabel: "Talk to us",
  },
  contact: {
    variant: "overlay",
    eyebrow: "Support, partnerships, feedback",
    title: "We're here to help you",
    highlight: "today",
    description:
      "Questions about an order, a shop, or joining NearMart as a vendor or rider? Pick a topic, call, or write — the Srinagar team replies during working hours.",
    image: HD("photo-1556742049-0cfed4f6a45d"),
    showHours: true,
    quickActions: [
      { label: "Call support", meta: "+91 98765 43210", href: "tel:+919876543210", icon: "phone" },
      { label: "Email the team", meta: "support@nearmart.com", href: "mailto:support@nearmart.com", icon: "mail" },
      { label: "Write a message", meta: "We reply in under a day", href: "#contact-form", icon: "message" },
    ],
    chips: [
      { label: "Order help", href: "#contact-form" },
      { label: "Become a vendor", to: "/register" },
      { label: "Ride with us", to: "/register" },
      { label: "Partnerships", href: "#contact-form" },
      { label: "Visit Srinagar HQ", icon: "pin", href: "#contact-form" },
    ],
  },
};

export const homeHero = {
  eyebrow: "Srinagar's neighborhood marketplace",
  titleLine: ["Your local", "marketplace,"],
  rotating: ["Delivered", "Nearby", "Fresh", "In minutes"],
  description:
    "Groceries, fashion, electronics, beauty and pharmacy from the shops you already know. Compare prices, checkout once, and get it at your door the same day.",
  image: HD("photo-1542838132-92c53300491e"),
};

export const aboutHero = {
  eyebrow: "Our story",
  titleLine: ["Your local", "marketplace,"],
  rotating: ["Delivered", "Nearby", "Fresh", "In minutes"],
  description:
    "NearMart connects customers with trusted shopkeepers and delivery partners in their neighborhood — simple, reliable and built for the street around you.",
};

export const homeFloatCards = [
  {
    title: "Fresh produce",
    meta: "From 18+ sellers",
    image: HD("photo-1610832958506-aa56368176cf", "w=700&q=85"),
  },
  {
    title: "Local fashion",
    meta: "Boutiques nearby",
    image: HD("photo-1441984904996-e0b6ba687e04", "w=700&q=85"),
  },
  {
    title: "Daily grocery",
    meta: "Same-day drop",
    image: HD("photo-1578916171728-46686eac8d58", "w=700&q=85"),
  },
];

export default pageHeroes;
