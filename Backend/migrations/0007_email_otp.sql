-- Email OTP verification, password reset and delivery confirmation.
-- Idempotent so the migration runner can safely re-run every file.

-- 1. Mark existing accounts verified so the roll-out does not lock anyone out.
--    New rows default to false and must pass email verification.
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN;
UPDATE users SET email_verified = true WHERE email_verified IS NULL;
ALTER TABLE users ALTER COLUMN email_verified SET DEFAULT false;
ALTER TABLE users ALTER COLUMN email_verified SET NOT NULL;

-- 2. Purpose-scoped OTP storage (hashed codes only).
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(150) NOT NULL,
  purpose VARCHAR(30) NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  reset_token_hash VARCHAR(255),
  reset_token_expires_at TIMESTAMPTZ,
  reset_token_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_lookup ON otp_codes (email, purpose, order_id, consumed_at);
CREATE INDEX IF NOT EXISTS idx_otp_reset_token ON otp_codes (reset_token_hash);
