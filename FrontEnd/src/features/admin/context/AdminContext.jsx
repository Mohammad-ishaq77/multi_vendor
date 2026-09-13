import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { adminProfile as defaultAdminProfile } from "../data/adminData";
import { dummyCustomers, dummyShopkeepers, allUsers as dummyUsers } from "../data/dummyUsers";
import { dummyShops } from "../data/dummyShops";
import { dummyDeliveryPartners } from "../data/dummyDeliveryPartners";
import { dummyOrders } from "../data/dummyOrders";
import { dummyReports } from "../data/dummyReports";

const AdminContext = createContext(null);

const LS_PREFIX = "nearmart_admin_";

function loadFromLS(key, fallback) {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToLS(key, value) {
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(value));
  } catch {
    // storage full or unavailable
  }
}

const generateId = (prefix) =>
  `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const now = () => new Date().toISOString();

const today = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString();
};

// ── Inline seed data ──────────────────────────────────────────────────────────

const SEED_CUSTOMERS = [
  {
    id: "USR001",
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    phone: "9876543210",
    role: "customer",
    status: "active",
    avatar: "",
    joinedDate: "2025-01-15T10:00:00.000Z",
    address: "12 MG Road, Bangalore",
    totalOrders: 23,
    totalSpent: 12450,
  },
  {
    id: "USR002",
    name: "Priya Patel",
    email: "priya@gmail.com",
    phone: "9876543211",
    role: "customer",
    status: "active",
    avatar: "",
    joinedDate: "2025-02-20T10:00:00.000Z",
    address: "45 Gandhi Nagar, Mumbai",
    totalOrders: 15,
    totalSpent: 8900,
  },
  {
    id: "USR003",
    name: "Amit Kumar",
    email: "amit@gmail.com",
    phone: "9876543212",
    role: "customer",
    status: "active",
    avatar: "",
    joinedDate: "2025-03-10T10:00:00.000Z",
    address: "78 Nehru Street, Delhi",
    totalOrders: 31,
    totalSpent: 21300,
  },
  {
    id: "USR004",
    name: "Sneha Reddy",
    email: "sneha@gmail.com",
    phone: "9876543213",
    role: "customer",
    status: "suspended",
    avatar: "",
    joinedDate: "2025-04-05T10:00:00.000Z",
    address: "23 Anna Salai, Chennai",
    totalOrders: 7,
    totalSpent: 3200,
  },
  {
    id: "USR005",
    name: "Vikram Singh",
    email: "vikram@gmail.com",
    phone: "9876543214",
    role: "customer",
    status: "active",
    avatar: "",
    joinedDate: "2025-05-12T10:00:00.000Z",
    address: "56 Mall Road, Jaipur",
    totalOrders: 42,
    totalSpent: 34100,
  },
];

const SEED_SHOPKEEPERS = [
  {
    id: "USR010",
    name: "Kiran Mehta",
    email: "kiran@freshmart.com",
    phone: "9876500001",
    role: "shopkeeper",
    status: "active",
    avatar: "",
    joinedDate: "2024-11-01T10:00:00.000Z",
    shopName: "FreshMart",
    shopId: "SHP001",
    totalSales: 189000,
    rating: 4.5,
  },
  {
    id: "USR011",
    name: "Anjali Nair",
    email: "anjali@spicebazaar.com",
    phone: "9876500002",
    role: "shopkeeper",
    status: "active",
    avatar: "",
    joinedDate: "2024-12-10T10:00:00.000Z",
    shopName: "Spice Bazaar",
    shopId: "SHP002",
    totalSales: 145000,
    rating: 4.2,
  },
  {
    id: "USR012",
    name: "Suresh Gupta",
    email: "suresh@greenleaf.com",
    phone: "9876500003",
    role: "shopkeeper",
    status: "active",
    avatar: "",
    joinedDate: "2025-01-20T10:00:00.000Z",
    shopName: "GreenLeaf Organic",
    shopId: "SHP003",
    totalSales: 98000,
    rating: 4.7,
  },
  {
    id: "USR013",
    name: "Meena Iyer",
    email: "meena@homestyle.com",
    phone: "9876500004",
    role: "shopkeeper",
    status: "suspended",
    avatar: "",
    joinedDate: "2025-02-15T10:00:00.000Z",
    shopName: "HomeStyle Kitchen",
    shopId: "SHP004",
    totalSales: 67000,
    rating: 3.8,
  },
  {
    id: "USR014",
    name: "Rajesh Verma",
    email: "rajesh@quickgrocery.com",
    phone: "9876500005",
    role: "shopkeeper",
    status: "active",
    avatar: "",
    joinedDate: "2025-03-01T10:00:00.000Z",
    shopName: "Quick Grocery",
    shopId: "SHP005",
    totalSales: 210000,
    rating: 4.6,
  },
];

const SEED_DELIVERY_PARTNERS = [
  {
    id: "DLP001",
    name: "Arjun Yadav",
    email: "arjun@nearmart.com",
    phone: "9876700001",
    status: "active",
    avatar: "",
    joinedDate: "2024-10-15T10:00:00.000Z",
    vehicleType: "Bike",
    vehicleNumber: "KA01AB1234",
    totalDeliveries: 342,
    rating: 4.8,
    earnings: 68400,
    currentLocation: { lat: 12.9716, lng: 77.5946 },
    isAvailable: true,
  },
  {
    id: "DLP002",
    name: "Deepak Jha",
    email: "deepak@nearmart.com",
    phone: "9876700002",
    status: "active",
    avatar: "",
    joinedDate: "2024-11-20T10:00:00.000Z",
    vehicleType: "Scooter",
    vehicleNumber: "MH02CD5678",
    totalDeliveries: 278,
    rating: 4.5,
    earnings: 55600,
    currentLocation: { lat: 19.076, lng: 72.8777 },
    isAvailable: true,
  },
  {
    id: "DLP003",
    name: "Fatima Begum",
    email: "fatima@nearmart.com",
    phone: "9876700003",
    status: "active",
    avatar: "",
    joinedDate: "2025-01-05T10:00:00.000Z",
    vehicleType: "Bicycle",
    vehicleNumber: "DL03EF9012",
    totalDeliveries: 156,
    rating: 4.9,
    earnings: 31200,
    currentLocation: { lat: 28.6139, lng: 77.209 },
    isAvailable: false,
  },
  {
    id: "DLP004",
    name: "Manoj Tiwari",
    email: "manoj@nearmart.com",
    phone: "9876700004",
    status: "inactive",
    avatar: "",
    joinedDate: "2025-02-10T10:00:00.000Z",
    vehicleType: "Van",
    vehicleNumber: "TN04GH3456",
    totalDeliveries: 89,
    rating: 4.1,
    earnings: 26700,
    currentLocation: { lat: 13.0827, lng: 80.2707 },
    isAvailable: false,
  },
  {
    id: "DLP005",
    name: "Sunita Devi",
    email: "sunita@nearmart.com",
    phone: "9876700005",
    status: "active",
    avatar: "",
    joinedDate: "2025-04-01T10:00:00.000Z",
    vehicleType: "Bike",
    vehicleNumber: "RJ05IJ7890",
    totalDeliveries: 67,
    rating: 4.6,
    earnings: 13400,
    currentLocation: { lat: 26.9124, lng: 75.7873 },
    isAvailable: true,
  },
];

const SEED_SHOPS = [
  {
    id: "SHP001",
    name: "FreshMart",
    ownerId: "USR010",
    ownerName: "Kiran Mehta",
    type: "Grocery",
    status: "active",
    address: "10 Brigade Road, Bangalore",
    phone: "9876500001",
    email: "kiran@freshmart.com",
    rating: 4.5,
    totalProducts: 120,
    totalOrders: 890,
    totalRevenue: 456000,
    image: "",
    createdAt: "2024-11-01T10:00:00.000Z",
    commission: 5,
    isOpen: true,
    operatingHours: "8:00 AM - 10:00 PM",
    deliveryRadius: 5,
  },
  {
    id: "SHP002",
    name: "Spice Bazaar",
    ownerId: "USR011",
    ownerName: "Anjali Nair",
    type: "Spices & Herbs",
    status: "active",
    address: "22 Commercial Street, Bangalore",
    phone: "9876500002",
    email: "anjali@spicebazaar.com",
    rating: 4.2,
    totalProducts: 85,
    totalOrders: 620,
    totalRevenue: 312000,
    image: "",
    createdAt: "2024-12-10T10:00:00.000Z",
    commission: 5,
    isOpen: true,
    operatingHours: "9:00 AM - 9:00 PM",
    deliveryRadius: 4,
  },
  {
    id: "SHP003",
    name: "GreenLeaf Organic",
    ownerId: "USR012",
    ownerName: "Suresh Gupta",
    type: "Organic",
    status: "active",
    address: "33 Indiranagar, Bangalore",
    phone: "9876500003",
    email: "suresh@greenleaf.com",
    rating: 4.7,
    totalProducts: 65,
    totalOrders: 410,
    totalRevenue: 287000,
    image: "",
    createdAt: "2025-01-20T10:00:00.000Z",
    commission: 5,
    isOpen: true,
    operatingHours: "7:00 AM - 9:00 PM",
    deliveryRadius: 6,
  },
  {
    id: "SHP004",
    name: "HomeStyle Kitchen",
    ownerId: "USR013",
    ownerName: "Meena Iyer",
    type: "Ready-to-Eat",
    status: "suspended",
    address: "44 Koramangala, Bangalore",
    phone: "9876500004",
    email: "meena@homestyle.com",
    rating: 3.8,
    totalProducts: 40,
    totalOrders: 230,
    totalRevenue: 134000,
    image: "",
    createdAt: "2025-02-15T10:00:00.000Z",
    commission: 5,
    isOpen: false,
    operatingHours: "10:00 AM - 8:00 PM",
    deliveryRadius: 3,
  },
  {
    id: "SHP005",
    name: "Quick Grocery",
    ownerId: "USR014",
    ownerName: "Rajesh Verma",
    type: "Grocery",
    status: "active",
    address: "55 Whitefield, Bangalore",
    phone: "9876500005",
    email: "rajesh@quickgrocery.com",
    rating: 4.6,
    totalProducts: 150,
    totalOrders: 1120,
    totalRevenue: 678000,
    image: "",
    createdAt: "2025-03-01T10:00:00.000Z",
    commission: 5,
    isOpen: true,
    operatingHours: "6:00 AM - 11:00 PM",
    deliveryRadius: 7,
  },
];

const SEED_PRODUCTS = [
  { id: "PRD001", shopId: "SHP001", name: "Basmati Rice 5kg", category: "Grains", price: 450, stock: 120, status: "active", image: "", description: "Premium long-grain basmati rice" },
  { id: "PRD002", shopId: "SHP001", name: "Toor Dal 1kg", category: "Pulses", price: 180, stock: 200, status: "active", image: "", description: "Fresh split pigeon peas" },
  { id: "PRD003", shopId: "SHP001", name: "Sunflower Oil 1L", category: "Oils", price: 140, stock: 80, status: "active", image: "", description: "Refined sunflower cooking oil" },
  { id: "PRD004", shopId: "SHP002", name: "Turmeric Powder 200g", category: "Spices", price: 65, stock: 300, status: "active", image: "", description: "Organic turmeric powder" },
  { id: "PRD005", shopId: "SHP002", name: "Red Chilli Powder 500g", category: "Spices", price: 120, stock: 180, status: "active", image: "", description: "Kashmiri red chilli powder" },
  { id: "PRD006", shopId: "SHP002", name: "Garam Masala 100g", category: "Spices", price: 85, stock: 0, status: "out_of_stock", image: "", description: "Blend of 7 spices" },
  { id: "PRD007", shopId: "SHP003", name: "Organic Quinoa 500g", category: "Grains", price: 350, stock: 45, status: "active", image: "", description: "Certified organic quinoa" },
  { id: "PRD008", shopId: "SHP003", name: "Organic Honey 500ml", category: "Sweeteners", price: 280, stock: 60, status: "active", image: "", description: "Raw unfiltered organic honey" },
  { id: "PRD009", shopId: "SHP004", name: "Paneer Tikka Ready Meal", category: "Ready-to-Eat", price: 220, stock: 0, status: "disabled", image: "", description: "Microwave-ready paneer tikka" },
  { id: "PRD010", shopId: "SHP005", name: "Amul Butter 100g", category: "Dairy", price: 56, stock: 250, status: "active", image: "", description: "Fresh butter" },
  { id: "PRD011", shopId: "SHP005", name: "Milk 1L", category: "Dairy", price: 62, stock: 500, status: "active", image: "", description: "Toned milk" },
  { id: "PRD012", shopId: "SHP005", name: "Brown Bread", category: "Bakery", price: 45, stock: 100, status: "active", image: "", description: "Whole wheat brown bread" },
];

const SEED_ORDERS = [
  {
    id: "ORD001",
    customerId: "USR001",
    customerName: "Rahul Sharma",
    shopId: "SHP001",
    shopName: "FreshMart",
    items: [
      { productId: "PRD001", name: "Basmati Rice 5kg", qty: 1, price: 450 },
      { productId: "PRD002", name: "Toor Dal 1kg", qty: 2, price: 180 },
    ],
    totalAmount: 810,
    deliveryFee: 40,
    platformFee: 10,
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "UPI",
    deliveryPartnerId: "DLP001",
    deliveryPartnerName: "Arjun Yadav",
    address: "12 MG Road, Bangalore",
    createdAt: today(-5),
    deliveredAt: today(-4),
    rating: 5,
  },
  {
    id: "ORD002",
    customerId: "USR002",
    customerName: "Priya Patel",
    shopId: "SHP002",
    shopName: "Spice Bazaar",
    items: [
      { productId: "PRD004", name: "Turmeric Powder 200g", qty: 3, price: 65 },
      { productId: "PRD005", name: "Red Chilli Powder 500g", qty: 1, price: 120 },
    ],
    totalAmount: 315,
    deliveryFee: 30,
    platformFee: 10,
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "Card",
    deliveryPartnerId: "DLP002",
    deliveryPartnerName: "Deepak Jha",
    address: "45 Gandhi Nagar, Mumbai",
    createdAt: today(-4),
    deliveredAt: today(-3),
    rating: 4,
  },
  {
    id: "ORD003",
    customerId: "USR003",
    customerName: "Amit Kumar",
    shopId: "SHP003",
    shopName: "GreenLeaf Organic",
    items: [
      { productId: "PRD007", name: "Organic Quinoa 500g", qty: 2, price: 350 },
      { productId: "PRD008", name: "Organic Honey 500ml", qty: 1, price: 280 },
    ],
    totalAmount: 980,
    deliveryFee: 50,
    platformFee: 15,
    status: "out_for_delivery",
    paymentStatus: "paid",
    paymentMethod: "Wallet",
    deliveryPartnerId: "DLP003",
    deliveryPartnerName: "Fatima Begum",
    address: "78 Nehru Street, Delhi",
    createdAt: today(-1),
    deliveredAt: null,
    rating: null,
  },
  {
    id: "ORD004",
    customerId: "USR005",
    customerName: "Vikram Singh",
    shopId: "SHP005",
    shopName: "Quick Grocery",
    items: [
      { productId: "PRD010", name: "Amul Butter 100g", qty: 4, price: 56 },
      { productId: "PRD011", name: "Milk 1L", qty: 3, price: 62 },
      { productId: "PRD012", name: "Brown Bread", qty: 2, price: 45 },
    ],
    totalAmount: 544,
    deliveryFee: 35,
    platformFee: 10,
    status: "processing",
    paymentStatus: "paid",
    paymentMethod: "COD",
    deliveryPartnerId: null,
    deliveryPartnerName: null,
    address: "56 Mall Road, Jaipur",
    createdAt: today(-1),
    deliveredAt: null,
    rating: null,
  },
  {
    id: "ORD005",
    customerId: "USR001",
    customerName: "Rahul Sharma",
    shopId: "SHP001",
    shopName: "FreshMart",
    items: [
      { productId: "PRD003", name: "Sunflower Oil 1L", qty: 2, price: 140 },
    ],
    totalAmount: 280,
    deliveryFee: 25,
    platformFee: 5,
    status: "cancelled",
    paymentStatus: "refunded",
    paymentMethod: "UPI",
    deliveryPartnerId: null,
    deliveryPartnerName: null,
    address: "12 MG Road, Bangalore",
    createdAt: today(-7),
    deliveredAt: null,
    rating: null,
  },
  {
    id: "ORD006",
    customerId: "USR004",
    customerName: "Sneha Reddy",
    shopId: "SHP002",
    shopName: "Spice Bazaar",
    items: [
      { productId: "PRD006", name: "Garam Masala 100g", qty: 5, price: 85 },
    ],
    totalAmount: 425,
    deliveryFee: 30,
    platformFee: 10,
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "UPI",
    deliveryPartnerId: "DLP005",
    deliveryPartnerName: "Sunita Devi",
    address: "23 Anna Salai, Chennai",
    createdAt: today(-3),
    deliveredAt: today(-2),
    rating: 3,
  },
  {
    id: "ORD007",
    customerId: "USR003",
    customerName: "Amit Kumar",
    shopId: "SHP005",
    shopName: "Quick Grocery",
    items: [
      { productId: "PRD011", name: "Milk 1L", qty: 5, price: 62 },
      { productId: "PRD012", name: "Brown Bread", qty: 3, price: 45 },
    ],
    totalAmount: 445,
    deliveryFee: 30,
    platformFee: 10,
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "Cash",
    deliveryPartnerId: "DLP001",
    deliveryPartnerName: "Arjun Yadav",
    address: "78 Nehru Street, Delhi",
    createdAt: today(-6),
    deliveredAt: today(-5),
    rating: 5,
  },
  {
    id: "ORD008",
    customerId: "USR002",
    customerName: "Priya Patel",
    shopId: "SHP001",
    shopName: "FreshMart",
    items: [
      { productId: "PRD001", name: "Basmati Rice 5kg", qty: 1, price: 450 },
    ],
    totalAmount: 450,
    deliveryFee: 35,
    platformFee: 10,
    status: "confirmed",
    paymentStatus: "paid",
    paymentMethod: "UPI",
    deliveryPartnerId: null,
    deliveryPartnerName: null,
    address: "45 Gandhi Nagar, Mumbai",
    createdAt: today(0),
    deliveredAt: null,
    rating: null,
  },
];

const SEED_REPORTS = [
  {
    id: "RPT001",
    type: "order",
    reportedBy: "USR001",
    reporterName: "Rahul Sharma",
    targetId: "ORD005",
    targetType: "order",
    subject: "Damaged product received",
    description: "The oil bottle was leaking upon delivery. Requesting a full refund.",
    status: "open",
    priority: "high",
    createdAt: today(-6),
    resolvedAt: null,
    assignedTo: null,
    resolution: null,
  },
  {
    id: "RPT002",
    type: "user",
    reportedBy: "USR012",
    reporterName: "Suresh Gupta",
    targetId: "USR004",
    targetType: "customer",
    subject: "Fraudulent order placement",
    description: "Customer placed order and falsely reported non-delivery. CCTV shows delivery was made.",
    status: "in_review",
    priority: "high",
    createdAt: today(-4),
    resolvedAt: null,
    assignedTo: "ADM001",
    resolution: null,
  },
  {
    id: "RPT003",
    type: "delivery",
    reportedBy: "USR003",
    reporterName: "Amit Kumar",
    targetId: "DLP003",
    targetType: "delivery_partner",
    subject: "Late delivery",
    description: "Order was 2 hours late despite being marked as out for delivery on time.",
    status: "open",
    priority: "medium",
    createdAt: today(-2),
    resolvedAt: null,
    assignedTo: null,
    resolution: null,
  },
  {
    id: "RPT004",
    type: "shop",
    reportedBy: "USR005",
    reporterName: "Vikram Singh",
    targetId: "SHP004",
    targetType: "shop",
    subject: "Expired products sold",
    description: "Received expired ready-to-eat meal. Best before date had passed.",
    status: "resolved",
    priority: "high",
    createdAt: today(-10),
    resolvedAt: today(-8),
    assignedTo: "ADM001",
    resolution: "Shop warned. Refund issued to customer. Shop placed on probation.",
  },
  {
    id: "RPT005",
    type: "system",
    reportedBy: "USR002",
    reporterName: "Priya Patel",
    targetId: null,
    targetType: "platform",
    subject: "Payment gateway error",
    description: "Card payment was debited but order shows as failed. Transaction ID: TXN98765.",
    status: "open",
    priority: "critical",
    createdAt: today(0),
    resolvedAt: null,
    assignedTo: null,
    resolution: null,
  },
];

const SEED_SHOP_TYPE_REQUESTS = [
  { id: "STR001", shopkeeperId: "USR015", shopkeeperName: "Nitin Desai", requestedType: "Pharmacy", status: "pending", description: "Online pharmacy selling OTC medicines and wellness products", documents: ["drug_license.pdf", "shop_establishment.pdf"], createdAt: today(-2) },
  { id: "STR002", shopkeeperId: "USR016", shopkeeperName: "Pooja Sharma", requestedType: "Pet Supplies", status: "pending", description: "Pet food, accessories, and grooming products", documents: ["gst_certificate.pdf"], createdAt: today(-3) },
  { id: "STR003", shopkeeperId: "USR017", shopkeeperName: "Arun Pillai", requestedType: "Flowers & Gifts", status: "approved", description: "Fresh flowers, bouquets, and gift hampers", documents: ["trade_license.pdf"], createdAt: today(-5) },
  { id: "STR004", shopkeeperId: "USR018", shopkeeperName: "Divya Rao", requestedType: "Stationery", status: "pending", description: "Books, pens, art supplies, and office stationery", documents: ["gst_certificate.pdf", "shop_photos.zip"], createdAt: today(-1) },
  { id: "STR005", shopkeeperId: "USR019", shopkeeperName: "Sanjay Kulkarni", requestedType: "Electronics", status: "rejected", description: "Mobile accessories, cables, and gadgets", documents: ["gst_certificate.pdf"], createdAt: today(-7), rejectionReason: "Requires additional electronics trade license" },
  { id: "STR006", shopkeeperId: "USR020", shopkeeperName: "Kavita Joshi", requestedType: "Baby Care", status: "pending", description: "Diapers, baby food, toys, and maternity products", documents: ["gst_certificate.pdf", "brand_authorization.pdf"], createdAt: today(-4) },
];

const SEED_APPROVALS = [
  { id: "APR001", type: "shopkeeper", applicantId: "USR021", applicantName: "Mohit Bansal", email: "mohit@organicfarm.com", phone: "9876800001", shopName: "Organic Farm Direct", shopType: "Organic", status: "pending", appliedAt: today(-1), documents: ["aadhaar.pdf", "pan_card.pdf", "shop_lease.pdf"], notes: "Plans to sell farm-fresh organic produce directly from their farm in Coorg." },
  { id: "APR002", type: "shopkeeper", applicantId: "USR022", applicantName: "Lata Menon", email: "lata@bakerybliss.com", phone: "9876800002", shopName: "Bakery Bliss", shopType: "Bakery", status: "pending", appliedAt: today(-2), documents: ["aadhaar.pdf", "fssai_license.pdf"], notes: "Home bakery transitioning to commercial. FSSAI certified." },
  { id: "APR003", type: "delivery_partner", applicantId: "DLP006", applicantName: "Ravi Shankar", email: "ravi@nearmart.com", phone: "9876800003", vehicleType: "Bike", vehicleNumber: "KA06KL1111", status: "pending", appliedAt: today(-1), documents: ["driving_license.pdf", "rc_book.pdf", "insurance.pdf"], notes: "2 years delivery experience with previous platform." },
  { id: "APR004", type: "delivery_partner", applicantId: "DLP007", applicantName: "Anita Kumari", email: "anita@nearmart.com", phone: "9876800004", vehicleType: "Scooter", vehicleNumber: "MH12MN2222", status: "pending", appliedAt: today(-3), documents: ["driving_license.pdf", "rc_book.pdf"], notes: "Part-time delivery. Available evenings and weekends." },
  { id: "APR005", type: "shopkeeper", applicantId: "USR023", applicantName: "Tariq Khan", email: "tariq@meatmaster.com", phone: "9876800005", shopName: "Meat Master", shopType: "Meat & Seafood", status: "pending", appliedAt: today(0), documents: ["aadhaar.pdf", "fssai_license.pdf", "veterinary_cert.pdf"], notes: "Licensed butcher shop with cold storage." },
  { id: "APR006", type: "delivery_partner", applicantId: "DLP008", applicantName: "Prakash Naik", email: "prakash@nearmart.com", phone: "9876800006", vehicleType: "Van", vehicleNumber: "GA03OP3333", status: "pending", appliedAt: today(-4), documents: ["driving_license.pdf", "rc_book.pdf", "fitness_cert.pdf"], notes: "Heavy vehicle experience. Can handle bulk deliveries." },
];

const SEED_NOTIFICATIONS = [
  { id: "NTF001", type: "order", title: "New order received", message: "Order ORD008 placed by Priya Patel for ₹450", isRead: false, createdAt: today(0), link: "/admin/orders/ORD008" },
  { id: "NTF002", type: "approval", title: "New shopkeeper application", message: "Mohit Bansal applied for Organic Farm Direct shop", isRead: false, createdAt: today(-1), link: "/admin/approvals" },
  { id: "NTF003", type: "report", title: "Critical report filed", message: "Payment gateway error reported by Priya Patel", isRead: false, createdAt: today(0), link: "/admin/reports" },
  { id: "NTF004", type: "delivery", title: "Delivery partner offline", message: "Manoj Tiwari has been inactive for 7 days", isRead: false, createdAt: today(-2), link: "/admin/delivery-partners" },
  { id: "NTF005", type: "shop", title: "Shop suspended", message: "HomeStyle Kitchen suspended for expired products", isRead: true, createdAt: today(-10), link: "/admin/shops/SHP004" },
  { id: "NTF006", type: "order", title: "Order cancelled", message: "Order ORD005 cancelled. Refund of ₹280 initiated", isRead: true, createdAt: today(-7), link: "/admin/orders/ORD005" },
  { id: "NTF007", type: "payment", title: "Payment settled", message: "Weekly settlement of ₹12,450 to FreshMart completed", isRead: true, createdAt: today(-3), link: "/admin/payments" },
  { id: "NTF008", type: "system", title: "Platform maintenance", message: "Scheduled maintenance window: Sunday 2 AM - 4 AM", isRead: true, createdAt: today(-5), link: "/admin/settings" },
  { id: "NTF009", type: "user", title: "User suspended", message: "Customer Sneha Reddy suspended for fraudulent claims", isRead: false, createdAt: today(-1), link: "/admin/users" },
  { id: "NTF010", type: "order", title: "Bulk order alert", message: "Order ORD003 contains 3+ high-value items", isRead: false, createdAt: today(-1), link: "/admin/orders/ORD003" },
  { id: "NTF011", type: "approval", title: "Delivery partner application", message: "Ravi Shankar applied as delivery partner with Bike", isRead: false, createdAt: today(-1), link: "/admin/approvals" },
  { id: "NTF012", type: "shop", title: "New shop type request", message: "Nitin Desai requesting Pharmacy shop type", isRead: false, createdAt: today(-2), link: "/admin/shops/shop-type-requests" },
  { id: "NTF013", type: "payment", title: "Refund processed", message: "₹280 refunded to Rahul Sharma for cancelled order", isRead: true, createdAt: today(-7), link: "/admin/payments" },
  { id: "NTF014", type: "delivery", title: "Delivery completed", message: "Arjun Yadav completed delivery for ORD001", isRead: true, createdAt: today(-4), link: "/admin/deliveries" },
  { id: "NTF015", type: "system", title: "New feature deployed", message: "Offer management module is now live", isRead: true, createdAt: today(-8), link: "/admin/offers" },
  { id: "NTF016", type: "order", title: "Rating received", message: "5-star rating for FreshMart from ORD007", isRead: true, createdAt: today(-5), link: "/admin/shops/SHP001" },
  { id: "NTF017", type: "report", title: "Report resolved", message: "Expired products report resolved - shop on probation", isRead: true, createdAt: today(-8), link: "/admin/reports" },
];

const SEED_OFFERS = [
  { id: "OFR001", code: "WELCOME20", title: "Welcome Offer", description: "20% off on first order", type: "percentage", value: 20, minOrder: 200, maxDiscount: 100, applicableShops: ["all"], status: "active", usageLimit: 1000, usedCount: 342, startDate: today(-30), endDate: today(30), createdAt: today(-30) },
  { id: "OFR002", code: "FLAT50", title: "Flat ₹50 Off", description: "Flat ₹50 off on orders above ₹500", type: "flat", value: 50, minOrder: 500, maxDiscount: 50, applicableShops: ["SHP001", "SHP005"], status: "active", usageLimit: 500, usedCount: 128, startDate: today(-15), endDate: today(15), createdAt: today(-15) },
  { id: "OFR003", code: "FREEDEL", title: "Free Delivery", description: "Free delivery on orders above ₹300", type: "delivery", value: 0, minOrder: 300, maxDiscount: 50, applicableShops: ["all"], status: "active", usageLimit: 2000, usedCount: 890, startDate: today(-60), endDate: today(60), createdAt: today(-60) },
  { id: "OFR004", code: "SPICE15", title: "Spice Bazaar Sale", description: "15% off on all spices", type: "percentage", value: 15, minOrder: 100, maxDiscount: 75, applicableShops: ["SHP002"], status: "inactive", usageLimit: 200, usedCount: 200, startDate: today(-45), endDate: today(-10), createdAt: today(-45) },
  { id: "OFR005", code: "ORGANIC10", title: "Organic Week", description: "10% off on organic products", type: "percentage", value: 10, minOrder: 150, maxDiscount: 60, applicableShops: ["SHP003"], status: "active", usageLimit: 300, usedCount: 45, startDate: today(-5), endDate: today(20), createdAt: today(-5) },
];

const SEED_SETTINGS = {
  platformName: "NearMart",
  platformEmail: "support@nearmart.com",
  platformPhone: "1800-123-4567",
  defaultCurrency: "INR",
  platformCommission: 5,
  deliveryPartnerCommission: 80,
  nearMartDeliveryShare: 20,
  minOrderAmount: 100,
  maxDeliveryRadius: 15,
  defaultDeliveryFee: 30,
  freeDeliveryThreshold: 300,
  taxRate: 0,
  supportHours: "9:00 AM - 9:00 PM",
  maintenanceMode: false,
  autoApproveShops: false,
  autoApproveDeliveryPartners: false,
  orderTimeout: 30,
  cancellationWindow: 10,
  refundProcessingDays: 3,
  platformCurrency: "₹",
};

const SEED_RECENT_ACTIVITIES = [
  { id: "ACT001", type: "order", message: "New order ORD008 placed by Priya Patel", timestamp: today(0), icon: "shopping-cart" },
  { id: "ACT002", type: "delivery", message: "Order ORD003 out for delivery by Fatima Begum", timestamp: today(-1), icon: "truck" },
  { id: "ACT003", type: "approval", message: "Mohit Bansal applied as shopkeeper", timestamp: today(-1), icon: "user-plus" },
  { id: "ACT004", type: "report", message: "Critical payment report filed by Priya Patel", timestamp: today(0), icon: "alert-triangle" },
  { id: "ACT005", type: "shop", message: "HomeStyle Kitchen suspended", timestamp: today(-10), icon: "store" },
  { id: "ACT006", type: "user", message: "Sneha Reddy suspended for fraud", timestamp: today(-1), icon: "user-x" },
  { id: "ACT007", type: "payment", message: "₹12,450 settled to FreshMart", timestamp: today(-3), icon: "credit-card" },
  { id: "ACT008", type: "offer", message: "Organic Week offer created for GreenLeaf", timestamp: today(-5), icon: "tag" },
  { id: "ACT009", type: "order", message: "Order ORD001 delivered successfully", timestamp: today(-4), icon: "check-circle" },
  { id: "ACT010", type: "delivery", message: "Arjun Yadav completed 342 deliveries", timestamp: today(-4), icon: "award" },
];

// ── Helper: Calculate revenue breakdown ───────────────────────────────────────

function calculateOrderRevenue(order) {
  const productAmount = order.totalAmount;
  const deliveryFee = order.deliveryFee;
  const partnerShare = Math.round(deliveryFee * 0.8);
  const platformShare = Math.round(deliveryFee * 0.2);
  return {
    productAmount,
    toShopkeeper: productAmount,
    deliveryFee,
    deliveryPartnerShare: partnerShare,
    nearMartDeliveryShare: platformShare,
    platformFee: order.platformFee,
    totalToNearMart: platformShare + order.platformFee,
    totalToShopkeeper: productAmount,
    totalToPartner: partnerShare,
  };
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function AdminProvider({ children }) {
  // --- Sidebar ---
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => loadFromLS("sidebarCollapsed", false)
  );

  // --- Admin profile ---
  const [adminProfile, setAdminProfile] = useState(() =>
    loadFromLS("adminProfile", defaultAdminProfile)
  );

  // --- Users ---
  const [customers, setCustomers] = useState(() =>
    loadFromLS(
      "customers",
      dummyUsers.length ? dummyUsers.filter((u) => u.role === "customer") : SEED_CUSTOMERS
    )
  );
  const [shopkeepers, setShopkeepers] = useState(() =>
    loadFromLS(
      "shopkeepers",
      dummyUsers.length ? dummyUsers.filter((u) => u.role === "shopkeeper") : SEED_SHOPKEEPERS
    )
  );
  const [deliveryPartners, setDeliveryPartners] = useState(() =>
    loadFromLS("deliveryPartners", dummyDeliveryPartners.length ? dummyDeliveryPartners : SEED_DELIVERY_PARTNERS)
  );

  // --- Shops & Products ---
  const [shops, setShops] = useState(() =>
    loadFromLS("shops", dummyShops.length ? dummyShops : SEED_SHOPS)
  );
  const [products, setProducts] = useState(() =>
    loadFromLS("products", SEED_PRODUCTS)
  );

  // --- Orders, Deliveries, Payments ---
  const [orders, setOrders] = useState(() =>
    loadFromLS("orders", dummyOrders.length ? dummyOrders : SEED_ORDERS)
  );

  const deliveries = orders
    .filter((o) => ["out_for_delivery", "delivered"].includes(o.status))
    .map((o) => ({
      id: `DLV-${o.id}`,
      orderId: o.id,
      customerName: o.customerName,
      address: o.address,
      partnerId: o.deliveryPartnerId,
      partnerName: o.deliveryPartnerName,
      status: o.status === "delivered" ? "delivered" : "in_transit",
      totalAmount: o.totalAmount + o.deliveryFee,
      createdAt: o.createdAt,
      deliveredAt: o.deliveredAt,
    }));

  const payments = orders
    .filter((o) => o.paymentStatus === "paid" || o.paymentStatus === "refunded")
    .map((o) => {
      const rev = calculateOrderRevenue(o);
      return {
        id: `PAY-${o.id}`,
        orderId: o.id,
        customerName: o.customerName,
        shopName: o.shopName,
        totalAmount: o.totalAmount,
        deliveryFee: o.deliveryFee,
        platformFee: o.platformFee,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        toShopkeeper: rev.toShopkeeper,
        toDeliveryPartner: rev.deliveryPartnerShare,
        toNearMart: rev.totalToNearMart,
        createdAt: o.createdAt,
      };
    });

  // --- Offers ---
  const [offers, setOffers] = useState(() =>
    loadFromLS("offers", SEED_OFFERS)
  );

  // --- Reports ---
  const [reports, setReports] = useState(() =>
    loadFromLS("reports", dummyReports.length ? dummyReports : SEED_REPORTS)
  );

  // --- Notifications ---
  const [notifications, setNotifications] = useState(() =>
    loadFromLS("notifications", SEED_NOTIFICATIONS)
  );

  // --- Shop Type Requests ---
  const [shopTypeRequests, setShopTypeRequests] = useState(() =>
    loadFromLS("shopTypeRequests", SEED_SHOP_TYPE_REQUESTS)
  );

  // --- Approvals ---
  const [approvals, setApprovals] = useState(() =>
    loadFromLS("approvals", SEED_APPROVALS)
  );

  // --- Settings ---
  const [settings, setSettings] = useState(() =>
    loadFromLS("settings", SEED_SETTINGS)
  );

  // --- Recent Activity ---
  const [recentActivities, setRecentActivities] = useState(() =>
    loadFromLS("recentActivities", SEED_RECENT_ACTIVITIES)
  );

  // ── Persist to localStorage on every change ──────────────────────────────────

  useEffect(() => { saveToLS("sidebarCollapsed", sidebarCollapsed); }, [sidebarCollapsed]);
  useEffect(() => { saveToLS("adminProfile", adminProfile); }, [adminProfile]);
  useEffect(() => { saveToLS("customers", customers); }, [customers]);
  useEffect(() => { saveToLS("shopkeepers", shopkeepers); }, [shopkeepers]);
  useEffect(() => { saveToLS("deliveryPartners", deliveryPartners); }, [deliveryPartners]);
  useEffect(() => { saveToLS("shops", shops); }, [shops]);
  useEffect(() => { saveToLS("products", products); }, [products]);
  useEffect(() => { saveToLS("orders", orders); }, [orders]);
  useEffect(() => { saveToLS("offers", offers); }, [offers]);
  useEffect(() => { saveToLS("reports", reports); }, [reports]);
  useEffect(() => { saveToLS("notifications", notifications); }, [notifications]);
  useEffect(() => { saveToLS("shopTypeRequests", shopTypeRequests); }, [shopTypeRequests]);
  useEffect(() => { saveToLS("approvals", approvals); }, [approvals]);
  useEffect(() => { saveToLS("settings", settings); }, [settings]);
  useEffect(() => { saveToLS("recentActivities", recentActivities); }, [recentActivities]);

  // ── Derived state ───────────────────────────────────────────────────────────

  const unreadNotificationCount = notifications.filter((n) => !n.isRead).length;
  const pendingApprovalsCount = approvals.filter((a) => a.status === "pending").length;
  const pendingShopTypeRequestsCount = shopTypeRequests.filter((r) => r.status === "pending").length;
  const openReportsCount = reports.filter((r) => r.status === "open").length;

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + o.totalAmount + o.deliveryFee, 0);

  const totalPlatformEarnings = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => {
      const rev = calculateOrderRevenue(o);
      return sum + rev.totalToNearMart;
    }, 0);

  // ── Actions: Shopkeeper Approvals ───────────────────────────────────────────

  const approveShopkeeper = useCallback((id) => {
    setApprovals((prev) =>
      prev.map((a) => (a.id === id && a.type === "shopkeeper" ? { ...a, status: "approved" } : a))
    );
    addActivity({ type: "approval", message: `Shopkeeper application ${id} approved`, icon: "check-circle" });
  }, []);

  const rejectShopkeeper = useCallback((id, rejectionReason = "") => {
    setApprovals((prev) =>
      prev.map((a) => (a.id === id && a.type === "shopkeeper" ? { ...a, status: "rejected", rejectionReason } : a))
    );
    addActivity({ type: "approval", message: `Shopkeeper application ${id} rejected`, icon: "x-circle" });
  }, []);

  const requestShopkeeperChanges = useCallback((id, message) => {
    setApprovals((prev) =>
      prev.map((a) =>
        a.id === id && a.type === "shopkeeper"
          ? { ...a, status: "changes_requested", changesMessage: message }
          : a
      )
    );
  }, []);

  // ── Actions: Delivery Partner Approvals ─────────────────────────────────────

  const approveDeliveryPartner = useCallback((id) => {
    setApprovals((prev) =>
      prev.map((a) => (a.id === id && a.type === "delivery_partner" ? { ...a, status: "approved" } : a))
    );
    addActivity({ type: "approval", message: `Delivery partner application ${id} approved`, icon: "check-circle" });
  }, []);

  const rejectDeliveryPartner = useCallback((id, rejectionReason = "") => {
    setApprovals((prev) =>
      prev.map((a) => (a.id === id && a.type === "delivery_partner" ? { ...a, status: "rejected", rejectionReason } : a))
    );
    addActivity({ type: "approval", message: `Delivery partner application ${id} rejected`, icon: "x-circle" });
  }, []);

  const requestDeliveryPartnerChanges = useCallback((id, message) => {
    setApprovals((prev) =>
      prev.map((a) =>
        a.id === id && a.type === "delivery_partner"
          ? { ...a, status: "changes_requested", changesMessage: message }
          : a
      )
    );
  }, []);

  // ── Actions: Shop Type Requests ─────────────────────────────────────────────

  const approveShopType = useCallback((id) => {
    setShopTypeRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r))
    );
    addActivity({ type: "shop", message: `Shop type request ${id} approved`, icon: "check-circle" });
  }, []);

  const rejectShopType = useCallback((id) => {
    setShopTypeRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r))
    );
    addActivity({ type: "shop", message: `Shop type request ${id} rejected`, icon: "x-circle" });
  }, []);

  // ── Actions: Suspend / Activate Users ───────────────────────────────────────

  const suspendUser = useCallback((id, type) => {
    const setter = type === "customer" ? setCustomers : setShopkeepers;
    setter((prev) => prev.map((u) => (u.id === id ? { ...u, status: "suspended" } : u)));
    addActivity({ type: "user", message: `User ${id} suspended`, icon: "user-x" });
  }, []);

  const activateUser = useCallback((id, type) => {
    const setter = type === "customer" ? setCustomers : setShopkeepers;
    setter((prev) => prev.map((u) => (u.id === id ? { ...u, status: "active" } : u)));
    addActivity({ type: "user", message: `User ${id} activated`, icon: "user-check" });
  }, []);

  // ── Actions: Suspend / Activate Shops ───────────────────────────────────────

  const suspendShop = useCallback((id) => {
    setShops((prev) => prev.map((s) => (s.id === id ? { ...s, status: "suspended", isOpen: false } : s)));
    addActivity({ type: "shop", message: `Shop ${id} suspended`, icon: "store" });
  }, []);

  const activateShop = useCallback((id) => {
    setShops((prev) => prev.map((s) => (s.id === id ? { ...s, status: "active", isOpen: true } : s)));
    addActivity({ type: "shop", message: `Shop ${id} activated`, icon: "store" });
  }, []);

  // ── Actions: Disable / Enable Products ──────────────────────────────────────

  const disableProduct = useCallback((id) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status: "disabled" } : p)));
    addActivity({ type: "product", message: `Product ${id} disabled`, icon: "package" });
  }, []);

  const enableProduct = useCallback((id) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status: "active" } : p)));
    addActivity({ type: "product", message: `Product ${id} enabled`, icon: "package" });
  }, []);

  // ── Actions: Orders ─────────────────────────────────────────────────────────

  const updateOrderStatus = useCallback((orderId, status) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
              deliveredAt: status === "delivered" ? now() : o.deliveredAt,
            }
          : o
      )
    );
    addActivity({ type: "order", message: `Order ${orderId} status updated to ${status}`, icon: "refresh-cw" });
  }, []);

  // ── Actions: Deliveries ─────────────────────────────────────────────────────

  const updateDeliveryStatus = useCallback((deliveryId, status) => {
    const orderId = deliveryId.replace("DLV-", "");
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: status === "delivered" ? "delivered" : "out_for_delivery",
              deliveredAt: status === "delivered" ? now() : o.deliveredAt,
            }
          : o
      )
    );
    addActivity({ type: "delivery", message: `Delivery ${deliveryId} status updated to ${status}`, icon: "truck" });
  }, []);

  // ── Actions: Offers ─────────────────────────────────────────────────────────

  const createOffer = useCallback((offer) => {
    const newOffer = {
      ...offer,
      id: generateId("OFR"),
      usedCount: 0,
      createdAt: now(),
    };
    setOffers((prev) => [newOffer, ...prev]);
    addActivity({ type: "offer", message: `New offer "${offer.title}" created`, icon: "tag" });
  }, []);

  const updateOffer = useCallback((id, updates) => {
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
    addActivity({ type: "offer", message: `Offer ${id} updated`, icon: "edit" });
  }, []);

  const activateOffer = useCallback((id) => {
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, status: "active" } : o)));
    addActivity({ type: "offer", message: `Offer ${id} activated`, icon: "play-circle" });
  }, []);

  const deactivateOffer = useCallback((id) => {
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, status: "inactive" } : o)));
    addActivity({ type: "offer", message: `Offer ${id} deactivated`, icon: "pause-circle" });
  }, []);

  const deleteOffer = useCallback((id) => {
    setOffers((prev) => prev.filter((o) => o.id !== id));
    addActivity({ type: "offer", message: `Offer ${id} deleted`, icon: "trash" });
  }, []);

  // ── Actions: Notifications ──────────────────────────────────────────────────

  const markNotificationRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  // ── Actions: Reports ────────────────────────────────────────────────────────

  const resolveReport = useCallback((id) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "resolved", resolvedAt: now() } : r
      )
    );
    addActivity({ type: "report", message: `Report ${id} resolved`, icon: "check-circle" });
  }, []);

  const rejectReport = useCallback((id) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "rejected", resolvedAt: now() } : r
      )
    );
    addActivity({ type: "report", message: `Report ${id} rejected`, icon: "x-circle" });
  }, []);

  // ── Actions: Admin Profile ──────────────────────────────────────────────────

  const updateAdminProfile = useCallback((updates) => {
    setAdminProfile((prev) => ({ ...prev, ...updates }));
  }, []);

  // ── Actions: Settings ───────────────────────────────────────────────────────

  const updateSettings = useCallback((updates) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  // ── Actions: Activity Feed ──────────────────────────────────────────────────

  const addActivity = useCallback((activity) => {
    const newActivity = {
      ...activity,
      id: generateId("ACT"),
      timestamp: now(),
    };
    setRecentActivities((prev) => [newActivity, ...prev].slice(0, 50));
  }, []);

  // ── Sidebar persist ─────────────────────────────────────────────────────────

  const handleSidebarToggle = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  // ── Context value ───────────────────────────────────────────────────────────

  const value = {
    // Sidebar
    sidebarCollapsed,
    setSidebarCollapsed: handleSidebarToggle,

    // Admin Profile
    adminProfile,
    updateAdminProfile,

    // Users
    customers,
    shopkeepers,
    deliveryPartners,

    // Shops & Products
    shops,
    products,

    // Orders, Deliveries, Payments
    orders,
    deliveries,
    payments,

    // Offers
    offers,
    createOffer,
    updateOffer,
    activateOffer,
    deactivateOffer,
    deleteOffer,

    // Reports
    reports,
    resolveReport,
    rejectReport,

    // Notifications
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,

    // Shop Type Requests
    shopTypeRequests,
    approveShopType,
    rejectShopType,

    // Approvals
    approvals,
    pendingApprovalsCount,
    pendingShopTypeRequestsCount,
    approveShopkeeper,
    rejectShopkeeper,
    requestShopkeeperChanges,
    approveDeliveryPartner,
    rejectDeliveryPartner,
    requestDeliveryPartnerChanges,

    // Settings
    settings,
    updateSettings,

    // Activity
    recentActivities,
    addActivity,

    // User management
    suspendUser,
    activateUser,

    // Shop management
    suspendShop,
    activateShop,

    // Product management
    disableProduct,
    enableProduct,

    // Order management
    updateOrderStatus,

    // Delivery management
    updateDeliveryStatus,

    // Derived stats
    openReportsCount,
    totalRevenue,
    totalPlatformEarnings,

    // Helpers
    calculateOrderRevenue,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}

export default AdminContext;
