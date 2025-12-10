import React, { useState, useEffect, useRef } from 'react';
import { Ingredient, Product, RecipeItem } from '../types';
import { Plus, Trash2, ChevronRight, Calculator, Check, Search, Edit2 } from 'lucide-react';

interface RecipeViewProps {
  products: Product[];
  ingredients: Ingredient[];
  setProducts: (products: Product[]) => void;
}

const RecipeView: React.FC<RecipeViewProps> = ({ products, ingredients, setProducts }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isAddIngredientOpen, setIsAddIngredientOpen] = useState(false);
  const [ingredientSearchTerm, setIngredientSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAddIngredientOpen(false);
        setIngredientSearchTerm('');
      }
    };

    if (isAddIngredientOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAddIngredientOpen]);
  
  // Edit/Create State
  const [editForm, setEditForm] = useState<Partial<Product>>({
    name: '',
    description: '',
    sellingPrice: 0,
    category: 'Cake',
    recipe: []
  });

  const calculateCost = (recipe: RecipeItem[]) => {
    return recipe.reduce((total, item) => {
      const ing = ingredients.find(i => i.id === item.ingredientId);
      if (!ing || ing.buyingQuantity === 0) return total;
      const unitCost = ing.price / ing.buyingQuantity;
      return total + (unitCost * item.quantity);
    }, 0);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditForm(product);
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setSelectedProduct(null);
    setEditForm({
      name: '',
      description: '',
      sellingPrice: 0,
      category: 'Cake',
      recipe: []
    });
    setIsCreating(true);
  };

  const handleSave = () => {
    if (!editForm.name) return;

    if (selectedProduct && !isCreating) {
      // Update
      const updated = products.map(p => p.id === selectedProduct.id ? { ...p, ...editForm } as Product : p);
      setProducts(updated);
      setSelectedProduct({ ...editForm, id: selectedProduct.id } as Product);
    } else {
      // Create
      const newProduct: Product = {
        ...editForm as Product,
        id: Date.now().toString(),
      };
      setProducts([...products, newProduct]);
      setIsCreating(false);
      setSelectedProduct(newProduct);
    }
  };

  const addIngredientToRecipe = (ingredientId: string) => {
    const currentRecipe = editForm.recipe || [];
    if (currentRecipe.find(r => r.ingredientId === ingredientId)) return;
    setEditForm({
      ...editForm,
      recipe: [...currentRecipe, { ingredientId, quantity: 1 }]
    });
    setIsAddIngredientOpen(false); // Close dropdown after adding
    setIngredientSearchTerm(''); // Clear search
  };

  const updateIngredientQuantity = (ingredientId: string, quantity: number) => {
    const currentRecipe = editForm.recipe || [];
    setEditForm({
      ...editForm,
      recipe: currentRecipe.map(r => r.ingredientId === ingredientId ? { ...r, quantity } : r)
    });
  };

  const removeIngredientFromRecipe = (ingredientId: string) => {
    const currentRecipe = editForm.recipe || [];
    setEditForm({
      ...editForm,
      recipe: currentRecipe.filter(r => r.ingredientId !== ingredientId)
    });
  };

  const handleDeleteProduct = (productId: string) => {
    const updated = products.filter(p => p.id !== productId);
    setProducts(updated);
    if (selectedProduct?.id === productId) {
      setSelectedProduct(null);
    }
    setDeleteConfirm(null);
  };

  const totalCost = calculateCost(editForm.recipe || []);
  const profitMargin = editForm.sellingPrice ? ((editForm.sellingPrice - totalCost) / editForm.sellingPrice) * 100 : 0;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50/50">
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (() => {
        const product = products.find(p => p.id === deleteConfirm);
        if (!product) return null;

        const productCost = calculateCost(product.recipe);
        const profit = product.sellingPrice - productCost;

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
                <p className="text-sm text-gray-600 mb-2">Bạn có chắc muốn xóa công thức:</p>
                <p className="font-semibold text-gray-800 text-lg">{product.name}</p>
                <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                <div className="mt-3 space-y-1 text-sm text-gray-600">
                  <p>• Danh mục: <span className="font-medium">{product.category}</span></p>
                  <p>• Giá bán: <span className="font-medium text-rose-600">{product.sellingPrice.toLocaleString()}đ</span></p>
                  <p>• Giá vốn: <span className="font-medium">{Math.round(productCost).toLocaleString()}đ</span></p>
                  <p>• Lợi nhuận: <span className="font-medium text-green-600">{Math.round(profit).toLocaleString()}đ</span></p>
                  <p>• Số nguyên liệu: <span className="font-medium">{product.recipe.length} loại</span></p>
                </div>
                <p className="text-xs text-amber-600 mt-3 bg-amber-50 p-2 rounded">
                  ⚠️ Lưu ý: Đơn hàng có sản phẩm này sẽ không tính được tổng tiền chính xác!
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
                  onClick={() => handleDeleteProduct(product.id)}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
                >
                  Xóa công thức
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      
      {/* List Sidebar */}
      <div className="w-1/3 border-r border-gray-200 bg-white flex flex-col pt-14 md:pt-0">
         <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-gray-800 text-lg">Danh Sách Bánh</h2>
            <button 
              onClick={handleCreateNew}
              className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
            >
              <Plus size={20} />
            </button>
         </div>
         <div className="overflow-y-auto flex-1">
            {products.map(product => (
              <div 
                key={product.id}
                className={`p-4 border-b border-gray-50 transition-colors hover:bg-rose-50/50 group ${
                  selectedProduct?.id === product.id && !isCreating ? 'bg-rose-50 border-rose-200' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 
                    className="font-semibold text-gray-800 cursor-pointer flex-1"
                    onClick={() => handleEdit(product)}
                  >
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{product.category}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(product.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 rounded transition-all"
                      title="Xóa công thức"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div 
                  className="flex justify-between text-sm text-gray-500 cursor-pointer"
                  onClick={() => handleEdit(product)}
                >
                  <span>Giá bán: {product.sellingPrice.toLocaleString()}đ</span>
                  <span className="flex items-center gap-1 text-rose-500">
                     <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            ))}
         </div>
      </div>

      {/* Detail View */}
      <div className="w-2/3 p-8 overflow-y-auto pt-20 md:pt-8">
        {(selectedProduct || isCreating) ? (
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            {/* Header Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Edit2 size={18} className="text-rose-500"/> 
                Thông Tin Cơ Bản
              </h3>
              <div className="grid grid-cols-2 gap-6">
                 <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên bánh</label>
                    <input 
                      type="text" 
                      value={editForm.name}
                      onChange={e => setEditForm({...editForm, name: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-500 outline-none"
                    />
                 </div>
                 <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
                    <input 
                      type="text" 
                      value={editForm.description}
                      onChange={e => setEditForm({...editForm, description: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-500 outline-none"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (VNĐ)</label>
                    <input 
                      type="number" 
                      value={editForm.sellingPrice}
                      onChange={e => setEditForm({...editForm, sellingPrice: Number(e.target.value)})}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-500 outline-none"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                    <select
                      value={editForm.category}
                      onChange={e => setEditForm({...editForm, category: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-500 outline-none"
                    >
                      <option value="Cake">Bánh Kem / Gato</option>
                      <option value="Bread">Bánh Mì</option>
                      <option value="Cookie">Cookies</option>
                      <option value="Mousse">Mousse / Cheesecake</option>
                      <option value="Other">Khác</option>
                    </select>
                 </div>
              </div>
            </div>

            {/* Recipe / BOM */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Calculator size={18} className="text-rose-500"/>
                    Công Thức & Costing
                  </h3>
                  
                  <div className="relative" ref={dropdownRef}>
                     <button 
                       onClick={() => setIsAddIngredientOpen(!isAddIngredientOpen)}
                       className="flex items-center gap-2 text-sm text-rose-600 font-medium hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors"
                     >
                       <Plus size={16} /> Thêm nguyên liệu
                     </button>
                     
                     {/* Dropdown for adding ingredients */}
                     {isAddIngredientOpen && (
                       <div className="absolute right-0 top-full mt-2 w-64 bg-white shadow-xl rounded-lg border border-gray-100 z-10 p-2 max-h-60 overflow-y-auto">
                          <input 
                            type="text" 
                            placeholder="Tìm nguyên liệu..." 
                            value={ingredientSearchTerm}
                            onChange={(e) => setIngredientSearchTerm(e.target.value)}
                            className="w-full text-sm border border-gray-300 p-2 rounded mb-2 focus:ring-2 focus:ring-rose-500 outline-none"
                            autoFocus
                          />
                          <div className="space-y-1">
                            {ingredients
                              .filter(ing => 
                                ing.name.toLowerCase().includes(ingredientSearchTerm.toLowerCase())
                              )
                              .map(ing => {
                                const alreadyAdded = editForm.recipe?.find(r => r.ingredientId === ing.id);
                                return (
                                  <div 
                                    key={ing.id} 
                                    onClick={() => !alreadyAdded && addIngredientToRecipe(ing.id)}
                                    className={`px-3 py-2 rounded cursor-pointer text-sm flex justify-between items-center ${
                                      alreadyAdded 
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                        : 'hover:bg-rose-50 hover:text-rose-700'
                                    }`}
                                  >
                                    <span className="truncate">{ing.name}</span>
                                    {alreadyAdded && (
                                      <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">Đã thêm</span>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                          {ingredients.filter(ing => 
                            ing.name.toLowerCase().includes(ingredientSearchTerm.toLowerCase())
                          ).length === 0 && (
                            <div className="text-center text-gray-400 py-4 text-sm">
                              Không tìm thấy nguyên liệu
                            </div>
                          )}
                       </div>
                     )}
                  </div>
               </div>

               <div className="space-y-3">
                  {editForm.recipe?.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Chưa có nguyên liệu nào.</p>}
                  
                  {editForm.recipe?.map((item) => {
                    const ing = ingredients.find(i => i.id === item.ingredientId);
                    if (!ing) return null;
                    const unitCost = ing.buyingQuantity > 0 ? ing.price / ing.buyingQuantity : 0;
                    const itemCost = unitCost * item.quantity;
                    
                    return (
                      <div key={item.ingredientId} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                         <div className="flex-1">
                            <p className="font-medium text-gray-800 text-sm">{ing.name}</p>
                            <p className="text-xs text-gray-500">Giá gốc: {Math.round(unitCost).toLocaleString()}đ / {ing.unit}</p>
                         </div>
                         <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              value={item.quantity}
                              onChange={(e) => updateIngredientQuantity(item.ingredientId, Number(e.target.value))}
                              className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-right focus:border-rose-500 outline-none"
                            />
                            <span className="text-sm text-gray-500 w-8">{ing.unit}</span>
                         </div>
                         <div className="text-right w-24">
                            <p className="text-sm font-medium text-gray-800">{Math.round(itemCost).toLocaleString()}đ</p>
                         </div>
                         <button 
                            onClick={() => removeIngredientFromRecipe(item.ingredientId)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                         >
                            <Trash2 size={16} />
                         </button>
                      </div>
                    );
                  })}
               </div>

               <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-gray-600">Tổng giá vốn (Cost):</span>
                     <span className="text-xl font-bold text-gray-800">{Math.round(totalCost).toLocaleString()} đ</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-gray-600">Lợi nhuận gộp:</span>
                     <span className={`text-lg font-bold ${profitMargin > 50 ? 'text-green-600' : 'text-amber-600'}`}>
                        {((editForm.sellingPrice || 0) - totalCost).toLocaleString()} đ
                     </span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-gray-600">% Lợi nhuận (Margin):</span>
                     <span className={`text-sm font-medium px-2 py-1 rounded ${profitMargin > 50 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {profitMargin.toFixed(1)}%
                     </span>
                  </div>
               </div>
            </div>

            <div className="flex justify-end pt-4 pb-12">
               <button 
                  onClick={handleSave}
                  className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium shadow-lg shadow-rose-200 flex items-center gap-2 transition-all transform active:scale-95"
               >
                  <Check size={20} />
                  {isCreating ? 'Tạo Bánh Mới' : 'Lưu Thay Đổi'}
               </button>
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Calculator size={48} className="mb-4 text-gray-200" />
            <p>Chọn một loại bánh để xem chi tiết hoặc tạo mới.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeView;