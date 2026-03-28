// pages/api/sales/index.js
import { store } from '../../../lib/store';
import { requireAuth } from '../../../lib/auth';
import { saleSchema } from '../../../lib/validations';

export default async function handler(req, res) {
  const session = await requireAuth(req, res);
  if (!session) return;

  if (req.method === 'GET') {
    const { cashierId, date } = req.query;
    const sales = await store.getSales({ cashierId, date });
    return res.status(200).json(sales);
  }

  if (req.method === 'POST') {
    try {
      const data = saleSchema.parse(req.body);
      
      // Ensure the cashier ID matches the logged-in user, unless admin is creating a past record?
      // For safety, force the cashierId to be the logged-in session user
      data.cashierId = session.user.id;
      data.cashierName = session.user.name;

      // Verify stock levels before completing sale
      for (const item of data.items) {
        const product = await store.getProduct(item.productId);
        if (!product) {
          return res.status(400).json({ error: `Product ${item.productName} no longer exists.` });
        }
        if (product.quantity < item.quantity) {
          return res.status(400).json({ error: `Insufficient stock for ${product.name}. Only ${product.quantity} left.` });
        }
      }

      const newSale = await store.createSale(data);
      return res.status(201).json(newSale);
    } catch (error) {
      return res.status(400).json({ error: error.errors || error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
