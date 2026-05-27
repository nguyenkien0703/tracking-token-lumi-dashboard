"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { TopBarProvider } from "@/lib/topbar-context";

export default function AppShell({ children, isAdmin }: { children: React.ReactNode; isAdmin?: boolean }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (pathname === "/login") {
    return <TopBarProvider>{children}</TopBarProvider>;
  }

  return (
    <TopBarProvider>
      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile: drawer */}
      <div
        className={`fixed left-0 top-0 h-full z-30 transition-transform duration-200 md:hidden
          ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar variant="full" isAdmin={isAdmin} onClose={() => setDrawerOpen(false)} />
      </div>

      {/* Tablet: icon rail */}
      <div className="hidden md:flex lg:hidden fixed left-0 top-0 h-full z-10">
        <Sidebar variant="rail" isAdmin={isAdmin} />
      </div>

      {/* Desktop: full sidebar */}
      <div className="hidden lg:flex fixed left-0 top-0 h-full z-10">
        <Sidebar variant="full" isAdmin={isAdmin} />
      </div>

      {/* Mobile top bar (hamburger) */}
      <div className="fixed top-0 left-0 right-0 h-12 bg-surface border-b border-border-default flex items-center px-4 z-10 md:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          className="text-text-secondary hover:text-text-primary transition-colors p-2 -ml-2"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="ml-2 text-text-primary text-sm font-semibold">LumiPulse</span>
      </div>

      {/* Main content with TopBar */}
      <div className="min-h-screen pt-12 md:pt-0 md:ml-14 lg:ml-[200px] flex flex-col">
        {/* Sticky TopBar — desktop/tablet only */}
        <div className="hidden md:block">
          <TopBar />
        </div>
        <main className="flex-1 px-6 py-5">
          {children}
        </main>
      </div>
    </TopBarProvider>
  );
}
