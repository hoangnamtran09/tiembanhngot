# 💳 Hướng Dẫn Tính Năng QR Code Thanh Toán

## 📋 Tổng Quan

Tính năng QR Code thanh toán tự động tạo mã QR chuyển khoản ngân hàng khi khách hàng cần thanh toán. QR code được generate động dựa trên:
- Thông tin tài khoản ngân hàng (lưu trong database)
- Số tiền cần thanh toán
- Nội dung chuyển khoản (tên khách hàng, mã đơn)

## 🚀 Setup

### Bước 1: Chạy Database Migration

```sql
-- Chạy file supabase-bank-settings.sql trong Supabase SQL Editor
-- File này sẽ tạo bảng bank_settings
```

**Hoặc chạy lệnh:**
```bash
# Copy nội dung supabase-bank-settings.sql và paste vào Supabase SQL Editor
# Nhấn Run
```

### Bước 2: Cấu Hình Tài Khoản Ngân Hàng

1. Vào app → Click menu **"Cài Đặt Ngân Hàng"**
2. Điền thông tin:
   - **Ngân hàng**: Chọn từ danh sách 16+ ngân hàng
   - **Số tài khoản**: Nhập số TK của bạn
   - **Tên chủ TK**: Nhập CHÍNH XÁC như trên tài khoản (in hoa, không dấu)
   - **Kiểu QR**: Chọn template hiển thị
3. Click **"Lưu Cài Đặt"**
4. Kiểm tra QR preview bên phải

---

## 🎯 Cách Sử Dụng

### 1. Tạo Đơn Hàng Mới

```
1. Click "Tạo Đơn Mới"
2. Nhập thông tin khách hàng và chọn sản phẩm
3. Phần Thanh toán:
   - Chọn "💳 Chuyển khoản"
   - Nhập số tiền đã chuyển (hoặc để 0 nếu chưa chuyển)
4. → Mã QR tự động hiển thị với số tiền còn lại
5. Khách quét QR để chuyển khoản
```

### 2. Cập Nhật Thanh Toán Cho Đơn Có Sẵn

```
1. Tìm đơn hàng trong danh sách
2. Click nút "Sửa" (✏️) trong phần thanh toán
3. Modal hiển thị với:
   - Form cập nhật số tiền đã trả
   - Mã QR với số tiền còn lại
4. Khách quét QR để chuyển phần còn thiếu
5. Sau khi nhận tiền → Cập nhật lại số tiền đã trả
```

---

## 🏦 Danh Sách Ngân Hàng Hỗ Trợ

| Ngân hàng | Mã Bank ID |
|-----------|-----------|
| VietinBank | 970415 |
| MB Bank | 970422 |
| Techcombank | 970407 |
| ACB | 970416 |
| BIDV | 970418 |
| Agribank | 970405 |
| Sacombank | 970403 |
| Vietcombank | 970436 |
| OCB | 970448 |
| VietCapital Bank | 970454 |
| TPBank | 970423 |
| HDBank | 970437 |
| VPBank | 970432 |
| MSB | 970426 |
| Cake by VPBank | 546034 |
| Timo | 963388 |

---

## 🎨 QR Templates

### 1. **Compact** (Mặc định)
- Logo ngân hàng
- Thông tin đầy đủ
- Kích thước vừa phải
- 👍 **Khuyến nghị**: Phù hợp nhất cho mobile

### 2. **Compact 2**
- Không logo
- Gọn gàng hơn
- Thông tin rút gọn

### 3. **QR Only**
- Chỉ có mã QR
- Không thông tin text
- 👍 Dùng khi đã có thông tin riêng

### 4. **Print**
- Đầy đủ thông tin
- Định dạng dễ in
- 👍 Dùng cho hóa đơn giấy

---

## 🔧 Technical Details

### API Sử dụng

**VietQR API**: `https://api.vietqr.io`

**URL Format:**
```
https://img.vietqr.io/image/{BANK_ID}-{ACCOUNT_NO}-{TEMPLATE}.png?
  amount={AMOUNT}&
  addInfo={DESCRIPTION}&
  accountName={ACCOUNT_NAME}
```

**Ví dụ:**
```
https://img.vietqr.io/image/970415-1234567890-compact.png?
  amount=100000&
  addInfo=DH%20Nguyen%20Van%20A&
  accountName=NGUYEN%20VAN%20A
```

### Database Schema

