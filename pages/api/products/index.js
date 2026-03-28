// pages/api/products/index.js
import { store } from '../../../lib/store';
import { requireAuth, ROLES } from '../../../lib/auth';
import { productSchema } from '../../../lib/validations';

export default async function handler(req, res) {
  // Allow ADMIN, MANAGER, CASHIER to read, but only ADMIN/MANAGER to create
  const session = await requireAuth(req, res);
  if (!session) return;

  if (req.method === 'GET') {
    const { search, category } = req.query;
    const products = await store.getProducts({ search, category });
    return res.status(200).json(products);
  } 
  
  if (req.method === 'POST') {
    if (session.user.role === ROLES.CASHIER) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const data = productSchema.parse(req.body);
      
      // Check barcode uniqueness if provided
      if (data.barcode) {
        const existing = await store.getProductByBarcode(data.barcode);
        if (existing) {
          return res.status(400).json({ error: 'Product with this barcode already exists' });
        }
      }

      const newProduct = await store.createProduct(data);
      return res.status(201).json(newProduct);
    } catch (error) {
      return res.status(400).json({ error: error.errors || error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
