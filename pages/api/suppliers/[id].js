import { requireAuth, ROLES } from '../../../lib/auth';
import { store } from '../../../lib/store';
import { supplierSchema } from '../../../lib/validations';

export default async function handler(req, res) {
  const session = await requireAuth(req, res, [ROLES.ADMIN, ROLES.MANAGER]);
  if (!session) return;

  const { id } = req.query;

  try {
    if (req.method === 'PUT') {
      const data = supplierSchema.parse(req.body);
      const updated = await store.updateSupplier(id, data);
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      await store.deleteSupplier(id);
      return res.status(204).end();
    }

    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
