import { jest } from "@jest/globals";
import {
  calculateDeliveryDetails,
  calculateDeliveryFee,
  MAX_DELIVERY_DISTANCE_KM,
  NEARMART_SHARE_PERCENT,
  DELIVERY_PARTNER_SHARE_PERCENT,
} from "../src/common/utils/deliveryPricing.js";
import {
  DELIVERY_MESSAGES,
  RoadDistanceError,
  getRoadDistanceKm,
} from "../src/common/utils/roadDistance.js";

describe("calculateDeliveryFee distance slabs", () => {
  const cases = [
    [0.5, 15],
    [1, 15],
    [1.0001, 20],
    [1.01, 20],
    [2, 20],
    [2.5, 25],
    [3, 25],
    [4.7, 35],
    [5, 35],
    [5.1, 50],
    [7, 50],
    [8, 50],
    [8.1, 60],
    [9, 60],
    [10, 60],
    [10.1, 85],
    [12, 85],
    [15, 85],
    [15.1, 110],
    [18, 110],
    [20, 110],
    [20.1, 150],
    [25, 150],
    [30, 150],
    [30.1, 200],
    [35, 200],
    [40, 200],
    [40.1, 250],
    [45, 250],
    [50, 250],
    [50.1, 300],
    [55, 300],
    [60, 300],
    [60.1, 350],
    [66, 350],
    [69.9, 350],
    [70, 350],
    [70.0001, 400],
    [70.01, 400],
    [70.1, 400],
    [75, 400],
    [80, 400],
    [80.1, 450],
    [85, 450],
    [90, 450],
    [90.1, 500],
    [95, 500],
    [100, 500],
  ];

  test.each(cases)("%s km → ₹%i", (km, fee) => {
    const result = calculateDeliveryFee(km);
    expect(result).toMatchObject({ distanceKm: km, deliveryFee: fee, deliveryAvailable: true });
    expect(result.nearMartShare).toBe(Math.round((fee * NEARMART_SHARE_PERCENT) / 100));
    expect(result.deliveryPartnerShare).toBe(Math.round((fee * DELIVERY_PARTNER_SHARE_PERCENT) / 100));
    expect(result.nearMartShare + result.deliveryPartnerShare).toBe(fee);
  });

  test("example: 4.7 km → ₹35 → ₹7 / ₹28", () => {
    expect(calculateDeliveryFee(4.7)).toEqual({
      distanceKm: 4.7,
      deliveryFee: 35,
      nearMartShare: 7,
      deliveryPartnerShare: 28,
      deliveryAvailable: true,
    });
  });

  test("101 km is blocked beyond the 100 km maximum", () => {
    expect(calculateDeliveryFee(101)).toMatchObject({
      distanceKm: 101,
      deliveryFee: 0,
      nearMartShare: 0,
      deliveryPartnerShare: 0,
      deliveryAvailable: false,
      message: "Delivery not available in this area.",
    });
    expect(MAX_DELIVERY_DISTANCE_KM).toBe(100);
  });

  test("fractional distance is not rounded before slab selection or max-distance validation", () => {
    expect(calculateDeliveryFee(70.001)).toMatchObject({
      distanceKm: 70.001,
      deliveryFee: 400,
      deliveryAvailable: true,
    });
    expect(calculateDeliveryFee(100.0001)).toMatchObject({
      distanceKm: 100.0001,
      deliveryFee: 0,
      nearMartShare: 0,
      deliveryPartnerShare: 0,
      deliveryAvailable: false,
      message: "Delivery not available in this area.",
    });
  });

  test("exactly 100 km is still deliverable", () => {
    expect(calculateDeliveryFee(100)).toMatchObject({ deliveryFee: 500, deliveryAvailable: true });
  });

  test("invalid distance throws", () => {
    expect(() => calculateDeliveryFee("abc")).toThrow(TypeError);
    expect(() => calculateDeliveryFee(-1)).toThrow(TypeError);
  });
});

describe("road distance via routing service", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const osrmOk = (meters) => ({
    ok: true,
    json: async () => ({ code: "Ok", routes: [{ distance: meters, duration: 600 }] }),
  });

  const coords = {
    originLat: 34.198,
    originLng: 74.363,
    destLat: 34.209,
    destLng: 74.351,
  };

  test("meters are converted to kilometers (4700 m → 4.7 km)", async () => {
    global.fetch = jest.fn().mockResolvedValue(osrmOk(4700));
    await expect(getRoadDistanceKm(coords)).resolves.toBe(4.7);
    const requestedUrl = global.fetch.mock.calls[0][0];
    expect(requestedUrl).toContain("/route/v1/driving/74.363,34.198;74.351,34.209");
    expect(requestedUrl).toContain("driving");
  });

  test("fractional meters keep full routing precision when converted to kilometers", async () => {
    global.fetch = jest.fn().mockResolvedValue(osrmOk(100000.1));
    await expect(getRoadDistanceKm(coords)).resolves.toBe(100.0001);
  });

  test("missing shop coordinates", async () => {
    await expect(getRoadDistanceKm({ ...coords, originLat: null })).rejects.toMatchObject({
      message: DELIVERY_MESSAGES.SHOP_LOCATION,
      status: 400,
    });
  });

  test("missing customer coordinates", async () => {
    await expect(getRoadDistanceKm({ ...coords, destLng: "" })).rejects.toMatchObject({
      message: DELIVERY_MESSAGES.CUSTOMER_LOCATION,
      status: 400,
    });
  });

  test("routing service failure", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("network down"));
    await expect(getRoadDistanceKm(coords)).rejects.toMatchObject({
      message: DELIVERY_MESSAGES.ROUTING_FAILED,
      status: 502,
    });
  });

  test("routing service non-200 response", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) });
    await expect(getRoadDistanceKm(coords)).rejects.toMatchObject({
      message: DELIVERY_MESSAGES.ROUTING_FAILED,
      status: 502,
    });
  });

  test("no drivable route between the points", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ code: "NoRoute", routes: [] }),
    });
    await expect(getRoadDistanceKm(coords)).rejects.toMatchObject({
      message: DELIVERY_MESSAGES.NO_ROUTE,
      status: 400,
    });
  });

  test("errors are typed RoadDistanceError instances", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("boom"));
    await expect(getRoadDistanceKm(coords)).rejects.toBeInstanceOf(RoadDistanceError);
  });
});

