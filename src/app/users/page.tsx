"use client";

import UserSearch from "@/components/UserSearch";

export default function UsersPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-100 mb-1">User Lookup</h1>
      <p className="text-slate-400 text-sm mb-6">
        Search by name or email to view token usage, cost breakdown, and session history.
      </p>

      <UserSearch expanded />
    </div>
  );
}
