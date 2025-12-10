# 🚀 Hướng Dẫn Deploy Lên Vercel

## 📋 Tổng Quan

Vercel là nền tảng hosting miễn phí tốt nhất cho các ứng dụng React/Vite. Deploy rất đơn giản và tự động.

---

## ✅ Yêu Cầu Trước Khi Deploy

- [x] Đã có tài khoản GitHub
- [x] Code đã được push lên GitHub repository
- [x] Đã setup Supabase và có API keys
- [ ] Tài khoản Vercel (sẽ tạo trong bước 1)

---

## 🎯 Bước 1: Tạo Tài Khoản Vercel

1. Truy cập [https://vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Chọn **"Continue with GitHub"**
4. Authorize Vercel để truy cập GitHub của bạn
5. ✅ Hoàn tất!

---

## 📦 Bước 2: Push Code Lên GitHub (nếu chưa có)

### Nếu chưa có Git Repository:

```bash
# Khởi tạo Git (nếu chưa có)
cd "/Users/macbook/HOANG NAM/tiembanhngot"
git init

# Thêm tất cả files
git add .

# Commit
git commit -m "Initial commit: Bakery Management System"

# Tạo repo trên GitHub, sau đó:
git remote add origin https://github.com/your-username/tiembanhngot.git
git branch -M main
git push -u origin main
```

### Nếu đã có repo, push code mới nhất:

```bash
git add .
git commit -m "Add delete features and remove low stock warnings"
git push
```

---

## 🚀 Bước 3: Deploy Từ Vercel Dashboard

### 3.1. Import Project

1. Login vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Chọn repository `tiembanhngot` của bạn
5. Click **"Import"**

### 3.2. Configure Project

Vercel sẽ tự động detect Vite, nhưng hãy kiểm tra:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

**✅ Giữ nguyên các giá trị mặc định!**

### 3.3. Environment Variables (QUAN TRỌNG!)

Trước khi deploy, bạn PHẢI thêm environment variables:

1. Mở rộng phần **"Environment Variables"**
2. Thêm các biến sau:

| Name | Value | Description |
|------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` | Từ Supabase Dashboard > Settings > API |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` | Từ Supabase Dashboard > Settings > API |
| `VITE_GEMINI_API_KEY` | `AIza...` | (Optional) Nếu dùng AI Assistant |

**📸 Ví dụ:**

```
Name:  VITE_SUPABASE_URL
Value: https://abcdefgh.supabase.co

Name:  VITE_SUPABASE_ANON_KEY  
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Name:  VITE_GEMINI_API_KEY
Value: AIzaSyD... (optional)
```

### 3.4. Deploy!

1. Click **"Deploy"**
2. Đợi 2-3 phút...
3. 🎉 **Done!** App của bạn đã live!

---

## 🌐 Bước 4: Truy Cập Website

Sau khi deploy thành công:

1. Vercel sẽ tạo URL tự động: `https://tiembanhngot.vercel.app`
2. Click vào URL để xem website
3. ✅ Test các chức năng:
   - Dashboard hiển thị đúng
   - Tạo đơn hàng mới
   - Thêm nguyên liệu
   - Thanh toán
   - Xóa items

---

## 🔄 Bước 5: Auto Deploy (CI/CD)

Vercel tự động deploy mỗi khi bạn push code mới lên GitHub!

```bash
# Làm thay đổi trong code
# ...

# Push lên GitHub
git add .
git commit -m "Update features"
git push

# ✅ Vercel sẽ tự động build và deploy!
```

**Xem progress:**
- Vào Vercel Dashboard
- Click vào project
- Xem tab "Deployments"

---

## ⚙️ Bước 6: Custom Domain (Tuỳ Chọn)

Nếu bạn có tên miền riêng (ví dụ: `tiembanhngot.com`):

### 6.1. Trong Vercel Dashboard:

1. Vào project → **Settings** → **Domains**
2. Thêm domain của bạn: `tiembanhngot.com`
3. Vercel sẽ cho bạn DNS records cần thêm

### 6.2. Tại nhà cung cấp domain (GoDaddy, Namecheap, etc.):

1. Vào DNS Settings
2. Thêm các records Vercel yêu cầu:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

3. Đợi 5-30 phút để DNS propagate
4. ✅ Truy cập domain của bạn!

---

## 🔧 Troubleshooting

### ❌ Lỗi: "Failed to connect to Supabase"

**Nguyên nhân:** Environment variables chưa đúng

**Giải pháp:**
1. Vào Vercel Dashboard → Project → **Settings** → **Environment Variables**
2. Kiểm tra lại:
   - `VITE_SUPABASE_URL` có đúng không?
   - `VITE_SUPABASE_ANON_KEY` có đầy đủ không?
3. Sau khi sửa, vào **Deployments** → Click "..." → **Redeploy**

---

### ❌ Lỗi: "Build failed"

**Nguyên nhân:** Code có lỗi hoặc dependencies thiếu

**Giải pháp:**
1. Check build logs trong Vercel
2. Test build locally:
```bash
npm run build
npm run preview
```
3. Fix lỗi, push lại

---

### ❌ Lỗi: "404 on page refresh"

**Nguyên nhân:** SPA routing issue (rất hiếm với Vite)

**Giải pháp:** Tạo file `vercel.json` (xem bước 7)

---

## 📝 Bước 7: Tối Ưu Deploy (Optional)

### Tạo file `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**Lưu file này vào root project và push lên GitHub.**

---

## 🎨 Bước 8: Preview Deployments

Vercel tự động tạo preview cho mỗi Pull Request!

### Workflow:

1. Tạo branch mới:
```bash
git checkout -b feature/new-feature
```

2. Làm thay đổi và push:
```bash
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
```

3. Tạo Pull Request trên GitHub

4. ✅ Vercel tự động deploy preview:
   - URL riêng cho branch này
   - Comment tự động trên PR với link preview
   - Test trước khi merge

---

## 📊 Analytics & Monitoring

### Enable Vercel Analytics (Free):

1. Vào Project → **Analytics**
2. Click **"Enable Analytics"**
3. Cài package:
```bash
npm install @vercel/analytics
```

4. Thêm vào `App.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <YourAppComponents />
      <Analytics />
    </>
  );
}
```

5. Push lên GitHub → Vercel tự động deploy
6. ✅ Xem thống kê traffic, page views, etc.

---

## 🔐 Bảo Mật

### Protect Production Branch:

1. GitHub repo → **Settings** → **Branches**
2. Add rule cho `main` branch:
   - ✅ Require pull request reviews
   - ✅ Require status checks (Vercel preview)

### Environment Variables Security:

- ✅ Vercel tự động encrypt environment variables
- ✅ Không bao giờ commit `.env.local` lên GitHub
- ✅ Supabase RLS đã enable để bảo vệ database

---

## 💡 Tips & Best Practices

### 1. Git Workflow:
```bash
# Develop trên branch riêng
git checkout -b feature/payment-update
# ... làm việc ...
git push origin feature/payment-update
# Tạo PR → Review → Merge → Auto deploy to production
```

### 2. Environment Variables:
- Development: `.env.local` (local)
- Production: Vercel Dashboard (cloud)
- Staging: Tạo branch `staging` với env variables riêng

### 3. Performance:
- Vercel tự động optimize images
- CDN toàn cầu (fast worldwide)
- Automatic HTTPS/SSL

### 4. Monitoring:
```bash
# Check deployment status
vercel --prod

# View logs
vercel logs
```

---

## 🚀 Quick Deploy Checklist

Trước khi deploy, kiểm tra:

- [ ] Code đã test kỹ locally
- [ ] Database schema đã chạy trong Supabase
- [ ] `.gitignore` có `.env.local`
- [ ] `package.json` có đầy đủ dependencies
- [ ] Build thành công: `npm run build`
- [ ] Preview OK: `npm run preview`
- [ ] Environment variables chuẩn bị sẵn
- [ ] GitHub repo accessible

---

## 📞 Support

### Vercel Documentation:
- [https://vercel.com/docs](https://vercel.com/docs)

### Vercel Community:
- [https://github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

### Video Tutorial:
- [Vercel Deploy Guide](https://www.youtube.com/results?search_query=deploy+vite+react+to+vercel)

---

## 🎉 Kết Quả

Sau khi hoàn thành:

✅ Website live tại: `https://tiembanhngot.vercel.app`  
✅ Auto deploy khi push code  
✅ Preview cho mỗi PR  
✅ HTTPS/SSL miễn phí  
✅ CDN toàn cầu  
✅ Analytics & monitoring  

**Deploy time:** ~2-3 phút  
**Cost:** **FREE** (Hobby plan)

---

## 📊 Vercel Free Plan Limits

| Feature | Free Plan |
|---------|-----------|
| Projects | Unlimited |
| Deployments/month | Unlimited |
| Bandwidth | 100GB/month |
| Build time | 6000 minutes/month |
| Serverless functions | 100GB-hours |
| Team members | 1 |

**✅ Đủ cho hầu hết các projects nhỏ và vừa!**

---

**Happy Deploying! 🚀**

Nếu gặp vấn đề, đọc phần Troubleshooting hoặc liên hệ support.

