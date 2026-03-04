import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lumi Token Dashboard",
  description: "DevOps monitoring dashboard for LumiLink token usage",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Sidebar />
        <main className="ml-56 min-h-screen p-6">{children}</main>
      </body>
    </html>
  );
}
