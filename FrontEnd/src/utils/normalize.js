/**
 * Response normalisers.
 *
 * The API returns database-shaped records (`imageUrl`, `mrp`, `discountPct`,
 * `totalAmount`, snake-free but verbose names). The existing UI was designed
 * against a compact shape (`image`, `originalPrice`, `discount`, `total`).
 *
 * These helpers map API -> UI once, so every screen can keep its current
 * markup while reading real backend data. No value is invented: fields that the
 * API does not return stay null/0 rather than being faked.
 */

const num = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const firstImage = (images, fallback) => {
  if (Array.isArray(images) && images.length > 0) return images[0];
  return fallback || null;
};

/* ------------------------------- Product ------------------------------- */

export const normalizeProduct = (product) => {
  if (!product) return null;
  const shop = product.shop || null;
  const isAvailable = product.isAvailable !== false;
  const stock = num(product.stock);
  return {
    ...product,
    id: product.id,
    productId: product.id,
    name: product.name || "",
    description: product.description || "",
    price: num(product.price),
    originalPrice: product.mrp != null ? num(product.mrp) : null,
    discount: num(product.discountPct),
    unit: product.unit || "",
    image: product.imageUrl || firstImage(product.images) || null,
    images: product.images || [],
    stock,
    available: isAvailable,
    isAvailable,
    // The API stores `isAvailable`/`stock`; the admin tables filter on a status label.
    status: !isAvailable ? "disabled" : stock <= 0 ? "out_of_stock" : "active",
    rating: num(product.rating),
    reviewCount: num(product.reviewCount),
    categoryId: product.categoryId || null,
    category: product.category?.name || product.categoryName || "",
    shopId: product.shopId || shop?.id || null,
    shopName: shop?.name || product.shopName || "",
    shop: shop?.name || product.shopName || "",
    shopLocation: shop?.city || shop?.address || "",
    shopRating: num(shop?.rating),
    createdAt: product.createdAt || null,
  };
};

export const normalizeProducts = (items) => (items || []).map(normalizeProduct);

/* -------------------------------- Shop --------------------------------- */

export const normalizeShop = (shop) => {
  if (!shop) return null;
  return {
    ...shop,
    id: shop.id,
    name: shop.name || "",
    description: shop.description || "",
    categoryId: shop.categoryId || null,
    category: shop.category?.name || shop.category || "",
    type: shop.category?.name || shop.type || shop.category || "",
    image: shop.shopImage || shop.logoImage || shop.bannerImage || null,
    shopImage: shop.shopImage || null,
    logoImage: shop.logoImage || null,
    bannerImage: shop.bannerImage || null,
    city: shop.city || "",
    state: shop.state || "",
    address: shop.address || "",
    area: shop.address || "",
    location: shop.address || shop.city || "",
    rating: num(shop.rating),
    totalReviews: num(shop.totalReviews),
    reviewCount: num(shop.totalReviews),
    deliveryTime: shop.deliveryTime || "",
    minOrder: num(shop.minOrder),
    openingTime: shop.openingTime || "",
    closingTime: shop.closingTime || "",
    isOpen: Boolean(shop.isOpen),
    isApproved: Boolean(shop.isApproved),
    ownerId: shop.ownerId || null,
    ownerName: shop.owner?.name || shop.ownerName || "",
    latitude: shop.lat != null ? num(shop.lat) : null,
    longitude: shop.lng != null ? num(shop.lng) : null,
    createdAt: shop.createdAt || null,
  };
};

export const normalizeShops = (items) => (items || []).map(normalizeShop);

/* ------------------------------ Category ------------------------------- */

export const normalizeCategory = (category) => {
  if (!category) return null;
  return {
    ...category,
    id: category.id,
    name: category.name || "",
    slug: category.slug || "",
    icon: category.icon || "",
    image: category.imageUrl || null,
    imageUrl: category.imageUrl || null,
    description: category.description || "",
  };
};

export const normalizeCategories = (items) => (items || []).map(normalizeCategory);

/* --------------------------- Cart / Wishlist --------------------------- */

