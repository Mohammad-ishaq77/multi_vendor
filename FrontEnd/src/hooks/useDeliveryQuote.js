import { useEffect, useState } from "react";
import { orderService } from "../services/orderService";

/**
 * Server-priced delivery preview for checkout.
 *
 * Fetches GET /api/orders/delivery-quote for the given shop + saved address
 * and returns the real road distance, delivery fee and availability. The
 * server recomputes everything, so this preview can never disagree with what
 * POST /api/orders actually charges.
 *
 * @param {string|null} shopId
 * @param {string|null} addressId
 * @returns {{quote: object|null, loading: boolean, error: string}}
 */
export const useDeliveryQuote = (shopId, addressId) => {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!shopId || !addressId) {
      setQuote(null);
      setError("");
      setLoading(false);
      return undefined;
    }

    let active = true;
    setLoading(true);
    setError("");
    setQuote(null);

    orderService
      .deliveryQuote(shopId, addressId)
      .then((data) => {
        if (active) setQuote(data || null);
      })
      .catch((err) => {
        if (active) setError(err?.message || "Unable to calculate delivery distance. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [shopId, addressId]);

  return { quote, loading, error };
};

export default useDeliveryQuote;
