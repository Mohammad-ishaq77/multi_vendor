/* oxlint-disable react/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { cartService } from "../../../services/accountService";
import { normalizeCartItems } from "../../../utils/normalize";
import { useAuth } from "../../../context/AuthContext";

const CartContext = createContext(null);

/**
 * The cart lives on the server.
 *
 * `GET /api/cart` is loaded on mount and after every mutation, so the cart
 * survives a refresh or a new sign-in and never has two competing sources of
 * truth. There is deliberately no localStorage cart.
 */
export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart([]);
      return [];
    }
    setLoading(true);
    setError(null);
    try {
      const items = normalizeCartItems(await cartService.list());
      setCart(items);
      return items;
    } catch (err) {
      setError(err?.message || "We could not load your cart.");
      setCart([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const addToCart = useCallback(
    async (product, quantity = 1) => {
      const productId = product?.productId || product?.id;
      if (!productId) return { ok: false, error: "This product is not available." };
      if (product.available === false || Number(product.stock) < quantity) {
        return { ok: false, error: "This product is unavailable or has insufficient stock." };
      }
      try {
        await cartService.addItem(productId, quantity);
        await loadCart();
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err?.message || "Could not add this item to your cart." };
      }
    },
    [loadCart]
  );

  const setQuantity = useCallback(
    async (itemId, quantity) => {
      const target = Math.max(1, Number(quantity) || 1);
      try {
        await cartService.updateQuantity(itemId, target);
        await loadCart();
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err?.message || "Could not update the quantity." };
      }
    },
    [loadCart]
  );

  const increaseQuantity = useCallback(
    async (item) => {
      const line = typeof item === "object" && item !== null ? item : cart.find((i) => i.id === item);
      if (!line) return { ok: false, error: "That cart item no longer exists." };
      return setQuantity(line.id, line.quantity + 1);
    },
    [cart, setQuantity]
  );

  const decreaseQuantity = useCallback(
    async (item) => {
      const line = typeof item === "object" && item !== null ? item : cart.find((i) => i.id === item);
      if (!line) return { ok: false, error: "That cart item no longer exists." };
      if (line.quantity <= 1) return removeFromCart(line.id);
      return setQuantity(line.id, line.quantity - 1);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cart, setQuantity]
  );

  const removeFromCart = useCallback(
    async (itemId) => {
      try {
        await cartService.removeItem(itemId);
        await loadCart();
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err?.message || "Could not remove this item." };
      }
    },
    [loadCart]
  );

  const clearCart = useCallback(async () => {
    const results = await Promise.all(
      cart.map((item) => cartService.removeItem(item.id).catch(() => null))
    );
    await loadCart();
    return results;
  }, [cart, loadCart]);

  const cartCount = useMemo(
    () => cart.reduce((total, item) => total + (Number(item.quantity) || 0), 0),
    [cart]
  );

  const cartTotal = useMemo(
    () => cart.reduce((total, item) => total + Number(item.price || 0) * (Number(item.quantity) || 0), 0),
    [cart]
  );

  const unavailableItems = useMemo(
    () => cart.filter((item) => !item.available || item.stock < 1 || item.quantity > item.stock),
    [cart]
  );

  /** Cart lines grouped by shop — orders are created per shop server-side. */
  const shops = useMemo(() => {
    const groups = new Map();
    cart.forEach((item) => {
      const key = item.shopId || "unknown";
      if (!groups.has(key)) {
        groups.set(key, {
          shopId: item.shopId,
          shopName: item.shopName || item.shop || "Shop",
          items: [],
        });
      }
      groups.get(key).items.push({
        productId: item.productId,
        quantity: Number(item.quantity) || 1,
      });
    });
    return Array.from(groups.values());
  }, [cart]);

  const value = useMemo(
    () => ({
      cart,
      cartCount,
      cartTotal,
      unavailableItems,
      shops,
      loading,
      error,
      reload: loadCart,
      addToCart,
      increaseQuantity,
      decreaseQuantity,
      setQuantity,
      removeFromCart,
      clearCart,
    }),
    [
      cart,
      cartCount,
      cartTotal,
      unavailableItems,
      shops,
      loading,
      error,
      loadCart,
      addToCart,
      increaseQuantity,
      decreaseQuantity,
      setQuantity,
      removeFromCart,
      clearCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

export default CartContext;