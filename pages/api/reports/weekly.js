// pages/api/reports/weekly.js
import { requireAuth, ROLES } from '../../../lib/auth';
import { supabaseAdmin } from '../../../lib/supabase';

export default async function handler(req, res) {
  const session = await requireAuth(req, res, [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER]);
  if (!session) return;

  if (req.method === 'GET') {
    try {
      // Calculate start date (7 days ago) to today
      const today = new Date();
      
      const past7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(today.getDate() - (6 - i));
        return {
          date: d.toISOString().split('T')[0],
          name: d.toLocaleDateString('en-US', { weekday: 'short' }),
          sales: 0,
          orders: 0
        };
      });

      const startDate = past7Days[0].date + 'T00:00:00.000Z';
      const endDate = past7Days[6].date + 'T23:59:59.999Z';

      const { data: sales, error } = await supabaseAdmin
        .from('sales')
        .select('created_at, final_amount, total_amount')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) throw error;

      // Group sales by exact date
      const dayMap = {};
      sales.forEach(sale => {
        const d = sale.created_at.split('T')[0];
        if (!dayMap[d]) {
          dayMap[d] = { sales: 0, orders: 0 };
        }
        dayMap[d].sales += Number(sale.final_amount || sale.total_amount || 0);
        dayMap[d].orders += 1;
      });

      // Merge aggregated totals into our sequential 7-day array
      const weeklyData = past7Days.map(dayInfo => {
        const stats = dayMap[dayInfo.date] || { sales: 0, orders: 0 };
        return {
          name: dayInfo.name,
          sales: stats.sales,
          orders: stats.orders
        };
      });

      return res.status(200).json(weeklyData);
    } catch (error) {
      console.error('Error fetching weekly sales:', error);
      return res.status(500).json({ error: 'Failed to fetch weekly data' });
    }
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
