import { useRef } from 'react';
import { PrinterIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function ReceiptModal({ sale, isOpen, onClose }) {
  const printRef = useRef();

  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    // In a real app we'd open a print window with just the receipt content
    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // Quick reset after print hijack
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4">
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
            <p className="text-xs text-slate-400 dark:text-slate-500">123 Main Street, City</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Tel: +1 234 567 8900</p>
          </div>

          <div className="text-xs border-b border-slate-300 pb-3 mb-3 space-y-1">
            <div className="flex justify-between">
              <span>Receipt #:</span>
              <span className="font-mono">{sale.id}</span>
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
              <tr className="border-b border-slate-300">
                <th className="text-left font-semibold py-2">Item</th>
                <th className="text-right font-semibold py-2">Qty</th>
                <th className="text-right font-semibold py-2">Price</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {sale.items.map((item, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-2 pr-2">{item.productName}</td>
                  <td className="py-2 text-right">{item.quantity}</td>
                  <td className="py-2 text-right">${item.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="space-y-1 text-sm border-b border-slate-300 pb-3 mb-4">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>${sale.subtotal?.toFixed(2) || (sale.totalAmount - (sale.totalAmount * 0.05)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tax (5%)</span>
              <span>${sale.taxAmount?.toFixed(2) || (sale.totalAmount * 0.05).toFixed(2)}</span>
            </div>
            {sale.discountAmount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Discount</span>
                <span>-${sale.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 mt-2 border-t border-slate-200">
              <span>Total</span>
              <span>${sale.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="text-xs space-y-2 text-slate-500 border-b border-slate-300 pb-4 mb-4">
            <p className="font-bold text-slate-700 uppercase tracking-widest text-[10px] mb-2">Payment Details</p>
            {sale.payments ? sale.payments.map((p, idx) => (
              <div key={idx} className="flex justify-between">
                <span>{p.method}</span>
                <span className="font-mono text-black">${p.amount.toFixed(2)}</span>
              </div>
            )) : (
              <div className="flex justify-between">
                <span>{sale.paymentMethod}</span>
                <span className="font-mono text-black">${sale.totalAmount.toFixed(2)}</span>
              </div>
            )}
            {sale.change > 0 && (
              <div className="flex justify-between pt-1 border-t border-slate-100 mt-1">
                <span>Change Given</span>
                <span className="font-mono text-emerald-600 font-bold">${sale.change.toFixed(2)}</span>
              </div>
            )}
          </div>
          
          <div className="text-xs text-center text-slate-400 dark:text-slate-500">
            <p className="mt-2 font-medium text-slate-900 uppercase tracking-widest text-[10px]">Thank you for shopping!</p>
          </div>
        </div>

        <div className="p-4 bg-surface-elevated border-t border-slate-200 dark:border-slate-700/50 flex gap-3">
          <button onClick={onClose} className="flex-1 btn-secondary">New Sale</button>
          <button onClick={handlePrint} className="flex-1 btn-primary flex justify-center items-center gap-2">
            <PrinterIcon className="h-5 w-5" /> Print
          </button>
        </div>
      </div>
    </div>
  );
}
