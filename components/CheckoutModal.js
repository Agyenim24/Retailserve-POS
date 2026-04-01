import { useState, useEffect, useMemo } from 'react';
import { 
  CurrencyDollarIcon, 
  CreditCardIcon, 
  DevicePhoneMobileIcon, 
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useCurrency } from '../lib/CurrencyContext';

export default function CheckoutModal({ total, isOpen, onClose, onConfirm, selectedCustomer }) {
  // --- CONTEXT & CONVERSIONS ---
  const { formatPrice, currency } = useCurrency();
  
  // --- MODAL STATE ---
  // Tracks whether the user is splitting the bill among multiple payment methods
  const [isSplit, setIsSplit] = useState(false);
  // An array of active payments. Starts with one CASH payment empty.
  const [payments, setPayments] = useState([{ method: 'CASH', amount: '' }]);
  // Which payment input is currently selected (used by the on-screen numeric keypad)
  const [activePaymentIndex, setActivePaymentIndex] = useState(0);
  
  // --- LOYALTY POINTS STATE ---
  // How many points the user has chosen to redeem on this order
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  // --- CALCULATIONS ---
  // 100 points = 1 unit of currency ($1 or 1 GHC)
  const pointsDiscount = useMemo(() => pointsToRedeem / 100, [pointsToRedeem]);
  // The new total the customer actually has to pay after spending points
  const discountedTotal = Math.max(0, total - pointsDiscount);

  useEffect(() => {
    if (isOpen) {
      setPayments([{ method: 'CASH', amount: '' }]);
      setIsSplit(false);
      setActivePaymentIndex(0);
      setPointsToRedeem(0);
    }
  }, [isOpen]);

  // Total cash/card amount they've currently keyed in
  const totalPaid = useMemo(() => {
    return payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  }, [payments]);

  // How much more they need to key in to complete the sale
  const remaining = Math.max(0, discountedTotal - totalPaid);
  // Any overpayment (cash change to give back to customer)
  const change = Math.max(0, totalPaid - discountedTotal);
  // Is the bill fully covered? We use 0.001 to avoid JS floating point math bugs (e.g. 10.000000000000002 >= 10)
  const isFullyPaid = totalPaid >= discountedTotal - 0.001;

  // --- PAYMENT HANDLERS ---
  // Changes the method (CASH, CARD, MOBILE_MONEY) of a specific payment block

  const handleMethodChange = (index, method) => {
    const newPayments = [...payments];
    newPayments[index].method = method;
    setPayments(newPayments);
  };

  const handleAmountChange = (index, amount) => {
    const newPayments = [...payments];
    newPayments[index].amount = amount;
    setPayments(newPayments);
  };

  const addPaymentMethod = () => {
    if (remaining <= 0) return;
    setPayments([...payments, { method: 'CARD', amount: '' }]);
    setActivePaymentIndex(payments.length);
  };

  // Reverts back to a single payment block if the user cancels a split
  const removePaymentMethod = (index) => {
    if (payments.length <= 1) return;
    const newPayments = payments.filter((_, i) => i !== index);
    setPayments(newPayments);
    setActivePaymentIndex(Math.max(0, index - 1));
  };

  // --- FINAL CONFIRMATION ---
  // Submits the finalized details back to pos.js to process the backend database insert
  const handleConfirm = () => {
    if (!isFullyPaid) return;
    
    onConfirm({
      method: payments.length > 1 ? 'SPLIT' : payments[0].method,
      payments: payments.map(p => ({
        method: p.method,
        amount: parseFloat(p.amount) || 0
      })),
      totalPaid,
      pointsRedeemed: pointsToRedeem,
      change
    });
  };

  // --- ON-SCREEN KEYPAD HANDLERS ---
  // Processes physical clicks on the modal's numeric keypad
  const appendDigit = (digit) => {
    const currentAmount = payments[activePaymentIndex].amount.toString();
    // Prevent multiple decimals
    if (digit === '.' && currentAmount.includes('.')) return;
    
    if (digit === 'BACK') {
      handleAmountChange(activePaymentIndex, currentAmount.slice(0, -1));
    } else {
      handleAmountChange(activePaymentIndex, currentAmount + digit);
    }
  };

  const setExactAmount = () => {
    handleAmountChange(activePaymentIndex, remaining.toFixed(2));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row max-h-[95vh] sm:max-h-[90vh]">
        
        {/* --- LEFT SIDE: PAYMENT DETAILS & LOYALTY --- */}
        {/* Shows the total due, loyalty slider, and dynamic payment method blocks */}
        <div className="flex-1 flex flex-col border-r border-slate-100 dark:border-slate-800">
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Checkout</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Select Payment Methods</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-full transition-colors">
              <XMarkIcon className="h-6 w-6 text-slate-500 dark:text-slate-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className={`rounded-2xl p-6 text-white shadow-lg transition-all ${pointsDiscount > 0 ? 'bg-indigo-600' : 'bg-primary-600'}`}>
              <div className="flex justify-between items-center opacity-80 mb-1">
                <span className="text-xs font-bold uppercase tracking-widest">
                  {pointsDiscount > 0 ? 'New Total After Points' : 'Total Amount Due'}
                </span>
                {pointsDiscount > 0 && <span className="text-xs font-black">-{pointsDiscount.toFixed(2)} Points Discount</span>}
              </div>
              <div className="text-4xl font-black tracking-tighter">{formatPrice(discountedTotal)}</div>
            </div>

            {selectedCustomer && (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 animate-in slide-in-from-left-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Points</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{selectedCustomer.loyaltyPoints} Available</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Value</p>
                    <p className="text-lg font-black text-emerald-500">{formatPrice(selectedCustomer.loyaltyPoints / 100)}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Redeem Points</label>
                  <input 
                    type="range"
                    min="0"
                    max={Math.min(selectedCustomer.loyaltyPoints, Math.floor(total * 100))}
                    step="10"
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    value={pointsToRedeem}
                    onChange={(e) => setPointsToRedeem(parseInt(e.target.value))}
                  />
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>0 Pts</span>
                    <span className="text-primary-600">{pointsToRedeem} Pts ({formatPrice(pointsDiscount)})</span>
                    <span>Max Pts</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Payments</h3>
                {!isSplit && (
                  <button 
                    onClick={() => setIsSplit(true)}
                    className="text-xs font-bold text-primary-500 hover:text-primary-600 transition-colors uppercase"
                  >
                    + Add Split Payment
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {payments.map((p, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setActivePaymentIndex(idx)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      activePaymentIndex === idx 
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' 
                        : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex gap-2 mb-2">
                          {[
                            { id: 'CASH', icon: CurrencyDollarIcon },
                            { id: 'CARD', icon: CreditCardIcon },
                            { id: 'MOBILE_MONEY', icon: DevicePhoneMobileIcon }
                          ].map(m => (
                            <button
                              key={m.id}
                              onClick={(e) => { e.stopPropagation(); handleMethodChange(idx, m.id); }}
                              className={`p-2 rounded-lg transition-all ${
                                p.method === m.id 
                                  ? 'bg-primary-600 text-white shadow-md' 
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600'
                              }`}
                            >
                              <m.icon className="h-5 w-5" />
                            </button>
                          ))}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Method: {p.method}</p>
                      </div>
                      <div className="text-right">
                        <input 
                          type="number"
                          className="w-32 bg-transparent text-2xl font-black text-slate-900 dark:text-white text-right focus:outline-none"
                          value={p.amount}
                          onChange={(e) => handleAmountChange(idx, e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      {isSplit && payments.length > 1 && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); removePaymentMethod(idx); }}
                          className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {isSplit && remaining > 0 && (
                  <button 
                    onClick={addPaymentMethod}
                    className="w-full p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 hover:text-primary-500 hover:border-primary-500/50 transition-all flex items-center justify-center gap-2"
                  >
                    <PlusIcon className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">Add Another Method</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div className="p-6 bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
              <div className="flex items-center gap-2">
                {isFullyPaid ? (
                  <div className="flex items-center gap-1.5 text-emerald-500 font-black uppercase text-sm">
                    <CheckCircleIcon className="h-5 w-5" /> Paid
                  </div>
                ) : (
                  <div className="text-red-500 font-black uppercase text-sm">
                    Remaining: {formatPrice(remaining)}
                  </div>
                )}
              </div>
            </div>
            {change > 0 && (
              <div className="text-right">
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Change Due</span>
                <div className="text-2xl font-black text-emerald-500">{formatPrice(change)}</div>
              </div>
            )}
          </div>
        </div>

        {/* --- RIGHT SIDE: ON-SCREEN NUMERIC KEYPAD --- */}
        {/* Optimized for touch-screen POS terminals to enter exact change rapidly */}
        <div className="w-full lg:w-[360px] bg-slate-50 dark:bg-slate-800/20 p-4 sm:p-6 flex flex-col justify-between overflow-y-auto lg:overflow-visible">
          <div>
            <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Quick Actions</div>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {[5, 10, 20, 50, 100].map(val => (
                <button 
                  key={val}
                  onClick={() => handleAmountChange(activePaymentIndex, val.toString())}
                  className="py-2.5 bg-white dark:bg-slate-800 rounded-xl font-black text-slate-700 dark:text-slate-200 shadow-sm hover:shadow-md hover:bg-primary-50 transition-all border border-slate-100 dark:border-slate-700 text-sm"
                >
                  +{currency}{val}
                </button>
              ))}
              <button 
                onClick={setExactAmount}
                className="py-2.5 bg-primary-600 rounded-xl font-black text-white shadow-lg shadow-primary-900/20 hover:bg-primary-700 transition-all text-sm"
              >
                Exact {formatPrice(remaining)}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'BACK'].map(btn => (
                <button 
                  key={btn}
                  onClick={() => appendDigit(btn.toString())}
                  className={`h-12 sm:h-14 rounded-xl font-black text-xl transition-all flex items-center justify-center ${
                    btn === 'BACK' 
                      ? 'bg-red-50 dark:bg-red-900/10 text-red-500' 
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50'
                  }`}
                >
                  {btn === 'BACK' ? '⌫' : btn}
                </button>
              ))}
            </div>
          </div>

          <button 
            disabled={!isFullyPaid}
            onClick={handleConfirm}
            className="w-full py-5 rounded-2xl bg-slate-900 dark:bg-primary-600 text-white font-black uppercase tracking-widest shadow-2xl disabled:opacity-30 disabled:cursor-not-allowed transform active:scale-95 transition-all mt-8"
          >
            Complete Sale
          </button>
        </div>
      </div>
    </div>
  );
}
