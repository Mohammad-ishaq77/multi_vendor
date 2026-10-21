-- Link shop-specific orders created under one multi-shop checkout and to their
-- combined Razorpay payment.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS checkout_id UUID;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS checkout_id UUID;

CREATE INDEX IF NOT EXISTS idx_orders_checkout_id ON orders (checkout_id);
CREATE INDEX IF NOT EXISTS idx_payments_checkout_id ON payments (checkout_id);