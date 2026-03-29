// pages/api/inventory/index.js
import { store } from '../../../lib/store';
import { requireAuth, ROLES } from '../../../lib/auth';
import { inventoryAdjustmentSchema } from '../../../lib/validations';

export default async function handler(req, res) {
  const session = await requireAuth(req, res);
  if (!session) return;

  if (req.method === 'GET') {
    // Return all inventory logs
    const logs = await store.getInventoryLogs();
    return res.status(200).json(logs);
  }

  // Adjustments require Admin or Manager
  if (req.method === 'POST') {
    if (session.user.role === ROLES.CASHIER) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      // Force user ID for the log
      const payload = { ...req.body, userId: session.user.id };
      const data = inventoryAdjustmentSchema.parse(payload);
      
      const result = await store.adjustStock(data.productId, data.quantity, data.reason, data.userId, data.supplierId);
      if (!result) return res.status(404).json({ error: 'Product not found' });
      
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ error: error.errors || error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
