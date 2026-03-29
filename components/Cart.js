import { TrashIcon, PlusIcon, MinusIcon, ShoppingCartIcon, ArchiveBoxXMarkIcon, PrinterIcon } from '@heroicons/react/24/outline';
import { useCurrency } from '../lib/CurrencyContext';

export default function Cart({ items, onUpdateQuantity, onRemove, onClear, onCheckout, onFastCheckout }) {
  const { formatPrice } = useCurrency();
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const taxRate = 0.05;
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-900/20">
            <ShoppingCartIcon className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">Current Order</h2>
        </div>
        {items.length > 0 && (
          <button 
            onClick={onClear}
            className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-wider flex items-center gap-1.5"
            title="Clear Cart"
          >
            <ArchiveBoxXMarkIcon className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 py-10">
            <ShoppingCartIcon className="h-12 w-12 opacity-20 mb-4" />
            <p className="text-sm font-medium tracking-tight">Your order is empty</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.productId} className="flex gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
              {/* Product Thumbnail */}
              <div className="h-14 w-14 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200/50 dark:border-slate-700">
                {item.productImage ? (
                  <img 
                    src={item.productImage} 
                    alt={item.productName} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-30">
                    <ShoppingCartIcon className="h-5 w-5" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate pr-4">
                    {item.productName}
                  </h4>
                  <p className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                      className="h-7 w-7 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 transition-all active:scale-95 shadow-sm"
                    >
                      <MinusIcon className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-slate-700 dark:text-slate-300">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                      className="h-7 w-7 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 transition-all active:scale-95 shadow-sm"
                    >
                      <PlusIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => onRemove(item.productId)}
                    className="text-slate-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Container */}
      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
        <div className="space-y-2.5 mb-6 text-sm">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span>Tax (5.0%)</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{formatPrice(taxAmount)}</span>
          </div>
          <div className="pt-4 flex justify-between items-center border-t border-slate-200/50 dark:border-slate-700/50">
            <span className="text-base font-bold text-slate-800 dark:text-white">Total</span>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 leading-none">
              {formatPrice(total)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button 
            onClick={() => onFastCheckout(total)}
            disabled={items.length === 0}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:text-slate-400 dark:disabled:text-slate-600"
          >
            <span className="uppercase tracking-wider text-sm font-black">Complete & Print</span>
            <PrinterIcon className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => onCheckout(total)}
            disabled={items.length === 0}
            className="w-full py-3 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-[0.2em] hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            Other Payment Options
          </button>
        </div>
      </div>
    </div>
  );
}
