-- Supabase Schema cho Tiệm Bánh Ngọt
-- Chạy script này trong Supabase SQL Editor để tạo các bảng

-- Bảng Nguyên Liệu (Ingredients)
CREATE TABLE IF NOT EXISTS ingredients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  unit TEXT NOT NULL, -- Đơn vị mua (buying unit)
  usage_unit TEXT NOT NULL DEFAULT 'g', -- Đơn vị sử dụng (usage unit)
  price DECIMAL(10, 2) NOT NULL,
  buying_quantity DECIMAL(10, 2) NOT NULL,
  current_stock DECIMAL(10, 2) NOT NULL DEFAULT 0, -- Tồn kho theo usage_unit
  min_threshold DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng Sản Phẩm (Products)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  selling_price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng Công Thức (Recipe Items) - Liên kết giữa Product và Ingredient
CREATE TABLE IF NOT EXISTS recipe_items (
  id SERIAL PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  ingredient_id TEXT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, ingredient_id)
);

-- Bảng Đơn Hàng (Orders)
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  deadline TEXT NOT NULL,
  status TEXT NOT NULL,
  notes TEXT,
  -- Payment Information
  payment_method TEXT DEFAULT 'Tiền mặt', -- 'Tiền mặt' hoặc 'Chuyển khoản'
  total_amount DECIMAL(10, 2) DEFAULT 0,
  paid_amount DECIMAL(10, 2) DEFAULT 0,
  remaining_amount DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng Chi Tiết Đơn Hàng (Order Items)
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes để tối ưu hóa truy vấn
CREATE INDEX IF NOT EXISTS idx_recipe_items_product ON recipe_items(product_id);
CREATE INDEX IF NOT EXISTS idx_recipe_items_ingredient ON recipe_items(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Tạo policies cho phép tất cả các thao tác (cho ứng dụng đơn giản)
-- Bạn có thể tùy chỉnh policies này để bảo mật hơn

-- Drop existing policies if they exist (to allow re-running this script)
DROP POLICY IF EXISTS "Allow all operations on ingredients" ON ingredients;
DROP POLICY IF EXISTS "Allow all operations on products" ON products;
DROP POLICY IF EXISTS "Allow all operations on recipe_items" ON recipe_items;
DROP POLICY IF EXISTS "Allow all operations on orders" ON orders;
DROP POLICY IF EXISTS "Allow all operations on order_items" ON order_items;

-- Ingredients policies
CREATE POLICY "Allow all operations on ingredients" ON ingredients FOR ALL USING (true) WITH CHECK (true);

-- Products policies
CREATE POLICY "Allow all operations on products" ON products FOR ALL USING (true) WITH CHECK (true);

-- Recipe Items policies
CREATE POLICY "Allow all operations on recipe_items" ON recipe_items FOR ALL USING (true) WITH CHECK (true);

-- Orders policies
CREATE POLICY "Allow all operations on orders" ON orders FOR ALL USING (true) WITH CHECK (true);

-- Order Items policies
CREATE POLICY "Allow all operations on order_items" ON order_items FOR ALL USING (true) WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist (to allow re-running this script)
DROP TRIGGER IF EXISTS update_ingredients_updated_at ON ingredients;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS update_bank_settings_updated_at ON bank_settings;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_ingredients_updated_at BEFORE UPDATE ON ingredients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

