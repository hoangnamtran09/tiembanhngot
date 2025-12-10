#!/bin/bash

# 🚀 Deploy Script cho Vercel
# Chạy: ./deploy-vercel.sh

echo "🚀 === DEPLOY TO VERCEL ==="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git chưa được khởi tạo!"
    echo "   Chạy: git init"
    exit 1
fi

# Check if there are uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "⚠️  Có thay đổi chưa commit!"
    echo ""
    git status -s
    echo ""
    read -p "Bạn có muốn commit tất cả? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Nhập commit message: " commit_msg
        git add .
        git commit -m "$commit_msg"
        echo "✅ Đã commit thay đổi"
    else
        echo "❌ Hủy deploy. Vui lòng commit trước."
        exit 1
    fi
fi

# Check if remote exists
if ! git remote | grep -q "origin"; then
    echo "❌ Git remote 'origin' chưa được thiết lập!"
    echo "   Tạo repo trên GitHub, sau đó chạy:"
    echo "   git remote add origin https://github.com/username/tiembanhngot.git"
    exit 1
fi

# Push to GitHub
echo ""
echo "📤 Đang push lên GitHub..."
git push origin main 2>/dev/null || git push origin master

if [ $? -eq 0 ]; then
    echo "✅ Push thành công!"
else
    echo "❌ Push thất bại!"
    echo "   Kiểm tra lại remote URL và quyền truy cập"
    exit 1
fi

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo ""
    echo "⚠️  Vercel CLI chưa được cài đặt!"
    echo "   Cài đặt: npm install -g vercel"
    echo ""
    read -p "Bạn có muốn deploy qua Vercel Dashboard? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "📖 Hướng dẫn deploy qua Dashboard:"
        echo "   1. Truy cập: https://vercel.com"
        echo "   2. Login with GitHub"
        echo "   3. Import Git Repository"
        echo "   4. Chọn repo này"
        echo "   5. Thêm Environment Variables (xem VERCEL_DEPLOY.md)"
        echo "   6. Deploy!"
        echo ""
        echo "📄 Xem hướng dẫn chi tiết: VERCEL_DEPLOY.md"
    fi
    exit 0
fi

# Deploy with Vercel CLI
echo ""
echo "🚀 Đang deploy lên Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 ================================"
    echo "✅ Deploy thành công!"
    echo "🌐 Website của bạn đã live!"
    echo "================================"
else
    echo ""
    echo "❌ Deploy thất bại!"
    echo "   Xem logs để biết thêm chi tiết"
fi

echo ""
echo "📄 Xem hướng dẫn đầy đủ: VERCEL_DEPLOY.md"

