import { 
  CurrencyDollarIcon, 
  ShoppingCartIcon, 
  ExclamationTriangleIcon,
  ShoppingBagIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline';
import { useCurrency } from '../lib/CurrencyContext';

export default function DashboardCards({ data, role }) {
  const { formatPrice } = useCurrency();
  if (!data) return null;

  const isCashier = role === 'CASHIER';

  const cards = [
    {
      title: isCashier ? "My Revenue Today" : "Today's Revenue",
      value: formatPrice(data.revenue),
      icon: CurrencyDollarIcon,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20"
    },
    {
      title: isCashier ? "My Transactions" : "Today's Transactions",
      value: data.transactions || 0,
      icon: ShoppingCartIcon,
      color: "text-primary-500",
      bg: "bg-primary-500/10",
      border: "border-primary-500/20"
    },
    // Only show profit data to Admins/Managers
    ...(!isCashier ? [
      {
        title: "Today's Profit",
        value: formatPrice(data.profit),
        icon: CurrencyDollarIcon,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20"
      },
      {
        title: "Profit Margin",
        value: `${data.margin?.toFixed(1) || '0.0'}%`,
        icon: PresentationChartLineIcon,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20"
      }
    ] : [])
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, i) => (
        <div key={i} className={`card p-6 flex items-center justify-between border-b-4 ${card.border}`}>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{card.title}</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{card.value}</h3>
          </div>
          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${card.bg}`}>
            <card.icon className={`h-7 w-7 ${card.color}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
