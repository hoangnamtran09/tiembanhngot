import React, { useState, useEffect, useMemo } from 'react';
import { Order, OrderStatus, Product, PurchaseRecord } from '../types';
import { StorageService } from '../services/storageService';
import { DollarSign, TrendingUp, TrendingDown, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '../utils/format';

interface CashFlowViewProps {
  orders: Order[];
  products: Product[];
}

const CashFlowView: React.FC<CashFlowViewProps> = ({ orders, products }) => {
  const [purchaseRecords, setPurchaseRecords] = useState<PurchaseRecord[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const purchases = await StorageService.getPurchaseRecords();
    setPurchaseRecords(purchases);
  };

  // Calculate revenue from completed and delivered orders
  const totalRevenue = useMemo(() => {
    const completedOrders = orders.filter(o => 
      o.status === OrderStatus.COMPLETED || o.status === OrderStatus.DELIVERED
    );
    return completedOrders.reduce((total, order) => {
      return total + order.items.reduce((sum, item) => {
        const product = products.find(p => p.id === item.productId);
        return sum + (product ? product.sellingPrice * item.quantity : 0);
      }, 0);
    }, 0);
  }, [orders, products]);

  // Calculate total spent on purchases
  const totalPurchaseCost = useMemo(() => {
    return purchaseRecords.reduce((sum, record) => sum + record.price, 0);
  }, [purchaseRecords]);

  // Calculate available cash (revenue - purchases)
  const availableCash = totalRevenue - totalPurchaseCost;

  // Recent transactions
  const recentTransactions = useMemo(() => {
    const transactions: Array<{
      type: 'revenue' | 'purchase' | 'expense';
      date: string;
      amount: number;
      description: string;
      isPositive: boolean;
    }> = [];

    // Add revenue transactions
    const completedOrders = orders.filter(o => 
      o.status === OrderStatus.COMPLETED || o.status === OrderStatus.DELIVERED
    );
    completedOrders.forEach(order => {
      const orderTotal = order.items.reduce((sum, item) => {
        const product = products.find(p => p.id === item.productId);
        return sum + (product ? product.sellingPrice * item.quantity : 0);
      }, 0);
      transactions.push({
        type: 'revenue',
        date: order.createdAt,
        amount: orderTotal,
        description: `Đơn hàng: ${order.customerName}`,
        isPositive: true
      });
    });

    // Add purchase transactions
    purchaseRecords.forEach(record => {
      transactions.push({
        type: 'purchase',
        date: record.purchaseDate,
        amount: record.price,
        description: `Mua nguyên liệu`,
        isPositive: false
      });
    });

    return transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20);
  }, [orders, products, purchaseRecords]);

  return (
    <div className="p-6 max-w-7xl mx-auto h-screen flex flex-col pb-20 md:pb-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Quản Lý Dòng Tiền</h2>
        <p className="text-sm text-gray-600 mt-1">Theo dõi tiền thu từ bán hàng và chi phí mua nguyên liệu</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 font-medium">Tổng Thu</span>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="text-green-600" size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-gray-500 mt-1">Từ đơn hàng đã hoàn thành</p>
        </div>

        {/* Total Purchases */}
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 font-medium">Đã Mua Nguyên Liệu</span>
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCart className="text-blue-600" size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPurchaseCost)}</p>
          <p className="text-xs text-gray-500 mt-1">Chi phí mua nguyên liệu</p>
        </div>

        {/* Available Cash */}
        <div className={`p-5 rounded-lg border-2 ${
          availableCash >= 0 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: availableCash >= 0 ? '#059669' : '#dc2626' }}>
              Tiền Còn Lại
            </span>
            <div className={`p-2 rounded-lg ${availableCash >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <DollarSign className={availableCash >= 0 ? 'text-green-600' : 'text-red-600'} size={20} />
            </div>
          </div>
          <p className={`text-2xl font-bold ${availableCash >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {formatCurrency(availableCash)}
          </p>
          <p className="text-xs mt-1" style={{ color: availableCash >= 0 ? '#059669' : '#dc2626' }}>
            Có thể dùng để mua nguyên liệu
          </p>
        </div>
      </div>

      {/* Cash Flow Visualization */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Dòng Tiền</h3>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Thu vào</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-gray-600">Chi ra</span>
              </div>
            </div>
            <div className="flex items-center gap-2 h-8 bg-gray-100 rounded-lg overflow-hidden">
              {totalRevenue > 0 && (
                <div
                  className="bg-green-500 h-full flex items-center justify-end pr-2"
                  style={{ width: `${(totalRevenue / (totalRevenue + totalPurchaseCost || 1)) * 100}%` }}
                >
                  {totalRevenue > 0 && (
                    <span className="text-xs font-semibold text-white">
                      {formatCurrency(totalRevenue)}
                    </span>
                  )}
                </div>
              )}
              {totalPurchaseCost > 0 && (
                <div
                  className="bg-blue-500 h-full flex items-center justify-end pr-2"
                  style={{ width: `${(totalPurchaseCost / (totalRevenue + totalPurchaseCost || 1)) * 100}%` }}
                >
                  {totalPurchaseCost > 0 && (
                    <span className="text-xs font-semibold text-white">
                      {formatCurrency(totalPurchaseCost)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg border border-gray-200 flex-1 overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h3 className="text-lg font-bold text-gray-900">Giao Dịch Gần Đây</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction, index) => (
              <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      transaction.isPositive ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.isPositive ? (
                        <TrendingUp className="text-green-600" size={18} />
                      ) : (
                        <TrendingDown className="text-red-600" size={18} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.date).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${
                    transaction.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.isPositive ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-400">
              Chưa có giao dịch nào
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashFlowView;

