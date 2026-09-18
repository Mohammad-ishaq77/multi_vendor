import { STORAGE_KEYS } from "../config/appConfig";
import storageService from "./storageService";

export const ORDERS_CHANGE_EVENT = "nearmart-orders-change";
export const PAYMENTS_CHANGE_EVENT = "nearmart-payments-change";

const emit = (name) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(name));
  }
};

const readList = (key) => storageService.getJSON(key, []) || [];

const writeList = (key, value, eventName) => {
  storageService.setJSON(key, value);
  emit(eventName);
};

const firstShopFromItems = (items = []) =>
  items.find((item) => item.shopName)?.shopName || items[0]?.shop || "NearMart Shop";

export const orderService = {
  getCustomerOrders() {
    return readList(STORAGE_KEYS.ORDERS);
  },

  getPayments() {
    return readList(STORAGE_KEYS.PAYMENTS);
  },

  getLastOrder() {
    return storageService.getJSON(STORAGE_KEYS.LAST_ORDER);
  },

  savePayment(payment) {
    const payments = [payment, ...this.getPayments().filter((item) => item.id !== payment.id)];
    writeList(STORAGE_KEYS.PAYMENTS, payments, PAYMENTS_CHANGE_EVENT);
    return payment;
  },

  updatePayment(id, updates) {
    const payments = this.getPayments().map((item) => (item.id === id ? { ...item, ...updates } : item));
    writeList(STORAGE_KEYS.PAYMENTS, payments, PAYMENTS_CHANGE_EVENT);
    return payments.find((item) => item.id === id);
  },

  saveCustomerOrder(order) {
    const orders = [order, ...this.getCustomerOrders().filter((item) => item.id !== order.id)];
    writeList(STORAGE_KEYS.ORDERS, orders, ORDERS_CHANGE_EVENT);
    storageService.setJSON(STORAGE_KEYS.LAST_ORDER, order);
    return order;
  },

  updateCustomerOrder(id, updates) {
    const orders = this.getCustomerOrders().map((item) => (item.id === id ? { ...item, ...updates } : item));
    writeList(STORAGE_KEYS.ORDERS, orders, ORDERS_CHANGE_EVENT);
    return orders.find((item) => item.id === id);
  },

  toShopkeeperOrder(order) {
    return {
      id: order.id,
      customer: order.customer?.fullName || order.customerName || "Customer",
      phone: order.customer?.phone || order.phone || "",
      items: (order.items || []).map((item) => ({
        name: item.name,
        quantity: item.quantity || item.qty || 1,
        price: item.price,
      })),
      total: order.total ?? order.totalAmount ?? 0,
      status: order.shopStatus || "New",
      paymentStatus: order.paymentStatus === "paid" || order.paymentStatus === "Paid" ? "Paid" : order.paymentStatus || "Pending",
      paymentMethod: order.paymentMethod || "Razorpay",
      deliveryAddress: order.customer
        ? `${order.customer.address || ""}, ${order.customer.city || ""} ${order.customer.pincode || ""}`.trim()
        : order.address || "",
      createdAt: order.createdAt,
      marketplace: true,
    };
  },

  toAdminOrder(order) {
    const items = order.items || [];
    const productAmount = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || item.qty || 1), 0);
    return {
      id: order.id,
      customerId: order.customerId || "customer-session",
      customerName: order.customer?.fullName || order.customerName || "Customer",
      shopId: order.shopId || "live-shop",
      shopName: order.shopName || firstShopFromItems(items),
      items: items.map((item) => ({
        productId: item.id || item.productId,
        name: item.name,
        qty: item.quantity || item.qty || 1,
        price: item.price,
      })),
      totalAmount: order.subtotal ?? productAmount ?? order.total ?? 0,
      deliveryFee: order.deliveryFee || 0,
      platformFee: order.platformFee || 10,
      status: order.adminStatus || "confirmed",
      paymentStatus: ["paid", "Paid"].includes(order.paymentStatus) ? "paid" : String(order.paymentStatus || "pending").toLowerCase(),
      paymentMethod: order.paymentMethod || "Razorpay",
      deliveryPartnerId: order.deliveryPartnerId || null,
      deliveryPartnerName: order.deliveryPartnerName || null,
      address: order.customer
        ? `${order.customer.address || ""}, ${order.customer.city || ""}`.trim()
        : order.address || "",
      createdAt: order.createdAt,
      deliveredAt: order.deliveredAt || null,
      rating: order.rating || null,
      razorpay: order.razorpay || null,
      marketplace: true,
    };
  },

  toDeliveryJob(order) {
    return {
      id: `DLV-${order.id}`,
      orderId: order.id,
      shopName: order.shopName || firstShopFromItems(order.items),
      customerName: order.customer?.fullName || order.customerName || "Customer",
      pickupAddress: order.shopAddress || "Assigned shop",
      dropAddress: order.customer
        ? `${order.customer.address || ""}, ${order.customer.city || ""} ${order.customer.pincode || ""}`.trim()
        : order.address || "",
      amount: order.total ?? order.totalAmount ?? 0,
      distance: "2.4 km",
      eta: "18 min",
      status: order.shopStatus === "Ready for Pickup" ? "available" : "pending",
      createdAt: order.createdAt,
      marketplace: true,
    };
  },

  syncRoleStores(order) {
    const shopkeeperOrders = readList(STORAGE_KEYS.SHOPKEEPER_ORDERS);
    const nextShopkeeper = [this.toShopkeeperOrder(order), ...shopkeeperOrders.filter((item) => item.id !== order.id)];
    storageService.setJSON(STORAGE_KEYS.SHOPKEEPER_ORDERS, nextShopkeeper);

    const adminOrders = readList(STORAGE_KEYS.ADMIN_ORDERS);
    const nextAdmin = [this.toAdminOrder(order), ...adminOrders.filter((item) => item.id !== order.id)];
    storageService.setJSON(STORAGE_KEYS.ADMIN_ORDERS, nextAdmin);

    emit(ORDERS_CHANGE_EVENT);
  },

  placeOrder(order) {
    const saved = this.saveCustomerOrder(order);
    if (order.payment) this.savePayment(order.payment);
    this.syncRoleStores(saved);
    return saved;
  },
};

export default orderService;
