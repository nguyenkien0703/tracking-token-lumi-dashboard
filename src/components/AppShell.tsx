"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full z-30 transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0`}
      >
        <Sidebar onClose={() => setOpen(false)} />
      </div>

      {/* Top bar — mobile only */}
      <div className="fixed top-0 left-0 right-0 h-12 bg-slate-900 border-b border-slate-700 flex items-center px-4 z-10 md:hidden">
        <button
          onClick={() => setOpen(true)}
          className="text-slate-400 hover:text-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="ml-3 text-slate-200 text-sm font-semibold">Lumi Token</span>
      </div>

      {/* Main content */}
      <main className="min-h-screen pt-12 md:pt-0 md:ml-56 p-4 md:p-6">
        {children}
      </main>
    </>
  );
}
