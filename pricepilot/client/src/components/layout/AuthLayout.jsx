import { useState } from "react";

export const displayFont = {
  fontFamily: "'Bricolage Grotesque', Inter, system-ui, sans-serif",
};

export const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

// One page-load moment: the price line draws, then the alert appears.
const css = `
@keyframes pp-draw { to { stroke-dashoffset: 0; } }
@keyframes pp-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes pp-rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.pp-draw { stroke-dasharray: 1; stroke-dashoffset: 1; animation: pp-draw 1.8s cubic-bezier(.4,0,.2,1) .3s forwards; }
.pp-in { opacity: 0; animation: pp-in .5s ease-out forwards; }
.pp-rise { opacity: 0; animation: pp-rise .5s ease-out forwards; }
@media (prefers-reduced-motion: reduce) {
  .pp-draw { animation: none; stroke-dashoffset: 0; }
  .pp-in, .pp-rise { animation: none; opacity: 1; }
}
`;

export function Logo({ dark = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 16l5-5 4 3 7-8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15 6h5v5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span
        className={`text-xl font-bold tracking-tight ${dark ? "text-white" : "text-slate-900"}`}
        style={displayFont}
      >
        PricePilot
      </span>
    </div>
  );
}

function TrackerCard() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Noise-cancelling headphones</p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-semibold tabular-nums" style={displayFont}>
              ₹23,990
            </span>
            <span className="text-sm tabular-nums text-slate-500 line-through">₹29,990</span>
          </p>
        </div>
        <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
          20% lower
        </span>
      </div>

      <svg
        viewBox="0 0 360 150"
        className="mt-4 w-full"
        role="img"
        aria-label="Sample price history that falls below the target price"
      >
        <defs>
          <linearGradient id="ppFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#93c5fd" stopOpacity="0" />
          </linearGradient>
        </defs>

        <line x1="0" y1="110" x2="360" y2="110" stroke="#64748b" strokeDasharray="4 5" />
        <text x="10" y="102" fontSize="10" fill="#94a3b8">
          Your target ₹24,999
        </text>

        <path
          className="pp-in"
          style={{ animationDelay: "1.4s" }}
          d="M10 28 L55 36 L100 26 L145 50 L190 44 L235 72 L280 66 L320 106 L350 124 L350 150 L10 150 Z"
          fill="url(#ppFill)"
        />
        <path
          className="pp-draw"
          pathLength="1"
          d="M10 28 L55 36 L100 26 L145 50 L190 44 L235 72 L280 66 L320 106 L350 124"
          fill="none"
          stroke="#93c5fd"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          className="pp-in"
          style={{ animationDelay: "2s" }}
          cx="350"
          cy="124"
          r="5"
          fill="#0B1630"
          stroke="#34d399"
          strokeWidth="2.5"
        />
      </svg>

      <div className="mt-1 flex justify-between text-xs text-slate-500">
        <span>30 days ago</span>
        <span>Today</span>
      </div>

      <div
        className="pp-rise mt-4 flex items-center gap-2.5 rounded-xl bg-emerald-400/10 px-3.5 py-2.5 text-sm text-emerald-200"
        style={{ animationDelay: "2.1s" }}
      >
        <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
        Email sent: price dropped below your target.
      </div>
    </div>
  );
}

export default function AuthLayout({ headline, lead, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 sm:p-8">
      <style>{css}</style>

      <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-300/50 lg:min-h-[700px] lg:grid-cols-[1.05fr_1fr]">
        {/* Brand panel (desktop only) */}
        <aside className="relative hidden flex-col justify-between gap-10 overflow-hidden bg-[#0B1630] p-12 text-white lg:flex">
          <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl" />

          <div className="relative z-10 space-y-10">
            <Logo dark />

            <div className="max-w-md">
              <h1
                className="text-4xl font-bold leading-[1.1] tracking-tight xl:text-[2.6rem]"
                style={displayFont}
              >
                {headline}
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-300">{lead}</p>
            </div>

            <div className="max-w-md">
              <TrackerCard />
            </div>
          </div>

          <div className="relative z-10">
            <dl className="grid max-w-md grid-cols-3 gap-6 text-sm">
              {[
                ["Amazon & Flipkart", "Track both from one place."],
                ["Price history", "See trends, not guesses."],
                ["Email alerts", "Hear when your target hits."],
              ].map(([title, text]) => (
                <div key={title}>
                  <dt className="font-medium text-white">{title}</dt>
                  <dd className="mt-1 text-slate-400">{text}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-8 text-xs text-slate-500">© 2026 PricePilot. All rights reserved.</p>
          </div>
        </aside>

        {/* Form side */}
        <main className="flex items-center justify-center p-6 sm:p-12 lg:p-16">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Logo />
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function Field({ id, label, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input id={id} className={inputClass} {...props} />
    </div>
  );
}

export function PasswordField({ id, label, children, ...props }) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          className={`${inputClass} pr-16`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
      {children}
    </div>
  );
}

export function FormError({ message }) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
      <p className="text-sm text-red-600">{message}</p>
    </div>
  );
}

export function SubmitButton({ loading, loadingText, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-xl bg-blue-600 py-3.5 font-semibold text-white shadow-lg shadow-blue-200 transition duration-200 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? loadingText : children}
    </button>
  );
}
