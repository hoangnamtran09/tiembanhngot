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
  unit: Unit;
  price: number; // Price per buying unit
  buyingQuantity: number; // The amount bought for that price (to calc unit cost)
  currentStock: number; // In base unit (e.g. g, ml, cai)
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
}

export interface SalesStats {
  revenue: number;
  cost: number;
  profit: number;
  ordersCount: number;
}
