import React, { useState } from 'react';
import { Ingredient, Order, OrderStatus, Product, PaymentMethod, PaymentInfo } from '../types';
import { Plus, Search, Calendar, CheckCircle, Clock, XCircle, ChevronDown, Save, Trash2, DollarSign, CreditCard, Banknote, Edit2 } from 'lucide-react';

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
  const [editingPayment, setEditingPayment] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [tempPayment, setTempPayment] = useState<PaymentInfo>({
    method: PaymentMethod.CASH,
    totalAmount: 0,
    paidAmount: 0,
    remainingAmount: 0
  });
  
  // New Order State
  const [newOrder, setNewOrder] = useState<Partial<Order>>({
    customerName: '',
    customerPhone: '',
    deadline: '',
    items: [],
    status: OrderStatus.PENDING,
    payment: {
      method: PaymentMethod.CASH,
      totalAmount: 0,
      paidAmount: 0,
      remainingAmount: 0
    }
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
    
    const totalAmount = calculateOrderTotal(newOrder.items);
    const paidAmount = newOrder.payment?.paidAmount || 0;
    
    const fullOrder: Order = {
      ...newOrder as Order,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: OrderStatus.PENDING,
      deadline: newOrder.deadline || new Date(Date.now() + 86400000).toISOString(), // Default 1 day
      payment: {
        method: newOrder.payment?.method || PaymentMethod.CASH,
        totalAmount: totalAmount,
        paidAmount: paidAmount,
        remainingAmount: totalAmount - paidAmount
      }
    };
    
    setOrders([fullOrder, ...orders]);
    setIsModalOpen(false);
    setNewOrder({ 
      customerName: '', 
      customerPhone: '', 
      items: [], 
      status: OrderStatus.PENDING, 
      deadline: '',
      payment: {
        method: PaymentMethod.CASH,
        totalAmount: 0,
        paidAmount: 0,
        remainingAmount: 0
      }
    });
  };

  const handleUpdatePayment = (orderId: string, payment: PaymentInfo) => {
    const updated = orders.map(o => 
      o.id === orderId 
        ? { ...o, payment: { ...payment, remainingAmount: payment.totalAmount - payment.paidAmount } }
        : o
    );
    setOrders(updated);
    setEditingPayment(null);
  };

  const openEditPayment = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setTempPayment(
        order.payment || {
          method: PaymentMethod.CASH,
          totalAmount: calculateOrderTotal(order.items),
          paidAmount: 0,
          remainingAmount: calculateOrderTotal(order.items)
        }
      );
      setEditingPayment(orderId);
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    const updated = orders.filter(o => o.id !== orderId);
    setOrders(updated);
    setDeleteConfirm(null);
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
              <div className="flex justify-between items-center mb-2">
                 <span className="text-sm text-gray-500 flex items-center gap-1">
                   <Calendar size={14} /> {new Date(order.deadline).toLocaleDateString('vi-VN')}
                 </span>
                 <span className="text-lg font-bold text-rose-600">
                   {calculateOrderTotal(order.items).toLocaleString()}đ
                 </span>
              </div>

              {/* Payment Info */}
              {order.payment && (
                <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      {order.payment.method === PaymentMethod.CASH ? (
                        <><Banknote size={12} /> Tiền mặt</>
                      ) : (
                        <><CreditCard size={12} /> Chuyển khoản</>
                      )}
                    </div>
                    <button 
                      onClick={() => openEditPayment(order.id)}
                      className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Edit2 size={10} /> Sửa
                    </button>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Đã trả:</span>
                      <span className="font-semibold text-green-600">
                        {order.payment.paidAmount.toLocaleString()}đ
                      </span>
                    </div>
                    {order.payment.remainingAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Còn lại:</span>
                        <span className="font-semibold text-orange-600">
                          {order.payment.remainingAmount.toLocaleString()}đ
                        </span>
                      </div>
                    )}
                    {order.payment.remainingAmount === 0 && order.payment.paidAmount > 0 && (
                      <div className="text-center text-green-600 font-semibold">✓ Đã thanh toán đủ</div>
                    )}
                  </div>
                </div>
              )}
              
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
                <button 
                  onClick={() => setDeleteConfirm(order.id)}
                  className="px-3 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                  title="Xóa đơn hàng"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (() => {
        const order = orders.find(o => o.id === deleteConfirm);
        if (!order) return null;

        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <Trash2 className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Xác nhận xóa</h3>
                  <p className="text-sm text-gray-500">Thao tác này không thể hoàn tác</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">Bạn có chắc muốn xóa đơn hàng:</p>
                <p className="font-semibold text-gray-800">{order.customerName}</p>
                <p className="text-sm text-gray-500">{order.customerPhone}</p>
                <p className="text-sm text-rose-600 font-medium mt-2">
                  Tổng: {calculateOrderTotal(order.items).toLocaleString()}đ
                </p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfirm(null)} 
                  className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                >
                  Hủy
                </button>
                <button 
                  onClick={() => handleDeleteOrder(order.id)}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
                >
                  Xóa đơn hàng
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Edit Payment Modal */}
      {editingPayment && (() => {
        const order = orders.find(o => o.id === editingPayment);
        if (!order) return null;

        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <DollarSign className="text-rose-500" />
                Cập Nhật Thanh Toán
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Khách hàng: <span className="font-semibold">{order.customerName}</span></p>
                  <p className="text-sm text-gray-600">Tổng đơn: <span className="font-bold text-rose-600">{calculateOrderTotal(order.items).toLocaleString()}đ</span></p>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phương thức thanh toán</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTempPayment({ ...tempPayment, method: PaymentMethod.CASH })}
                      className={`flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-all ${
                        tempPayment.method === PaymentMethod.CASH
                          ? 'border-rose-500 bg-rose-100 text-rose-700 font-semibold'
                          : 'border-gray-200 bg-white text-gray-600'
                      }`}
                    >
                      <Banknote size={18} />
                      Tiền mặt
                    </button>
                    <button
                      type="button"
                      onClick={() => setTempPayment({ ...tempPayment, method: PaymentMethod.TRANSFER })}
                      className={`flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-all ${
                        tempPayment.method === PaymentMethod.TRANSFER
                          ? 'border-rose-500 bg-rose-100 text-rose-700 font-semibold'
                          : 'border-gray-200 bg-white text-gray-600'
                      }`}
                    >
                      <CreditCard size={18} />
                      Chuyển khoản
                    </button>
                  </div>
                </div>

                {/* Paid Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số tiền đã {tempPayment.method === PaymentMethod.CASH ? 'trả' : 'chuyển'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={tempPayment.paidAmount}
                      onChange={(e) => {
                        const paidAmount = Math.max(0, Number(e.target.value));
                        setTempPayment({
                          ...tempPayment,
                          paidAmount: paidAmount,
                          remainingAmount: tempPayment.totalAmount - paidAmount
                        });
                      }}
                      className="w-full border-2 border-gray-200 rounded-lg p-3 pr-12 focus:ring-2 focus:ring-rose-500 outline-none font-semibold text-lg"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">đ</span>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg p-4 border border-rose-200">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tổng tiền:</span>
                      <span className="font-bold">{tempPayment.totalAmount.toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Đã thanh toán:</span>
                      <span className="font-bold text-green-600">{tempPayment.paidAmount.toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-rose-200">
                      <span className="font-semibold">Còn lại:</span>
                      <span className={`font-bold text-lg ${
                        tempPayment.remainingAmount === 0 ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {tempPayment.remainingAmount.toLocaleString()}đ
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setEditingPayment(null)} 
                  className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                >
                  Hủy
                </button>
                <button 
                  onClick={() => handleUpdatePayment(order.id, tempPayment)}
                  className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-medium shadow-md"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        );
      })()}

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

               {/* Payment Section */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Thanh toán</label>
                 <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-4 border border-rose-100">
                   {/* Payment Method */}
                   <div className="mb-4">
                     <label className="block text-sm font-medium text-gray-700 mb-2">Phương thức</label>
                     <div className="grid grid-cols-2 gap-2">
                       <button
                         type="button"
                         onClick={() => setNewOrder({
                           ...newOrder,
                           payment: { ...newOrder.payment!, method: PaymentMethod.CASH }
                         })}
                         className={`flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-all ${
                           newOrder.payment?.method === PaymentMethod.CASH
                             ? 'border-rose-500 bg-rose-100 text-rose-700 font-semibold'
                             : 'border-gray-200 bg-white text-gray-600 hover:border-rose-300'
                         }`}
                       >
                         <Banknote size={18} />
                         Tiền mặt
                       </button>
                       <button
                         type="button"
                         onClick={() => setNewOrder({
                           ...newOrder,
                           payment: { ...newOrder.payment!, method: PaymentMethod.TRANSFER }
                         })}
                         className={`flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-all ${
                           newOrder.payment?.method === PaymentMethod.TRANSFER
                             ? 'border-rose-500 bg-rose-100 text-rose-700 font-semibold'
                             : 'border-gray-200 bg-white text-gray-600 hover:border-rose-300'
                         }`}
                       >
                         <CreditCard size={18} />
                         Chuyển khoản
                       </button>
                     </div>
                   </div>

                   {/* Payment Amount */}
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Số tiền đã {newOrder.payment?.method === PaymentMethod.CASH ? 'trả' : 'chuyển'}
                     </label>
                     <div className="relative">
                       <input
                         type="number"
                         value={newOrder.payment?.paidAmount || 0}
                         onChange={(e) => {
                           const paidAmount = Math.max(0, Number(e.target.value));
                           const totalAmount = calculateOrderTotal(newOrder.items || []);
                           setNewOrder({
                             ...newOrder,
                             payment: {
                               ...newOrder.payment!,
                               paidAmount: paidAmount,
                               totalAmount: totalAmount,
                               remainingAmount: totalAmount - paidAmount
                             }
                           });
                         }}
                         className="w-full border-2 border-gray-200 rounded-lg p-3 pr-12 focus:ring-2 focus:ring-rose-500 outline-none font-semibold"
                         placeholder="0"
                       />
                       <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">đ</span>
                     </div>
                     
                     {/* Remaining Amount Display */}
                     {newOrder.items && newOrder.items.length > 0 && (
                       <div className="mt-3 p-3 bg-white rounded-lg border border-rose-200">
                         <div className="flex justify-between text-sm mb-1">
                           <span className="text-gray-600">Tổng đơn hàng:</span>
                           <span className="font-bold text-gray-800">
                             {calculateOrderTotal(newOrder.items).toLocaleString()}đ
                           </span>
                         </div>
                         <div className="flex justify-between text-sm mb-1">
                           <span className="text-gray-600">Đã thanh toán:</span>
                           <span className="font-bold text-green-600">
                             {(newOrder.payment?.paidAmount || 0).toLocaleString()}đ
                           </span>
                         </div>
                         <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                           <span className="font-semibold text-gray-700">Còn lại:</span>
                           <span className={`font-bold text-lg ${
                             (calculateOrderTotal(newOrder.items) - (newOrder.payment?.paidAmount || 0)) === 0
                               ? 'text-green-600'
                               : 'text-orange-600'
                           }`}>
                             {(calculateOrderTotal(newOrder.items) - (newOrder.payment?.paidAmount || 0)).toLocaleString()}đ
                           </span>
                         </div>
                       </div>
                     )}
                   </div>
                 </div>
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
