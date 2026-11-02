import { Rocket, Gem, Check } from "lucide-react";
import { navigation } from "../../config/navigation";

const Sidebar = () => {
  return (
    <aside className="flex h-screen w-80 flex-col border-r border-slate-200 bg-white">

      {/* ================= Logo ================= */}

      <div className="border-b border-slate-200 px-6 py-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50">
            <Rocket className="h-7 w-7 text-indigo-600" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              PricePilot
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Smart Price Tracker
            </p>
          </div>
        </div>
      </div>

      {/* ================= Navigation ================= */}

      <nav className="flex-1 px-6 py-8 space-y-3">
        {navigation.map((item, index) => {
          const Icon = item.icon;

          // Temporary active state
          const isActive = index === 0;

          return (
            <button
              key={item.name}
              className={`
                group flex w-full items-center gap-4 rounded-2xl px-5 py-3.5
                text-left transition-all duration-200
                ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }
              `}
            >
              <Icon
                size={21}
                className={`transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-slate-500 group-hover:text-indigo-600"
                }`}
              />

              <span className="text-[15px] font-medium">
                {item.name}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ================= Bottom ================= */}

      <div className="border-t border-slate-200 px-6 pt-6 pb-8">

        <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-500 p-7 text-white shadow-xl">

          <div className="mb-5 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
              <Gem size={30} />
            </div>
          </div>

          <h3 className="text-center text-xl font-semibold">
            Upgrade to Premium
          </h3>

          <p className="mt-3 text-center text-sm leading-6 text-indigo-100">
            Unlock advanced features and AI-powered price intelligence.
          </p>

          <div className="mt-7 space-y-4">

            <div className="flex items-center gap-3 text-sm">
              <Check size={17} />
              <span>Unlimited Products</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Check size={17} />
              <span>AI Insights</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Check size={17} />
              <span>Priority Alerts</span>
            </div>

          </div>

          <button
            className="
              mt-8
              w-full
              rounded-2xl
              bg-white
              py-3.5
              font-semibold
              text-indigo-700
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:shadow-lg
            "
          >
            Upgrade Now
          </button>

        </div>

      </div>

    </aside>
  );
};

export default Sidebar;