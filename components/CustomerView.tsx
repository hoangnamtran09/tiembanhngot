import React, { useState, useEffect } from 'react';
import { Customer, Order, Product } from '../types';
import { StorageService } from '../services/storageService';
import { Plus, Search, Edit2, Trash2, ShoppingBag, Phone, Mail, MapPin } from 'lucide-react';
import { formatCurrency } from '../utils/format';

interface CustomerViewProps {
  orders: Order[];
  products: Product[];
}

const CustomerView: React.FC<CustomerViewProps> = ({ orders, products }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    const data = await StorageService.getCustomers();
    setCustomers(data);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.phone) return;

    const customer: Customer = {
      id: selectedCustomer?.id || Date.now().toString(),
      name: formData.name!,
      phone: formData.phone!,
      email: formData.email,
      address: formData.address,
      notes: formData.notes,
      createdAt: selectedCustomer?.createdAt || new Date().toISOString()
    };

    const updated = selectedCustomer
      ? customers.map(c => c.id === customer.id ? customer : c)
      : [...customers, customer];

    setCustomers(updated);
    await StorageService.saveCustomers(updated);
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    const updated = customers.filter(c => c.id !== id);
    setCustomers(updated);
    await StorageService.saveCustomers(updated);
    setDeleteConfirm(null);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData(customer);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: '', phone: '', email: '', address: '', notes: '' });
    setSelectedCustomer(null);
  };

  const getCustomerOrders = (customerPhone: string) => {
    return orders.filter(o => o.customerPhone === customerPhone);
  };

  const getCustomerTotalSpent = (customerPhone: string) => {
    const customerOrders = getCustomerOrders(customerPhone);
    return customerOrders.reduce((total, order) => {
      return total + order.items.reduce((sum, item) => {
        const product = products.find(p => p.id === item.productId);
        return sum + (product ? product.sellingPrice * item.quantity : 0);
      }, 0);
    }, 0);
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto h-screen flex flex-col pb-20 md:pb-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản Lý Khách Hàng</h2>
          <p className="text-sm text-gray-600 mt-1">Quản lý thông tin và lịch sử mua hàng của khách</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          <span>Thêm Khách Hàng</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
          />
        </div>
      </div>

      {/* Customer List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
        {filteredCustomers.map(customer => {
          const customerOrders = getCustomerOrders(customer.phone);
          const totalSpent = getCustomerTotalSpent(customer.phone);

          return (
            <div key={customer.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">{customer.name}</h3>
                  <div className="space-y-1 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Phone size={14} />
                      <span>{customer.phone}</span>
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={14} />
                        <span>{customer.email}</span>
                      </div>
                    )}
                    {customer.address && (
                      <div className="flex items-center gap-2">
                        <MapPin size={14} />
                        <span className="truncate">{customer.address}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(customer)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="Sửa"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(customer.id)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="Xóa"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {customer.notes && (
                <p className="text-sm text-gray-500 italic mb-3">{customer.notes}</p>
              )}

              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <ShoppingBag size={14} />
                    <span>{customerOrders.length} đơn hàng</span>
                  </div>
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(totalSpent)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredCustomers.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            {searchTerm ? 'Không tìm thấy khách hàng' : 'Chưa có khách hàng nào'}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {selectedCustomer ? 'Sửa Khách Hàng' : 'Thêm Khách Hàng'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-gray-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-gray-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-gray-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
      {deleteConfirm && (() => {
        const customer = customers.find(c => c.id === deleteConfirm);
        if (!customer) return null;

        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Xác nhận xóa</h3>
              <p className="text-gray-600 mb-6">Bạn có chắc muốn xóa khách hàng <strong>{customer.name}</strong>?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleDelete(customer.id)}
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default CustomerView;

