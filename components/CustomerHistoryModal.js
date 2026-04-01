import { useState, useEffect } from 'react';
import { XMarkIcon, ShoppingBagIcon, CalendarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useCurrency } from '../lib/CurrencyContext';

export default function CustomerHistoryModal({ customer, isOpen, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (isOpen && customer) {
      setLoading(true);
      fetch(`/api/customers/${customer.id}/history`)
        .then(res => res.json())
        .then(data => {
          setHistory(data);
          setLoading(false);
        });
    }
  }, [isOpen, customer]);

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Purchase History</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{customer.name} (ID: {customer.id})</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-full transition-colors">
            <XMarkIcon className="h-6 w-6 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-20 opacity-30">
              <ShoppingBagIcon className="h-16 w-16 mx-auto mb-4" />
              <p className="font-bold uppercase tracking-widest text-sm">No purchases yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Customer Insights Summary */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center shadow-sm">
                  <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Total Spent</div>
                  <div className="text-xl font-black text-emerald-500">{formatPrice(history.reduce((sum, s) => sum + s.totalAmount, 0))}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center shadow-sm">
                  <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Total Visits</div>
                  <div className="text-xl font-black text-indigo-500">{history.length}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center shadow-sm">
                  <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Last Visit</div>
                  <div className="text-xs font-black text-slate-700 dark:text-slate-500 dark:text-slate-300">
                    {new Date(history[0].createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Detailed Logs</div>
              {history.map((sale) => (
                <div key={sale.id} className="card p-5 border-slate-200 dark:border-slate-800 hover:border-primary-500/30 transition-all group">
                   <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-900/20">
                          <ShoppingBagIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 dark:text-white leading-none mb-1">Sale #{sale.id?.slice(-8).toUpperCase()}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            <CalendarIcon className="h-3 w-3" />
                            {new Date(sale.createdAt).toLocaleDateString()} at {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Total Spent</p>
                        <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">{formatPrice(sale.totalAmount)}</div>
                      </div>
                   </div>

                   <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-700/50">
                            <th className="px-4 py-3 font-black uppercase text-slate-500 dark:text-slate-400">Item</th>
                            <th className="px-4 py-3 text-center font-black uppercase text-slate-500 dark:text-slate-400">Qty</th>
                            <th className="px-4 py-3 text-right font-black uppercase text-slate-500 dark:text-slate-400">Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
                          {sale.items.map((item, idx) => (
                            <tr key={idx} className="group/row">
                              <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{item.productName}</td>
                              <td className="px-4 py-3 text-center font-bold text-slate-600 dark:text-slate-500 dark:text-slate-400">{item.quantity}</td>
                              <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">{formatPrice(item.unitPrice)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                   </div>
                   
                   <div className="mt-4 flex justify-between items-center bg-primary-600/5 dark:bg-primary-900/10 p-3 rounded-xl border border-primary-500/10">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary-500">
                        <CurrencyDollarIcon className="h-4 w-4" />
                        Payment: {sale.payment_method}
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                        Status: {sale.status}
                      </div>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
