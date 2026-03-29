import { requireAuth, ROLES } from '../../../lib/auth';
import { store } from '../../../lib/store';

export default async function handler(req, res) {
  const session = await requireAuth(req, res, [ROLES.ADMIN, ROLES.MANAGER]);
  if (!session) return;

  try {
    if (req.method === 'GET') {
      const suppliers = await store.getSuppliers();
      return res.status(200).json(suppliers);
    }

    if (req.method === 'POST') {
      const data = supplierSchema.parse(req.body);
      const newSupplier = await store.createSupplier(data);
      return res.status(201).json(newSupplier);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
