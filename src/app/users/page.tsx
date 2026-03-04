"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UsersPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(userId.trim());
    if (!isNaN(id) && id > 0) {
      router.push(`/users/${id}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-100 mb-1">User Lookup</h1>
      <p className="text-slate-400 text-sm mb-6">
        Enter a User ID to view detailed token usage, cost breakdown, and session history.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md space-y-4"
      >
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-1.5">
            User ID
          </label>
          <input
            type="number"
            min={1}
            placeholder="e.g. 42"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            autoFocus
            className="w-full bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2 rounded-lg transition-colors"
        >
          View User Detail →
        </button>
      </form>
    </div>
  );
}
