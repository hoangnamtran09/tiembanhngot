# 💰 Tính Năng Quản Lý Thanh Toán

## 📋 Tổng Quan

Hệ thống quản lý thanh toán giúp theo dõi:
- ✅ Phương thức thanh toán (Tiền mặt / Chuyển khoản)
- ✅ Số tiền đã thanh toán
- ✅ Số tiền còn lại (công nợ)
- ✅ Trạng thái thanh toán từng đơn hàng

---

## 🎯 Use Cases

### 1. Khách hàng thanh toán đủ ngay
```
Tạo đơn hàng → Chọn "Tiền mặt" → Nhập số tiền đã trả = Tổng đơn
→ Còn lại: 0đ ✓ Đã thanh toán đủ
```

### 2. Khách hàng cọc trước, trả sau
```
Tạo đơn hàng → Chọn "Chuyển khoản" → Nhập số tiền đã chuyển (ví dụ: 50%)
→ Còn lại: 50% ⚠️ Hiển thị số tiền còn nợ
→ Khi khách chuyển thêm → Nhấn "Sửa" → Cập nhật số tiền đã trả
```

### 3. Khách hàng chưa thanh toán
```
Tạo đơn hàng → Số tiền đã trả: 0đ
→ Còn lại: 100% (toàn bộ đơn hàng)
```

---

## 🖥️ Giao Diện

### 1. Form Tạo Đơn Hàng Mới

#### Phương Thức Thanh Toán
- 2 nút lựa chọn:
  - 💵 **Tiền mặt**: Thanh toán trực tiếp
  - 💳 **Chuyển khoản**: Thanh toán qua ngân hàng

#### Nhập Số Tiền Đã Thanh Toán
- Input field với đơn vị đ (VND)
- Real-time tính toán số tiền còn lại
- Hiển thị tổng quan:
  ```
  Tổng đơn hàng: 170,000đ
  Đã thanh toán: 100,000đ
  Còn lại:      70,000đ
  ```

### 2. Order Card (Hiển thị đơn hàng)

#### Thông tin thanh toán hiển thị:
- Icon phương thức (💵/💳)
- Số tiền đã trả (màu xanh)
- Số tiền còn lại (màu cam) - nếu có
- Badge "✓ Đã thanh toán đủ" - nếu thanh toán hết

#### Nút "Sửa" (Edit2 icon)
- Click để mở modal chỉnh sửa thanh toán
- Có thể thay đổi phương thức
- Có thể cập nhật số tiền đã trả

### 3. Modal Chỉnh Sửa Thanh Toán

#### Hiển thị:
- Tên khách hàng
- Tổng đơn hàng
- Form chọn phương thức
- Input số tiền đã trả
- Tổng kết real-time

---

## 💾 Database Schema

```sql
-- Bảng orders được thêm 4 cột mới:
ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'Tiền mặt';
ALTER TABLE orders ADD COLUMN total_amount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN paid_amount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN remaining_amount DECIMAL(10, 2) DEFAULT 0;
```

### Ý nghĩa các cột:

| Cột | Kiểu | Mô tả | Ví dụ |
|-----|------|-------|-------|
| `payment_method` | TEXT | Phương thức thanh toán | 'Tiền mặt' hoặc 'Chuyển khoản' |
| `total_amount` | DECIMAL | Tổng tiền đơn hàng | 170000.00 |
| `paid_amount` | DECIMAL | Số tiền đã thanh toán | 100000.00 |
| `remaining_amount` | DECIMAL | Số tiền còn lại | 70000.00 |

---

## 🔄 Data Flow

### Tạo đơn mới:
```
1. User chọn sản phẩm → Tính tổng tiền
2. User chọn phương thức thanh toán
3. User nhập số tiền đã trả
4. System tự động tính: remaining = total - paid
5. Lưu vào database
```

### Cập nhật thanh toán:
```
1. Click "Sửa" trên order card
2. Modal hiển thị thông tin hiện tại
3. User chỉnh sửa phương thức/số tiền
4. System tự động tính lại remaining
5. Save → Cập nhật database
```

---

## 🚀 Setup & Migration

### Setup mới (Database trống):
```bash
# Chạy supabase-schema.sql (đã bao gồm payment columns)
```

### Migration (Database có sẵn):
```bash
# Chạy supabase-migration-payment.sql
# Script sẽ:
# 1. Kiểm tra xem cột đã tồn tại chưa
# 2. Thêm cột nếu chưa có
# 3. Set giá trị mặc định cho data cũ
```

---

## 💡 Best Practices

### 1. Khi Tạo Đơn Mới
- ✅ Luôn hỏi khách về phương thức thanh toán
- ✅ Xác nhận số tiền đã nhận/chuyển
- ✅ Ghi chú nếu có thỏa thuận đặc biệt

### 2. Theo Dõi Công Nợ
- ⚠️ Đơn có màu cam = Còn nợ
- ✓ Đơn có check xanh = Đã thanh toán đủ
- 📊 Dashboard có thể mở rộng để hiển thị tổng công nợ

### 3. Nhắc Khách Thanh Toán
- Dùng filter để xem đơn còn nợ
- Gọi điện nhắc trước khi giao hàng
- Cập nhật ngay khi khách chuyển thêm

---

## 🎨 UI/UX Highlights

### Colors:
- 🟢 Xanh lá: Đã thanh toán
- 🟠 Cam: Còn nợ
- 🔴 Đỏ: Nút hủy
- 🟣 Hồng/Rose: Theme chính

### Icons:
- 💵 `Banknote`: Tiền mặt
- 💳 `CreditCard`: Chuyển khoản
- ✏️ `Edit2`: Sửa thanh toán
- 💰 `DollarSign`: Header modal

### Animations:
- Transition khi chọn phương thức
- Hover effects trên buttons
- Modal fade in/out với backdrop blur

---

## 📱 Responsive Design

- ✅ Form thanh toán responsive (grid 2 columns → 1 column mobile)
- ✅ Modal fit màn hình nhỏ
- ✅ Touch-friendly buttons (min 44px height)

---

## 🧪 Testing Checklist

- [ ] Tạo đơn mới với tiền mặt, thanh toán đủ
- [ ] Tạo đơn mới với chuyển khoản, thanh toán một phần
- [ ] Tạo đơn mới, chưa thanh toán (0đ)
- [ ] Chỉnh sửa thanh toán từ 0đ → một phần
- [ ] Chỉnh sửa thanh toán từ một phần → đủ
- [ ] Đổi phương thức thanh toán
- [ ] Kiểm tra hiển thị trên mobile
- [ ] Kiểm tra sync với Supabase

---

## 🐛 Known Issues

Không có issue nào được report hiện tại.

---

## 🔮 Future Enhancements

- [ ] Lịch sử các lần thanh toán (transaction history)
- [ ] Thông báo khi khách nợ quá lâu
- [ ] Export báo cáo công nợ
- [ ] Gửi SMS/Email nhắc thanh toán
- [ ] QR code thanh toán tự động
- [ ] Tích hợp payment gateway (Momo, VNPay)

---

**Version:** 1.1.0  
**Last Updated:** December 10, 2024  
**Author:** AI Assistant & User

