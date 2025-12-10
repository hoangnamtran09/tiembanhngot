# ⚡ Quick Start Guide

## 🚀 Setup trong 5 phút

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Tạo Supabase Project
- Vào [supabase.com](https://supabase.com)
- Tạo New Project
- Đợi 2 phút khởi tạo

### 3️⃣ Setup Database
1. Mở **SQL Editor** trong Supabase
2. Copy nội dung `supabase-schema.sql`
3. Paste và nhấn **Run**

### 4️⃣ Cấu hình .env.local
```bash
# Tạo file .env.local
cat > .env.local << EOF
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_GEMINI_API_KEY=your-gemini-key (optional)
EOF
```

**Lấy keys từ:** Supabase Dashboard > Settings > API

### 5️⃣ Run!
```bash
npm run dev
```

Mở `http://localhost:3000` 🎉

---

## ✅ Checklist

- [ ] `npm install` thành công
- [ ] Supabase project đã tạo
- [ ] SQL schema đã chạy (5 tables: ingredients, products, recipe_items, orders, order_items)
- [ ] `.env.local` có đầy đủ SUPABASE_URL và ANON_KEY
- [ ] App chạy không lỗi và hiển thị dữ liệu mẫu

## 🐛 Troubleshooting

### "Failed to fetch" / Connection error
```bash
# Kiểm tra .env.local
cat .env.local

# Đảm bảo có VITE_ prefix
# ĐÚNG: VITE_SUPABASE_URL
# SAI:  SUPABASE_URL
```

### Database tables không tồn tại
- Chạy lại `supabase-schema.sql` trong SQL Editor
- Kiểm tra trong Table Editor xem có 5 tables không

### Port 3000 đã được sử dụng
```bash
# Edit vite.config.ts, đổi port sang 3001 hoặc khác
```

---

## 📚 Đọc Thêm

- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Hướng dẫn chi tiết
- [README.md](./README.md) - Tổng quan project

