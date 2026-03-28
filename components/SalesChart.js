import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function SalesChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="card p-6 h-96 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
        <p>No chart data available</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-elevated border border-slate-300 dark:border-slate-600 rounded-lg p-3 shadow-xl">
          <p className="text-slate-900 dark:text-white font-medium mb-1">{label}</p>
          <p className="text-primary-400 text-sm">
            Revenue: <span className="font-bold">${payload[0].value.toFixed(2)}</span>
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
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="day" 
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
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#334155', opacity: 0.4 }} />
            <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
