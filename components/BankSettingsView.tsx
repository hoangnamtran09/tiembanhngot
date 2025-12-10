import React, { useState, useEffect } from 'react';
import { BankSettings, QRTemplate } from '../types';
import { StorageService } from '../services/storageService';
import { Building2, Save, Eye, EyeOff } from 'lucide-react';
import InputCurrency from './InputCurrency';
import QRCodeDisplay from './QRCodeDisplay';

const BankSettingsView: React.FC = () => {
  const [settings, setSettings] = useState<BankSettings>({
    bankId: '970415',
    bankName: 'VietinBank',
    accountNumber: '',
    accountName: '',
    isActive: true,
    template: 'compact'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [previewAmount, setPreviewAmount] = useState(100000);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    const data = await StorageService.getBankSettings();
    if (data) {
      setSettings(data);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!settings.accountNumber || !settings.accountName) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    setIsSaving(true);
    await StorageService.saveBankSettings(settings);
    setIsSaving(false);
    alert('Đã lưu cài đặt ngân hàng!');
  };

  // Danh sách ngân hàng phổ biến
  const popularBanks = [
    { id: '970415', name: 'VietinBank' },
    { id: '970422', name: 'MB Bank' },
    { id: '970407', name: 'Techcombank' },
    { id: '970416', name: 'ACB' },
    { id: '970418', name: 'BIDV' },
    { id: '970405', name: 'Agribank' },
    { id: '970403', name: 'Sacombank' },
    { id: '970436', name: 'Vietcombank' },
    { id: '970448', name: 'OCB' },
    { id: '970454', name: 'VietCapital Bank' },
    { id: '970423', name: 'TPBank' },
    { id: '970437', name: 'HDBank' },
    { id: '970432', name: 'VPBank' },
    { id: '970426', name: 'MSB' },
    { id: '546034', name: 'Cake by VPBank' },
    { id: '963388', name: 'Timo' }
  ];

  const templates: { value: QRTemplate; label: string; desc: string }[] = [
    { value: 'compact', label: 'Compact', desc: 'Gọn gàng, có logo ngân hàng' },
    { value: 'compact2', label: 'Compact 2', desc: 'Gọn gàng, không logo' },
    { value: 'qr_only', label: 'QR Only', desc: 'Chỉ mã QR, không thông tin' },
    { value: 'print', label: 'Print', desc: 'Đầy đủ thông tin, dùng in ấn' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mb-4"></div>
          <p className="text-gray-600">Đang tải cài đặt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto pb-20 md:pb-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Building2 className="text-rose-500" />
          Cài Đặt Ngân Hàng
        </h2>
        <p className="text-gray-500">Cấu hình tài khoản ngân hàng để tạo mã QR chuyển khoản</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Thông Tin Tài Khoản</h3>
          
          <div className="space-y-4">
            {/* Bank Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngân hàng <span className="text-red-500">*</span>
              </label>
              <select
                value={settings.bankId}
                onChange={(e) => {
                  const bank = popularBanks.find(b => b.id === e.target.value);
                  setSettings({
                    ...settings,
                    bankId: e.target.value,
                    bankName: bank?.name || ''
                  });
                }}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-rose-500 outline-none"
              >
                {popularBanks.map(bank => (
                  <option key={bank.id} value={bank.id}>
                    {bank.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số tài khoản <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showAccountNumber ? 'text' : 'password'}
                  value={settings.accountNumber}
                  onChange={(e) => setSettings({ ...settings, accountNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 pr-12 focus:ring-2 focus:ring-rose-500 outline-none font-mono"
                  placeholder="1234567890"
                />
                <button
                  type="button"
                  onClick={() => setShowAccountNumber(!showAccountNumber)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showAccountNumber ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Account Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên chủ tài khoản <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={settings.accountName}
                onChange={(e) => setSettings({ ...settings, accountName: e.target.value.toUpperCase() })}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-rose-500 outline-none uppercase"
                placeholder="NGUYEN VAN A"
              />
              <p className="text-xs text-gray-500 mt-1">* Nhập chính xác như trên tài khoản ngân hàng (in hoa, không dấu)</p>
            </div>

            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kiểu mã QR
              </label>
              <div className="space-y-2">
                {templates.map(tmpl => (
                  <label
                    key={tmpl.value}
                    className={`flex items-start p-3 border rounded-lg cursor-pointer transition-all ${
                      settings.template === tmpl.value
                        ? 'border-rose-500 bg-rose-50'
                        : 'border-gray-200 hover:border-rose-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="template"
                      value={tmpl.value}
                      checked={settings.template === tmpl.value}
                      onChange={(e) => setSettings({ ...settings, template: e.target.value as QRTemplate })}
                      className="mt-1 text-rose-500 focus:ring-rose-500"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-800">{tmpl.label}</p>
                      <p className="text-xs text-gray-500">{tmpl.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Lưu Cài Đặt
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview QR */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Xem Trước Mã QR</h3>
          
          {settings.accountNumber && settings.accountName ? (
            <div className="space-y-4">
              {/* Amount Input for Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tiền mẫu (để xem trước)
                </label>
                <InputCurrency
                  value={previewAmount}
                  onChange={(amount) => setPreviewAmount(amount)}
                  placeholder="100000"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              {/* QR Preview */}
              <QRCodeDisplay
                bankSettings={settings}
                amount={previewAmount}
                description="Don hang mau"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Building2 size={64} className="mb-4 text-gray-300" />
              <p className="text-center">
                Điền thông tin tài khoản<br />để xem trước mã QR
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankSettingsView;

