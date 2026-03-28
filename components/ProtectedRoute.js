import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

/**
 * Client-side guard for pages based on Role.
 * Wraps page contents: <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}> ... </ProtectedRoute>
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.replace('/login');
      return;
    }

    if (allowedRoles.length > 0 && session?.user?.role) {
      if (!allowedRoles.includes(session.user.role)) {
        // Kick them back to a generic page they have access to
        if (session.user.role === 'CASHIER') router.replace('/pos');
        else router.replace('/dashboard');
      }
    }
  }, [status, session, router, allowedRoles]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  // Double check before rendering children
  if (status === 'unauthenticated') return null;
  if (allowedRoles.length > 0 && !allowedRoles.includes(session?.user?.role)) return null;

  return children;
}
