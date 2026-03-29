import { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState('$'); // Default to Dollar

  useEffect(() => {
    const savedCurrency = localStorage.getItem('app-currency');
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
  }, []);

  const toggleCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem('app-currency', newCurrency);
  };

  const formatPrice = (amount) => {
    const num = parseFloat(amount) || 0;
    if (currency === 'GH₵') {
      return `GH₵ ${num.toFixed(2)}`;
    }
    return `$${num.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, toggleCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
