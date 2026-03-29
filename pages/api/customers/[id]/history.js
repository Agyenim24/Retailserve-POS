import { requireAuth, ROLES } from '../../../../lib/auth';
import { store } from '../../../../lib/store';

export default async function handler(req, res) {
  const session = await requireAuth(req, res, [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER]);
  if (!session) return;

  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      const history = await store.getCustomerHistory(id);
      return res.status(200).json(history);
    }

    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
