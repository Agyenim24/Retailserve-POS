import { TrashIcon, PlusIcon, MinusIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

export default function Cart({ items, onUpdateQuantity, onRemove, onCheckout }) {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const taxObject = subtotal * 0.05; // 5% tax
  const total = subtotal + taxObject;

  return (
    <div className="card h-full flex flex-col bg-white dark:bg-slate-900 shadow-2xl border-none overflow-hidden pb-6">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 bg-gradient-to-r from-primary-600 to-indigo-600">
        <h2 className="text-xl font-extrabold text-white">Current Order</h2>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-primary-100/80 text-xs font-medium uppercase tracking-wider">{items.length} items selected</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 custom-scrollbar">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 animate-in fade-in zoom-in duration-500">
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-full mb-4">
              <ShoppingCartIcon className="h-12 w-12 opacity-20" />
            </div>
            <p className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest text-[10px]">Your cart is empty</p>
            <p className="text-xs mt-2 opacity-60">Add items to start a sale</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.productId} className="group flex flex-col bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 transition-all hover:border-primary-500/30 hover:shadow-md">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-2 pr-4 leading-tight">{item.productName}</span>
                <span className="text-sm font-black text-primary-600 dark:text-primary-400 whitespace-nowrap">
                  ${(item.unitPrice * item.quantity).toFixed(2)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-xl p-1 shadow-sm border border-slate-100 dark:border-slate-700">
                  <button 
                    onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
                  >
                    <MinusIcon className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-black text-slate-900 dark:text-white">
                    {item.quantity}
                  </span>
                  <button 
                    onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button 
                  onClick={() => onRemove(item.productId)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                >
                  <TrashIcon className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="px-6 pt-4 border-t border-slate-100 dark:border-slate-800/50">
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <span>Subtotal</span>
            <span className="text-slate-700 dark:text-slate-300 font-black">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <span>Tax (5.0%)</span>
            <span className="text-slate-700 dark:text-slate-300 font-black">${taxObject.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-2xl font-black text-slate-900 dark:text-white pt-3 mt-1 border-t border-slate-100 dark:border-slate-800/50">
            <span className="tracking-tight text-lg">Total Due</span>
            <span className="text-primary-600 dark:text-primary-400">${total.toFixed(2)}</span>
          </div>
        </div>

        <button 
          onClick={() => onCheckout(total)}
          disabled={items.length === 0}
          className="group relative w-full overflow-hidden rounded-2xl bg-slate-900 dark:bg-primary-600 py-4 font-bold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-xl shadow-primary-900/20"
        >
          <div className="relative z-10 flex items-center justify-center gap-3">
            <span className="uppercase tracking-widest text-sm">Review & Pay</span>
            <span className="bg-white/20 px-3 py-1 rounded-lg text-xs font-black backdrop-blur-sm">
              ${total.toFixed(2)}
            </span>
          </div>
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-primary-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </div>
  );
}
