import React, { useMemo, useState } from 'react';
import { Order, OrderStatus, Product, Ingredient } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts';
import { TrendingUp, DollarSign, Calendar, Filter } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../utils/format';
import { getUnitConversionFactor } from '../utils/unitConverter';

interface RevenueReportViewProps {
  orders: Order[];
  products: Product[];
  ingredients: Ingredient[];
}

type TimeRange = 'today' | 'week' | 'month' | 'all';

const RevenueReportView: React.FC<RevenueReportViewProps> = ({
  orders,
  products,
  ingredients
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  // Filter completed orders by time range
  const filteredOrders = useMemo(() => {
    const completed = orders.filter(o => o.status === OrderStatus.COMPLETED);
    
    if (timeRange === 'all') return completed;

    const now = new Date();
    const filterDate = new Date();

    switch (timeRange) {
      case 'today':
        filterDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
    }

    return completed.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= filterDate;
    });
  }, [orders, timeRange]);

  // Calculate revenue, cost, profit
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalCost = 0;

    filteredOrders.forEach(order => {
      // Revenue from order
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          totalRevenue += product.sellingPrice * item.quantity;
        }
      });

      // Cost calculation
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          product.recipe.forEach(recipeItem => {
            const ingredient = ingredients.find(i => i.id === recipeItem.ingredientId);
            if (ingredient && ingredient.buyingQuantity > 0) {
              // Calculate cost per buying unit
              const costPerBuyingUnit = ingredient.price / ingredient.buyingQuantity;
              
              // Convert to usage unit cost
              const usageUnit = ingredient.usageUnit || ingredient.unit;
              const conversionFactor = getUnitConversionFactor(ingredient.unit, usageUnit);
              const costPerUsageUnit = costPerBuyingUnit / conversionFactor;
              
              // recipeItem.quantity is in usageUnit
              totalCost += costPerUsageUnit * recipeItem.quantity * item.quantity;
            }
          });
        }
      });
    });

    const totalProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return {
      revenue: totalRevenue,
      cost: totalCost,
      profit: totalProfit,
      profitMargin,
      ordersCount: filteredOrders.length
    };
  }, [filteredOrders, products, ingredients]);

  // Chart data - Daily revenue
  const chartData = useMemo(() => {
    const dailyMap = new Map<string, { revenue: number; cost: number; profit: number }>();

    filteredOrders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      const dayKey = date.slice(5); // MM-DD

      let dayRevenue = 0;
      let dayCost = 0;

      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          dayRevenue += product.sellingPrice * item.quantity;

          product.recipe.forEach(recipeItem => {
            const ingredient = ingredients.find(i => i.id === recipeItem.ingredientId);
            if (ingredient && ingredient.buyingQuantity > 0) {
              // Calculate cost per buying unit
              const costPerBuyingUnit = ingredient.price / ingredient.buyingQuantity;
              
              // Convert to usage unit cost
              const usageUnit = ingredient.usageUnit || ingredient.unit;
              const conversionFactor = getUnitConversionFactor(ingredient.unit, usageUnit);
              const costPerUsageUnit = costPerBuyingUnit / conversionFactor;
              
              // recipeItem.quantity is in usageUnit
              dayCost += costPerUsageUnit * recipeItem.quantity * item.quantity;
            }
          });
        }
      });

      const existing = dailyMap.get(dayKey) || { revenue: 0, cost: 0, profit: 0 };
      dailyMap.set(dayKey, {
        revenue: existing.revenue + dayRevenue,
        cost: existing.cost + dayCost,
        profit: existing.profit + (dayRevenue - dayCost)
      });
    });

    return Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14); // Last 14 days
  }, [filteredOrders, products, ingredients]);

  // Top products by revenue
  const topProducts = useMemo(() => {
    const productMap = new Map<string, { name: string; revenue: number; quantity: number }>();

    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const existing = productMap.get(product.id) || {
            name: product.name,
            revenue: 0,
            quantity: 0
          };
          productMap.set(product.id, {
            ...existing,
            revenue: existing.revenue + product.sellingPrice * item.quantity,
            quantity: existing.quantity + item.quantity
          });
        }
      });
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredOrders, products]);

  return (
    <div className="p-6 max-w-7xl mx-auto pb-20 md:pb-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="text-rose-500" />
            Báo Cáo Doanh Thu & Lợi Nhuận
          </h2>
          <p className="text-gray-500 mt-1">Phân tích hiệu quả kinh doanh</p>
        </div>

        {/* Time Range Filter */}
        <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
          {(['today', 'week', 'month', 'all'] as TimeRange[]).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-rose-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {range === 'today' ? 'Hôm nay' : 
               range === 'week' ? '7 ngày' :
               range === 'month' ? '30 ngày' : 'Tất cả'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 shadow-sm border border-green-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-green-700 font-medium">Doanh Thu</span>
            <DollarSign className="text-green-600" size={20} />
          </div>
          <p className="text-2xl font-bold text-green-700">
            {formatCurrency(stats.revenue)}
          </p>
          <p className="text-xs text-green-600 mt-1">
            {stats.ordersCount} đơn hàng
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-5 shadow-sm border border-red-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-red-700 font-medium">Chi Phí</span>
            <TrendingUp className="text-red-600 rotate-180" size={20} />
          </div>
          <p className="text-2xl font-bold text-red-700">
            {formatCurrency(stats.cost)}
          </p>
          <p className="text-xs text-red-600 mt-1">
            Giá vốn nguyên liệu
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 shadow-sm border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-700 font-medium">Lợi Nhuận</span>
            <TrendingUp className="text-blue-600" size={20} />
          </div>
          <p className="text-2xl font-bold text-blue-700">
            {formatCurrency(stats.profit)}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {stats.profitMargin.toFixed(1)}% margin
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 shadow-sm border border-purple-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-purple-700 font-medium">Đơn Hàng</span>
            <Calendar className="text-purple-600" size={20} />
          </div>
          <p className="text-2xl font-bold text-purple-700">
            {stats.ordersCount}
          </p>
          <p className="text-xs text-purple-600 mt-1">
            Đã hoàn thành
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Doanh Thu Theo Ngày</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
              />
              <Bar dataKey="revenue" fill="#f43f5e" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Profit Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Lợi Nhuận Theo Ngày</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#f43f5e" name="Doanh thu" />
              <Line type="monotone" dataKey="cost" stroke="#ef4444" name="Chi phí" />
              <Line type="monotone" dataKey="profit" stroke="#22c55e" name="Lợi nhuận" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Top 5 Sản Phẩm Bán Chạy</h3>
        <div className="space-y-3">
          {topProducts.length > 0 ? (
            topProducts.map((product, index) => {
              const percentage = stats.revenue > 0 
                ? (product.revenue / stats.revenue) * 100 
                : 0;
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-gray-800">{product.name}</span>
                      <span className="text-sm font-bold text-rose-600">
                        {formatCurrency(product.revenue)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-rose-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-16 text-right">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Đã bán: {product.quantity} sản phẩm
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-400 py-8">
              Chưa có dữ liệu bán hàng
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevenueReportView;

