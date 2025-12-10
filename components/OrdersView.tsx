import React, { useState } from 'react';
import { Ingredient, Order, OrderStatus, Product } from '../types';
import { Plus, Search, Calendar, CheckCircle, Clock, XCircle, ChevronDown, Save, Trash2 } from 'lucide-react';

interface OrdersViewProps {
  orders: Order[];
  products: Product[];
  ingredients: Ingredient[];
  setOrders: (orders: Order[]) => void;
  updateStock: (items: { productId: string; quantity: number }[]) => void;
}

const OrdersView: React.FC<OrdersViewProps> = ({ orders, products, setOrders, updateStock }) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Order State
  const [newOrder, setNewOrder] = useState<Partial<Order>>({
    customerName: '',
    customerPhone: '',
    deadline: '',
    items: [],
    status: OrderStatus.PENDING
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.COMPLETED: return 'bg-green-100 text-green-700';
      case OrderStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700';
      case OrderStatus.CANCELLED: return 'bg-red-100 text-red-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (order && order.status !== OrderStatus.COMPLETED && newStatus === OrderStatus.COMPLETED) {
      // Deduct inventory when marked completed
      updateStock(order.items);
    }

    const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    setOrders(updated);
  };

  const handleCreateOrder = () => {
    if (!newOrder.customerName || !newOrder.items || newOrder.items.length === 0) return;
    
    const fullOrder: Order = {
      ...newOrder as Order,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: OrderStatus.PENDING,
      deadline: newOrder.deadline || new Date(Date.now() + 86400000).toISOString() // Default 1 day
    };
    
    setOrders([fullOrder, ...orders]);
    setIsModalOpen(false);
    setNewOrder({ customerName: '', customerPhone: '', items: [], status: OrderStatus.PENDING, deadline: '' });
  };

  const addItemToNewOrder = (productId: string) => {
    const currentItems = newOrder.items || [];
    const existing = currentItems.find(i => i.productId === productId);
    if (existing) {
      setNewOrder({
        ...newOrder,
        items: currentItems.map(i => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i)
      });
    } else {
      setNewOrder({
        ...newOrder,
        items: [...currentItems, { productId, quantity: 1 }]
      });
    }
  };
  
  const removeItemFromNewOrder = (productId: string) => {
     const currentItems = newOrder.items || [];
     setNewOrder({
       ...newOrder,
       items: currentItems.filter(i => i.productId !== productId)
     });
  };

  const calculateOrderTotal = (items: { productId: string, quantity: number }[]) => {
    return items.reduce((total, item) => {
      const p = products.find(prod => prod.id === item.productId);
      return total + (p ? p.sellingPrice * item.quantity : 0);
    }, 0);
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  return (
    <div className="p-6 max-w-7xl mx-auto h-screen flex flex-col pb-20 md:pb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Đơn Hàng</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={20} />
          <span>Tạo Đơn Mới</span>
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button 
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${filterStatus === 'all' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
        >
            Tất cả
        </button>
        {Object.values(OrderStatus).map(status => (
           <button 
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${filterStatus === status ? 'bg-rose-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
           >
             {status}
           </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-10">
        {filteredOrders.map(order => (
          <div key={order.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-gray-800">{order.customerName}</h3>
                <p className="text-sm text-gray-500">{order.customerPhone}</p>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(order.status)}`}>
                {order.status}
              </div>
            </div>

            <div className="flex-1 space-y-2 mb-4">
              {order.items.map((item, idx) => {
                const product = products.find(p => p.id === item.productId);
                return (
                  <div key={idx} className="flex justify-between text-sm text-gray-600 border-b border-dashed border-gray-100 pb-1 last:border-0">
                    <span>{item.quantity}x {product?.name || 'Unknown'}</span>
                    <span className="font-medium">{(product ? product.sellingPrice * item.quantity : 0).toLocaleString()}đ</span>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-gray-100 mt-auto">
              <div className="flex justify-between items-center mb-3">
                 <span className="text-sm text-gray-500 flex items-center gap-1">
                   <Calendar size={14} /> {new Date(order.deadline).toLocaleDateString('vi-VN')}
                 </span>
                 <span className="text-lg font-bold text-rose-600">
                   {calculateOrderTotal(order.items).toLocaleString()}đ
                 </span>
              </div>
              
              <div className="flex gap-2">
                {order.status === OrderStatus.PENDING && (
                  <button 
                    onClick={() => handleStatusChange(order.id, OrderStatus.IN_PROGRESS)}
                    className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                  >
                    Làm bánh
                  </button>
                )}
                {order.status === OrderStatus.IN_PROGRESS && (
                  <button 
                    onClick={() => handleStatusChange(order.id, OrderStatus.COMPLETED)}
                    className="flex-1 bg-green-50 text-green-600 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                  >
                    Hoàn thành
                  </button>
                )}
                {(order.status === OrderStatus.PENDING || order.status === OrderStatus.IN_PROGRESS) && (
                   <button 
                     onClick={() => handleStatusChange(order.id, OrderStatus.CANCELLED)}
                     className="px-3 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors"
                   >
                     <XCircle size={18} />
                   </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl h-full max-h-[90vh] flex flex-col">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Tạo Đơn Hàng Mới</h3>
            
            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng</label>
                    <input 
                      type="text" 
                      value={newOrder.customerName}
                      onChange={e => setNewOrder({...newOrder, customerName: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                    <input 
                      type="text" 
                      value={newOrder.customerPhone}
                      onChange={e => setNewOrder({...newOrder, customerPhone: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-500 outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày trả hàng</label>
                    <input 
                      type="datetime-local" 
                      value={newOrder.deadline}
                      onChange={e => setNewOrder({...newOrder, deadline: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-500 outline-none"
                    />
                  </div>
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Chọn sản phẩm</label>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    {products.map(product => (
                      <button
                        key={product.id}
                        onClick={() => addItemToNewOrder(product.id)}
                        className="text-left px-3 py-2 border border-gray-200 rounded-lg hover:border-rose-300 hover:bg-rose-50 transition-all flex justify-between items-center group"
                      >
                         <span className="text-sm font-medium text-gray-700 group-hover:text-rose-700">{product.name}</span>
                         <Plus size={16} className="text-gray-400 group-hover:text-rose-500"/>
                      </button>
                    ))}
                 </div>

                 {newOrder.items && newOrder.items.length > 0 && (
                   <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Sản phẩm đã chọn:</h4>
                      <div className="space-y-2">
                        {newOrder.items.map((item, idx) => {
                           const product = products.find(p => p.id === item.productId);
                           if(!product) return null;
                           return (
                             <div key={idx} className="flex items-center justify-between bg-white p-2 rounded shadow-sm">
                                <span className="text-sm font-medium">{product.name}</span>
                                <div className="flex items-center gap-3">
                                   <span className="text-sm">x{item.quantity}</span>
                                   <span className="text-sm font-bold text-gray-600">{(product.sellingPrice * item.quantity).toLocaleString()}đ</span>
                                   <button onClick={() => removeItemFromNewOrder(item.productId)} className="text-red-400 hover:text-red-600">
                                      <Trash2 size={16} />
                                   </button>
                                </div>
                             </div>
                           )
                        })}
                      </div>
                      <div className="mt-4 pt-2 border-t border-gray-200 flex justify-between items-center">
                        <span className="font-bold text-gray-700">Tổng cộng:</span>
                        <span className="font-bold text-rose-600 text-lg">
                          {calculateOrderTotal(newOrder.items).toLocaleString()} đ
                        </span>
                      </div>
                   </div>
                 )}
               </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
               <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Hủy</button>
               <button onClick={handleCreateOrder} className="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-medium shadow-md shadow-rose-200">
                  Lưu Đơn Hàng
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersView;
