import React from 'react';
import { BankSettings } from '../types';
import { QrCode, Download } from 'lucide-react';

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
    <div className="space-y-3">
      {/* QR Code Image */}
      <div className="relative bg-white p-3 rounded-lg border-2 border-rose-200 flex justify-center">
        <img 
          src={qrUrl} 
          alt="QR Code thanh toán" 
          className="w-full max-w-[200px] sm:max-w-[250px] h-auto"
          onError={(e) => {
            // Fallback nếu load lỗi
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = '<div class="text-center text-red-500 p-8"><p class="text-sm">Không thể tải QR code</p><p class="text-xs mt-2">Kiểm tra thông tin ngân hàng</p></div>';
            }
          }}
        />
      </div>

      {/* Bank Info */}
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-3 rounded-lg border border-rose-100">
        <div className="space-y-1.5 text-xs sm:text-sm">
          <div className="flex justify-between gap-2">
            <span className="text-gray-600 flex-shrink-0">Ngân hàng:</span>
            <span className="font-semibold text-gray-800 text-right">{bankSettings.bankName}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-gray-600 flex-shrink-0">Số TK:</span>
            <span className="font-mono font-semibold text-gray-800 text-right">{bankSettings.accountNumber}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-gray-600 flex-shrink-0">Chủ TK:</span>
            <span className="font-semibold text-gray-800 text-right break-words">{bankSettings.accountName}</span>
          </div>
          <div className="flex justify-between gap-2 pt-1.5 border-t border-rose-200">
            <span className="text-gray-600 flex-shrink-0">Số tiền:</span>
            <span className="font-bold text-rose-600 text-base sm:text-lg">{amount.toLocaleString()}đ</span>
          </div>
          {description && (
            <div className="flex justify-between gap-2">
              <span className="text-gray-600 flex-shrink-0">Nội dung:</span>
              <span className="font-medium text-gray-700 text-right break-words">{description}</span>
            </div>
          )}
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="w-full flex items-center justify-center gap-2 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-xs sm:text-sm font-medium"
      >
        <Download size={14} />
        Tải mã QR
      </button>

      {/* Instructions */}
      <div className="bg-blue-50 p-2.5 rounded-lg text-xs text-blue-800">
        <p className="font-semibold mb-1">📱 Hướng dẫn:</p>
        <ul className="space-y-0.5 list-disc list-inside text-[11px] leading-relaxed">
          <li>Mở app ngân hàng, chọn quét QR</li>
          <li>Quét mã QR ở trên</li>
          <li>Kiểm tra và xác nhận chuyển khoản</li>
        </ul>
      </div>
    </div>
  );
};

export default QRCodeDisplay;

