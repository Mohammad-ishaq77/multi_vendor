import bcrypt from "bcryptjs";
import { initDb, repo } from "../config/db.js";
import { slugify } from "../common/utils/helpers.js";

const CATEGORIES = [
  { name: "Grocery", slug: "grocery", icon: "ShoppingBasket" },
  { name: "Fruits & Veggies", slug: "fruits-veggies", icon: "Apple" },
  { name: "Dairy & Bakery", slug: "dairy-bakery", icon: "Milk" },
  { name: "Beverages", slug: "beverages", icon: "Coffee" },
  { name: "Fashion", slug: "fashion", icon: "Shirt" },
  { name: "Electronics", slug: "electronics", icon: "Smartphone" },
  { name: "Pharmacy", slug: "pharmacy", icon: "HeartPulse" },
  { name: "Beauty", slug: "beauty", icon: "Sparkles" },
];

const SHOPS = [
  { name: "MB Collection", category: "Fashion", rating: 4.5, reviews: 230, deliveryTime: "30-40 min", city: "Srinagar", lat: 34.0837, lng: 74.7973 },
  { name: "Fresh Basket", category: "Grocery", rating: 4.6, reviews: 315, deliveryTime: "20-30 min", city: "Srinagar", lat: 34.0901, lng: 74.8020 },
  { name: "Kiryana Plus", category: "Grocery", rating: 4.3, reviews: 195, deliveryTime: "15-25 min", city: "Srinagar", lat: 34.0750, lng: 74.7890 },
  { name: "Health Plus", category: "Pharmacy", rating: 4.7, reviews: 260, deliveryTime: "20-30 min", city: "Srinagar", lat: 34.0950, lng: 74.8100 },
  { name: "Tech World", category: "Electronics", rating: 4.6, reviews: 188, deliveryTime: "25-35 min", city: "Srinagar", lat: 34.0700, lng: 74.7950 },
];

await initDb();
const { default: { isDbReady } } = await import("../config/db.js");
if (!isDbReady()) {
  console.error("Seed aborted: database unavailable. Start it with `docker compose up -d db`.");
  process.exit(1);
}

const hash = await bcrypt.hash("1122", 10);
const users = repo("User");
const roles = ["customer", "shopkeeper", "delivery", "admin"];
for (const role of roles) {
  const email = role === "customer" ? "test@gmail.com" : `test.${role}@gmail.com`;
  const existing = await users.findOne({ where: { email } });
  if (!existing) {
    await users.save(
      users.create({ name: `NearMart ${role}`, email, passwordHash: hash, role, phone: "9876543210" })
    );
    console.log(`seeded user ${email} (${role} / 1122)`);
  }
}

const categories = repo("Category");
const catByName = {};
for (const c of CATEGORIES) {
  let row = await categories.findOne({ where: { slug: c.slug } });
  if (!row) row = await categories.save(categories.create(c));
  catByName[c.name] = row;
}

const shopkeeper = await users.findOne({ where: { role: "shopkeeper" } });
const shops = repo("Shop");
for (const s of SHOPS) {
  const slug = `${slugify(s.name)}-seed`;
  let row = await shops.findOne({ where: { slug } }).catch(() => null);
  if (!row) {
    row = shops.create({
      ownerId: shopkeeper.id,
      name: s.name,
      slug,
      description: `${s.name} — seeded demo shop in ${s.city}.`,
      categoryId: catByName[s.category]?.id || catByName.Grocery?.id,
      city: s.city,
      state: "Jammu & Kashmir",
      lat: s.lat,
      lng: s.lng,
      location: `SRID=4326;POINT(${s.lng} ${s.lat})`,
      rating: s.rating,
      totalReviews: s.reviews,
      deliveryTime: s.deliveryTime,
      isOpen: true,
      isApproved: true,
    });
    await shops.save(row);
    console.log(`seeded shop ${s.name}`);
  }
}

console.log("Seed complete.");
process.exit(0);
