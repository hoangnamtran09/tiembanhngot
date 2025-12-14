import React, { useState, useEffect } from 'react';
import { Ingredient, Order, OrderStatus, Product, PaymentMethod, PaymentInfo, BankSettings } from '../types';
import { Plus, Search, Calendar, CheckCircle, Clock, XCircle, ChevronDown, Save, Trash2, DollarSign, CreditCard, Banknote, Edit2, Printer, X, Check } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { formatCurrency, formatNumber } from '../utils/format';
import InputCurrency from './InputCurrency';
import QRCodeDisplay from './QRCodeDisplay';
import InvoicePrint from './InvoicePrint';

interface OrdersViewProps {
  orders: Order[];
  products: Product[];
  ingredients: Ingredient[];
  setOrders: (orders: Order[]) => void;
  updateStock: (items: { productId: string; quantity: number }[]) => void;
  onCreateOrder?: () => void;
}

const OrdersView: React.FC<OrdersViewProps> = ({ orders, products, ingredients, setOrders, updateStock, onCreateOrder }) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editingPayment, setEditingPayment] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [printInvoice, setPrintInvoice] = useState<string | null>(null);
  const [bankSettings, setBankSettings] = useState<BankSettings | null>(null);
  const [tempPayment, setTempPayment] = useState<PaymentInfo>({
    method: PaymentMethod.CASH,
    totalAmount: 0,
    paidAmount: 0,
    remainingAmount: 0
  });
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  // Load bank settings on mount
  useEffect(() => {
    const loadBankSettings = async () => {
      const settings = await StorageService.getBankSettings();
      setBankSettings(settings);
    };
    loadBankSettings();
  }, []);
  
  // New Order State
  const [newOrder, setNewOrder] = useState<Partial<Order>>({
    customerName: '',
    customerPhone: '',
    deadline: '',
    items: [],
    status: OrderStatus.PENDING,
    notes: '',
    payment: {
      method: PaymentMethod.CASH,
      totalAmount: 0,
      paidAmount: 0,
      remainingAmount: 0
    }
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.COMPLETED: return 'bg-gray-100 text-gray-700';
      case OrderStatus.DELIVERED: return 'bg-gray-200 text-gray-800';
      case OrderStatus.IN_PROGRESS: return 'bg-gray-100 text-gray-700';
      case OrderStatus.CANCELLED: return 'bg-gray-100 text-gray-500';
      default: return 'bg-gray-100 text-gray-700';
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
    
    if (editingOrderId) {
      // Update existing order
      const existingOrder = orders.find(o => o.id === editingOrderId);
      const updatedOrder: Order = {
        ...newOrder as Order,
        id: editingOrderId,
        createdAt: existingOrder?.createdAt || new Date().toISOString(),
        status: existingOrder?.status || OrderStatus.PENDING,
        deadline: newOrder.deadline || existingOrder?.deadline || new Date(Date.now() + 86400000).toISOString(),
        payment: {
          method: newOrder.payment?.method || PaymentMethod.CASH,
          totalAmount: totalAmount,
          paidAmount: paidAmount,
          remainingAmount: totalAmount - paidAmount
        }
      };
      
      const updated = orders.map(o => o.id === editingOrderId ? updatedOrder : o);
      setOrders(updated);
      setEditingOrderId(null);
    } else {
      // Create new order
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
    }
    
    setIsModalOpen(false);
    setNewOrder({ 
      customerName: '', 
      customerPhone: '', 
      items: [], 
      status: OrderStatus.PENDING, 
      deadline: '',
      notes: '',
      payment: {
        method: PaymentMethod.CASH,
        totalAmount: 0,
        paidAmount: 0,
        remainingAmount: 0
      }
    });
    setProductSearchTerm('');
    setSelectedProducts(new Set());
  };

  const openEditOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    setEditingOrderId(orderId);
    setNewOrder({
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      deadline: order.deadline,
      items: order.items,
      status: order.status,
      notes: order.notes || '',
      payment: order.payment || {
        method: PaymentMethod.CASH,
        totalAmount: calculateOrderTotal(order.items),
        paidAmount: 0,
        remainingAmount: calculateOrderTotal(order.items)
      }
    });
    setSelectedProducts(new Set(order.items.map(item => item.productId)));
    setIsModalOpen(true);
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

  const updateItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromNewOrder(productId);
      setSelectedProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
      return;
    }
    const currentItems = newOrder.items || [];
    const existing = currentItems.find(i => i.productId === productId);
    if (existing) {
      setNewOrder({
        ...newOrder,
        items: currentItems.map(i => i.productId === productId ? { ...i, quantity } : i)
      });
    } else {
      setNewOrder({
        ...newOrder,
        items: [...currentItems, { productId, quantity }]
      });
    }
  };

  const handleToggleProduct = (productId: string) => {
    const isSelected = selectedProducts.has(productId);
    const currentItems = newOrder.items || [];
    
    if (isSelected) {
      // Unselect - remove from order
      setSelectedProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
      setNewOrder({
        ...newOrder,
        items: currentItems.filter(i => i.productId !== productId)
      });
    } else {
      // Select - add to order with quantity 1
      setSelectedProducts(prev => new Set(prev).add(productId));
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
          onClick={() => {
            if (onCreateOrder) {
              onCreateOrder();
            } else {
              setIsModalOpen(true);
            }
          }}
          className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
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
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${filterStatus === status ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
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
              {/* Danh sách sản phẩm */}
              {order.items && order.items.length > 0 ? (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-2 uppercase">Sản phẩm:</p>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => {
                      const product = products.find(p => p.id === item.productId);
                      return (
                        <div key={idx} className="flex justify-between items-center text-sm bg-white rounded px-2 py-1.5 border border-gray-200">
                          <span className="text-gray-800 font-medium">
                            {item.quantity}x <span className="font-semibold text-gray-900">{product?.name || 'Unknown'}</span>
                          </span>
                          <span className="font-bold text-gray-900">{formatCurrency(product ? product.sellingPrice * item.quantity : 0)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                  <p className="text-xs text-yellow-700">Chưa có sản phẩm trong đơn hàng</p>
                </div>
              )}
              {order.notes && (
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1 font-medium">Ghi chú:</p>
                  <p className="text-sm text-gray-700 italic">{order.notes}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 mt-auto">
              <div className="flex justify-between items-center mb-2">
                 <span className="text-sm text-gray-500 flex items-center gap-1">
                   <Calendar size={14} /> {new Date(order.deadline).toLocaleDateString('vi-VN')}
                 </span>
                 <span className="text-lg font-bold text-gray-900">
                   {formatCurrency(calculateOrderTotal(order.items))}
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
                        {formatCurrency(order.payment.paidAmount)}
                      </span>
                    </div>
                    {order.payment.remainingAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Còn lại:</span>
                        <span className="font-semibold text-orange-600">
                          {formatCurrency(order.payment.remainingAmount)}
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
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Làm bánh
                  </button>
                )}
                {order.status === OrderStatus.IN_PROGRESS && (
                  <button 
                    onClick={() => handleStatusChange(order.id, OrderStatus.COMPLETED)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Hoàn thành
                  </button>
                )}
                {order.status === OrderStatus.COMPLETED && (
                  <button 
                    onClick={() => handleStatusChange(order.id, OrderStatus.DELIVERED)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                  >
                    Đã giao
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
                  onClick={() => openEditOrder(order.id)}
                  className="px-3 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Chỉnh sửa đơn hàng"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => setPrintInvoice(order.id)}
                  className="px-3 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors"
                  title="In hóa đơn"
                >
                  <Printer size={18} />
                </button>
                <button 
                  onClick={() => setDeleteConfirm(order.id)}
                  className="px-3 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors"
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
                <p className="text-sm text-gray-900 font-medium mt-2">
                  Tổng: {formatCurrency(calculateOrderTotal(order.items))}
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
                <DollarSign className="text-gray-700" />
                Cập Nhật Thanh Toán
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Khách hàng: <span className="font-semibold">{order.customerName}</span></p>
                  <p className="text-sm text-gray-600">Tổng đơn: <span className="font-bold text-gray-900">{formatCurrency(calculateOrderTotal(order.items))}</span></p>
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
                          ? 'border-gray-900 bg-gray-100 text-gray-900 font-semibold'
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
                          ? 'border-gray-900 bg-gray-100 text-gray-900 font-semibold'
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
                  <InputCurrency
                    value={tempPayment.paidAmount}
                    onChange={(paidAmount) => {
                      setTempPayment({
                        ...tempPayment,
                        paidAmount: paidAmount,
                        remainingAmount: tempPayment.totalAmount - paidAmount
                      });
                    }}
                    className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-rose-500 outline-none font-semibold text-lg"
                  />
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tổng tiền:</span>
                      <span className="font-bold">{formatCurrency(tempPayment.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Đã thanh toán:</span>
                      <span className="font-bold text-green-600">{formatCurrency(tempPayment.paidAmount)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="font-semibold">Còn lại:</span>
                      <span className={`font-bold text-lg ${
                        tempPayment.remainingAmount === 0 ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {formatCurrency(tempPayment.remainingAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code for Transfer */}
              {tempPayment.method === PaymentMethod.TRANSFER && bankSettings && tempPayment.remainingAmount > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <CreditCard size={16} className="text-gray-700" />
                    Mã QR Chuyển Khoản
                  </h4>
                  <QRCodeDisplay
                    bankSettings={bankSettings}
                    amount={tempPayment.remainingAmount}
                    description={`DH ${order.customerName}`}
                  />
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setEditingPayment(null)} 
                  className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                >
                  Hủy
                </button>
                <button 
                  onClick={() => handleUpdatePayment(order.id, tempPayment)}
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
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
          <div className="bg-white rounded-2xl w-full max-w-2xl p-4 sm:p-6 shadow-xl h-full max-h-[90vh] flex flex-col">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
              {editingOrderId ? 'Chỉnh Sửa Đơn Hàng' : 'Tạo Đơn Hàng Mới'}
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 pr-2">
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
                      type="date" 
                      value={newOrder.deadline ? newOrder.deadline.split('T')[0] : ''}
                      onChange={e => {
                        const dateValue = e.target.value;
                        // Convert to ISO date string (midnight UTC)
                        const isoDate = dateValue ? new Date(dateValue + 'T00:00:00').toISOString() : '';
                        setNewOrder({...newOrder, deadline: isoDate});
                      }}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-500 outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                    <textarea 
                      value={newOrder.notes || ''}
                      onChange={e => setNewOrder({...newOrder, notes: e.target.value})}
                      placeholder="Nhập ghi chú cho đơn hàng (nếu có)..."
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-500 outline-none resize-none"
                    />
                  </div>
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Chọn sản phẩm</label>
                 
                 {/* Search Input */}
                 <div className="relative mb-4">
                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                   <input
                     type="text"
                     placeholder="Tìm kiếm sản phẩm..."
                     value={productSearchTerm}
                     onChange={(e) => setProductSearchTerm(e.target.value)}
                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
                   />
                 </div>

                 {/* Product List */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 max-h-60 overflow-y-auto">
                    {products
                      .filter(product => 
                        product.name.toLowerCase().includes(productSearchTerm.toLowerCase())
                      )
                      .map(product => {
                        const isInOrder = newOrder.items?.some(i => i.productId === product.id);
                        const orderItem = newOrder.items?.find(i => i.productId === product.id);
                        
                        return (
                          <div key={product.id} className="relative">
                            {isInOrder && orderItem ? (
                              <div className="border-2 border-gray-900 rounded-lg p-2 bg-gray-50">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-900">{product.name}</span>
                                  <span className="text-xs text-gray-600">{formatCurrency(product.sellingPrice)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min="1"
                                    value={orderItem.quantity}
                                    onChange={(e) => updateItemQuantity(product.id, parseInt(e.target.value) || 0)}
                                    placeholder="Số lượng"
                                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                                  />
                                  <button
                                    onClick={() => {
                                      removeItemFromNewOrder(product.id);
                                      setSelectedProducts(prev => {
                                        const newSet = new Set(prev);
                                        newSet.delete(product.id);
                                        return newSet;
                                      });
                                    }}
                                    className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              </div>
                            ) : (
                      <button
                                onClick={() => handleToggleProduct(product.id)}
                                className={`w-full text-left px-3 py-2 border rounded-lg transition-all flex justify-between items-center group ${
                                  isInOrder
                                    ? 'border-gray-300 bg-gray-100'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                      {product.name}
                                    </span>
                                    {isInOrder && (
                                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                                        Đã thêm
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs text-gray-500">{formatCurrency(product.sellingPrice)}</span>
                                </div>
                                <Plus size={16} className="text-gray-400 group-hover:text-gray-600"/>
                      </button>
                            )}
                          </div>
                        );
                      })}
                 </div>
                 
                 {products.filter(product => 
                   product.name.toLowerCase().includes(productSearchTerm.toLowerCase())
                 ).length === 0 && (
                   <div className="text-center py-4 text-gray-500 text-sm">
                     Không tìm thấy sản phẩm
                   </div>
                 )}

                 {newOrder.items && newOrder.items.length > 0 && (
                   <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Sản phẩm đã chọn:</h4>
                      <div className="space-y-2">
                        {newOrder.items.map((item, idx) => {
                           const product = products.find(p => p.id === item.productId);
                           if(!product) return null;
                           return (
                             <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                                <div className="flex-1">
                                  <span className="text-sm font-medium text-gray-900">{product.name}</span>
                                  <p className="text-xs text-gray-500 mt-0.5">{formatCurrency(product.sellingPrice)}/sản phẩm</p>
                                </div>
                                <div className="flex items-center gap-3">
                                   <div className="flex items-center gap-2">
                                     <button
                                       onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}
                                       className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 text-gray-600"
                                     >
                                       -
                                     </button>
                                     <input
                                       type="number"
                                       min="1"
                                       value={item.quantity}
                                       onChange={(e) => {
                                         const qty = parseInt(e.target.value) || 1;
                                         updateItemQuantity(item.productId, qty);
                                       }}
                                       className="w-16 px-2 py-1 text-center border border-gray-300 rounded text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                                     />
                                     <button
                                       onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                                       className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 text-gray-600"
                                     >
                                       +
                                     </button>
                                   </div>
                                   <span className="text-sm font-bold text-gray-900 w-24 text-right">
                                     {formatCurrency(product.sellingPrice * item.quantity)}
                                   </span>
                                   <button 
                                     onClick={() => removeItemFromNewOrder(item.productId)} 
                                     className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                     title="Xóa"
                                   >
                                      <Trash2 size={16} />
                                   </button>
                                </div>
                             </div>
                           )
                        })}
                      </div>
                      <div className="mt-4 pt-2 border-t border-gray-200 flex justify-between items-center">
                        <span className="font-bold text-gray-700">Tổng cộng:</span>
                        <span className="font-bold text-gray-900 text-lg">
                          {formatCurrency(calculateOrderTotal(newOrder.items))}
                        </span>
                      </div>
                   </div>
                 )}
               </div>

               {/* Payment Section */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Thanh toán</label>
                 <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
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
                             ? 'border-gray-900 bg-gray-100 text-gray-900 font-semibold'
                             : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
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
                             ? 'border-gray-900 bg-gray-100 text-gray-900 font-semibold'
                             : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
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
                     <InputCurrency
                       value={newOrder.payment?.paidAmount || 0}
                       onChange={(paidAmount) => {
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
                       placeholder="0"
                       className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-rose-500 outline-none font-semibold"
                     />
                     
                     {/* Remaining Amount Display */}
                     {newOrder.items && newOrder.items.length > 0 && (
                       <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                         <div className="flex justify-between text-sm mb-1">
                           <span className="text-gray-600">Tổng đơn hàng:</span>
                           <span className="font-bold text-gray-800">
                             {formatCurrency(calculateOrderTotal(newOrder.items))}
                           </span>
                         </div>
                         <div className="flex justify-between text-sm mb-1">
                           <span className="text-gray-600">Đã thanh toán:</span>
                           <span className="font-bold text-green-600">
                             {formatCurrency(newOrder.payment?.paidAmount || 0)}
                           </span>
                         </div>
                         <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                           <span className="font-semibold text-gray-700">Còn lại:</span>
                           <span className={`font-bold text-lg ${
                             (calculateOrderTotal(newOrder.items) - (newOrder.payment?.paidAmount || 0)) === 0
                               ? 'text-green-600'
                               : 'text-orange-600'
                           }`}>
                             {formatCurrency(calculateOrderTotal(newOrder.items) - (newOrder.payment?.paidAmount || 0))}
                           </span>
                         </div>
                       </div>
                     )}
                   </div>

                   {/* QR Code for Transfer */}
                   {newOrder.payment?.method === PaymentMethod.TRANSFER && bankSettings && newOrder.items && newOrder.items.length > 0 && (
                     <div className="mt-4 border-t border-gray-200 pt-4">
                       <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                         <CreditCard size={16} className="text-gray-700" />
                         Mã QR Chuyển Khoản
                       </h4>
                       <QRCodeDisplay
                         bankSettings={bankSettings}
                         amount={calculateOrderTotal(newOrder.items) - (newOrder.payment?.paidAmount || 0)}
                         description={`DH ${newOrder.customerName || 'Khach hang'}`}
                       />
                     </div>
                   )}
                 </div>
               </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
               <button 
                 onClick={() => {
                   setIsModalOpen(false);
                   setProductSearchTerm('');
                   setSelectedProducts(new Set());
                 }} 
                 className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
               >
                 Hủy
               </button>
               <button onClick={handleCreateOrder} className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium">
                  {editingOrderId ? 'Cập Nhật Đơn Hàng' : 'Lưu Đơn Hàng'}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Invoice Modal */}
      {printInvoice && (() => {
        const order = orders.find(o => o.id === printInvoice);
        if (!order) return null;
        return (
          <InvoicePrint
            order={order}
            products={products}
            bankSettings={bankSettings}
            onClose={() => setPrintInvoice(null)}
          />
        );
      })()}
    </div>
  );
};

export default OrdersView;
