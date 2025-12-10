import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Ingredient, Order, OrderStatus, Product } from '../types';
import { TrendingUp, DollarSign, ShoppingBag } from 'lucide-react';

interface DashboardProps {
  orders: Order[];
  products: Product[];
  ingredients: Ingredient[];
}

const Dashboard: React.FC<DashboardProps> = ({ orders, products, ingredients }) => {
  // --- Calculation Logic ---
  
  // 1. Calculate Revenue, Cost, Profit from COMPLETED orders only
  const completedOrders = orders.filter(o => o.status === OrderStatus.COMPLETED);
  
  let totalRevenue = 0;
  let totalCost = 0;

  completedOrders.forEach(order => {
    order.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        totalRevenue += product.sellingPrice * item.quantity;
        
        // Calculate product cost
        const productCost = product.recipe.reduce((acc, recipeItem) => {
          const ing = ingredients.find(i => i.id === recipeItem.ingredientId);
          if (ing && ing.buyingQuantity > 0) {
            const unitCost = ing.price / ing.buyingQuantity;
            return acc + (unitCost * recipeItem.quantity);
          }
          return acc;
        }, 0);
        
        totalCost += productCost * item.quantity;
      }
    });
  });

  const totalProfit = totalRevenue - totalCost;

  // 2. Chart Data: Revenue last 7 days (Mock logic for simplicity if dates are scarce, else real)
  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const chartData = last7Days.map(dateStr => {
    const daysOrders = completedOrders.filter(o => o.deadline.startsWith(dateStr) || o.createdAt.startsWith(dateStr)); // Using deadline as "sale date" approx
    const revenue = daysOrders.reduce((acc, order) => {
        return acc + order.items.reduce((sum, item) => {
            const p = products.find(prod => prod.id === item.productId);
            return sum + (p ? p.sellingPrice * item.quantity : 0);
        }, 0);
    }, 0);
    return { name: dateStr.slice(5), revenue }; // MM-DD
  });

  // 4. Product Popularity Data
  const productSales: {[key: string]: number} = {};
  completedOrders.forEach(o => {
      o.items.forEach(i => {
          const pName = products.find(p => p.id === i.productId)?.name || 'Unknown';
          productSales[pName] = (productSales[pName] || 0) + i.quantity;
      });
  });
  
  const pieData = Object.keys(productSales).map(key => ({
      name: key,
      value: productSales[key]
  })).sort((a,b) => b.value - a.value).slice(0, 5); // Top 5

  const COLORS = ['#f43f5e', '#fb923c', '#fbbf24', '#a3e635', '#22d3ee'];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20 md:pb-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Tổng Quan Kinh Doanh</h2>
        <p className="text-gray-500">Theo dõi hiệu quả hoạt động của tiệm bánh</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-100 flex items-center justify-between">
            <div>
                <p className="text-gray-500 font-medium text-sm">Doanh Thu (Thực tế)</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{totalRevenue.toLocaleString()} đ</h3>
            </div>
            <div className="p-3 bg-rose-50 rounded-full text-rose-500">
                <DollarSign size={24} />
            </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100 flex items-center justify-between">
            <div>
                <p className="text-gray-500 font-medium text-sm">Lợi Nhuận Ước Tính</p>
                <h3 className="text-2xl font-bold text-green-600 mt-1">{totalProfit.toLocaleString()} đ</h3>
                <p className="text-xs text-green-500 mt-1">Margin: {totalRevenue > 0 ? ((totalProfit/totalRevenue)*100).toFixed(1) : 0}%</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full text-green-500">
                <TrendingUp size={24} />
            </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 flex items-center justify-between">
            <div>
                <p className="text-gray-500 font-medium text-sm">Đơn Hoàn Thành</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{completedOrders.length}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-full text-blue-500">
                <ShoppingBag size={24} />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h3 className="font-bold text-gray-800 mb-6">Doanh Thu 7 Ngày Qua</h3>
             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0"/>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(value) => `${value/1000}k`} />
                        <Tooltip 
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                            formatter={(value: number) => [`${value.toLocaleString()} đ`, 'Doanh thu']}
                        />
                        <Bar dataKey="revenue" fill="#fb7185" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Pie Chart / Top Products */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h3 className="font-bold text-gray-800 mb-2">Sản Phẩm Bán Chạy</h3>
             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                </ResponsiveContainer>
             </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
