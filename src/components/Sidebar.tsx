"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  emoji: string;
};

type NavSection = {
  title: string | null;
  items: NavItem[];
};

const sections: NavSection[] = [
  {
    title: "Dashboard",
    items: [
      { href: "/", label: "Overview", emoji: "🏠" },
      { href: "/users", label: "Users", emoji: "👥" },
      { href: "/engagement", label: "Engagement", emoji: "⚡" },
      { href: "/activity", label: "Activity", emoji: "📊" },
      { href: "/lifecycle", label: "Lifecycle", emoji: "🔄" },
      { href: "/triggers", label: "Triggers", emoji: "⚠️" },
      { href: "/savameta/adoption", label: "Adoption", emoji: "📈" },
    ],
  },
  {
    title: "Settings",
    items: [
      { href: "/settings/roster", label: "Roster", emoji: "👥" },
      { href: "/settings/releases", label: "Releases", emoji: "🏷️" },
      { href: "/settings", label: "Sync Status", emoji: "🔄" },
      { href: "/admin/settings", label: "Admin", emoji: "⚙️" },
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
  const visibleSections = isAdmin ? sections : sections.filter((s) => s.title !== "Settings");

  return (
    <aside
      style={{
        width: isRail ? 56 : 200,
        background: "#141A2E",
        borderRight: "1px solid #252D4A",
        flexShrink: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Logo */}
      <div style={{ padding: 16, borderBottom: "1px solid #252D4A", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 28, height: 28, background: "#3B82F6", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white", flexShrink: 0 }}>
          L
        </div>
        {!isRail && (
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#F1F5F9", lineHeight: 1.2 }}>LumiPulse</p>
            <p style={{ fontSize: 11, color: "#64748B", lineHeight: 1.2 }}>Token Analytics</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {visibleSections.map((section, sIdx) => (
          <div
            key={section.title ?? "_default"}
            style={{
              padding: "12px 10px 4px",
              marginTop: sIdx > 0 ? "auto" : 0,
              paddingBottom: sIdx > 0 ? 12 : 4,
            }}
          >
            {!isRail && section.title && (
              <p style={{ fontSize: 10, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 8px", marginBottom: 4 }}>
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const active = isItemActive(item.href, pathname);
              if (isRail) {
                return (
                  <div key={item.href} className="relative group" style={{ marginBottom: 2 }}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      aria-label={item.label}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 36, height: 36, margin: "0 auto", borderRadius: 6,
                        color: active ? "#3B82F6" : "#64748B",
                        background: active ? "rgba(59,130,246,0.15)" : "transparent",
                        transition: "all 0.15s",
                        fontSize: 16,
                        textDecoration: "none",
                      }}
                      className={!active ? "hover:!bg-[#1B2240] hover:!text-[#94A3B8]" : ""}
                    >
                      <span aria-hidden>{item.emoji}</span>
                    </Link>
                    <span
                      role="tooltip"
                      className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50"
                      style={{ background: "#1B2240", border: "1px solid #252D4A", color: "#F1F5F9" }}
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
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "7px 10px", borderRadius: 6,
                    fontSize: 13, color: active ? "#3B82F6" : "#64748B",
                    background: active ? "rgba(59,130,246,0.15)" : "transparent",
                    transition: "all 0.15s",
                    textDecoration: "none",
                    marginBottom: 2,
                  }}
                  className={!active ? "hover:!bg-[#1B2240] hover:!text-[#94A3B8]" : ""}
                >
                  <span aria-hidden style={{ fontSize: 14, lineHeight: 1, flexShrink: 0, width: 16, textAlign: "center" }}>
                    {item.emoji}
                  </span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
