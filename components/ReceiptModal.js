import { useRef, useEffect } from 'react';
import { PrinterIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useCurrency } from '../lib/CurrencyContext';

export default function ReceiptModal({ sale, isOpen, onClose }) {
  const { formatPrice } = useCurrency();
  const printRef = useRef();

  const handlePrint = () => {
    if (!isOpen || !sale) return;
    window.print();
  };

  // Automatically trigger print/PDF when modal opens with a new sale
  useEffect(() => {
    if (isOpen && sale) {
      const timer = setTimeout(() => {
        handlePrint();
      }, 500); // Slight delay for modal animations
      return () => clearTimeout(timer);
    }
  }, [isOpen, sale]);

  if (!isOpen || !sale) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4 no-print-overlay">
      <div className="w-full max-w-sm bg-surface-card rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 flex justify-between items-center bg-surface-elevated">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Transaction Complete</h2>
          <button onClick={onClose} className="text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div id="printable-receipt" className="flex-1 overflow-y-auto p-6 bg-white text-black" ref={printRef}>
          {/* Cash Drawer Trigger (Invisible ESC/POS sequence for some printers) */}
          <span className="no-print hidden opacity-0 text-[0px] select-none">\x1B\x70\x00\x19\xFA</span>
          
          {/* Printable Receipt Area */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black mb-1">RETAIL SERVE</h1>
            <p className="text-xs text-slate-500 font-medium">123 Main Street, City</p>
            <p className="text-xs text-slate-500 font-medium">Tel: +1 234 567 8900</p>
          </div>

          <div className="text-xs border-b border-slate-300 pb-3 mb-3 space-y-1">
            <div className="flex justify-between">
              <span>Receipt #:</span>
              <span className="font-mono font-bold text-[10px]">{sale.id.slice(0, 13)}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{new Date(sale.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span>{sale.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span>{sale.customerName || 'Walk-in'}</span>
            </div>
          </div>

          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left font-bold py-2">ITEM</th>
                <th className="text-right font-bold py-2">QTY</th>
                <th className="text-right font-bold py-2">TOTAL</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {sale.items?.map((item, i) => (
                <tr key={item.id || i} className="border-b border-slate-100">
                  <td className="py-2 pr-2 font-medium">{item.productName}</td>
                  <td className="py-2 text-right">{item.quantity}</td>
                  <td className="py-2 text-right font-black">{formatPrice(item.unitPrice * (item.unitPrice ? item.quantity : 0))}</td>
                </tr>
              )) || (
                <tr>
                  <td colSpan="3" className="py-4 text-center text-slate-400 font-mono">No items detected</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="space-y-1.5 text-sm border-b-2 border-black pb-3 mb-4">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatPrice(sale.subtotal || sale.totalAmount - (sale.totalAmount * 0.05))}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tax (5.0%)</span>
              <span>{formatPrice(sale.taxAmount || (sale.totalAmount * 0.05))}</span>
            </div>
            {sale.discountAmount > 0 && (
              <div className="flex justify-between text-sky-600 font-bold">
                <span>Discount Applied</span>
                <span>-{formatPrice(sale.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-xl pt-2 mt-2 border-t border-slate-300">
              <span>TOTAL</span>
              <span>{formatPrice(sale.totalAmount)}</span>
            </div>
          </div>

          <div className="text-xs space-y-2 text-slate-500 border-b border-slate-300 pb-4 mb-4">
            <p className="font-bold text-black uppercase tracking-widest text-[9px] mb-2 font-mono">Payment Summary</p>
            {sale.payments ? sale.payments.map((p, idx) => (
              <div key={idx} className="flex justify-between">
                <span className="uppercase">{p.method.replace('_', ' ')}</span>
                <span className="font-bold text-black">{formatPrice(p.amount)}</span>
              </div>
            )) : (
              <div className="flex justify-between">
                <span>{sale.paymentMethod}</span>
                <span className="font-bold text-black">{formatPrice(sale.totalAmount)}</span>
              </div>
            )}
            {sale.change > 0 && (
              <div className="flex justify-between pt-1 border-t border-slate-200 mt-1">
                <span className="font-bold">CHANGE RETURNED</span>
                <span className="font-black text-black">{formatPrice(sale.change)}</span>
              </div>
            )}
          </div>
          
          <div className="text-xs text-center text-slate-500">
            <p className="font-black uppercase tracking-[0.2em] text-[11px] mb-1">Thanks for shopping!</p>
            <p className="text-[10px]">Visit us again soon at RetailServe.</p>
          </div>
        </div>

        <div className="p-4 bg-surface-elevated border-t border-slate-200 dark:border-slate-700/50 flex gap-3 no-print">
          <button onClick={onClose} className="flex-1 btn-secondary text-sm">New Sale</button>
          <button onClick={handlePrint} className="flex-1 btn-primary flex justify-center items-center gap-2 text-sm">
            <PrinterIcon className="h-5 w-5" /> Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
