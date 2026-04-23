"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { usePathname, useRouter } from "next/navigation";
import { useVault } from "@/hooks/useVault";
import { lamportsToSol, shortenAddress } from "@/lib/solana/constants";
import "@solana/wallet-adapter-react-ui/styles.css";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { publicKey } = useWallet();
  const { walletBalance } = useVault();
  const pathname = usePathname();
  const router = useRouter();
  const nav = [
    { href: "/user", label: "Vault" },
    { href: "/user/subscriptions", label: "Subscriptions" },
  ];
  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0f" }}>
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(13,13,15,0.8)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50, padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => router.push("/user")}>
          <div style={{ width: 28, height: 28, background: "#7c6af7", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 17 17" fill="none" width="16" height="16"><path d="M8.5 2L14 5.25V11.75L8.5 15L3 11.75V5.25L8.5 2Z" fill="white" fillOpacity="0.9"/><path d="M8.5 5.5L11 7V10.5L8.5 12L6 10.5V7L8.5 5.5Z" fill="rgba(60,40,200,0.4)"/></svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.3px" }}>Oravara</span>
        </div>
        <nav style={{ display: "flex", gap: 4 }}>
          {nav.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <button key={href} onClick={() => router.push(href)} style={{ padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: active ? 500 : 400, fontFamily: "inherit", background: active ? "rgba(124,106,247,0.15)" : "transparent", color: active ? "#7c6af7" : "rgba(240,239,244,0.5)", transition: "all 0.13s" }}>
                {label}
              </button>
            );
          })}
        </nav>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          {publicKey && (
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "5px 12px", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34c97a", boxShadow: "0 0 6px #34c97a" }} />
              <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: 12, color: "rgba(240,239,244,0.5)" }}>{shortenAddress(publicKey.toString())}</span>
              <span style={{ fontSize: 12.5, fontWeight: 500, color: "#f0eff4" }}>{lamportsToSol(walletBalance).toFixed(2)} SOL</span>
            </div>
          )}
          <WalletMultiButton />
        </div>
      </header>
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px" }}>{children}</main>
    </div>
  );
}
