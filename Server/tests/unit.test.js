import crypto from "crypto";
import { verifyRazorpaySignature } from "../src/modules/auth/service.js";
import { getPagination, pagedResponse } from "../src/common/utils/pagination.js";
import { slugify, hasCoords } from "../src/common/utils/helpers.js";

describe("payments signature", () => {
  test("valid signature verifies", () => {
    const secret = "test_secret";
    const orderId = "order_123";
    const paymentId = "pay_456";
    const sig = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
    expect(verifyRazorpaySignature(orderId, paymentId, sig, secret)).toBe(true);
  });

  test("tampered signature fails", () => {
    expect(verifyRazorpaySignature("order_123", "pay_456", "bad", "test_secret")).toBe(false);
  });
});

describe("pagination", () => {
  test("defaults", () => {
    expect(getPagination({})).toMatchObject({ page: 1, limit: 20, skip: 0 });
  });

  test("clamps limit", () => {
    const p = getPagination({ page: "2", limit: "500" });
    expect(p).toMatchObject({ page: 2, limit: 100, skip: 100 });
  });

  test("paged response shape", () => {
    const r = pagedResponse([1, 2], 45, 1, 20);
    expect(r.ok).toBe(true);
    expect(r.pagination).toMatchObject({ page: 1, limit: 20, total: 45, pages: 3 });
  });
});

describe("helpers", () => {
  test("slugify", () => {
    expect(slugify("Fresh Basket!")).toBe("fresh-basket");
  });

  test("hasCoords", () => {
    expect(hasCoords(34.08, 74.79)).toBe(true);
    expect(hasCoords(null, 74.79)).toBe(false);
  });
});
