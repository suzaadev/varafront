"use client";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMerchant } from "@/hooks/useMerchant";
import { formatSol, shortenAddress } from "@/lib/solana/constants";
import { Modal } from "@/components/ui/Modal";
import { TxPreview } from "@/components/ui/TxPreview";

const card: React.CSSProperties = { background: "#16161a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 };
const th: React.CSSProperties = { textAlign: "left", fontSize: 11, fontWeight: 500, color: "rgba(240,239,244,0.25)", textTransform: "uppercase", letterSpacing: "0.7px", padding: "0 20px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" };
const td: React.CSSProperties = { padding: "14px 20px", fontSize: 13.5, borderBottom: "1px solid rgba(255,255,255,0.04)", verticalAlign: "middle" };
const btnP: React.CSSProperties = { background: "#7c6af7", border: "1px solid #7c6af7", color: "white", borderRadius: 10, padding: "9px 18px", fontSize: 13.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 6 };
const btnD: React.CSSProperties = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#f0eff4", borderRadius: 10, padding: "9px 18px", fontSize: 13.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 6 };

export default function MerchantCollectPage() {
  const { connected } = useWallet();
  const { merchantSubs, merchantLoading, collectPayment } = useMerchant();
  const [collectTarget, setCollectTarget] = useState<any>(null);
  const [collectAllOpen, setCollectAllOpen] = useState(false);
  const [collectingAll, setCollectingAll] = useState(false);

  const now = Date.now() / 1000;
  const dueSubs = merchantSubs.filter((s: any) => s.active && s.nextDueAt.toNumber() <= now);
  const totalDue = dueSubs.reduce((a: number, s: any) => a + s.amountLamports.toNumber(), 0);

  if (!connected) return <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(240,239,244,0.3)", fontSize: 14 }}>Connect your merchant wallet to collect payments</div>;

  const handleCollectAll = async () => {
    setCollectingAll(true);
    for (const s of dueSubs) { try { await collectPayment.mutateAsync({ subPda: s.publicKey, ownerPubkey: s.owner }); } catch {} }
    setCollectingAll(false); setCollectAllOpen(false);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.8px", marginBottom: 4 }}>Collect Payments</div>
          <div style={{ fontSize: 14, color: "rgba(240,239,244,0.4)" }}>{dueSubs.length} due · {formatSol(totalDue, 4)} SOL total</div>
        </div>
        {dueSubs.length > 0 && <button style={btnP} onClick={() => setCollectAllOpen(true)}>Collect All Due</button>}
      </div>

      <div style={card}>
        {merchantLoading ? (
          <div style={{ padding: 32, textAlign: "center", color: "rgba(240,239,244,0.25)", fontSize: 13 }}>Loading...</div>
        ) : merchantSubs.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "rgba(240,239,244,0.25)", fontSize: 13 }}>No subscribers yet.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>{["Subscriber","Amount","Due Since","Status",""].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {merchantSubs.map((s: any, i: number) => {
                const isDue = s.active && s.nextDueAt.toNumber() <= now;
                return (
                  <tr key={i}>
                    <td style={td}><span style={{ fontFamily: "var(--font-dm-mono)", fontSize: 12, color: "rgba(240,239,244,0.5)" }}>{shortenAddress(s.owner.toString())}</span></td>
                    <td style={td}><span style={{ fontFamily: "var(--font-dm-mono)", fontSize: 13 }}>{formatSol(s.amountLamports.toNumber(), 4)} SOL</span></td>
                    <td style={td}><span style={{ fontSize: 13, color: "rgba(240,239,244,0.4)" }}>{isDue ? new Date(s.nextDueAt.toNumber() * 1000).toLocaleDateString() : "—"}</span></td>
                    <td style={td}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: 6, fontSize: 11.5, fontWeight: 500, background: isDue ? "rgba(240,160,80,0.1)" : s.active ? "rgba(52,201,122,0.1)" : "rgba(255,255,255,0.05)", color: isDue ? "#f0a050" : s.active ? "#34c97a" : "rgba(240,239,244,0.3)" }}>
                        {(isDue || s.active) && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />}
                        {isDue ? "Due now" : s.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ ...td, textAlign: "right" }}>
                      {isDue ? (
                        <button style={{ ...btnP, padding: "5px 12px", fontSize: 12 }} onClick={() => setCollectTarget(s)}>Collect</button>
                      ) : (
                        <button style={{ ...btnD, padding: "5px 12px", fontSize: 12, opacity: 0.35, cursor: "not-allowed" }} disabled>Collect</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={!!collectTarget} onClose={() => setCollectTarget(null)} title="Collect Payment" description="You sign this transaction. SOL moves from the subscriber vault to your wallet.">
        {collectTarget && <TxPreview rows={[{ label: "Subscriber", value: shortenAddress(collectTarget.owner.toString()) }, { label: "Amount", value: `${formatSol(collectTarget.amountLamports.toNumber(), 4)} SOL`, highlight: "green" }, { label: "Network fee", value: "~0.000005 SOL (you pay)" }]} />}
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button style={{ ...btnD, flex: 1, justifyContent: "center" }} onClick={() => setCollectTarget(null)}>Cancel</button>
          <button style={{ ...btnP, flex: 2, justifyContent: "center" }} disabled={collectPayment.isPending}
            onClick={async () => { await collectPayment.mutateAsync({ subPda: collectTarget.publicKey, ownerPubkey: collectTarget.owner }); setCollectTarget(null); }}>
            {collectPayment.isPending ? "Signing..." : "Sign & Collect"}
          </button>
        </div>
      </Modal>

      <Modal open={collectAllOpen} onClose={() => setCollectAllOpen(false)} title="Collect All Due" description="Sends a transaction for each due subscription.">
        <TxPreview rows={[{ label: "Payments", value: dueSubs.length.toString(), highlight: "green" }, { label: "Total", value: `${formatSol(totalDue, 4)} SOL` }, { label: "Est. fees", value: `~${(dueSubs.length * 0.000005).toFixed(6)} SOL` }]} />
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button style={{ ...btnD, flex: 1, justifyContent: "center" }} onClick={() => setCollectAllOpen(false)}>Cancel</button>
          <button style={{ ...btnP, flex: 2, justifyContent: "center" }} disabled={collectingAll} onClick={handleCollectAll}>
            {collectingAll ? "Collecting..." : "Sign & Collect All"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