/** A cart row joined with its product, flattened for the cart UI. */
export const normalizeCartItem = (item) => {
  if (!item) return null;
  const product = normalizeProduct(item.product);
  return {
    ...item,
    // Product fields are promoted so the existing card markup keeps working, but
    // the row identity must survive: `id` is the cart item id used by
    // PATCH/DELETE /cart/items/:id, not the product id.
    ...product,
    id: item.id,
    productId: item.productId,
    shopId: item.shopId || product?.shopId || null,
    quantity: num(item.quantity, 1),
    product,
    name: product?.name || "",
    price: product?.price ?? 0,
    image: product?.image || null,
    category: product?.category || "",
    unit: product?.unit || "",
    originalPrice: product?.originalPrice ?? null,
    lineTotal: num(product?.price) * num(item.quantity, 1),
  };
};

export const normalizeCartItems = (items) => (items || []).map(normalizeCartItem);

/** A wishlist row joined with its product. */
export const normalizeWishlistItem = (item) => {
  if (!item) return null;
  const product = normalizeProduct(item.product);
  return {
    ...item,
    ...product,
    // Wishlist endpoints are keyed by product, so keep that id explicit.
    id: item.productId || product?.id || item.id,
    cartItemId: item.id,
    productId: item.productId,
    quantity: 1,
    product,
    price: product?.price ?? 0,
    image: product?.image || null,
    category: product?.category || "",
    unit: product?.unit || "",
    originalPrice: product?.originalPrice ?? null,
    shop: product?.shopName || "",
    addedAt: item.createdAt || null,
  };
};

export const normalizeWishlistItems = (items) => (items || []).map(normalizeWishlistItem);

/* -------------------------------- Order -------------------------------- */

/**
 * Backend status -> the label the existing customer UI already renders.
 * The five buckets (Placed / Processing / Shipped / Out for Delivery /
 * Delivered / Cancelled) are kept so the current screens work unchanged while
 * the server stays free to add statuses.
 */
export const ORDER_STATUS_LABELS = {
  pending: "Placed",
  confirmed: "Processing",
  preparing: "Processing",
  ready_for_pickup: "Processing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  completed: "Delivered",
  cancelled: "Cancelled",
};

/** Which tab each backend status belongs to. */
export const ORDER_STATUS_GROUPS = {
  Placed: ["pending"],
  Processing: ["confirmed", "preparing", "ready_for_pickup"],
  Shipped: ["out_for_delivery"],
  "Out for Delivery": ["out_for_delivery"],
  Delivered: ["delivered", "completed"],
  Cancelled: ["cancelled"],
};

export const orderStatusLabel = (status) => ORDER_STATUS_LABELS[status] || "Processing";

export const ordersInGroup = (orders, group) => {
  const allowed = ORDER_STATUS_GROUPS[group];
  if (!allowed) return orders;
  return orders.filter((order) => allowed.includes(order.status));
};

/** The shopkeeper's next legal action, per the server's transition rules. */
export const ORDER_NEXT_STATUS = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "ready_for_pickup",
};

export const normalizeOrderItem = (item) => {
  if (!item) return null;
  const quantity = num(item.quantity, 1);
  const price = num(item.price);
  return {
    ...item,
    id: item.id,
    productId: item.productId,
    name: item.name || "",
    price,
    qty: quantity,
    quantity,
    image: item.imageUrl || null,
    imageUrl: item.imageUrl || null,
    subtotal: item.subtotal != null ? num(item.subtotal) : price * quantity,
  };
};

export const normalizeOrder = (order) => {
  if (!order) return null;
  const items = (order.items || []).map(normalizeOrderItem);
  const subtotal = order.subtotal != null ? num(order.subtotal) : null;
  const deliveryFee = num(order.deliveryFee);
  const discount = num(order.discount);
  const totalAmount = order.totalAmount != null ? num(order.totalAmount) : null;

  return {
    ...order,
    id: order.id,
    items,
    status: order.status,
    statusLabel: orderStatusLabel(order.status),
    uiStatus: orderStatusLabel(order.status),
    nextStatus: ORDER_NEXT_STATUS[order.status] || null,
    paymentStatus: order.paymentStatus || "pending",
    paymentMethod: order.paymentMethod || "razorpay",
    subtotal: subtotal ?? items.reduce((sum, item) => sum + item.subtotal, 0),
    deliveryFee,
    discount,
    total: totalAmount ?? 0,
    totalAmount: totalAmount ?? 0,
    shopId: order.shopId,
    shopName: order.shop?.name || order.shopName || "",
    shopAddress: order.shop?.address || "",
    customerId: order.customerId,
    customerName: order.customer?.name || order.customerName || "",
    customerPhone: order.customer?.phone || order.customerPhone || "",
    deliveryAddress:
      order.deliveryAddress ||
      [order.address?.line1, order.address?.line2, order.address?.city, order.address?.state, order.address?.pincode]
        .filter(Boolean)
        .join(", ") ||
      "",
    createdAt: order.createdAt || null,
    deliveredAt: order.deliveredAt || null,
    cancelledAt: order.cancelledAt || null,
    estimatedDelivery: order.estimatedDelivery || null,
  };
};

