import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import StockAdjustmentModal from '../components/StockAdjustmentModal';
import { ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Inventory() {
  const [logs, setLogs] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [logsRes, prodRes, lowRes, supRes] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/products'),
        fetch('/api/inventory/low-stock'),
        fetch('/api/suppliers')
      ]);
      setLogs(await logsRes.json());
      setProducts(await prodRes.json());
      setLowStock(await lowRes.json());
      setSuppliers(await supRes.json());
    } catch (e) {
      toast.error('Failed to load inventory data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdjustment = async (data) => {
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      
      toast.success('Stock adjusted successfully');
      setIsAdjustOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
      <Layout title="Inventory">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">Inventory Control</h1>
            <p className="text-slate-400 dark:text-slate-400 mt-1">Manage stock levels and history</p>
          </div>
          <button onClick={() => setIsAdjustOpen(true)} className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
            <ArrowPathIcon className="h-5 w-5" />
            Adjust Stock
          </button>
        </div>

        {/* Low Stock Alerts */}
        {lowStock.length > 0 && (
          <div className="mb-8 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3 text-red-500 font-bold">
              <ExclamationTriangleIcon className="h-6 w-6" />
              <h2>Low Stock Alerts ({lowStock.length})</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {lowStock.slice(0, 6).map(p => (
                <div key={p.id} className="bg-surface p-3 rounded-lg flex justify-between items-center border border-red-500/20">
                  <span className="text-slate-700 dark:text-slate-300 font-medium truncate pr-2">{p.name}</span>
                  <span className="font-bold text-red-400">{p.quantity} left</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audit Logs */}
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 bg-surface-elevated">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-surface-card text-xs uppercase text-slate-400 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Product</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold text-right">Change</th>
                  <th className="px-6 py-4 font-semibold">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-elevated/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 dark:text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{log.productName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        log.changeType === 'SALE' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {log.changeType}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${log.quantityChanged > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {log.quantityChanged > 0 ? '+' : ''}{log.quantityChanged}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900 dark:text-white">{log.reason}</div>
                      {log.supplierName && (
                        <div className="text-[10px] text-primary-400 font-bold uppercase tracking-tighter mt-0.5">
                          Supplier: {log.supplierName}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                      No inventory logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <StockAdjustmentModal 
          isOpen={isAdjustOpen} 
          products={products}
          suppliers={suppliers}
          onClose={() => setIsAdjustOpen(false)} 
          onSave={handleAdjustment} 
        />
      </Layout>
    </ProtectedRoute>
  );
}