describe("delivery error messages match product spec", () => {
  test("exact user-facing strings", () => {
    expect(DELIVERY_MESSAGES.SHOP_LOCATION).toBe(
      "Shop location is not available. Please ask the shopkeeper to set the shop location."
    );
    expect(DELIVERY_MESSAGES.CUSTOMER_LOCATION).toBe("Please select your delivery location on the map.");
    expect(DELIVERY_MESSAGES.ROUTING_FAILED).toBe("Unable to calculate delivery distance. Please try again.");
    expect(DELIVERY_MESSAGES.NO_ROUTE).toBe("Delivery is not available for this location.");
  });
});

describe("calculateDeliveryDetails (single delivery pricing entry point)", () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  const osrmMeters = (meters) => ({
    ok: true,
    json: async () => ({ code: "Ok", routes: [{ distance: meters, duration: 600 }] }),
  });

  const shop = { lat: 34.0837, lng: 74.7973 };
  const customer = { lat: 34.1011, lng: 74.8562 };

  test("returns distance, fee and the 80/20 split from real road distance", async () => {
    global.fetch = jest.fn().mockResolvedValue(osrmMeters(5669));
    const details = await calculateDeliveryDetails(shop, customer);

    expect(details).toEqual({
      distanceKm: 5.669,
      deliveryFee: 50,
      nearMartShare: 10,
      deliveryPartnerShare: 40,
      deliveryAvailable: true,
    });
    expect(details.nearMartShare + details.deliveryPartnerShare).toBe(details.deliveryFee);
  });

  test("beyond 100 km returns deliveryAvailable false with the spec message", async () => {
    global.fetch = jest.fn().mockResolvedValue(osrmMeters(150000));
    const details = await calculateDeliveryDetails(shop, customer);

    expect(details).toMatchObject({
      distanceKm: 150,
      deliveryFee: 0,
      deliveryAvailable: false,
      message: "Delivery not available in this area.",
    });
  });

  test("routing result just over 100 km is rejected without rounding", async () => {
    global.fetch = jest.fn().mockResolvedValue(osrmMeters(100000.1));
    const details = await calculateDeliveryDetails(shop, customer);

    expect(details).toEqual({
      distanceKm: 100.0001,
      deliveryFee: 0,
      nearMartShare: 0,
      deliveryPartnerShare: 0,
      deliveryAvailable: false,
      message: "Delivery not available in this area.",
    });
  });

  test("accepts coordinate objects shaped like Shop/Address entities (string decimals)", async () => {
    global.fetch = jest.fn().mockResolvedValue(osrmMeters(1000));
    const details = await calculateDeliveryDetails(
      { lat: "34.0837", lng: "74.7973" },
      { lat: "34.0840", lng: "74.7980" }
    );
    expect(details).toMatchObject({ distanceKm: 1, deliveryFee: 15, deliveryAvailable: true });
    const requestedUrl = global.fetch.mock.calls[0][0];
    expect(requestedUrl).toContain("74.7973,34.0837;74.798,34.084");
  });

  test("shop without a set location rejects with the shopkeeper message", async () => {
    await expect(calculateDeliveryDetails({ lat: null, lng: null }, customer)).rejects.toMatchObject({
      message: "Shop location is not available. Please ask the shopkeeper to set the shop location.",
      status: 400,
      code: "SHOP_LOCATION_MISSING",
    });
  });

  test("customer address without coordinates rejects with the map prompt", async () => {
    await expect(calculateDeliveryDetails(shop, { lat: null, lng: null })).rejects.toMatchObject({
      message: "Please select your delivery location on the map.",
      status: 400,
      code: "CUSTOMER_LOCATION_MISSING",
    });
  });

  test("routing outage rejects with the retry message and 502", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("down"));
    await expect(calculateDeliveryDetails(shop, customer)).rejects.toMatchObject({
      message: "Unable to calculate delivery distance. Please try again.",
      status: 502,
      code: "ROUTING_SERVICE_FAILED",
    });
  });
});
