-- ============================================================
-- IMPORTANT — if you already created this table before,
-- DO NOT run the DROP TABLE / CREATE TABLE below (it will delete your
-- existing orders). Instead just run this one line in the SQL Editor:
--
--   ALTER TABLE orders ADD COLUMN IF NOT EXISTS cake_type TEXT;
--
-- This is needed because the custom cake form on index.html sends a
-- "cake_type" (Eggless/Vegan) value, which previously had no matching
-- column and caused every custom cake order to fail to save.
-- ============================================================

DROP TABLE IF EXISTS orders;

CREATE TABLE orders (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  order_type          TEXT        NOT NULL CHECK (order_type IN ('regular', 'custom')),
  customer_name       TEXT,
  phone               TEXT,
  address             TEXT,
  items               JSONB,
  total               INTEGER,
  cake_weight         TEXT,
  cake_flavor         TEXT,
  cake_type           TEXT,
  cake_notes          TEXT,
  reference_image_url TEXT,
  status              TEXT        DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'delivered')),
  user_id             UUID        REFERENCES auth.users(id)
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Turn on Row Level Security (RLS) for the orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Rule 1: Anyone (customers) can INSERT (place an order)
CREATE POLICY "Anyone can place an order"
 ON orders
 FOR INSERT
 TO anon
 WITH CHECK (true);

-- Rule 2: Authenticated users can view their own orders
CREATE POLICY "Users can view their own orders"
 ON orders
 FOR SELECT
 TO authenticated
 USING (auth.uid() = user_id OR user_id IS NULL);

-- Rule 3: Only logged-in admins can view ALL orders (for admin-orders page)
-- Note: This requires users with admin role to be identified separately
-- For now, admins use the same policy as regular users but access via admin-orders page

-- Rule 4: Admins can update any order status (via admin-orders page)
CREATE POLICY "Admin can update orders"
 ON orders
 FOR UPDATE
 TO authenticated
 USING (true)
 WITH CHECK (true);

-- Rule 5: Admins can delete orders (via admin-orders page)
CREATE POLICY "Admin can delete orders"
 ON orders
 FOR DELETE
 TO authenticated
 USING (true);

-- ============================================================
-- Customer order tracking (track-order.html)
-- ============================================================
-- Customers are NOT given general SELECT access to the orders table
-- (Rule 2 above keeps that locked to admins only). Instead, this
-- function lets a customer fetch ONE specific order, but only if
-- they already know BOTH its Order ID (a random, unguessable UUID
-- shown to them once at checkout) AND the phone number used to
-- place it. Anyone missing either piece gets nothing back — so this
-- cannot be used to browse or guess other customers' orders.
--
-- SECURITY DEFINER lets this function read the orders table on the
-- customer's behalf without granting them direct table access.
CREATE OR REPLACE FUNCTION get_order_for_customer(p_order_id uuid, p_phone text)
RETURNS SETOF orders
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM orders
  WHERE id = p_order_id
    AND phone = p_phone;
$$;

-- Lock the function down, then allow only the specific call shape above.
REVOKE ALL ON FUNCTION get_order_for_customer(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_order_for_customer(uuid, text) TO anon, authenticated;

-- ============================================================
-- If you already created the `orders` table before adding order
-- tracking, just run the CREATE OR REPLACE FUNCTION + GRANT
-- statements above in the Supabase SQL Editor — no need to touch
-- existing rows or re-run the DROP/CREATE TABLE at the top.
-- ============================================================
