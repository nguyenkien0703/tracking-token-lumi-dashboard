import { Shield, Sparkles, BarChart3 } from "lucide-react";

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
    <div className="relative min-h-screen overflow-hidden">
      {/* Ambient background layers */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(99,102,241,0.18) 0%, rgba(99,102,241,0) 70%), radial-gradient(40% 35% at 85% 90%, rgba(245,158,11,0.10) 0%, rgba(245,158,11,0) 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.06) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, black 40%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, black 40%, transparent 80%)",
        }}
      />

      {/* Content */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-10">
        <main className="w-full max-w-sm">
          {/* Brand mark */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-5">
              <div
                aria-hidden
                className="absolute inset-0 rounded-2xl bg-indigo-500/40 blur-xl"
              />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-900/50 ring-1 ring-white/10">
                L
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              LumiPulse
            </h1>
            <p className="text-slate-400 text-sm mt-1.5">
              Real-time token analytics for LumiLink
            </p>
          </div>

          {/* Auth card */}
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-px rounded-2xl bg-gradient-to-b from-white/10 to-transparent"
            />
            <div className="relative bg-slate-900/60 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-6 space-y-5">
              <div className="text-center">
                <h2 className="text-base font-semibold text-slate-100">Sign in to continue</h2>
                <p className="text-slate-400 text-xs mt-1">
                  Use your <span className="text-slate-200 font-medium">@savameta.com</span> Google account
                </p>
              </div>

              {message && (
                <div
                  role="alert"
                  className="bg-red-950/40 border border-red-800/60 rounded-lg px-3.5 py-2.5 text-xs text-red-300"
                >
                  {message}
                </div>
              )}

              <a
                href={loginHref}
                className="group w-full flex items-center justify-center gap-2.5 py-2.5 rounded-lg bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-900 text-sm font-medium transition-all duration-200 shadow-lg shadow-black/20 hover:shadow-indigo-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48" aria-hidden>
                  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8a12 12 0 1 1 0-24c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 1 0 24 44a20 20 0 0 0 19.6-23.5z" />
                  <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z" />
                  <path fill="#4CAF50" d="M24 44c5 0 9.6-1.9 13.1-5l-6.1-5c-2 1.4-4.4 2.2-7 2.2-5.3 0-9.7-3.4-11.3-8l-6.6 5.1A20 20 0 0 0 24 44z" />
                  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.1 5c.4-.4 6.9-5 6.9-14.7 0-1.2-.1-2.4-.4-3.5z" />
                </svg>
                Continue with Google
              </a>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                <Shield className="w-3 h-3" aria-hidden />
                <span>Secured by Google OAuth 2.0</span>
              </div>
            </div>
          </div>

          {/* Feature hints */}
          <ul className="mt-8 grid grid-cols-2 gap-3 text-[11px] text-slate-500">
            <li className="flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-indigo-400/80" aria-hidden />
              <span>Usage insights</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400/80" aria-hidden />
              <span>Live cost tracking</span>
            </li>
          </ul>
        </main>

        <footer className="absolute bottom-6 text-[11px] text-slate-600">
          © {new Date().getFullYear()} Savameta · LumiPulse
        </footer>
      </div>
    </div>
  );
}
