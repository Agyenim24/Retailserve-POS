import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardCards from '../components/DashboardCards';
import SalesChart from '../components/SalesChart';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { data: session } = useSession();
  const [reportData, setReportData] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const user = session?.user;
  const isCashier = user?.role === 'CASHIER';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resReports, resWeekly] = await Promise.all([
          fetch('/api/reports'),
          fetch('/api/reports/weekly'),
        ]);

        if (resReports.ok && resWeekly.ok) {
          const reports = await resReports.json();
          const weekly = await resWeekly.json();
          setReportData(reports);
          setWeeklyData(weekly);
        } else {
          toast.error('Failed to load dashboard data');
        }
      } catch (error) {
        toast.error('Network error loading dashboard');
      } finally {
        setLoading(false);
      }
    };

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
          <p className="text-sm sm:text-base text-slate-400 dark:text-slate-400 mt-1">
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
                      <div className="h-8 w-8 rounded bg-surface-elevated flex items-center justify-center text-sm font-bold text-slate-400 dark:text-slate-400">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{product.productName}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-400">{product.totalQty} sold</p>
                      </div>
                    </div>
                    <span className="font-medium text-emerald-400">
                      ${product.totalRevenue.toFixed(2)}
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
                        <p className="text-sm font-semibold text-slate-200">{cashier.cashierName}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-400">{cashier.totalSales} transactions</p>
                      </div>
                      <span className="font-medium text-indigo-400">
                        ${cashier.totalRevenue.toFixed(2)}
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
