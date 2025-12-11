import React from 'react';
import { LayoutDashboard, ShoppingBag, Package, BookOpen, Sparkles, ChefHat, Settings, ShoppingCart, TrendingUp, Users, ArrowDownUp, Receipt, DollarSign, Wallet } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tổng Quan', icon: <LayoutDashboard size={20} /> },
    { id: 'orders', label: 'Đơn Hàng', icon: <ShoppingBag size={20} /> },
    { id: 'customers', label: 'Khách Hàng', icon: <Users size={20} /> },
    { id: 'inventory', label: 'Kho Nguyên Liệu', icon: <Package size={20} /> },
    { id: 'stock-transactions', label: 'Xuất/Nhập Kho', icon: <ArrowDownUp size={20} /> },
    { id: 'recipes', label: 'Công Thức', icon: <BookOpen size={20} /> },
    { id: 'purchase-records', label: 'Lịch Sử Mua Hàng', icon: <Receipt size={20} /> },
    { id: 'cash-flow', label: 'Quản Lý Dòng Tiền', icon: <Wallet size={20} /> },
    { id: 'revenue', label: 'Báo Cáo Doanh Thu', icon: <TrendingUp size={20} /> },
    { id: 'assistant', label: 'Trợ Lý AI', icon: <Sparkles size={20} /> },
    { id: 'settings', label: 'Cài Đặt Ngân Hàng', icon: <Settings size={20} /> },
  ];

  return (
    <div className="w-64 bg-white h-screen border-r border-gray-200 flex flex-col fixed left-0 top-0 z-10 hidden md:flex">
      <div className="p-6 flex items-center gap-3 border-b border-gray-200">
        <div className="bg-gray-900 p-2 rounded-lg text-white">
            <ChefHat size={24} />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Tiệm Bánh</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm ${
              activeTab === item.id
                ? 'bg-gray-900 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-center text-gray-500">Version 1.0.0</p>
      </div>
    </div>
  );
};

export default Sidebar;
