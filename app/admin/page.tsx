"use client";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program, Idl } from "@coral-xyz/anchor";
import { getReadonlyProgram } from "@/lib/solana/program";
import { formatSol, shortenAddress, PROGRAM_ID } from "@/lib/solana/constants";
import idl from "@/lib/solana/idl.json";

const ADMIN_WALLET = "6Q1XS5pVa8gEKxrfPXpaAymiZ6pasze8eL47ArXyAopz";
const CONFIG_PDA = PublicKey.findProgramAddressSync(
  [Buffer.from("platform_config")],
  PROGRAM_ID
)[0];

export default function AdminPage() {
  const { publicKey } = useWallet();
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [newFeeBps, setNewFeeBps] = useState("");
  const [feeError, setFeeError] = useState("");

  const isAdmin = publicKey?.toString() === ADMIN_WALLET;

  const vaultsQ = useQuery({ queryKey: ["admin-vaults"], queryFn: async () => { const p = getReadonlyProgram(); return (p.account as any).vault.all(); }, refetchInterval: 30000, enabled: isAdmin });
  const subsQ = useQuery({ queryKey: ["admin-subs"], queryFn: async () => { const p = getReadonlyProgram(); return (p.account as any).subscription.all(); }, refetchInterval: 30000, enabled: isAdmin });
  const slotQ = useQuery({ queryKey: ["slot"], queryFn: () => connection.getSlot(), refetchInterval: 5000 });

  const configQ = useQuery({
    queryKey: ["platform-config"],
    queryFn: async () => {
      const p = getReadonlyProgram();
      return (p.account as any).platformConfig.fetch(CONFIG_PDA);
    },
    refetchInterval: 10000,
  });

  const updateFee = useMutation({
    mutationFn: async (feeBps: number) => {
      if (!wallet) throw new Error("Not connected");
      const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
      const program = new Program(idl as Idl, provider);
      await (program.methods as any).updateConfig(feeBps)
        .accounts({ config: CONFIG_PDA, authority: wallet.publicKey })
        .rpc();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["platform-config"] });
      setNewFeeBps("");
      setFeeError("");
    },
    onError: (e: any) => setFeeError(e?.message ?? "Transaction failed"),
  });

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
      <div style={{ fontFamily: "var(--mono)", fontSize: 12.5, color: "#EF4444", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "8px 16px", marginTop: 8 }}>Connected: {shortenAddress(publicKey.toString(), 6)}</div>
    </div>
  );

  const vaults = vaultsQ.data ?? [];
  const subs = subsQ.data ?? [];
  const activeSubs = subs.filter((s: any) => s.account.active);
  const totalLocked = vaults.reduce((a: number, v: any) => a + v.account.balanceLamports.toNumber(), 0);
  const now = Date.now() / 1000;
  const dueSubs = activeSubs.filter((s: any) => s.account.nextDueAt.toNumber() <= now);
  const currentFeeBps = configQ.data?.feeBps ?? 0;
  const currentFeePercent = (currentFeeBps / 100).toFixed(2);

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

  const handleUpdateFee = () => {
    setFeeError("");
    const bps = parseInt(newFeeBps);
    if (isNaN(bps) || bps < 10 || bps > 300) {
      setFeeError("Fee must be between 10 and 300 bps (0.1% – 3%)");
      return;
    }
    updateFee.mutate(bps);
  };

  const card: React.CSSProperties = { background: "white", border: "1px solid #E5E7EB", borderRadius: 16, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" };
  const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 16 };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.6px", color: "#0F172A", marginBottom: 4 }}>Protocol Admin</div>
          <div style={{ fontSize: 14, color: "#64748B" }}>Chain health, fee management, and operational metrics</div>
        </div>
        <span style={{ fontSize: 11.5, fontWeight: 600, background: "#F0FDF4", color: "#10B981", border: "1px solid #A7F3D0", borderRadius: 20, padding: "4px 12px", marginTop: 2 }}>● Authorized</span>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total Vaults", value: vaults.length.toString(), color: "#0F172A" },
          { label: "SOL Locked", value: `${formatSol(totalLocked, 2)} SOL`, color: "#10B981" },
          { label: "Active Subs", value: activeSubs.length.toString(), color: "#5B5CEB" },
          { label: "Due Now", value: dueSubs.length.toString(), color: "#F59E0B" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 16, padding: 22, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 10 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.4px", color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Fee management + Chain health */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

        {/* Fee Management */}
        <div style={card}>
          <div style={lbl}>Platform Fee Management</div>

          {/* Current fee display */}
          <div style={{ background: "linear-gradient(135deg, rgba(91,92,235,0.06), rgba(122,90,248,0.06))", border: "1px solid rgba(91,92,235,0.15)", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#5B5CEB", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>Current Fee Rate</div>
            <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-1.5px", color: "#0F172A" }}>
              {currentFeePercent}<span style={{ fontSize: 18, fontWeight: 400, color: "#64748B", marginLeft: 4 }}>%</span>
            </div>
            <div style={{ fontSize: 12.5, color: "#64748B", marginTop: 4 }}>{currentFeeBps} bps · Applied to every collection</div>
          </div>

          {/* Update fee */}
          <div style={{ fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 8 }}>
            New fee rate <span style={{ color: "#94A3B8", fontWeight: 400 }}>(0.1% – 3% · 10–300 bps)</span>
          </div>

          {/* Slider */}
          <div style={{ marginBottom: 10 }}>
            <input
              type="range" min="10" max="300" step="5"
              value={newFeeBps || currentFeeBps}
              onChange={e => setNewFeeBps(e.target.value)}
              style={{ width: "100%", accentColor: "#5B5CEB", cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94A3B8", marginTop: 2 }}>
              <span>0.1%</span>
              <span style={{ fontWeight: 600, color: "#5B5CEB" }}>{((parseInt(newFeeBps || String(currentFeeBps)) / 100)).toFixed(2)}% ({newFeeBps || currentFeeBps} bps)</span>
              <span>3%</span>
            </div>
          </div>

          {/* Manual input */}
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <input
                type="number" min="10" max="300" placeholder={String(currentFeeBps)}
                value={newFeeBps}
                onChange={e => { setFeeError(""); setNewFeeBps(e.target.value); }}
                style={{ width: "100%", background: "#F8FAFC", border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "10px 48px 10px 14px", fontSize: 14, color: "#0F172A", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
              />
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 11, fontWeight: 600, color: "#94A3B8" }}>bps</span>
            </div>
            <button
              onClick={handleUpdateFee}
              disabled={updateFee.isPending || !newFeeBps}
              style={{ background: "linear-gradient(135deg, #5B5CEB, #7A5AF8)", border: "none", color: "white", borderRadius: 10, padding: "10px 18px", fontSize: 13.5, fontWeight: 600, cursor: updateFee.isPending ? "not-allowed" : "pointer", fontFamily: "inherit", whiteSpace: "nowrap", opacity: (!newFeeBps || updateFee.isPending) ? 0.6 : 1, boxShadow: "0 2px 8px rgba(91,92,235,0.3)" }}
            >
              {updateFee.isPending ? "Signing..." : "Update Fee"}
            </button>
          </div>

          {feeError && <div style={{ fontSize: 12.5, color: "#EF4444", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "8px 12px", marginTop: 10 }}>{feeError}</div>}
          {updateFee.isSuccess && <div style={{ fontSize: 12.5, color: "#10B981", background: "#F0FDF4", border: "1px solid #A7F3D0", borderRadius: 8, padding: "8px 12px", marginTop: 10 }}>✓ Fee updated successfully on-chain</div>}

          <div style={{ marginTop: 14, padding: "10px 14px", background: "#F8FAFC", borderRadius: 10, fontSize: 12, color: "#64748B", lineHeight: 1.5 }}>
            Bounds enforced on-chain: min 10 bps (0.1%) · max 300 bps (3%). Only this wallet can update.
          </div>
        </div>

        {/* Chain Health */}
        <div style={card}>
          <div style={lbl}>Chain Health</div>
          {[
            { label: "Network status", value: <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#10B981" }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 0 3px rgba(16,185,129,0.2)" }} />Operational</span> },
            { label: "Current slot", value: <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "#0F172A" }}>{slotQ.data?.toLocaleString() ?? "—"}</span> },
            { label: "Network", value: <span style={{ fontSize: 12, fontWeight: 600, background: "rgba(91,92,235,0.08)", color: "#5B5CEB", borderRadius: 6, padding: "3px 8px" }}>Devnet</span> },
            { label: "Program ID", value: <span style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "#64748B" }}>{shortenAddress(PROGRAM_ID.toString(), 8)}</span> },
            { label: "Config PDA", value: <span style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "#64748B" }}>{shortenAddress(CONFIG_PDA.toString(), 8)}</span> },
            { label: "Total subscriptions", value: <span style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{subs.length}</span> },
          ].map(({ label, value }, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 5 ? "1px solid #F1F5F9" : "none" }}>
              <span style={{ fontSize: 13, color: "#64748B" }}>{label}</span>
              {value}
            </div>
          ))}
        </div>
      </div>

      {/* Recent subs + Search */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={card}>
          <div style={lbl}>Recent Subscriptions</div>
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

        <div style={card}>
          <div style={lbl}>Search Protocol</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <input
              style={{ flex: 1, background: "white", border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "#0F172A", fontFamily: "inherit", outline: "none" }}
              placeholder="Vault or subscription PDA..."
              value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
            />
            <button onClick={handleSearch} disabled={searching} style={{ background: "linear-gradient(135deg, #5B5CEB, #7A5AF8)", border: "none", color: "white", borderRadius: 10, padding: "10px 16px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(91,92,235,0.25)", whiteSpace: "nowrap" }}>
              {searching ? "..." : "Search"}
            </button>
          </div>
          {searchResult && (
            <div style={{ background: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 12, padding: "14px 16px" }}>
              {searchResult.type === "notfound" && <div style={{ fontSize: 13.5, color: "#94A3B8" }}>No account found</div>}
              {(searchResult.type === "vault" || searchResult.type === "subscription") && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#5B5CEB", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 10 }}>{searchResult.type === "vault" ? "Vault" : "Subscription"}</div>
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
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < arr.length - 1 ? "1px solid #F1F5F9" : "none", fontSize: 13 }}>
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
    </div>
  );
}
