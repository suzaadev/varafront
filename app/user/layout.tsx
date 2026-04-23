"use client";
import { AppHeader } from "@/components/AppHeader";
import "@solana/wallet-adapter-react-ui/styles.css";

const nav = [
  { href: "/user", label: "Vault" },
  { href: "/user/subscriptions", label: "Subscriptions" },
];

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      <AppHeader nav={nav} />
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "36px 24px" }}>
        {children}
      </main>
    </div>
  );
}
