import categories from "../data/categories.json";
import products from "../data/products.json";
import vendors from "../data/vendors.json";

export const getCategoryBySlug = (slug) =>
  categories.find((category) => category.slug === slug);

export const getRelatedProducts = (category) => {
  if (!category) return products;
  const names = category.related?.length ? category.related : [category.name];
  const matched = products.filter((product) => names.includes(product.category));
  return matched.length ? matched : products.filter((product) => product.category === category.name);
};

export const getRelatedVendors = (category) => {
  if (!category) return vendors;
  const names = category.related?.length ? category.related : [category.name];
  const byCategory = vendors.filter((vendor) => names.includes(vendor.category));
  const shopNames = new Set(getRelatedProducts(category).map((product) => product.shop));
  const byProducts = vendors.filter((vendor) => shopNames.has(vendor.name));
  const seen = new Set();
  return [...byCategory, ...byProducts].filter((vendor) => {
    if (seen.has(vendor.id)) return false;
    seen.add(vendor.id);
    return true;
  });
};

export const searchCatalog = (query = "") => {
  const term = query.trim().toLowerCase();
  if (!term) {
    return { products, vendors, categories };
  }
  const matches = (values) => values.filter(Boolean).join(" ").toLowerCase().includes(term);
  return {
    products: products.filter((item) =>
      matches([item.name, item.category, item.shop, item.unit, item.badge])
    ),
    vendors: vendors.filter((item) =>
      matches([item.name, item.category, item.location])
    ),
    categories: categories.filter((item) =>
      matches([item.name, item.description, item.headline, item.intro, ...(item.related || [])])
    ),
  };
};

export const sortProducts = (items = [], sortKey = "featured") => {
  const next = [...items];
  if (sortKey === "price-low") return next.sort((a, b) => a.price - b.price);
  if (sortKey === "price-high") return next.sort((a, b) => b.price - a.price);
  if (sortKey === "rating") return next.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  return next;
};

export const getVendorMarketplacePath = (vendor) => {
  const match = categories.find((category) => category.related?.includes(vendor.category) || category.name === vendor.category);
  return match ? `/marketplace/${match.slug}` : "/marketplace";
};
