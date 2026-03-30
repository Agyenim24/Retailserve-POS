import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import ProductSearch from '../components/ProductSearch';
import Cart from '../components/Cart';
import CustomerSelector from '../components/CustomerSelector';
import CheckoutModal from '../components/CheckoutModal';
import ReceiptModal from '../components/ReceiptModal';
import toast from 'react-hot-toast';

export default function POS() {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [receiptSale, setReceiptSale] = useState(null);
  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(() => toast.error('Failed to load products'));
  }, []);

  // Barcode Scanner Global Listener
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e) => {
      // Ignore if user is typing in a modal or specific input (except the search input if needed)
      if (isCheckoutOpen || !!receiptSale) return;
      
      const currentTime = Date.now();
      
      // Scanners typically type very fast (< 30ms between keys)
      if (currentTime - lastKeyTime > 100) {
        buffer = ''; // Reset if too slow (likely manual typing)
      }

      if (e.key === 'Enter') {
        if (buffer.length > 3) {
          const product = products.find(p => p.barcode === buffer);
          if (product) {
            handleAddProduct(product);
            toast.success(`Scanned: ${product.name}`);
          }
          buffer = '';
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }

      lastKeyTime = currentTime;
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products, isCheckoutOpen, receiptSale]); // Re-bind when products or visibility changes

  const handleAddProduct = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        toast.error(`${product.name} is already in the cart. Update quantity in the order sidebar.`);
        return prev;
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        unitPrice: product.price,
        quantity: 1
      }];
    });
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }
    
    const product = products.find(p => p.id === productId);
    if (product && newQuantity > product.quantity) {
      toast.error(`Only ${product.quantity} in stock`);
      return;
    }

    setCartItems(prev => prev.map(item => 
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleRemoveItem = (productId) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
  };

  const initiateCheckout = (total) => {
    setCartTotal(total);
    setIsCheckoutOpen(true);
  };

  const handleFastCheckout = async (total) => {
    if (cartItems.length === 0) return;
    setCartTotal(total);
    // Auto-confirm with Cash
    await handleConfirmCheckout({ 
      method: 'CASH', 
      payments: [{ method: 'CASH', amount: total }],
      totalPaid: total, 
      change: 0 
    });
  };

  const handleConfirmCheckout = async (paymentDetails) => {
    setIsCheckoutOpen(false);
    
    const saleData = {
      totalAmount: cartTotal,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name,
      paymentMethod: paymentDetails.method,
      payments: paymentDetails.payments,
      pointsRedeemed: paymentDetails.pointsRedeemed || 0,
      items: cartItems.map(item => ({
        ...item,
        subtotal: item.quantity * item.unitPrice
      }))
    };

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');

      toast.success('Sale completed successfully!');
      setReceiptSale(data);
      setCartItems([]);
      setSelectedCustomer(null);
      
      // Refresh inventory
      const prodRes = await fetch('/api/products');
      setProducts(await prodRes.json());
      
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'CASHIER']}>
      <Layout title="Sales Terminal">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:h-[calc(100vh-12rem)] mb-10 lg:mb-0">
          {/* Main Product Area */}
          <div className="flex-[2] min-w-0 h-[65vh] sm:h-[60vh] lg:h-auto flex flex-col gap-4">
            <CustomerSelector 
              selectedCustomer={selectedCustomer} 
              onSelect={setSelectedCustomer} 
            />
            <ProductSearch products={products} onAddProduct={handleAddProduct} />
          </div>

          {/* Cart Sidebar */}
          <div className="flex-1 min-w-0 lg:min-w-[320px] lg:max-w-[400px] h-[75vh] sm:h-[60vh] lg:h-auto">
            <Cart 
              items={cartItems} 
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemoveItem}
              onClear={() => setCartItems([])}
              onCheckout={initiateCheckout}
              onFastCheckout={handleFastCheckout}
            />
          </div>
        </div>

        <CheckoutModal 
          isOpen={isCheckoutOpen}
          total={cartTotal}
          selectedCustomer={selectedCustomer}
          onClose={() => setIsCheckoutOpen(false)}
          onConfirm={handleConfirmCheckout}
        />

        <ReceiptModal 
          isOpen={!!receiptSale}
          sale={receiptSale}
          onClose={() => setReceiptSale(null)}
        />
      </Layout>
    </ProtectedRoute>
  );
}
