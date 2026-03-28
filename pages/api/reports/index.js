// pages/api/reports/index.js
import { store } from '../../../lib/store';
import { requireAuth, ROLES } from '../../../lib/auth';

export default async function handler(req, res) {
  const session = await requireAuth(req, res, [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER]);
  if (!session) return;

  const user = session.user;
  const isCashier = user.role === ROLES.CASHIER;

  if (req.method === 'GET') {
    const { date, cashierId } = req.query;
    
    // Security: Cashiers can only see their own reports
    const targetCashierId = isCashier ? user.id : cashierId;
    
    // Aggregate report data to serve a unified dashboard payload
    const dailySales = await store.getDailySales({ 
      date: date || new Date().toISOString().split('T')[0],
      cashierId: targetCashierId
    });
    
    const topProductsRaw = await store.getTopProducts();
    const topProducts = topProductsRaw.slice(0, 5); 
    const cashierPerformance = isCashier ? null : await store.getCashierPerformance(date);
    const inventoryReport = isCashier ? null : await store.getInventoryReport();
    const profitReport = isCashier ? null : await store.getProfitReport(date);
    
    return res.status(200).json({
      dailySnapshot: {
        revenue: dailySales.totalRevenue,
        transactions: dailySales.totalTransactions,
        // For cashiers, profit metrics might be hidden or local
        profit: profitReport?.totalProfit || 0,
        margin: profitReport?.profitMargin || 0,
      },
      topProducts,
      cashierPerformance,
      inventoryReport,
      profitReport
    });
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
