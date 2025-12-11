export enum Unit {
  GRAM = 'g',
  KG = 'kg',
  ML = 'ml',
  LIT = 'l',
  CAI = 'cái',
  QUA = 'quả',
  HOP = 'hộp'
}

export interface Ingredient {
  id: string;
  name: string;
  unit: Unit; // Đơn vị mua (buying unit) - VD: mua theo kg
  usageUnit: Unit; // Đơn vị sử dụng (usage unit) - VD: dùng theo g
  price: number; // Price per buying unit
  buyingQuantity: number; // The amount bought for that price (to calc unit cost)
  currentStock: number; // In usage unit (e.g. g, ml, cai)
  minThreshold: number; // Low stock alert level
}

export interface RecipeItem {
  ingredientId: string;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  sellingPrice: number;
  recipe: RecipeItem[];
  category: string;
  imageUrl?: string; // URL hình ảnh sản phẩm
}

export enum OrderStatus {
  PENDING = 'Chờ xử lý',
  IN_PROGRESS = 'Đang làm',
  COMPLETED = 'Hoàn thành',
  DELIVERED = 'Đã giao',
  CANCELLED = 'Đã hủy'
}

export enum PaymentMethod {
  CASH = 'Tiền mặt',
  TRANSFER = 'Chuyển khoản'
}

export interface PaymentInfo {
  method: PaymentMethod;
  totalAmount: number; // Tổng tiền đơn hàng
  paidAmount: number; // Đã thanh toán (dùng cho cả tiền mặt và chuyển khoản)
  remainingAmount: number; // Còn lại (tự động tính)
}

export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  deadline: string; // ISO Date
  items: OrderItem[];
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  payment?: PaymentInfo; // Thông tin thanh toán
}

export interface SalesStats {
  revenue: number;
  cost: number;
  profit: number;
  ordersCount: number;
}

export type QRTemplate = 'compact' | 'compact2' | 'qr_only' | 'print';

export interface BankSettings {
  id?: number;
  bankId: string; // Mã ngân hàng (VD: "970415")
  bankName: string;
  accountNumber: string;
  accountName: string;
  isActive: boolean;
  template: QRTemplate;
  createdAt?: string;
  updatedAt?: string;
}

// Quản lý khách hàng
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// Lịch sử mua hàng (chi phí mua nguyên liệu)
export interface PurchaseRecord {
  id: string;
  ingredientId: string;
  quantity: number; // Số lượng mua (theo buying unit)
  price: number; // Tổng tiền mua
  purchaseDate: string; // ISO Date
  supplier?: string; // Nhà cung cấp
  notes?: string;
  createdAt: string;
}

// Chi phí khác (điện, nước, ship, dụng cụ...)
export interface OtherExpense {
  id: string;
  category: string; // 'Điện', 'Nước', 'Ship', 'Dụng cụ', 'Khác'
  amount: number;
  description: string;
  expenseDate: string; // ISO Date
  createdAt: string;
}

// Xuất/Nhập kho thủ công
export interface StockTransaction {
  id: string;
  ingredientId: string;
  type: 'IN' | 'OUT'; // Nhập hoặc Xuất
  quantity: number; // Số lượng (theo usage unit)
  reason: string; // Lý do (VD: "Nhập hàng mới", "Điều chỉnh", "Hư hỏng")
  notes?: string;
  transactionDate: string; // ISO Date
  createdAt: string;
}
