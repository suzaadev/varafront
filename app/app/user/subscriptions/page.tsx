"use client";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { TxPreview } from "@/components/ui/TxPreview";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatSol, intervalLabel, nextDueLabel, shortenAddress } from "@/lib/solana/constants";
import { Plus, X } from "lucide-react";
import { PublicKey } from "@solana/web3.js";

const INTERVALS = [
  { label: "Daily", value: 86400 },
  { label: "Weekly", value: 604800 },
  { label: "Monthly", value: 2592000 },
  { label: "Quarterly", value: 7776000 },
];

export default function SubscriptionsPage() {
  const { connected } = useWallet();
  const { subscriptions, subsLoading, createSubscription, cancelSubscription } = useSubscriptions();

  const [createOpen, setCreateOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<any>(null);
  const [form, setForm] = useState({ merchant: "", amount: "", interval: 2592000, maxCycles: 0 });

  const activeSubs = subscriptions.filter((s: any) => s.active);
  const inactiveSubs = subscriptions.filter((s: any) => !s.active);

  if (!connected) {
    return <div className="flex items-center justify-center h-full text-text-secondary">Connect your wallet to view subscriptions</div>;
  }

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Subscriptions</h1>
          <p className="text-sm text-text-secondary mt-0.5">{activeSubs.length} active · {inactiveSubs.length} inactive</p>
        </div>
        <Button variant="primary" onClick={() => setCreateOpen(true)}>
          <Plus className="w-3.5 h-3.5" /> New Subscription
        </Button>
      </div>

      <Card className="p-0">
        {subsLoading ? (
          <div className="p-6 text-sm text-text-tertiary">Loading...</div>
        ) : subscriptions.length === 0 ? (
          <EmptyState title="No subscriptions yet" description="Authorize a merchant to collect recurring payments from your vault" action={<Button variant="primary" onClick={() => setCreateOpen(true)}><Plus className="w-3.5 h-3.5" /> New Subscription</Button>} />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Merchant", "Amount", "Interval", "Next Due", "Cycles", "Status", ""].map(h => (
                  <th key={h} className="text-left text-[11px] font-medium text-text-tertiary uppercase tracking-wider px-5 py-3 first:rounded-tl-xl last:rounded-tr-xl">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((s: any, i: number) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-white/[0.015] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-sm">Merchant</div>
                    <div className="font-mono text-xs text-text-tertiary mt-0.5">{shortenAddress(s.merchant.toString())}</div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-sm">{formatSol(s.amountLamports.toNumber(), 4)} SOL</td>
                  <td className="px-5 py-3.5 text-sm">{intervalLabel(s.intervalSeconds.toNumber())}</td>
                  <td className="px-5 py-3.5 text-sm text-text-secondary">{s.active ? nextDueLabel(s.nextDueAt.toNumber()) : "—"}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-text-tertiary">{s.cyclesCompleted.toString()} / {s.maxCycles.toNumber() === 0 ? "∞" : s.maxCycles.toString()}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={s.active ? "green" : "gray"}>{s.active ? "Active" : "Inactive"}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {s.active && (
                      <Button variant="danger" size="sm" onClick={() => setCancelTarget(s)}>
                        <X className="w-3 h-3" /> Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Subscription" description="Authorize a merchant to collect fixed recurring payments from your vault.">
        <div className="space-y-3">
          <Input label="Merchant Wallet Address" placeholder="Solana wallet address..." value={form.merchant} onChange={e => setForm(f => ({...f, merchant: e.target.value}))} />
          <Input label="Amount per cycle" suffix="SOL" type="number" placeholder="0.00" step="0.001" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary">Interval</label>
            <select className="bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent" value={form.interval} onChange={e => setForm(f => ({...f, interval: parseInt(e.target.value)}))}>
              {INTERVALS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
            </select>
          </div>
          <Input label="Max cycles (0 = unlimited)" type="number" placeholder="0" min="0" value={form.maxCycles || ""} onChange={e => setForm(f => ({...f, maxCycles: parseInt(e.target.value) || 0}))} />
        </div>
        <TxPreview rows={[
          { label: "Merchant cannot", value: "overcharge · charge early · charge after cancel", highlight: "green" },
          { label: "Enforced by", value: "on-chain program" },
        ]} />
        <div className="flex gap-2 mt-2">
          <Button variant="ghost" onClick={() => setCreateOpen(false)} className="flex-1">Cancel</Button>
          <Button variant="primary" className="flex-1" loading={createSubscription.isPending}
            disabled={!form.merchant || !form.amount || parseFloat(form.amount) <= 0}
            onClick={async () => {
              const seedIndex = Math.floor(Math.random() * 1000000);
              await createSubscription.mutateAsync({ merchantAddress: form.merchant, amountSol: parseFloat(form.amount), intervalSeconds: form.interval, maxCycles: form.maxCycles, seedIndex });
              setCreateOpen(false);
              setForm({ merchant: "", amount: "", interval: 2592000, maxCycles: 0 });
            }}>
            Sign & Authorize
          </Button>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal open={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Cancel Subscription" description="Future collections will be blocked immediately on-chain. This cannot be undone.">
        {cancelTarget && (
          <TxPreview rows={[
            { label: "Merchant", value: shortenAddress(cancelTarget.merchant.toString()) },
            { label: "Amount", value: `${formatSol(cancelTarget.amountLamports.toNumber(), 4)} SOL / ${intervalLabel(cancelTarget.intervalSeconds.toNumber())}` },
            { label: "Cycles completed", value: cancelTarget.cyclesCompleted.toString() },
            { label: "Effect", value: "Immediate · permanent", highlight: "red" },
          ]} />
        )}
        <div className="flex gap-2 mt-2">
          <Button variant="ghost" onClick={() => setCancelTarget(null)} className="flex-1">Keep</Button>
          <Button variant="danger" className="flex-1" loading={cancelSubscription.isPending}
            onClick={async () => { await cancelSubscription.mutateAsync(cancelTarget.publicKey); setCancelTarget(null); }}>
            Sign & Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}
