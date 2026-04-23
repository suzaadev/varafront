"use client";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { getReadonlyProgram } from "@/lib/solana/program";
import { formatSol, shortenAddress, PROGRAM_ID } from "@/lib/solana/constants";

const ADMIN_WALLET = "6Q1XS5pVa8gEKxrfPXpaAymiZ6pasze8eL47ArXyAopz";

export default function AdminPage() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  const isAdmin = publicKey?.toString() === ADMIN_WALLET;

  const vaultsQ = useQuery({ queryKey: ["admin-vaults"], queryFn: async () => { const p = getReadonlyProgram(); return (p.account as any).vault.all(); }, refetchInterval: 30000, enabled: isAdmin });
  const subsQ = useQuery({ queryKey: ["admin-subs"], queryFn: async () => { const p = getReadonlyProgram(); return (p.account as any).subscription.all(); }, refetchInterval: 30000, enabled: isAdmin });
  const slotQ = useQuery({ queryKey: ["slot"], queryFn: () => connection.getSlot(), refetchInterval: 5000 });

  if (!publicKey) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 20, textAlign: "center" }}>
      <div style={{ width: 64, height: 64, background: "rgba(239,68,68,0.08)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🛡️</div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px", color: "#0F172A", marginBottom: 8 }}>Admin Access</div>
        <div style={{ fontSize: 14, color: "#64748B", maxWidth: 320, lineHeight: 1.6 }}>Connect the program authority wallet to access the admin dashboard</div>
      </div>
      <WalletMultiButton />
    </div>
  );

  if (!isAdmin) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16, textAlign: "center" }}>
      <div style={{ width: 64, height: 64, background: "#FEF2F2", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, border: "1px solid #FECACA" }}>⛔</div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px", color: "#0F172A", marginBottom: 8 }}>Access Denied</div>
        <div style={{ fontSize: 14, color: "#64748B", maxWidth: 320, lineHeight: 1.6 }}>This dashboard is restricted to the program authority wallet only.</div>
      </div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 12.5, color: "#EF4444", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "8px 16px" }}>
        Connected: {shortenAddress(publicKey.toString(), 6)}
      </div>
    </div>
  );

  const vaults = vaultsQ.data ?? [];
  const subs = subsQ.data ?? [];
  const activeSubs = subs.filter((s: any) => s.account.active);
  const totalLocked = vaults.reduce((a: number, v: any) => a + v.account.balanceLamports.toNumber(), 0);
  const now = Date.now() / 1000;
  const dueSubs = activeSubs.filter((s: any) => s.account.nextDueAt.toNumber() <= now);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    try {
      const p = getReadonlyProgram();
      const vault = await (p.account as any).vault.fetchNullable(search);
      if (vault) { setSearchResult({ type: "vault", data: vault }); setSearching(false); return; }
      const sub = await (p.account as any).subscription.fetchNullable(search);
      if (sub) { setSearchResult({ type: "subscription", data: sub }); setSearching(false); return; }
      setSearchResult({ type: "notfound" });
    } catch { setSearchResult({ type: "notfound" }); }
    setSearching(false);
  };

  const stats = [
    { label: "Total Vaults", value: vaults.length.toString(), color: "#0F172A" },
    { label: "SOL Locked", value: `${formatSol(totalLocked, 2)} SOL`, color: "#10B981" },
    { label: "Active Subscriptions", value: activeSubs.length.toString(), color: "#5B5CEB" },
    { label: "Due Now", value: dueSubs.length.toString(), color: "#F59E0B" },
  ];

  return (
    <div className="fade-in">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.6px", color: "#0F172A", marginBottom: 4 }}>Protocol Admin</div>
          <div style={{ fontSize: 14, color: "#64748B" }}>Chain health and operational metrics</div>
        </div>
        <span style={{ fontSize: 11.5, fontWeight: 600, background: "#F0FDF4", color: "#10B981", border: "1px solid #A7F3D0", borderRadius: 20, padding: "4px 12px", marginTop: 2 }}>● Authorized</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {stats.map(({ label, value, color }) => (
          <div key={label} style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 16, padding: 22, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 10 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.4px", color }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 16, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 16 }}>Chain Health</div>
          {[
            { label: "Network status", value: <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#10B981" }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 0 3px rgba(16,185,129,0.2)" }} />Operational</span> },
            { label: "Current slot", value: <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "#0F172A" }}>{slotQ.data?.toLocaleString() ?? "—"}</span> },
            { label: "Network", value: <span style={{ fontSize: 12, fontWeight: 600, background: "rgba(91,92,235,0.08)", color: "#5B5CEB", borderRadius: 6, padding: "3px 8px" }}>Devnet</span> },
            { label: "Program ID", value: <span style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "#64748B" }}>{shortenAddress(PROGRAM_ID.toString(), 8)}</span> },
            { label: "Total subscriptions", value: <span style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{subs.length}</span> },
          ].map(({ label, value }, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 4 ? "1px solid #F1F5F9" : "none" }}>
              <span style={{ fontSize: 13, color: "#64748B" }}>{label}</span>
              {value}
            </div>
          ))}
        </div>

        <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 16, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 16 }}>Recent Subscriptions</div>
          {subs.length === 0 ? (
            <div style={{ color: "#94A3B8", fontSize: 13.5, padding: "16px 0" }}>No subscriptions found</div>
          ) : subs.slice(-5).reverse().map((s: any, i: number) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: i < 4 ? "1px solid #F1F5F9" : "none" }}>
              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "#64748B" }}>{shortenAddress(s.account.owner.toString())}</div>
                <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{formatSol(s.account.amountLamports.toNumber(), 4)} SOL</div>
              </div>
              <span style={{ fontSize: 11.5, fontWeight: 600, padding: "4px 10px", borderRadius: 20, background: s.account.active ? "#F0FDF4" : "#F8FAFC", color: s.account.active ? "#10B981" : "#94A3B8", border: `1px solid ${s.account.active ? "#A7F3D0" : "#E5E7EB"}` }}>
                {s.account.active ? "Active" : "Inactive"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 16, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 14 }}>Search Protocol</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <input
            style={{ flex: 1, background: "white", border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "11px 14px", fontSize: 14, color: "#0F172A", fontFamily: "inherit", outline: "none", transition: "border-color 0.13s" }}
            placeholder="Vault or subscription PDA address..."
            value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
          />
          <button onClick={handleSearch} disabled={searching} style={{ background: "linear-gradient(135deg, #5B5CEB, #7A5AF8)", border: "none", color: "white", borderRadius: 10, padding: "11px 20px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(91,92,235,0.3)", whiteSpace: "nowrap" }}>
            {searching ? "Searching..." : "Search"}
          </button>
        </div>
        {searchResult && (
          <div style={{ background: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 12, padding: "16px 20px" }}>
            {searchResult.type === "notfound" && <div style={{ fontSize: 13.5, color: "#94A3B8" }}>No account found at this address</div>}
            {(searchResult.type === "vault" || searchResult.type === "subscription") && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#5B5CEB", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 12 }}>{searchResult.type === "vault" ? "Vault Found" : "Subscription Found"}</div>
                {(searchResult.type === "vault" ? [
                  { label: "Owner", value: shortenAddress(searchResult.data.owner.toString(), 8) },
                  { label: "Balance", value: `${formatSol(searchResult.data.balanceLamports.toNumber(), 4)} SOL` },
                  { label: "Subscriptions", value: searchResult.data.subscriptionCount.toString() },
                ] : [
                  { label: "Owner", value: shortenAddress(searchResult.data.owner.toString(), 8) },
                  { label: "Merchant", value: shortenAddress(searchResult.data.merchant.toString(), 8) },
                  { label: "Amount", value: `${formatSol(searchResult.data.amountLamports.toNumber(), 4)} SOL` },
                  { label: "Status", value: searchResult.data.active ? "Active" : "Inactive" },
                ]).map(({ label, value }, i, arr) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < arr.length - 1 ? "1px solid #F1F5F9" : "none", fontSize: 13 }}>
                    <span style={{ color: "#64748B" }}>{label}</span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 12.5, fontWeight: 500, color: "#0F172A" }}>{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
