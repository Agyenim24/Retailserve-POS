import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { UserPlusIcon, MagnifyingGlassIcon, ClockIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import CustomerHistoryModal from '../components/CustomerHistoryModal';

export default function Customers() {
  // --- STATE ---
  // The raw list of customers pulled from the database
  const [customers, setCustomers] = useState([]);
  // What the user is currently typing in the search bar
  const [search, setSearch] = useState('');
  // Controls if the "Add Customer" modal popup is showing
  const [isFormOpen, setIsFormOpen] = useState(false);
  // Controls if the "Customer Purchase History" modal popup is showing
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  // Keeps track of WHICH customer to show history for
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState(null);
  // Temporary state to hold the 'New Customer' form inputs
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  // --- DATA FETCHING ---
  // Reusable function to hit the backend API and get customers
  const fetchCustomers = () => {
    // We attach the 'search' state to the URL. The backend uses this to filter Postgres.
    fetch(`/api/customers?search=${search}`)
      .then(res => res.json())
      .then(data => setCustomers(data))
      .catch(() => toast.error('Failed to load customers'));
  };

  // This runs when the component loads AND automatically re-runs every time `search` changes
  useEffect(() => {
    fetchCustomers();
  }, [search]);

  // --- CREATE CUSTOMER ---
  // Runs when user clicks "Save Member" in the popup modal
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // POST the formData to the backend API route
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      // If the backend returns an error (e.g., duplicated email)
      if (!res.ok) throw new Error(data.error || 'Failed to create');
      
      // On success:
      toast.success('Customer added');
      setIsFormOpen(false); // Close modal
      setFormData({ name: '', email: '', phone: '' }); // Reset Inputs
      fetchCustomers(); // Refresh the list
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
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage loyalty members and details</p>
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
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-500 dark:text-slate-300">
              <thead className="bg-surface-card text-xs uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Contact</th>
                  <th className="px-6 py-4 font-semibold text-center">Loyalty Points</th>
                  <th className="px-6 py-4 font-semibold text-right">Joined</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-elevated/50 transition-colors">
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => {
                          setSelectedCustomerForHistory(c);
                          setIsHistoryOpen(true);
                        }}
                        className="font-bold text-slate-900 dark:text-white hover:text-primary-500 transition-colors text-left"
                      >
                        {c.name}
                      </button>
                    </td>
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
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => {
                            setSelectedCustomerForHistory(c);
                            setIsHistoryOpen(true);
                          }} 
                          className="p-1 text-indigo-400 hover:text-indigo-500 transition-colors"
                          title="View History"
                        >
                          <ClockIcon className="h-5 w-5" />
                        </button>
                        <button className="p-1 text-blue-400 hover:text-blue-500 transition-colors opacity-30 cursor-not-allowed">
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button className="p-1 text-red-400 hover:text-red-500 transition-colors opacity-30 cursor-not-allowed">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
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

        <CustomerHistoryModal 
          customer={selectedCustomerForHistory}
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
        />
      </Layout>
    </ProtectedRoute>
  );
}
