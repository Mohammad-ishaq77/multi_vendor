import { jest } from "@jest/globals";
import request from "supertest";
import { buildApp } from "../src/index.js";
import { resolveActiveRole } from "../src/modules/auth/service.js";
import {
  canDeliveryTransition,
  canShopkeeperTransition,
  canTransition,
  allowedNextStatuses,
} from "../src/modules/orders/status.js";
import { isUuid, idOrSlugParam, uuidParam } from "../src/common/middleware/params.js";
import { productSchema } from "../src/modules/products/routes.js";
import { CANCELLATION_REASONS, cancellationRequestSchema } from "../src/modules/orders/cancellation.js";

const app = buildApp();

describe("multi-role session", () => {
  const user = { role: "customer", allowedRoles: ["shopkeeper", "delivery", "admin"] };

  test("keeps the requested role for a multi-role account", () => {
    expect(resolveActiveRole(user, "admin")).toBe("admin");
    expect(resolveActiveRole(user, "shopkeeper")).toBe("shopkeeper");
  });

  test("never grants a role the account does not hold", () => {
    expect(resolveActiveRole(user, "superuser")).toBe("customer");
    expect(resolveActiveRole({ role: "admin", allowedRoles: [] }, "admin")).toBe("admin");
  });

  test("falls back to the primary role when nothing is requested", () => {
    expect(resolveActiveRole(user)).toBe("customer");
  });
});

describe("order status transitions", () => {
  test("allows only the next step forward", () => {
    expect(canTransition("pending", "confirmed")).toBe(true);
    expect(canTransition("confirmed", "preparing")).toBe(true);
    expect(canTransition("pending", "preparing")).toBe(false);
    expect(canTransition("delivered", "completed")).toBe(true);
  });

  describe("order cancellation reason validation", () => {
    test("accepts each supported reason and optional details", () => {
      for (const reason of CANCELLATION_REASONS.filter((value) => value !== "Other")) {
        expect(cancellationRequestSchema.safeParse({ reason }).success).toBe(true);
      }
      expect(
        cancellationRequestSchema.safeParse({ reason: "Other", details: "Please explain" }).success
      ).toBe(true);
    });

    test("requires an explanation for Other and rejects unknown reasons or oversized details", () => {
      expect(cancellationRequestSchema.safeParse({ reason: "Other" }).success).toBe(false);
      expect(cancellationRequestSchema.safeParse({ reason: "Not a supported reason" }).success).toBe(false);
      expect(
        cancellationRequestSchema.safeParse({ reason: "Ordered by mistake", details: "x".repeat(1001) }).success
      ).toBe(false);
    });

    test("trims and stores cancellation details", () => {
      expect(cancellationRequestSchema.parse({ reason: "Other", details: "  Wrong item  " })).toEqual({
        reason: "Other",
        details: "Wrong item",
      });
    });
  });

  test("cancellation only from early states, and only once", () => {
    expect(canTransition("pending", "cancelled")).toBe(true);
    expect(canTransition("preparing", "cancelled")).toBe(true);
    expect(canTransition("out_for_delivery", "cancelled")).toBe(false);
    expect(canTransition("cancelled", "cancelled")).toBe(false);
    expect(canTransition("cancelled", "confirmed")).toBe(false);
  });

  test("exposes the allowed next statuses for the UI", () => {
    expect(allowedNextStatuses("confirmed")).toEqual(["cancelled", "preparing"]);
    expect(allowedNextStatuses("delivered")).toEqual(["completed"]);
    expect(allowedNextStatuses("completed")).toEqual([]);
  });

  test("allows shopkeepers to mark prepared orders ready for pickup", () => {
    expect(canShopkeeperTransition("pending", "confirmed")).toBe(true);
    expect(canShopkeeperTransition("confirmed", "preparing")).toBe(true);
    expect(canShopkeeperTransition("preparing", "ready_for_pickup")).toBe(true);
    expect(canShopkeeperTransition("ready_for_pickup", "out_for_delivery")).toBe(false);
    expect(canShopkeeperTransition("out_for_delivery", "delivered")).toBe(false);
    expect(canShopkeeperTransition("delivered", "completed")).toBe(true);
    expect(canShopkeeperTransition("preparing", "cancelled")).toBe(true);
  });

  test("allows delivery partners to control pickup readiness and delivery", () => {
    expect(canDeliveryTransition("preparing", "assigned", "ready_for_pickup")).toBe(true);
    expect(canDeliveryTransition("ready_for_pickup", "assigned", "picked_up")).toBe(true);
    expect(canDeliveryTransition("out_for_delivery", "picked_up", "delivered")).toBe(true);
    expect(canDeliveryTransition("preparing", "assigned", "picked_up")).toBe(false);
    expect(canDeliveryTransition("ready_for_pickup", "assigned", "delivered")).toBe(false);
    expect(canDeliveryTransition("delivered", "delivered", "ready_for_pickup")).toBe(false);
  });
});

describe("uuid route params", () => {
  test("recognises uuids", () => {
    expect(isUuid("00000000-0000-0000-0000-000000000000")).toBe(true);
    expect(isUuid("not-a-uuid")).toBe(false);
  });

  test("param callback passes valid uuids through", () => {
    const next = jest.fn();
    uuidParam("id")({}, {}, next, "3f0b2a52-9a24-4f0c-8f0a-4a1f5f7c9d10");
    expect(next).toHaveBeenCalled();
  });

  test("param callback rejects malformed values with 400", () => {
    const json = jest.fn();
    const res = { status: jest.fn(() => ({ json })) };
    const next = jest.fn();
    uuidParam("id")({}, res, next, "not-a-uuid");
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("category route still accepts a slug", () => {
    const next = jest.fn();
    idOrSlugParam("idOrSlug")({}, {}, next, "fresh-basket");
    expect(next).toHaveBeenCalled();
  });

  test("malformed uuid in a real route returns 400, not a driver 500", async () => {
    const res = await request(app).get("/api/products/not-a-uuid");
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.issues[0].path).toBe("params.id");
  });

  test("valid but unknown uuid reaches the handler (no driver error)", async () => {
    const quiet = jest.spyOn(console, "error").mockImplementation(() => {});
    const res = await request(app).get("/api/products/00000000-0000-0000-0000-000000000000");
    // 404 when the database is reachable, 503 when it is not - never a raw 500.
    expect([404, 503]).toContain(res.status);
    expect(JSON.stringify(res.body)).not.toMatch(/invalid input syntax/i);
    quiet.mockRestore();
  });
});

describe("request validation that must not reach the database", () => {
  test("product creation accepts optional category and image values from the shopkeeper form", () => {
    const result = productSchema.safeParse({
      name: "Fresh Tomatoes",
      description: "",
      price: 45,
      mrp: 45,
      discountPct: 0,
      unit: "kg",
      stock: 0,
      categoryId: null,
      imageUrl: null,
      isAvailable: true,
    });
    expect(result.success).toBe(true);
  });

  test("refresh rejects an unknown role value", async () => {
    const res = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken: "whatever", role: "superuser" });
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.issues[0].path).toBe("role");
  });
});