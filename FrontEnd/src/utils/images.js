export const unsplash = (id, width = 800) =>
  `https://images.unsplash.com/${id}?ixlib=rb-4.0.3&auto=format&fit=crop&w=${width}&q=80`;

export const CATEGORY_FALLBACKS = {
  Fashion: unsplash("photo-1523381210434-271e8be1f52b"),
  Grocery: unsplash("photo-1542838132-92c53300491e"),
  Electronics: unsplash("photo-1505740420928-5e560c06d30e"),
  Beauty: unsplash("photo-1596462502278-27bfdc403348"),
  Pharmacy: unsplash("photo-1584308666744-24d5c474f2ae"),
  "Fruits & Veggies": unsplash("photo-1610832958506-aa56368176cf"),
  Vegetables: unsplash("photo-1610832958506-aa56368176cf"),
  Fruits: unsplash("photo-1610832958506-aa56368176cf"),
  "Dairy & Bakery": unsplash("photo-1509440159596-0249088772ff"),
  Dairy: unsplash("photo-1550583724-b2692b85b150"),
  Bakery: unsplash("photo-1509440159596-0249088772ff"),
  Beverages: unsplash("photo-1495474472287-4d71bcdd2085"),
  "Daily Needs": unsplash("photo-1604719312566-8912e9227c6a"),
  Snacks: unsplash("photo-1554866585-cd94860890b7"),
};

export const categoryFallback = (category) =>
  CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS.Grocery;
