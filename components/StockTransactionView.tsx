import React, { useState, useEffect } from 'react';
import { StockTransaction, Ingredient } from '../types';
import { StorageService } from '../services/storageService';
import { Plus, Search, Trash2, ArrowDown, ArrowUp } from 'lucide-react';
import { formatQuantity } from '../utils/format';

interface StockTransactionViewProps {
  ingredients: Ingredient[];
  setIngredients: (ingredients: Ingredient[]) => void;
}

const StockTransactionView: React.FC<StockTransactionViewProps> = ({ ingredients, setIngredients }) => {
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<StockTransaction>>({
    ingredientId: '',
    type: 'IN',
    quantity: 0,
    reason: '',
    notes: ''
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    const data = await StorageService.getStockTransactions();
    setTransactions(data);
  };

  const handleSave = async () => {
    if (!formData.ingredientId || !formData.quantity || !formData.reason) return;

    const transaction: StockTransaction = {
      id: Date.now().toString(),
      ingredientId: formData.ingredientId!,
      type: formData.type as 'IN' | 'OUT',
      quantity: formData.quantity!,
      reason: formData.reason!,
      notes: formData.notes,
      transactionDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    // Update ingredient stock
    const ingredient = ingredients.find(i => i.id === transaction.ingredientId);
    if (ingredient) {
      const updatedIngredients = ingredients.map(ing => {
        if (ing.id === transaction.ingredientId) {
          const newStock = transaction.type === 'IN'
            ? ing.currentStock + transaction.quantity
            : ing.currentStock - transaction.quantity;
          return { ...ing, currentStock: Math.max(0, newStock) };
        }
        return ing;
      });
      setIngredients(updatedIngredients);
      await StorageService.saveIngredients(updatedIngredients);
    }

    // Save transaction
    await StorageService.saveStockTransaction(transaction);
    await loadTransactions();
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
      // Reverse the stock change
      const ingredient = ingredients.find(i => i.id === transaction.ingredientId);
      if (ingredient) {
        const updatedIngredients = ingredients.map(ing => {
          if (ing.id === transaction.ingredientId) {
            const newStock = transaction.type === 'IN'
              ? ing.currentStock - transaction.quantity
              : ing.currentStock + transaction.quantity;
            return { ...ing, currentStock: Math.max(0, newStock) };
          }
          return ing;
        });
        setIngredients(updatedIngredients);
        await StorageService.saveIngredients(updatedIngredients);
      }
    }

    await StorageService.deleteStockTransaction(id);
    await loadTransactions();
    setDeleteConfirm(null);
  };

  const resetForm = () => {
    setFormData({
      ingredientId: '',
      type: 'IN',
      quantity: 0,
      reason: '',
      notes: ''
    });
  };

  const filteredTransactions = transactions.filter(t => {
    const ingredient = ingredients.find(i => i.id === t.ingredientId);
    return ingredient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           t.reason.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-6 max-w-7xl mx-auto h-screen flex flex-col pb-20 md:pb-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Xuất/Nhập Kho</h2>
          <p className="text-sm text-gray-600 mt-1">Quản lý xuất nhập kho nguyên liệu thủ công</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          <span>Thêm Giao Dịch</span>
        </button>
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

      {/* Transactions Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Ngày</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Nguyên liệu</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Loại</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Số lượng</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Lý do</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Ghi chú</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map(transaction => {
                const ingredient = ingredients.find(i => i.id === transaction.ingredientId);
                return (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {new Date(transaction.transactionDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {ingredient?.name || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {transaction.type === 'IN' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                          <ArrowDown size={14} />
                          Nhập
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                          <ArrowUp size={14} />
                          Xuất
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900">
                      {formatQuantity(transaction.quantity, ingredient?.usageUnit || 'g')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{transaction.reason}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{transaction.notes || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setDeleteConfirm(transaction.id)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Chưa có giao dịch nào
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Thêm Giao Dịch Kho</h3>

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
                      {ing.name} ({formatQuantity(ing.currentStock, ing.usageUnit)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'IN' })}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      formData.type === 'IN'
                        ? 'border-gray-900 bg-gray-100 text-gray-900 font-semibold'
                        : 'border-gray-200 bg-white text-gray-600'
                    }`}
                  >
                    Nhập kho
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'OUT' })}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      formData.type === 'OUT'
                        ? 'border-gray-900 bg-gray-100 text-gray-900 font-semibold'
                        : 'border-gray-200 bg-white text-gray-600'
                    }`}
                  >
                    Xuất kho
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.quantity || ''}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-gray-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lý do *</label>
                <input
                  type="text"
                  value={formData.reason || ''}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="VD: Nhập hàng mới, Điều chỉnh, Hư hỏng..."
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-gray-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
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
            <p className="text-gray-600 mb-6">Bạn có chắc muốn xóa giao dịch này? Thao tác này sẽ đảo ngược thay đổi tồn kho.</p>
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

export default StockTransactionView;

