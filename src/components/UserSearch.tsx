"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface SearchUser {
  id: number;
  firstName: string | null;
  lastName: string | null;
  userName: string;
  email: string;
  avatarUrl: string | null;
  status: string;
  roles: string[];
}

export default function UserSearch({ expanded = false }: { expanded?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/proxy/admin/users/search?q=${encodeURIComponent(q)}&page=1&limit=8`
      );
      if (!res.ok) throw new Error("Search failed");
      const json = await res.json();
      const users: SearchUser[] = json.data ?? [];
      setResults(users);
      setOpen(true);
      setActiveIndex(-1);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const goToUser = (id: number) => {
    setOpen(false);
    setQuery("");
    router.push(`/users/${id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      goToUser(results[activeIndex].id);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const displayName = (u: SearchUser) =>
    [u.firstName, u.lastName].filter(Boolean).join(" ") || u.userName;

  const initials = (u: SearchUser) =>
    (u.firstName?.[0] ?? u.lastName?.[0] ?? u.userName?.[0] ?? "#").toUpperCase();

  const resultList = (
    <ul>
      {results.map((u, i) => (
        <li key={u.id}>
          <button
            onMouseEnter={() => setActiveIndex(i)}
            onClick={() => goToUser(u.id)}
            className={`w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors ${
              i === activeIndex ? "bg-indigo-600/20" : "hover:bg-slate-700/60"
            } ${i < results.length - 1 ? "border-b border-slate-700/50" : ""}`}
          >
            {u.avatarUrl ? (
              <img src={u.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-900 flex items-center justify-center shrink-0 text-xs font-bold text-indigo-300">
                {initials(u)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-200 text-sm font-medium truncate">{displayName(u)}</span>
                {u.roles.includes("Admin") && (
                  <span className="shrink-0 text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/25 px-1.5 py-0.5 rounded-full">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-xs truncate">{u.email}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-slate-600 text-xs">#{u.id}</p>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                u.status === "Active" ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-600/30 text-slate-400"
              }`}>
                {u.status}
              </span>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );

  if (expanded) {
    return (
      <div ref={containerRef} className="max-w-lg space-y-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by name, email, or username..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="w-full bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:border-indigo-500 placeholder:text-slate-500 transition-colors"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-slate-500 border-t-indigo-400 rounded-full animate-spin" />
            ) : query ? (
              <button onClick={() => { setQuery(""); setResults([]); }} className="text-slate-500 hover:text-slate-300 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : null}
          </div>
        </div>

        {results.length > 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            {resultList}
          </div>
        )}
        {query && !loading && results.length === 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-8 text-center text-slate-500 text-sm">
            No users found for &quot;{query}&quot;
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-72">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search user by name, email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="w-full bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-lg pl-9 pr-9 py-2 focus:outline-none focus:border-indigo-500 placeholder:text-slate-500 transition-colors"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading ? (
            <span className="inline-block w-3.5 h-3.5 border-2 border-slate-500 border-t-indigo-400 rounded-full animate-spin" />
          ) : query ? (
            <button onClick={() => { setQuery(""); setResults([]); setOpen(false); }} className="text-slate-500 hover:text-slate-300 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      {open && (
        <div className="absolute top-full mt-1.5 left-0 right-0 z-50 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
          {results.length === 0 && !loading ? (
            <div className="px-4 py-6 text-center text-slate-500 text-sm">
              No users found for &quot;{query}&quot;
            </div>
          ) : resultList}
        </div>
      )}
    </div>
  );
}
