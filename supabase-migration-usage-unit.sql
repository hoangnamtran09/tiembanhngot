-- Migration: Thêm usage_unit vào bảng ingredients
-- Chạy script này để thêm cột đơn vị sử dụng

-- Thêm cột usage_unit
ALTER TABLE ingredients 
ADD COLUMN IF NOT EXISTS usage_unit TEXT DEFAULT 'g';

-- Update existing data: nếu chưa có usage_unit thì set = unit
UPDATE ingredients 
SET usage_unit = unit 
WHERE usage_unit IS NULL OR usage_unit = '';

-- Set default cho các trường hợp phổ biến
UPDATE ingredients 
SET usage_unit = 'g' 
WHERE unit = 'kg' AND (usage_unit IS NULL OR usage_unit = '');

UPDATE ingredients 
SET usage_unit = 'ml' 
WHERE unit = 'l' AND (usage_unit IS NULL OR usage_unit = '');

-- Đảm bảo không null
ALTER TABLE ingredients 
ALTER COLUMN usage_unit SET NOT NULL;

COMMIT;

SELECT 'Migration completed successfully! usage_unit column added.' as status;

