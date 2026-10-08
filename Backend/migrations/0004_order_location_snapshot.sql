-- Location snapshot for each order: the shop and customer coordinates used to
-- price the delivery. Kept on the order so historical orders remain traceable
-- even if the shop or address later moves.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS shop_lat DECIMAL(10,7);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shop_lng DECIMAL(10,7);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_lat DECIMAL(10,7);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_lng DECIMAL(10,7);
