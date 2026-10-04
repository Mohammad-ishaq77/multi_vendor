import { ORDER_STATUSES } from "../../entities/Order.js";

/** Forward-only fulfilment flow. "cancelled" is reachable from the early states only. */
export const ORDER_FLOW = [
  "pending",
  "confirmed",
  "preparing",
  "ready_for_pickup",
  "out_for_delivery",
  "delivered",
  "completed",
];

export const CANCELLABLE_STATES = ["pending", "confirmed", "preparing"];

export function canTransition(from, to) {
  if (from === to) return false;
  if (to === "cancelled") return CANCELLABLE_STATES.includes(from);
  const fromIndex = ORDER_FLOW.indexOf(from);
  const toIndex = ORDER_FLOW.indexOf(to);
  return fromIndex !== -1 && toIndex === fromIndex + 1;
}

/** Statuses a shopkeeper/admin may move this order to next. */
export function allowedNextStatuses(from) {
  const next = [];
  if (CANCELLABLE_STATES.includes(from)) next.push("cancelled");
  const index = ORDER_FLOW.indexOf(from);
  if (index !== -1 && index + 1 < ORDER_FLOW.length) next.push(ORDER_FLOW[index + 1]);
  return next;
}

export { ORDER_STATUSES };