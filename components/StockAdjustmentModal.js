import { useState } from 'react';
import { XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function StockAdjustmentModal({ products, suppliers = [], isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '', // note: positive for restock, negative for shrinkage
    reason: '',
    supplierId: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      productId: formData.productId,
      quantity: parseInt(formData.quantity, 10),
      reason: formData.reason,
      supplierId: formData.quantity > 0 ? formData.supplierId : null,
    });
    setFormData({ productId: '', quantity: '', reason: '', supplierId: '' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-surface-card rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-full flex flex-col">
        <div className="p-4 bg-surface-elevated border-b border-slate-200 dark:border-slate-700/50 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ArrowPathIcon className="h-5 w-5 text-primary-400" />
            Adjust Stock
          </h2>
          <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Product</label>
              <select
                required
                className="input appearance-none bg-surface"
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              >
                <option value="" disabled>Choose a product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Current: {p.quantity})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Adjustment Quantity</label>
              <div className="text-xs text-slate-400 dark:text-slate-500 mb-2">Use positive numbers to add stock, negative to remove.</div>
              <input
                required
                type="number"
                className="input text-lg"
                placeholder="+10 or -5"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reason</label>
              <input
                required
                type="text"
                className="input"
                placeholder="e.g. Supplier delivery, Damaged goods"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>

            {formData.quantity > 0 && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Supplier (Optional)</label>
                <select
                  className="input appearance-none bg-surface"
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                >
                  <option value="">Select a supplier...</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="pt-4 flex gap-4">
              <button type="button" onClick={onClose} className="flex-1 btn-secondary py-3">Cancel</button>
              <button type="submit" className="flex-1 btn-primary py-3">Confirm Adjustment</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
