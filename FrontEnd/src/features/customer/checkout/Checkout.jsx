import React, { useEffect, useMemo, useState } from "react";
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
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import CustomerShell from "../components/CustomerShell";
import { useToast } from "../../../components/common/Toast";
import { useAuth } from "../../../hooks/useAuth";
import { orderService, paymentApi } from "../../../services/orderService";
import paymentService from "../../../services/paymentService";
import { addressService } from "../../../services/accountService";
import { shopService } from "../../../services/catalogService";
import { normalizeAddresses, normalizeOrder, normalizeShop } from "../../../utils/normalize";
import { hasRazorpayPublicKey } from "../../../config/env";
import { RAZORPAY_CONFIG } from "../../../config/razorpay";
import LocationPicker from "../../../components/common/LocationPicker";
import { useDeliveryQuote } from "../../../hooks/useDeliveryQuote";

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
  const { cart, cartCount, cartTotal, shops, unavailableItems, reload: reloadCart } = useCart();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [isPlacing, setIsPlacing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("razorpay");

  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [addressId, setAddressId] = useState(null);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [addressesError, setAddressesError] = useState("");
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);
  const [isNewAddress, setIsNewAddress] = useState(false);
  const [checkoutShop, setCheckoutShop] = useState(null);
  const [shopDetailsError, setShopDetailsError] = useState("");

  // Map location for the inline "new address" form.
  const [newAddressLocation, setNewAddressLocation] = useState(null);
  const [newAddressPlace, setNewAddressPlace] = useState(null);
  // Map location pending save for an existing address that has none yet.
  const [pendingSavedLocation, setPendingSavedLocation] = useState(null);
  const [pendingSavedPlace, setPendingSavedPlace] = useState(null);
  const [savingLocation, setSavingLocation] = useState(false);

  /** Whether the SERVER is actually able to take a payment right now. */
  const [paymentsConfigured, setPaymentsConfigured] = useState(null);

  // Addresses live on the server (GET /api/addresses).
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = normalizeAddresses(await addressService.list());
        if (!active) return;
        setSavedAddresses(list);
        const defaultIndex = list.findIndex((item) => item.isDefault);
        const index = defaultIndex >= 0 ? defaultIndex : 0;
        const saved = list[index];
        if (saved) {
          setSelectedAddressIndex(index);
          setAddressId(saved.id);
          setAddress({
            fullName: saved.fullName || "",
            email: user?.email || "",
            phone: saved.phone || "",
            address: saved.line1 || "",
            city: saved.city || "",
            state: saved.state || "",
            pincode: saved.pincode || "",
          });
        }
      } catch (error) {
        if (active) setAddressesError(error?.message || "We could not load your saved addresses.");
      } finally {
        if (active) setAddressesLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user?.email]);

  const singleShop = shops.length === 1 ? shops[0] : null;

  const selectedSavedAddress =
    !isNewAddress && selectedAddressIndex != null ? savedAddresses[selectedAddressIndex] : null;
  const selectedMissingLocation = Boolean(selectedSavedAddress && !selectedSavedAddress.hasLocation);

  // Server-priced delivery preview: real road distance + fee for the selected
  // shop/address. Only available once an address is saved and selected —
  // an inline, not-yet-saved address (or one without map coordinates) would
  // only produce an error, so we wait instead.
  const {
    quote: deliveryQuote,
    loading: quoteLoading,
    error: quoteError,
  } = useDeliveryQuote(
    isNewAddress || selectedMissingLocation ? null : singleShop?.shopId || null,
    isNewAddress || selectedMissingLocation ? null : addressId
  );

  useEffect(() => {
    if (!singleShop?.shopId) {
      setCheckoutShop(null);
      setShopDetailsError("");
      return undefined;
    }

    let active = true;
    setCheckoutShop(null);
    setShopDetailsError("");
    shopService
      .get(singleShop.shopId)
      .then((shop) => {
        if (!active) return;
        if (!shop) {
          setShopDetailsError("Shop details could not be loaded. Please refresh and try again.");
          return;
        }
        setCheckoutShop(normalizeShop(shop));
      })
      .catch((error) => {
        if (active) setShopDetailsError(error?.message || "Shop details could not be loaded.");
      });

    return () => {
      active = false;
    };
  }, [singleShop?.shopId]);

  // Ask the server whether Razorpay is configured before showing the payment UI.
  useEffect(() => {
    let active = true;
    paymentApi
      .config()
      .then((config) => {
        if (active) setPaymentsConfigured(Boolean(config?.configured));
      })
      .catch(() => {
        if (active) setPaymentsConfigured(false);
      });
    return () => {
      active = false;
    };
  }, []);

  /**
   * Orders belong to exactly one shop, so a cart that spans several shops has to
   * be checked out shop by shop. Saying so is better than silently splitting it.
   */
  const multiShop = shops.length > 1;
  const minimumOrder = Number(checkoutShop?.minOrder) || 0;
  const minimumOrderShortfall = Boolean(
    checkoutShop &&
      Math.round(cartTotal * 100) < Math.round(minimumOrder * 100)
  );

  // Shown as an estimate; the amount actually charged is the server's total.
  const estimatedDeliveryFee =
    deliveryQuote?.deliveryAvailable ? Number(deliveryQuote.deliveryFee) : 0;
  const estimatedTotal = cartTotal + estimatedDeliveryFee;

  const deliveryUnavailableMessage =
    selectedSavedAddress && deliveryQuote && !deliveryQuote.deliveryAvailable
      ? deliveryQuote.message ||
        "Delivery not available in this area."
      : "";
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const selectSavedAddress = (index) => {
    const saved = savedAddresses[index];
    setSelectedAddressIndex(index);
    setIsNewAddress(false);
    setAddressId(saved.id);
    setPendingSavedLocation(null);
    setPendingSavedPlace(null);
    setAddress({
      fullName: saved.fullName || "",
      email: user?.email || "",
      phone: saved.phone || "",
      address: saved.line1 || "",
      city: saved.city || "",
      state: saved.state || "",
      pincode: saved.pincode || "",
    });
  };

  const startNewAddress = () => {
    setSelectedAddressIndex(null);
    setAddressId(null);
    setIsNewAddress(true);
    setAddress({ ...EMPTY_ADDRESS, email: user?.email || "" });
    setNewAddressLocation(null);
    setNewAddressPlace(null);
    setPendingSavedLocation(null);
    setPendingSavedPlace(null);
  };

  /** Reverse-geocoded parts for the new address: prefill only empty fields. */
  const handleNewAddressPlace = (place) => {
    setNewAddressPlace(place);
    if (!place) return;
    setAddress((prev) => ({
      ...prev,
      address: prev.address || place.line1 || "",
      city: prev.city || place.city || "",
      state: prev.state || place.state || "",
      pincode: prev.pincode || place.pincode || "",
    }));
  };

  const isAddressComplete = Boolean(
    address.fullName && address.phone && address.address && address.city && address.pincode
  );

  /** Persist a newly typed address through POST /api/addresses. */
  const saveNewAddress = async () => {
    if (!isAddressComplete) {
      return showToast("Please fill in all address details before saving.", "error");
    }
    if (!newAddressLocation) {
      return showToast("Please select your delivery location on the map.", "error");
    }
    try {
      // The reverse geocode may have landed after the user started typing —
      // fill anything they left blank from the located place.
      const created = await addressService.create({
        fullName: address.fullName.trim(),
        phone: address.phone.trim(),
        line1: address.address.trim(),
        line2: "",
        city: address.city.trim() || (newAddressPlace?.city ?? ""),
        state: address.state.trim() || (newAddressPlace?.state ?? ""),
        pincode: address.pincode.trim() || (newAddressPlace?.pincode ?? ""),
        label: "Home",
        lat: newAddressLocation.lat,
        lng: newAddressLocation.lng,
        isDefault: savedAddresses.length === 0,
      });

      const normalized = normalizeAddresses([created])[0];
      const next = [...savedAddresses, normalized];
      setSavedAddresses(next);
      setSelectedAddressIndex(next.length - 1);
      setAddressId(normalized.id);
      setIsNewAddress(false);
      setNewAddressLocation(null);
      setNewAddressPlace(null);
      showToast("Address saved");
    } catch (error) {
      showToast(error?.message || "We could not save that address.", "error");
    }
  };

  /** Attach a map location to a saved address that does not have one yet. */
  const saveSelectedAddressLocation = async () => {
    const target = savedAddresses[selectedAddressIndex];
    if (!target) return;
    if (!pendingSavedLocation) {
      return showToast("Please select your delivery location on the map.", "error");
    }
    setSavingLocation(true);
    try {
      const patch = { lat: pendingSavedLocation.lat, lng: pendingSavedLocation.lng };
      if (!target.city && pendingSavedPlace?.city) patch.city = pendingSavedPlace.city;
      if (!target.state && pendingSavedPlace?.state) patch.state = pendingSavedPlace.state;
      if (!target.pincode && pendingSavedPlace?.pincode) patch.pincode = pendingSavedPlace.pincode;

      const updated = await addressService.update(target.id, patch);
      const normalized = normalizeAddresses([updated])[0];
      setSavedAddresses((prev) => prev.map((item) => (item.id === target.id ? normalized : item)));
      setPendingSavedLocation(null);
      setPendingSavedPlace(null);
      showToast("Delivery location saved");
    } catch (error) {
      showToast(error?.message || "We could not save that location.", "error");
    } finally {
      setSavingLocation(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return showToast("Your cart is empty.", "error");
    if (unavailableItems.length > 0) {
      return showToast("Remove unavailable or out-of-stock items before placing your order.", "error");
    }
    if (multiShop) {
      return showToast("Please check out one shop at a time.", "error");
    }
    if (!singleShop?.shopId) {
      return showToast("Your cart items are not linked to a shop yet. Refresh and try again.", "error");
    }
    if (!checkoutShop) {
      return showToast("Shop details are still loading. Please try again.", "error");
    }
    if (minimumOrderShortfall) {
      return showToast(
        `Orders from ${checkoutShop.name} start at ₹${minimumOrder.toFixed(2)}. Add ₹${(minimumOrder - cartTotal).toFixed(2)} more.`,
        "error"
      );
    }
    if (!addressId) {
      return showToast("Please select or save a delivery address.", "error");
    }
    if (selectedMissingLocation) {
      return showToast("Please select your delivery location on the map.", "error");
    }
    if (deliveryUnavailableMessage) {
      return showToast(deliveryUnavailableMessage, "error");
    }
    setIsPlacing(true);
    setPaymentError("");

    try {
      // 1. The server prices the order and reserves stock.
      const created = await orderService.create({
        shopId: singleShop.shopId,
        addressId,
        items: singleShop.items,
        paymentMethod: selectedPaymentMethod,
      });
      const order = normalizeOrder(created);

      if (selectedPaymentMethod === "razorpay") {
        // 2. Pay that exact, server-computed amount.
        await paymentService.checkout({
          amount: order.total,
          orderId: order.id,
          customer: {
            fullName: address.fullName,
            email: user?.email || address.email,
            phone: address.phone,
          },
          description: `NearMart order ${order.id.slice(0, 8)}`,
        });
      }

      await reloadCart();
      showToast(selectedPaymentMethod === "razorpay" ? "Payment successful. Your order has been placed." : "Your order has been placed successfully.");
      navigate(`/customer/orders/${order.id}`);
    } catch (error) {
      const message = error?.cancelled
        ? "Payment was cancelled before completion. The order is saved with a pending payment."
        : error?.message || "Payment failed. Please try again.";
      setPaymentError(message);
      showToast(message, "error");
      // The server already consumed the cart rows when it created the order,
      // so the local cart has to be re-read whatever the payment outcome was.
      await reloadCart();
    } finally {
      setIsPlacing(false);
    }
  };

  const paymentHint = useMemo(() => {
    if (paymentsConfigured === null) return "Checking payment availability...";
    return paymentsConfigured
      ? null
      : "Payments are not available right now: the server has no Razorpay credentials configured.";
  }, [paymentsConfigured]);

  /** The server must confirm Razorpay before the pay button can work. */
  const isRazorpayAvailable = paymentsConfigured === true && hasRazorpayPublicKey();

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
            className="bg-[#155c43] text-white px-8 py-3 rounded-md font-semibold shadow-lg shadow-[#155c43]/20 hover:bg-[#104b36] transition-colors"
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

        {multiShop && (
          <div className="mb-6 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800" role="alert">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Your cart has items from {shops.length} different shops. Orders are placed per shop, so please
              check out one shop at a time.
            </span>
          </div>
        )}

        {addressesError && (
          <div className="mb-6 flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{addressesError} You can still type a new address below.</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid lg:grid-cols-3 gap-8">
          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <motion.section
              variants={itemVariants}
              className="bg-white border border-gray-100 rounded-lg p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-[#e9f5ef] flex items-center justify-center text-[#155c43]">
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

              {addressesLoading ? (
                <div className="space-y-3">
                  <div className="h-24 animate-pulse rounded-md bg-gray-50" />
                  <div className="h-24 animate-pulse rounded-md bg-gray-50" />
                </div>
              ) : (
                <>
              {savedAddresses.length > 0 && !isNewAddress && (
                <div className="space-y-3">
                  {savedAddresses.map((saved, index) => (
                    <button
                      key={saved.id}
                      type="button"
                      onClick={() => selectSavedAddress(index)}
                      className={`w-full text-left border rounded-md p-4 transition-all ${
                        selectedAddressIndex === index
                          ? "border-[#155c43] bg-[#f0f8f3] ring-2 ring-[#155c43]/10"
                          : "border-gray-200 hover:border-[#155c43]/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-[#14261f]">{saved.fullName}</p>
                          <p className="text-sm text-gray-500 mt-1">{saved.line1}</p>
                          <p className="text-sm text-gray-500">
                            {saved.city}, {saved.state} - {saved.pincode}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">{saved.phone}</p>
                          {!saved.hasLocation && (
                            <span className="mt-2 inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[0.65rem] font-semibold text-amber-700">
                              <AlertCircle className="h-3 w-3" /> No map location yet
                            </span>
                          )}
                        </div>
                        <span className={`text-xs font-semibold ${selectedAddressIndex === index ? "text-[#155c43]" : "text-gray-400"}`}>
                          {selectedAddressIndex === index ? "Selected" : "Use this"}
                        </span>
                      </div>
                      </button>
                    ))}
                    {selectedMissingLocation && (
                      <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                        <p className="mb-3 flex items-start gap-2 text-xs font-semibold text-amber-800">
                          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          This address has no map location yet. Set it so we can calculate the real road
                          distance and delivery fee.
                        </p>
                        <LocationPicker
                          label="Set delivery location"
                          value={pendingSavedLocation}
                          onChange={setPendingSavedLocation}
                          onAddressChange={setPendingSavedPlace}
                          mapHeight="h-56 sm:h-64"
                        />
                        <button
                          type="button"
                          onClick={saveSelectedAddressLocation}
                          disabled={savingLocation}
                          className="mt-3 w-full bg-[#155c43] text-white py-2.5 rounded-md text-sm font-semibold hover:bg-[#104b36] transition-colors disabled:opacity-60"
                        >
                          {savingLocation ? "Saving location…" : "Save location"}
                        </button>
                      </div>
                    )}
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
                    className="w-full bg-[#f8faf9] border border-gray-200 rounded-md pl-10 pr-4 py-3 text-sm outline-none focus:border-[#155c43] focus:ring-[3px] focus:ring-[#155c43]/10 transition-all"
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
                    className="w-full bg-[#f8faf9] border border-gray-200 rounded-md pl-10 pr-4 py-3 text-sm outline-none focus:border-[#155c43] focus:ring-[3px] focus:ring-[#155c43]/10 transition-all"
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
                    className="w-full bg-[#f8faf9] border border-gray-200 rounded-md pl-10 pr-4 py-3 text-sm outline-none focus:border-[#155c43] focus:ring-[3px] focus:ring-[#155c43]/10 transition-all"
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
                    className="w-full bg-[#f8faf9] border border-gray-200 rounded-md pl-10 pr-4 py-3 text-sm outline-none resize-none focus:border-[#155c43] focus:ring-[3px] focus:ring-[#155c43]/10 transition-all"
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
                    className="w-full bg-[#f8faf9] border border-gray-200 rounded-md pl-10 pr-4 py-3 text-sm outline-none focus:border-[#155c43] focus:ring-[3px] focus:ring-[#155c43]/10 transition-all"
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
                    className="w-full bg-[#f8faf9] border border-gray-200 rounded-md pl-10 pr-4 py-3 text-sm outline-none focus:border-[#155c43] focus:ring-[3px] focus:ring-[#155c43]/10 transition-all"
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
                    className="w-full bg-[#f8faf9] border border-gray-200 rounded-md pl-10 pr-4 py-3 text-sm outline-none focus:border-[#155c43] focus:ring-[3px] focus:ring-[#155c43]/10 transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <LocationPicker
                    label="Delivery location on the map"
                    hint="Search for your area or tap the map — this is the exact point we price delivery from."
                    value={newAddressLocation}
                    onChange={setNewAddressLocation}
                    onAddressChange={handleNewAddressPlace}
                    mapHeight="h-64 sm:h-72"
                  />
                  {!newAddressLocation && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-rose-500">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Please select your delivery location on the map.
                    </p>
                  )}
                </div>
                <div className="md:col-span-2 flex items-center justify-between gap-3 pt-1">
                  <span className="text-xs text-gray-400">This address will be saved to your Addresses.</span>
                  <div className="flex items-center gap-3">
                    {savedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const defaultIndex = savedAddresses.findIndex((item) => item.isDefault);
                          selectSavedAddress(defaultIndex >= 0 ? defaultIndex : 0);
                        }}
                        className="text-sm font-semibold text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={saveNewAddress}
                      className="bg-[#155c43] text-white px-4 py-2.5 rounded-md text-sm font-semibold hover:bg-[#104b36] transition-colors"
                    >
                      Save address
                    </button>
                  </div>
                </div>
              </div>
              )}
                </>
              )}
            </motion.section>

            {checkoutShop && (
              <section className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm" aria-live="polite">
                <h2 className="font-bold text-[#14261f]">Shop minimum order</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Minimum order: ₹{checkoutShop.minOrder.toFixed(2)}
                </p>
                {minimumOrderShortfall ? (
                  <p role="alert" className="mt-2 text-sm text-amber-800">
                    Orders from {checkoutShop.name} start at ₹{minimumOrder.toFixed(2)}.
                    Add ₹{(minimumOrder - cartTotal).toFixed(2)} more from this shop to place your order.
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-emerald-700">Your cart meets this shop's minimum order.</p>
                )}
              </section>
            )}

            {shopDetailsError && (
              <p className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
                {shopDetailsError}
              </p>
            )}

            {/* Payment Method */}
            <motion.section
              variants={itemVariants}
              className="bg-white border border-gray-100 rounded-lg p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-md bg-[#e9f5ef] flex items-center justify-center text-[#155c43]">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#14261f]">Payment Method</h2>
                  <p className="text-xs text-gray-500">Choose how you want to pay for your order.</p>
                </div>
              </div>

              <div className="space-y-3">
                <motion.button
                  type="button"
                  onClick={() => setSelectedPaymentMethod("razorpay")}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full flex items-center gap-4 border shadow-md shadow-[#155c43]/5 rounded-md p-4 transition-all text-left ${
                    selectedPaymentMethod === "razorpay" 
                      ? "border-[#155c43] bg-[#f0f8f3]" 
                      : "border-gray-200 bg-white hover:border-[#155c43]/50"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selectedPaymentMethod === "razorpay" ? "border-[#155c43]" : "border-gray-300"
                  }`}>
                    {selectedPaymentMethod === "razorpay" && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2.5 h-2.5 bg-[#155c43] rounded-full"
                      />
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-[#14261f]">Online Payment (Razorpay)</p>
                    <p className="text-xs text-gray-500 mt-0.5">UPI apps, cards, net banking and wallets.</p>
                  </div>
                  {selectedPaymentMethod === "razorpay" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="shrink-0"
                    >
                      <Check className="w-5 h-5 text-[#155c43]" />
                    </motion.div>
                  )}
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => setSelectedPaymentMethod("cod")}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full flex items-center gap-4 border shadow-md shadow-[#155c43]/5 rounded-md p-4 transition-all text-left ${
                    selectedPaymentMethod === "cod" 
                      ? "border-[#155c43] bg-[#f0f8f3]" 
                      : "border-gray-200 bg-white hover:border-[#155c43]/50"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selectedPaymentMethod === "cod" ? "border-[#155c43]" : "border-gray-300"
                  }`}>
                    {selectedPaymentMethod === "cod" && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2.5 h-2.5 bg-[#155c43] rounded-full"
                      />
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                    <span className="font-bold text-lg text-gray-500">₹</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-[#14261f]">Cash on Delivery</p>
                    <p className="text-xs text-gray-500 mt-0.5">Pay with cash when your order is delivered.</p>
                  </div>
                  {selectedPaymentMethod === "cod" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="shrink-0"
                    >
                      <Check className="w-5 h-5 text-[#155c43]" />
                    </motion.div>
                  )}
                </motion.button>
              </div>

              <AnimatePresence>
                {selectedPaymentMethod === "razorpay" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {RAZORPAY_CONFIG.methods.map((method) => (
                        <div key={method.id} className="rounded-md border border-(--color-green-soft) bg-(--color-green-bg)/60 px-4 py-3">
                          <p className="text-sm font-semibold text-[#14261f]">{method.label}</p>
                          <p className="text-xs text-gray-500">{method.detail}</p>
                        </div>
                      ))}
                    </div>
                    {!isRazorpayAvailable && (
                      <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                        {paymentHint} Ask an administrator to add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to the
                        server environment before checkout can complete.
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              {paymentError && (
                <p className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700" role="alert">
                  {paymentError}
                </p>
              )}
            </motion.section>

            {/* Order Items */}
            <motion.section
              variants={itemVariants}
              className="bg-white border border-gray-100 rounded-lg p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-md bg-[#e9f5ef] flex items-center justify-center text-[#155c43]">
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
                      className="flex items-center gap-4 p-3 rounded-md hover:bg-[#f8faf9] transition-colors"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden shrink-0 ring-1 ring-gray-100">
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
            <div className="bg-white border border-gray-100 rounded-lg p-6 md:p-8 shadow-lg shadow-[#155c43]/5">
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
                    {quoteLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />}
                  </span>
                  <span className="font-medium">
                    {quoteLoading
                      ? "Calculating…"
                      : deliveryQuote?.deliveryAvailable
                        ? `₹${estimatedDeliveryFee}`
                        : deliveryQuote
                          ? "Unavailable"
                          : isNewAddress
                            ? "After saving"
                            : "—"}
                  </span>
                </div>
                {!quoteLoading && deliveryQuote?.deliveryAvailable && (
                  <p className="-mt-2 text-[0.65rem] text-gray-400">
                    {Number(deliveryQuote.distanceKm).toFixed(2)} km by road from the shop — server-calculated.
                  </p>
                )}
                {quoteError && (
                  <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700" role="alert">
                    {quoteError}
                  </p>
                )}
                {deliveryUnavailableMessage && (
                  <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800" role="alert">
                    {deliveryUnavailableMessage}
                  </p>
                )}
                {selectedMissingLocation && (
                  <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800" role="alert">
                    Please select your delivery location on the map.
                  </p>
                )}
                <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                  <span className="font-bold text-[#14261f]">Estimated Total</span>
                  <motion.span
                    key={estimatedTotal}
                    initial={{ scale: 1.2, color: "#155c43" }}
                    animate={{ scale: 1, color: "#155c43" }}
                    className="font-bold text-xl"
                  >
                    ₹{estimatedTotal}
                  </motion.span>
                </div>
                <p className="text-[0.65rem] leading-relaxed text-gray-400">
                  The final amount is calculated and confirmed by the server when you place the order.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(21,92,67,0.35)" }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={
                  isPlacing ||
                  multiShop ||
                  unavailableItems.length > 0 ||
                  minimumOrderShortfall ||
                  !checkoutShop ||
                  !addressId ||
                  selectedMissingLocation ||
                  Boolean(deliveryUnavailableMessage) ||
                  (selectedPaymentMethod === "razorpay" && !isRazorpayAvailable)
                }
                className="w-full mt-6 bg-linear-to-r from-[#155c43] to-[#1a6b4e] text-white py-3.5 rounded-md font-semibold shadow-lg shadow-[#155c43]/25 hover:from-[#104b36] hover:to-[#155c43] transition-all disabled:opacity-70 flex items-center justify-center gap-2 relative overflow-hidden"
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
                    {selectedPaymentMethod === "razorpay" ? "Place & Pay" : "Place Order"}
                  </>
                )}
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={isPlacing ? {} : { x: "200%" }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent skew-x-12"
                />
              </motion.button>

              <div className="flex items-center justify-center gap-2 mt-4 text-[0.65rem] text-gray-400">
                <ShieldCheck className="w-3 h-3" />
                {selectedPaymentMethod === "razorpay" ? "Secured by Razorpay" : "Pay with Cash on Delivery"}
              </div>
            </div>
          </motion.aside>
        </form>
      </motion.div>
    </CustomerShell>
  );
};

export default Checkout;