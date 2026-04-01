import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import toast from 'react-hot-toast';
import { LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function Login() {
  // --- STATE MANAGEMENT ---
  // Store the user's typed email and password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Track if the login request is currently processing (to show a spinner and disable button)
  const [loading, setLoading] = useState(false);
  
  // Next.js router for redirecting users to other pages after login
  const router = useRouter();

  // --- LOGIN HANDLER ---
  // Triggered when the user clicks "Sign In" or presses Enter on the form
  const handleLogin = async (e) => {
    // Prevent the default browser form submission (which refreshes the whole page)
    e.preventDefault();
    setLoading(true);

    // Call NextAuth's signIn function with our custom 'credentials' provider
    // 'redirect: false' means NextAuth won't automatically redirect, allowing us to handle errors or success manually below
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result.error) {
      // If the backend API returned an error (e.g., wrong password, user not found)
      toast.error('Invalid email or password');
      setLoading(false);
    } else {
      // If login is successful, NextAuth has saved the session cookie securely.
      toast.success('Login successful');
      
      // Direct the user to the dashboard. 
      // Note: If they are a 'Cashier', the ProtectedRoute component on the Dashboard will automatically catch them and reroute them to the POS page.
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <Head>
        <title>Login | RetailServe</title>
        <link rel="icon" href="/shopping-bag.png" />
      </Head>
      
      <div className="w-full max-w-md bg-surface-card rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/50 p-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-xl bg-primary-600/20 text-primary-500 mb-4 shadow-inner">
            <LockClosedIcon className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h1>
          <p className="text-slate-500 dark:text-slate-500 dark:text-slate-400">Sign in to RetailServe</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input pl-10"
                placeholder="user@gmail.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input pl-10"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex justify-center items-center py-3 text-lg"
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-900 dark:text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Sign In'}
          </button>
        </form>

      </div>
    </div>
  );
}

// --- SERVER SIDE LOGIC ---
// This runs on the Next.js server *before* this page is ever sent to the browser
export async function getServerSideProps(context) {
  const { getSession } = await import('next-auth/react');
  
  // Check if the user already has a valid session cookie
  const session = await getSession(context);

  if (session) {
    // If they are already logged in, they shouldn't see the Login page.
    // Redirect them immediately to the dashboard.
    return {
      redirect: {
        destination: '/dashboard', // The ProtectedRoute component on Dashboard will handle role-based routing if they're a Cashier
        permanent: false,
      },
    };
  }

  // If there's no session, allow the page to render normally
  return {
    props: {},
  };
}
