import request from "supertest";
import { buildApp } from "../src/index.js";

const app = buildApp();

describe("api bootstrap", () => {
  test("GET /health", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test("GET /api/payments/config (legacy contract preserved)", async () => {
    const res = await request(app).get("/api/payments/config");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, currency: "INR" });
    expect(Array.isArray(res.body.methods)).toBe(true);
  });

  test("unknown route 404s with ok:false", async () => {
    const res = await request(app).get("/api/nope");
    expect(res.status).toBe(404);
    expect(res.body.ok).toBe(false);
  });

  test("protected route without token is 401", async () => {
    const res = await request(app).get("/api/cart");
    expect(res.status).toBe(401);
  });

  test("register validation rejects bad body", async () => {
    const res = await request(app).post("/api/auth/register").send({ email: "x" });
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
  });
});
