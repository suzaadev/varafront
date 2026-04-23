"use client";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMerchant } from "@/hooks/useMerchant";
import { formatSol, shortenAddress } from "@/lib/solana/constants";
import { Modal } from "@/components/ui/Modal";
import { TxPreview } from "@/components/ui/TxPreview";

export default function MerchantCollectPage() {
  const { connected } = useWallet();
  const { merchantSubs, merchantLoading, collectPayment } = useMerchant();
  const [collectTarget, setCollectTarget] = useState<any>(null);
  const [collectAllOpen, setCollectAllOpen] = useState(false);
  const [collectingAll, setCollectingAll] = useState(false);

  const now = Date.now() / 1000;
  const dueSubs = merchantSubs.filter((s: any) => s.active && s.nextDueAt.toNumber() <= now);
  const totalDue = dueSubs.reduce((a: number, s: any) => a + s.amountLamports.toNumber(), 0);

  if (!connected) return <div style={{ textAlign: "center", padding: "80px 0", color: "#94A3B8", fontSize: 14 }}>Connect your merchant wallet to collect payments</div>;

  const handleCollectAll = async () => {
    setCollectingAll(true);
    for (const s of dueSubs) { try { await collectPayment.mutateAsync({ subPda: s.publicKey, ownerPubkey: s.owner }); } catch {} }
    setCollectingAll(false); setCollectAllOpen(false);
  };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.6px", color: "#0F172A", marginBottom: 4 }}>Collect Payments</div>
          <div style={{ fontSize: 14, color: "#64748B" }}>{dueSubs.length} due · {formatSol(totalDue, 4)} SOL total</div>
        </div>
        {dueSubs.length > 0 && (
          <button style={{ background: "linear-gradient(135deg, #5B5CEB, #7A5AF8)", border: "none", color: "white", borderRadius: 10, padding: "10px 18px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(91,92,235,0.3)" }} onClick={() => setCollectAllOpen(true)}>Collect All Due</button>
        )}
      </div>

      <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        {merchantLoading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#94A3B8", fontSize: 13.5 }}>Loading...</div>
        ) : merchantSubs.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "#94A3B8", fontSize: 13.5 }}>No subscribers yet.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E5E7EB" }}>
                {["Subscriber","Amount","Due Since","Status",""].map(h => (
                  <th key={h} style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.6px", padding: "12px 20px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {merchantSubs.map((s: any, i: number) => {
                const isDue = s.active && s.nextDueAt.toNumber() <= now;
                return (
                  <tr key={i} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "16px 20px" }}><span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "#64748B" }}>{shortenAddress(s.owner.toString())}</span></td>
                    <td style={{ padding: "16px 20px" }}><span style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{formatSol(s.amountLamports.toNumber(), 4)} <span style={{ color: "#94A3B8", fontWeight: 400 }}>SOL</span></span></td>
                    <td style={{ padding: "16px 20px", fontSize: 13, color: "#64748B" }}>{isDue ? new Date(s.nextDueAt.toNumber() * 1000).toLocaleDateString() : "—"}</td>
                    <td style={{ padding: "16px 20px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 600, background: isDue ? "#FFFBEB" : s.active ? "#F0FDF4" : "#F8FAFC", color: isDue ? "#F59E0B" : s.active ? "#10B981" : "#94A3B8", border: `1px solid ${isDue ? "#FDE68A" : s.active ? "#A7F3D0" : "#E5E7EB"}` }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
                        {isDue ? "Due now" : s.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                      {isDue ? (
                        <button style={{ background: "linear-gradient(135deg, #5B5CEB, #7A5AF8)", border: "none", color: "white", borderRadius: 8, padding: "6px 14px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 1px 4px rgba(91,92,235,0.3)" }} onClick={() => setCollectTarget(s)}>Collect</button>
                      ) : (
                        <button style={{ background: "#F8FAFC", border: "1px solid #E5E7EB", color: "#CBD5E1", borderRadius: 8, padding: "6px 14px", fontSize: 12.5, fontWeight: 500, cursor: "not-allowed", fontFamily: "inherit" }} disabled>Collect</button>
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
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ flex: 1, background: "#F8FAFC", border: "1.5px solid #E5E7EB", color: "#64748B", borderRadius: 10, padding: "10px", fontSize: 13.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }} onClick={() => setCollectTarget(null)}>Cancel</button>
          <button style={{ flex: 2, background: "linear-gradient(135deg, #5B5CEB, #7A5AF8)", border: "none", color: "white", borderRadius: 10, padding: "10px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(91,92,235,0.3)" }}
            disabled={collectPayment.isPending}
            onClick={async () => { await collectPayment.mutateAsync({ subPda: collectTarget.publicKey, ownerPubkey: collectTarget.owner }); setCollectTarget(null); }}>
            {collectPayment.isPending ? "Signing..." : "Sign & Collect"}
          </button>
        </div>
      </Modal>

      <Modal open={collectAllOpen} onClose={() => setCollectAllOpen(false)} title="Collect All Due" description="Sends a transaction for each due subscription. Insufficient vaults are skipped automatically.">
        <TxPreview rows={[{ label: "Payments to collect", value: dueSubs.length.toString(), highlight: "green" }, { label: "Total", value: `${formatSol(totalDue, 4)} SOL` }, { label: "Est. network fees", value: `~${(dueSubs.length * 0.000005).toFixed(6)} SOL` }]} />
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ flex: 1, background: "#F8FAFC", border: "1.5px solid #E5E7EB", color: "#64748B", borderRadius: 10, padding: "10px", fontSize: 13.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }} onClick={() => setCollectAllOpen(false)}>Cancel</button>
          <button style={{ flex: 2, background: "linear-gradient(135deg, #5B5CEB, #7A5AF8)", border: "none", color: "white", borderRadius: 10, padding: "10px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(91,92,235,0.3)" }}
            disabled={collectingAll} onClick={handleCollectAll}>
            {collectingAll ? "Collecting..." : "Sign & Collect All"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
