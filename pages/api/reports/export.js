import { store } from '../../../lib/store';
import { requireAuth, ROLES } from '../../../lib/auth';

export default async function handler(req, res) {
  const session = await requireAuth(req, res, [ROLES.ADMIN]);
  if (!session) return;

  if (req.method === 'GET') {
    try {
      const data = await store.getBackupData();
      const backup = {
        timestamp: new Date().toISOString(),
        version: '1.1',
        data: data
      };
      
      return res.status(200).json(backup);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
