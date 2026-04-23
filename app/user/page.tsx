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
  width: "100%", background: "white", border: "1.5px solid #E5E7EB",
  borderRadius: 10, padding: "11px 14px", fontSize: 14,
  color: "#0F172A", fontFamily: "inherit", outline: "none",
  boxSizing: "border-box", transition: "border-color 0.13s",
};
const inpSuf: React.CSSProperties = { ...inp, paddingRight: 52 };
const sel: React.CSSProperties = { ...inp, cursor: "pointer" };

export default function UserVaultPage() {
  const { connected } = useWallet();
  const { vault, vaultLoading, walletBalance, initVault, deposit, withdraw } = useVault();
  const { subscriptions, createSubscription, cancelSubscription } = useSubscriptions();
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<any>(null);
  const [depositAmt, setDepositAmt] = useState("");
  const [withdrawAmt, setWithdrawAmt] = useState("");
  const [form, setForm] = useState({ merchant: "", amount: "", interval: 2592000, maxCycles: "0" });

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

  return (
    <div className="fade-in" style={{ maxWidth: 860, margin: "0 auto" }}>

      {/* Top row: Vault hero + Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16, marginBottom: 16, alignItems: "start" }}>

        {/* Vault hero */}
        <div style={{
          background: "linear-gradient(135deg, #5B5CEB 0%, #7A5AF8 100%)",
          borderRadius: 20, padding: "32px 32px 28px",
          position: "relative", overflow: "hidden",
          boxShadow: "0 8px 32px rgba(91,92,235,0.28)",
        }}>
          <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, background: "rgba(255,255,255,0.06)", borderRadius: "50%", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -70, left: 20, width: 160, height: 160, background: "rgba(255,255,255,0.04)", borderRadius: "50%", pointerEvents: "none" }} />

          <div style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 12 }}>Vault Balance</div>
          <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: "-2px", color: "white", lineHeight: 1, marginBottom: 8 }}>
            {vaultLoading ? "—" : formatSol(vaultBalance, 4)}
            <span style={{ fontSize: 20, fontWeight: 400, color: "rgba(255,255,255,0.55)", marginLeft: 10 }}>SOL</span>
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 28 }}>
            {activeSubs.length} active subscription{activeSubs.length !== 1 ? "s" : ""}
          </div>

          {/* Stat row inside hero */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>Wallet</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "white" }}>{lamportsToSol(walletBalance).toFixed(3)} <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 400, fontSize: 12 }}>SOL</span></div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>Reserved</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "white" }}>{lamportsToSol(reserved).toFixed(3)} <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 400, fontSize: 12 }}>SOL</span></div>
            </div>
          </div>

          {/* Actions */}
          {!vault ? (
            <button style={{ background: "white", color: "#5B5CEB", border: "none", borderRadius: 10, padding: "11px 22px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }} onClick={() => initVault.mutate()} disabled={initVault.isPending}>
              {initVault.isPending ? "Creating..." : "+ Create Vault"}
            </button>
          ) : (
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ background: "white", color: "#5B5CEB", border: "none", borderRadius: 10, padding: "11px 22px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(0,0,0,0.12)", flex: 1 }} onClick={() => setDepositOpen(true)}>↓ Deposit</button>
              <button style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1.5px solid rgba(255,255,255,0.25)", borderRadius: 10, padding: "11px 22px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", flex: 1 }} onClick={() => setWithdrawOpen(true)}>↑ Withdraw</button>
            </div>
          )}
        </div>

        {/* Quick actions panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* New subscription card */}
          <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 16, padding: 22, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>New Subscription</div>
            <div style={{ fontSize: 12.5, color: "#94A3B8", marginBottom: 16, lineHeight: 1.5 }}>Authorize a merchant to collect recurring payments from your vault</div>
            <button
              style={{ width: "100%", background: "linear-gradient(135deg, #5B5CEB, #7A5AF8)", border: "none", color: "white", borderRadius: 10, padding: "11px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(91,92,235,0.3)" }}
              onClick={() => setCreateOpen(true)}
            >+ Authorize Merchant</button>
          </div>

          {/* Active subs summary */}
          <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 16, padding: 22, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.7px" }}>Active Subscriptions</div>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#5B5CEB" }}>{activeSubs.length}</span>
            </div>
            {activeSubs.length === 0 ? (
              <div style={{ fontSize: 12.5, color: "#CBD5E1", textAlign: "center", padding: "8px 0" }}>No active subscriptions</div>
            ) : activeSubs.slice(0, 3).map((s: any, i: number) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: i < Math.min(activeSubs.length, 3) - 1 ? "1px solid #F1F5F9" : "none" }}>
                <div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "#64748B" }}>{shortenAddress(s.merchant.toString())}</div>
                  <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 1 }}>{nextDueLabel(s.nextDueAt.toNumber())}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: 600, color: "#0F172A" }}>{formatSol(s.amountLamports.toNumber(), 4)}</div>
                  <div style={{ fontSize: 11, color: "#94A3B8" }}>{intervalLabel(s.intervalSeconds.toNumber())}</div>
                </div>
              </div>
            ))}
            {activeSubs.length > 3 && (
              <div style={{ fontSize: 12, color: "#5B5CEB", textAlign: "center", marginTop: 10, fontWeight: 500 }}>+{activeSubs.length - 3} more in Subscriptions tab</div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming payments */}
      <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 16, padding: "22px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.7px" }}>Upcoming Payments</div>
          {activeSubs.length > 0 && (
            <span style={{ fontSize: 12, color: "#64748B" }}>Next 30 days</span>
          )}
        </div>
        {activeSubs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: 13.5, color: "#94A3B8", marginBottom: 4 }}>No upcoming payments</div>
            <div style={{ fontSize: 12.5, color: "#CBD5E1" }}>Create a subscription to get started</div>
          </div>
        ) : (
          <div>
            {activeSubs.map((s: any, i: number) => {
              const isDue = s.nextDueAt.toNumber() <= now;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0", borderBottom: i < activeSubs.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: isDue ? "rgba(245,158,11,0.08)" : "rgba(91,92,235,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: isDue ? "#F59E0B" : "#5B5CEB" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0F172A", marginBottom: 2 }}>
                      {shortenAddress(s.merchant.toString())}
                    </div>
                    <div style={{ fontSize: 12, color: "#94A3B8" }}>
                      {intervalLabel(s.intervalSeconds.toNumber())} · {s.cyclesCompleted.toString()} cycles completed
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700, color: "#0F172A", marginBottom: 2 }}>
                      {formatSol(s.amountLamports.toNumber(), 4)} <span style={{ color: "#94A3B8", fontWeight: 400, fontSize: 12 }}>SOL</span>
                    </div>
                    <div style={{ fontSize: 12, color: isDue ? "#F59E0B" : "#64748B", fontWeight: isDue ? 600 : 400 }}>{nextDueLabel(s.nextDueAt.toNumber())}</div>
                  </div>
                  <button
                    style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#EF4444", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}
                    onClick={() => setCancelTarget(s)}
                  >Cancel</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MODALS ── */}

      {/* Deposit */}
      <Modal open={depositOpen} onClose={() => { setDepositOpen(false); setDepositAmt(""); }} title="Deposit to Vault" description="SOL transfers from your connected wallet into your on-chain vault.">
        <div style={{ position: "relative", marginBottom: 4 }}>
          <input style={inpSuf} type="number" placeholder="0.00" min="0.001" step="0.001" value={depositAmt} onChange={e => setDepositAmt(e.target.value)} autoFocus />
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

      {/* Withdraw */}
      <Modal open={withdrawOpen} onClose={() => { setWithdrawOpen(false); setWithdrawAmt(""); }} title="Withdraw from Vault" description="Only you can withdraw. Funds return to your wallet immediately.">
        <div style={{ position: "relative", marginBottom: 4 }}>
          <input style={inpSuf} type="number" placeholder="0.00" step="0.001" value={withdrawAmt} onChange={e => setWithdrawAmt(e.target.value)} autoFocus />
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

      {/* Create subscription */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Subscription" description="Authorize a merchant to collect fixed recurring payments from your vault.">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 6 }}>Merchant Wallet Address</div>
            <input style={inp} placeholder="Solana wallet address..." value={form.merchant} onChange={e => setForm(f => ({...f, merchant: e.target.value}))} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 6 }}>Amount per cycle</div>
              <div style={{ position: "relative" }}>
                <input style={inpSuf} type="number" placeholder="0.00" step="0.001" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} />
                <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 11, fontWeight: 700, color: "#94A3B8", fontFamily: "var(--mono)" }}>SOL</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 6 }}>Interval</div>
              <select style={sel} value={form.interval} onChange={e => setForm(f => ({...f, interval: parseInt(e.target.value)}))}>
                {INTERVALS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 6 }}>Max cycles <span style={{ color: "#94A3B8", fontWeight: 400 }}>(0 = unlimited)</span></div>
            <input style={inp} type="number" placeholder="0" min="0" value={form.maxCycles} onChange={e => setForm(f => ({...f, maxCycles: e.target.value}))} />
          </div>
        </div>
        <TxPreview rows={[{ label: "Merchant cannot", value: "overcharge · charge early · charge after cancel", highlight: "green" }, { label: "Enforced by", value: "on-chain program" }]} />
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ flex: 1, background: "#F8FAFC", border: "1.5px solid #E5E7EB", color: "#64748B", borderRadius: 10, padding: "11px", fontSize: 13.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }} onClick={() => setCreateOpen(false)}>Cancel</button>
          <button style={{ flex: 2, background: "linear-gradient(135deg, #5B5CEB, #7A5AF8)", border: "none", color: "white", borderRadius: 10, padding: "11px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(91,92,235,0.3)" }}
            disabled={!form.merchant || !form.amount || parseFloat(form.amount) <= 0 || createSubscription.isPending}
            onClick={async () => {
              try {
                await createSubscription.mutateAsync({ merchantAddress: form.merchant.trim(), amountSol: parseFloat(form.amount), intervalSeconds: form.interval, maxCycles: parseInt(form.maxCycles) || 0, seedIndex: Math.floor(Math.random() * 1000000) });
                setCreateOpen(false);
                setForm({ merchant: "", amount: "", interval: 2592000, maxCycles: "0" });
              } catch(e: any) { alert("Error: " + (e?.message ?? String(e))); }
            }}>{createSubscription.isPending ? "Signing..." : "Sign & Authorize"}</button>
        </div>
      </Modal>

      {/* Cancel */}
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
