# Hướng Dẫn Commit và Push Lên GitHub

## Tình trạng hiện tại
- Repository đã có remote: `https://github.com/hoangnamtran09/tiembanhngot.git`
- Đang ở trạng thái detached HEAD (cần chuyển về branch main)

## Các bước thực hiện

### Bước 1: Chuyển về branch main
```bash
git checkout main
```

### Bước 2: Kiểm tra các thay đổi
```bash
git status
```

### Bước 3: Thêm các file vào staging area
```bash
# Thêm tất cả các file đã thay đổi
git add .

# Hoặc thêm từng file cụ thể
git add tên_file.tsx
```

### Bước 4: Commit với message mô tả
```bash
git commit -m "Mô tả những thay đổi bạn đã làm"
```

Ví dụ:
```bash
git commit -m "Thêm tính năng quản lý đơn hàng"
git commit -m "Sửa lỗi hiển thị giá tiền"
git commit -m "Cập nhật giao diện dashboard"
```

### Bước 5: Push lên GitHub
```bash
# Push lên branch main
git push origin main

# Nếu đây là lần đầu push, có thể cần set upstream
git push -u origin main
```

## Lưu ý quan trọng

### Nếu có conflict hoặc remote có thay đổi mới hơn:
```bash
# Lấy các thay đổi mới nhất từ GitHub
git pull origin main

# Giải quyết conflict nếu có, sau đó:
git add .
git commit -m "Merge changes"
git push origin main
```

### Xem lịch sử commit:
```bash
git log --oneline
```

### Xem các thay đổi chưa commit:
```bash
git diff
```

### Undo các thay đổi chưa commit:
```bash
# Hủy thay đổi trong file cụ thể
git checkout -- tên_file.tsx

# Hủy tất cả thay đổi chưa commit
git reset --hard HEAD
```

## Quy trình làm việc hàng ngày

1. **Trước khi bắt đầu làm việc:**
   ```bash
   git pull origin main  # Lấy code mới nhất
   ```

2. **Sau khi hoàn thành tính năng:**
   ```bash
   git add .
   git commit -m "Mô tả rõ ràng"
   git push origin main
   ```

3. **Kiểm tra trạng thái:**
   ```bash
   git status
   ```

## Ví dụ workflow hoàn chỉnh

```bash
# 1. Chuyển về main và cập nhật
git checkout main
git pull origin main

# 2. Tạo branch mới cho tính năng (tùy chọn)
git checkout -b feature/tinh-nang-moi

# 3. Làm việc, chỉnh sửa code...

# 4. Commit
git add .
git commit -m "Thêm tính năng mới"

# 5. Push
git push origin feature/tinh-nang-moi

# 6. Nếu muốn merge vào main (trên GitHub hoặc local)
git checkout main
git merge feature/tinh-nang-moi
git push origin main
```
