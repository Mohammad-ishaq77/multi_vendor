import bcrypt from "bcryptjs";
import { initDb, isDbReady, repo } from "../config/db.js";
import { slugify } from "../common/utils/helpers.js";

// Mirrors FrontEnd/src/data/categories.json (name/slug/icon + cover -> image_url)
const CATEGORIES = [
  { name: "Grocery", slug: "grocery", icon: "ShoppingBasket", imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=85" },
  { name: "Fruits & Veggies", slug: "fruits-veggies", icon: "Apple", imageUrl: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1600&q=85" },
  { name: "Dairy & Bakery", slug: "dairy-bakery", icon: "Milk", imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1600&q=85" },
  { name: "Beverages", slug: "beverages", icon: "Coffee", imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1600&q=85" },
  { name: "Fashion", slug: "fashion", icon: "Shirt", imageUrl: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1600&q=85" },
  { name: "Electronics", slug: "electronics", icon: "Smartphone", imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=85" },
  { name: "Pharmacy", slug: "pharmacy", icon: "HeartPulse", imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1600&q=85" },
  { name: "Beauty", slug: "beauty", icon: "Sparkles", imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1600&q=85" },
];

// Mirrors FrontEnd/src/data/vendors.json
const SHOPS = [
  { name: "MB Collection", category: "Fashion", rating: 4.5, reviews: 230, deliveryTime: "30-40 min", city: "Srinagar", lat: 34.0837, lng: 74.7973 },
  { name: "Fresh Basket", category: "Grocery", rating: 4.6, reviews: 315, deliveryTime: "20-30 min", city: "Srinagar", lat: 34.0901, lng: 74.802 },
  { name: "Kiryana Plus", category: "Grocery", rating: 4.3, reviews: 195, deliveryTime: "15-25 min", city: "Srinagar", lat: 34.075, lng: 74.789 },
  { name: "Health Plus", category: "Pharmacy", rating: 4.7, reviews: 260, deliveryTime: "20-30 min", city: "Srinagar", lat: 34.095, lng: 74.81 },
  { name: "Tech World", category: "Electronics", rating: 4.6, reviews: 188, deliveryTime: "25-35 min", city: "Srinagar", lat: 34.07, lng: 74.795 },
];

// Mirrors FrontEnd/src/data/products.json
// (originalPrice -> mrp, discount -> discount_pct, image -> image_url)
const PRODUCTS = [
  { name: "Nike Air Sneakers", category: "Fashion", shop: "MB Collection", unit: "UK 7-11", price: 2499, mrp: 4599, discount: 46, rating: 4.8, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { name: "Snack Combo Pack", category: "Grocery", shop: "Fresh Basket", unit: "Pack of 5", price: 99, mrp: 149, discount: 34, rating: 4.5, image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { name: "Wireless Headphones", category: "Electronics", shop: "Tech World", unit: "Over-Ear", price: 1299, mrp: 2499, discount: 48, rating: 4.6, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { name: "Aloe Vera Face Gel", category: "Beauty", shop: "Health Plus", unit: "150 ml", price: 149, mrp: 299, discount: 50, rating: 4.7, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { name: "Indoor Monstera Plant", category: "Grocery", shop: "Fresh Basket", unit: "With Pot", price: 399, mrp: 699, discount: 43, rating: 4.9, image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { name: "Amul Butter", category: "Dairy & Bakery", shop: "Kiryana Plus", unit: "500g", price: 199, mrp: 249, discount: 20, rating: 4.8, image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { name: "Running Track Shoes", category: "Fashion", shop: "MB Collection", unit: "UK 6-12", price: 1899, mrp: 3499, discount: 46, rating: 4.7, image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { name: "Fresh Tomatoes", category: "Fruits & Veggies", shop: "Fresh Basket", unit: "1 kg", price: 45, mrp: 79, discount: 43, rating: 4.6, image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { name: "iPhone 14 Case", category: "Electronics", shop: "Tech World", unit: "Protective", price: 499, mrp: 899, discount: 45, rating: 4.5, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { name: "Organic Face Mask", category: "Beauty", shop: "Health Plus", unit: "200g", price: 299, mrp: 499, discount: 40, rating: 4.8, image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { name: "Cotton T-Shirt", category: "Fashion", shop: "MB Collection", unit: "S-XXL", price: 349, mrp: 699, discount: 50, rating: 4.4, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { name: "Whole Wheat Bread", category: "Dairy & Bakery", shop: "Fresh Basket", unit: "500g", price: 49, mrp: 79, discount: 38, rating: 4.7, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { name: "USB-C Cable", category: "Electronics", shop: "Tech World", unit: "2 meter", price: 149, mrp: 299, discount: 50, rating: 4.6, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { name: "Vitamin C Serum", category: "Beauty", shop: "Health Plus", unit: "30ml", price: 449, mrp: 899, discount: 50, rating: 4.9, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { name: "Banana (Yellow)", category: "Fruits & Veggies", shop: "Kiryana Plus", unit: "1 Dozen", price: 59, mrp: 99, discount: 40, rating: 4.8, image: "https://images.unsplash.com/photo-1528825871115-3581a5387919?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { name: "Denim Jeans", category: "Fashion", shop: "MB Collection", unit: "28-40 Waist", price: 1599, mrp: 2999, discount: 47, rating: 4.7, image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { name: "Honey - Raw", category: "Grocery", shop: "Fresh Basket", unit: "500ml", price: 199, mrp: 349, discount: 43, rating: 4.9, image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { name: "Power Bank 20000mAh", category: "Electronics", shop: "Tech World", unit: "Fast Charge", price: 999, mrp: 1899, discount: 47, rating: 4.6, image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { name: "Lip Gloss Set", category: "Beauty", shop: "Health Plus", unit: "Pack of 4", price: 199, mrp: 399, discount: 50, rating: 4.5, image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { name: "Green Capsicum", category: "Fruits & Veggies", shop: "Fresh Basket", unit: "500g", price: 39, mrp: 69, discount: 43, rating: 4.7, image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { name: "Masala Chai Blend", category: "Beverages", shop: "Kiryana Plus", unit: "250g", price: 129, mrp: 189, discount: 32, rating: 4.8, image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { name: "Fresh Orange Juice", category: "Beverages", shop: "Fresh Basket", unit: "1 litre", price: 89, mrp: 129, discount: 31, rating: 4.6, image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { name: "Multivitamin Pack", category: "Pharmacy", shop: "Health Plus", unit: "60 tablets", price: 349, mrp: 499, discount: 30, rating: 4.7, image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { name: "Hand Sanitizer", category: "Pharmacy", shop: "Health Plus", unit: "500 ml", price: 99, mrp: 149, discount: 34, rating: 4.5, image: "https://images.unsplash.com/photo-1584744982491-665216d95f8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
];

const OFFERS = [
  { shop: "Fresh Basket", title: "Fresh Picks 10% Off", code: "FRESH10", discountType: "percentage", discountValue: 10, maxDiscount: 150, minOrder: 199 },
  { shop: "MB Collection", title: "Flat ₹200 Off Fashion", code: "MBFLAT200", discountType: "flat", discountValue: 200, minOrder: 999 },
  { shop: "Tech World", title: "Gadget Week 5% Off", code: "TECH5", discountType: "percentage", discountValue: 5, maxDiscount: 200, minOrder: 499 },
];

await initDb();
if (!isDbReady()) {
  console.error("Seed aborted: database unavailable.");
  process.exit(1);
}

// --- 1. Single multi-role test user: test@gmail.com / 1122 ---
const users = repo("User");
const hash = await bcrypt.hash("1122", 10);
let testUser = await users.findOne({ where: { email: "test@gmail.com" } });
if (!testUser) {
  testUser = await users.save(
    users.create({
      name: "NearMart Tester",
      email: "test@gmail.com",
      passwordHash: hash,
      role: "customer",
      allowedRoles: ["customer", "shopkeeper", "delivery", "admin"],
      phone: "9876543210",
    })
  );
  console.log("seeded user test@gmail.com (all roles / 1122)");
} else if (!testUser.allowedRoles?.length) {
  testUser.allowedRoles = ["customer", "shopkeeper", "delivery", "admin"];
  await users.save(testUser);
  console.log("updated test@gmail.com with all roles");
}

// --- 2. Categories ---
const categories = repo("Category");
const catByName = {};
for (const c of CATEGORIES) {
  let row = await categories.findOne({ where: { slug: c.slug } });
  if (!row) {
    row = await categories.save(categories.create(c));
    console.log(`seeded category ${c.name}`);
  }
  catByName[c.name] = row;
}

// --- 3. Shops (owned by test user acting as shopkeeper) ---
const shops = repo("Shop");
const shopByName = {};
for (const s of SHOPS) {
  const slug = `${slugify(s.name)}-seed`;
  let row = await shops.findOne({ where: { slug } }).catch(() => null);
  if (!row) {
    row = await shops.save(
      shops.create({
        ownerId: testUser.id,
        name: s.name,
        slug,
        description: `${s.name} — seeded demo shop in ${s.city}.`,
        categoryId: catByName[s.category]?.id,
        city: s.city,
        state: "Jammu & Kashmir",
        lat: s.lat,
        lng: s.lng,
        location: { type: "Point", coordinates: [s.lng, s.lat] },
        rating: s.rating,
        totalReviews: s.reviews,
        deliveryTime: s.deliveryTime,
        isOpen: true,
        isApproved: true,
      })
    );
    console.log(`seeded shop ${s.name}`);
  }
  shopByName[s.name] = row;
}

// --- 4. Products (all 24 frontend mock items) ---
const products = repo("Product");
const productByName = {};
for (const p of PRODUCTS) {
  let row = await products.findOne({
    where: { name: p.name, shopId: shopByName[p.shop].id },
  }).catch(() => null);
  if (!row) {
    row = await products.save(
      products.create({
        shopId: shopByName[p.shop].id,
        categoryId: catByName[p.category]?.id,
        name: p.name,
        description: `${p.name} (${p.unit}) — seeded from frontend mock data.`,
        price: p.price,
        mrp: p.mrp,
        stock: 50,
        unit: p.unit,
        imageUrl: p.image,
        isAvailable: true,
        discountPct: p.discount,
        rating: p.rating,
        reviewCount: 0,
      })
    );
    console.log(`seeded product ${p.name}`);
  }
  productByName[p.name] = row;
}

// --- 5. Offers ---
const offers = repo("Offer");
for (const o of OFFERS) {
  const existing = await offers.findOne({ where: { code: o.code } }).catch(() => null);
  if (!existing) {
    await offers.save(
      offers.create({ ...o, shopId: shopByName[o.shop].id, isActive: true })
    );
    console.log(`seeded offer ${o.code}`);
  }
}

// --- 6. Address ---
const addresses = repo("Address");
let address = await addresses.findOne({ where: { userId: testUser.id } }).catch(() => null);
if (!address) {
  address = await addresses.save(
    addresses.create({
      userId: testUser.id,
      label: "Home",
      fullName: "NearMart Tester",
      phone: "9876543210",
      line1: "123 Residency Road",
      city: "Srinagar",
      state: "Jammu & Kashmir",
      pincode: "190001",
      lat: 34.0837,
      lng: 74.7973,
      location: { type: "Point", coordinates: [74.7973, 34.0837] },
      isDefault: true,
    })
  );
  console.log("seeded address");
}

// --- 7. Demo orders + payments + delivery assignment ---
const orders = repo("Order");
const orderItems = repo("OrderItem");
const payments = repo("Payment");

async function seedOrder(marker, shopName, lines, { status, paymentStatus, razorpayStatus }) {
  let order = await orders.findOne({ where: { notes: marker } }).catch(() => null);
  if (order) return order;
  let subtotal = 0;
  const resolved = lines.map(({ name, qty }) => {
    const p = productByName[name];
    const price = Number(p.price);
    subtotal += price * qty;
    return { p, qty, price };
  });
  const deliveryFee = 40;
  order = await orders.save(
    orders.create({
      customerId: testUser.id,
      shopId: shopByName[shopName].id,
      addressId: address.id,
      status,
      paymentStatus,
      paymentMethod: "razorpay",
      subtotal,
      deliveryFee,
      discount: 0,
      totalAmount: subtotal + deliveryFee,
      notes: marker,
    })
  );
  for (const { p, qty, price } of resolved) {
    await orderItems.save(
      orderItems.create({
        orderId: order.id,
        productId: p.id,
        name: p.name,
        price,
        quantity: qty,
        imageUrl: p.imageUrl,
        subtotal: price * qty,
      })
    );
  }
  const rzrOrderId = `seed_${marker}`;
  const payExisting = await payments.findOne({ where: { razorpayOrderId: rzrOrderId } }).catch(() => null);
  if (!payExisting) {
    await payments.save(
      payments.create({
        orderId: order.id,
        userId: testUser.id,
        razorpayOrderId: rzrOrderId,
        razorpayPaymentId: paymentStatus === "paid" ? `pay_seed_${marker}` : null,
        amount: subtotal + deliveryFee,
        currency: "INR",
        status: razorpayStatus,
        method: "upi",
        capturedAt: paymentStatus === "paid" ? new Date() : null,
      })
    );
  }
  console.log(`seeded order ${marker} (${status}/${paymentStatus})`);
  return order;
}

const order1 = await seedOrder("seed-demo-1", "Fresh Basket",
  [{ name: "Snack Combo Pack", qty: 2 }, { name: "Fresh Tomatoes", qty: 1 }],
  { status: "confirmed", paymentStatus: "paid", razorpayStatus: "captured" });

const order2 = await seedOrder("seed-demo-2", "Tech World",
  [{ name: "USB-C Cable", qty: 1 }],
  { status: "ready_for_pickup", paymentStatus: "paid", razorpayStatus: "captured" });

const assignments = repo("DeliveryAssignment");
const a2 = await assignments.findOne({ where: { orderId: order2.id } }).catch(() => null);
if (!a2) {
  await assignments.save(
    assignments.create({ orderId: order2.id, status: "assigned", partnerEarning: 30, distanceKm: 2.4 })
  );
  console.log("seeded delivery assignment (unassigned pickup)");
}

// --- 8. Delivery partner profile + approvals ---
const partners = repo("DeliveryPartner");
let partner = await partners.findOne({ where: { userId: testUser.id } }).catch(() => null);
if (!partner) {
  partner = await partners.save(
    partners.create({
      userId: testUser.id,
      vehicleType: "bike",
      vehicleNumber: "JK01-1234",
      isOnline: true,
      isApproved: true,
      onboardingStep: "verification",
      applicationStatus: "approved",
    })
  );
  console.log("seeded delivery partner profile");
}

const approvals = repo("Approval");
for (const type of ["shopkeeper", "delivery_partner"]) {
  const existing = await approvals.findOne({
    where: { applicantId: testUser.id, type },
  }).catch(() => null);
  if (!existing) {
    await approvals.save(
      approvals.create({
        applicantId: testUser.id,
        type,
        status: "approved",
        notes: "Seeded demo approval.",
        reviewedAt: new Date(),
      })
    );
    console.log(`seeded approval ${type}`);
  }
}

console.log("Seed complete.");
process.exit(0);
