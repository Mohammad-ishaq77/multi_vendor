import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  Truck,
  ShieldCheck,
  Tag,
  ArrowRight,
  ShoppingCart,
  PackageOpen,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import CustomerShell from "../components/CustomerShell";

const CartItem = ({ item, onIncrease, onDecrease, onRemove }) => {
  const [removing, setRemoving] = useState(false);

  const handleRemove = () => {
    setRemoving(true);
    setTimeout(() => onRemove(item.id), 300);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: removing ? 0 : 1, y: removing ? -10 : 0, scale: removing ? 0.95 : 1 }}
      exit={{ opacity: 0, x: -40, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:shadow-lg hover:border-gray-200/80 transition-all duration-300"
    >
      <div className="flex gap-4">
        {/* Image */}
        <Link
          to={`/customer/product/${item.id}`}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100"
        >
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Details */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-emerald-600/70">
                {item.category}
              </span>
              <h3 className="text-sm sm:text-[0.9rem] font-bold text-gray-900 leading-snug mt-0.5 line-clamp-2">
                {item.name}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">{item.unit}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleRemove}
              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors shrink-0"
              aria-label="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Price & Quantity */}
          <div className="flex items-end justify-between mt-auto pt-3">
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-bold text-emerald-700">
                ₹{item.price * item.quantity}
              </span>
              {item.originalPrice && (
                <span className="text-xs text-gray-400 line-through">
                  ₹{item.originalPrice * item.quantity}
                </span>
              )}
            </div>

            <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 p-0.5">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => onDecrease(item.id)}
                disabled={item.quantity <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Minus className="w-3.5 h-3.5" />
              </motion.button>
              <span className="w-9 text-center text-sm font-bold text-gray-900">
                {item.quantity}
              </span>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => onIncrease(item.id)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors text-gray-600"
              >
                <Plus className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Cart = () => {
  const navigate = useNavigate();
  const {
    cart,
    cartCount,
    cartTotal,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const deliveryFee = cartTotal > 100 ? 0 : 30;
  const discount = promoApplied ? Math.round(cartTotal * 0.1) : 0;
  const total = cartTotal + deliveryFee - discount;

  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === "near10") {
      setPromoApplied(true);
    }
  };

  return (
    <CustomerShell>
      <div className="min-h-screen bg-[#fafcfb]">
        {/* Header */}
        <div className="bg-white border-b border-gray-100/60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Page Title */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Shopping Cart
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {cartCount} {cartCount === 1 ? "item" : "items"} in your cart
            </p>
          </div>

          <AnimatePresence mode="wait">
            {cart.length === 0 ? (
              /* Empty State */
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 sm:py-24"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mb-6 border border-gray-100"
                >
                  <PackageOpen className="w-11 h-11 text-gray-300" />
                </motion.div>
                <h2 className="text-xl font-bold text-gray-900">Your cart is empty</h2>
                <p className="text-sm text-gray-500 mt-2 max-w-xs text-center">
                  Looks like you haven't added any products yet. Start exploring local shops.
                </p>
                <Link
                  to="/customer/products"
                  className="mt-6 inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Start Shopping
                </Link>
              </motion.div>
            ) : (
              /* Cart Content */
              <div className="grid lg:grid-cols-3 gap-6 lg:gap-8" key="content">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-3">
                  <AnimatePresence mode="popLayout">
                    {cart.map((item) => (
                      <CartItem
                        key={item.id}
                        item={item}
                        onIncrease={increaseQuantity}
                        onDecrease={decreaseQuantity}
                        onRemove={removeFromCart}
                      />
                    ))}
                  </AnimatePresence>

                  {/* Clear Cart */}
                  <motion.button
                    whileHover={{ x: 2 }}
                    onClick={clearCart}
                    className="text-sm font-medium text-gray-400 hover:text-rose-500 transition-colors flex items-center gap-1.5 mt-4"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear Cart
                  </motion.button>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm sticky top-24">
                    <h2 className="text-base font-bold text-gray-900 mb-5">Order Summary</h2>

                    {/* Promo Code */}
                    <div className="mb-5">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                        Promo Code
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            placeholder="Enter code"
                            disabled={promoApplied}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-9 pr-3 text-sm outline-none transition-all focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-50 disabled:opacity-50"
                          />
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={handleApplyPromo}
                          disabled={promoApplied || !promoCode}
                          className="px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {promoApplied ? "Applied" : "Apply"}
                        </motion.button>
                      </div>
                      {promoApplied && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1"
                        >
                          <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-[0.55rem]">✓</span>
                          10% discount applied!
                        </motion.p>
                      )}
                    </div>

                    {/* Summary Lines */}
                    <div className="space-y-3 pb-4 border-b border-gray-100">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subtotal ({cartCount} items)</span>
                        <span className="font-semibold text-gray-900">₹{cartTotal}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Delivery Fee</span>
                        <span className={`font-semibold ${deliveryFee === 0 ? "text-emerald-600" : "text-gray-900"}`}>
                          {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                        </span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Discount</span>
                          <span className="font-semibold text-emerald-600">-₹{discount}</span>
                        </div>
                      )}
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-baseline pt-4 mb-5">
                      <span className="text-sm font-semibold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-emerald-700">₹{total}</span>
                    </div>

                    {/* Checkout Button */}
                    <Link
                      to="/customer/checkout"
                      className="flex items-center justify-center gap-2 w-full bg-emerald-600 text-white py-3.5 rounded-xl font-semibold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 hover:shadow-emerald-600/30 transition-all"
                    >
                      Proceed to Checkout
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    {/* Trust Badges */}
                    <div className="mt-5 pt-4 border-t border-gray-100 space-y-3">
                      <div className="flex items-center gap-2.5 text-xs text-gray-500">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                          <Truck className="w-3.5 h-3.5" />
                        </div>
                        <span>{deliveryFee === 0 ? "Free delivery on orders above ₹100" : "Delivery fee: ₹30"}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-gray-500">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </div>
                        <span>Secure checkout with encrypted payment</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </CustomerShell>
  );
};

export default Cart;