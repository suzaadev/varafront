"use client";
import { AppHeader } from "@/components/AppHeader";
import "@solana/wallet-adapter-react-ui/styles.css";

const nav = [
  { href: "/merchant", label: "Overview" },
  { href: "/merchant/collect", label: "Collect" },
];

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      <AppHeader nav={nav} badge={{ label: "Merchant", color: "#5B5CEB", bg: "rgba(91,92,235,0.08)" }} />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 24px" }}>
        {children}
      </main>
    </div>
  );
}
