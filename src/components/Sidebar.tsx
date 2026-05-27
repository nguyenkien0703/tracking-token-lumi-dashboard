"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  BarChart3,
  Activity,
  RotateCcw,
  Zap,
  Tag,
  Settings,
  AlertCircle,
  UsersRound,
  RefreshCw,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  Icon: typeof Home;
};

type NavSection = {
  title: string | null;
  items: NavItem[];
};

const sections: NavSection[] = [
  {
    title: "DASHBOARD",
    items: [
      { href: "/", label: "Overview", Icon: Home },
      { href: "/users", label: "Users", Icon: Users },
      { href: "/engagement", label: "Engagement", Icon: Zap },
      { href: "/activity", label: "Activity", Icon: Activity },
      { href: "/lifecycle", label: "Lifecycle", Icon: RotateCcw },
      { href: "/triggers", label: "Triggers", Icon: AlertCircle },
      { href: "/savameta/adoption", label: "Adoption", Icon: BarChart3 },
    ],
  },
  {
    title: "SETTINGS",
    items: [
      { href: "/settings/roster", label: "Roster", Icon: UsersRound },
      { href: "/settings/releases", label: "Releases", Icon: Tag },
      { href: "/settings", label: "Sync Status", Icon: RefreshCw },
      { href: "/admin/settings", label: "Admin", Icon: Settings },
    ],
  },
];

function isItemActive(itemHref: string, pathname: string): boolean {
  if (itemHref === "/") return pathname === "/";
  if (itemHref === "/settings") return pathname === "/settings";
  return pathname.startsWith(itemHref);
}

type Props = {
  variant: "rail" | "full";
  isAdmin?: boolean;
  onClose?: () => void;
};

export default function Sidebar({ variant, isAdmin, onClose }: Props) {
  const pathname = usePathname();
  const isRail = variant === "rail";
  const visibleSections = isAdmin ? sections : sections.filter((s) => s.title !== "SETTINGS");

  return (
    <aside
      className={`h-full bg-surface border-r border-border-default flex flex-col ${
        isRail ? "w-14" : "w-[200px]"
      }`}
    >
      <div className={`border-b border-border-default ${isRail ? "py-3 flex justify-center" : "px-4 py-5"}`}>
        {isRail ? (
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-text-primary text-sm font-semibold leading-tight">LumiPulse</p>
              <p className="text-text-secondary text-xs">Token Analytics</p>
            </div>
          </div>
        )}
      </div>

      <nav className={`flex-1 overflow-y-auto py-4 ${isRail ? "px-2 space-y-3" : "px-3 space-y-4"}`}>
        {visibleSections.map((section) => (
          <div key={section.title ?? "_default"} className={isRail ? "space-y-1" : "space-y-1"}>
            {!isRail && section.title && (
              <p className="px-3 py-1 text-[10px] font-semibold tracking-wider text-text-muted uppercase">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const active = isItemActive(item.href, pathname);
              if (isRail) {
                return (
                  <div key={item.href} className="relative group">
                    <Link
                      href={item.href}
                      onClick={onClose}
                      aria-label={item.label}
                      className={`flex items-center justify-center w-9 h-9 mx-auto rounded-lg transition-colors ${
                        active
                          ? "bg-primary/15 text-primary"
                          : "text-text-secondary hover:text-text-primary hover:bg-surface-2"
                      }`}
                    >
                      <item.Icon className="w-4 h-4" />
                    </Link>
                    <span
                      role="tooltip"
                      className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-surface-2 border border-border-default rounded text-xs text-text-primary whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50"
                    >
                      {item.label}
                    </span>
                  </div>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] transition-colors ${
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-2"
                  }`}
                >
                  <item.Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

    </aside>
  );
}
