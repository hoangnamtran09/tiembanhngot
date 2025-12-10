import React from 'react';
import { BankSettings } from '../types';
import { QrCode, Download } from 'lucide-react';
import { formatCurrency } from '../utils/format';

interface QRCodeDisplayProps {
  bankSettings: BankSettings;
  amount: number;
  description?: string;
}

/**
 * Component hiển thị QR Code chuyển khoản động
 * Sử dụng VietQR API: https://api.vietqr.io
 */
const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
  bankSettings, 
  amount, 
  description = 'Thanh toan don hang' 
}) => {
  if (amount <= 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
        <QrCode size={48} className="text-gray-300 mb-2" />
        <p className="text-sm text-gray-500">Nhập số tiền để tạo mã QR</p>
      </div>
    );
  }

  // VietQR API URL
  // Format: https://img.vietqr.io/image/{BANK_ID}-{ACCOUNT_NO}-{TEMPLATE}.png?amount={AMOUNT}&addInfo={DESCRIPTION}&accountName={ACCOUNT_NAME}
  const qrUrl = `https://img.vietqr.io/image/${bankSettings.bankId}-${bankSettings.accountNumber}-${bankSettings.template}.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(bankSettings.accountName)}`;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `QR-${amount}d-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-2">
      {/* Main Layout: QR + Info (Horizontal) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Left: QR Code */}
        <div className="flex flex-col items-center">
          <div className="relative bg-white p-2 rounded-lg border-2 border-rose-200 w-full max-w-[180px]">
            <img 
              src={qrUrl} 
              alt="QR Code thanh toán" 
              className="w-full h-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = '<div class="text-center text-red-500 p-4"><p class="text-xs">Không thể tải QR</p></div>';
                }
              }}
            />
          </div>
          <button
            onClick={handleDownload}
            className="mt-2 w-full max-w-[180px] flex items-center justify-center gap-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-xs font-medium"
          >
            <Download size={12} />
            Tải QR
          </button>
        </div>

        {/* Right: Bank Info */}
        <div className="flex flex-col justify-between">
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-2.5 rounded-lg border border-rose-100 h-full">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between gap-2">
                <span className="text-gray-600 flex-shrink-0">NH:</span>
                <span className="font-semibold text-gray-800 text-right">{bankSettings.bankName}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-gray-600 flex-shrink-0">STK:</span>
                <span className="font-mono font-semibold text-gray-800 text-right text-[11px]">{bankSettings.accountNumber}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-gray-600 flex-shrink-0">Tên:</span>
                <span className="font-semibold text-gray-800 text-right break-words text-[11px]">{bankSettings.accountName}</span>
              </div>
              <div className="flex justify-between gap-2 pt-1 border-t border-rose-200">
                <span className="text-gray-600 flex-shrink-0 font-semibold">Số tiền:</span>
                <span className="font-bold text-rose-600 text-sm">{formatCurrency(amount)}</span>
              </div>
              {description && (
                <div className="flex justify-between gap-2 text-[11px]">
                  <span className="text-gray-600 flex-shrink-0">ND:</span>
                  <span className="font-medium text-gray-700 text-right break-words">{description}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Instructions */}
      <div className="bg-blue-50 p-2 rounded-lg">
        <p className="text-xs text-blue-800 text-center">
          <span className="font-semibold">📱 Mở app ngân hàng</span> → Quét QR → Xác nhận
        </p>
      </div>
    </div>
  );
};

export default QRCodeDisplay;

