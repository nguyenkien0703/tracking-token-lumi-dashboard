"use client";

import Link from "next/link";

export default function TokenExpiredBanner() {
  return (
    <div className="bg-amber-900/30 border border-amber-600 rounded-xl px-5 py-4 flex items-start gap-3">
      <svg
        className="w-5 h-5 text-amber-400 shrink-0 mt-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <div>
        <p className="text-amber-300 font-semibold text-sm">Token hết hạn</p>
        <p className="text-amber-400/80 text-xs mt-0.5">
          Admin token đã expire. Vào Settings để cập nhật token mới.
        </p>
      </div>
      <Link
        href="/settings"
        className="ml-auto shrink-0 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors"
      >
        Update Token →
      </Link>
    </div>
  );
}
