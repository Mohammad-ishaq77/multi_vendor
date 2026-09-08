export const deliveryRules = {
  minimumOrder: [
    { minKm: 0, maxKm: 5, amount: 100 },
    { minKm: 5, maxKm: 10, amount: 150 },
    { minKm: 10, maxKm: 15, amount: 250 },
    { minKm: 15, maxKm: 20, amount: 350 },
  ],
  maxDeliveryKm: 20,
  firstKmFee: 15,
  additionalKmFee: 5,
  partnerRevenueShare: 0.8,
  nearMartRevenueShare: 0.2,
};

export function getMinimumOrder(distance) {
  const rule = deliveryRules.minimumOrder.find(
    (r) => distance >= r.minKm && distance < r.maxKm
  );
  return rule ? rule.amount : null;
}

export function calculateDeliveryFee(distance) {
  if (distance <= 0) return 0;
  if (distance > deliveryRules.maxDeliveryKm) return null;
  const km = Math.ceil(distance);
  return deliveryRules.firstKmFee + (km - 1) * deliveryRules.additionalKmFee;
}

export function calculatePartnerEarning(deliveryFee) {
  return Math.round(deliveryFee * deliveryRules.partnerRevenueShare * 100) / 100;
}

export function calculateNearMartCommission(deliveryFee) {
  return Math.round(deliveryFee * deliveryRules.nearMartRevenueShare * 100) / 100;
}
