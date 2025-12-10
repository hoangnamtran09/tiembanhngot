import React, { useState } from 'react';
import { Ingredient, Unit } from '../types';
import { Plus, Search, Edit2, Save, X, Trash2 } from 'lucide-react';

interface InventoryViewProps {
  ingredients: Ingredient[];
  setIngredients: (ingredients: Ingredient[]) => void;
}

const InventoryView: React.FC<InventoryViewProps> = ({ ingredients, setIngredients }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Ingredient>>({
    name: '',
    unit: Unit.KG,
    price: 0,
    buyingQuantity: 1,
    currentStock: 0,
    minThreshold: 0
  });

  const handleOpenModal = (ingredient?: Ingredient) => {
    if (ingredient) {
      setEditingId(ingredient.id);
      setFormData(ingredient);
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        unit: Unit.KG,
        price: 0,
        buyingQuantity: 1,
        currentStock: 0,
        minThreshold: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.price) return;

    if (editingId) {
      // Update
      const updated = ingredients.map(ing => ing.id === editingId ? { ...ing, ...formData } as Ingredient : ing);
      setIngredients(updated);
    } else {
      // Create
      const newIngredient: Ingredient = {
        ...formData as Ingredient,
        id: Date.now().toString(),
      };
      setIngredients([...ingredients, newIngredient]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (ingredientId: string) => {
    const updated = ingredients.filter(ing => ing.id !== ingredientId);
    setIngredients(updated);
    setDeleteConfirm(null);
  };

  const filteredIngredients = ingredients.filter(ing => 
    ing.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateUnitCost = (ing: Ingredient) => {
    if (ing.buyingQuantity === 0) return 0;
    return ing.price / ing.buyingQuantity;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Kho Nguyên Liệu</h2>
          <p className="text-gray-500">Quản lý nhập xuất tồn và giá vốn</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span>Thêm Nguyên Liệu</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm nguyên liệu..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Tên Nguyên Liệu</th>
                <th className="px-6 py-4">Tồn Kho</th>
                <th className="px-6 py-4">Đơn Vị Mua</th>
                <th className="px-6 py-4">Giá Mua</th>
                <th className="px-6 py-4">Giá Vốn / Đơn Vị</th>
                <th className="px-6 py-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredIngredients.map((ing) => {
                return (
                  <tr key={ing.id} className="hover:bg-rose-50/30 transition-colors group">
                    <td className="px-6 py-4 font-medium text-gray-800 flex items-center gap-2">
                      {ing.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {ing.currentStock} {ing.unit}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {ing.buyingQuantity} {ing.unit}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {ing.price.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="px-6 py-4 text-gray-800 font-medium">
                      {Math.round(calculateUnitCost(ing)).toLocaleString('vi-VN')} đ / {ing.unit}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(ing)}
                          className="text-gray-400 hover:text-rose-500 p-1 rounded-md transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm(ing.id)}
                          className="text-gray-400 hover:text-red-500 p-1 rounded-md transition-colors"
                          title="Xóa nguyên liệu"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredIngredients.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            Không tìm thấy nguyên liệu nào.
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (() => {
        const ingredient = ingredients.find(ing => ing.id === deleteConfirm);
        if (!ingredient) return null;

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
                <p className="text-sm text-gray-600 mb-2">Bạn có chắc muốn xóa nguyên liệu:</p>
                <p className="font-semibold text-gray-800 text-lg">{ingredient.name}</p>
                <div className="mt-3 space-y-1 text-sm text-gray-600">
                  <p>• Tồn kho: <span className="font-medium">{ingredient.currentStock} {ingredient.unit}</span></p>
                  <p>• Giá: <span className="font-medium">{ingredient.price.toLocaleString()}đ</span></p>
                </div>
                <p className="text-xs text-amber-600 mt-3 bg-amber-50 p-2 rounded">
                  ⚠️ Lưu ý: Các công thức đang sử dụng nguyên liệu này có thể bị ảnh hưởng!
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
                  onClick={() => handleDelete(ingredient.id)}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
                >
                  Xóa nguyên liệu
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {editingId ? 'Cập nhật nguyên liệu' : 'Thêm nguyên liệu mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên nguyên liệu</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị tính</label>
                  <select
                    value={formData.unit}
                    onChange={e => setFormData({...formData, unit: e.target.value as Unit})}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-500 outline-none"
                  >
                    {Object.values(Unit).map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá nhập (VNĐ)</label>
                  <input 
                    type="number" 
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng mua</label>
                  <input 
                    type="number" 
                    value={formData.buyingQuantity}
                    onChange={e => setFormData({...formData, buyingQuantity: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-500 outline-none"
                    placeholder="VD: 1000 (g)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Lượng tương ứng với giá mua</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho hiện tại</label>
                  <input 
                    type="number" 
                    value={formData.currentStock}
                    onChange={e => setFormData({...formData, currentStock: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cảnh báo khi tồn kho dưới</label>
                <input 
                  type="number" 
                  value={formData.minThreshold}
                  onChange={e => setFormData({...formData, minThreshold: Number(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div className="bg-rose-50 p-3 rounded-lg text-sm text-rose-800">
                Giá vốn ước tính: <span className="font-bold">
                  {formData.buyingQuantity && formData.price 
                    ? Math.round(formData.price / formData.buyingQuantity).toLocaleString() 
                    : 0} đ / {formData.unit}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg flex items-center gap-2 shadow-md shadow-rose-200 transition-all"
              >
                <Save size={18} />
                Lưu lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryView;
