// pages/api/reports/export.js
import { store } from '../../../lib/store';
import { requireAuth, ROLES } from '../../../lib/auth';

export default async function handler(req, res) {
  const session = await requireAuth(req, res, [ROLES.ADMIN]);
  if (!session) return;

  if (req.method === 'GET') {
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        users: store.getUsers(),
        products: store.getProducts(),
        customers: store.getCustomers(),
        sales: store.getSales(),
        inventoryLogs: store.getInventoryLogs(),
      }
    };
    
    return res.status(200).json(backup);
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