export const normalizeOrders = (items) => (items || []).map(normalizeOrder);

/* ------------------------------- Address ------------------------------- */

export const normalizeAddress = (address) => {
  if (!address) return null;
  const line = [address.line1, address.line2].filter(Boolean).join(", ");
  return {
    ...address,
    id: address.id,
    label: address.label || "Home",
    fullName: address.fullName || "",
    name: address.fullName || "",
    phone: address.phone || "",
    line1: address.line1 || "",
    line2: address.line2 || "",
    street: line,
    city: address.city || "",
    state: address.state || "",
    pincode: address.pincode || "",
    type: (address.label || "home").toLowerCase(),
    isDefault: Boolean(address.isDefault),
    isPrimary: Boolean(address.isDefault),
    full: [line, address.city, address.state, address.pincode].filter(Boolean).join(", "),
  };
};

export const normalizeAddresses = (items) => (items || []).map(normalizeAddress);

/* ------------------------------- Payment ------------------------------- */

export const normalizePayment = (payment) => {
  if (!payment) return null;
  return {
    ...payment,
    id: payment.id,
    orderId: payment.orderId || null,
    amount: num(payment.amount),
    currency: payment.currency || "INR",
    status: payment.status || "created",
    method: payment.method || payment.paymentMethod || "razorpay",
    razorpayOrderId: payment.razorpayOrderId || null,
    razorpayPaymentId: payment.razorpayPaymentId || null,
    paid: payment.status === "captured",
    createdAt: payment.createdAt || null,
    paidAt: payment.capturedAt || payment.createdAt || null,
  };
};

export const normalizePayments = (items) => (items || []).map(normalizePayment);

/* ----------------------------- Delivery job ---------------------------- */

export const DELIVERY_STATUS_LABELS = {
  assigned: "Accepted",
  picked_up: "Picked Up",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  failed: "Failed",
};

/**
 * A delivery job = a ready-for-pickup order (or an assignment joined to one).
 * `kind` tells the caller which endpoint produced it.
 */
export const normalizeDelivery = (payload) => {
  if (!payload) return null;

  const assignment = payload.assignment || null;
  const order = payload.order || payload;
  if (!order?.id) return null;

  const distanceKm =
    order.distance_m != null ? num(order.distance_m) / 1000 : null;

  return {
    id: assignment?.id || `DLV-${order.id}`,
    orderId: order.id,
    assignmentId: assignment?.id || null,
    assignmentStatus: assignment?.status || null,
    pickedUpAt: assignment?.pickedUpAt || null,
    deliveredAt: assignment?.deliveredAt || null,
    partnerEarning: num(assignment?.partnerEarning),
    shopId: order.shopId || null,
    shopName: order.shop?.name || order.shopName || "",
    shopAddress: order.shop?.address || "",
    shopPhone: order.shop?.phone || "",
    shopCity: order.shop?.city || "",
    customerName: order.customer?.name || order.customerName || "",
    customerAddress: order.deliveryAddress || order.address || "",
    customerPhone: order.customer?.phone || order.customerPhone || "",
    items: (order.items || []).map(normalizeOrderItem),
    orderAmount: order.totalAmount != null ? num(order.totalAmount) : num(order.total),
    distance: distanceKm != null ? `${distanceKm.toFixed(1)} km` : null,
    estimatedTime: order.estimatedDelivery || null,
    status: assignment?.status || order.status,
    statusLabel:
      DELIVERY_STATUS_LABELS[assignment?.status] ||
      ORDER_STATUS_LABELS[order.status] ||
      order.status,
    createdAt: order.createdAt || null,
    completedAt: assignment?.deliveredAt || null,
  };
};

export const normalizeDeliveries = (items) => (items || []).map(normalizeDelivery).filter(Boolean);

