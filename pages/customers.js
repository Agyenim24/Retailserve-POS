import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { UserPlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  const fetchCustomers = () => {
    fetch(`/api/customers?search=${search}`)
      .then(res => res.json())
      .then(data => setCustomers(data))
      .catch(() => toast.error('Failed to load customers'));
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create');
      
      toast.success('Customer added');
      setIsFormOpen(false);
      setFormData({ name: '', email: '', phone: '' });
      fetchCustomers();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'CASHIER']}>
      <Layout title="Customers">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">Customer Directory</h1>
            <p className="text-slate-400 dark:text-slate-400 mt-1">Manage loyalty members and details</p>
          </div>
          <button onClick={() => setIsFormOpen(true)} className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
            <UserPlusIcon className="h-5 w-5" />
            Add Customer
          </button>
        </div>

        <div className="card overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 bg-surface-elevated flex gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
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
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Contact</th>
                  <th className="px-6 py-4 font-semibold text-center">Loyalty Points</th>
                  <th className="px-6 py-4 font-semibold text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-elevated/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{c.name}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{c.email || '-'}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{c.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="badge-purple font-bold text-sm px-3 py-1 text-purple-300">
                        {c.loyaltyPoints} pts
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-400 dark:text-slate-500 text-xs text-nowrap">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                      No customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inline Add Customer Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-surface-card rounded-2xl shadow-2xl p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">New Customer</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input required name="name" type="text" className="input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email (Optional)</label>
                  <input name="email" type="email" className="input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone (Optional)</label>
                  <input name="phone" type="text" className="input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 btn-secondary">Cancel</button>
                  <button type="submit" className="flex-1 btn-primary">Save Member</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Layout>
    </ProtectedRoute>
  );
}