```sql
CREATE TABLE bank_settings (
  id SERIAL PRIMARY KEY,
  bank_id TEXT NOT NULL,        -- Mã ngân hàng
  bank_name TEXT NOT NULL,      -- Tên ngân hàng
  account_number TEXT NOT NULL, -- Số TK
  account_name TEXT NOT NULL,   -- Tên chủ TK
  is_active BOOLEAN DEFAULT true,
  template TEXT DEFAULT 'compact',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Components

**1. QRCodeDisplay.tsx**
- Input: `BankSettings`, `amount`, `description`
- Output: QR image + bank info + download button
- Features:
  - Error handling nếu load QR fail
  - Responsive design
  - Download QR as PNG

**2. BankSettingsView.tsx**
- Form cấu hình tài khoản
- Live QR preview
- Password toggle cho số TK
- Support 16+ banks

---

## 💡 Best Practices

### 1. **Bảo Mật Số Tài Khoản**
- ✅ Số TK được ẩn mặc định (password field)
- ✅ Chỉ admin/chủ tiệm mới truy cập Settings
- ✅ Không commit file `.env.local` chứa thông tin nhạy cảm

### 2. **Nội Dung Chuyển Khoản**
- ✅ Tự động: `DH {Tên khách hàng}`
- ✅ Giúp dễ đối chiếu khi nhận tiền
- ✅ Có thể custom trong code nếu cần

### 3. **Kiểm Tra QR Trước Khi Dùng**
- ✅ Test QR với số tiền nhỏ
- ✅ Quét bằng app ngân hàng để verify
- ✅ Đảm bảo tên chủ TK chính xác

### 4. **Xử Lý Lỗi**
- ⚠️ Nếu QR không load:
  - Kiểm tra kết nối internet
  - Verify bank_id đúng
  - Kiểm tra số TK không có ký tự lạ

---

## 📱 User Flow

### Scenario 1: Khách Đặt Bánh, Chuyển Khoản Ngay

```
1. Staff tạo đơn → Chọn "Chuyển khoản"
2. Nhập số tiền = 0 (chưa chuyển)
3. QR hiển thị với full amount
4. Khách quét QR → Chuyển tiền
5. Staff nhận thông báo → Update "Đã thanh toán: full"
6. Đơn chuyển sang "Đã thanh toán đủ ✓"
```

### Scenario 2: Khách Cọc Trước

```
1. Staff tạo đơn → "Chuyển khoản"
2. Khách cọc 50% → Nhập số tiền đã trả
3. QR hiển thị với 50% còn lại
4. Khách lưu QR để chuyển sau
5. Khi giao hàng:
   - Click "Sửa" payment
   - QR hiện với số tiền còn lại
   - Khách quét → Thanh toán
6. Update đã trả đủ
```

### Scenario 3: In QR Lên Hóa Đơn

```
1. Tạo đơn → Chọn template "print"
2. Download QR (nút "Tải mã QR")
3. In hóa đơn kèm QR
4. Gửi cho khách → Khách quét để thanh toán
```

---

## 🎁 Features

✅ **Dynamic QR**: Tự động update theo số tiền  
✅ **Multi-bank Support**: 16+ ngân hàng  
✅ **Live Preview**: Xem trước QR khi cấu hình  
✅ **Download QR**: Lưu QR dạng PNG  
✅ **Responsive**: Hoạt động tốt trên mobile  
✅ **Auto-sync**: Lưu cấu hình lên Supabase  
✅ **Error Handling**: Xử lý lỗi load QR gracefully  

---

## 🐛 Troubleshooting

### QR không hiển thị?
**Nguyên nhân:**
- Chưa cấu hình bank settings
- Số TK sai format
- Internet không ổn định

**Giải pháp:**
```
1. Vào Settings → Kiểm tra lại thông tin
2. Verify số TK không có space/ký tự lạ
3. Test với số tiền nhỏ trước
```

### QR load nhưng app bank báo lỗi?
**Nguyên nhân:**
- Tên chủ TK không chính xác
- Bank ID sai

**Giải pháp:**
```
1. Kiểm tra tên chủ TK: IN HOA, KHÔNG DẤU
2. Verify Bank ID từ danh sách hỗ trợ
3. Thử đổi template khác
```

### Không tải được QR?
```javascript
// Lỗi CORS hoặc network
// → QR vẫn hiển thị trên UI nhưng không download được
// → User có thể screenshot thay thế
```

---

## 🔮 Future Enhancements

- [ ] **Multi-account**: Hỗ trợ nhiều tài khoản ngân hàng
- [ ] **Payment verification**: Tự động verify qua banking API
- [ ] **Transaction history**: Lịch sử các lần quét QR
- [ ] **Custom templates**: Tùy chỉnh màu sắc, logo
- [ ] **Momo/VNPay**: Tích hợp payment gateway
- [ ] **SMS notification**: Gửi QR qua SMS
- [ ] **Email invoice**: Gửi hóa đơn + QR qua email

---

**Version:** 1.3.0  
**Last Updated:** December 10, 2024  
**API**: VietQR API v2  
**Supported Banks:** 16+

