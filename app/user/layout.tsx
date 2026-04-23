"use client";
import { AppHeader } from "@/components/AppHeader";
import "@solana/wallet-adapter-react-ui/styles.css";

const nav = [
  { href: "/user", label: "Vault" },
  { href: "/user/subscriptions", label: "Subscriptions" },
  { href: "/user/how-it-works", label: "How it works" },
];

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#F7F8FA" }}>
      <AppHeader nav={nav} />
      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 24px" }}>
        {children}
      </main>
    </div>
  );
}
