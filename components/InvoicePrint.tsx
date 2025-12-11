import React from 'react';
import { Order, Product } from '../types';
import { formatCurrency } from '../utils/format';
import { Printer, X } from 'lucide-react';

interface InvoicePrintProps {
  order: Order;
  products: Product[];
  onClose: () => void;
}

const InvoicePrint: React.FC<InvoicePrintProps> = ({ order, products, onClose }) => {
  const calculateTotal = () => {
    return order.items.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.sellingPrice * item.quantity : 0);
    }, 0);
  };

  const handlePrint = () => {
    window.print();
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
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 no-print">
        <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center no-print">
            <h2 className="text-xl font-bold text-gray-900">Hóa Đơn</h2>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
              >
                <Printer size={18} />
                In
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Invoice Content */}
          <div className="invoice-content p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">TIỆM BÁNH NGỌT</h1>
              <p className="text-gray-600">Hóa đơn bán hàng</p>
            </div>

            {/* Order Info */}
            <div className="mb-6 space-y-2">
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
            <div className="border-t border-b border-gray-300 py-4 mb-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-2 text-gray-700 font-semibold">Sản phẩm</th>
                    <th className="text-center py-2 text-gray-700 font-semibold">SL</th>
                    <th className="text-right py-2 text-gray-700 font-semibold">Đơn giá</th>
                    <th className="text-right py-2 text-gray-700 font-semibold">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => {
                    const product = products.find(p => p.id === item.productId);
                    if (!product) return null;
                    return (
                      <tr key={idx} className="border-b border-gray-200">
                        <td className="py-2 text-gray-900">{product.name}</td>
                        <td className="text-center py-2 text-gray-700">{item.quantity}</td>
                        <td className="text-right py-2 text-gray-700">{formatCurrency(product.sellingPrice)}</td>
                        <td className="text-right py-2 text-gray-900 font-semibold">
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
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Ghi chú:</p>
                <p className="text-gray-900 italic">{order.notes}</p>
              </div>
            )}

            {/* Payment Info */}
            {order.payment && (
              <div className="mb-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phương thức:</span>
                  <span className="text-gray-900">{order.payment.method}</span>
                </div>
                {order.payment.paidAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Đã thanh toán:</span>
                    <span className="text-gray-900">{formatCurrency(order.payment.paidAmount)}</span>
                  </div>
                )}
                {order.payment.remainingAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Còn lại:</span>
                    <span className="text-gray-900">{formatCurrency(order.payment.remainingAmount)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Total */}
            <div className="border-t-2 border-gray-900 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900">TỔNG CỘNG:</span>
                <span className="text-2xl font-bold text-gray-900">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-gray-600">
              <p>Cảm ơn quý khách đã sử dụng dịch vụ!</p>
              <p className="mt-2">Hẹn gặp lại quý khách lần sau</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoicePrint;

