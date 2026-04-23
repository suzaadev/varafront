"use client";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useVault } from "@/hooks/useVault";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { formatSol, lamportsToSol, intervalLabel, nextDueLabel } from "@/lib/solana/constants";
import { Modal } from "@/components/ui/Modal";
import { TxPreview } from "@/components/ui/TxPreview";

const inp: React.CSSProperties = {
  width: "100%", background: "white", border: "1.5px solid #E5E7EB",
  borderRadius: 10, padding: "11px 48px 11px 14px", fontSize: 14,
  color: "#0F172A", fontFamily: "inherit", outline: "none",
  boxSizing: "border-box", transition: "border-color 0.13s",
};

export default function UserVaultPage() {
  const { connected } = useWallet();
  const { vault, vaultLoading, walletBalance, initVault, deposit, withdraw } = useVault();
  const { subscriptions } = useSubscriptions();
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [depositAmt, setDepositAmt] = useState("");
  const [withdrawAmt, setWithdrawAmt] = useState("");

  if (!connected) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "62vh", gap: 20, textAlign: "center" }}>
      <div style={{ width: 72, height: 72, background: "linear-gradient(135deg, rgba(91,92,235,0.1), rgba(122,90,248,0.15))", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
        <svg viewBox="0 0 17 17" fill="none" width="36" height="36">
          <path d="M8.5 2L14 5.25V11.75L8.5 15L3 11.75V5.25L8.5 2Z" fill="#5B5CEB" fillOpacity="0.9"/>
          <path d="M8.5 5.5L11 7V10.5L8.5 12L6 10.5V7L8.5 5.5Z" fill="#5B5CEB" fillOpacity="0.35"/>
        </svg>
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.6px", color: "#0F172A", marginBottom: 8 }}>Connect your wallet</div>
        <div style={{ fontSize: 14.5, color: "#64748B", maxWidth: 340, lineHeight: 1.6 }}>Connect to access your on-chain vault and manage recurring payments on Solana</div>
      </div>
      <WalletMultiButton />
    </div>
  );

  const vaultBalance = vault?.balanceLamports?.toNumber() ?? 0;
  const activeSubs = subscriptions.filter((s: any) => s.active);
  const reserved = activeSubs.reduce((a: number, s: any) => a + s.amountLamports.toNumber(), 0);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.6px", color: "#0F172A", marginBottom: 4 }}>Vault</div>
        <div style={{ fontSize: 14, color: "#64748B" }}>Your on-chain payment vault on Solana</div>
      </div>

      {/* Hero card */}
      <div style={{
        background: "linear-gradient(135deg, #5B5CEB 0%, #7A5AF8 100%)",
        borderRadius: 20, padding: "32px 32px 28px",
        marginBottom: 20, position: "relative", overflow: "hidden",
        boxShadow: "0 8px 32px rgba(91,92,235,0.3), 0 2px 8px rgba(91,92,235,0.2)",
      }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 220, height: 220, background: "rgba(255,255,255,0.06)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: 40, width: 180, height: 180, background: "rgba(255,255,255,0.04)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>Vault Balance</div>
        <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-2px", color: "white", lineHeight: 1, marginBottom: 6 }}>
          {vaultLoading ? "—" : formatSol(vaultBalance, 4)}
          <span style={{ fontSize: 22, fontWeight: 400, color: "rgba(255,255,255,0.6)", marginLeft: 10 }}>SOL</span>
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 24 }}>
          {activeSubs.length} active subscription{activeSubs.length !== 1 ? "s" : ""}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {!vault ? (
            <button
              style={{ background: "white", color: "#5B5CEB", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
              onClick={() => initVault.mutate()} disabled={initVault.isPending}
            >{initVault.isPending ? "Creating..." : "+ Create Vault"}</button>
          ) : (
            <>
              <button style={{ background: "white", color: "#5B5CEB", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }} onClick={() => setDepositOpen(true)}>↓ Deposit</button>
              <button style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 10, padding: "10px 20px", fontSize: 13.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }} onClick={() => setWithdrawOpen(true)}>↑ Withdraw</button>
            </>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Wallet Balance", value: `${lamportsToSol(walletBalance).toFixed(4)} SOL`, sub: "Available to deposit", accent: false },
          { label: "Reserved for Subscriptions", value: `${lamportsToSol(reserved).toFixed(4)} SOL`, sub: `${activeSubs.length} active subscriptions`, accent: true },
        ].map(({ label, value, sub, accent }) => (
          <div key={label} style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 16, padding: 22, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 10 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.4px", color: accent ? "#5B5CEB" : "#0F172A", marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 12.5, color: "#94A3B8" }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Upcoming payments */}
      <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 16, padding: "22px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 16 }}>Upcoming Payments</div>
        {activeSubs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "28px 0" }}>
            <div style={{ fontSize: 13.5, color: "#94A3B8" }}>No active subscriptions</div>
            <div style={{ fontSize: 12.5, color: "#CBD5E1", marginTop: 4 }}>Create a subscription to authorize recurring payments</div>
          </div>
        ) : activeSubs.slice(0, 6).map((s: any, i: number) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 0", borderBottom: i < activeSubs.length - 1 ? "1px solid #F1F5F9" : "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(91,92,235,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#5B5CEB" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#0F172A" }}>Subscription</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{s.merchant.toString().slice(0,8)}...{s.merchant.toString().slice(-4)}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{formatSol(s.amountLamports.toNumber(), 4)} SOL</div>
              <div style={{ fontSize: 11.5, color: "#94A3B8", marginTop: 2 }}>{intervalLabel(s.intervalSeconds.toNumber())} · {nextDueLabel(s.nextDueAt.toNumber())}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Deposit Modal */}
      <Modal open={depositOpen} onClose={() => { setDepositOpen(false); setDepositAmt(""); }} title="Deposit to Vault" description="SOL will transfer from your connected wallet into your on-chain vault.">
        <div style={{ position: "relative" }}>
          <input style={inp} type="number" placeholder="0.00" min="0.001" step="0.001" value={depositAmt} onChange={e => setDepositAmt(e.target.value)} autoFocus />
          <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 12, fontWeight: 600, color: "#94A3B8", fontFamily: "var(--mono)" }}>SOL</span>
        </div>
        <TxPreview rows={[{ label: "From", value: "Your wallet" }, { label: "To", value: "Vault PDA" }, { label: "Network fee", value: "~0.000005 SOL" }]} />
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ flex: 1, background: "#F8FAFC", border: "1.5px solid #E5E7EB", color: "#64748B", borderRadius: 10, padding: "10px", fontSize: 13.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }} onClick={() => setDepositOpen(false)}>Cancel</button>
          <button style={{ flex: 2, background: "linear-gradient(135deg, #5B5CEB, #7A5AF8)", border: "none", color: "white", borderRadius: 10, padding: "10px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(91,92,235,0.35)" }}
            disabled={!depositAmt || parseFloat(depositAmt) <= 0 || deposit.isPending}
            onClick={async () => { await deposit.mutateAsync(parseFloat(depositAmt)); setDepositOpen(false); setDepositAmt(""); }}>
            {deposit.isPending ? "Signing..." : "Sign & Deposit"}
          </button>
        </div>
      </Modal>

      {/* Withdraw Modal */}
      <Modal open={withdrawOpen} onClose={() => { setWithdrawOpen(false); setWithdrawAmt(""); }} title="Withdraw from Vault" description="Only you can withdraw. Funds return to your wallet immediately.">
        <div style={{ position: "relative" }}>
          <input style={inp} type="number" placeholder="0.00" step="0.001" value={withdrawAmt} onChange={e => setWithdrawAmt(e.target.value)} autoFocus />
          <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 12, fontWeight: 600, color: "#94A3B8", fontFamily: "var(--mono)" }}>SOL</span>
        </div>
        <TxPreview rows={[{ label: "Vault balance", value: `${formatSol(vaultBalance, 4)} SOL` }, { label: "Reserved", value: `${lamportsToSol(reserved).toFixed(4)} SOL`, highlight: "amber" }, { label: "Network fee", value: "~0.000005 SOL" }]} />
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ flex: 1, background: "#F8FAFC", border: "1.5px solid #E5E7EB", color: "#64748B", borderRadius: 10, padding: "10px", fontSize: 13.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }} onClick={() => setWithdrawOpen(false)}>Cancel</button>
          <button style={{ flex: 2, background: "linear-gradient(135deg, #5B5CEB, #7A5AF8)", border: "none", color: "white", borderRadius: 10, padding: "10px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(91,92,235,0.35)" }}
            disabled={!withdrawAmt || parseFloat(withdrawAmt) <= 0 || withdraw.isPending}
            onClick={async () => { await withdraw.mutateAsync(parseFloat(withdrawAmt)); setWithdrawOpen(false); setWithdrawAmt(""); }}>
            {withdraw.isPending ? "Signing..." : "Sign & Withdraw"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
