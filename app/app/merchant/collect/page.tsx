"use client";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMerchant } from "@/hooks/useMerchant";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { TxPreview } from "@/components/ui/TxPreview";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatSol, shortenAddress } from "@/lib/solana/constants";

export default function MerchantCollectPage() {
  const { connected } = useWallet();
  const { merchantSubs, merchantLoading, collectPayment } = useMerchant();
  const [collectTarget, setCollectTarget] = useState<any>(null);
  const [collectAllOpen, setCollectAllOpen] = useState(false);
  const [collectingAll, setCollectingAll] = useState(false);

  const now = Date.now() / 1000;
  const dueSubs = merchantSubs.filter((s: any) => s.active && s.nextDueAt.toNumber() <= now);
  const totalDue = dueSubs.reduce((acc: number, s: any) => acc + s.amountLamports.toNumber(), 0);

  if (!connected) return <div className="flex items-center justify-center h-full text-text-secondary">Connect your merchant wallet to collect payments</div>;

  const handleCollectAll = async () => {
    setCollectingAll(true);
    for (const s of dueSubs) {
      try { await collectPayment.mutateAsync({ subPda: s.publicKey, ownerPubkey: s.owner }); }
      catch {}
    }
    setCollectingAll(false);
    setCollectAllOpen(false);
  };

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Collect Payments</h1>
          <p className="text-sm text-text-secondary mt-0.5">{dueSubs.length} due · {formatSol(totalDue, 4)} SOL total</p>
        </div>
        {dueSubs.length > 0 && (
          <Button variant="primary" onClick={() => setCollectAllOpen(true)}>
            Collect All Due
          </Button>
        )}
      </div>

      <Card className="p-0">
        {merchantLoading ? (
          <div className="p-6 text-sm text-text-tertiary">Loading...</div>
        ) : merchantSubs.length === 0 ? (
          <EmptyState title="No subscribers" description="Payments will appear here when users authorize your wallet" />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Subscriber", "Amount", "Due Since", "Status", ""].map(h => (
                  <th key={h} className="text-left text-[11px] font-medium text-text-tertiary uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {merchantSubs.map((s: any, i: number) => {
                const isDue = s.active && s.nextDueAt.toNumber() <= now;
                const dueDate = new Date(s.nextDueAt.toNumber() * 1000).toLocaleDateString();
                return (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-white/[0.015]">
                    <td className="px-5 py-3.5 font-mono text-xs text-text-secondary">{shortenAddress(s.owner.toString())}</td>
                    <td className="px-5 py-3.5 font-mono text-sm">{formatSol(s.amountLamports.toNumber(), 4)} SOL</td>
                    <td className="px-5 py-3.5 text-sm text-text-secondary">{isDue ? dueDate : "—"}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={isDue ? "amber" : s.active ? "green" : "gray"}>{isDue ? "Due now" : s.active ? "Active" : "Inactive"}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {isDue ? (
                        <Button variant="primary" size="sm" loading={collectPayment.isPending} onClick={() => setCollectTarget(s)}>Collect</Button>
                      ) : (
                        <Button size="sm" disabled>Collect</Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {/* Collect single */}
      <Modal open={!!collectTarget} onClose={() => setCollectTarget(null)} title="Collect Payment" description="You sign this transaction. SOL moves from the subscriber vault to your wallet.">
        {collectTarget && (
          <TxPreview rows={[
            { label: "Subscriber", value: shortenAddress(collectTarget.owner.toString()) },
            { label: "Amount", value: `${formatSol(collectTarget.amountLamports.toNumber(), 4)} SOL`, highlight: "green" },
            { label: "Network fee", value: "~0.000005 SOL (you pay)" },
          ]} />
        )}
        <div className="flex gap-2 mt-2">
          <Button variant="ghost" onClick={() => setCollectTarget(null)} className="flex-1">Cancel</Button>
          <Button variant="primary" className="flex-1" loading={collectPayment.isPending}
            onClick={async () => { await collectPayment.mutateAsync({ subPda: collectTarget.publicKey, ownerPubkey: collectTarget.owner }); setCollectTarget(null); }}>
            Sign & Collect
          </Button>
        </div>
      </Modal>

      {/* Collect all */}
      <Modal open={collectAllOpen} onClose={() => setCollectAllOpen(false)} title="Collect All Due" description="Sends a transaction for each due subscription.">
        <TxPreview rows={[
          { label: "Payments to collect", value: dueSubs.length.toString(), highlight: "green" },
          { label: "Total", value: `${formatSol(totalDue, 4)} SOL` },
          { label: "Estimated fees", value: `~${(dueSubs.length * 0.000005).toFixed(6)} SOL` },
        ]} />
        <div className="flex gap-2 mt-2">
          <Button variant="ghost" onClick={() => setCollectAllOpen(false)} className="flex-1">Cancel</Button>
          <Button variant="primary" className="flex-1" loading={collectingAll} onClick={handleCollectAll}>
            Sign & Collect All
          </Button>
        </div>
      </Modal>
    </div>
  );
}
