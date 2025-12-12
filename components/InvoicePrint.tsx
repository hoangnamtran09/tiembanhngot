import React, { useState, useEffect } from 'react';
import { Order, Product, BankSettings, PaymentMethod } from '../types';
import { formatCurrency } from '../utils/format';
import { Printer, X } from 'lucide-react';
import { StorageService } from '../services/storageService';

interface InvoicePrintProps {
  order: Order;
  products: Product[];
  onClose: () => void;
}

const InvoicePrint: React.FC<InvoicePrintProps> = ({ order, products, onClose }) => {
  const [bankSettings, setBankSettings] = useState<BankSettings | null>(null);

  useEffect(() => {
    const loadBankSettings = async () => {
      const settings = await StorageService.getBankSettings();
      setBankSettings(settings);
    };
    loadBankSettings();
  }, []);

  const calculateTotal = () => {
    return order.items.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.sellingPrice * item.quantity : 0);
    }, 0);
  };

  const handlePrint = () => {
    window.print();
  };

  // Tính số tiền còn lại cần thanh toán
  const getRemainingAmount = () => {
    const total = calculateTotal();
    if (order.payment) {
      return order.payment.remainingAmount || (total - (order.payment.paidAmount || 0));
    }
    return total;
  };

  // Tạo URL QR code với template qr_only (chỉ có QR code)
  const getQRCodeUrl = () => {
    if (!bankSettings) return null;
    const remainingAmount = getRemainingAmount();
    if (remainingAmount <= 0) return null;
    
    const description = `DH ${order.customerName || 'Khach hang'}`;
    return `https://img.vietqr.io/image/${bankSettings.bankId}-${bankSettings.accountNumber}-qr_only.png?amount=${remainingAmount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(bankSettings.accountName)}`;
  };

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .invoice-content, .invoice-content * {
            visibility: visible;
          }
          .invoice-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 no-print">
        <div className="bg-white rounded-lg w-full max-w-2xl max-h-[95vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-2 flex justify-between items-center no-print">
            <h2 className="text-lg font-bold text-gray-900">Hóa Đơn</h2>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center gap-1.5 text-sm"
              >
                <Printer size={16} />
                In
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Invoice Content */}
          <div className="invoice-content p-4">
            {/* Header */}
            <div className="text-center mb-3">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">TIỆM BÁNH NGỌT</h1>
              <p className="text-sm text-gray-600">Hóa đơn bán hàng</p>
            </div>

            {/* Main Content */}
            <div className="space-y-3 mb-3">
              {/* Order Info */}
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã đơn:</span>
                  <span className="font-semibold text-gray-900">#{order.id.slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày:</span>
                  <span className="text-gray-900">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Khách hàng:</span>
                  <span className="font-semibold text-gray-900">{order.customerName}</span>
                </div>
                {order.customerPhone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">SĐT:</span>
                    <span className="text-gray-900">{order.customerPhone}</span>
                  </div>
                )}
                {order.deadline && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày giao:</span>
                    <span className="text-gray-900">{new Date(order.deadline).toLocaleDateString('vi-VN')}</span>
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="border-t border-b border-gray-300 py-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-1 text-gray-700 font-semibold text-xs">Sản phẩm</th>
                      <th className="text-center py-1 text-gray-700 font-semibold text-xs">SL</th>
                      <th className="text-right py-1 text-gray-700 font-semibold text-xs">Đơn giá</th>
                      <th className="text-right py-1 text-gray-700 font-semibold text-xs">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, idx) => {
                      const product = products.find(p => p.id === item.productId);
                      if (!product) return null;
                      return (
                        <tr key={idx} className="border-b border-gray-200">
                          <td className="py-1 text-gray-900 text-xs">{product.name}</td>
                          <td className="text-center py-1 text-gray-700 text-xs">{item.quantity}</td>
                          <td className="text-right py-1 text-gray-700 text-xs">{formatCurrency(product.sellingPrice)}</td>
                          <td className="text-right py-1 text-gray-900 font-semibold text-xs">
                            {formatCurrency(product.sellingPrice * item.quantity)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="text-xs">
                  <p className="text-gray-600 mb-0.5">Ghi chú:</p>
                  <p className="text-gray-900 italic">{order.notes}</p>
                </div>
              )}

              {/* Payment Info */}
              {order.payment && (
                <div className="space-y-0.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phương thức:</span>
                    <span className="text-gray-900">{order.payment.method}</span>
                  </div>
                  {order.payment.paidAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Đã thanh toán:</span>
                      <span className="text-gray-900">{formatCurrency(order.payment.paidAmount)}</span>
                    </div>
                  )}
                  {order.payment.remainingAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Còn lại:</span>
                      <span className="text-gray-900">{formatCurrency(order.payment.remainingAmount)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Total */}
              <div className="border-t-2 border-gray-900 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">TỔNG CỘNG:</span>
                  <span className="text-xl font-bold text-gray-900">{formatCurrency(calculateTotal())}</span>
                </div>
              </div>

              {/* QR Code - Chính giữa */}
              {order.payment?.method === PaymentMethod.TRANSFER && bankSettings && getRemainingAmount() > 0 && getQRCodeUrl() && (
                <div className="flex flex-col items-center justify-center my-3">
                  <div className="bg-white p-3 rounded-lg border-2 border-gray-300" style={{ width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img 
                      src={getQRCodeUrl() || ''} 
                      alt="QR Code thanh toán" 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="text-center text-red-500 p-2 text-xs"><p>Không thể tải QR</p></div>';
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-2 text-center text-xs text-gray-600">
              <p>Cảm ơn quý khách đã sử dụng dịch vụ!</p>
              <p className="mt-0.5">Hẹn gặp lại quý khách lần sau</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoicePrint;
