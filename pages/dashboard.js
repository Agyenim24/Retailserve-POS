import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardCards from '../components/DashboardCards';
import SalesChart from '../components/SalesChart';
import toast from 'react-hot-toast';
import { useCurrency } from '../lib/CurrencyContext';

export default function Dashboard() {
  // --- SESSION & CONTEXT ---
  // Grab the currently logged-in user from NextAuth
  const { data: session } = useSession();
  // Get our globally available formatPrice function (returns $ or ₵ depending on settings)
  const { formatPrice } = useCurrency();
  
  // --- STATE MANAGEMENT ---
  // Stores the high-level daily numbers for the top cards (Total Sales, Total Orders, etc.)
  const [reportData, setReportData] = useState(null);
  // Stores the array data needed to draw the graphical Sales Chart
  const [weeklyData, setWeeklyData] = useState([]);
  // Controls the loading spinner while waiting for NextAuth and backend routes
  const [loading, setLoading] = useState(true);
  
  // Extracts user data for easier referencing below
  const user = session?.user;
  // We determine if they are a 'CASHIER' so we can hide sensitive manager data (like Top Cashier Performance)
  const isCashier = user?.role === 'CASHIER';

  // --- DATA FETCHING ---
  // This hook runs every time `session` changes (e.g., finishes loading user info)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both reports simultaneously to save load time
        const [resReports, resWeekly] = await Promise.all([
          fetch('/api/reports'),        // GET daily snapshot & leaderboard
          fetch('/api/reports/weekly'), // GET 7-day trailing data for chart
        ]);

        if (resReports.ok && resWeekly.ok) {
          const reports = await resReports.json();
          const weekly = await resWeekly.json();
          // Save the API data to our React State
          setReportData(reports);
          setWeeklyData(weekly);
        } else {
          toast.error('Failed to load dashboard data');
        }
      } catch (error) {
        toast.error('Network error loading dashboard');
      } finally {
        // Stop spinning loading wheel whether the fetch failed or succeeded
        setLoading(false);
      }
    };

    // Only attempt the fetch if the user session actually exists
    if (session) fetchData();
  }, [session]);

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'CASHIER']}>
      <Layout title="Dashboard">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
            {isCashier ? 'My Sales Dashboard' : 'Dashboard Overview'}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            {isCashier 
              ? `Hello ${user.name}, tracked your personal performance for today.` 
              : "Welcome back. Here's what's happening today."}
          </p>
        </div>

        <DashboardCards data={reportData?.dailySnapshot} role={user?.role} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <SalesChart data={weeklyData} />
          </div>

          <div className="space-y-8">
            {/* Top Products */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Top Products</h3>
              <div className="space-y-4">
                {reportData?.topProducts?.map((product, i) => (
                  <div key={product.productId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-surface-elevated flex items-center justify-center text-sm font-bold text-slate-500 dark:text-slate-500 dark:text-slate-400">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">{product.productName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 dark:text-slate-400">{product.totalQty} sold</p>
                      </div>
                    </div>
                    <span className="font-medium text-emerald-400">
                      {formatPrice(product.totalRevenue)}
                    </span>
                  </div>
                ))}
                {!reportData?.topProducts?.length && (
                  <p className="text-sm text-slate-400 dark:text-slate-500">No sales data yet.</p>
                )}
              </div>
            </div>

            {!isCashier && (
              <div className="card p-6 border-t-4 border-indigo-500/50">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Cashier Performance</h3>
                <div className="space-y-4">
                  {reportData?.cashierPerformance?.map((cashier) => (
                    <div key={cashier.cashierId} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">{cashier.cashierName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 dark:text-slate-400">{cashier.totalSales} transactions</p>
                      </div>
                      <span className="font-medium text-indigo-400">
                        {formatPrice(cashier.totalRevenue)}
                      </span>
                    </div>
                  ))}
                  {!reportData?.cashierPerformance?.length && (
                    <p className="text-sm text-slate-400 dark:text-slate-500">No data available.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
