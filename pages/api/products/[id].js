// pages/api/products/[id].js
import { store } from '../../../lib/store';
import { requireAuth, ROLES } from '../../../lib/auth';
import { productSchema } from '../../../lib/validations';

export default async function handler(req, res) {
  const session = await requireAuth(req, res);
  if (!session) return;

  const { id } = req.query;

  if (req.method === 'GET') {
    const product = await store.getProduct(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.status(200).json(product);
  }

  // Update/Delete require ADMIN or MANAGER
  if (session.user.role === ROLES.CASHIER) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.method === 'PUT') {
    try {
      const data = productSchema.parse(req.body);
      const updated = await store.updateProduct(id, data);
      if (!updated) return res.status(404).json({ error: 'Product not found' });
      return res.status(200).json(updated);
    } catch (error) {
      return res.status(400).json({ error: error.errors || error.message });
    }
  }

  if (req.method === 'DELETE') {
    const success = await store.deleteProduct(id);
    if (!success) return res.status(404).json({ error: 'Product not found' });
    return res.status(204).end();
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
