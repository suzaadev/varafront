"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useMerchant } from "@/hooks/useMerchant";
import { formatSol, shortenAddress, intervalLabel, nextDueLabel } from "@/lib/solana/constants";

const card: React.CSSProperties = { background: "#16161a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 };
const th: React.CSSProperties = { textAlign: "left", fontSize: 11, fontWeight: 500, color: "rgba(240,239,244,0.25)", textTransform: "uppercase", letterSpacing: "0.7px", padding: "0 20px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" };
const td: React.CSSProperties = { padding: "14px 20px", fontSize: 13.5, borderBottom: "1px solid rgba(255,255,255,0.04)", verticalAlign: "middle" };

export default function MerchantOverviewPage() {
  const { connected } = useWallet();
  const { merchantSubs, merchantLoading } = useMerchant();

  if (!connected) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16, textAlign: "center" }}>
      <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.5px" }}>Connect your merchant wallet</div>
      <div style={{ fontSize: 14, color: "rgba(240,239,244,0.4)", maxWidth: 320 }}>Connect the wallet you use as a merchant to view subscribers and revenue</div>
      <WalletMultiButton />
    </div>
  );

  const now = Date.now() / 1000;
  const activeSubs = merchantSubs.filter((s: any) => s.active);
  const dueSubs = activeSubs.filter((s: any) => s.nextDueAt.toNumber() <= now);
  const monthly = activeSubs.reduce((a: number, s: any) => a + s.amountLamports.toNumber(), 0);
  const total = merchantSubs.reduce((a: number, s: any) => a + s.cyclesCompleted.toNumber() * s.amountLamports.toNumber(), 0);

  return (
    <div>
      <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.8px", marginBottom: 4 }}>Merchant Overview</div>
      <div style={{ fontSize: 14, color: "rgba(240,239,244,0.4)", marginBottom: 32 }}>Revenue and subscriber activity</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Active Subscribers", value: activeSubs.length.toString(), color: "#f0eff4" },
          { label: "Monthly Revenue", value: `${formatSol(monthly, 3)} SOL`, color: "#34c97a" },
          { label: "Due Now", value: dueSubs.length.toString(), color: "#7c6af7" },
          { label: "Total Collected", value: `${formatSol(total, 3)} SOL`, color: "#f0eff4" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ ...card, padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(240,239,244,0.3)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.5px", color }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={card}>
        <div style={{ padding: "20px 20px 0" }}><div style={{ fontSize: 11, fontWeight: 500, color: "rgba(240,239,244,0.3)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>Subscribers</div></div>
        {merchantLoading ? (
          <div style={{ padding: 32, textAlign: "center", color: "rgba(240,239,244,0.25)", fontSize: 13 }}>Loading...</div>
        ) : merchantSubs.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "rgba(240,239,244,0.25)", fontSize: 13 }}>No subscribers yet. Users will appear here when they authorize your wallet.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
            <thead><tr>{["Wallet","Amount","Interval","Next Due","Cycles","Status"].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {merchantSubs.map((s: any, i: number) => {
                const isDue = s.active && s.nextDueAt.toNumber() <= now;
                return (
                  <tr key={i}>
                    <td style={td}><span style={{ fontFamily: "var(--font-dm-mono)", fontSize: 12, color: "rgba(240,239,244,0.5)" }}>{shortenAddress(s.owner.toString())}</span></td>
                    <td style={td}><span style={{ fontFamily: "var(--font-dm-mono)", fontSize: 13 }}>{formatSol(s.amountLamports.toNumber(), 4)} SOL</span></td>
                    <td style={td}>{intervalLabel(s.intervalSeconds.toNumber())}</td>
                    <td style={td}><span style={{ color: "rgba(240,239,244,0.5)", fontSize: 13 }}>{s.active ? nextDueLabel(s.nextDueAt.toNumber()) : "—"}</span></td>
                    <td style={td}><span style={{ fontFamily: "var(--font-dm-mono)", fontSize: 11, color: "rgba(240,239,244,0.3)" }}>{s.cyclesCompleted.toString()}</span></td>
                    <td style={td}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: 6, fontSize: 11.5, fontWeight: 500, background: isDue ? "rgba(240,160,80,0.1)" : s.active ? "rgba(52,201,122,0.1)" : "rgba(255,255,255,0.05)", color: isDue ? "#f0a050" : s.active ? "#34c97a" : "rgba(240,239,244,0.3)" }}>
                        {(isDue || s.active) && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />}
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
