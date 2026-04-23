"use client";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { getReadonlyProgram } from "@/lib/solana/program";
import { formatSol, shortenAddress, PROGRAM_ID } from "@/lib/solana/constants";

const ADMIN_WALLET = "6Q1XS5pVa8gEKxrfPXpaAymiZ6pasze8eL47ArXyAopz";

const S = {
  card: { background: "#16161a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 } as React.CSSProperties,
  heading: { fontSize: 28, fontWeight: 600, letterSpacing: "-0.8px", color: "#f0eff4", marginBottom: 4 } as React.CSSProperties,
  sub: { fontSize: 14, color: "rgba(240,239,244,0.4)", marginBottom: 32 } as React.CSSProperties,
  label: { fontSize: 11, fontWeight: 500, color: "rgba(240,239,244,0.3)", textTransform: "uppercase" as const, letterSpacing: "0.8px", marginBottom: 8 },
  metaRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" } as React.CSSProperties,
  input: { flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "#f0eff4", fontFamily: "inherit", outline: "none" } as React.CSSProperties,
};

export default function AdminPage() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  const isAdmin = publicKey?.toString() === ADMIN_WALLET;

  const vaultsQ = useQuery({ queryKey: ["admin-vaults"], queryFn: async () => { const p = getReadonlyProgram(); return (p.account as any).vault.all(); }, refetchInterval: 30000 });
  const subsQ = useQuery({ queryKey: ["admin-subs"], queryFn: async () => { const p = getReadonlyProgram(); return (p.account as any).subscription.all(); }, refetchInterval: 30000 });
  const slotQ = useQuery({ queryKey: ["slot"], queryFn: () => connection.getSlot(), refetchInterval: 5000 });

  if (!publicKey) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16, textAlign: "center" }}>
      <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.5px" }}>Admin Access</div>
      <div style={{ fontSize: 14, color: "rgba(240,239,244,0.4)", maxWidth: 320 }}>Connect the program authority wallet to access the admin dashboard</div>
      <WalletMultiButton />
    </div>
  );

  if (!isAdmin) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 12, textAlign: "center" }}>
      <div style={{ width: 48, height: 48, background: "rgba(240,82,82,0.12)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>⛔</div>
      <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.4px" }}>Access Denied</div>
      <div style={{ fontSize: 14, color: "rgba(240,239,244,0.4)", maxWidth: 320 }}>This dashboard is restricted to the program authority wallet only.</div>
      <div style={{ fontFamily: "var(--font-dm-mono)", fontSize: 12, color: "rgba(240,82,82,0.7)", background: "rgba(240,82,82,0.08)", border: "1px solid rgba(240,82,82,0.15)", borderRadius: 8, padding: "8px 16px", marginTop: 8 }}>Connected: {shortenAddress(publicKey.toString())}</div>
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

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <div style={{ ...S.heading, marginBottom: 0 }}>Protocol Admin</div>
        <span style={{ fontSize: 11, background: "rgba(52,201,122,0.1)", color: "#34c97a", borderRadius: 6, padding: "2px 8px", fontWeight: 500 }}>● Authorized</span>
      </div>
      <div style={{...S.sub}}>Chain health and operational metrics</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total Vaults", value: vaults.length.toString(), color: "#f0eff4" },
          { label: "SOL Locked", value: `${formatSol(totalLocked, 2)} SOL`, color: "#34c97a" },
          { label: "Active Subs", value: activeSubs.length.toString(), color: "#7c6af7" },
          { label: "Due Now", value: dueSubs.length.toString(), color: "#f0a050" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ ...S.card, padding: 20 }}>
            <div style={{...S.label}}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.5px", color }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ ...S.card, padding: 24 }}>
          <div style={{...S.label}}>Chain Health</div>
          {[
            { label: "Network status", value: <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 7, height: 7, borderRadius: "50%", background: "#34c97a", boxShadow: "0 0 6px #34c97a" }} /><span style={{ color: "#34c97a", fontSize: 13 }}>Operational</span></div> },
            { label: "Current slot", value: <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: 13 }}>{slotQ.data?.toLocaleString() ?? "—"}</span> },
            { label: "Network", value: <span style={{ fontSize: 11.5, background: "rgba(124,106,247,0.1)", color: "#7c6af7", borderRadius: 6, padding: "2px 8px", fontWeight: 500 }}>Devnet</span> },
            { label: "Program ID", value: <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: 11, color: "rgba(240,239,244,0.35)" }}>{shortenAddress(PROGRAM_ID.toString(), 6)}</span> },
            { label: "Total subscriptions", value: <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: 13 }}>{subs.length}</span> },
          ].map(({ label, value }, i) => (
            <div key={i} style={{ ...S.metaRow, ...(i === 4 ? { borderBottom: "none" } : {}) }}>
              <span style={{ fontSize: 13, color: "rgba(240,239,244,0.4)" }}>{label}</span>
              {value}
            </div>
          ))}
        </div>

        <div style={{ ...S.card, padding: 24 }}>
          <div style={{...S.label}}>Recent Subscriptions</div>
          {subs.length === 0 ? (
            <div style={{ color: "rgba(240,239,244,0.25)", fontSize: 13, paddingTop: 12 }}>No subscriptions found</div>
          ) : subs.slice(-5).reverse().map((s: any, i: number) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
              <div>
                <div style={{ fontFamily: "var(--font-dm-mono)", fontSize: 12, color: "rgba(240,239,244,0.5)" }}>{shortenAddress(s.account.owner.toString())}</div>
                <div style={{ fontSize: 12, color: "rgba(240,239,244,0.25)", marginTop: 2 }}>{formatSol(s.account.amountLamports.toNumber(), 4)} SOL</div>
              </div>
              <span style={{ fontSize: 11.5, padding: "2px 8px", borderRadius: 6, fontWeight: 500, background: s.account.active ? "rgba(52,201,122,0.1)" : "rgba(255,255,255,0.05)", color: s.account.active ? "#34c97a" : "rgba(240,239,244,0.3)" }}>{s.account.active ? "Active" : "Inactive"}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...S.card, padding: 24 }}>
        <div style={{...S.label}}>Search Protocol</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input style={{...S.input}} placeholder="Vault or subscription PDA address..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()} />
          <button onClick={handleSearch} disabled={searching} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#f0eff4", borderRadius: 10, padding: "9px 18px", fontSize: 13.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
            {searching ? "Searching..." : "Search"}
          </button>
        </div>
        {searchResult && (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "16px 20px" }}>
            {searchResult.type === "notfound" && <div style={{ fontSize: 13, color: "rgba(240,239,244,0.3)" }}>No account found at this address</div>}
            {searchResult.type === "vault" && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#7c6af7", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.7px" }}>Vault Found</div>
                {[
                  { label: "Owner", value: shortenAddress(searchResult.data.owner.toString(), 8) },
                  { label: "Balance", value: `${formatSol(searchResult.data.balanceLamports.toNumber(), 4)} SOL` },
                  { label: "Subscriptions", value: searchResult.data.subscriptionCount.toString() },
                ].map(({ label, value }, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.04)" : "none", fontSize: 13 }}>
                    <span style={{ color: "rgba(240,239,244,0.4)" }}>{label}</span>
                    <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: 12 }}>{value}</span>
                  </div>
                ))}
              </div>
            )}
            {searchResult.type === "subscription" && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#7c6af7", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.7px" }}>Subscription Found</div>
                {[
                  { label: "Owner", value: shortenAddress(searchResult.data.owner.toString(), 8) },
                  { label: "Merchant", value: shortenAddress(searchResult.data.merchant.toString(), 8) },
                  { label: "Amount", value: `${formatSol(searchResult.data.amountLamports.toNumber(), 4)} SOL` },
                  { label: "Status", value: searchResult.data.active ? "Active" : "Inactive" },
                ].map(({ label, value }, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none", fontSize: 13 }}>
                    <span style={{ color: "rgba(240,239,244,0.4)" }}>{label}</span>
                    <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: 12 }}>{value}</span>
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
