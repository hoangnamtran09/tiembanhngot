import React from 'react';
import { LayoutDashboard, ShoppingBag, Package, BookOpen, Sparkles, ChefHat } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tổng Quan', icon: <LayoutDashboard size={20} /> },
    { id: 'orders', label: 'Đơn Hàng', icon: <ShoppingBag size={20} /> },
    { id: 'inventory', label: 'Kho Nguyên Liệu', icon: <Package size={20} /> },
    { id: 'recipes', label: 'Công Thức & Cost', icon: <BookOpen size={20} /> },
    { id: 'assistant', label: 'Trợ Lý AI', icon: <Sparkles size={20} /> },
  ];

  return (
    <div className="w-64 bg-white h-screen border-r border-rose-100 flex flex-col fixed left-0 top-0 shadow-sm z-10 hidden md:flex">
      <div className="p-6 flex items-center gap-3 border-b border-rose-50">
        <div className="bg-rose-500 p-2 rounded-lg text-white">
            <ChefHat size={24} />
        </div>
        <h1 className="text-xl font-bold text-gray-800">Tiệm Bánh</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
              activeTab === item.id
                ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                : 'text-gray-600 hover:bg-rose-50 hover:text-rose-600'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-rose-50">
        <p className="text-xs text-center text-gray-400">Version 1.0.0</p>
      </div>
    </div>
  );
};

export default Sidebar;
