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
  // --- STATE MANAGEMENT ---
  // Store the list of available products fetched from the database
  const [products, setProducts] = useState([]);
  // Track items the cashier has added to the current transaction
  const [cartItems, setCartItems] = useState([]);
  // Track an optionally attached customer for loyalty points/history
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  // Manage the visibility of the checkout/payment modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  // Hold the final sale data to display on the receipt, determines if receipt modal is open
  const [receiptSale, setReceiptSale] = useState(null);
  // Track the total cost of the customer's cart
  const [cartTotal, setCartTotal] = useState(0);

  // --- INITIAL DATA FETCHING ---
  // Runs once when the POS page loads to grab inventory
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

  // --- CART MANAGEMENT ---
  // Adds a product to the cart or throws an error if it's already there
  const handleAddProduct = (product) => {
    setCartItems(prev => {
      // Check if product is already in the cart
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        toast.error(`${product.name} is already in the cart. Update quantity in the order sidebar.`);
        return prev;
      }
      // Add new item with a default quantity of 1
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

  // --- CHECKOUT LOGIC ---
  // Opens the checkout modal and sets the final verified total
  const initiateCheckout = (total) => {
    setCartTotal(total);
    setIsCheckoutOpen(true);
  };

  // Allows instant cash checkout without opening the modal
  const handleFastCheckout = async (total) => {
    if (cartItems.length === 0) return;
    setCartTotal(total);
    // Auto-confirm with exact Cash
    await handleConfirmCheckout({ 
      method: 'CASH', 
      payments: [{ method: 'CASH', amount: total }],
      totalPaid: total, 
      change: 0 
    });
  };

  // Submits the finalized sale to the backend database
  const handleConfirmCheckout = async (paymentDetails) => {
    setIsCheckoutOpen(false); // Close the modal
    
    // Construct the payload to send to the server
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
      // Send secure request to backend API
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');

      toast.success('Sale completed successfully!');
      
      // Setting receiptSale automatically opens the receipt modal
      setReceiptSale(data);
      
      // Reset the POS terminal for the next customer
      setCartItems([]);
      setSelectedCustomer(null);
      
      // Refresh inventory so stock counts are accurate
      const prodRes = await fetch('/api/products');
      setProducts(await prodRes.json());
      
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'CASHIER']}>
      <Layout title="Sales Terminal">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:h-[calc(100vh-8rem)] mb-10 lg:mb-0">
          {/* Main Product Area */}
          <div className="flex-[2] min-w-0 h-[75vh] sm:h-[70vh] lg:h-auto flex flex-col gap-4">
            <CustomerSelector 
              selectedCustomer={selectedCustomer} 
              onSelect={setSelectedCustomer} 
            />
            <ProductSearch products={products} onAddProduct={handleAddProduct} />
          </div>

          {/* Cart Sidebar */}
          <div className="flex-1 min-w-0 lg:min-w-[320px] lg:max-w-[400px] h-[85vh] sm:h-[70vh] lg:h-auto">
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
