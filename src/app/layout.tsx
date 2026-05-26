import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${heading.variable} ${mono.variable}`}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
