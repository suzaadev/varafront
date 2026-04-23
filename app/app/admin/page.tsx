"use client";
import { useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { getReadonlyProgram } from "@/lib/solana/program";
import { StatCard, Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatSol, shortenAddress, PROGRAM_ID } from "@/lib/solana/constants";

export default function AdminPage() {
  const { connection } = useConnection();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);

  const vaultsQuery = useQuery({
    queryKey: ["admin-vaults"],
    queryFn: async () => {
      const program = getReadonlyProgram();
      return (program.account as any).vault.all();
    },
    refetchInterval: 30000,
  });

  const subsQuery = useQuery({
    queryKey: ["admin-subs"],
    queryFn: async () => {
      const program = getReadonlyProgram();
      return (program.account as any).subscription.all();
    },
    refetchInterval: 30000,
  });

  const slotQuery = useQuery({
    queryKey: ["slot"],
    queryFn: () => connection.getSlot(),
    refetchInterval: 5000,
  });

  const vaults = vaultsQuery.data ?? [];
  const subs = subsQuery.data ?? [];
  const activeSubs = subs.filter((s: any) => s.account.active);
  const totalLocked = vaults.reduce((acc: number, v: any) => acc + v.account.balanceLamports.toNumber(), 0);
  const now = Date.now() / 1000;
  const dueSubs = activeSubs.filter((s: any) => s.account.nextDueAt.toNumber() <= now);

  const handleSearch = async () => {
    if (!search.trim()) return;
    try {
      const program = getReadonlyProgram();
      const vault = await (program.account as any).vault.fetchNullable(search);
      if (vault) { setSearchResult({ type: "vault", data: vault }); return; }
      const sub = await (program.account as any).subscription.fetchNullable(search);
      if (sub) { setSearchResult({ type: "subscription", data: sub }); return; }
      setSearchResult({ type: "notfound" });
    } catch { setSearchResult({ type: "notfound" }); }
  };

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Protocol Admin</h1>
        <p className="text-sm text-text-secondary mt-0.5">Chain health and operational metrics</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Vaults" value={vaults.length.toString()} />
        <StatCard label="SOL Locked" value={`${formatSol(totalLocked, 2)} SOL`} valueClass="text-success" />
        <StatCard label="Active Subscriptions" value={activeSubs.length.toString()} valueClass="text-accent" />
        <StatCard label="Due Now" value={dueSubs.length.toString()} valueClass="text-warning" />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Card>
          <div className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-4">Chain Health</div>
          <div className="space-y-3">
            {[
              { label: "Network", value: <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-success" style={{boxShadow:"0 0 6px #34c97a"}} /><span className="text-success text-sm">Operational</span></div> },
              { label: "Current Slot", value: <span className="font-mono text-sm">{slotQuery.data?.toLocaleString() ?? "—"}</span> },
              { label: "Network", value: <Badge variant="green">Devnet</Badge> },
              { label: "Program ID", value: <span className="font-mono text-xs text-text-tertiary">{shortenAddress(PROGRAM_ID.toString(), 6)}</span> },
            ].map(({ label, value }, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-text-secondary">{label}</span>
                {value}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-4">Recent Subscriptions</div>
          {subs.length === 0 ? (
            <div className="text-sm text-text-tertiary py-4 text-center">No subscriptions found</div>
          ) : (
            <div className="space-y-0 divide-y divide-border">
              {subs.slice(-5).reverse().map((s: any, i: number) => (
                <div key={i} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-mono text-xs text-text-secondary">{shortenAddress(s.account.owner.toString())}</div>
                    <div className="text-xs text-text-tertiary mt-0.5">{formatSol(s.account.amountLamports.toNumber(), 4)} SOL</div>
                  </div>
                  <Badge variant={s.account.active ? "green" : "gray"}>{s.account.active ? "Active" : "Inactive"}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-3">Search Protocol</div>
        <div className="flex gap-2">
          <input
            className="flex-1 bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent transition-colors"
            placeholder="Vault or subscription PDA address..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
          />
          <button onClick={handleSearch} className="px-4 py-2 bg-bg-card border border-border-md rounded-lg text-sm font-medium hover:bg-bg-hover transition-colors">Search</button>
        </div>
        {searchResult && (
          <div className="mt-4 p-4 bg-bg-input border border-border rounded-lg">
            {searchResult.type === "notfound" && <div className="text-sm text-text-tertiary">No account found at this address</div>}
            {searchResult.type === "vault" && (
              <div className="space-y-1.5 text-sm">
                <div className="font-medium mb-2">Vault Found</div>
                <div className="flex justify-between"><span className="text-text-secondary">Owner</span><span className="font-mono text-xs">{shortenAddress(searchResult.data.owner.toString(), 6)}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Balance</span><span>{formatSol(searchResult.data.balanceLamports.toNumber(), 4)} SOL</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Subscriptions</span><span>{searchResult.data.subscriptionCount}</span></div>
              </div>
            )}
            {searchResult.type === "subscription" && (
              <div className="space-y-1.5 text-sm">
                <div className="font-medium mb-2">Subscription Found</div>
                <div className="flex justify-between"><span className="text-text-secondary">Owner</span><span className="font-mono text-xs">{shortenAddress(searchResult.data.owner.toString(), 6)}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Merchant</span><span className="font-mono text-xs">{shortenAddress(searchResult.data.merchant.toString(), 6)}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Amount</span><span>{formatSol(searchResult.data.amountLamports.toNumber(), 4)} SOL</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Status</span><Badge variant={searchResult.data.active ? "green" : "gray"}>{searchResult.data.active ? "Active" : "Inactive"}</Badge></div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
