import {
  Search,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";

function Navbar({
  user,
  searchTerm,
  setSearchTerm,
}) {
  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">

      {/* ================= Left Section ================= */}

      <div className="flex h-16 w-[460px] items-center rounded-2xl border border-slate-200 bg-white px-5 shadow-sm transition-all duration-200 focus-within:border-indigo-500 focus-within:shadow-md">

        <Search
          size={22}
          strokeWidth={2}
          className="text-slate-400"
        />

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for products..."
          className="ml-4 flex-1 bg-transparent text-[15px] text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />

        <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
          ⌘K
        </span>

      </div>

      {/* ================= Right Section ================= */}

      <div className="flex items-center gap-4">

        {/* Notification */}

        <button className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition hover:bg-slate-50">

          <Bell size={20} className="text-slate-600" />

          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-semibold text-white">
            3
          </span>

        </button>

        {/* Profile */}

        <button className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:bg-slate-50">

          <img
            src="https://i.pravatar.cc/100"
            alt="Profile"
            className="h-11 w-11 rounded-full object-cover"
          />

          <div className="text-left">

            <p className="text-sm font-semibold text-slate-800">
              {user ? user.name : "Guest"}
            </p>

            <p className="text-xs text-slate-500">
              Premium User
            </p>

          </div>

          <ChevronDown
            size={18}
            className="text-slate-400"
          />

        </button>

        {/* Settings */}

        <button className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition hover:bg-slate-50">

          <Settings
            size={20}
            className="text-slate-600"
          />

        </button>

        {/* Logout */}

        <button className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition hover:bg-red-50">

          <LogOut
            size={20}
            className="text-slate-600"
          />

        </button>

      </div>

    </header>
  );
}

export default Navbar;