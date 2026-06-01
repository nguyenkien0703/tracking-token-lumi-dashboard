"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

type Props = {
  name: string;
  email: string;
  picture?: string;
};

function getInitials(name: string, email: string): string {
  const source = name.trim() || email.split("@")[0] || "";
  const words = source.split(/[\s._-]+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export default function UserMenu({ name, email, picture }: Props) {
  const [open, setOpen] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  const showImage = picture && !imgFailed;
  const initials = getInitials(name, email);

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        style={{
          width: 32, height: 32, borderRadius: "50%",
          border: open ? "1px solid #3B82F6" : "1px solid #252D4A",
          background: "#1B2240",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          overflow: "hidden",
          padding: 0,
          color: "#94A3B8",
          fontSize: 11, fontWeight: 600,
          transition: "border-color 0.15s",
        }}
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={picture}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span aria-hidden>{initials}</span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute", top: "calc(100% + 8px)", right: 0,
            minWidth: 220,
            background: "#141A2E",
            border: "1px solid #252D4A",
            borderRadius: 8,
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            overflow: "hidden",
            zIndex: 30,
          }}
        >
          <div style={{ padding: "10px 12px", borderBottom: "1px solid #252D4A" }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#F1F5F9", lineHeight: 1.3 }}>
              {name}
            </p>
            <p style={{ fontSize: 11, color: "#64748B", lineHeight: 1.3, marginTop: 2, wordBreak: "break-all" }}>
              {email}
            </p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            disabled={loggingOut}
            className="hover:!bg-[#1B2240]"
            style={{
              display: "flex", alignItems: "center", gap: 8,
              width: "100%", padding: "9px 12px",
              background: "transparent", border: "none",
              fontSize: 12, color: "#F87171",
              cursor: loggingOut ? "wait" : "pointer",
              textAlign: "left",
              transition: "background 0.15s",
            }}
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden />
            {loggingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}
