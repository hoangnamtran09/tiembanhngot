# 📖 Hướng Dẫn Sử Dụng - Tiệm Bánh Ngọt

Hướng dẫn chi tiết cách sử dụng hệ thống quản lý tiệm bánh.

---

## 📋 Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Cài Đặt](#cài-đặt)
3. [Quản Lý Nguyên Liệu](#quản-lý-nguyên-liệu)
4. [Quản Lý Sản Phẩm & Công Thức](#quản-lý-sản-phẩm--công-thức)
5. [Quản Lý Đơn Hàng](#quản-lý-đơn-hàng)
6. [Quản Lý Khách Hàng](#quản-lý-khách-hàng)
7. [Xuất/Nhập Kho](#xuấtnhập-kho)
8. [Lịch Sử Mua Hàng](#lịch-sử-mua-hàng)
9. [Quản Lý Dòng Tiền](#quản-lý-dòng-tiền)
10. [Báo Cáo Doanh Thu](#báo-cáo-doanh-thu)
11. [Cài Đặt Ngân Hàng](#cài-đặt-ngân-hàng)
12. [Trợ Lý AI](#trợ-lý-ai)

---

## 🎯 Tổng Quan

Hệ thống quản lý tiệm bánh giúp bạn:
- Quản lý nguyên liệu và tồn kho
- Tạo công thức sản phẩm
- Quản lý đơn hàng và khách hàng
- Theo dõi doanh thu và lợi nhuận
- Quản lý dòng tiền và chi phí

---

## ⚙️ Cài Đặt

### Bước 1: Cài đặt Dependencies

```bash
npm install
```

### Bước 2: Cấu hình Supabase

1. Tạo tài khoản tại [supabase.com](https://supabase.com)
2. Tạo project mới
3. Vào **SQL Editor** và chạy các file SQL theo thứ tự:
   - `supabase-schema.sql` (tạo bảng cơ bản)
   - `supabase-bank-settings.sql` (tạo bảng cài đặt ngân hàng)
   - `supabase-migration-new-features.sql` (tạo bảng tính năng mới)

### Bước 3: Cấu hình Environment Variables

Tạo file `.env.local`:

```env
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GEMINI_API_KEY=your-gemini-key (optional)
```

### Bước 4: Chạy ứng dụng

```bash
npm run dev
```

Truy cập: `http://localhost:5173`

---

## 📦 Quản Lý Nguyên Liệu

### Thêm Nguyên Liệu Mới

1. Vào menu **"Kho Nguyên Liệu"**
2. Click nút **"Thêm Nguyên Liệu"**
3. Điền thông tin:
   - **Tên nguyên liệu**: VD: "Bột mì"
   - **Đơn vị mua**: Đơn vị khi mua (VD: kg)
   - **Đơn vị sử dụng**: Đơn vị khi làm bánh (VD: g)
   - **Giá nhập**: Giá mua (VD: 100,000đ)
   - **Số lượng mua**: Số lượng mua với giá trên (VD: 1 kg)
   - **Tồn kho hiện tại**: Số lượng hiện có
   - **Cảnh báo khi tồn kho dưới**: Ngưỡng cảnh báo

### Sửa/Xóa Nguyên Liệu

- **Sửa**: Click icon ✏️ bên cạnh nguyên liệu
- **Xóa**: Click icon 🗑️ → Xác nhận xóa

### Lưu ý

- Hệ thống tự động chuyển đổi giữa đơn vị mua và đơn vị sử dụng
- VD: Mua 1kg bột mì (100,000đ) → Dùng theo gram → 1kg = 1000g

---

## 🍰 Quản Lý Sản Phẩm & Công Thức

### Tạo Sản Phẩm Mới

1. Vào menu **"Công Thức"**
2. Click **"Tạo Sản Phẩm Mới"**
3. Điền thông tin:
   - **Tên bánh**: VD: "Bánh bông lan"
   - **Mô tả**: Mô tả ngắn về sản phẩm
   - **Giá bán**: Giá bán cho khách (tự động format)
   - **Danh mục**: Chọn loại bánh
   - **URL Hình ảnh**: Link hình ảnh sản phẩm (tùy chọn)

### Thêm Nguyên Liệu Vào Công Thức

1. Trong form tạo/sửa sản phẩm
2. Click **"Thêm Nguyên Liệu"**
3. Tìm kiếm nguyên liệu trong ô tìm kiếm
4. Click vào nguyên liệu để thêm
5. Nhập số lượng cần dùng (theo đơn vị sử dụng)

### Xem Chi Phí Sản Phẩm

- Hệ thống tự động tính chi phí nguyên liệu
- Hiển thị **Giá vốn** và **Lợi nhuận** dự kiến
- Dựa trên giá mua nguyên liệu và công thức

### Sửa/Xóa Sản Phẩm

- **Sửa**: Click vào sản phẩm trong danh sách bên trái
- **Xóa**: Click icon 🗑️ → Xác nhận xóa

---

## 🛒 Quản Lý Đơn Hàng

### Tạo Đơn Hàng Mới

1. Vào menu **"Đơn Hàng"**
2. Click nút **"Tạo Đơn Mới"**
3. Giao diện full-page sẽ mở ra

#### Nhập Thông Tin Khách Hàng

- **Tên khách hàng** * (bắt buộc)
- **Số điện thoại**
- **Ngày trả hàng**: Chọn ngày giao hàng

#### Chọn Sản Phẩm

1. **Tìm kiếm sản phẩm**: Gõ tên sản phẩm vào ô tìm kiếm
2. **Tick chọn**: Click checkbox để chọn sản phẩm
3. **Chỉnh số lượng**: 
   - Dùng nút `-` và `+` để tăng/giảm
   - Hoặc nhập trực tiếp vào ô số lượng
4. Sản phẩm đã chọn sẽ hiển thị trong danh sách bên dưới

#### Thanh Toán

- **Phương thức**: Chọn "Tiền mặt" hoặc "Chuyển khoản"
- **Số tiền đã trả**: Nhập số tiền (tự động format)
- **QR Code**: Tự động hiển thị nếu chọn "Chuyển khoản" và chưa thanh toán đủ

#### Tạo Đơn

- Click nút **"Tạo Đơn Hàng"** ở góc trên bên phải
- Đơn hàng sẽ được tạo với trạng thái "Chờ xử lý"

### Quản Lý Trạng Thái Đơn Hàng

Các trạng thái:
- **Chờ xử lý**: Đơn mới tạo
- **Đang làm**: Đang chế biến
- **Hoàn thành**: Đã hoàn thành (tự động trừ kho)
- **Đã giao**: Đã giao cho khách
- **Đã hủy**: Đơn đã hủy

**Chuyển trạng thái**:
- Click các nút tương ứng trên card đơn hàng
- Khi chuyển sang "Hoàn thành", hệ thống tự động trừ nguyên liệu theo công thức

### Chỉnh Sửa Thanh Toán

1. Click nút **"Sửa"** trong phần thanh toán của đơn hàng
2. Chọn phương thức thanh toán
3. Nhập số tiền đã trả
4. Click **"Lưu"**

### In Hóa Đơn

1. Click icon 🖨️ trên card đơn hàng
2. Xem hóa đơn trong popup
3. Click **"In"** để in hóa đơn
4. Hóa đơn sẽ được in với đầy đủ thông tin:
   - Thông tin khách hàng
   - Danh sách sản phẩm
   - Tổng tiền
   - Thông tin thanh toán

### Xóa Đơn Hàng

- Click icon 🗑️ trên card đơn hàng
- Xác nhận xóa

### Lọc Đơn Hàng

- Click các tab: **"Tất cả"**, **"Chờ xử lý"**, **"Đang làm"**, **"Hoàn thành"**, **"Đã giao"**, **"Đã hủy"**

---

## 👥 Quản Lý Khách Hàng

### Thêm Khách Hàng

1. Vào menu **"Khách Hàng"**
2. Click **"Thêm Khách Hàng"**
3. Điền thông tin:
   - **Tên khách hàng** * (bắt buộc)
   - **Số điện thoại** * (bắt buộc)
   - **Email** (tùy chọn)
   - **Địa chỉ** (tùy chọn)
   - **Ghi chú** (tùy chọn)

### Xem Lịch Sử Mua Hàng

- Mỗi card khách hàng hiển thị:
  - Số đơn hàng đã mua
  - Tổng tiền đã chi tiêu

### Tìm Kiếm Khách Hàng

- Gõ tên hoặc số điện thoại vào ô tìm kiếm
- Kết quả sẽ được lọc theo thời gian thực

### Sửa/Xóa Khách Hàng

- **Sửa**: Click icon ✏️
- **Xóa**: Click icon 🗑️ → Xác nhận

---

## 📥 Xuất/Nhập Kho

### Thêm Giao Dịch Kho

1. Vào menu **"Xuất/Nhập Kho"**
2. Click **"Thêm Giao Dịch"**
3. Điền thông tin:
   - **Nguyên liệu**: Chọn nguyên liệu
   - **Loại**: Chọn "Nhập kho" hoặc "Xuất kho"
   - **Số lượng**: Nhập số lượng (theo đơn vị sử dụng)
   - **Lý do**: VD: "Nhập hàng mới", "Điều chỉnh", "Hư hỏng"
   - **Ghi chú**: Ghi chú thêm (tùy chọn)

### Tự Động Cập Nhật Tồn Kho

- Khi tạo giao dịch **Nhập kho**: Tồn kho tăng
- Khi tạo giao dịch **Xuất kho**: Tồn kho giảm
- Hệ thống tự động cập nhật số lượng tồn kho

### Xóa Giao Dịch

- Click icon 🗑️
- Hệ thống sẽ đảo ngược thay đổi tồn kho khi xóa

### Lưu ý

- Giao dịch xuất/nhập kho khác với việc trừ kho khi hoàn thành đơn hàng
- Dùng cho các trường hợp: nhập hàng mới, điều chỉnh, hư hỏng, mất mát...

---

## 💰 Lịch Sử Mua Hàng

### Thêm Giao Dịch Mua Hàng

1. Vào menu **"Lịch Sử Mua Hàng"**
2. Click **"Thêm Giao Dịch"**
3. Điền thông tin:
   - **Nguyên liệu**: Chọn nguyên liệu đã mua
   - **Số lượng mua**: Số lượng (theo đơn vị mua)
   - **Tổng tiền**: Tổng tiền đã chi
   - **Ngày mua**: Chọn ngày mua
   - **Nhà cung cấp**: Tên nhà cung cấp (tùy chọn)
   - **Ghi chú**: Ghi chú thêm (tùy chọn)

### Xem Tổng Chi Phí

- Hiển thị **"Tổng chi phí"** ở góc trên bên phải
- Tổng hợp tất cả chi phí mua nguyên liệu

### Tìm Kiếm

- Gõ tên nguyên liệu hoặc nhà cung cấp vào ô tìm kiếm

### Sửa/Xóa Giao Dịch

- **Sửa**: Click icon ✏️
- **Xóa**: Click icon 🗑️ → Xác nhận

---

## 💵 Quản Lý Dòng Tiền

### Xem Tổng Quan Dòng Tiền

1. Vào menu **"Quản Lý Dòng Tiền"**
2. Xem các thông tin:
   - **Tổng Thu**: Tổng tiền từ đơn hàng đã hoàn thành
   - **Đã Mua Nguyên Liệu**: Tổng chi phí mua nguyên liệu
   - **Tiền Còn Lại**: Số tiền có thể dùng để mua nguyên liệu

### Công Thức Tính

```
Tiền Còn Lại = Tổng Thu - Đã Mua Nguyên Liệu
```

### Xem Giao Dịch Gần Đây

- Danh sách 20 giao dịch gần nhất
- Phân loại:
  - **Thu vào** (màu xanh): Đơn hàng đã hoàn thành
  - **Chi ra** (màu đỏ): Mua nguyên liệu

### Biểu Đồ Dòng Tiền

- Hiển thị tỷ lệ thu/chi trực quan
- Màu xanh: Thu vào
- Màu đỏ: Chi ra

---

## 📊 Báo Cáo Doanh Thu

### Xem Báo Cáo

1. Vào menu **"Báo Cáo Doanh Thu"**
2. Chọn khoảng thời gian:
   - **Hôm nay**: Chỉ đơn hàng hôm nay
   - **7 ngày**: 7 ngày gần nhất
   - **30 ngày**: 30 ngày gần nhất
   - **Tất cả**: Tất cả đơn hàng

### Các Chỉ Số

- **Doanh Thu**: Tổng tiền từ đơn hàng đã hoàn thành
- **Chi Phí**: Tổng chi phí nguyên liệu
- **Lợi Nhuận**: Doanh thu - Chi phí
- **Margin**: Tỷ lệ lợi nhuận (%)

### Biểu Đồ

- **Doanh Thu Theo Ngày**: Biểu đồ cột 14 ngày gần nhất
- **Lợi Nhuận Theo Ngày**: Biểu đồ đường (Doanh thu, Chi phí, Lợi nhuận)

### Top 5 Sản Phẩm Bán Chạy

- Hiển thị 5 sản phẩm có doanh thu cao nhất
- Kèm số lượng đã bán và tỷ lệ %

### Mức Tiêu Hao Nguyên Vật Liệu

- Top 10 nguyên liệu được sử dụng nhiều nhất
- Hiển thị:
  - Số lượng đã dùng
  - Chi phí nguyên liệu

---

## 🏦 Cài Đặt Ngân Hàng

### Cấu Hình Thông Tin Ngân Hàng

1. Vào menu **"Cài Đặt Ngân Hàng"**
2. Điền thông tin:
   - **Mã ngân hàng**: VD: "970415" (Vietcombank)
   - **Tên ngân hàng**: VD: "Vietcombank"
   - **Số tài khoản**: Số tài khoản của bạn
   - **Tên chủ tài khoản**: Tên trên tài khoản
   - **Template QR**: Chọn mẫu QR code

### Xem Trước QR Code

- Nhập số tiền mẫu
- QR code sẽ tự động cập nhật
- Có thể tải QR code về máy

### Lưu ý

- QR code được tạo tự động khi khách chọn "Chuyển khoản"
- Số tiền trong QR = Tổng đơn - Số tiền đã trả

---

## 🤖 Trợ Lý AI

### Sử Dụng Trợ Lý AI

1. Vào menu **"Trợ Lý AI"**
2. Nhập câu hỏi hoặc yêu cầu:
   - VD: "Tính nguyên liệu cần cho 10 cái bánh bông lan"
   - VD: "Gợi ý công thức bánh mới"
   - VD: "Cách giảm chi phí sản xuất?"

### Tính Năng

- Tính toán nguyên liệu cần thiết
- Tư vấn công thức
- Gợi ý cải thiện
- Trả lời câu hỏi về quản lý

### Lưu ý

- Cần cấu hình `VITE_GEMINI_API_KEY` trong `.env.local`
- Tính năng này là tùy chọn

---

## 🎨 Giao Diện

### Màu Sắc

- **Màu chủ đạo**: Xám, trắng, đen (đơn giản, ít màu mè)
- **Màu nổi bật**: Xám đen (#1f2937) cho các nút chính

### Responsive

- Tự động điều chỉnh trên mobile và desktop
- Menu mobile khi màn hình nhỏ
- Layout linh hoạt

---

## ⌨️ Phím Tắt

- **F1**: Tạo đơn và duyệt (trong tương lai)
- **F3**: Tìm kiếm sản phẩm (trong tương lai)
- **F4**: Tìm kiếm khách hàng (trong tương lai)

---

## 🔧 Xử Lý Sự Cố

### Dữ Liệu Không Hiển Thị

1. Kiểm tra kết nối Supabase
2. Kiểm tra `.env.local` có đúng không
3. Kiểm tra console trình duyệt (F12) để xem lỗi

### Lỗi Lưu Dữ Liệu

1. Kiểm tra RLS policies trong Supabase
2. Đảm bảo đã chạy đầy đủ các file SQL migration
3. Kiểm tra network tab trong DevTools

### QR Code Không Hiển Thị

1. Kiểm tra đã cấu hình thông tin ngân hàng chưa
2. Kiểm tra số tiền có hợp lệ không (> 0)

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra file `README.md` và `SUPABASE_SETUP.md`
2. Xem console trình duyệt để tìm lỗi
3. Kiểm tra logs trong Supabase Dashboard

---

## 📝 Lưu Ý Quan Trọng

1. **Backup dữ liệu**: Nên backup database thường xuyên
2. **Kiểm tra tồn kho**: Thường xuyên kiểm tra tồn kho nguyên liệu
3. **Cập nhật giá**: Cập nhật giá nguyên liệu khi có thay đổi
4. **Theo dõi dòng tiền**: Kiểm tra dòng tiền thường xuyên để quản lý tốt

---

**Chúc bạn sử dụng hiệu quả! 🎉**

