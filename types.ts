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
}

export enum OrderStatus {
  PENDING = 'Chờ xử lý',
  IN_PROGRESS = 'Đang làm',
  COMPLETED = 'Hoàn thành',
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
