import {
  OTP_POLICY,
  OTP_PURPOSES,
  RESET_TOKEN_TTL_MINUTES,
  evaluateOtp,
  generateOtp,
  generateResetToken,
  hashOtp,
  hashResetToken,
  isExpired,
  safeEqual,
} from "../src/common/utils/otp.js";
import { OTP_PURPOSES as ENTITY_PURPOSES } from "../src/entities/OtpCode.js";
import { maskEmail } from "../src/common/utils/helpers.js";

const PURPOSE = OTP_PURPOSES.REGISTER;

describe("OTP generation", () => {
  test("codes are six numeric digits, zero-padded", () => {
    for (let i = 0; i < 200; i += 1) {
      expect(generateOtp()).toMatch(/^\d{6}$/);
    }
  });

  test("codes are not constant (CSPRNG, no fixed default)", () => {
    const seen = new Set();
    for (let i = 0; i < 200; i += 1) seen.add(generateOtp());
    expect(seen.size).toBeGreaterThan(1);
  });
});

describe("OTP hashing", () => {
  test("hash is deterministic for the same code + purpose", () => {
    expect(hashOtp("123456", PURPOSE)).toBe(hashOtp("123456", PURPOSE));
  });

  test("the same code hashes differently per purpose", () => {
    expect(hashOtp("123456", OTP_PURPOSES.REGISTER)).not.toBe(
      hashOtp("123456", OTP_PURPOSES.DELIVERY)
    );
  });

  test("different codes hash differently", () => {
    expect(hashOtp("123456", PURPOSE)).not.toBe(hashOtp("654321", PURPOSE));
  });

  test("whitespace is tolerated on input", () => {
    expect(hashOtp(" 123456 ", PURPOSE)).toBe(hashOtp("123456", PURPOSE));
  });

  test("delivery/reset tokens are purpose-scoped and unique", () => {
    const a = generateResetToken();
    const b = generateResetToken();
    expect(a).not.toBe(b);
    expect(hashResetToken(a)).toBe(hashResetToken(a));
    expect(hashResetToken(a)).not.toBe(hashResetToken(b));
    expect(hashResetToken(a)).not.toBe(hashOtp(a, PURPOSE));
  });
});

describe("evaluateOtp", () => {
  const row = (overrides = {}) => ({
    codeHash: hashOtp("123456", PURPOSE),
    attempts: 0,
    maxAttempts: 5,
    consumedAt: null,
    expiresAt: new Date(Date.now() + 60_000),
    ...overrides,
  });

  test("valid code passes", () => {
    expect(evaluateOtp(row(), "123456", PURPOSE).status).toBe("ok");
  });

  test("no matching row is missing", () => {
    expect(evaluateOtp(null, "123456", PURPOSE).status).toBe("missing");
  });

  test("consumed code cannot be replayed", () => {
    expect(evaluateOtp(row({ consumedAt: new Date() }), "123456", PURPOSE).status).toBe("used");
  });

  test("expired code is rejected", () => {
    expect(evaluateOtp(row({ expiresAt: new Date(Date.now() - 1000) }), "123456", PURPOSE).status).toBe("expired");
  });

  test("attempts exhausted locks the code", () => {
    expect(evaluateOtp(row({ attempts: 5 }), "123456", PURPOSE).status).toBe("locked");
  });

  test("wrong code is a mismatch", () => {
    expect(evaluateOtp(row(), "000000", PURPOSE).status).toBe("mismatch");
  });

  test("a code minted for another purpose is a mismatch", () => {
    expect(evaluateOtp(row(), "123456", OTP_PURPOSES.DELIVERY).status).toBe("mismatch");
  });

  test("isExpired treats missing expiry as expired", () => {
    expect(isExpired({ expiresAt: null })).toBe(true);
    expect(isExpired({ expiresAt: new Date(Date.now() + 5000) })).toBe(false);
  });
});

describe("policy + wiring", () => {
  test("every purpose has a policy", () => {
    Object.values(OTP_PURPOSES).forEach((purpose) => {
      expect(OTP_POLICY[purpose]).toBeDefined();
      expect(OTP_POLICY[purpose].ttlMinutes).toBeGreaterThan(0);
      expect(OTP_POLICY[purpose].maxAttempts).toBeGreaterThan(0);
      expect(OTP_POLICY[purpose].cooldownSeconds).toBeGreaterThan(0);
      expect(OTP_POLICY[purpose].hourlyLimit).toBeGreaterThan(0);
    });
    expect(RESET_TOKEN_TTL_MINUTES).toBeGreaterThan(0);
  });

  test("service purposes match the persisted enum", () => {
    expect(Object.values(OTP_PURPOSES).sort()).toEqual([...ENTITY_PURPOSES].sort());
  });

  test("safeEqual is length-safe", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "abcd")).toBe(false);
    expect(safeEqual(undefined, undefined)).toBe(true);
  });
});

describe("maskEmail", () => {
  test("hides everything but the first local character", () => {
    expect(maskEmail("person@example.com")).toBe(`p${"*".repeat(5)}@example.com`);
    expect(maskEmail("ab@x.co")).toBe("a*@x.co");
    expect(maskEmail("priya@shop.com").startsWith("p")).toBe(true);
    expect(maskEmail("priya@shop.com")).not.toContain("priya");
  });

  test("leaves nothing identifiable for missing input", () => {
    expect(maskEmail("")).toBe("");
    expect(maskEmail(undefined)).toBe("");
    expect(maskEmail("no-at-sign")).toBe("");
  });
});
