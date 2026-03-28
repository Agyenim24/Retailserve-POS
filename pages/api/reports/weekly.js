// pages/api/reports/weekly.js
import { MOCK_WEEKLY_SALES } from '../../../lib/mockData';
import { requireAuth, ROLES } from '../../../lib/auth';

export default async function handler(req, res) {
  const session = await requireAuth(req, res, [ROLES.ADMIN, ROLES.MANAGER]);
  if (!session) return;

  if (req.method === 'GET') {
    // In a real DB, you would group sales by day over the last 7 days.
    // For mock data, we just return the static weekly array.
    return res.status(200).json(MOCK_WEEKLY_SALES);
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
