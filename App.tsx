import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import InventoryView from './components/InventoryView';
import RecipeView from './components/RecipeView';
import OrdersView from './components/OrdersView';
import AssistantView from './components/AssistantView';
import BankSettingsView from './components/BankSettingsView';
import PurchasePreparationView from './components/PurchasePreparationView';
import RevenueReportView from './components/RevenueReportView';
import { StorageService } from './services/storageService';
import { Ingredient, Order, Product } from './types';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Load Data on Mount (Async)
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [loadedIngredients, loadedProducts, loadedOrders] = await Promise.all([
          StorageService.getIngredients(),
          StorageService.getProducts(),
          StorageService.getOrders()
        ]);
        
        setIngredients(loadedIngredients);
        setProducts(loadedProducts);
        setOrders(loadedOrders);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
      } finally {
        setIsLoading(false);
        setHasLoadedOnce(true); // Mark as loaded
      }
    };

    loadData();
  }, []);

  // Persist Data on Change (Debounced)
  useEffect(() => {
    // Only skip if not loaded yet, allow saving even if empty array (after delete all)
    if (!hasLoadedOnce) return;
    
    const timer = setTimeout(async () => {
      setIsSyncing(true);
      await StorageService.saveIngredients(ingredients);
      setIsSyncing(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [ingredients, hasLoadedOnce]);

  useEffect(() => {
    // Only skip if not loaded yet, allow saving even if empty array (after delete all)
    if (!hasLoadedOnce) return;
    
    const timer = setTimeout(async () => {
      setIsSyncing(true);
      await StorageService.saveProducts(products);
      setIsSyncing(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [products, hasLoadedOnce]);

  useEffect(() => {
    // Only skip if not loaded yet, allow saving even if empty array (after delete all)
    if (!hasLoadedOnce) return;
    
    const timer = setTimeout(async () => {
      setIsSyncing(true);
      await StorageService.saveOrders(orders);
      setIsSyncing(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [orders, hasLoadedOnce]);

  // Inventory logic helper
  const handleDeductInventory = (orderItems: { productId: string; quantity: number }[]) => {
    const updatedIngredients = [...ingredients];
    
    orderItems.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        product.recipe.forEach(recipeItem => {
          const ingIndex = updatedIngredients.findIndex(i => i.id === recipeItem.ingredientId);
          if (ingIndex > -1) {
            // Deduct: Recipe Qty * Order Qty
            updatedIngredients[ingIndex].currentStock -= (recipeItem.quantity * item.quantity);
          }
        });
      }
    });

    setIngredients(updatedIngredients);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu từ Supabase...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard orders={orders} products={products} ingredients={ingredients} />;
      case 'orders':
        return <OrdersView orders={orders} products={products} ingredients={ingredients} setOrders={setOrders} updateStock={handleDeductInventory} />;
      case 'purchase':
        return <PurchasePreparationView orders={orders} products={products} ingredients={ingredients} />;
      case 'inventory':
        return <InventoryView ingredients={ingredients} setIngredients={setIngredients} />;
      case 'recipes':
        return <RecipeView products={products} ingredients={ingredients} setProducts={setProducts} />;
      case 'revenue':
        return <RevenueReportView orders={orders} products={products} ingredients={ingredients} />;
      case 'assistant':
        return <AssistantView ingredients={ingredients} products={products} />;
      case 'settings':
        return <BankSettingsView />;
      default:
        return <Dashboard orders={orders} products={products} ingredients={ingredients} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white z-20 border-b border-gray-200 flex items-center justify-between p-4">
        <h1 className="text-lg font-bold text-gray-900">Tiệm Bánh Ngọt</h1>
        <div className="flex items-center gap-2">
          {isSyncing && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          )}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-700">
            <Menu />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="bg-white w-64 h-full pt-16" onClick={e => e.stopPropagation()}>
             {/* Re-use simplified sidebar logic for mobile */}
             <div className="flex flex-col gap-1 p-4">
               {[
                 { id: 'dashboard', label: 'Tổng Quan' },
                 { id: 'orders', label: 'Đơn Hàng' },
                 { id: 'purchase', label: 'Chuẩn Bị Nguyên Liệu' },
                 { id: 'inventory', label: 'Kho Nguyên Liệu' },
                 { id: 'recipes', label: 'Công Thức' },
                 { id: 'revenue', label: 'Báo Cáo Doanh Thu' },
                 { id: 'assistant', label: 'Trợ Lý AI' },
                 { id: 'settings', label: 'Cài Đặt Ngân Hàng' }
               ].map(item => (
                 <button
                   key={item.id}
                   onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                   className={`text-left px-4 py-2.5 rounded-lg font-medium text-sm ${activeTab === item.id ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                 >
                   {item.label}
                 </button>
               ))}
             </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 overflow-y-auto h-screen">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
