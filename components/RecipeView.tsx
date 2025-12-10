import React, { useState } from 'react';
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

  const totalCost = calculateCost(editForm.recipe || []);
  const profitMargin = editForm.sellingPrice ? ((editForm.sellingPrice - totalCost) / editForm.sellingPrice) * 100 : 0;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50/50">
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
                onClick={() => handleEdit(product)}
                className={`p-4 border-b border-gray-50 cursor-pointer transition-colors hover:bg-rose-50/50 ${
                  selectedProduct?.id === product.id && !isCreating ? 'bg-rose-50 border-rose-200' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-gray-800">{product.name}</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{product.category}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
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
                  
                  <div className="relative group">
                     <button className="flex items-center gap-2 text-sm text-rose-600 font-medium hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors">
                       <Plus size={16} /> Thêm nguyên liệu
                     </button>
                     {/* Simple Dropdown for adding ingredients */}
                     <div className="absolute right-0 top-full mt-2 w-64 bg-white shadow-xl rounded-lg border border-gray-100 hidden group-hover:block z-10 p-2 max-h-60 overflow-y-auto">
                        <input type="text" placeholder="Tìm..." className="w-full text-sm border p-1 rounded mb-2" />
                        {ingredients.map(ing => (
                          <div 
                            key={ing.id} 
                            onClick={() => addIngredientToRecipe(ing.id)}
                            className="px-2 py-1.5 hover:bg-gray-50 cursor-pointer text-sm truncate rounded"
                          >
                            {ing.name}
                          </div>
                        ))}
                     </div>
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