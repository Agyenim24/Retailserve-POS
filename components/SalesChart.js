import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useCurrency } from '../lib/CurrencyContext';

export default function SalesChart({ data }) {
  const { formatPrice, currency } = useCurrency();
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  if (!data || data.length === 0) {
    return (
      <div className="card p-6 h-96 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
        <p>No chart data available</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // In PieChart, the name (day) is in payload[0].name
      // In BarChart, the day is in the 'label' prop
      const day = label || payload[0].name;
      const revenue = payload[0].value;

      return (
        <div className="bg-surface-elevated border border-slate-300 dark:border-slate-600 rounded-lg p-3 shadow-xl">
          <p className="text-slate-900 dark:text-white font-medium mb-1">{day}</p>
          <p className="text-primary-400 text-sm">
            Revenue: <span className="font-bold">{formatPrice(revenue)}</span>
          </p>
          {payload[1] && (
            <p className="text-emerald-400 text-sm">
              Sales: <span className="font-bold">{payload[1].value}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card p-6 h-[400px] flex flex-col hover:border-slate-500/50 transition-colors">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <span className="w-2 h-6 bg-primary-500 rounded-full"></span>
        Weekly Revenue Overview
      </h3>
      <div className="flex-1 w-full relative">
        {/* Desktop and Tablet: Bar Chart */}
        <div className="hidden md:block w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 30, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#94a3b8" 
                tick={{ fill: '#94a3b8' }} 
                axisLine={false} 
                tickLine={false}
                dy={10}
              />
              <YAxis 
                stroke="#94a3b8" 
                tick={{ fill: '#94a3b8' }} 
                axisLine={false} 
                tickLine={false} 
                tickFormatter={(value) => `${currency}${value}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#334155', opacity: 0.4 }} />
              <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Mobile: Pie Chart */}
        <div className="block md:hidden w-full h-full flex items-center justify-center">
          {data.every(d => !d.sales) ? (
            <div className="text-slate-400 text-sm">No sales data for pie chart.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.filter(d => d.sales > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="sales"
                  nameKey="name"
                >
                  {data.filter(d => d.sales > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
