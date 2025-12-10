-- Migration: Thêm Payment Information vào Orders Table
-- Chạy script này nếu bạn đã có database từ trước và muốn thêm tính năng thanh toán

-- Kiểm tra và thêm các cột payment vào bảng orders
DO $$ 
BEGIN
  -- Thêm payment_method
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'Tiền mặt';
  END IF;

  -- Thêm total_amount
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'total_amount'
  ) THEN
    ALTER TABLE orders ADD COLUMN total_amount DECIMAL(10, 2) DEFAULT 0;
  END IF;

  -- Thêm paid_amount
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'paid_amount'
  ) THEN
    ALTER TABLE orders ADD COLUMN paid_amount DECIMAL(10, 2) DEFAULT 0;
  END IF;

  -- Thêm remaining_amount
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'remaining_amount'
  ) THEN
    ALTER TABLE orders ADD COLUMN remaining_amount DECIMAL(10, 2) DEFAULT 0;
  END IF;
END $$;

-- Cập nhật dữ liệu hiện có (nếu có)
-- Set default values cho các orders cũ
UPDATE orders 
SET 
  payment_method = COALESCE(payment_method, 'Tiền mặt'),
  total_amount = COALESCE(total_amount, 0),
  paid_amount = COALESCE(paid_amount, 0),
  remaining_amount = COALESCE(remaining_amount, 0)
WHERE payment_method IS NULL OR total_amount IS NULL;

-- Commit
COMMIT;

SELECT 'Migration completed successfully!' as status;

