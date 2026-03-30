import { store } from '../../lib/store';

export default async function handler(req, res) {
  try {
    const results = [];
    
    // 1. Create product with lowStockThreshold
    const name = 'VerifyFix ' + Date.now();
    const barcode = 'TEST' + Date.now();
    const product = await store.createProduct({
      name,
      category: 'Verify',
      price: 1,
      quantity: 10,
      barcode,
      lowStockThreshold: 5
    });
    results.push({ step: 'create', id: product.id, low_stock_threshold: product.low_stock_threshold });

    // 2. Update with new threshold
    const updated = await store.updateProduct(product.id, {
      lowStockThreshold: 3
    });
    results.push({ step: 'update', id: updated.id, low_stock_threshold: updated.low_stock_threshold });

    // 3. Cleanup
    await store.deleteProduct(product.id);
    results.push({ step: 'cleanup', success: true });

    return res.status(200).json({ success: true, results });
  } catch (error) {
    console.error('Test Fix Route failed:', error);
    return res.status(500).json({ error: error.message });
  }
}
