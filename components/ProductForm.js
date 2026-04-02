import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const PREDEFINED_CATEGORIES = [
  'Beverages',
  'Snacks',
  'Groceries',
  'Dairy & Bakery',
  'Meat & Seafood',
  'Produce',
  'Health & Beauty',
  'Home & Cleaning',
  'Electronics',
  'Stationery',
  'Clothing',
  'Other'
];

export default function ProductForm({ product, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
    barcode: '',
    lowStockThreshold: 10,
  });

  const [isOtherCategory, setIsOtherCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  // Update form data when product changes or when modal opens
  useEffect(() => {
    if (product) {
      const isCustom = product.category && !PREDEFINED_CATEGORIES.includes(product.category);
      setFormData({
        name: product.name || '',
        category: isCustom ? 'Other' : (product.category || ''),
        price: product.price || '',
        quantity: product.quantity || '',
        barcode: product.barcode || '',
        lowStockThreshold: product.lowStockThreshold || 10,
      });
      setIsOtherCategory(isCustom);
      if (isCustom) setCustomCategory(product.category);
    } else {
      setFormData({
        name: '',
        category: '',
        price: '',
        quantity: '',
        barcode: '',
        lowStockThreshold: 10,
      });
      setIsOtherCategory(false);
      setCustomCategory('');
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      category: isOtherCategory ? customCategory : formData.category,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity, 10),
      lowStockThreshold: parseInt(formData.lowStockThreshold, 10),
    });
  };

  const handleChange = (e) => {
    if (e.target.name === 'category') {
      if (e.target.value === 'Other') {
        setIsOtherCategory(true);
      } else {
        setIsOtherCategory(false);
      }
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-surface-card rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-full flex flex-col">
        <div className="p-4 bg-surface-elevated border-b border-slate-200 dark:border-slate-700/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
              <input required name="name" type="text" value={formData.name} onChange={handleChange} className="input" placeholder="e.g. Coca-Cola 500ml" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select 
                  required 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange} 
                  className="input cursor-pointer"
                >
                  <option value="" disabled>Select a category</option>
                  {PREDEFINED_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              {isOtherCategory && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Custom Category Name</label>
                  <input 
                    required 
                    type="text" 
                    value={customCategory} 
                    onChange={(e) => setCustomCategory(e.target.value)} 
                    className="input" 
                    placeholder="Enter custom category" 
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Barcode</label>
              <input name="barcode" type="text" value={formData.barcode} onChange={handleChange} className="input" placeholder="Scan or type" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price ($)</label>
                <input required name="price" type="number" step="0.01" min="0.01" value={formData.price} onChange={handleChange} className="input" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Initial Stock</label>
                <input required name="quantity" type="number" step="1" min="0" value={formData.quantity} onChange={handleChange} className="input" placeholder="0" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Low Stock Alert Threshold</label>
              <input required name="lowStockThreshold" type="number" step="1" min="0" value={formData.lowStockThreshold} onChange={handleChange} className="input" placeholder="10" />
            </div>

            <div className="pt-4 flex gap-4">
              <button type="button" onClick={onClose} className="flex-1 btn-secondary py-3">Cancel</button>
              <button type="submit" className="flex-1 btn-primary py-3">{product ? 'Update' : 'Save'} Product</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
