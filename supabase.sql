-- ============================================================
-- IMPORTANT — if you already created this table in Supabase before,
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
  status              TEXT        DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'delivered'))
);
-- Turn on Row Level Security (RLS) for the orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- Rule 1: Anyone (customers) can INSERT (place an order)
CREATE POLICY "Anyone can place an order"
 ON orders
 FOR INSERT
 TO anon
 WITH CHECK (true);
-- Rule 2: Only logged-in admins can SELECT (view) orders
CREATE POLICY "Admin can view orders"
 ON orders
 FOR SELECT
 TO authenticated
 USING (true);
-- Rule 3: Only logged-in admins can UPDATE order status
CREATE POLICY "Admin can update orders"
 ON orders
 FOR UPDATE
 TO authenticated
 USING (true)
 WITH CHECK (true);
-- Rule 4: Only logged-in admins can DELETE orders
CREATE POLICY "Admin can delete orders"
 ON orders
 FOR DELETE
 TO authenticated
 USING (true);
