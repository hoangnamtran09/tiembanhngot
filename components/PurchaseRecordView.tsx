import React, { useState, useEffect } from 'react';
import { PurchaseRecord, Ingredient } from '../types';
import { StorageService } from '../services/storageService';
import { Plus, Search, Trash2, Edit2, ShoppingCart } from 'lucide-react';
import { formatCurrency, formatQuantity } from '../utils/format';
import InputCurrency from './InputCurrency';

interface PurchaseRecordViewProps {
  ingredients: Ingredient[];
  setIngredients: (ingredients: Ingredient[]) => void;
}

const PurchaseRecordView: React.FC<PurchaseRecordViewProps> = ({ ingredients, setIngredients }) => {
  const [records, setRecords] = useState<PurchaseRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<PurchaseRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<PurchaseRecord>>({
    ingredientId: '',
    quantity: 0,
    price: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    supplier: '',
    notes: ''
  });

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    const data = await StorageService.getPurchaseRecords();
    setRecords(data);
  };

  const handleSave = async () => {
    if (!formData.ingredientId || !formData.quantity || !formData.price) return;

    const record: PurchaseRecord = {
      id: selectedRecord?.id || Date.now().toString(),
      ingredientId: formData.ingredientId!,
      quantity: formData.quantity!,
      price: formData.price!,
      purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate + 'T00:00:00').toISOString() : new Date().toISOString(),
      supplier: formData.supplier,
      notes: formData.notes,
      createdAt: selectedRecord?.createdAt || new Date().toISOString()
    };

    if (selectedRecord) {
      const updated = records.map(r => r.id === record.id ? record : r);
      setRecords(updated);
    } else {
      setRecords([...records, record]);
    }

    await StorageService.savePurchaseRecord(record);
    await loadRecords();
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await StorageService.deletePurchaseRecord(id);
    await loadRecords();
    setDeleteConfirm(null);
  };

  const handleEdit = (record: PurchaseRecord) => {
    setSelectedRecord(record);
    setFormData({
      ingredientId: record.ingredientId,
      quantity: record.quantity,
      price: record.price,
      purchaseDate: new Date(record.purchaseDate).toISOString().split('T')[0],
      supplier: record.supplier,
      notes: record.notes
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      ingredientId: '',
      quantity: 0,
      price: 0,
      purchaseDate: new Date().toISOString().split('T')[0],
      supplier: '',
      notes: ''
    });
    setSelectedRecord(null);
  };

  const filteredRecords = records.filter(r => {
    const ingredient = ingredients.find(i => i.id === r.ingredientId);
    return ingredient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           r.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalSpent = records.reduce((sum, r) => sum + r.price, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto h-screen flex flex-col pb-20 md:pb-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lịch Sử Mua Hàng</h2>
          <p className="text-sm text-gray-600 mt-1">Quản lý chi phí mua nguyên liệu</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600">Tổng chi phí</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
          </div>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={20} />
            <span>Thêm Giao Dịch</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
          />
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex-1 overflow-y-auto">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Ngày mua</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Nguyên liệu</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Số lượng</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Giá</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Nhà cung cấp</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Ghi chú</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.map(record => {
                const ingredient = ingredients.find(i => i.id === record.ingredientId);
                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {new Date(record.purchaseDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {ingredient?.name || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-700">
                      {formatQuantity(record.quantity, ingredient?.unit || 'g')}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                      {formatCurrency(record.price)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{record.supplier || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{record.notes || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(record)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                          title="Sửa"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(record.id)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredRecords.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Chưa có giao dịch nào
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingCart className="text-gray-700" />
              {selectedRecord ? 'Sửa Giao Dịch' : 'Thêm Giao Dịch Mua Hàng'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nguyên liệu *</label>
                <select
                  value={formData.ingredientId || ''}
                  onChange={(e) => setFormData({ ...formData, ingredientId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-gray-900 outline-none"
                >
                  <option value="">Chọn nguyên liệu</option>
                  {ingredients.map(ing => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng mua *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.quantity || ''}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-gray-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tổng tiền *</label>
                <InputCurrency
                  value={formData.price || 0}
                  onChange={(price) => setFormData({ ...formData, price })}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-gray-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày mua *</label>
                <input
                  type="date"
                  value={formData.purchaseDate || ''}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-gray-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nhà cung cấp</label>
                <input
                  type="text"
                  value={formData.supplier || ''}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-gray-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-gray-900 outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Xác nhận xóa</h3>
            <p className="text-gray-600 mb-6">Bạn có chắc muốn xóa giao dịch này?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseRecordView;

