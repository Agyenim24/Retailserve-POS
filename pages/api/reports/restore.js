// pages/api/reports/restore.js
import { store } from '../../../lib/store';
import { requireAuth, ROLES } from '../../../lib/auth';

export default async function handler(req, res) {
  const session = await requireAuth(req, res, [ROLES.ADMIN]);
  if (!session) return;

  if (req.method === 'POST') {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: 'No data provided' });
    
    store.restoreData(data);
    return res.status(200).json({ message: 'System data restored successfully' });
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
