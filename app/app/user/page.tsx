"use client";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useVault } from "@/hooks/useVault";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { StatCard, Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { TxPreview } from "@/components/ui/TxPreview";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatSol, lamportsToSol, nextDueLabel, intervalLabel } from "@/lib/solana/constants";
import { ArrowDownToLine, ArrowUpFromLine, Plus } from "lucide-react";

export default function UserVaultPage() {
  const { connected } = useWallet();
  const { vault, vaultPda, vaultLoading, walletBalance, initVault, deposit, withdraw } = useVault();
  const { subscriptions } = useSubscriptions();

  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-lg font-semibold">Connect your wallet</div>
        <div className="text-sm text-text-secondary mb-2">Connect to view your vault and manage subscriptions</div>
        <WalletMultiButton />
      </div>
    );
  }

  const vaultBalance = vault ? vault.balanceLamports.toNumber() : 0;
  const activeSubs = subscriptions.filter((s: any) => s.active);
  const reservedLamports = activeSubs.reduce((acc: number, s: any) => acc + s.amountLamports.toNumber(), 0);

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Vault</h1>
        <p className="text-sm text-text-secondary mt-0.5">Your on-chain payment vault</p>
      </div>

      {/* Vault hero */}
      <div className="relative bg-gradient-to-br from-accent/10 to-accent/[0.03] border border-accent/20 rounded-xl p-7 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="text-[11px] text-accent/70 uppercase tracking-widest mb-2">Vault Balance</div>
        <div className="text-4xl font-semibold tracking-tight">
          {vaultLoading ? "—" : formatSol(vaultBalance, 4)}
          <span className="text-xl font-normal text-text-secondary ml-1.5">SOL</span>
        </div>
        <div className="text-sm text-text-secondary mt-1.5">
          {vault ? `${activeSubs.length} active subscription${activeSubs.length !== 1 ? "s" : ""}` : "No vault yet"}
        </div>

        <div className="flex gap-2 mt-5">
          {!vault ? (
            <Button variant="primary" loading={initVault.isPending} onClick={() => initVault.mutate()}>
              <Plus className="w-3.5 h-3.5" /> Create Vault
            </Button>
          ) : (
            <>
              <Button variant="primary" onClick={() => setDepositOpen(true)}>
                <ArrowDownToLine className="w-3.5 h-3.5" /> Deposit
              </Button>
              <Button onClick={() => setWithdrawOpen(true)}>
                <ArrowUpFromLine className="w-3.5 h-3.5" /> Withdraw
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Wallet Balance" value={`${lamportsToSol(walletBalance).toFixed(4)} SOL`} sub="Available to deposit" />
        <StatCard label="Reserved for Subs" value={`${lamportsToSol(reservedLamports).toFixed(4)} SOL`} sub={`${activeSubs.length} active subscriptions`} valueClass="text-accent" />
      </div>

      {/* Upcoming payments */}
      <Card>
        <div className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-4">Upcoming Payments</div>
        {activeSubs.length === 0 ? (
          <EmptyState title="No active subscriptions" description="Create a subscription to authorize recurring payments" />
        ) : (
          <div className="space-y-0 divide-y divide-border">
            {activeSubs.slice(0, 5).map((s: any, i: number) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate font-mono text-xs text-text-secondary">{s.merchant.toString().slice(0,8)}...{s.merchant.toString().slice(-4)}</div>
                  <div className="text-xs text-text-tertiary mt-0.5">{intervalLabel(s.intervalSeconds.toNumber())} · {nextDueLabel(s.nextDueAt.toNumber())}</div>
                </div>
                <div className="text-sm font-medium text-text-secondary">{formatSol(s.amountLamports.toNumber(), 4)} SOL</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Deposit Modal */}
      <Modal open={depositOpen} onClose={() => { setDepositOpen(false); setDepositAmount(""); }} title="Deposit to Vault" description="SOL transfers from your wallet into your on-chain vault.">
        <Input label="Amount" suffix="SOL" type="number" placeholder="0.00" min="0.001" step="0.001" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
        <TxPreview rows={[
          { label: "From", value: "Your wallet" },
          { label: "To", value: "Vault PDA" },
          { label: "Network fee", value: "~0.000005 SOL" },
        ]} />
        <div className="flex gap-2 mt-2">
          <Button variant="ghost" onClick={() => setDepositOpen(false)} className="flex-1">Cancel</Button>
          <Button variant="primary" className="flex-1" loading={deposit.isPending}
            disabled={!depositAmount || parseFloat(depositAmount) <= 0}
            onClick={async () => { await deposit.mutateAsync(parseFloat(depositAmount)); setDepositOpen(false); setDepositAmount(""); }}>
            Sign & Deposit
          </Button>
        </div>
      </Modal>

      {/* Withdraw Modal */}
      <Modal open={withdrawOpen} onClose={() => { setWithdrawOpen(false); setWithdrawAmount(""); }} title="Withdraw from Vault" description="Only you can withdraw. Funds return to your wallet immediately.">
        <Input label="Amount" suffix="SOL" type="number" placeholder="0.00" step="0.001" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
        <TxPreview rows={[
          { label: "Vault balance", value: `${formatSol(vaultBalance, 4)} SOL` },
          { label: "Reserved", value: `${lamportsToSol(reservedLamports).toFixed(4)} SOL`, highlight: "amber" },
          { label: "Network fee", value: "~0.000005 SOL" },
        ]} />
        <div className="flex gap-2 mt-2">
          <Button variant="ghost" onClick={() => setWithdrawOpen(false)} className="flex-1">Cancel</Button>
          <Button variant="primary" className="flex-1" loading={withdraw.isPending}
            disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0}
            onClick={async () => { await withdraw.mutateAsync(parseFloat(withdrawAmount)); setWithdrawOpen(false); setWithdrawAmount(""); }}>
            Sign & Withdraw
          </Button>
        </div>
      </Modal>
    </div>
  );
}
