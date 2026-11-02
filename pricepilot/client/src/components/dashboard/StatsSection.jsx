import {
  Package,
  Bell,
  TrendingDown,
  Activity,
} from "lucide-react";

import StatCard from "./StatCard";

function StatsSection({ products }) {
  const stats = [
    {
      title: "Total Products",
      value: products.length,
      subtitle: "Products being tracked",
      icon: Package,
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-100",
    },
    {
      title: "Active Alerts",
      value: 0,
      subtitle: "Waiting for price drops",
      icon: Bell,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-100",
    },
    {
      title: "Price Drops",
      value: 0,
      subtitle: "Detected today",
      icon: TrendingDown,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-100",
    },
    {
      title: "Tracker Status",
      value: "Live",
      subtitle: "Monitoring products",
      icon: Activity,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
    },
  ];

  return (
    <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          {...stat}
        />
      ))}
    </section>
  );
}

export default StatsSection;