"use client";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { formatSol, intervalLabel, nextDueLabel, shortenAddress } from "@/lib/solana/constants";
import { Modal } from "@/components/ui/Modal";
import { TxPreview } from "@/components/ui/TxPreview";

const INTERVALS = [{ label: "Daily", value: 86400 }, { label: "Weekly", value: 604800 }, { label: "Monthly", value: 2592000 }, { label: "Quarterly", value: 7776000 }];
const card: React.CSSProperties = { background: "#16161a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 };
const th: React.CSSProperties = { textAlign: "left", fontSize: 11, fontWeight: 500, color: "rgba(240,239,244,0.25)", textTransform: "uppercase", letterSpacing: "0.7px", padding: "0 20px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" };
const td: React.CSSProperties = { padding: "14px 20px", fontSize: 13.5, borderBottom: "1px solid rgba(255,255,255,0.04)", verticalAlign: "middle" };
const btnP: React.CSSProperties = { background: "#7c6af7", border: "1px solid #7c6af7", color: "white", borderRadius: 10, padding: "9px 18px", fontSize: 13.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 6 };
const btnD: React.CSSProperties = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#f0eff4", borderRadius: 10, padding: "9px 18px", fontSize: 13.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 6 };
const inp: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 48px 10px 14px", fontSize: 14, color: "#f0eff4", fontFamily: "inherit", outline: "none", boxSizing: "border-box" };
const sel: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "#f0eff4", fontFamily: "inherit", outline: "none", cursor: "pointer" };

