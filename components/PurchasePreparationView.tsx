import React, { useMemo } from 'react';
import { Ingredient, Order, OrderStatus, Product, Unit } from '../types';
import { ShoppingCart, Package, AlertCircle, CheckCircle } from 'lucide-react';

interface PurchasePreparationViewProps {
  orders: Order[];
  products: Product[];
  ingredients: Ingredient[];
}

interface RequiredIngredient {
  ingredient: Ingredient;
  requiredQuantity: number; // Số lượng cần cho orders
  currentStock: number; // Tồn kho hiện tại
  needToBuy: number; // Số lượng cần mua
  unit: Unit;
}

const PurchasePreparationView: React.FC<PurchasePreparationViewProps> = ({
  orders,
  products,
  ingredients
}) => {
  // Filter orders that need preparation (PENDING, IN_PROGRESS)
  const activeOrders = useMemo(() => {
    return orders.filter(
      o => o.status === OrderStatus.PENDING || o.status === OrderStatus.IN_PROGRESS
    );
  }, [orders]);

  // Calculate required ingredients
  const requiredIngredients = useMemo(() => {
    const ingredientMap = new Map<string, RequiredIngredient>();

    // Process each active order
    activeOrders.forEach(order => {
      order.items.forEach(orderItem => {
        const product = products.find(p => p.id === orderItem.productId);
        if (!product) return;

        // Calculate ingredients needed for this order item
        product.recipe.forEach(recipeItem => {
          const ingredient = ingredients.find(i => i.id === recipeItem.ingredientId);
          if (!ingredient) return;

          // Total quantity needed = recipe quantity × order quantity
          const totalNeeded = recipeItem.quantity * orderItem.quantity;

          const existing = ingredientMap.get(ingredient.id);
          if (existing) {
            existing.requiredQuantity += totalNeeded;
            existing.needToBuy = Math.max(0, existing.requiredQuantity - existing.currentStock);
          } else {
            ingredientMap.set(ingredient.id, {
              ingredient,
              requiredQuantity: totalNeeded,
              currentStock: ingredient.currentStock,
              needToBuy: Math.max(0, totalNeeded - ingredient.currentStock),
              unit: ingredient.unit
            });
          }
        });
      });
    });

    return Array.from(ingredientMap.values())
      .filter(item => item.needToBuy > 0) // Only show items that need to be purchased
      .sort((a, b) => b.needToBuy - a.needToBuy); // Sort by quantity needed (descending)
  }, [activeOrders, products, ingredients]);

  const totalItems = requiredIngredients.length;
  const totalOrders = activeOrders.length;

  return (
    <div className="p-6 max-w-7xl mx-auto pb-20 md:pb-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ShoppingCart className="text-rose-500" />
          Chuẩn Bị Nguyên Liệu Cần Mua
        </h2>
        <p className="text-gray-500 mt-1">
          Danh sách nguyên liệu cần mua để hoàn thành {totalOrders} đơn hàng đang chờ
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Đơn hàng đang chờ</p>
              <p className="text-2xl font-bold text-gray-800">{totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-lg">
              <AlertCircle className="text-amber-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Loại nguyên liệu cần mua</p>
              <p className="text-2xl font-bold text-gray-800">{totalItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tổng số lượng cần mua</p>
              <p className="text-2xl font-bold text-gray-800">
                {requiredIngredients.reduce((sum, item) => sum + item.needToBuy, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Required Ingredients List */}
      {totalOrders === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Không có đơn hàng nào cần chuẩn bị
          </h3>
          <p className="text-gray-500">
            Tất cả đơn hàng đã hoàn thành hoặc chưa có đơn hàng nào
          </p>
        </div>
      ) : totalItems === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Đủ nguyên liệu
          </h3>
          <p className="text-gray-500">
            Tồn kho hiện tại đủ để hoàn thành tất cả đơn hàng đang chờ
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-800">Danh Sách Nguyên Liệu Cần Mua</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    STT
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tên Nguyên Liệu
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">
                    Tồn Kho
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">
                    Cần Cho Đơn Hàng
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">
                    Cần Mua Thêm
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">
                    Đơn Vị
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requiredIngredients.map((item, index) => (
                  <tr key={item.ingredient.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{item.ingredient.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">
                      {item.currentStock.toLocaleString()} {item.unit}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-amber-600 text-right">
                      {item.requiredQuantity.toLocaleString()} {item.unit}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-rose-600 text-right">
                      {item.needToBuy.toLocaleString()} {item.unit}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 text-right">
                      {item.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Active Orders Summary */}
      {activeOrders.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Đơn Hàng Đang Chờ ({activeOrders.length})</h3>
          <div className="space-y-2">
            {activeOrders.map(order => (
              <div key={order.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-800">{order.customerName}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({order.items.length} sản phẩm)
                  </span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  order.status === OrderStatus.PENDING 
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchasePreparationView;

