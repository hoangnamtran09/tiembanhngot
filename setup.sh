#!/bin/bash

# 🍰 Tiệm Bánh Ngọt - Setup Script
# Script tự động hóa quá trình setup

set -e

echo "🍰 === TIỆM BÁNH NGỌT - SETUP ===="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js chưa được cài đặt!"
    echo "   Vui lòng cài đặt Node.js từ: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Install dependencies
echo "📦 Đang cài đặt dependencies..."
npm install
echo "✅ Dependencies đã được cài đặt"
echo ""

# Check .env.local
if [ ! -f .env.local ]; then
    echo "⚠️  File .env.local chưa tồn tại"
    echo "📝 Đang tạo từ .env.example..."
    cp .env.example .env.local
    echo "✅ File .env.local đã được tạo"
    echo ""
    echo "⚠️  QUAN TRỌNG: Bạn cần cập nhật .env.local với thông tin Supabase!"
    echo ""
    echo "📋 Các bước tiếp theo:"
    echo "   1. Tạo project tại https://supabase.com"
    echo "   2. Chạy SQL từ file supabase-schema.sql"
    echo "   3. Lấy API keys từ Settings > API"
    echo "   4. Cập nhật .env.local với SUPABASE_URL và ANON_KEY"
    echo "   5. Chạy: npm run dev"
    echo ""
    echo "📖 Xem hướng dẫn chi tiết: SUPABASE_SETUP.md"
else
    echo "✅ File .env.local đã tồn tại"
    
    # Check if configured
    if grep -q "your-project-url" .env.local || grep -q "your-anon-key" .env.local; then
        echo "⚠️  .env.local vẫn chứa giá trị mặc định!"
        echo "   Vui lòng cập nhật với Supabase credentials thật"
    else
        echo "✅ .env.local đã được cấu hình"
    fi
fi

echo ""
echo "🎉 Setup hoàn tất!"
echo ""
echo "🚀 Chạy app: npm run dev"
echo "📖 Xem thêm: SUPABASE_SETUP.md hoặc QUICKSTART.md"

