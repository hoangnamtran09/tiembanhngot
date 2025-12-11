import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, Product, PaymentMethod, PaymentInfo, BankSettings } from '../types';
import { StorageService } from '../services/storageService';
import { Search, X, Plus, Minus, Trash2, ArrowLeft, Save, DollarSign, CreditCard, Banknote, Check } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import InputCurrency from './InputCurrency';
import QRCodeDisplay from './QRCodeDisplay';

interface CreateOrderViewProps {
  products: Product[];
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  onBack: () => void;
}

const CreateOrderView: React.FC<CreateOrderViewProps> = ({ products, orders, setOrders, onBack }) => {
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

  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [bankSettings, setBankSettings] = useState<BankSettings | null>(null);

  useEffect(() => {
    const loadBankSettings = async () => {
      const settings = await StorageService.getBankSettings();
      setBankSettings(settings);
    };
    loadBankSettings();
  }, []);

  const calculateOrderTotal = (items: { productId: string, quantity: number }[]) => {
    return items.reduce((total, item) => {
      const p = products.find(prod => prod.id === item.productId);
      return total + (p ? p.sellingPrice * item.quantity : 0);
    }, 0);
  };

  const updateItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromOrder(productId);
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

  const removeItemFromOrder = (productId: string) => {
    const currentItems = newOrder.items || [];
    setNewOrder({
      ...newOrder,
      items: currentItems.filter(i => i.productId !== productId)
    });
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
  };

  const handleToggleProduct = (productId: string) => {
    const isSelected = selectedProducts.has(productId);
    const currentItems = newOrder.items || [];
    
    if (isSelected) {
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
      setSelectedProducts(prev => new Set(prev).add(productId));
      setNewOrder({
        ...newOrder,
        items: [...currentItems, { productId, quantity: 1 }]
      });
    }
  };

  const handleCreateOrder = () => {
    if (!newOrder.customerName || !newOrder.items || newOrder.items.length === 0) {
      alert('Vui lòng nhập tên khách hàng và chọn ít nhất một sản phẩm');
      return;
    }
    
    const totalAmount = calculateOrderTotal(newOrder.items);
    const paidAmount = newOrder.payment?.paidAmount || 0;
    
    const fullOrder: Order = {
      ...newOrder as Order,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: OrderStatus.PENDING,
      deadline: newOrder.deadline || new Date(Date.now() + 86400000).toISOString(),
      payment: {
        method: newOrder.payment?.method || PaymentMethod.CASH,
        totalAmount: totalAmount,
        paidAmount: paidAmount,
        remainingAmount: totalAmount - paidAmount
      }
    };
    
    setOrders([fullOrder, ...orders]);
    onBack();
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  const totalAmount = calculateOrderTotal(newOrder.items || []);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Quay lại"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Tạo Đơn Hàng</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
          >
            Thoát
          </button>
          <button
            onClick={handleCreateOrder}
            disabled={!newOrder.customerName || !newOrder.items || newOrder.items.length === 0}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Tạo Đơn Hàng
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left Column - Customer & Products */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khách hàng</h2>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Tìm theo tên, SĐT..."
                  value={customerSearchTerm}
                  onChange={(e) => setCustomerSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng *</label>
                  <input
                    type="text"
                    value={newOrder.customerName || ''}
                    onChange={(e) => setNewOrder({...newOrder, customerName: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-gray-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={newOrder.customerPhone || ''}
                    onChange={(e) => setNewOrder({...newOrder, customerPhone: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-gray-900 outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày trả hàng</label>
                  <input
                    type="date"
                    value={newOrder.deadline ? newOrder.deadline.split('T')[0] : ''}
                    onChange={(e) => {
                      const dateValue = e.target.value;
                      const isoDate = dateValue ? new Date(dateValue + 'T00:00:00').toISOString() : '';
                      setNewOrder({...newOrder, deadline: isoDate});
                    }}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-gray-900 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin sản phẩm</h2>
            
            {/* Search Products */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Tìm theo tên, mã SKU..."
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
              />
            </div>

            {/* Product List - Only show when searching */}
            {productSearchTerm.trim() && (
              <div className="mb-4 max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(product => {
                    const isSelected = selectedProducts.has(product.id);
                    const itemInOrder = newOrder.items?.find(i => i.productId === product.id);
                    
                    return (
                      <div
                        key={product.id}
                        className={`p-3 border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-gray-50' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <button
                              onClick={() => handleToggleProduct(product.id)}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'bg-gray-900 border-gray-900'
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              {isSelected && <Check size={14} className="text-white" />}
                            </button>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900">{product.name}</span>
                              </div>
                              <span className="text-xs text-gray-500">{formatCurrency(product.sellingPrice)}</span>
                            </div>
                          </div>
                          
                          {isSelected && itemInOrder && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateItemQuantity(product.id, itemInOrder.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 text-gray-600"
                              >
                                <Minus size={14} />
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={itemInOrder.quantity}
                                onChange={(e) => {
                                  const qty = parseInt(e.target.value) || 1;
                                  updateItemQuantity(product.id, qty);
                                }}
                                className="w-16 px-2 py-1 text-center border border-gray-300 rounded text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                              />
                              <button
                                onClick={() => updateItemQuantity(product.id, itemInOrder.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 text-gray-600"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    Không tìm thấy sản phẩm
                  </div>
                )}
              </div>
            )}

            {!productSearchTerm.trim() && (
              <div className="text-center py-12 text-gray-400 text-sm border border-gray-200 rounded-lg bg-gray-50">
                Nhập tên sản phẩm để tìm kiếm
              </div>
            )}

            {/* Selected Products List */}
            {newOrder.items && newOrder.items.length > 0 && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Sản phẩm đã chọn</h3>
                <div className="space-y-2">
                  {newOrder.items.map((item) => {
                    const product = products.find(p => p.id === item.productId);
                    if (!product) return null;
                    return (
                      <div key={item.productId} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
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
                              <Minus size={14} />
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
                              <Plus size={14} />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-gray-900 w-24 text-right">
                            {formatCurrency(product.sellingPrice * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeItemFromOrder(item.productId)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Payment & Summary */}
        <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Additional Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin bổ sung</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea
                    value={newOrder.notes || ''}
                    onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})}
                    placeholder="Nhập ghi chú cho đơn hàng..."
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-gray-900 outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Thanh toán</h2>
              <div className="space-y-4">
                {/* Payment Method */}
                <div>
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

                {/* Paid Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số tiền đã {newOrder.payment?.method === PaymentMethod.CASH ? 'trả' : 'chuyển'}
                  </label>
                  <InputCurrency
                    value={newOrder.payment?.paidAmount || 0}
                    onChange={(paidAmount) => {
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
                    className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-gray-900 outline-none font-semibold"
                  />
                </div>

                {/* QR Code for Transfer */}
                {newOrder.payment?.method === PaymentMethod.TRANSFER && bankSettings && newOrder.items && newOrder.items.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <CreditCard size={16} className="text-gray-700" />
                      Mã QR Chuyển Khoản
                    </h4>
                    <QRCodeDisplay
                      bankSettings={bankSettings}
                      amount={totalAmount - (newOrder.payment?.paidAmount || 0)}
                      description={`DH ${newOrder.customerName || 'Khach hang'}`}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tổng tiền ({newOrder.items?.length || 0} sản phẩm):</span>
                  <span className="font-bold text-gray-900">{formatCurrency(totalAmount)}</span>
                </div>
                {newOrder.payment && newOrder.payment.paidAmount > 0 && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Đã thanh toán:</span>
                      <span className="font-bold text-green-600">{formatCurrency(newOrder.payment.paidAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                      <span className="font-semibold text-gray-700">Còn lại:</span>
                      <span className={`font-bold text-lg ${
                        (totalAmount - (newOrder.payment?.paidAmount || 0)) === 0
                          ? 'text-green-600'
                          : 'text-orange-600'
                      }`}>
                        {formatCurrency(totalAmount - (newOrder.payment?.paidAmount || 0))}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrderView;

