# 🚀 Hướng Dẫn Cài Đặt Supabase

## Bước 1: Tạo Tài Khoản Supabase

1. Truy cập [https://supabase.com](https://supabase.com)
2. Đăng ký tài khoản miễn phí (hoặc đăng nhập nếu đã có)
3. Tạo một **New Project**:
   - Chọn Organization của bạn
   - Đặt tên project (ví dụ: `tiembanhngot`)
   - Tạo mật khẩu Database (lưu lại mật khẩu này)
   - Chọn region gần nhất (ví dụ: Singapore)
   - Nhấn **Create new project**

## Bước 2: Chạy SQL Schema

1. Sau khi project được tạo, vào **SQL Editor** (menu bên trái)
2. Mở file `supabase-schema.sql` trong dự án này
3. Copy toàn bộ nội dung file
4. Paste vào SQL Editor trong Supabase
5. Nhấn **Run** để tạo các bảng

**Các bảng sẽ được tạo:**
- `ingredients` - Nguyên liệu
- `products` - Sản phẩm
- `recipe_items` - Công thức (liên kết product và ingredient)
- `orders` - Đơn hàng
- `order_items` - Chi tiết đơn hàng

## Bước 3: Lấy API Keys

1. Vào **Settings** > **API** (menu bên trái)
2. Trong phần **Project API keys**, bạn sẽ thấy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (key rất dài)

## Bước 4: Cấu Hình Project

1. Mở file `.env.local` trong dự án
2. Thay thế các giá trị với thông tin từ Supabase:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

**⚠️ Lưu ý:** 
- Không commit file `.env.local` lên Git (đã được thêm vào `.gitignore`)
- Giữ API keys bí mật

## Bước 5: Chạy Ứng Dụng

```bash
npm run dev
```

Ứng dụng sẽ tự động:
- Kết nối với Supabase
- Tải dữ liệu từ database
- Seed dữ liệu mẫu nếu database trống
- Tự động lưu thay đổi (với debounce 500ms)

## Kiểm Tra Kết Nối

Mở DevTools Console khi chạy app. Nếu có lỗi kết nối, bạn sẽ thấy thông báo:
```
⚠️ Supabase URL hoặc Anon Key chưa được cấu hình trong .env.local
```

Nếu thành công, app sẽ hiển thị "Đang tải dữ liệu từ Supabase..." rồi load data.

## Tính Năng Mới

✅ **Auto-sync**: Dữ liệu tự động lưu lên Supabase sau 500ms khi có thay đổi  
✅ **Loading state**: Hiển thị spinner khi đang tải dữ liệu  
✅ **Sync indicator**: Icon quay khi đang đồng bộ (mobile header)  
✅ **Error handling**: Tự động fallback về dữ liệu mẫu nếu có lỗi  

## Quản Lý Database

Bạn có thể xem và chỉnh sửa dữ liệu trực tiếp trong Supabase:

1. Vào **Table Editor** trong Supabase Dashboard
2. Chọn bảng muốn xem (ingredients, products, orders, etc.)
3. Có thể thêm/sửa/xóa dữ liệu trực tiếp

## Cấu Trúc Database

```
ingredients (nguyên liệu)
├── id (TEXT, PRIMARY KEY)
├── name (TEXT)
├── unit (TEXT)
├── price (DECIMAL)
├── buying_quantity (DECIMAL)
├── current_stock (DECIMAL)
└── min_threshold (DECIMAL)

products (sản phẩm)
├── id (TEXT, PRIMARY KEY)
├── name (TEXT)
├── description (TEXT)
├── selling_price (DECIMAL)
└── category (TEXT)

recipe_items (công thức)
├── id (SERIAL, PRIMARY KEY)
├── product_id (TEXT, FK -> products)
├── ingredient_id (TEXT, FK -> ingredients)
└── quantity (DECIMAL)

orders (đơn hàng)
├── id (TEXT, PRIMARY KEY)
├── customer_name (TEXT)
├── customer_phone (TEXT)
├── deadline (TEXT)
├── status (TEXT)
├── notes (TEXT)
└── created_at (TIMESTAMP)

order_items (chi tiết đơn hàng)
├── id (SERIAL, PRIMARY KEY)
├── order_id (TEXT, FK -> orders)
├── product_id (TEXT, FK -> products)
└── quantity (INTEGER)
```

## Troubleshooting

### Lỗi "Failed to fetch"
- Kiểm tra VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY
- Đảm bảo đã chạy schema SQL

### Lỗi "row-level security policy"
- Schema đã bao gồm policies cho phép all operations
- Nếu vẫn lỗi, vào Table Editor > chọn bảng > RLS > tắt tạm

### Data không sync
- Mở DevTools Console để xem logs
- Kiểm tra Network tab xem có request đến Supabase không

## Migration từ LocalStorage

Nếu bạn đã có dữ liệu trong localStorage cũ:

1. Mở DevTools Console
2. Copy dữ liệu:
```javascript
console.log(localStorage.getItem('bakery_ingredients'))
console.log(localStorage.getItem('bakery_products'))
console.log(localStorage.getItem('bakery_orders'))
```
3. Thêm thủ công vào Supabase qua Table Editor nếu cần

---

**✨ Hoàn tất!** Ứng dụng của bạn giờ đã sử dụng Supabase làm backend!

