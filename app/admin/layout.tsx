"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { shortenAddress, lamportsToSol } from "@/lib/solana/constants";
import { useVault } from "@/hooks/useVault";
import "@solana/wallet-adapter-react-ui/styles.css";

const ADMIN_WALLET = "6Q1XS5pVa8gEKxrfPXpaAymiZ6pasze8eL47ArXyAopz";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { publicKey } = useWallet();
  const { walletBalance } = useVault();

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0f" }}>
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(13,13,15,0.8)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50, padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, background: "#7c6af7", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 17 17" fill="none" width="16" height="16"><path d="M8.5 2L14 5.25V11.75L8.5 15L3 11.75V5.25L8.5 2Z" fill="white" fillOpacity="0.9"/><path d="M8.5 5.5L11 7V10.5L8.5 12L6 10.5V7L8.5 5.5Z" fill="rgba(60,40,200,0.4)"/></svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.3px" }}>Oravara</span>
          <span style={{ fontSize: 11, background: "rgba(240,82,82,0.12)", color: "#f05252", borderRadius: 6, padding: "2px 8px", marginLeft: 4, fontWeight: 500 }}>Admin</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          {publicKey && (
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "5px 12px", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: publicKey.toString() === ADMIN_WALLET ? "#34c97a" : "#f05252", boxShadow: publicKey.toString() === ADMIN_WALLET ? "0 0 6px #34c97a" : "0 0 6px #f05252" }} />
              <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: 12, color: "rgba(240,239,244,0.5)" }}>{shortenAddress(publicKey.toString())}</span>
              <span style={{ fontSize: 12.5, fontWeight: 500 }}>{lamportsToSol(walletBalance).toFixed(2)} SOL</span>
            </div>
          )}
          <WalletMultiButton />
        </div>
      </header>
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        {children}
      </main>
    </div>
  );
}
