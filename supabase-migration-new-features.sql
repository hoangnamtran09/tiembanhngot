-- Migration: Thêm các tính năng mới
-- Chạy script này trong Supabase SQL Editor

-- 1. Thêm cột image_url cho products
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Bảng Khách hàng (Customers)
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Bảng Lịch sử mua hàng nguyên liệu (Purchase Records)
CREATE TABLE IF NOT EXISTS purchase_records (
  id TEXT PRIMARY KEY,
  ingredient_id TEXT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity DECIMAL(10, 2) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL,
  supplier TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Bảng Chi phí khác (Other Expenses)
CREATE TABLE IF NOT EXISTS other_expenses (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL, -- 'Điện', 'Nước', 'Ship', 'Dụng cụ', 'Khác'
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  expense_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Bảng Xuất/Nhập kho thủ công (Stock Transactions)
CREATE TABLE IF NOT EXISTS stock_transactions (
  id TEXT PRIMARY KEY,
  ingredient_id TEXT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('IN', 'OUT')),
  quantity DECIMAL(10, 2) NOT NULL,
  reason TEXT NOT NULL,
  notes TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_purchase_records_ingredient ON purchase_records(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_purchase_records_date ON purchase_records(purchase_date DESC);
CREATE INDEX IF NOT EXISTS idx_other_expenses_date ON other_expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_ingredient ON stock_transactions(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_date ON stock_transactions(transaction_date DESC);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE other_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on customers" ON customers;
DROP POLICY IF EXISTS "Allow all operations on purchase_records" ON purchase_records;
DROP POLICY IF EXISTS "Allow all operations on other_expenses" ON other_expenses;
DROP POLICY IF EXISTS "Allow all operations on stock_transactions" ON stock_transactions;

-- Create policies
CREATE POLICY "Allow all operations on customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on purchase_records" ON purchase_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on other_expenses" ON other_expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on stock_transactions" ON stock_transactions FOR ALL USING (true) WITH CHECK (true);

-- Trigger for customers updated_at
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

