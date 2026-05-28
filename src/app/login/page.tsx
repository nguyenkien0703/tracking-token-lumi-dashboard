import { Shield, TrendingUp, Activity, Zap, ArrowUpRight } from "lucide-react";

type SearchParams = { error?: string; from?: string };

const ERROR_MESSAGES: Record<string, string> = {
  domain_not_allowed: "Only @savameta.com Google accounts can sign in.",
  email_not_verified: "Your Google account email is not verified.",
  nonce_mismatch: "Login session expired. Please try again.",
  state_mismatch: "Login session expired. Please try again.",
  missing_oauth_cookies: "Login session expired. Please try again.",
  missing_code_or_state: "Login was interrupted. Please try again.",
  access_denied: "You cancelled the sign-in.",
};

export default function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const error = searchParams.error;
  const from = searchParams.from ?? "/";
  const message = error ? (ERROR_MESSAGES[error] ?? `Sign-in failed (${error}). Please try again.`) : null;
  const loginHref = `/api/auth/login?from=${encodeURIComponent(from)}`;

  return (
    <div className="min-h-dvh grid lg:grid-cols-[1.15fr_1fr] bg-slate-950">
      {/* ============ LEFT — Hero panel (desktop only) ============ */}
      <aside
        aria-hidden
        className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 xl:p-14"
        style={{
          background:
            "radial-gradient(120% 80% at 0% 0%, rgba(99,102,241,0.18) 0%, rgba(99,102,241,0) 55%), radial-gradient(80% 60% at 100% 100%, rgba(245,158,11,0.10) 0%, rgba(245,158,11,0) 60%), linear-gradient(180deg, #0A0F22 0%, #0B1020 100%)",
        }}
      >
        {/* Grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.06) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage:
              "radial-gradient(ellipse 85% 70% at 50% 40%, black 50%, transparent 90%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 85% 70% at 50% 40%, black 50%, transparent 90%)",
          }}
        />

        {/* Top — brand wordmark */}
        <div className="relative flex items-center gap-2.5 z-10">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-indigo-500/40 blur-lg" />
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-900/50 ring-1 ring-white/15">
              L
            </div>
          </div>
          <span className="text-white font-bold tracking-tight text-lg">
            LumiPulse
          </span>
        </div>

        {/* Middle — value prop + sparkline card */}
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-[11px] font-medium text-indigo-300 mb-5">
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
              <span className="relative rounded-full bg-emerald-400 w-1.5 h-1.5" />
            </span>
            Live token analytics
          </span>

          <h1 className="text-[2.5rem] xl:text-[3rem] leading-[1.05] font-bold tracking-tight text-slate-50">
            See every token,
            <br />
            <span className="bg-gradient-to-r from-indigo-300 via-indigo-400 to-amber-300 bg-clip-text text-transparent">
              every cost, in real time.
            </span>
          </h1>
          <p className="mt-5 text-slate-400 text-sm xl:text-base leading-relaxed max-w-md">
            LumiPulse turns LumiLink usage into actionable analytics — track spend per
            model, drill into sessions, and stay ahead of cost surprises.
          </p>

          {/* Decorative analytics card */}
          <div className="mt-9 max-w-sm">
            <div className="relative rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur-xl p-5 shadow-2xl shadow-indigo-950/40">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">
                    This week
                  </div>
                  <div
                    className="mt-1 text-2xl font-bold text-slate-100"
                    style={{ fontFamily: "var(--font-mono), monospace", fontVariantNumeric: "tabular-nums" }}
                  >
                    $12,485
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-400/20 text-[11px] font-medium text-emerald-300">
                  <ArrowUpRight className="w-3 h-3" />
                  18.2%
                </span>
              </div>

              {/* Sparkline */}
              <svg viewBox="0 0 280 80" className="w-full h-16 mt-3" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="sparkStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#818CF8" />
                    <stop offset="100%" stopColor="#FBBF24" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 60 L 28 55 L 56 58 L 84 45 L 112 48 L 140 38 L 168 42 L 196 28 L 224 32 L 252 18 L 280 22 L 280 80 L 0 80 Z"
                  fill="url(#sparkFill)"
                />
                <path
                  d="M 0 60 L 28 55 L 56 58 L 84 45 L 112 48 L 140 38 L 168 42 L 196 28 L 224 32 L 252 18 L 280 22"
                  fill="none"
                  stroke="url(#sparkStroke)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <div className="mt-2 grid grid-cols-3 gap-3 text-[11px]">
                <div>
                  <div className="text-slate-500">Requests</div>
                  <div
                    className="text-slate-200 font-semibold"
                    style={{ fontFamily: "var(--font-mono), monospace", fontVariantNumeric: "tabular-nums" }}
                  >
                    48.2K
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Avg / req</div>
                  <div
                    className="text-slate-200 font-semibold"
                    style={{ fontFamily: "var(--font-mono), monospace", fontVariantNumeric: "tabular-nums" }}
                  >
                    $0.26
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Users</div>
                  <div
                    className="text-slate-200 font-semibold"
                    style={{ fontFamily: "var(--font-mono), monospace", fontVariantNumeric: "tabular-nums" }}
                  >
                    1,247
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom — feature pills */}
        <div className="relative z-10">
          <ul className="grid grid-cols-3 gap-3 max-w-xl">
            <li className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center text-indigo-300">
                <TrendingUp className="w-4 h-4" />
              </div>
              Cost trends
            </li>
            <li className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-400/20 flex items-center justify-center text-amber-300">
                <Activity className="w-4 h-4" />
              </div>
              Live sessions
            </li>
            <li className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center text-emerald-300">
                <Zap className="w-4 h-4" />
              </div>
              Per-model drill
            </li>
          </ul>
        </div>
      </aside>

      {/* ============ RIGHT — Auth panel ============ */}
      <section className="relative flex flex-col min-h-dvh bg-slate-950">
        {/* Mobile-only ambient backdrop */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 lg:hidden"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0) 70%)",
          }}
        />

        {/* Mobile-only brand */}
        <div className="lg:hidden relative z-10 flex items-center gap-2 px-6 pt-8">
          <div className="relative">
            <div className="absolute inset-0 rounded-lg bg-indigo-500/40 blur-md" />
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow ring-1 ring-white/15">
              L
            </div>
          </div>
          <span className="text-white font-bold tracking-tight text-base">LumiPulse</span>
        </div>

        {/* Form column */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-sm">
            <header className="mb-8">
              <h2 className="text-2xl font-bold text-slate-50 tracking-tight">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Sign in with your{" "}
                <span className="text-slate-200 font-medium">@savameta.com</span>{" "}
                Google account to access the dashboard.
              </p>
            </header>

            {message && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2.5 bg-red-950/40 border border-red-800/60 rounded-lg px-3.5 py-3 text-xs text-red-300"
              >
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="leading-relaxed">{message}</span>
              </div>
            )}

            <a
              href={loginHref}
              className="group relative w-full flex items-center justify-center gap-2.5 h-11 rounded-lg bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-900 text-sm font-semibold transition-all duration-200 shadow-lg shadow-black/30 hover:shadow-indigo-500/20 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 48 48" aria-hidden>
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8a12 12 0 1 1 0-24c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 1 0 24 44a20 20 0 0 0 19.6-23.5z" />
                <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44c5 0 9.6-1.9 13.1-5l-6.1-5c-2 1.4-4.4 2.2-7 2.2-5.3 0-9.7-3.4-11.3-8l-6.6 5.1A20 20 0 0 0 24 44z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.1 5c.4-.4 6.9-5 6.9-14.7 0-1.2-.1-2.4-.4-3.5z" />
              </svg>
              Continue with Google
            </a>

            {/* Divider with helper */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-800" />
              <span className="text-[11px] uppercase tracking-wider text-slate-600 font-medium">
                Internal access only
              </span>
              <div className="h-px flex-1 bg-slate-800" />
            </div>

            {/* Trust row */}
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <Shield className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-emerald-400" aria-hidden />
                <span>Secured with Google OAuth 2.0 and short-lived sessions.</span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <span>Access limited to verified @savameta.com workspace members.</span>
              </li>
            </ul>

            <p className="mt-8 text-[11px] text-slate-600">
              Trouble signing in? Contact{" "}
              <a
                href="mailto:kiennv@savameta.com"
                className="text-slate-400 hover:text-slate-200 underline underline-offset-2 transition-colors"
              >
                kiennv@savameta.com
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative z-10 px-6 pb-6 flex items-center justify-between text-[11px] text-slate-600">
          <span>© {new Date().getFullYear()} Savameta</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms</a>
          </div>
        </footer>
      </section>
    </div>
  );
}
