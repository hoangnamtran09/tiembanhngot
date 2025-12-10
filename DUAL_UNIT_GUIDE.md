# 📏 Hướng Dẫn Hệ Thống 2 Đơn Vị

## 🎯 Tổng Quan

Hệ thống hỗ trợ **2 đơn vị** cho mỗi nguyên liệu:
- **Đơn vị mua** (Buying Unit): Đơn vị khi mua nguyên liệu
- **Đơn vị sử dụng** (Usage Unit): Đơn vị khi nhập vào công thức

## 💡 Tại Sao Cần 2 Đơn Vị?

### Ví Dụ Thực Tế:

**Bột mì:**
- 💵 **Mua**: 1kg = 20,000đ (mua theo kg)
- 📝 **Dùng**: 150g trong công thức (nhập theo gram)

**Sữa tươi:**
- 💵 **Mua**: 1L = 32,000đ (mua theo lít)
- 📝 **Dùng**: 100ml trong công thức (nhập theo ml)

**Trứng gà:**
- 💵 **Mua**: 10 quả = 35,000đ (mua theo chục)
- 📝 **Dùng**: 3 quả trong công thức (nhập theo quả)

→ **Lợi ích**: Linh hoạt, dễ nhập liệu, tính toán chính xác!

---

## 🔄 Chuyển Đổi Tự Động

Hệ thống tự động chuyển đổi giữa các đơn vị:

### Weight (Cân nặng):
- **1kg = 1000g**
- **1g = 0.001kg**

### Volume (Thể tích):
- **1L = 1000ml**
- **1ml = 0.001L**

### Countable (Đếm được):
- **cái, quả, hộp**: Giữ nguyên (1:1)

---

## 📝 Cách Sử Dụng

### 1. **Thêm Nguyên Liệu Mới**

```
1. Vào "Kho Nguyên Liệu" → "Thêm Nguyên Liệu"
2. Điền thông tin:
   - Tên: "Bột mì đa dụng"
   - Đơn vị mua: "kg" (mua theo kg)
   - Đơn vị sử dụng: "g" (dùng theo gram)
   - Giá nhập: 20000 (cho 1kg)
   - Số lượng mua: 1 (1kg)
   - Tồn kho: 5000 (5000g = 5kg)
3. Lưu
```

**Kết quả:**
- Mua: 1kg = 20,000đ
- Tồn kho: 5,000g
- Giá vốn: 20đ/g (tự động tính)

### 2. **Nhập Công Thức**

```
1. Vào "Công Thức" → Chọn sản phẩm
2. Click "Thêm nguyên liệu"
3. Chọn "Bột mì đa dụng"
4. Nhập số lượng: 150 (gram)
   → Hiển thị: "150 g"
   → Tooltip: "(Mua: kg)"
5. Giá vốn tự động tính: 150 × 20đ = 3,000đ
```

### 3. **Xem Chuẩn Bị Nguyên Liệu**

```
1. Vào "Chuẩn Bị Nguyên Liệu"
2. Hệ thống tính:
   - Cần: 500g (theo đơn vị sử dụng)
   - Cần mua: 0.5kg (tự động convert sang đơn vị mua)
3. Mua theo đơn vị mua: 0.5kg
```

---

## 📊 Ví Dụ Chi Tiết

### **Scenario 1: Bột Mì**

**Setup:**
```
Tên: Bột mì đa dụng
Đơn vị mua: kg
Đơn vị sử dụng: g
Giá: 20,000đ/1kg
Tồn kho: 5,000g
```

**Trong công thức:**
```
Bánh bông lan cần: 150g bột mì
→ Giá vốn: (20,000đ / 1,000g) × 150g = 3,000đ
```

**Khi mua thêm:**
```
Mua: 2kg = 40,000đ
→ Tồn kho mới: 5,000g + 2,000g = 7,000g
```

### **Scenario 2: Sữa Tươi**

**Setup:**
```
Tên: Sữa tươi không đường
Đơn vị mua: L (lít)
Đơn vị sử dụng: ml
Giá: 32,000đ/1L
Tồn kho: 800ml
```

**Trong công thức:**
```
Bánh mousse cần: 100ml sữa
→ Giá vốn: (32,000đ / 1,000ml) × 100ml = 3,200đ
```

---

## 🎨 UI Indicators