/* ------------------------------- Delivery ------------------------------ */

export const normalizePartner = (partner) => {
  if (!partner) return null;
  return {
    ...partner,
    id: partner.id,
    userId: partner.userId,
    vehicleType: partner.vehicleType || "",
    vehicleNumber: partner.vehicleNumber || "",
    rating: num(partner.rating),
    averageRating: num(partner.rating),
    totalDeliveries: num(partner.totalDeliveries),
    completedDeliveries: num(partner.completedDeliveries),
    cancelledDeliveries: num(partner.cancelledDeliveries),
    todayDeliveries: num(partner.todayDeliveries),
    totalEarnings: num(partner.totalEarnings),
    todayEarnings: num(partner.todayEarnings),
    earnings: num(partner.totalEarnings),
    isOnline: Boolean(partner.isOnline),
    isAvailable: Boolean(partner.isOnline),
    isApproved: Boolean(partner.isApproved),
    applicationStatus: partner.applicationStatus || "draft",
    verificationStatus: partner.isApproved ? "approved" : partner.applicationStatus || "pending",
    onboardingStep: partner.onboardingStep || "guidelines",
    joinedDate: partner.createdAt || null,
  };
};

/* --------------------------------- User -------------------------------- */

export const normalizeUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    id: user.id,
    name: user.name || "",
    fullName: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    role: user.role,
    activeRole: user.activeRole || user.role,
    avatar: user.avatarUrl || null,
    image: user.avatarUrl || null,
    address: user.address || "",
    joinedDate: user.createdAt || user.joinDate || null,
    joinDate: user.createdAt || user.joinDate || null,
    registeredAt: user.createdAt || null,
    status: user.isActive === false ? "suspended" : "active",
    isActive: user.isActive !== false,
    roles: user.roles || [user.role].filter(Boolean),
  };
};

export const normalizeUsers = (items) => (items || []).map(normalizeUser);

/* -------------------------------- Review ------------------------------- */

export const normalizeReview = (review) => {
  if (!review) return null;
  return {
    ...review,
    id: review.id,
    rating: num(review.rating),
    comment: review.comment || "",
    customer: review.reviewer?.name || review.customerName || "Customer",
    customerName: review.reviewer?.name || review.customerName || "",
    productName: review.product?.name || review.productName || "",
    orderId: review.orderId || null,
    date: review.createdAt || null,
    createdAt: review.createdAt || null,
  };
};

export const normalizeReviews = (items) => (items || []).map(normalizeReview);

/* --------------------------------- Offer ------------------------------- */

export const normalizeOffer = (offer) => {
  if (!offer) return null;
  const isPercentage = offer.discountType === "percentage";
  return {
    ...offer,
    id: offer.id,
    name: offer.title || "Offer",
    title: offer.title || "Offer",
    couponCode: offer.code || "",
    code: offer.code || "",
    type: offer.discountType || "flat",
    discountType: offer.discountType || "flat",
    value: num(offer.discountValue),
    discountValue: num(offer.discountValue),
    discountLabel: isPercentage ? `${num(offer.discountValue)}% OFF` : `₹${num(offer.discountValue)} OFF`,
    minOrder: num(offer.minOrder),
    maxDiscount: num(offer.maxDiscount),
    description: offer.description || "",
    active: offer.isActive !== false,
    isActive: offer.isActive !== false,
    status: offer.isActive === false ? "inactive" : "active",
    startDate: offer.startsAt || null,
    endDate: offer.expiresAt || null,
    validFrom: offer.startsAt || null,
    validTill: offer.expiresAt || null,
    usedCount: num(offer.usedCount),
    usageLimit: num(offer.usageLimit),
  };
};

export const normalizeOffers = (items) => (items || []).map(normalizeOffer);

export default {
  normalizeProduct,
  normalizeProducts,
  normalizeShop,
  normalizeShops,
  normalizeCategory,
  normalizeCategories,
  normalizeCartItem,
  normalizeCartItems,
  normalizeWishlistItem,
  normalizeWishlistItems,
  normalizeOrder,
  normalizeOrders,
  normalizeAddress,
  normalizeAddresses,
  normalizePayment,
  normalizePayments,
  normalizeDelivery,
  normalizeDeliveries,
  normalizePartner,
  normalizeUser,
  normalizeUsers,
  normalizeReview,
  normalizeOffer,
  normalizeOffers,
};