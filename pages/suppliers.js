import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { BuildingOfficeIcon, PlusIcon, MagnifyingGlassIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: ''
  });

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/suppliers');
      const data = await res.json();
      setSuppliers(data);
    } catch (e) {
      toast.error('Failed to load suppliers');
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/suppliers/${editingId}` : '/api/suppliers';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Action failed');
      
      toast.success(`Supplier ${editingId ? 'updated' : 'added'}`);
      setIsFormOpen(false);
      setEditingId(null);
      setFormData({ name: '', contact_person: '', email: '', phone: '', address: '' });
      fetchSuppliers();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEdit = (supplier) => {
    setFormData({
      name: supplier.name,
      contact_person: supplier.contact_person || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || ''
    });
    setEditingId(supplier.id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    try {
      const res = await fetch(`/api/suppliers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Supplier removed');
      fetchSuppliers();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.contact_person?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
      <Layout title="Suppliers">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">Supplier Directory</h1>
            <p className="text-slate-400 dark:text-slate-400 mt-1">Manage product vendors and contact details</p>
          </div>
          <button 
            onClick={() => {
              setEditingId(null);
              setFormData({ name: '', contact_person: '', email: '', phone: '', address: '' });
              setIsFormOpen(true);
            }} 
            className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add Supplier
          </button>
        </div>

        <div className="card overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 bg-surface-elevated">
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type="text"
                placeholder="Search suppliers..."
                className="input pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-surface-card text-xs uppercase text-slate-400 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Vendor Name</th>
                  <th className="px-6 py-4 font-semibold">Contact Person</th>
                  <th className="px-6 py-4 font-semibold">Contact Details</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-elevated/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{s.name}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-tighter mt-0.5">{s.address || 'No address set'}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-300">{s.contact_person || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{s.email || '-'}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{s.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(s)} className="p-1 text-blue-400 hover:text-blue-500 transition-colors">
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="p-1 text-red-400 hover:text-red-500 transition-colors">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSuppliers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400">No suppliers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-surface-card rounded-2xl shadow-2xl p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                {editingId ? 'Edit Supplier' : 'New Supplier'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vendor Name</label>
                  <input required className="input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Person</label>
                  <input className="input" value={formData.contact_person} onChange={e => setFormData({...formData, contact_person: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                    <input type="email" className="input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                    <input className="input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Office Address</label>
                  <input className="input" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 btn-secondary">Cancel</button>
                  <button type="submit" className="flex-1 btn-primary">Save Supplier</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Layout>
    </ProtectedRoute>
  );
}
