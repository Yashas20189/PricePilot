import { ArrowUpRight } from "lucide-react";

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  iconBg,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

      {/* Top */}

      <div className="flex items-center justify-between">

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconBg}`}
        >
          <Icon
            size={22}
            className={iconColor}
          />
        </div>

        <ArrowUpRight
          size={18}
          className="text-slate-300"
        />

      </div>

      {/* Content */}

      <div className="mt-6">

        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <h2 className="mt-2 text-3xl font-bold text-slate-900">
          {value}
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          {subtitle}
        </p>

      </div>

    </div>
  );
}

export default StatCard;