"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { usePathname, useRouter } from "next/navigation";
import { useVault } from "@/hooks/useVault";
import { lamportsToSol, shortenAddress } from "@/lib/solana/constants";

interface NavItem { href: string; label: string; }
interface AppHeaderProps {
  nav: NavItem[];
  badge?: { label: string; color: string; bg: string; };
}

export function AppHeader({ nav, badge }: AppHeaderProps) {
  const { publicKey } = useWallet();
  const { walletBalance } = useVault();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header style={{
      background: "white",
      borderBottom: "1px solid #E5E7EB",
      position: "sticky", top: 0, zIndex: 50,
      padding: "0 24px", height: 60,
      display: "flex", alignItems: "center", gap: 0,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      {/* Logo */}
      <div
        style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginRight: 32, flexShrink: 0 }}
        onClick={() => router.push(nav[0]?.href ?? "/")}
      >
        <div style={{
          width: 32, height: 32,
          background: "linear-gradient(135deg, #5B5CEB 0%, #7A5AF8 100%)",
          borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(91,92,235,0.35)",
        }}>
          <svg viewBox="0 0 17 17" fill="none" width="18" height="18">
            <path d="M8.5 2L14 5.25V11.75L8.5 15L3 11.75V5.25L8.5 2Z" fill="white" fillOpacity="0.95"/>
            <path d="M8.5 5.5L11 7V10.5L8.5 12L6 10.5V7L8.5 5.5Z" fill="rgba(255,255,255,0.35)"/>
          </svg>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.4px", color: "#0F172A" }}>Oravara</span>
          {badge && (
            <span style={{
              fontSize: 10.5, fontWeight: 600, letterSpacing: "0.3px",
              background: badge.bg, color: badge.color,
              borderRadius: 6, padding: "2px 7px", textTransform: "uppercase",
            }}>{badge.label}</span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", gap: 2, flex: 1 }}>
        {nav.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <button key={href} onClick={() => router.push(href)} style={{
              padding: "6px 14px", borderRadius: 8, border: "none",
              cursor: "pointer", fontSize: 13.5, fontWeight: active ? 600 : 400,
              fontFamily: "inherit", transition: "all 0.13s",
              background: active ? "rgba(91,92,235,0.08)" : "transparent",
              color: active ? "#5B5CEB" : "#64748B",
            }}>
              {label}
            </button>
          );
        })}
      </nav>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {publicKey && (
          <div style={{
            background: "#F8FAFC", border: "1px solid #E5E7EB",
            borderRadius: 10, padding: "6px 12px",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 0 2px rgba(16,185,129,0.2)", flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "#64748B" }}>{shortenAddress(publicKey.toString())}</span>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#0F172A" }}>{lamportsToSol(walletBalance).toFixed(2)} <span style={{ color: "#94A3B8", fontWeight: 400 }}>SOL</span></span>
          </div>
        )}
        <WalletMultiButton />
      </div>
    </header>
  );
}
