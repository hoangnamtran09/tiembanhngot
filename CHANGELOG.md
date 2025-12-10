# 📝 Changelog

All notable changes to this project will be documented in this file.

## [1.4.1] - 2024-12-10

### ✨ Added - Auto Number Formatting
- **Format Utilities**: Tạo `utils/format.ts` với các functions format số
  - `formatNumber()` - Format số với dấu phẩy (1,234,567)
  - `formatCurrency()` - Format tiền VND (1,234,567đ)
  - `formatQuantity()` - Format số lượng với đơn vị (1,234.5 kg)
  - `formatPercentage()` - Format phần trăm (45.5%)
  - `parseFormattedNumber()` - Parse string về number
- **Applied Everywhere**: Áp dụng format tự động vào tất cả components:
  - ✅ InventoryView - Giá, số lượng
  - ✅ OrdersView - Tổng tiền, thanh toán
  - ✅ RecipeView - Giá bán, giá vốn, lợi nhuận
  - ✅ Dashboard - Doanh thu, lợi nhuận
  - ✅ QRCodeDisplay - Số tiền
  - ✅ PurchasePreparationView - Số lượng nguyên liệu
  - ✅ RevenueReportView - Tất cả số liệu tài chính
- **Consistent Formatting**: Tất cả số hiển thị đều có dấu phẩy ngăn cách hàng nghìn
- **Vietnamese Locale**: Sử dụng locale 'vi-VN' cho format chuẩn Việt Nam

---

## [1.4.0] - 2024-12-10

### ✨ Added - Purchase Preparation & Revenue Reports
- **Chuẩn Bị Nguyên Liệu Cần Mua**:
  - Tự động tính toán nguyên liệu cần mua dựa trên đơn hàng đang chờ
  - Hiển thị: Tồn kho, Cần cho đơn hàng, Cần mua thêm
  - Summary cards: Số đơn hàng, Loại nguyên liệu, Tổng số lượng
  - Danh sách đơn hàng đang chờ
  - Empty states khi không có đơn hoặc đủ nguyên liệu
  
- **Báo Cáo Doanh Thu & Lợi Nhuận**:
  - Filter theo thời gian: Hôm nay, 7 ngày, 30 ngày, Tất cả
  - Stats cards: Doanh thu, Chi phí, Lợi nhuận, Số đơn hàng
  - Charts:
    - Bar chart: Doanh thu theo ngày
    - Line chart: Doanh thu, Chi phí, Lợi nhuận theo ngày
  - Top 5 sản phẩm bán chạy với progress bars
  - Tính toán profit margin tự động

### 🎨 UI Improvements
- Menu items mới trong sidebar
- Responsive design cho charts
- Color-coded stats cards
- Professional report layout

---

## [1.3.0] - 2024-12-10

### ✨ Added - QR Code Payment Integration
- **Dynamic QR Code**: Tự động tạo mã QR chuyển khoản khi nhập số tiền
- **VietQR API Integration**: Sử dụng API VietQR để generate QR code
- **Bank Settings Management**:
  - Trang cài đặt ngân hàng riêng biệt
  - Hỗ trợ 16+ ngân hàng phổ biến tại Việt Nam
  - Cấu hình số tài khoản, tên chủ TK
  - 4 template QR: compact, compact2, qr_only, print
- **QR Display in Orders**:
  - Hiển thị QR khi tạo đơn hàng mới (nếu chọn chuyển khoản)
  - Hiển thị QR trong modal chỉnh sửa thanh toán
  - QR tự động cập nhật theo số tiền còn lại
- **QRCodeDisplay Component**:
  - Preview real-time mã QR
  - Hiển thị đầy đủ thông tin: ngân hàng, số TK, số tiền
  - Nút tải mã QR
  - Hướng dẫn sử dụng

### 💾 Database
- **New Table**: `bank_settings` - Lưu cấu hình tài khoản ngân hàng
- **Migration Script**: `supabase-bank-settings.sql`

### 🎨 UI/UX
- Menu item mới: "Cài Đặt Ngân Hàng" trong sidebar
- Form cài đặt với password toggle cho số TK
- QR preview live khi thay đổi cấu hình
- Responsive design cho mobile

---

## [1.2.1] - 2024-12-10

### 🗑️ Removed - Low Stock Warnings
- **Bỏ cảnh báo tồn kho**: Xóa icon cảnh báo và highlight màu vàng trong bảng nguyên liệu
- **Bỏ Low Stock Alert**: Xóa phần "Cảnh Báo Nguyên Liệu Sắp Hết" trong Dashboard
- **Cleanup**: Xóa AlertTriangle và AlertCircle icons không còn dùng

