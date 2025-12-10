-- Bank Settings Table for VietQR Integration
-- Chạy script này để thêm bảng cấu hình ngân hàng

-- Bảng Bank Settings (Cấu hình tài khoản ngân hàng)
CREATE TABLE IF NOT EXISTS bank_settings (
  id SERIAL PRIMARY KEY,
  bank_id TEXT NOT NULL, -- Mã ngân hàng (VD: "970415" cho VietinBank, "970422" cho MB Bank)
  bank_name TEXT NOT NULL, -- Tên ngân hàng
  account_number TEXT NOT NULL, -- Số tài khoản
  account_name TEXT NOT NULL, -- Tên chủ tài khoản
  is_active BOOLEAN DEFAULT true, -- Tài khoản đang sử dụng
  template TEXT DEFAULT 'compact', -- Template QR: 'compact', 'compact2', 'qr_only', 'print'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_bank_settings_active ON bank_settings(is_active);

-- Enable RLS
ALTER TABLE bank_settings ENABLE ROW LEVEL SECURITY;

-- Policy cho phép tất cả operations
CREATE POLICY "Allow all operations on bank_settings" 
  ON bank_settings FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Trigger auto-update updated_at
CREATE TRIGGER update_bank_settings_updated_at 
  BEFORE UPDATE ON bank_settings
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default bank settings (VietinBank example)
INSERT INTO bank_settings (bank_id, bank_name, account_number, account_name, is_active)
VALUES 
  ('970415', 'VietinBank', '1234567890', 'NGUYEN VAN A', true)
ON CONFLICT DO NOTHING;

-- Danh sách mã ngân hàng phổ biến (Reference)
-- '970415' - VietinBank
-- '970422' - MB Bank (Military Bank)
-- '970407' - Techcombank
-- '970416' - ACB (Asia Commercial Bank)
-- '970418' - BIDV
-- '970405' - Agribank
-- '970403' - Sacombank
-- '970436' - Vietcombank
-- '970448' - OCB (Orient Commercial Bank)
-- '970454' - VietCapital Bank
-- '970423' - TPBank
-- '970437' - HDBank
-- '970432' - VPBank
-- '970426' - MSB (Maritime Bank)
-- '546034' - Cake by VPBank
-- '963388' - Timo

COMMIT;

SELECT 'Bank settings table created successfully!' as status;

