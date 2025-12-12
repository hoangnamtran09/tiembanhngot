# 🚀 Hướng Dẫn Deploy Lên GitHub và Vercel

## 📋 Mục Lục
1. [Push Code Lên GitHub](#1-push-code-lên-github)
2. [Deploy Lên Vercel](#2-deploy-lên-vercel)
3. [Troubleshooting](#3-troubleshooting)

---

## 1. Push Code Lên GitHub

### Bước 1: Kiểm tra trạng thái hiện tại

```bash
cd "/Users/macbook/HOANG NAM/tiembanhngot"
git status
```

### Bước 2: Chuyển về branch main (nếu đang ở detached HEAD)

```bash
git checkout main
```

### Bước 3: Đồng bộ với remote (nếu có thay đổi trên GitHub)

```bash
git pull origin main
```

**Nếu có conflict:**
- Git sẽ báo conflict
- Mở file bị conflict, tìm dòng `<<<<<<<`, `=======`, `>>>>>>>`
- Sửa xong, chạy:
```bash
git add .
git commit -m "Merge changes from remote"
```

### Bước 4: Thêm các file thay đổi

```bash
# Xem các file đã thay đổi
git status

# Thêm tất cả file
git add .

# Hoặc thêm từng file cụ thể
git add tên_file.tsx
```

### Bước 5: Commit với message mô tả

```bash
git commit -m "Mô tả những gì bạn đã làm"
```

**Ví dụ message tốt:**
```bash
git commit -m "Thêm tính năng quản lý đơn hàng"
git commit -m "Sửa lỗi hiển thị giá tiền"
git commit -m "Cập nhật giao diện dashboard"
git commit -m "Thêm hướng dẫn deploy"
```

### Bước 6: Push lên GitHub

```bash
# Push lên branch main
git push origin main
```

**Nếu lần đầu push:**
```bash
git push -u origin main
```

### Bước 7: Xác nhận

- Truy cập: https://github.com/hoangnamtran09/tiembanhngot
- Kiểm tra code đã được push thành công

---

## 2. Deploy Lên Vercel

### Cách 1: Deploy Qua Vercel Dashboard (Khuyên dùng)

#### Bước 1: Tạo tài khoản Vercel

1. Truy cập: https://vercel.com
2. Click **"Sign Up"**
3. Chọn **"Continue with GitHub"**
4. Authorize Vercel truy cập GitHub

#### Bước 2: Import Project

1. Vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Chọn repository `tiembanhngot`
5. Click **"Import"**

#### Bước 3: Cấu hình Project

Vercel tự động detect Vite, kiểm tra:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

✅ **Giữ nguyên các giá trị mặc định!**

#### Bước 4: Thêm Environment Variables (QUAN TRỌNG!)

**Trước khi deploy, PHẢI thêm các biến môi trường:**

1. Mở rộng phần **"Environment Variables"**
2. Thêm các biến sau:

| Name | Value | Lấy từ đâu |
|------|-------|------------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase Dashboard > Settings > API |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase Dashboard > Settings > API |
| `VITE_GEMINI_API_KEY` | `AIza...` | (Optional) Nếu dùng AI Assistant |

**Cách lấy Supabase keys:**
1. Vào https://supabase.com/dashboard
2. Chọn project của bạn
3. Vào **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

#### Bước 5: Deploy!

1. Click **"Deploy"**
2. Đợi 2-3 phút
3. 🎉 **Xong!** Website đã live!

#### Bước 6: Truy cập Website

- Vercel tự động tạo URL: `https://tiembanhngot.vercel.app`
- Hoặc URL tùy chỉnh: `https://tiembanhngot-[username].vercel.app`
- Click vào URL để xem website

---

### Cách 2: Deploy Qua Vercel CLI

#### Bước 1: Cài đặt Vercel CLI

```bash
npm install -g vercel
```

#### Bước 2: Login

```bash
vercel login
```

#### Bước 3: Deploy

```bash
# Deploy lên production
vercel --prod

# Hoặc deploy preview
vercel
```

#### Bước 4: Thêm Environment Variables

```bash
# Thêm từng biến
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_GEMINI_API_KEY

# Sau đó redeploy
vercel --prod
```

---

### Cách 3: Dùng Script Tự Động

```bash
# Chạy script deploy
chmod +x deploy-vercel.sh
./deploy-vercel.sh
```

Script sẽ tự động:
- Kiểm tra git status
- Commit thay đổi (nếu có)
- Push lên GitHub
- Deploy lên Vercel

---

## 3. Auto Deploy (CI/CD)

**Vercel tự động deploy mỗi khi bạn push code mới!**

### Workflow:

```bash
# 1. Làm thay đổi trong code
# ... chỉnh sửa file ...

# 2. Commit và push
git add .
git commit -m "Update features"
git push origin main

# 3. ✅ Vercel tự động build và deploy!
```

**Xem progress:**
- Vào Vercel Dashboard
- Click vào project
- Xem tab **"Deployments"**

---

## 4. Troubleshooting

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
1. Test build local trước:
```bash
npm run build
npm run preview
```

2. Nếu build local thành công nhưng Vercel fail:
   - Xem build logs trong Vercel
   - Kiểm tra Node version (Vercel dùng Node 18+)

3. Fix lỗi, push lại:
```bash
git add .
git commit -m "Fix build errors"
git push origin main
```

---

### ❌ Lỗi: "Push rejected" hoặc "Permission denied"

**Nguyên nhân:** Không có quyền push hoặc remote URL sai

**Giải pháp:**
1. Kiểm tra remote URL:
```bash
git remote -v
```

2. Nếu sai, sửa lại:
```bash
git remote set-url origin https://github.com/hoangnamtran09/tiembanhngot.git
```

3. Nếu cần authentication:
   - Dùng Personal Access Token (GitHub Settings → Developer settings → Personal access tokens)
   - Hoặc setup SSH key

---

### ❌ Lỗi: "Branch diverged"

**Nguyên nhân:** Local và remote có commit khác nhau

**Giải pháp:**
```bash
# Pull và merge
git pull origin main --no-rebase

# Hoặc rebase (nếu muốn history sạch hơn)
git pull origin main --rebase

# Sau đó push lại
git push origin main
```

---

## 5. Checklist Trước Khi Deploy

Trước khi deploy, kiểm tra:

- [ ] Code đã test kỹ local (`npm run dev`)
- [ ] Build thành công (`npm run build`)
- [ ] Preview OK (`npm run preview`)
- [ ] Database schema đã chạy trong Supabase
- [ ] `.gitignore` có `.env.local` (không commit env file)
- [ ] `package.json` có đầy đủ dependencies
- [ ] Environment variables đã chuẩn bị sẵn
- [ ] GitHub repo accessible
- [ ] Đã commit và push code lên GitHub

---

## 6. Quick Commands Reference

### Git Commands

```bash
# Kiểm tra trạng thái
git status

# Xem lịch sử commit
git log --oneline

# Thêm file
git add .

# Commit
git commit -m "Message"

# Push
git push origin main

# Pull (lấy code mới)
git pull origin main

# Xem các branch
git branch -a

# Tạo branch mới
git checkout -b feature/tên-tính-năng
```

### Vercel Commands

```bash
# Login
vercel login

# Deploy preview
vercel

# Deploy production
vercel --prod

# Xem logs
vercel logs

# List projects
vercel projects list
```

---

## 7. Workflow Hàng Ngày

### Khi bắt đầu làm việc:

```bash
# 1. Lấy code mới nhất
git pull origin main

# 2. Tạo branch mới (nếu cần)
git checkout -b feature/tính-năng-mới
```

### Khi hoàn thành tính năng:

```bash
# 1. Kiểm tra thay đổi
git status

# 2. Thêm file
git add .

# 3. Commit
git commit -m "Mô tả rõ ràng"

# 4. Push
git push origin main

# 5. ✅ Vercel tự động deploy!
```

---

## 8. Kết Quả

Sau khi hoàn thành:

✅ Code đã được push lên GitHub  
✅ Website live tại: `https://tiembanhngot.vercel.app`  
✅ Auto deploy khi push code  
✅ HTTPS/SSL miễn phí  
✅ CDN toàn cầu  

**Deploy time:** ~2-3 phút  
**Cost:** **FREE** (Vercel Hobby plan)

---

## 📞 Hỗ Trợ

- **GitHub Issues:** https://github.com/hoangnamtran09/tiembanhngot/issues
- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs

---

**Happy Deploying! 🚀**
