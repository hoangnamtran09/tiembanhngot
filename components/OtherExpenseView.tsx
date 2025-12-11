import React, { useState, useEffect } from 'react';
import { OtherExpense } from '../types';
import { StorageService } from '../services/storageService';
import { Plus, Search, Trash2, Edit2, Receipt } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import InputCurrency from './InputCurrency';

const OtherExpenseView: React.FC = () => {
  const [expenses, setExpenses] = useState<OtherExpense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<OtherExpense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<OtherExpense>>({
    category: 'Khác',
    amount: 0,
    description: '',
    expenseDate: new Date().toISOString().split('T')[0]
  });

  const categories = ['Điện', 'Nước', 'Ship', 'Dụng cụ', 'Khác'];

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    const data = await StorageService.getOtherExpenses();
    setExpenses(data);
  };

  const handleSave = async () => {
    if (!formData.category || !formData.amount || !formData.description) return;

    const expense: OtherExpense = {
      id: selectedExpense?.id || Date.now().toString(),
      category: formData.category!,
      amount: formData.amount!,
      description: formData.description!,
      expenseDate: formData.expenseDate ? new Date(formData.expenseDate + 'T00:00:00').toISOString() : new Date().toISOString(),
      createdAt: selectedExpense?.createdAt || new Date().toISOString()
    };

    if (selectedExpense) {
      const updated = expenses.map(e => e.id === expense.id ? expense : e);
      setExpenses(updated);
    } else {
      setExpenses([...expenses, expense]);
    }

    await StorageService.saveOtherExpense(expense);
    await loadExpenses();
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await StorageService.deleteOtherExpense(id);
    await loadExpenses();
    setDeleteConfirm(null);
  };

  const handleEdit = (expense: OtherExpense) => {
    setSelectedExpense(expense);
    setFormData({
      category: expense.category,
      amount: expense.amount,
      description: expense.description,
      expenseDate: new Date(expense.expenseDate).toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      category: 'Khác',
      amount: 0,
      description: '',
      expenseDate: new Date().toISOString().split('T')[0]
    });
    setSelectedExpense(null);
  };

  const filteredExpenses = expenses.filter(e =>
    e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const expensesByCategory = categories.map(cat => ({
    category: cat,
    total: expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto h-screen flex flex-col pb-20 md:pb-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Chi Phí Khác</h2>
          <p className="text-sm text-gray-600 mt-1">Quản lý chi phí điện, nước, ship, dụng cụ...</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600">Tổng chi phí</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
          </div>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={20} />
            <span>Thêm Chi Phí</span>
          </button>
        </div>
      </div>

      {/* Summary by Category */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {expensesByCategory.map(({ category, total }) => (
          <div key={category} className="bg-white p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">{category}</p>
            <p className="text-sm font-bold text-gray-900">{formatCurrency(total)}</p>
          </div>
        ))}
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

      {/* Expenses Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex-1 overflow-y-auto">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Ngày</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Danh mục</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Mô tả</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Số tiền</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredExpenses.map(expense => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {new Date(expense.expenseDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{expense.description}</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    {formatCurrency(expense.amount)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                        title="Sửa"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(expense.id)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredExpenses.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Chưa có chi phí nào
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Receipt className="text-gray-700" />
              {selectedExpense ? 'Sửa Chi Phí' : 'Thêm Chi Phí'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-gray-900 outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền *</label>
                <InputCurrency
                  value={formData.amount || 0}
                  onChange={(amount) => setFormData({ ...formData, amount })}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-gray-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả *</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-gray-900 outline-none resize-none"
                  placeholder="Mô tả chi phí..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày *</label>
                <input
                  type="date"
                  value={formData.expenseDate || ''}
                  onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-gray-900 outline-none"
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
            <p className="text-gray-600 mb-6">Bạn có chắc muốn xóa chi phí này?</p>
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

export default OtherExpenseView;