---

## [1.2.0] - 2024-12-10

### ✨ Added - Delete Functionality
- **Xóa Đơn Hàng**: Thêm nút xóa đơn hàng với confirmation dialog
- **Xóa Nguyên Liệu**: Thêm nút xóa nguyên liệu với cảnh báo ảnh hưởng công thức
- **Xóa Công Thức**: Thêm nút xóa sản phẩm (công thức) với cảnh báo ảnh hưởng đơn hàng
- **Confirmation Dialogs**: Modal xác nhận trước khi xóa với đầy đủ thông tin
  - Hiển thị chi tiết item sẽ bị xóa
  - Cảnh báo các ảnh hưởng có thể xảy ra
  - UI đẹp với icons và màu sắc phù hợp

### 💄 UI Improvements
- Nút xóa màu đỏ với hover effect
- Trash2 icon từ Lucide React
- Confirmation modal với animation fade in
- Responsive design cho mobile

---

## [1.1.0] - 2024-12-10

### ✨ Added - Payment Management Feature
- **Payment Methods**: Thêm lựa chọn thanh toán bằng Tiền mặt hoặc Chuyển khoản
- **Payment Tracking**: Theo dõi số tiền đã trả/chuyển và còn lại
- **Payment UI**: 
  - Form thanh toán trong modal tạo đơn hàng mới
  - Hiển thị thông tin thanh toán trong order card
  - Modal chỉnh sửa thanh toán cho đơn hàng đã tồn tại
  - Icon phân biệt phương thức thanh toán (💵 Tiền mặt / 💳 Chuyển khoản)
- **Payment Status Indicators**:
  - ✓ Đã thanh toán đủ (màu xanh)
  - ⚠️ Còn nợ (màu cam, hiển thị số tiền còn lại)
- **Database Schema**: Thêm 4 cột mới vào bảng `orders`:
  - `payment_method`: Phương thức thanh toán
  - `total_amount`: Tổng tiền đơn hàng
  - `paid_amount`: Số tiền đã thanh toán
  - `remaining_amount`: Số tiền còn lại
- **Migration Script**: File `supabase-migration-payment.sql` để cập nhật database có sẵn

### 📚 Documentation
- Cập nhật `SUPABASE_SETUP.md` với hướng dẫn migration
- Cập nhật `README.md` với tính năng thanh toán
- Thêm file `CHANGELOG.md`

---

## [1.0.0] - 2024-12-10

### 🎉 Initial Release - Supabase Integration

#### ✨ Features
- **Supabase Backend**: Thay thế localStorage bằng Supabase PostgreSQL
- **Dashboard**: Tổng quan doanh thu, chi phí, lợi nhuận
- **Inventory Management**: Quản lý nguyên liệu, cảnh báo hết hàng
- **Recipe Management**: Tạo và quản lý công thức sản phẩm
- **Order Management**: Quản lý đơn hàng, trạng thái, tự động trừ kho
- **AI Assistant**: Trợ lý AI với Google Gemini

#### 🗄️ Database
- 5 tables: `ingredients`, `products`, `recipe_items`, `orders`, `order_items`
- Row Level Security (RLS) enabled
- Auto-sync với debounce 500ms
- Seed data tự động nếu database trống

#### 📦 Tech Stack
- React 19 + TypeScript
- Vite 6
- Supabase JS Client
- Google Gemini AI
- Recharts (Charts)
- Lucide React (Icons)
- Tailwind CSS

#### 📚 Documentation
- `README.md`: Overview và setup guide
- `SUPABASE_SETUP.md`: Detailed Supabase setup
- `QUICKSTART.md`: 5-minute quick start
- `setup.sh`: Automated setup script

---

## Future Plans

### 🔮 Upcoming Features
- [ ] Multi-user support với authentication
- [ ] In hóa đơn PDF
- [ ] Báo cáo chi tiết theo thời gian
- [ ] Thông báo đẩy cho đơn hàng sắp đến hạn
- [ ] Export/Import dữ liệu Excel
- [ ] Dark mode
- [ ] PWA support (offline mode)

---

**Legend:**
- ✨ Added: Tính năng mới
- 🐛 Fixed: Bug fixes
- 📚 Documentation: Cập nhật tài liệu
- 🔒 Security: Bảo mật
- ⚡ Performance: Tối ưu hiệu năng
- 💄 UI: Cải thiện giao diện