### **Bảng Nguyên Liệu:**
```
Tên          | Tồn Kho | Đơn Vị Mua | Đơn Vị Sử Dụng | Giá Mua | Giá Vốn/ĐV
Bột mì       | 5,000g  | 1kg        | g (Mua: kg)    | 20,000đ | 20đ/g
```

### **Form Nhập:**
```
┌─────────────────────────────┐
│ Đơn vị mua: [kg ▼]          │
│ 💵 Đơn vị khi mua nguyên liệu│
├─────────────────────────────┤
│ Đơn vị sử dụng: [g ▼]       │
│ 📝 Đơn vị khi nhập vào công thức│
│ ℹ️ Tự động chuyển đổi: 1kg = 1000g│
└─────────────────────────────┘
```

### **Công Thức:**
```
Bột mì đa dụng
Giá gốc: 20đ / g (Mua: kg)
[150] g
```

---

## ⚙️ Logic Tính Toán

### **Tính Giá Vốn:**

```typescript
// Step 1: Giá mỗi đơn vị mua
costPerBuyingUnit = price / buyingQuantity
// VD: 20,000đ / 1kg = 20,000đ/kg

// Step 2: Conversion factor
factor = getUnitConversionFactor(buyingUnit, usageUnit)
// VD: kg → g = 1000

// Step 3: Giá mỗi đơn vị sử dụng
costPerUsageUnit = costPerBuyingUnit / factor
// VD: 20,000đ / 1000 = 20đ/g

// Step 4: Giá vốn cho số lượng dùng
totalCost = costPerUsageUnit × quantity
// VD: 20đ/g × 150g = 3,000đ
```

### **Tính Số Lượng Cần Mua:**

```typescript
// Cần cho đơn hàng (theo usageUnit)
required = 500g

// Tồn kho hiện tại (theo usageUnit)
stock = 200g

// Cần mua thêm (theo usageUnit)
needToBuy = 500g - 200g = 300g

// Convert sang đơn vị mua
needToBuyInBuyingUnit = 300g / 1000 = 0.3kg
```

---

## ✅ Best Practices

### 1. **Chọn Đơn Vị Phù Hợp**

**Đơn vị mua:**
- ✅ Chọn đơn vị bạn thường mua
- ✅ VD: kg (không phải g), L (không phải ml)

**Đơn vị sử dụng:**
- ✅ Chọn đơn vị dễ nhập trong công thức
- ✅ VD: g (không phải kg), ml (không phải L)

### 2. **Nhất Quán**

- ✅ Tất cả nguyên liệu cùng loại dùng cùng đơn vị sử dụng
- ✅ VD: Tất cả bột → dùng "g", tất cả chất lỏng → dùng "ml"

### 3. **Kiểm Tra Conversion**

- ✅ Sau khi nhập, check giá vốn có hợp lý không
- ✅ VD: 150g bột mì = 3,000đ (hợp lý)

---

## 🐛 Troubleshooting

### **Giá vốn quá cao/thấp?**
→ Kiểm tra conversion factor có đúng không
→ Verify đơn vị mua và đơn vị sử dụng

### **Số lượng không khớp?**
→ Đảm bảo tồn kho nhập theo đơn vị sử dụng
→ Check conversion khi mua thêm

### **Không chuyển đổi được?**
→ Kiểm tra 2 đơn vị có cùng loại không (weight/volume/count)
→ Xem `unitConverter.ts` để thêm conversion mới

---

## 📚 Technical Details

### **Database:**
```sql
ingredients (
  unit TEXT,        -- Đơn vị mua
  usage_unit TEXT,  -- Đơn vị sử dụng
  current_stock DECIMAL, -- Tồn kho theo usage_unit
  ...
)
```

### **TypeScript:**
```typescript
interface Ingredient {
  unit: Unit;        // Đơn vị mua
  usageUnit: Unit;   // Đơn vị sử dụng
  currentStock: number; // Theo usageUnit
}
```

### **Conversion Functions:**
- `getUnitConversionFactor()` - Lấy hệ số chuyển đổi
- `convertToUsageUnit()` - Convert sang đơn vị sử dụng
- `convertToBuyingUnit()` - Convert sang đơn vị mua

---

**Version:** 1.5.0  
**Last Updated:** December 10, 2024

