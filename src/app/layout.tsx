import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { createHash } from "crypto";
import "./globals.css";
import AppShell from "@/components/AppShell";

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const heading = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lumi Token Dashboard",
  description: "DevOps monitoring dashboard for LumiLink token usage",
};

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const adminPassword = process.env.ADMIN_PANEL_PASSWORD ?? "";
  const sessionCookie = (await cookies()).get("admin_session")?.value ?? "";
  const isAdmin = adminPassword !== "" && sessionCookie === hashPassword(adminPassword);

  return (
    <html lang="en" className={`${body.variable} ${heading.variable} ${mono.variable}`}>
      <body>
        <AppShell isAdmin={isAdmin}>{children}</AppShell>
      </body>
    </html>
  );
}
