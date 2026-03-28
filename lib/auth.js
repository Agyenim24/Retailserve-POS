// lib/auth.js - Server-side auth helpers for API route protection
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../pages/api/auth/[...nextauth]';

/**
 * requireAuth(req, res, allowedRoles)
 * Usage in API route:
 *   const session = await requireAuth(req, res, ['ADMIN', 'MANAGER']);
 *   if (!session) return; // response already sent
 */
export async function requireAuth(req, res, allowedRoles = []) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ error: 'Unauthorized – please log in.' });
    return null;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(session.user.role)) {
    res.status(403).json({ error: 'Forbidden – insufficient permissions.' });
    return null;
  }

  return session;
}

export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  CASHIER: 'CASHIER',
};
