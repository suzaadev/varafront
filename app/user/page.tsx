"use client";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useVault } from "@/hooks/useVault";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { formatSol, lamportsToSol, intervalLabel, nextDueLabel } from "@/lib/solana/constants";
import { Modal } from "@/components/ui/Modal";
import { TxPreview } from "@/components/ui/TxPreview";

const card: React.CSSProperties = { background: "#16161a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 };
const label: React.CSSProperties = { fontSize: 11, fontWeight: 500, color: "rgba(240,239,244,0.3)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 };
const btnP: React.CSSProperties = { background: "#7c6af7", border: "1px solid #7c6af7", color: "white", borderRadius: 10, padding: "9px 18px", fontSize: 13.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 6 };
const btnD: React.CSSProperties = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#f0eff4", borderRadius: 10, padding: "9px 18px", fontSize: 13.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 6 };
const inp: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 48px 10px 14px", fontSize: 14, color: "#f0eff4", fontFamily: "inherit", outline: "none", boxSizing: "border-box" };

export default function UserVaultPage() {
  const { connected } = useWallet();
  const { vault, vaultLoading, walletBalance, initVault, deposit, withdraw } = useVault();
  const { subscriptions } = useSubscriptions();
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [depositAmt, setDepositAmt] = useState("");
  const [withdrawAmt, setWithdrawAmt] = useState("");

  if (!connected) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16, textAlign: "center" }}>
      <div style={{ width: 56, height: 56, background: "rgba(124,106,247,0.15)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
        <svg viewBox="0 0 17 17" fill="none" width="28" height="28"><path d="M8.5 2L14 5.25V11.75L8.5 15L3 11.75V5.25L8.5 2Z" fill="#7c6af7" fillOpacity="0.9"/><path d="M8.5 5.5L11 7V10.5L8.5 12L6 10.5V7L8.5 5.5Z" fill="rgba(124,106,247,0.4)"/></svg>
      </div>
      <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.5px" }}>Connect your wallet</div>
      <div style={{ fontSize: 14, color: "rgba(240,239,244,0.4)", maxWidth: 320 }}>Connect to view your vault balance and manage subscriptions on Solana</div>
      <div style={{ marginTop: 8 }}><WalletMultiButton /></div>
    </div>
  );

  const vaultBalance = vault?.balanceLamports?.toNumber() ?? 0;
  const activeSubs = subscriptions.filter((s: any) => s.active);
  const reserved = activeSubs.reduce((a: number, s: any) => a + s.amountLamports.toNumber(), 0);

  return (
    <div>
      <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.8px", marginBottom: 4 }}>Vault</div>
      <div style={{ fontSize: 14, color: "rgba(240,239,244,0.4)", marginBottom: 32 }}>Your on-chain payment vault</div>

      <div style={{ ...card, padding: 28, marginBottom: 16, position: "relative", overflow: "hidden", background: "linear-gradient(135deg, rgba(124,106,247,0.12) 0%, rgba(124,106,247,0.03) 100%)", border: "1px solid rgba(124,106,247,0.2)" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, background: "radial-gradient(circle, rgba(124,106,247,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={label}>Vault Balance</div>
        <div style={{ fontSize: 42, fontWeight: 600, letterSpacing: "-2px", marginBottom: 4 }}>
          {vaultLoading ? "—" : formatSol(vaultBalance, 4)}
          <span style={{ fontSize: 20, fontWeight: 400, color: "rgba(240,239,244,0.4)", marginLeft: 8 }}>SOL</span>
        </div>
        <div style={{ fontSize: 13, color: "rgba(240,239,244,0.4)", marginBottom: 20 }}>{activeSubs.length} active subscription{activeSubs.length !== 1 ? "s" : ""}</div>
        <div style={{ display: "flex", gap: 10 }}>
          {!vault ? (
            <button style={btnP} onClick={() => initVault.mutate()} disabled={initVault.isPending}>{initVault.isPending ? "Creating..." : "+ Create Vault"}</button>
          ) : (
            <>
              <button style={btnP} onClick={() => setDepositOpen(true)}>↓ Deposit</button>
              <button style={btnD} onClick={() => setWithdrawOpen(true)}>↑ Withdraw</button>
            </>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div style={{ ...card, padding: 20 }}>
          <div style={label}>Wallet Balance</div>
          <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.5px" }}>{lamportsToSol(walletBalance).toFixed(4)} <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(240,239,244,0.3)" }}>SOL</span></div>
          <div style={{ fontSize: 12, color: "rgba(240,239,244,0.3)", marginTop: 4 }}>Available to deposit</div>
        </div>
        <div style={{ ...card, padding: 20 }}>
          <div style={label}>Reserved for Subs</div>
          <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.5px", color: "#7c6af7" }}>{lamportsToSol(reserved).toFixed(4)} <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(124,106,247,0.4)" }}>SOL</span></div>
          <div style={{ fontSize: 12, color: "rgba(240,239,244,0.3)", marginTop: 4 }}>{activeSubs.length} active subscriptions</div>
        </div>
      </div>

      <div style={{ ...card, padding: 24 }}>
        <div style={label}>Upcoming Payments</div>
        {activeSubs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "rgba(240,239,244,0.25)", fontSize: 13 }}>No active subscriptions. Create one to authorize recurring payments.</div>
        ) : activeSubs.slice(0, 6).map((s: any, i: number) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < activeSubs.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#7c6af7", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-dm-mono)", fontSize: 12, color: "rgba(240,239,244,0.4)" }}>{s.merchant.toString().slice(0,6)}...{s.merchant.toString().slice(-4)}</div>
              <div style={{ fontSize: 12, color: "rgba(240,239,244,0.25)", marginTop: 2 }}>{intervalLabel(s.intervalSeconds.toNumber())} · {nextDueLabel(s.nextDueAt.toNumber())}</div>
            </div>
            <div style={{ fontFamily: "var(--font-dm-mono)", fontSize: 13, fontWeight: 500, color: "rgba(240,239,244,0.6)" }}>{formatSol(s.amountLamports.toNumber(), 4)} SOL</div>
          </div>
        ))}
      </div>

      <Modal open={depositOpen} onClose={() => { setDepositOpen(false); setDepositAmt(""); }} title="Deposit to Vault" description="SOL transfers from your wallet into your on-chain vault.">
        <div style={{ position: "relative", marginBottom: 4 }}>
          <input style={inp} type="number" placeholder="0.00" min="0.001" step="0.001" value={depositAmt} onChange={e => setDepositAmt(e.target.value)} />
          <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "rgba(240,239,244,0.3)", fontFamily: "var(--font-dm-mono)" }}>SOL</span>
        </div>
        <TxPreview rows={[{ label: "From", value: "Your wallet" }, { label: "To", value: "Vault PDA" }, { label: "Network fee", value: "~0.000005 SOL" }]} />
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button style={{ ...btnD, flex: 1, justifyContent: "center" }} onClick={() => setDepositOpen(false)}>Cancel</button>
          <button style={{ ...btnP, flex: 2, justifyContent: "center" }} disabled={!depositAmt || parseFloat(depositAmt) <= 0 || deposit.isPending}
            onClick={async () => { await deposit.mutateAsync(parseFloat(depositAmt)); setDepositOpen(false); setDepositAmt(""); }}>
            {deposit.isPending ? "Signing..." : "Sign & Deposit"}
          </button>
        </div>
      </Modal>

      <Modal open={withdrawOpen} onClose={() => { setWithdrawOpen(false); setWithdrawAmt(""); }} title="Withdraw from Vault" description="Only you can withdraw. Funds return to your wallet immediately.">
        <div style={{ position: "relative", marginBottom: 4 }}>
          <input style={inp} type="number" placeholder="0.00" step="0.001" value={withdrawAmt} onChange={e => setWithdrawAmt(e.target.value)} />
          <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "rgba(240,239,244,0.3)", fontFamily: "var(--font-dm-mono)" }}>SOL</span>
        </div>
        <TxPreview rows={[{ label: "Vault balance", value: `${formatSol(vaultBalance, 4)} SOL` }, { label: "Reserved", value: `${lamportsToSol(reserved).toFixed(4)} SOL`, highlight: "amber" }, { label: "Network fee", value: "~0.000005 SOL" }]} />
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button style={{ ...btnD, flex: 1, justifyContent: "center" }} onClick={() => setWithdrawOpen(false)}>Cancel</button>
          <button style={{ ...btnP, flex: 2, justifyContent: "center" }} disabled={!withdrawAmt || parseFloat(withdrawAmt) <= 0 || withdraw.isPending}
            onClick={async () => { await withdraw.mutateAsync(parseFloat(withdrawAmt)); setWithdrawOpen(false); setWithdrawAmt(""); }}>
            {withdraw.isPending ? "Signing..." : "Sign & Withdraw"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
