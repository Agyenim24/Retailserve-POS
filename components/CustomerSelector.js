import { useState, useEffect } from 'react';
import { UserIcon, MagnifyingGlassIcon, XMarkIcon, UserPlusIcon } from '@heroicons/react/24/outline';

export default function CustomerSelector({ onSelect, selectedCustomer }) {
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (search.length > 1) {
      fetch(`/api/customers?search=${search}`)
        .then(res => res.json())
        .then(data => setCustomers(data));
    } else {
      setCustomers([]);
    }
  }, [search]);

  if (selectedCustomer) {
    return (
      <div className="bg-primary-600 rounded-2xl p-4 text-white shadow-lg shadow-primary-900/20 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
              <UserIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Selected Customer</p>
              <h3 className="font-black text-lg leading-tight">{selectedCustomer.name}</h3>
              <p className="text-xs font-medium opacity-80">{selectedCustomer.loyaltyPoints} points available</p>
            </div>
          </div>
          <button 
            onClick={() => onSelect(null)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Assign customer (Name, Email, Phone)..."
          className="input pl-11 py-3 text-sm bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
        />
      </div>

      {isDropdownOpen && (search.length > 1) && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-60 overflow-y-auto">
            {customers.map(c => (
              <button
                key={c.id}
                onClick={() => {
                  onSelect(c);
                  setSearch('');
                  setIsDropdownOpen(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 flex flex-col transition-colors border-b border-slate-50 dark:border-slate-700 last:border-0"
              >
                <span className="font-bold text-slate-900 dark:text-white">{c.name}</span>
                <span className="text-xs text-slate-400 dark:text-slate-500">{c.phone || c.email || 'No contact info'} • {c.loyaltyPoints} pts</span>
              </button>
            ))}
            {customers.length === 0 && (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-slate-400 mb-3">No customer found</p>
                <button className="text-xs font-black uppercase tracking-widest text-primary-500 flex items-center justify-center gap-1.5 w-full">
                  <UserPlusIcon className="h-4 w-4" /> Add New Customer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
