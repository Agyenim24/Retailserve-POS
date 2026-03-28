// pages/api/inventory/low-stock.js
import { store } from '../../../lib/store';
import { requireAuth } from '../../../lib/auth';

export default async function handler(req, res) {
  const session = await requireAuth(req, res);
  if (!session) return;

  if (req.method === 'GET') {
    const lowStock = await store.getLowStockProducts();
    return res.status(200).json(lowStock);
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
