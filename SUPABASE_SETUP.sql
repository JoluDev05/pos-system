-- ============================================
-- POS System - SQL Setup for Supabase
-- ============================================
-- Copy and paste this into Supabase SQL Editor
-- to create required tables for the sales terminal

-- 1. CREATE ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID,
  total NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT now(),
  
  -- Foreign key (optional, only if you have customers table)
  CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- 2. CREATE ORDER_ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- 3. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- 4. ENABLE ROW LEVEL SECURITY
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 5. CREATE ROW LEVEL SECURITY POLICIES
-- (These allow anyone to create/read orders for now - adjust as needed for production)

-- Orders: Allow anyone to insert
CREATE POLICY IF NOT EXISTS "Anyone can create orders" ON orders
  FOR INSERT
  WITH CHECK (true);

-- Orders: Allow anyone to read
CREATE POLICY IF NOT EXISTS "Anyone can read orders" ON orders
  FOR SELECT
  USING (true);

-- Order Items: Allow anyone to insert
CREATE POLICY IF NOT EXISTS "Anyone can create order items" ON order_items
  FOR INSERT
  WITH CHECK (true);

-- Order Items: Allow anyone to read
CREATE POLICY IF NOT EXISTS "Anyone can read order items" ON order_items
  FOR SELECT
  USING (true);

-- Orders: Allow anyone to update
CREATE POLICY IF NOT EXISTS "Anyone can update orders" ON orders
  FOR UPDATE
  USING (true);
  
-- Orders: Allow anyone to delete
CREATE POLICY IF NOT EXISTS "Anyone can delete orders" ON orders
  FOR DELETE
  USING (true);

-- Order Items: Allow anyone to update
CREATE POLICY IF NOT EXISTS "Anyone can update order items" ON order_items
  FOR UPDATE
  USING (true);

-- Order Items: Allow anyone to delete
CREATE POLICY IF NOT EXISTS "Anyone can delete order items" ON order_items
  FOR DELETE
  USING (true);

-- ============================================
-- DONE! ✅
-- ============================================
-- The sales terminal should now work.
-- You can verify by:
-- 1. Going to /sales in your app
-- 2. Adding products to cart
-- 3. Clicking "Complete Sale"
-- 4. Checking that orders appear in the orders table

-- OPTIONAL: View your data
-- SELECT * FROM orders;
-- SELECT * FROM order_items;
