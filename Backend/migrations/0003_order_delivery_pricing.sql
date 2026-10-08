-- Road/driving distance based delivery pricing snapshot (see
-- src/common/utils/deliveryPricing.js). Stored per order so historical orders
-- keep the fee/share they were charged even if pricing later changes.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_distance DECIMAL(8,3);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS nearmart_share DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_partner_share DECIMAL(10,2) DEFAULT 0;
