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
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-sm space-y-6">
        <div>
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center mb-4 text-white font-bold">L</div>
          <h1 className="text-xl font-bold text-slate-100">Sign in to LumiPulse</h1>
          <p className="text-slate-400 text-sm mt-1">Use your @savameta.com Google account.</p>
        </div>

        {message && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 text-sm text-red-300">
            {message}
          </div>
        )}

        <a
          href={loginHref}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 48 48" aria-hidden>
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8a12 12 0 1 1 0-24c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 1 0 24 44a20 20 0 0 0 19.6-23.5z"/>
            <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5 0 9.6-1.9 13.1-5l-6.1-5c-2 1.4-4.4 2.2-7 2.2-5.3 0-9.7-3.4-11.3-8l-6.6 5.1A20 20 0 0 0 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.1 5c.4-.4 6.9-5 6.9-14.7 0-1.2-.1-2.4-.4-3.5z"/>
          </svg>
          Sign in with Google
        </a>
      </div>
    </div>
  );
}
