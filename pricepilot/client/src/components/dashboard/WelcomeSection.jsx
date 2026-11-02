import { CalendarDays, Activity } from "lucide-react";

function WelcomeSection({ user }) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <section className="mb-10">
      {/* Heading */}
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">
        Welcome back, {user ? user.email : "Guest"} 👋
      </h1>

      {/* Subtitle */}
      <p className="mt-3 text-lg text-slate-500">
        Track prices. Save more. Make smarter buying decisions.
      </p>

      {/* Status Row */}
      <div className="mt-6 flex items-center gap-4">
        {/* Date */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
          <CalendarDays size={18} className="text-indigo-600" />
          <span className="text-sm font-medium text-slate-700">
            {today}
          </span>
        </div>

        {/* Scraper Status */}
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2">
          <Activity size={16} className="text-emerald-600" />
          <span className="text-sm font-medium text-emerald-700">
            Live Scraper Active
          </span>
        </div>
      </div>
    </section>
  );
}

export default WelcomeSection;