export default function SubscriptionsPage() {
  const { connected } = useWallet();
  const { subscriptions, subsLoading, createSubscription, cancelSubscription } = useSubscriptions();
  const [createOpen, setCreateOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<any>(null);
  const [form, setForm] = useState({ merchant: "", amount: "", interval: 2592000, maxCycles: "0" });

  if (!connected) return <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(240,239,244,0.3)", fontSize: 14 }}>Connect your wallet to view subscriptions</div>;

  const activeSubs = subscriptions.filter((s: any) => s.active);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.8px", marginBottom: 4 }}>Subscriptions</div>
          <div style={{ fontSize: 14, color: "rgba(240,239,244,0.4)" }}>{activeSubs.length} active · {subscriptions.length - activeSubs.length} inactive</div>
        </div>
        <button style={btnP} onClick={() => setCreateOpen(true)}>+ New Subscription</button>
      </div>

      <div style={card}>
        {subsLoading ? (
          <div style={{ padding: 32, textAlign: "center", color: "rgba(240,239,244,0.25)", fontSize: 13 }}>Loading...</div>
        ) : subscriptions.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <div style={{ fontSize: 14, color: "rgba(240,239,244,0.35)", marginBottom: 8 }}>No subscriptions yet</div>
            <div style={{ fontSize: 13, color: "rgba(240,239,244,0.2)", marginBottom: 20 }}>Authorize a merchant to collect recurring payments from your vault</div>
            <button style={btnP} onClick={() => setCreateOpen(true)}>+ New Subscription</button>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>{["Merchant","Amount","Interval","Next Due","Cycles","Status",""].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {subscriptions.map((s: any, i: number) => (
                <tr key={i}>
                  <td style={td}>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>Merchant</div>
                    <div style={{ fontFamily: "var(--font-dm-mono)", fontSize: 11, color: "rgba(240,239,244,0.3)", marginTop: 2 }}>{shortenAddress(s.merchant.toString())}</div>
                  </td>
                  <td style={td}><span style={{ fontFamily: "var(--font-dm-mono)", fontSize: 13 }}>{formatSol(s.amountLamports.toNumber(), 4)} SOL</span></td>
                  <td style={td}>{intervalLabel(s.intervalSeconds.toNumber())}</td>
                  <td style={td}><span style={{ color: "rgba(240,239,244,0.5)" }}>{s.active ? nextDueLabel(s.nextDueAt.toNumber()) : "—"}</span></td>
                  <td style={td}><span style={{ fontFamily: "var(--font-dm-mono)", fontSize: 11, color: "rgba(240,239,244,0.3)" }}>{s.cyclesCompleted.toString()} / {s.maxCycles.toNumber() === 0 ? "∞" : s.maxCycles.toString()}</span></td>
                  <td style={td}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: 6, fontSize: 11.5, fontWeight: 500, background: s.active ? "rgba(52,201,122,0.1)" : "rgba(255,255,255,0.05)", color: s.active ? "#34c97a" : "rgba(240,239,244,0.3)" }}>
                      {s.active && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />}
                      {s.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ ...td, textAlign: "right" }}>
                    {s.active && <button style={{ background: "rgba(240,82,82,0.1)", border: "1px solid rgba(240,82,82,0.2)", color: "#f05252", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }} onClick={() => setCancelTarget(s)}>Cancel</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Subscription" description="Authorize a merchant to collect fixed recurring payments from your vault.">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(240,239,244,0.4)", marginBottom: 6 }}>Merchant Wallet Address</div>
            <input style={{ ...inp, paddingRight: 14 }} placeholder="Solana wallet address..." value={form.merchant} onChange={e => setForm(f => ({...f, merchant: e.target.value}))} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(240,239,244,0.4)", marginBottom: 6 }}>Amount per cycle</div>
              <div style={{ position: "relative" }}>
                <input style={inp} type="number" placeholder="0.00" step="0.001" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} />
                <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "rgba(240,239,244,0.3)", fontFamily: "var(--font-dm-mono)" }}>SOL</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(240,239,244,0.4)", marginBottom: 6 }}>Interval</div>
              <select style={sel} value={form.interval} onChange={e => setForm(f => ({...f, interval: parseInt(e.target.value)}))}>
                {INTERVALS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(240,239,244,0.4)", marginBottom: 6 }}>Max cycles (0 = unlimited)</div>
            <input style={{ ...inp, paddingRight: 14 }} type="number" placeholder="0" min="0" value={form.maxCycles} onChange={e => setForm(f => ({...f, maxCycles: e.target.value}))} />
          </div>
        </div>
        <TxPreview rows={[{ label: "Merchant cannot", value: "overcharge · charge early · charge after cancel", highlight: "green" }, { label: "Enforced by", value: "on-chain program" }]} />
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button style={{ ...btnD, flex: 1, justifyContent: "center" }} onClick={() => setCreateOpen(false)}>Cancel</button>
          <button style={{ ...btnP, flex: 2, justifyContent: "center" }} disabled={!form.merchant || !form.amount || parseFloat(form.amount) <= 0 || createSubscription.isPending}
            onClick={async () => {
              await createSubscription.mutateAsync({ merchantAddress: form.merchant, amountSol: parseFloat(form.amount), intervalSeconds: form.interval, maxCycles: parseInt(form.maxCycles) || 0, seedIndex: Math.floor(Math.random() * 1000000) });
              setCreateOpen(false); setForm({ merchant: "", amount: "", interval: 2592000, maxCycles: "0" });
            }}>{createSubscription.isPending ? "Signing..." : "Sign & Authorize"}</button>
        </div>
      </Modal>

      <Modal open={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Cancel Subscription" description="Future collections will be blocked immediately on-chain.">
        {cancelTarget && <TxPreview rows={[{ label: "Merchant", value: shortenAddress(cancelTarget.merchant.toString()) }, { label: "Amount", value: `${formatSol(cancelTarget.amountLamports.toNumber(), 4)} SOL / ${intervalLabel(cancelTarget.intervalSeconds.toNumber())}` }, { label: "Effect", value: "Immediate · permanent", highlight: "red" }]} />}
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button style={{ ...btnD, flex: 1, justifyContent: "center" }} onClick={() => setCancelTarget(null)}>Keep</button>
          <button style={{ background: "rgba(240,82,82,0.1)", border: "1px solid rgba(240,82,82,0.25)", color: "#f05252", borderRadius: 10, padding: "9px 18px", fontSize: 13.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", flex: 2, display: "flex", justifyContent: "center" } as React.CSSProperties}
            disabled={cancelSubscription.isPending}
            onClick={async () => { await cancelSubscription.mutateAsync(cancelTarget.publicKey); setCancelTarget(null); }}>
            {cancelSubscription.isPending ? "Signing..." : "Sign & Cancel"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
