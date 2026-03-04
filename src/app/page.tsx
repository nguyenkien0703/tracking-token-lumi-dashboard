"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const QUICK_USERS = [
  { id: 57, label: "User #57" },
];

export default function OverviewPage() {
  const router = useRouter();
  const [userIdInput, setUserIdInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(userIdInput.trim());
    if (!isNaN(id) && id > 0) router.push(`/users/${id}`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Lumi Token Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">
          Monitoring token usage & cost per user — powered by lumilink-be tracking API.
        </p>
      </div>

      {/* Info box */}
      <div className="bg-indigo-950/40 border border-indigo-800/50 rounded-xl p-5 max-w-2xl">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-slate-300 space-y-1">
            <p className="font-medium text-slate-200">Cách sử dụng</p>
            <p>Nhập <strong>User ID</strong> để xem chi tiết token usage, cost theo session, và biểu đồ theo thời gian.</p>
            <p className="text-slate-400 text-xs">
              Tìm User ID trong URL chat app — VD: session <code className="bg-slate-800 px-1 rounded">abc-uuid-<strong className="text-indigo-300">57</strong></code> → userId = <strong className="text-indigo-300">57</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-2xl space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="number"
            min={1}
            placeholder="Nhập User ID (VD: 57)"
            value={userIdInput}
            onChange={(e) => setUserIdInput(e.target.value)}
            autoFocus
            className="flex-1 bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={!userIdInput.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap"
          >
            View Detail →
          </button>
        </form>

        {/* Quick links */}
        {QUICK_USERS.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-500 text-xs">Quick:</span>
            {QUICK_USERS.map((u) => (
              <button
                key={u.id}
                onClick={() => router.push(`/users/${u.id}`)}
                className="text-xs px-3 py-1 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
              >
                {u.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl">
        {[
          {
            icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
            title: "Token & Cost",
            desc: "Tổng prompt/completion tokens và USD cost theo user và date range.",
          },
          {
            icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
            title: "Session History",
            desc: "Lịch sử từng lượt chat với chi tiết inputCost, outputCost, model.",
          },
          {
            icon: "M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z",
            title: "Timeline Chart",
            desc: "Biểu đồ tokens theo ngày để phân tích xu hướng sử dụng.",
          },
        ].map((card) => (
          <div key={card.title} className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
            <div className="w-8 h-8 rounded-lg bg-indigo-900/50 flex items-center justify-center mb-3">
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
              </svg>
            </div>
            <p className="text-slate-200 font-medium text-sm">{card.title}</p>
            <p className="text-slate-400 text-xs mt-1">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
