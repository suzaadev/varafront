"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMerchant } from "@/hooks/useMerchant";
import { StatCard, Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatSol, shortenAddress, intervalLabel, nextDueLabel } from "@/lib/solana/constants";

export default function MerchantOverviewPage() {
  const { connected } = useWallet();
  const { merchantSubs, merchantLoading } = useMerchant();

  if (!connected) return <div className="flex items-center justify-center h-full text-text-secondary">Connect your merchant wallet to view subscribers</div>;

  const activeSubs = merchantSubs.filter((s: any) => s.active);
  const now = Date.now() / 1000;
  const dueSubs = activeSubs.filter((s: any) => s.nextDueAt.toNumber() <= now);
  const totalRevenue = merchantSubs.reduce((acc: number, s: any) => acc + s.cyclesCompleted.toNumber() * s.amountLamports.toNumber(), 0);
  const monthlyRevenue = activeSubs.reduce((acc: number, s: any) => acc + s.amountLamports.toNumber(), 0);

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Merchant Overview</h1>
        <p className="text-sm text-text-secondary mt-0.5">Revenue and subscriber activity</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Active Subscribers" value={activeSubs.length.toString()} />
        <StatCard label="Monthly Revenue" value={`${formatSol(monthlyRevenue, 3)} SOL`} valueClass="text-success" />
        <StatCard label="Due Now" value={dueSubs.length.toString()} valueClass="text-accent" sub="Ready to collect" />
        <StatCard label="Total Collected" value={`${formatSol(totalRevenue, 3)} SOL`} />
      </div>

      <Card className="p-0">
        <div className="px-5 py-4 border-b border-border">
          <div className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider">Subscribers</div>
        </div>
        {merchantLoading ? (
          <div className="p-6 text-sm text-text-tertiary">Loading...</div>
        ) : merchantSubs.length === 0 ? (
          <EmptyState title="No subscribers yet" description="Subscribers will appear here when users authorize your wallet" />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Wallet", "Amount", "Interval", "Next Due", "Cycles", "Status"].map(h => (
                  <th key={h} className="text-left text-[11px] font-medium text-text-tertiary uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {merchantSubs.map((s: any, i: number) => {
                const isDue = s.active && s.nextDueAt.toNumber() <= now;
                return (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-white/[0.015]">
                    <td className="px-5 py-3.5 font-mono text-xs text-text-secondary">{shortenAddress(s.owner.toString())}</td>
                    <td className="px-5 py-3.5 font-mono text-sm">{formatSol(s.amountLamports.toNumber(), 4)} SOL</td>
                    <td className="px-5 py-3.5 text-sm">{intervalLabel(s.intervalSeconds.toNumber())}</td>
                    <td className="px-5 py-3.5 text-sm text-text-secondary">{s.active ? nextDueLabel(s.nextDueAt.toNumber()) : "—"}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-text-tertiary">{s.cyclesCompleted.toString()}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={isDue ? "amber" : s.active ? "green" : "gray"}>{isDue ? "Due now" : s.active ? "Active" : "Inactive"}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
