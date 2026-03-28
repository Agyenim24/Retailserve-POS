// pages/api/users/index.js
import { store } from '../../../lib/store';
import { requireAuth } from '../../../lib/auth';

export default async function handler(req, res) {
  const session = await requireAuth(req, res, ['ADMIN', 'MANAGER']);
  if (!session) return;

  if (req.method === 'GET') {
    const users = await store.getUsers();
    return res.status(200).json(users);
  }

  if (req.method === 'POST') {
    const { name, email, password, role } = req.body;

    // Restriction: Managers cannot create ADMINs
    if (session.user.role === 'MANAGER' && role === 'ADMIN') {
      return res.status(403).json({ error: 'Managers cannot create Admin users.' });
    }

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const exists = await store.findUserByEmail(email);
    if (exists) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const newUser = await store.createUser({ name, email, password, role });
    const { password: _, ...userWithoutPassword } = newUser;
    return res.status(201).json(userWithoutPassword);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
