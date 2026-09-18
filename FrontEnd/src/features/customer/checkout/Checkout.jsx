import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Home,
  Building2,
  Mail,
  CreditCard,
  Package,
  Truck,
  ShieldCheck,
  Check,
  ShoppingBag,
  Sparkles,
  Plus,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import CustomerShell from "../components/CustomerShell";
import { useToast } from "../../../components/common/Toast";
import orderService from "../../../services/orderService";
import paymentService from "../../../services/paymentService";
import { RAZORPAY_CONFIG, isRazorpayConfigured } from "../../../config/razorpay";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const EMPTY_ADDRESS = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartCount, cartTotal, clearCart } = useCart();
  const { showToast } = useToast();
  const [isPlacing, setIsPlacing] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [savedAddresses, setSavedAddresses] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nearmart_addresses") || "[]");
    } catch {
      return [];
    }
  });
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);
  const [isNewAddress, setIsNewAddress] = useState(false);

  useEffect(() => {
    const defaultIndex = Number(localStorage.getItem("nearmart_default_address"));
    const index = Number.isInteger(defaultIndex) && defaultIndex < savedAddresses.length
      ? defaultIndex
      : 0;
    const saved = savedAddresses[index];
    if (saved) {
      setSelectedAddressIndex(index);
      setAddress({
        fullName: saved.fullName || "",
        email: saved.email || "",
        phone: saved.phone || "",
        address: saved.street || "",
        city: saved.city || "",
        state: saved.state || "",
        pincode: saved.pincode || "",
      });
    }
  }, [savedAddresses]);

  const deliveryFee = cartTotal > 0 ? 30 : 0;
  const total = cartTotal + deliveryFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const selectSavedAddress = (index) => {
    const saved = savedAddresses[index];
    setSelectedAddressIndex(index);
    setIsNewAddress(false);
    setAddress({
      fullName: saved.fullName || "",
      email: saved.email || "",
      phone: saved.phone || "",
      address: saved.street || "",
      city: saved.city || "",
      state: saved.state || "",
      pincode: saved.pincode || "",
    });
  };

  const startNewAddress = () => {
    setSelectedAddressIndex(null);
    setIsNewAddress(true);
    setAddress(EMPTY_ADDRESS);
  };

  const saveNewAddress = () => {
    if (!address.fullName || !address.phone || !address.address || !address.city || !address.state || !address.pincode) {
      return showToast("Please fill in all address details before saving.", "error");
    }

    const savedAddress = {
      fullName: address.fullName,
      email: address.email,
      phone: address.phone,
      street: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      type: "home",
    };
    const nextAddresses = [...savedAddresses, savedAddress];
    const nextIndex = nextAddresses.length - 1;
    setSavedAddresses(nextAddresses);
    setSelectedAddressIndex(nextIndex);
    setIsNewAddress(false);
    localStorage.setItem("nearmart_addresses", JSON.stringify(nextAddresses));
    if (nextAddresses.length === 1) {
      localStorage.setItem("nearmart_default_address", "0");
    }
  };


  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return showToast("Your cart is empty.", "error");
    if (!address.fullName || !address.phone || !address.address || !address.city || !address.pincode) {
      return showToast("Please fill in all delivery details.", "error");
    }

    setIsPlacing(true);
    setPaymentError("");
    const orderId = `NM-${Date.now()}`;
    const shopName = cart.find((item) => item.shopName)?.shopName || cart[0]?.shop || "NearMart Shop";

    const draftOrder = {
      id: orderId,
      items: cart,
      customer: address,
      customerName: address.fullName,
      shopName,
      paymentMethod: "Razorpay",
      subtotal: cartTotal,
      deliveryFee,
      platformFee: 10,
      total,
      status: "Placed",
      shopStatus: "New",
      adminStatus: "confirmed",
      paymentStatus: "pending",
      createdAt: new Date().toISOString(),
      date: new Date().toLocaleDateString(),
    };

    try {
      if (isRazorpayConfigured()) {
        const result = await paymentService.checkout({
          amount: total,
          orderId,
          customer: address,
          description: `NearMart order ${orderId}`,
        });
        const paidOrder = {
          ...draftOrder,
          paymentStatus: result.verified || result.ok ? "Paid" : "Pending verification",
          paymentMethod: result.payment?.method || "Razorpay",
          razorpay: result.razorpay,
          payment: result.payment,
        };
        orderService.placeOrder(paidOrder);
        clearCart();
        showToast("Payment successful. Your order has been placed.");
        navigate("/customer/orders");
        return;
      }

      const sandboxPayment = {
        id: `PAY-${orderId}`,
        orderId,
        amount: total,
        currency: "INR",
        status: "pending",
        method: "razorpay",
        createdAt: new Date().toISOString(),
        note: "Add VITE_RAZORPAY_KEY_ID and start the payment API to capture live Razorpay payments.",
      };
      orderService.placeOrder({
        ...draftOrder,
        paymentStatus: "Pending",
        payment: sandboxPayment,
      });
      clearCart();
      showToast("Order saved. Add Razorpay credentials to collect live payments.");
      navigate("/customer/orders");
    } catch (error) {
      const message = error?.cancelled
        ? "Payment was cancelled before completion."
        : error.message || "Payment failed. Please try again.";
      setPaymentError(message);
      showToast(message, "error");
    } finally {
      setIsPlacing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <CustomerShell>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-xl shadow-[#155c43]/5 mt-10"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-24 h-24 bg-[#f0f8f3] rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <ShoppingBag className="w-10 h-10 text-[#155c43]" />
          </motion.div>
          <h2 className="text-2xl font-bold text-[#14261f]">Your cart is empty</h2>
          <p className="text-gray-500 mt-2 mb-8">Add products before proceeding to checkout.</p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/customer/products")}
            className="bg-[#155c43] text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-[#155c43]/20 hover:bg-[#104b36] transition-colors"
          >
            Continue Shopping
          </motion.button>
        </motion.div>
      </CustomerShell>
    );
  }

  return (
    <CustomerShell>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <motion.button
            whileHover={{ x: -4 }}
            onClick={() => navigate("/customer/cart")}
            className="text-[#155c43] font-semibold text-sm flex items-center gap-2 mb-4 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </motion.button>
          <h1 className="text-3xl md:text-4xl font-bold text-[#14261f] tracking-tight">Checkout</h1>
          <p className="text-gray-500 mt-2">Complete your order from NearMart.</p>
        </motion.div>

        <form onSubmit={handlePlaceOrder} className="grid lg:grid-cols-3 gap-8">
          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <motion.section
              variants={itemVariants}
              className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#e9f5ef] flex items-center justify-center text-[#155c43]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#14261f]">Delivery Address</h2>
                  <p className="text-xs text-gray-500">Where should we deliver your order?</p>
                </div>
                </div>
                {savedAddresses.length > 0 && !isNewAddress && (
                  <button
                    type="button"
                    onClick={startNewAddress}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#155c43] hover:underline"
                  >
                    <Plus className="w-4 h-4" /> New address
                  </button>
                )}
              </div>

              {savedAddresses.length > 0 && !isNewAddress && (
                <div className="space-y-3">
                  {savedAddresses.map((saved, index) => (
                    <button
                      key={`${saved.email || saved.phone}-${index}`}
                      type="button"
                      onClick={() => selectSavedAddress(index)}
                      className={`w-full text-left border rounded-xl p-4 transition-all ${
                        selectedAddressIndex === index
                          ? "border-[#155c43] bg-[#f0f8f3] ring-2 ring-[#155c43]/10"
                          : "border-gray-200 hover:border-[#155c43]/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-[#14261f]">{saved.fullName}</p>
                          <p className="text-sm text-gray-500 mt-1">{saved.street}</p>
                          <p className="text-sm text-gray-500">
                            {saved.city}, {saved.state} - {saved.pincode}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">{saved.phone}</p>
                        </div>
                        <span className={`text-xs font-semibold ${selectedAddressIndex === index ? "text-[#155c43]" : "text-gray-400"}`}>
                          {selectedAddressIndex === index ? "Selected" : "Use this"}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {(savedAddresses.length === 0 || isNewAddress) && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#155c43] transition-colors" />
                  <input
                    type="text"
                    name="fullName"
                    value={address.fullName}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className="w-full bg-[#f8faf9] border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-[#155c43] focus:ring-[3px] focus:ring-[#155c43]/10 transition-all"
                  />
                </div>
                <div className="relative group">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#155c43] transition-colors" />
                  <input
                    type="tel"
                    name="phone"
                    value={address.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    className="w-full bg-[#f8faf9] border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-[#155c43] focus:ring-[3px] focus:ring-[#155c43]/10 transition-all"
                  />
                </div>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#155c43] transition-colors" />
                  <input
                    type="email"
                    name="email"
                    value={address.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    className="w-full bg-[#f8faf9] border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-[#155c43] focus:ring-[3px] focus:ring-[#155c43]/10 transition-all"
                  />
                </div>
                <div className="relative md:col-span-2 group">
                  <Home className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400 group-focus-within:text-[#155c43] transition-colors" />
                  <textarea
                    name="address"
                    value={address.address}
                    onChange={handleChange}
                    placeholder="Complete Address (House, Street, Area...)"
                    rows={3}
                    className="w-full bg-[#f8faf9] border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none resize-none focus:border-[#155c43] focus:ring-[3px] focus:ring-[#155c43]/10 transition-all"
                  />
                </div>
                <div className="relative group">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#155c43] transition-colors" />
                  <input
                    type="text"
                    name="city"
                    value={address.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="w-full bg-[#f8faf9] border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-[#155c43] focus:ring-[3px] focus:ring-[#155c43]/10 transition-all"
                  />
                </div>
                <div className="relative group">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#155c43] transition-colors" />
                  <input
                    type="text"
                    name="state"
                    value={address.state}
                    onChange={handleChange}
                    placeholder="State"
                    className="w-full bg-[#f8faf9] border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-[#155c43] focus:ring-[3px] focus:ring-[#155c43]/10 transition-all"
                  />
                </div>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#155c43] transition-colors" />
                  <input
                    type="text"
                    name="pincode"
                    value={address.pincode}
                    onChange={handleChange}
                    placeholder="Pincode"
                    className="w-full bg-[#f8faf9] border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-[#155c43] focus:ring-[3px] focus:ring-[#155c43]/10 transition-all"
                  />
                </div>
                <div className="md:col-span-2 flex items-center justify-between gap-3 pt-1">
                  <span className="text-xs text-gray-400">This address will be saved to your Addresses.</span>
                  <div className="flex items-center gap-3">
                    {savedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsNewAddress(false)}
                        className="text-sm font-semibold text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={saveNewAddress}
                      className="bg-[#155c43] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#104b36] transition-colors"
                    >
                      Save address
                    </button>
                  </div>
                </div>
              </div>
              )}
            </motion.section>

            {/* Payment Method */}
            <motion.section
              variants={itemVariants}
              className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#e9f5ef] flex items-center justify-center text-[#155c43]">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#14261f]">Pay with Razorpay</h2>
                  <p className="text-xs text-gray-500">UPI, cards, net banking, wallets and other supported methods.</p>
                </div>
              </div>

              <div className="space-y-3">
                <motion.label
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex items-center gap-4 border border-[#155c43] bg-[#f0f8f3] shadow-md shadow-[#155c43]/5 rounded-xl p-4 cursor-default"
                >
                  <div className="w-5 h-5 rounded-full border-2 border-[#155c43] flex items-center justify-center flex-shrink-0">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2.5 h-2.5 bg-[#155c43] rounded-full"
                    />
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#14261f]">Razorpay Checkout</p>
                    <p className="text-xs text-gray-500">Google Pay, PhonePe, BharatPe, UPI apps, cards, net banking and wallets.</p>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="ml-auto"
                  >
                    <Check className="w-5 h-5 text-[#155c43]" />
                  </motion.div>
                </motion.label>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {RAZORPAY_CONFIG.methods.map((method) => (
                  <div key={method.id} className="rounded-xl border border-[var(--color-green-soft)] bg-[var(--color-green-bg)]/60 px-4 py-3">
                    <p className="text-sm font-semibold text-[#14261f]">{method.label}</p>
                    <p className="text-xs text-gray-500">{method.detail}</p>
                  </div>
                ))}
              </div>
              {!isRazorpayConfigured() && (
                <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  Razorpay key is not configured yet. Add `VITE_RAZORPAY_KEY_ID` and start the payment API to collect live payments. Your order will still be saved so dashboards keep working.
                </p>
              )}
              {paymentError && (
                <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700" role="alert">
                  {paymentError}
                </p>
              )}
            </motion.section>

            {/* Order Items */}
            <motion.section
              variants={itemVariants}
              className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#e9f5ef] flex items-center justify-center text-[#155c43]">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#14261f]">Your Items</h2>
                  <p className="text-xs text-gray-500">{cartCount} items in your order</p>
                </div>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {cart.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#f8faf9] transition-colors"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-gray-100">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-[#14261f] truncate">{item.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-[#155c43] text-sm">₹{item.price * item.quantity}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.section>
          </div>

          {/* RIGHT SIDE - SUMMARY */}
          <motion.aside
            variants={slideInRight}
            className="lg:sticky lg:top-6 h-fit"
          >
            <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-lg shadow-[#155c43]/5">
              <h2 className="text-lg font-bold text-[#14261f] mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#155c43]" /> Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Items ({cartCount})</span>
                  <span className="font-medium">₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" /> Delivery Fee
                  </span>
                  <span className="font-medium">₹{deliveryFee}</span>
                </div>
                <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                  <span className="font-bold text-[#14261f]">Total</span>
                  <motion.span
                    key={total}
                    initial={{ scale: 1.2, color: "#155c43" }}
                    animate={{ scale: 1, color: "#155c43" }}
                    className="font-bold text-xl"
                  >
                    ₹{total}
                  </motion.span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(21,92,67,0.35)" }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isPlacing}
                className="w-full mt-6 bg-gradient-to-r from-[#155c43] to-[#1a6b4e] text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-[#155c43]/25 hover:from-[#104b36] hover:to-[#155c43] transition-all disabled:opacity-70 flex items-center justify-center gap-2 relative overflow-hidden"
              >
                {isPlacing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Place & Pay
                  </>
                )}
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={isPlacing ? {} : { x: "200%" }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                />
              </motion.button>

              <div className="flex items-center justify-center gap-2 mt-4 text-[0.65rem] text-gray-400">
                <ShieldCheck className="w-3 h-3" />
                Secured by Razorpay
              </div>
            </div>
          </motion.aside>
        </form>
      </motion.div>
    </CustomerShell>
  );
};

export default Checkout;