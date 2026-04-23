"use client";
import { AppHeader } from "@/components/AppHeader";
import "@solana/wallet-adapter-react-ui/styles.css";

const nav = [{ href: "/admin", label: "Overview" }];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      <AppHeader nav={nav} badge={{ label: "Admin", color: "#EF4444", bg: "rgba(239,68,68,0.08)" }} />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 24px" }}>{children}</main>
    </div>
  );
}
