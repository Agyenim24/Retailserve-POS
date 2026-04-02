import { useState } from 'react';
import { MagnifyingGlassIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { PlusIcon } from '@heroicons/react/24/solid';
import { useCurrency } from '../lib/CurrencyContext';

export default function ProductSearch({ onAddProduct, products }) {
  // --- STATE ---
  // Access global currency formatting
  const { formatPrice } = useCurrency();
  // Stores the user's current search input (text or partial barcode)
  const [query, setQuery] = useState('');
  // Stores the currently selected category filter
  const [selectedCategory, setSelectedCategory] = useState('All');

  // --- SEARCH & BARCODE HANDLER ---
  // Fires every time the input changes
  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    
    // Auto-add on exact barcode match
    if (val.length > 5) {
      const exactMatch = products.find(p => p.barcode === val);
      if (exactMatch) {
        onAddProduct(exactMatch);
        setQuery('');
      }
    }
  };

  // Filter the available products
  const filteredProducts = products.filter(p => {
    const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase()) || p.barcode?.includes(query);
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="card p-0 overflow-hidden h-full flex flex-col border-none shadow-2xl bg-surface-card/50 backdrop-blur-sm">
      <div className="p-6 pb-4 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-primary-500" />
          </div>
          <input
            type="text"
            className="input pl-12 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-inner"
            placeholder="Search products or scan barcode..."
            value={query}
            onChange={handleSearch}
            autoFocus
          />
        </div>

        {/* Category Filters */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {['All', ...new Set(products.map(p => p.category).filter(Boolean))].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105'
              }`}
            >
              {category === 'All' ? 'All Products' : category}
            </button>
          ))}
        </div>
      </div>

      {/* --- PRODUCT GRID --- */}
      {/* Scrollable grid showing filtered products as clickable cards */}
      <div className="flex-1 overflow-y-auto p-4 pt-2 custom-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredProducts.map(product => (
            <div 
              key={product.id}
              className="group relative bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-800/40 dark:to-slate-900/40 rounded-[2rem] overflow-hidden border border-slate-100/80 dark:border-slate-800/50 shadow-sm hover:shadow-2xl hover:shadow-primary-900/10 cursor-default transition-all duration-500 ease-out transform hover:-translate-y-2"
            >
              {/* --- PRODUCT IMAGE --- */}
              {/* Image section with a resilient fallback if no image URL is provided */}
              <div className="h-28 sm:h-36 bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500/10 to-primary-600/20">
                    <ShoppingCartIcon className="h-10 w-10 text-primary-500/30" />
                  </div>
                )}
                
                {/* Stock Badge - Premium glassmorphism */}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1.5 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest backdrop-blur-xl border-t border-l ${
                    product.quantity > product.lowStockThreshold 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {product.quantity > 0 ? `${product.quantity} In Stock` : 'Out of Stock'}
                  </span>
                </div>
              </div>

              {/* --- PRODUCT INFO & ADD TO CART --- */}
              <div className="p-4">
                <div className="flex flex-col h-full justify-between">
                  <div className="mb-2">
                    <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em]">{product.category}</span>
                    <h4 className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white tracking-tight line-clamp-1 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-lg font-black text-slate-900 dark:text-white tracking-tighter mt-0.5">{formatPrice(product.price)}</p>
                  </div>
                  
                  <button 
                    disabled={product.quantity <= 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddProduct(product);
                    }}
                    className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-black tracking-tight transition-all duration-300 shadow-lg transform ${
                      product.quantity > 0 
                        ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-900/20 hover:scale-[1.02] active:scale-95' 
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <PlusIcon className="h-3.5 w-3.5 stroke-[3]" />
                    <span>Add to Order</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 dark:text-slate-500">
              No products found for "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
