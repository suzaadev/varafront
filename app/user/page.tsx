"use client";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useVault } from "@/hooks/useVault";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { formatSol, lamportsToSol, intervalLabel, nextDueLabel, shortenAddress } from "@/lib/solana/constants";
import { Modal } from "@/components/ui/Modal";
import { TxPreview } from "@/components/ui/TxPreview";

const INTERVALS = [
  { label: "Daily", value: 86400 },
  { label: "Weekly", value: 604800 },
  { label: "Monthly", value: 2592000 },
  { label: "Quarterly", value: 7776000 },
];

const inp: React.CSSProperties = {
  width: "100%", background: "#F8FAFC", border: "1.5px solid #E5E7EB",
  borderRadius: 10, padding: "10px 14px", fontSize: 13.5,
  color: "#0F172A", fontFamily: "inherit", outline: "none",
  boxSizing: "border-box", transition: "border-color 0.13s",
};
const inpSuf: React.CSSProperties = { ...inp, paddingRight: 50 };
const sel: React.CSSProperties = { ...inp, cursor: "pointer" };
const lbl: React.CSSProperties = { fontSize: 11.5, fontWeight: 600, color: "#64748B", marginBottom: 5, display: "block" };

export default function UserVaultPage() {
  const { connected } = useWallet();
  const { vault, vaultLoading, walletBalance, initVault, deposit, withdraw } = useVault();
  const { subscriptions, createSubscription, cancelSubscription } = useSubscriptions();
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<any>(null);
  const [depositAmt, setDepositAmt] = useState("");
  const [withdrawAmt, setWithdrawAmt] = useState("");
  const [form, setForm] = useState({ merchant: "", amount: "", interval: 2592000, maxCycles: "0" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  if (!connected) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "62vh", gap: 20, textAlign: "center" }}>
      <div style={{ width: 72, height: 72, background: "linear-gradient(135deg, rgba(91,92,235,0.1), rgba(122,90,248,0.15))", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg viewBox="0 0 17 17" fill="none" width="36" height="36">
          <path d="M8.5 2L14 5.25V11.75L8.5 15L3 11.75V5.25L8.5 2Z" fill="#5B5CEB" fillOpacity="0.9"/>
          <path d="M8.5 5.5L11 7V10.5L8.5 12L6 10.5V7L8.5 5.5Z" fill="#5B5CEB" fillOpacity="0.35"/>
        </svg>
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.6px", color: "#0F172A", marginBottom: 8 }}>Connect your wallet</div>
        <div style={{ fontSize: 14.5, color: "#64748B", maxWidth: 340, lineHeight: 1.6 }}>Access your on-chain vault and manage recurring payments on Solana</div>
      </div>
      <WalletMultiButton />
    </div>
  );

  const vaultBalance = vault?.balanceLamports?.toNumber() ?? 0;
  const activeSubs = subscriptions.filter((s: any) => s.active);
  const reserved = activeSubs.reduce((a: number, s: any) => a + s.amountLamports.toNumber(), 0);
  const now = Date.now() / 1000;

  const handleAuthorize = async () => {
    setFormError("");
    if (!form.merchant.trim()) { setFormError("Merchant address is required"); return; }
    if (!form.amount || parseFloat(form.amount) <= 0) { setFormError("Amount must be greater than 0"); return; }
    setSubmitting(true);
    try {
      await createSubscription.mutateAsync({
        merchantAddress: form.merchant.trim(),
        amountSol: parseFloat(form.amount),
        intervalSeconds: form.interval,
        maxCycles: parseInt(form.maxCycles) || 0,
        seedIndex: Math.floor(Math.random() * 1000000),
      });
      setForm({ merchant: "", amount: "", interval: 2592000, maxCycles: "0" });
    } catch(e: any) {
      setFormError(e?.message ?? "Transaction failed");
    }
    setSubmitting(false);
  };

  return (
    <div className="fade-in" style={{ maxWidth: 900, margin: "0 auto" }}>

      {/* Top row: Vault + Authorize form */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16, marginBottom: 16, alignItems: "start" }}>

        {/* Vault hero */}
        <div style={{
          background: "linear-gradient(135deg, #5B5CEB 0%, #7A5AF8 100%)",
          borderRadius: 20, padding: "30px 30px 26px",
          position: "relative", overflow: "hidden",
          boxShadow: "0 8px 32px rgba(91,92,235,0.28)",
        }}>
          <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, background: "rgba(255,255,255,0.06)", borderRadius: "50%", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -60, left: 20, width: 150, height: 150, background: "rgba(255,255,255,0.04)", borderRadius: "50%", pointerEvents: "none" }} />

          <div style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 10 }}>Vault Balance</div>
          <div style={{ fontSize: 42, fontWeight: 700, letterSpacing: "-2px", color: "white", lineHeight: 1, marginBottom: 6 }}>
            {vaultLoading ? "—" : formatSol(vaultBalance, 4)}
            <span style={{ fontSize: 18, fontWeight: 400, color: "rgba(255,255,255,0.5)", marginLeft: 8 }}>SOL</span>
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 24 }}>
            {activeSubs.length} active subscription{activeSubs.length !== 1 ? "s" : ""}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 22 }}>
            <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "11px 14px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>Wallet</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "white" }}>{lamportsToSol(walletBalance).toFixed(3)} <span style={{ color: "rgba(255,255,255,0.45)", fontWeight: 400, fontSize: 12 }}>SOL</span></div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "11px 14px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>Reserved</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "white" }}>{lamportsToSol(reserved).toFixed(3)} <span style={{ color: "rgba(255,255,255,0.45)", fontWeight: 400, fontSize: 12 }}>SOL</span></div>
            </div>
          </div>

          {!vault ? (
            <button style={{ background: "white", color: "#5B5CEB", border: "none", borderRadius: 10, padding: "11px 22px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }} onClick={() => initVault.mutate()} disabled={initVault.isPending}>
              {initVault.isPending ? "Creating..." : "+ Create Vault"}
            </button>
          ) : (
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ background: "white", color: "#5B5CEB", border: "none", borderRadius: 10, padding: "11px 0", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(0,0,0,0.12)", flex: 1 }} onClick={() => setDepositOpen(true)}>↓ Deposit</button>
              <button style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1.5px solid rgba(255,255,255,0.25)", borderRadius: 10, padding: "11px 0", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", flex: 1 }} onClick={() => setWithdrawOpen(true)}>↑ Withdraw</button>
            </div>
          )}
        </div>

        {/* Authorize form — inline, no modal */}
        <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 20, padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>Authorize Merchant</div>
          <div style={{ fontSize: 12.5, color: "#94A3B8", marginBottom: 18, lineHeight: 1.5 }}>Set up a recurring payment from your vault</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={lbl}>Merchant wallet</label>
              <input style={inp} placeholder="Solana address..." value={form.merchant} onChange={e => setForm(f => ({...f, merchant: e.target.value}))} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={lbl}>Amount / cycle</label>
                <div style={{ position: "relative" }}>
                  <input style={inpSuf} type="number" placeholder="0.00" step="0.001" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} />
                  <span style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", fontSize: 11, fontWeight: 700, color: "#94A3B8", fontFamily: "var(--mono)" }}>SOL</span>
                </div>
              </div>
              <div>
                <label style={lbl}>Interval</label>
                <select style={sel} value={form.interval} onChange={e => setForm(f => ({...f, interval: parseInt(e.target.value)}))}>
                  {INTERVALS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={lbl}>Max cycles <span style={{ color: "#CBD5E1", fontWeight: 400 }}>(0 = unlimited)</span></label>
              <input style={inp} type="number" placeholder="0" min="0" value={form.maxCycles} onChange={e => setForm(f => ({...f, maxCycles: e.target.value}))} />
            </div>
          </div>

          {formError && (
            <div style={{ fontSize: 12.5, color: "#EF4444", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "8px 12px", marginTop: 12 }}>{formError}</div>
          )}

          <div style={{ marginTop: 14, padding: "10px 14px", background: "#F8FAFC", borderRadius: 10, border: "1px solid #F1F5F9" }}>
            <div style={{ fontSize: 11.5, color: "#10B981", fontWeight: 500 }}>✓ Merchant cannot overcharge, charge early, or charge after cancel</div>
          </div>

          <button
            style={{ width: "100%", background: "linear-gradient(135deg, #5B5CEB, #7A5AF8)", border: "none", color: "white", borderRadius: 10, padding: "12px", fontSize: 13.5, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(91,92,235,0.3)", marginTop: 14, opacity: submitting ? 0.7 : 1 }}
            disabled={submitting}
            onClick={handleAuthorize}
          >{submitting ? "Signing..." : "Sign & Authorize"}</button>
        </div>
      </div>

      {/* Upcoming payments */}
      <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 20, padding: "22px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.7px" }}>Upcoming Payments</div>
          {activeSubs.length > 0 && <span style={{ fontSize: 12, color: "#64748B" }}>{activeSubs.length} subscription{activeSubs.length !== 1 ? "s" : ""}</span>}
        </div>

        {activeSubs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "28px 0" }}>
            <div style={{ fontSize: 13.5, color: "#94A3B8", marginBottom: 4 }}>No upcoming payments</div>
            <div style={{ fontSize: 12.5, color: "#CBD5E1" }}>Authorize a merchant above to get started</div>
          </div>
        ) : activeSubs.map((s: any, i: number) => {
          const isDue = s.nextDueAt.toNumber() <= now;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: i < activeSubs.length - 1 ? "1px solid #F8FAFC" : "none" }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: isDue ? "rgba(245,158,11,0.08)" : "rgba(91,92,235,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <div style={{ width: 11, height: 11, borderRadius: "50%", background: isDue ? "#F59E0B" : "#5B5CEB" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", marginBottom: 2, fontFamily: "var(--mono)" }}>{shortenAddress(s.merchant.toString())}</div>
                <div style={{ fontSize: 12, color: "#94A3B8" }}>{intervalLabel(s.intervalSeconds.toNumber())} · {s.cyclesCompleted.toString()} cycles completed</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700, color: "#0F172A", marginBottom: 2 }}>{formatSol(s.amountLamports.toNumber(), 4)} <span style={{ color: "#94A3B8", fontWeight: 400, fontSize: 12 }}>SOL</span></div>
                <div style={{ fontSize: 12, color: isDue ? "#F59E0B" : "#64748B", fontWeight: isDue ? 600 : 400 }}>{nextDueLabel(s.nextDueAt.toNumber())}</div>
              </div>
              <button style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#EF4444", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }} onClick={() => setCancelTarget(s)}>Cancel</button>
            </div>
          );
        })}
      </div>

      {/* Deposit Modal */}
      <Modal open={depositOpen} onClose={() => { setDepositOpen(false); setDepositAmt(""); }} title="Deposit to Vault" description="SOL transfers from your connected wallet into your on-chain vault.">
        <div style={{ position: "relative", marginBottom: 4 }}>
          <input style={{ ...inpSuf, background: "white" }} type="number" placeholder="0.00" min="0.001" step="0.001" value={depositAmt} onChange={e => setDepositAmt(e.target.value)} autoFocus />
          <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 12, fontWeight: 700, color: "#94A3B8", fontFamily: "var(--mono)" }}>SOL</span>
        </div>
        <TxPreview rows={[{ label: "From", value: "Your wallet" }, { label: "To", value: "Vault PDA" }, { label: "Network fee", value: "~0.000005 SOL" }]} />
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ flex: 1, background: "#F8FAFC", border: "1.5px solid #E5E7EB", color: "#64748B", borderRadius: 10, padding: "11px", fontSize: 13.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }} onClick={() => setDepositOpen(false)}>Cancel</button>
          <button style={{ flex: 2, background: "linear-gradient(135deg, #5B5CEB, #7A5AF8)", border: "none", color: "white", borderRadius: 10, padding: "11px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(91,92,235,0.3)" }}
            disabled={!depositAmt || parseFloat(depositAmt) <= 0 || deposit.isPending}
            onClick={async () => { await deposit.mutateAsync(parseFloat(depositAmt)); setDepositOpen(false); setDepositAmt(""); }}>
            {deposit.isPending ? "Signing..." : "Sign & Deposit"}
          </button>
        </div>
      </Modal>

      {/* Withdraw Modal */}
      <Modal open={withdrawOpen} onClose={() => { setWithdrawOpen(false); setWithdrawAmt(""); }} title="Withdraw from Vault" description="Only you can withdraw. Funds return to your wallet immediately.">
        <div style={{ position: "relative", marginBottom: 4 }}>
          <input style={{ ...inpSuf, background: "white" }} type="number" placeholder="0.00" step="0.001" value={withdrawAmt} onChange={e => setWithdrawAmt(e.target.value)} autoFocus />
          <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 12, fontWeight: 700, color: "#94A3B8", fontFamily: "var(--mono)" }}>SOL</span>
        </div>
        <TxPreview rows={[{ label: "Vault balance", value: `${formatSol(vaultBalance, 4)} SOL` }, { label: "Reserved", value: `${lamportsToSol(reserved).toFixed(4)} SOL`, highlight: "amber" }, { label: "Network fee", value: "~0.000005 SOL" }]} />
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ flex: 1, background: "#F8FAFC", border: "1.5px solid #E5E7EB", color: "#64748B", borderRadius: 10, padding: "11px", fontSize: 13.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }} onClick={() => setWithdrawOpen(false)}>Cancel</button>
          <button style={{ flex: 2, background: "linear-gradient(135deg, #5B5CEB, #7A5AF8)", border: "none", color: "white", borderRadius: 10, padding: "11px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(91,92,235,0.3)" }}
            disabled={!withdrawAmt || parseFloat(withdrawAmt) <= 0 || withdraw.isPending}
            onClick={async () => { await withdraw.mutateAsync(parseFloat(withdrawAmt)); setWithdrawOpen(false); setWithdrawAmt(""); }}>
            {withdraw.isPending ? "Signing..." : "Sign & Withdraw"}
          </button>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal open={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Cancel Subscription" description="Future collections will be blocked immediately on-chain. This cannot be undone.">
        {cancelTarget && <TxPreview rows={[{ label: "Merchant", value: shortenAddress(cancelTarget.merchant.toString()) }, { label: "Amount", value: `${formatSol(cancelTarget.amountLamports.toNumber(), 4)} SOL / ${intervalLabel(cancelTarget.intervalSeconds.toNumber())}` }, { label: "Effect", value: "Immediate · permanent", highlight: "red" }]} />}
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ flex: 1, background: "#F8FAFC", border: "1.5px solid #E5E7EB", color: "#64748B", borderRadius: 10, padding: "11px", fontSize: 13.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }} onClick={() => setCancelTarget(null)}>Keep it</button>
          <button style={{ flex: 2, background: "#FEF2F2", border: "1.5px solid #FECACA", color: "#EF4444", borderRadius: 10, padding: "11px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
            disabled={cancelSubscription.isPending}
            onClick={async () => { await cancelSubscription.mutateAsync(cancelTarget.publicKey); setCancelTarget(null); }}>
            {cancelSubscription.isPending ? "Signing..." : "Sign & Cancel"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
