const { store } = require('./lib/store');

async function test() {
  try {
    console.log('Testing createProduct...');
    const newProduct = await store.createProduct({
      name: 'Test Product ' + Date.now(),
      category: 'Test Category',
      price: 10.99,
      quantity: 100,
      barcode: 'TEST-' + Date.now(),
      lowStockThreshold: 5
    });
    console.log('Created product:', newProduct.id);

    console.log('Testing updateProduct...');
    const updated = await store.updateProduct(newProduct.id, {
      name: newProduct.name + ' (Updated)',
      lowStockThreshold: 3
    });
    console.log('Updated product. low_stock_threshold:', updated.low_stock_threshold);

    // Cleanup
    console.log('Deleting test product...');
    await store.deleteProduct(newProduct.id);
    console.log('Test passed!');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

test();
