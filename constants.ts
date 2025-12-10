import { Ingredient, Order, OrderStatus, Product, Unit } from './types';

export const INITIAL_INGREDIENTS: Ingredient[] = [
  { id: '1', name: 'Bột mì đa dụng', unit: Unit.KG, price: 20000, buyingQuantity: 1, currentStock: 5000, minThreshold: 1000 },
  { id: '2', name: 'Trứng gà', unit: Unit.QUA, price: 35000, buyingQuantity: 10, currentStock: 24, minThreshold: 10 },
  { id: '3', name: 'Đường cát', unit: Unit.KG, price: 22000, buyingQuantity: 1, currentStock: 2000, minThreshold: 500 },
  { id: '4', name: 'Sữa tươi không đường', unit: Unit.ML, price: 32000, buyingQuantity: 1000, currentStock: 800, minThreshold: 200 },
  { id: '5', name: 'Bơ lạt', unit: Unit.KG, price: 250000, buyingQuantity: 1, currentStock: 400, minThreshold: 100 },
  { id: '6', name: 'Chocolate đen 70%', unit: Unit.KG, price: 300000, buyingQuantity: 1, currentStock: 300, minThreshold: 100 },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Bánh Mousse Chocolate',
    description: 'Bánh mousse mềm mịn vị chocolate đậm đà',
    sellingPrice: 85000,
    category: 'Mousse',
    recipe: [
      { ingredientId: '6', quantity: 50 }, // 50g chocolate
      { ingredientId: '4', quantity: 100 }, // 100ml milk
      { ingredientId: '3', quantity: 20 }, // 20g sugar
      { ingredientId: '5', quantity: 10 }, // 10g butter
    ]
  },
  {
    id: 'p2',
    name: 'Bánh Bông Lan Trứng Muối',
    description: 'Cốt bánh mềm xốp, sốt phô mai béo ngậy',
    sellingPrice: 120000,
    category: 'Cake',
    recipe: [
      { ingredientId: '1', quantity: 150 }, // 150g flour
      { ingredientId: '2', quantity: 3 }, // 3 eggs
      { ingredientId: '3', quantity: 50 }, // 50g sugar
      { ingredientId: '5', quantity: 30 }, // 30g butter
    ]
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'o1',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0901234567',
    deadline: new Date(Date.now() + 86400000).toISOString(),
    status: OrderStatus.PENDING,
    createdAt: new Date().toISOString(),
    items: [
      { productId: 'p1', quantity: 2 }
    ]
  },
  {
    id: 'o2',
    customerName: 'Trần Thị B',
    customerPhone: '0912345678',
    deadline: new Date(Date.now() - 86400000).toISOString(),
    status: OrderStatus.COMPLETED,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    items: [
      { productId: 'p2', quantity: 1 },
      { productId: 'p1', quantity: 1 }
    ]
  }
];
