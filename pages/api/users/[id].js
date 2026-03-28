// pages/api/users/[id].js
import { store } from '../../../lib/store';
import { requireAuth } from '../../../lib/auth';

export default async function handler(req, res) {
  const session = await requireAuth(req, res, ['ADMIN', 'MANAGER']);
  if (!session) return;

  const { id } = req.query;
  const users = await store.getUsers();
  const user = users.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Common Restriction Logic: Managers cannot touch Admins
  const isTargetAdmin = user.role === 'ADMIN';
  const isManager = session.user.role === 'MANAGER';

  if (isManager && isTargetAdmin) {
    return res.status(403).json({ error: 'Managers cannot modify or delete Admin users.' });
  }

  if (req.method === 'PUT') {
    const { name, email, role } = req.body;
    
    // Manager cannot promote to Admin
    if (isManager && role === 'ADMIN') {
      return res.status(403).json({ error: 'Managers cannot assign Admin role.' });
    }

    const updated = await store.updateUser(id, { name, email, role });
    return res.status(200).json(updated);
  }

  if (req.method === 'DELETE') {
    if (id === session.user.id) {
      return res.status(400).json({ error: 'You cannot delete yourself.' });
    }
    
    await store.deleteUser(id);
    return res.status(200).json({ message: 'User deleted successfully' });
  }

  res.setHeader('Allow', ['PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
