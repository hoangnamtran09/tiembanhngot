<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🍰 Tiệm Bánh Ngọt - Bakery Management System

Hệ thống quản lý tiệm bánh với đầy đủ tính năng: quản lý nguyên liệu, công thức, đơn hàng và trợ lý AI.

**Công nghệ:**
- ⚛️ React + TypeScript + Vite
- 🗄️ Supabase (PostgreSQL Database)
- 🤖 Google Gemini AI
- 📊 Recharts (Biểu đồ)
- 🎨 Tailwind CSS

View your app in AI Studio: https://ai.studio/apps/drive/14pQmx7pmlmXGAIKvVINP9wIOwIiKojMo

## 🚀 Cài Đặt & Chạy

**Prerequisites:** Node.js 18+, Supabase Account

### 1. Clone và Install Dependencies

```bash
git clone <repository-url>
cd tiembanhngot
npm install
```

### 2. Cấu Hình Supabase

#### Bước 2.1: Tạo Project Supabase
1. Truy cập [https://supabase.com](https://supabase.com) và tạo tài khoản
2. Tạo **New Project**
3. Đợi project khởi tạo (~2 phút)

#### Bước 2.2: Chạy Database Schema
1. Vào **SQL Editor** trong Supabase Dashboard
2. Copy nội dung file `supabase-schema.sql`
3. Paste và **Run** để tạo các bảng

#### Bước 2.3: Lấy API Keys
1. Vào **Settings** > **API**
2. Copy **Project URL** và **anon public key**

### 3. Cấu Hình Environment Variables

Tạo file `.env.local` và thêm:

```env
# Supabase (Required)
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Gemini AI (Optional - cho tính năng trợ lý AI)
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### 4. Chạy Development Server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`

## 📖 Hướng Dẫn Chi Tiết

Xem file [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) để có hướng dẫn chi tiết về:
- Setup Supabase từng bước
- Cấu trúc database
- Troubleshooting
- Migration từ localStorage

## 🎯 Tính Năng

### ✅ Đã Hoàn Thành
- 📊 **Dashboard**: Tổng quan doanh thu, lợi nhuận, đơn hàng
- 📦 **Quản Lý Kho**: Theo dõi nguyên liệu, cảnh báo hết hàng
- 📝 **Công Thức**: Tạo và quản lý công thức sản phẩm
- 🛒 **Đơn Hàng**: Quản lý đơn hàng, trạng thái, tự động trừ kho
- 🤖 **Trợ Lý AI**: Tính toán nguyên liệu, tư vấn công thức (Gemini)
- 💾 **Supabase Backend**: Lưu trữ dữ liệu trên cloud, auto-sync

### 🔄 Auto-Sync
- Tự động lưu mọi thay đổi lên Supabase
- Debounce 500ms để tối ưu performance
- Loading & sync indicators

## 🏗️ Cấu Trúc Project

```
tiembanhngot/
├── components/          # React components
│   ├── Dashboard.tsx
│   ├── InventoryView.tsx
│   ├── RecipeView.tsx
│   ├── OrdersView.tsx
│   └── AssistantView.tsx
├── services/
│   ├── supabaseService.ts    # Supabase client & types
│   ├── storageService.ts     # Data access layer
│   └── geminiService.ts      # AI service
├── types.ts             # TypeScript definitions
├── constants.ts         # Initial/seed data
├── supabase-schema.sql  # Database schema
└── App.tsx             # Main app component
```

## 📝 Database Schema

- **ingredients** - Nguyên liệu (bột, đường, trứng...)
- **products** - Sản phẩm (bánh bông lan, macaron...)
- **recipe_items** - Công thức (product → ingredients mapping)
- **orders** - Đơn hàng
- **order_items** - Chi tiết đơn hàng

## 🔒 Security

- RLS (Row Level Security) được enable
- API keys được lưu trong `.env.local` (không commit)
- Public policies cho demo (nên tùy chỉnh cho production)

## 🛠️ Development

```bash
npm run dev      # Run dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 📄 License

MIT

---

Made with ❤️ using React, Supabase & Gemini AI
