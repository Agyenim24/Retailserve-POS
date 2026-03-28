import { useState } from 'react';
import { MagnifyingGlassIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { PlusIcon } from '@heroicons/react/24/solid';

export default function ProductSearch({ onAddProduct, products }) {
  const [query, setQuery] = useState('');

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

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.barcode?.includes(query)
  );

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
      </div>

      <div className="flex-1 overflow-y-auto p-6 pt-4 custom-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredProducts.map(product => (
            <div 
              key={product.id}
              className="group relative bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-800/40 dark:to-slate-900/40 rounded-[2rem] overflow-hidden border border-slate-100/80 dark:border-slate-800/50 shadow-sm hover:shadow-2xl hover:shadow-primary-900/10 cursor-default transition-all duration-500 ease-out transform hover:-translate-y-2"
            >
              {/* Image section with fallback */}
              <div className="h-40 sm:h-52 bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
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

              <div className="p-6">
                <div className="flex flex-col h-full justify-between">
                  <div className="mb-4">
                    <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em]">{product.category}</span>
                    <h4 className="mt-1 text-base font-bold text-slate-900 dark:text-white tracking-tight line-clamp-1 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter mt-1">${product.price.toFixed(2)}</p>
                  </div>
                  
                  <button 
                    disabled={product.quantity <= 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddProduct(product);
                    }}
                    className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-black tracking-tight transition-all duration-300 shadow-lg transform ${
                      product.quantity > 0 
                        ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-900/20 hover:scale-[1.02] active:scale-95' 
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <PlusIcon className="h-4 w-4 stroke-[3]" />
                    <span>Add to Cart</span>
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
