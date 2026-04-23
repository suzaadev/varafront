"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useMerchant } from "@/hooks/useMerchant";
import { formatSol, shortenAddress, intervalLabel, nextDueLabel } from "@/lib/solana/constants";

export default function MerchantOverviewPage() {
  const { connected } = useWallet();
  const { merchantSubs, merchantLoading } = useMerchant();

  if (!connected) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16, textAlign: "center" }}>
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px", color: "#0F172A" }}>Connect your merchant wallet</div>
      <div style={{ fontSize: 14, color: "#64748B", maxWidth: 320 }}>Connect the wallet you use as a merchant to view subscribers and revenue</div>
      <WalletMultiButton />
    </div>
  );

  const now = Date.now() / 1000;
  const activeSubs = merchantSubs.filter((s: any) => s.active);
  const dueSubs = activeSubs.filter((s: any) => s.nextDueAt.toNumber() <= now);
  const monthly = activeSubs.reduce((a: number, s: any) => a + s.amountLamports.toNumber(), 0);
  const total = merchantSubs.reduce((a: number, s: any) => a + s.cyclesCompleted.toNumber() * s.amountLamports.toNumber(), 0);

  const stats = [
    { label: "Active Subscribers", value: activeSubs.length.toString(), color: "#0F172A", bg: "white" },
    { label: "Monthly Revenue", value: `${formatSol(monthly, 3)} SOL`, color: "#10B981", bg: "white" },
    { label: "Due Now", value: dueSubs.length.toString(), color: "#5B5CEB", bg: "white" },
    { label: "Total Collected", value: `${formatSol(total, 3)} SOL`, color: "#0F172A", bg: "white" },
  ];

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.6px", color: "#0F172A", marginBottom: 4 }}>Merchant Overview</div>
        <div style={{ fontSize: 14, color: "#64748B" }}>Revenue and subscriber activity</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {stats.map(({ label, value, color, bg }) => (
          <div key={label} style={{ background: bg, border: "1px solid #E5E7EB", borderRadius: 16, padding: 22, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 10 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.4px", color }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        <div style={{ padding: "18px 20px", borderBottom: "1px solid #F1F5F9" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.6px" }}>Subscribers</div>
        </div>
        {merchantLoading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#94A3B8", fontSize: 13.5 }}>Loading...</div>
        ) : merchantSubs.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "#94A3B8", fontSize: 13.5 }}>No subscribers yet. Users will appear here when they authorize your wallet.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E5E7EB" }}>
                {["Wallet","Amount","Interval","Next Due","Cycles","Status"].map(h => (
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
                    <td style={{ padding: "16px 20px", fontSize: 13, color: "#64748B" }}>{intervalLabel(s.intervalSeconds.toNumber())}</td>
                    <td style={{ padding: "16px 20px", fontSize: 13, color: "#64748B" }}>{s.active ? nextDueLabel(s.nextDueAt.toNumber()) : "—"}</td>
                    <td style={{ padding: "16px 20px" }}><span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "#94A3B8" }}>{s.cyclesCompleted.toString()}</span></td>
                    <td style={{ padding: "16px 20px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 600, background: isDue ? "#FFFBEB" : s.active ? "#F0FDF4" : "#F8FAFC", color: isDue ? "#F59E0B" : s.active ? "#10B981" : "#94A3B8", border: `1px solid ${isDue ? "#FDE68A" : s.active ? "#A7F3D0" : "#E5E7EB"}` }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
                        {isDue ? "Due now" : s.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
