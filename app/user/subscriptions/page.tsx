"use client";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { formatSol, intervalLabel, nextDueLabel, shortenAddress } from "@/lib/solana/constants";
import { Modal } from "@/components/ui/Modal";
import { TxPreview } from "@/components/ui/TxPreview";

const INTERVALS = [{ label: "Daily", value: 86400 }, { label: "Weekly", value: 604800 }, { label: "Monthly", value: 2592000 }, { label: "Quarterly", value: 7776000 }];
const inp: React.CSSProperties = { width: "100%", background: "white", border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "11px 14px", fontSize: 14, color: "#0F172A", fontFamily: "inherit", outline: "none", boxSizing: "border-box" };
const inpSuf: React.CSSProperties = { ...inp, paddingRight: 48 };
const sel: React.CSSProperties = { width: "100%", background: "white", border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "11px 14px", fontSize: 14, color: "#0F172A", fontFamily: "inherit", outline: "none", cursor: "pointer" };

export default function SubscriptionsPage() {
  const { connected } = useWallet();
  const { subscriptions, subsLoading, createSubscription, cancelSubscription } = useSubscriptions();
  const [createOpen, setCreateOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<any>(null);
  const [form, setForm] = useState({ merchant: "", amount: "", interval: 2592000, maxCycles: "0" });

  if (!connected) return <div style={{ textAlign: "center", padding: "80px 0", color: "#94A3B8", fontSize: 14 }}>Connect your wallet to view subscriptions</div>;

  const activeSubs = subscriptions.filter((s: any) => s.active);

  const statusPill = (active: boolean, isDue = false) => (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 600,
      background: isDue ? "#FFFBEB" : active ? "#F0FDF4" : "#F8FAFC",
      color: isDue ? "#F59E0B" : active ? "#10B981" : "#94A3B8",
      border: `1px solid ${isDue ? "#FDE68A" : active ? "#A7F3D0" : "#E5E7EB"}`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
      {isDue ? "Due now" : active ? "Active" : "Inactive"}
    </span>
  );

  return (
    <div className="fade-in">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.6px", color: "#0F172A", marginBottom: 4 }}>Subscriptions</div>
          <div style={{ fontSize: 14, color: "#64748B" }}>{activeSubs.length} active · {subscriptions.length - activeSubs.length} inactive</div>
        </div>
        <button
          style={{ background: "linear-gradient(135deg, #5B5CEB, #7A5AF8)", border: "none", color: "white", borderRadius: 10, padding: "10px 18px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(91,92,235,0.3)", display: "flex", alignItems: "center", gap: 6 }}
          onClick={() => setCreateOpen(true)}
        >+ New Subscription</button>
      </div>

      <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        {subsLoading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#94A3B8", fontSize: 13.5 }}>Loading subscriptions...</div>
        ) : subscriptions.length === 0 ? (
          <div style={{ padding: 56, textAlign: "center" }}>
            <div style={{ width: 52, height: 52, background: "rgba(91,92,235,0.08)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#5B5CEB" strokeWidth="1.5"/><path d="M12 7v5l3 3" stroke="#5B5CEB" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#0F172A", marginBottom: 6 }}>No subscriptions yet</div>
            <div style={{ fontSize: 13.5, color: "#94A3B8", marginBottom: 20 }}>Authorize a merchant to collect recurring payments from your vault</div>
            <button style={{ background: "linear-gradient(135deg, #5B5CEB, #7A5AF8)", border: "none", color: "white", borderRadius: 10, padding: "10px 20px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(91,92,235,0.3)" }} onClick={() => setCreateOpen(true)}>+ New Subscription</button>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E5E7EB" }}>
                {["Merchant","Amount","Interval","Next Due","Cycles","Status",""].map(h => (
                  <th key={h} style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.6px", padding: "12px 20px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((s: any, i: number) => (
                <tr key={i} style={{ borderBottom: "1px solid #F1F5F9", transition: "background 0.1s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#FAFBFF")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#0F172A" }}>Merchant</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{shortenAddress(s.merchant.toString())}</div>
                  </td>
                  <td style={{ padding: "16px 20px" }}><span style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{formatSol(s.amountLamports.toNumber(), 4)} <span style={{ color: "#94A3B8", fontWeight: 400 }}>SOL</span></span></td>
                  <td style={{ padding: "16px 20px", fontSize: 13, color: "#64748B" }}>{intervalLabel(s.intervalSeconds.toNumber())}</td>
                  <td style={{ padding: "16px 20px", fontSize: 13, color: "#64748B" }}>{s.active ? nextDueLabel(s.nextDueAt.toNumber()) : "—"}</td>
                  <td style={{ padding: "16px 20px" }}><span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "#94A3B8" }}>{s.cyclesCompleted.toString()} / {s.maxCycles.toNumber() === 0 ? "∞" : s.maxCycles.toString()}</span></td>
                  <td style={{ padding: "16px 20px" }}>{statusPill(s.active)}</td>
                  <td style={{ padding: "16px 20px", textAlign: "right" }}>
                    {s.active && (
                      <button
                        style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#EF4444", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                        onClick={() => setCancelTarget(s)}>Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
                <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 11, fontWeight: 600, color: "#94A3B8", fontFamily: "var(--mono)" }}>SOL</span>
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
          <button style={{ flex: 1, background: "#F8FAFC", border: "1.5px solid #E5E7EB", color: "#64748B", borderRadius: 10, padding: "10px", fontSize: 13.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }} onClick={() => setCreateOpen(false)}>Cancel</button>
          <button style={{ flex: 2, background: "linear-gradient(135deg, #5B5CEB, #7A5AF8)", border: "none", color: "white", borderRadius: 10, padding: "10px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(91,92,235,0.3)" }}
            disabled={!form.merchant || !form.amount || parseFloat(form.amount) <= 0 || createSubscription.isPending}
            onClick={async () => {
              try {
                await createSubscription.mutateAsync({ merchantAddress: form.merchant.trim(), amountSol: parseFloat(form.amount), intervalSeconds: form.interval, maxCycles: parseInt(form.maxCycles) || 0, seedIndex: Math.floor(Math.random() * 1000000) });
                setCreateOpen(false); setForm({ merchant: "", amount: "", interval: 2592000, maxCycles: "0" });
              } catch(e: any) { alert("Error: " + (e?.message ?? String(e))); }
            }}>{createSubscription.isPending ? "Signing..." : "Sign & Authorize"}</button>
        </div>
      </Modal>

      <Modal open={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Cancel Subscription" description="Future collections will be blocked immediately on-chain. This cannot be undone.">
        {cancelTarget && <TxPreview rows={[{ label: "Merchant", value: shortenAddress(cancelTarget.merchant.toString()) }, { label: "Amount", value: `${formatSol(cancelTarget.amountLamports.toNumber(), 4)} SOL / ${intervalLabel(cancelTarget.intervalSeconds.toNumber())}` }, { label: "Effect", value: "Immediate · permanent", highlight: "red" }]} />}
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ flex: 1, background: "#F8FAFC", border: "1.5px solid #E5E7EB", color: "#64748B", borderRadius: 10, padding: "10px", fontSize: 13.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }} onClick={() => setCancelTarget(null)}>Keep it</button>
          <button style={{ flex: 2, background: "#FEF2F2", border: "1.5px solid #FECACA", color: "#EF4444", borderRadius: 10, padding: "10px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
            disabled={cancelSubscription.isPending}
            onClick={async () => { await cancelSubscription.mutateAsync(cancelTarget.publicKey); setCancelTarget(null); }}>
            {cancelSubscription.isPending ? "Signing..." : "Sign & Cancel"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
