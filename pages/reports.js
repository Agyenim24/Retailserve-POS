import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import SalesChart from '../components/SalesChart';
import DashboardCards from '../components/DashboardCards';
import { PresentationChartLineIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useCurrency } from '../lib/CurrencyContext';

export default function Reports() {
  // --- CONTEXT & STATE ---
  // Retrieves the dynamically selected currency symbol (USD or GHS)
  const { formatPrice } = useCurrency();
  // Holds the high-level daily overview numbers (e.g. today's total revenue)
  const [reportData, setReportData] = useState(null);
  // Holds the array of 7-day data used by the SalesChart graph
  const [weeklyData, setWeeklyData] = useState([]);
  // Holds every single transaction ever made (or for the selected date)
  const [salesHistory, setSalesHistory] = useState([]);
  // Controls the loading spinner
  const [loading, setLoading] = useState(true);
  // Optional date string (YYYY-MM-DD) to filter all data below to a specific day
  const [dateFilter, setDateFilter] = useState('');

  // --- DATA FETCHING ---
  const fetchData = async () => {
    setLoading(true);
    try {
      // If the user selected a date, we append ?date=YYYY-MM-DD to the API request
      const urlParams = dateFilter ? `?date=${dateFilter}` : '';
      
      // Fetch the 3 completely different datasets at the exact same time
      const [resReports, resWeekly, resSales] = await Promise.all([
        fetch(`/api/reports${urlParams}`), // Overall totals and leaderboards
        fetch('/api/reports/weekly'),      // The graph data (always 7 trailing days)
        fetch(`/api/sales${urlParams}`)    // The raw historical receipts
      ]);

      if (resReports.ok && resWeekly.ok && resSales.ok) {
        setReportData(await resReports.json());
        setWeeklyData(await resWeekly.json());
        setSalesHistory(await resSales.json());
      } else {
        toast.error('Failed to load report data');
      }
    } catch (error) {
      toast.error('Network error loading reports');
    } finally {
      setLoading(false);
    }
  };

  // Triggers the fetch automatically on first load, OR whenever the user picks a new date
  useEffect(() => {
    fetchData();
  }, [dateFilter]);

  if (loading && !reportData) {
    return (
      <Layout title="Reports & Analytics">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
      <Layout title="Reports & Analytics">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">Reports & Analytics</h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">Detailed performance and sales history</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-200 dark:border-slate-700 w-full lg:w-auto shadow-sm">
            <span className="text-[10px] sm:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Filter by Date</span>
            <div className="flex gap-2">
              <input 
                type="date" 
                className="input h-9 sm:h-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 w-full sm:w-auto text-sm"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              {dateFilter && (
                <button 
                  onClick={() => setDateFilter('')}
                  className="btn-secondary h-9 sm:h-auto py-0 px-4 text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Top level metrics reuse DashboardCards */}
        <DashboardCards data={reportData?.dailySnapshot} />

        {/* Expanded Chart area */}
        <div className="card p-6 mb-8">
           <div className="flex items-center gap-2 mb-6">
             <PresentationChartLineIcon className="h-6 w-6 text-primary-400" />
             <h3 className="text-lg font-bold text-slate-900 dark:text-white">Revenue Trends</h3>
           </div>
           <SalesChart data={weeklyData} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Products */}
          <div className="card">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 bg-surface-elevated">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Top Selling Products</h3>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {reportData?.topProducts?.map((p, i) => (
                  <div key={p.productId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                        {i + 1}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{p.productName}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{p.totalQty} units sold</div>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatPrice(p.totalRevenue)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cashier Performance */}
          <div className="card">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 bg-surface-elevated">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cashier Performance</h3>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {reportData?.cashierPerformance?.map((c) => (
                  <div key={c.cashierId} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">{c.cashierName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{c.totalSales} transactions</div>
                    </div>
                    <div className="text-sm font-bold text-emerald-500">
                      {formatPrice(c.totalRevenue)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <div className="card p-5 bg-gradient-to-br from-blue-500/5 to-transparent">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-1">Total Inventory Value</p>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                {formatPrice(reportData?.inventoryReport?.totalValue)}
              </h4>
              <p className="text-xs text-slate-400 mt-2">{reportData?.inventoryReport?.totalItems || 0} items in stock</p>
           </div>
           <div className="card p-5 bg-gradient-to-br from-emerald-500/5 to-transparent">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-1">Potential Profit</p>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                {formatPrice(reportData?.inventoryReport?.potentialProfit)}
              </h4>
              <p className="text-xs text-slate-400 mt-2">Based on current stock levels</p>
           </div>
           <div className="card p-5 bg-gradient-to-br from-red-500/5 to-transparent border-red-500/10">
              <p className="text-xs font-bold uppercase tracking-wider text-red-500 mb-1">Low Stock Alert</p>
              <h4 className="text-2xl font-black text-red-500">{reportData?.inventoryReport?.lowStockCount || 0}</h4>
              <p className="text-xs text-slate-400 mt-2">Products below threshold</p>
           </div>
        </div>

        {/* Raw Sales History Table */}
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 bg-surface-elevated flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Transaction History</h3>
            <span className="badge-blue">{salesHistory.length} records</span>
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-500 dark:text-slate-300">
              <thead className="bg-surface-card text-xs uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700/50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 font-semibold">TID / Date</th>
                  <th className="px-6 py-4 font-semibold">Cashier</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold text-center">Method</th>
                  <th className="px-6 py-4 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {salesHistory.map((sale) => (
                  <tr key={sale.id} className="hover:bg-surface-elevated/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs text-primary-400 mb-0.5">{sale.id}</div>
                      <div className="text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        {new Date(sale.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{sale.cashierName}</td>
                    <td className="px-6 py-4">{sale.customerName || 'Walk-in'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        sale.paymentMethod === 'CASH' ? 'bg-emerald-500/10 text-emerald-400' :
                        sale.paymentMethod === 'CARD' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-purple-500/10 text-purple-400'
                      }`}>
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-400">
                      {formatPrice(sale.totalAmount)}
                    </td>
                  </tr>
                ))}
                {salesHistory.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                      No sales records found for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </Layout>
    </ProtectedRoute>
  );
}
